import { describe, expect, it } from "vitest";
import { ConversationStateManager } from "../src/services/conversation-state-manager.js";

describe("ConversationStateManager", () => {
  it("owns temporary conversation state transitions", () => {
    const manager = new ConversationStateManager();
    const initial = manager.create("email:asha", "2026-07-26T10:00:00.000Z");
    const updated = manager.transition(initial, { intent: "resume_review", service: "resume_review", action: "coaching_response", userText: "Please review my resume", responseText: "Please paste your resume text.", occurredAt: "2026-07-26T10:01:00.000Z" });
    expect(updated).toMatchObject({ activeIntent: "resume_review", activeTopic: "resume", pendingState: "awaiting_resume_text", lastService: "resume_review", lastAction: "coaching_response" });
  });

  it("expires transient state without changing the identity or creation time", () => {
    const manager = new ConversationStateManager();
    const active = manager.transition(manager.create("email:asha", "2026-07-26T10:00:00.000Z"), { intent: "dsa", service: "dsa", action: "coaching_response", userText: "Explain DBMS", responseText: "What is normalization?", occurredAt: "2026-07-26T10:01:00.000Z" });
    const expired = manager.expire(active, "2026-07-26T11:00:00.000Z");
    expect(expired).toMatchObject({ contextId: "email:asha", createdAt: "2026-07-26T10:00:00.000Z", lastInteractionAt: "2026-07-26T11:00:00.000Z" });
    expect(expired.activeIntent).toBeUndefined();
  });
});
