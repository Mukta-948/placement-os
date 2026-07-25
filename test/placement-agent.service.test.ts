import { describe, expect, it, vi } from "vitest";
import { PlacementAgentService } from "../src/services/placement-agent.service.js";
import { DailyDsaService } from "../src/services/daily-dsa.service.js";
import { DsaService } from "../src/services/dsa.service.js";
import { GeneralCoachService } from "../src/services/general-coach.service.js";
import { IntentRouterService } from "../src/services/intent-router.service.js";
import { DeterministicIntentDetector } from "../src/services/deterministic-intent-detector.js";
import type { ConversationMemory } from "../src/services/conversation-memory.service.js";
import { LlmError, type LlmClient } from "../src/llm/openai-compatible-client.js";

const message = { id: "m1", conversationId: "c1", channel: "telegram", text: "Quiz me on DBMS", senderName: "Asha" };

function memory(): ConversationMemory {
  const messages: Array<{ role: "user" | "assistant"; content: string; createdAt: string }> = [];
  return { get: vi.fn(async () => messages.map(({ role, content }) => ({ role, content }))), append: vi.fn(async (_id, item) => { messages.push(item); }), clear: vi.fn(async () => { messages.length = 0; }) };
}

function router(): IntentRouterService {
  return new IntentRouterService(new DeterministicIntentDetector(), [new DsaService(new DailyDsaService()), new GeneralCoachService()]);
}

describe("PlacementAgentService", () => {
  it("uses a deterministic daily DSA challenge without calling the LLM", async () => {
    const llm: LlmClient = { complete: vi.fn() };
    const service = new PlacementAgentService(memory(), llm, router());
    const response = await service.respond({ ...message, text: "Give me today's DSA problem" });
    expect(response.text).toContain("Today's DSA problem");
    expect(llm.complete).not.toHaveBeenCalled();
  });

  it("adds memory around an LLM response", async () => {
    const store = memory();
    const llm: LlmClient = { complete: vi.fn(async () => "Question 1: What is normalization?") };
    const service = new PlacementAgentService(store, llm, router());
    await expect(service.respond(message)).resolves.toMatchObject({ text: "Question 1: What is normalization?" });
    expect(store.append).toHaveBeenCalledTimes(2);
    expect(llm.complete).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ role: "system" }), expect.objectContaining({ content: "Quiz me on DBMS" })]));
  });

  it("returns a safe message for rate limits", async () => {
    const llm: LlmClient = { complete: vi.fn(async () => { throw new LlmError("busy", "rate_limit"); }) };
    const service = new PlacementAgentService(memory(), llm, router());
    await expect(service.respond(message)).resolves.toMatchObject({ text: expect.stringContaining("lot of requests") });
  });
});
