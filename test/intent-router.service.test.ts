import { describe, expect, it, vi } from "vitest";
import { DeterministicIntentDetector } from "../src/services/deterministic-intent-detector.js";
import { IntentRouterService } from "../src/services/intent-router.service.js";
import type { IntentDetector } from "../src/services/intent-detector.js";
import type { IntentHandler } from "../src/services/intent-handler.js";
import type { IncomingMessage, Intent } from "../src/types/index.js";

const message = (text: string): IncomingMessage => ({ id: "m1", conversationId: "c1", channel: "email", text, senderName: "Student" });

describe("DeterministicIntentDetector", () => {
  const detector = new DeterministicIntentDetector();
  it.each([
    ["Review my resume", "resume_review"],
    ["Mock HR interview", "interview"],
    ["Give me today's DSA problem", "dsa"],
    ["Create a 4 week study plan", "roadmap"],
    ["Ask behavioral interview questions", "behavioral"],
    ["Show my progress", "progress"],
    ["What can you do?", "help"],
    ["Explain DBMS normalization", "unknown"],
  ] as const)("detects %s as %s", (text, expected) => {
    expect(detector.detect(message(text))).toBe(expected);
  });

  it("gives behavioral requests priority over generic interview wording", () => {
    expect(detector.detect(message("Start a behavioral mock interview"))).toBe("behavioral");
  });
});

describe("IntentRouterService", () => {
  it("delegates to the handler selected by an injected detector", async () => {
    const detector: IntentDetector = { detect: vi.fn(() => "help" satisfies Intent) };
    const handler: IntentHandler = {
      intents: ["help"],
      handle: vi.fn(async (context) => context.generate("help instruction")),
    };
    const fallback: IntentHandler = { intents: ["unknown"], handle: vi.fn(async () => ({ text: "fallback" })) };
    const router = new IntentRouterService(detector, [handler, fallback]);
    const generate = vi.fn(async (instruction: string) => ({ text: instruction }));

    await expect(router.route(message("anything"), generate)).resolves.toEqual({ text: "help instruction" });
    expect(handler.handle).toHaveBeenCalledOnce();
    expect(generate).toHaveBeenCalledWith("help instruction");
  });
});
