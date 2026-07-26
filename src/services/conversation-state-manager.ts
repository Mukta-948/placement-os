import { CONVERSATION_CONTEXT_SCHEMA_VERSION, type ConversationContext, type ConversationStateTransition, type PendingState } from "../types/conversation-context.js";

/** Owns all state transitions and expiry rules for a temporary coaching context. */
export class ConversationStateManager {
  create(contextId: string, timestamp: string): ConversationContext {
    return { schemaVersion: CONVERSATION_CONTEXT_SCHEMA_VERSION, contextId, lastInteractionAt: timestamp, createdAt: timestamp, updatedAt: timestamp };
  }

  transition(context: ConversationContext, input: ConversationStateTransition): ConversationContext {
    return {
      ...context,
      activeIntent: input.intent,
      activeTopic: this.resolveTopic(input.userText, context.activeTopic),
      pendingState: this.resolvePendingState(input.responseText),
      lastService: input.service,
      lastAction: input.action,
      lastInteractionAt: input.occurredAt,
      updatedAt: input.occurredAt,
    };
  }

  expire(context: ConversationContext, timestamp: string): ConversationContext {
    return {
      schemaVersion: CONVERSATION_CONTEXT_SCHEMA_VERSION,
      contextId: context.contextId,
      lastInteractionAt: timestamp,
      createdAt: context.createdAt,
      updatedAt: timestamp,
    };
  }

  private resolveTopic(userText: string, currentTopic: string | undefined): string | undefined {
    const text = userText.toLowerCase();
    const knownTopics = ["dsa", "dbms", "operating systems", "os", "computer networks", "cn", "oop", "system design", "resume", "behavioral"];
    const topic = knownTopics.find((candidate) => new RegExp(`\\b${candidate.replace(" ", "\\s+")}\\b`).test(text));
    return topic ?? currentTopic;
  }

  private resolvePendingState(responseText: string): PendingState | undefined {
    const text = responseText.toLowerCase();
    if (text.includes("paste") && text.includes("resume")) return "awaiting_resume_text";
    if (text.includes("could you clarify") || text.includes("please clarify")) return "awaiting_clarification";
    return responseText.includes("?") ? "awaiting_answer" : undefined;
  }
}
