import type { ConversationContext } from "../types/conversation-context.js";

export interface ContextStorage {
  load(contextId: string): Promise<ConversationContext | null>;
  save(context: ConversationContext): Promise<void>;
}
