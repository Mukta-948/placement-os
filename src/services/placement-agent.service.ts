import { buildPrompt } from "../prompts/placement.js";
import type { AgentResponse, IncomingMessage } from "../types/index.js";
import { LlmError, type LlmClient } from "../llm/openai-compatible-client.js";
import type { ConversationMemory } from "./conversation-memory.service.js";
import type { IntentRouterService } from "./intent-router.service.js";
import type { ProfileService } from "./profile.service.js";

export class PlacementAgentService {
  constructor(
    private readonly memory: ConversationMemory,
    private readonly llm: LlmClient,
    private readonly router: IntentRouterService,
    private readonly profiles?: ProfileService,
  ) {}

  async respond(message: IncomingMessage): Promise<AgentResponse> {
    const text = message.text?.trim();
    if (!text) return { text: "Please send a question or goal—e.g. “Quiz me on DBMS” or “Give me today’s DSA problem.”" };
    if (/^(\/clear|reset|start new conversation)$/i.test(text)) {
      await this.memory.clear(message.conversationId);
      return { text: "Done—your previous coaching context is cleared. What would you like to practice?", shouldClearMemory: true };
    }
    await this.captureProfile(message);
    return this.router.route(message, (instruction) => this.generateResponse(message, instruction));
  }

  private async captureProfile(message: IncomingMessage): Promise<void> {
    if (!this.profiles) return;
    try {
      // conversationId is the stable incoming identity exposed by the existing application boundary.
      await this.profiles.captureFromMessage(message.conversationId, message);
    } catch {
      // Profile enrichment must not block a working coaching conversation.
    }
  }

  private async generateResponse(message: IncomingMessage, intentInstruction: string): Promise<AgentResponse> {
    const text = message.text!.trim();
    const history = await this.memory.get(message.conversationId);
    const messages = buildPrompt(
      [...history, { role: "user", content: text }],
      message.channel,
      message.senderName,
      intentInstruction,
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

  private userMessage(error: LlmError): string {
    if (error.kind === "rate_limit") return "I’m receiving a lot of requests right now. Please try again in a minute.";
    if (error.kind === "timeout" || error.kind === "network") return "I couldn’t reach the coaching service just now. Please try again shortly.";
    if (error.kind === "auth") return "The coaching service is temporarily unavailable due to a configuration issue. Please try again later.";
    return "I couldn’t generate a response right now. Please try again shortly.";
  }
}
