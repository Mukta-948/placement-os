import type { Intent } from "./index.js";

export const CONVERSATION_CONTEXT_SCHEMA_VERSION = 1;

export type PendingState = "awaiting_answer" | "awaiting_resume_text" | "awaiting_clarification";

/** Short-lived coaching state. It intentionally excludes progress, analytics, and message history. */
export interface ConversationContext {
  readonly schemaVersion: number;
  readonly contextId: string;
  readonly activeIntent?: Intent;
  readonly activeTopic?: string;
  readonly pendingState?: PendingState;
  readonly lastService?: string;
  readonly lastAction?: string;
  readonly lastInteractionAt: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ConversationStateTransition {
  readonly intent: Intent;
  readonly service: string;
  readonly action: string;
  readonly userText: string;
  readonly responseText: string;
  readonly occurredAt: string;
}
