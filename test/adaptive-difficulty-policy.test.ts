import { describe, expect, it } from "vitest";
import { AdaptiveDifficultyPolicy } from "../src/services/adaptive-difficulty-policy.js";
const evaluation = (score: 1 | 2 | 3 | 4 | 5) => ({ score, confidence: "medium" as const, strengths: [], improvements: [], conciseFeedback: "", followUpQuestionRequired: false });
describe("AdaptiveDifficultyPolicy", () => {
  it("adapts within difficulty bounds", () => { const policy = new AdaptiveDifficultyPolicy(); expect(policy.next("medium", evaluation(5))).toBe("hard"); expect(policy.next("medium", evaluation(1))).toBe("easy"); expect(policy.next("easy", evaluation(1))).toBe("easy"); expect(policy.next("hard", evaluation(5))).toBe("hard"); });
});
