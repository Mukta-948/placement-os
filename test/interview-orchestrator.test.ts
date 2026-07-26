import { describe, expect, it } from "vitest";
import { AdaptiveDifficultyPolicy } from "../src/services/adaptive-difficulty-policy.js";
import type { AnswerEvaluator } from "../src/services/answer-evaluator.js";
import type { ConversationContext } from "../src/types/conversation-context.js";
import type { InterviewQuestion, InterviewSession } from "../src/types/interview.js";
import type { UserProfile } from "../src/types/profile.js";
import { InterviewOrchestrator } from "../src/services/interview-orchestrator.js";
import { InterviewSessionService } from "../src/services/interview-session.service.js";
import type { InterviewSessionStorage } from "../src/services/interview-session-storage.js";
import type { QuestionStrategy } from "../src/services/question-strategy.js";

class MemoryStorage implements InterviewSessionStorage {
  readonly values = new Map<string, InterviewSession>();
  async load(id: string) { return this.values.get(id) ?? null; }
  async save(session: InterviewSession) { this.values.set(session.id, structuredClone(session)); }
  async findActiveByOwner(ownerId: string) { return [...this.values.values()].find((s) => s.ownerId === ownerId && s.status === "active") ?? null; }
  async listByOwner(ownerId: string) { return [...this.values.values()].filter((s) => s.ownerId === ownerId); }
}
const profile: UserProfile = { schemaVersion: 1, userId: "u", preferredDifficulty: "medium", targetCompanies: [], skills: [], learningGoals: [], preferredTopics: [], strongTopics: [], weakTopics: [], createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" };
const context: ConversationContext = { schemaVersion: 1, contextId: "email:u", lastInteractionAt: "2026-01-01T00:00:00.000Z", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" };
const question = (difficulty: "easy" | "medium" | "hard"): InterviewQuestion => ({ id: `q-${difficulty}`, prompt: "Explain a tradeoff.", topic: "system design", difficulty, rubric: ["clarity"] });

describe("InterviewOrchestrator", () => {
  it("starts, evaluates, adapts difficulty, and persists the next question in order", async () => {
    const storage = new MemoryStorage();
    const strategy: QuestionStrategy = { nextQuestion: async (session) => question(session.difficulty) };
    const evaluator: AnswerEvaluator = { evaluate: async () => ({ score: 5, confidence: "high", strengths: ["clear"], improvements: [], conciseFeedback: "Strong answer", followUpQuestionRequired: false }) };
    const orchestrator = new InterviewOrchestrator(new InterviewSessionService(storage), strategy, evaluator, new AdaptiveDifficultyPolicy());
    await expect(orchestrator.handle("email:u", "Start mock technical interview", profile, context)).resolves.toContain("Question 1");
    await expect(orchestrator.handle("email:u", "My answer", profile, context)).resolves.toContain("Next question (hard)");
    const session = await storage.findActiveByOwner("email:u");
    expect(session).toMatchObject({ difficulty: "hard", currentQuestion: { difficulty: "hard" }, metrics: { answeredCount: 1, cumulativeScore: 5 } });
  });
  it("does not persist a partial turn when evaluation fails", async () => {
    const storage = new MemoryStorage(); const strategy: QuestionStrategy = { nextQuestion: async (session) => question(session.difficulty) }; const evaluator: AnswerEvaluator = { evaluate: async () => { throw new Error("evaluation unavailable"); } };
    const orchestrator = new InterviewOrchestrator(new InterviewSessionService(storage), strategy, evaluator, new AdaptiveDifficultyPolicy());
    await orchestrator.handle("email:u", "mock interview", profile, context);
    await expect(orchestrator.handle("email:u", "answer", profile, context)).rejects.toThrow("evaluation unavailable");
    expect((await storage.findActiveByOwner("email:u"))?.turns).toHaveLength(0);
  });
  it("does not persist evaluation or difficulty changes when next-question generation fails", async () => {
    const storage = new MemoryStorage(); let calls = 0; const strategy: QuestionStrategy = { nextQuestion: async (session) => { calls += 1; if (calls > 1) throw new Error("generation unavailable"); return question(session.difficulty); } }; const evaluator: AnswerEvaluator = { evaluate: async () => ({ score: 5, confidence: "high", strengths: [], improvements: [], conciseFeedback: "good", followUpQuestionRequired: false }) };
    const orchestrator = new InterviewOrchestrator(new InterviewSessionService(storage), strategy, evaluator, new AdaptiveDifficultyPolicy());
    await orchestrator.handle("email:u", "mock interview", profile, context);
    await expect(orchestrator.handle("email:u", "answer", profile, context)).rejects.toThrow("generation unavailable");
    expect(await storage.findActiveByOwner("email:u")).toMatchObject({ difficulty: "medium", turns: [] });
  });
});
