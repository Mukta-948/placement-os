import type { ConversationContext, ConversationStateTransition } from "../types/conversation-context.js";
import { ConversationStateManager } from "./conversation-state-manager.js";
import type { ContextStorage } from "./context-storage.js";

export const DEFAULT_CONTEXT_INACTIVITY_MS = 30 * 60 * 1000;

export class ConversationContextService {
  constructor(private readonly storage: ContextStorage, private readonly stateManager: ConversationStateManager, private readonly inactivityMs = DEFAULT_CONTEXT_INACTIVITY_MS, private readonly now: () => Date = () => new Date()) {}

  async getOrCreate(contextId: string): Promise<ConversationContext> {
    const timestamp = this.now();
    const existing = await this.storage.load(contextId);
    if (!existing) {
      const context = this.stateManager.create(contextId, timestamp.toISOString());
      await this.storage.save(context);
      return context;
    }
    if (timestamp.getTime() - new Date(existing.lastInteractionAt).getTime() > this.inactivityMs) {
      const expired = this.stateManager.expire(existing, timestamp.toISOString());
      await this.storage.save(expired);
      return expired;
    }
    return existing;
  }

  load(contextId: string): Promise<ConversationContext | null> { return this.storage.load(contextId); }

  async apply(contextId: string, transition: ConversationStateTransition): Promise<ConversationContext> {
    const context = await this.getOrCreate(contextId);
    const updated = this.stateManager.transition(context, transition);
    await this.storage.save(updated);
    return updated;
  }
}
