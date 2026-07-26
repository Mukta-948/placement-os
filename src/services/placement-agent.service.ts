import { buildPrompt } from "../prompts/placement.js";
import type { AgentResponse, IncomingMessage } from "../types/index.js";
import { LlmError, type LlmClient } from "../llm/openai-compatible-client.js";
import type { ConversationMemory } from "./conversation-memory.service.js";
import type { IntentRouterService } from "./intent-router.service.js";
import type { ProfileService } from "./profile.service.js";
import type { ConversationContextService } from "./conversation-context.service.js";
import { ContextIdentityResolver } from "./context-identity-resolver.js";
import { CONVERSATION_CONTEXT_SCHEMA_VERSION, type ConversationContext } from "../types/conversation-context.js";
import { PROFILE_SCHEMA_VERSION, type UserProfile } from "../types/profile.js";

export class PlacementAgentService {
  constructor(
    private readonly memory: ConversationMemory,
    private readonly llm: LlmClient,
    private readonly router: IntentRouterService,
    private readonly profiles?: ProfileService,
    private readonly contexts?: ConversationContextService,
    private readonly contextIdentityResolver = new ContextIdentityResolver(),
  ) {}

  async respond(message: IncomingMessage): Promise<AgentResponse> {
    const text = message.text?.trim();
    if (!text) return { text: "Please send a question or goal—e.g. “Quiz me on DBMS” or “Give me today’s DSA problem.”" };
    if (/^(\/clear|reset|start new conversation)$/i.test(text)) {
      await this.memory.clear(message.conversationId);
      return { text: "Done—your previous coaching context is cleared. What would you like to practice?", shouldClearMemory: true };
    }
    const coachingState = await this.loadCoachingState(message);
    const routed = await this.router.route(
      message,
      coachingState,
      (instruction) => this.generateResponse(message, instruction, coachingState.profile, coachingState.conversationContext),
    );
    await this.persistConversationState(message, routed.intent, routed.serviceName, routed.response.text);
    return routed.response;
  }

  private async loadCoachingState(message: IncomingMessage): Promise<{ profile: UserProfile; conversationContext: ConversationContext }> {
    const profile = await this.captureProfile(message);
    const contextId = this.contextIdentityResolver.resolve(message);
    const conversationContext = this.contexts
      ? await this.contexts.getOrCreate(contextId)
      : this.defaultContext(contextId);
    return { profile, conversationContext };
  }

  private async captureProfile(message: IncomingMessage): Promise<UserProfile> {
    if (!this.profiles) return this.defaultProfile(message);
    try {
      return await this.profiles.captureFromMessage(message.conversationId, message);
    } catch {
      // Profile enrichment must not block a working coaching conversation.
      return this.defaultProfile(message);
    }
  }

  private async persistConversationState(message: IncomingMessage, intent: import("../types/index.js").Intent, serviceName: string, responseText: string): Promise<void> {
    if (!this.contexts) return;
    try {
      await this.contexts.apply(this.contextIdentityResolver.resolve(message), {
        intent, service: serviceName, action: "coaching_response", userText: message.text ?? "", responseText, occurredAt: new Date().toISOString(),
      });
    } catch {
      // Context is temporary enrichment; persistence failures cannot block delivery.
    }
  }

  private async generateResponse(message: IncomingMessage, intentInstruction: string, profile: UserProfile, conversationContext: ConversationContext): Promise<AgentResponse> {
    const text = message.text!.trim();
    const history = await this.memory.get(message.conversationId);
    const messages = buildPrompt(
      [...history, { role: "user", content: text }],
      message.channel,
      message.senderName,
      intentInstruction,
      this.describeCoachingState(profile, conversationContext),
    );
    try {
      const answer = await this.llm.complete(messages);
      await this.memory.append(message.conversationId, { role: "user", content: text, createdAt: new Date().toISOString() });
      await this.memory.append(message.conversationId, { role: "assistant", content: answer, createdAt: new Date().toISOString() });
      return { text: answer };
    } catch (error) {
      if (error instanceof LlmError) return { text: this.userMessage(error) };
      throw error;
    }
  }

  private describeCoachingState(profile: UserProfile, context: ConversationContext): string {
    const profileFacts = [profile.targetRole && `target role: ${profile.targetRole}`, profile.preferredDifficulty && `difficulty: ${profile.preferredDifficulty}`, profile.strongTopics.length && `strong topics: ${profile.strongTopics.slice(0, 3).join(", ")}`, profile.weakTopics.length && `focus areas: ${profile.weakTopics.slice(0, 3).join(", ")}`].filter(Boolean);
    const contextFacts = [context.activeIntent && `active task: ${context.activeIntent}`, context.activeTopic && `topic: ${context.activeTopic}`, context.pendingState && `pending: ${context.pendingState}`].filter(Boolean);
    return [...profileFacts, ...contextFacts].join("; ");
  }

  private defaultProfile(message: IncomingMessage): UserProfile {
    const timestamp = new Date().toISOString();
    return { schemaVersion: PROFILE_SCHEMA_VERSION, userId: message.conversationId, displayName: message.senderName, targetCompanies: [], skills: [], learningGoals: [], preferredTopics: [], strongTopics: [], weakTopics: [], createdAt: timestamp, updatedAt: timestamp };
  }

  private defaultContext(contextId: string): ConversationContext {
    const timestamp = new Date().toISOString();
    return { schemaVersion: CONVERSATION_CONTEXT_SCHEMA_VERSION, contextId, lastInteractionAt: timestamp, createdAt: timestamp, updatedAt: timestamp };
  }

  private userMessage(error: LlmError): string {
    if (error.kind === "rate_limit") return "I’m receiving a lot of requests right now. Please try again in a minute.";
    if (error.kind === "timeout" || error.kind === "network") return "I couldn’t reach the coaching service just now. Please try again shortly.";
    if (error.kind === "auth") return "The coaching service is temporarily unavailable due to a configuration issue. Please try again later.";
    return "I couldn’t generate a response right now. Please try again shortly.";
  }
}
