import { describe, expect, it, vi } from "vitest";
import { ConversationContextService } from "../src/services/conversation-context.service.js";
import { ConversationStateManager } from "../src/services/conversation-state-manager.js";
import type { ContextStorage } from "../src/services/context-storage.js";
import type { ConversationContext } from "../src/types/conversation-context.js";

function storage(): ContextStorage & { values: Map<string, ConversationContext> } {
  const values = new Map<string, ConversationContext>();
  return { values, load: vi.fn(async (id) => values.get(id) ?? null), save: vi.fn(async (context) => { values.set(context.contextId, context); }) };
}

describe("ConversationContextService", () => {
  it("creates and persists context by stable identity", async () => {
    const store = storage();
    const service = new ConversationContextService(store, new ConversationStateManager(), 1_000, () => new Date("2026-07-26T10:00:00.000Z"));
    const context = await service.getOrCreate("email:asha@example.com");
    expect(context.contextId).toBe("email:asha@example.com");
    expect(store.save).toHaveBeenCalledOnce();
  });
  it("expires only transient context after inactivity", async () => {
    const store = storage();
    store.values.set("email:asha", { schemaVersion: 1, contextId: "email:asha", activeIntent: "dsa", lastInteractionAt: "2026-07-26T09:00:00.000Z", createdAt: "2026-07-26T08:00:00.000Z", updatedAt: "2026-07-26T09:00:00.000Z" });
    const service = new ConversationContextService(store, new ConversationStateManager(), 60_000, () => new Date("2026-07-26T10:00:00.000Z"));
    const context = await service.getOrCreate("email:asha");
    expect(context.activeIntent).toBeUndefined();
    expect(context.createdAt).toBe("2026-07-26T08:00:00.000Z");
  });
});
