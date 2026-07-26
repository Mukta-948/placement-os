import type { ConversationContext } from "../types/conversation-context.js";
import { INTERVIEW_SESSION_SCHEMA_VERSION, type InterviewSession, type InterviewType } from "../types/interview.js";
import type { UserProfile } from "../types/profile.js";
import { AdaptiveDifficultyPolicy } from "./adaptive-difficulty-policy.js";
import type { AnswerEvaluator } from "./answer-evaluator.js";
import type { QuestionStrategy } from "./question-strategy.js";
import { InterviewSessionService } from "./interview-session.service.js";

export class InterviewOrchestrator {
  constructor(private readonly sessions: InterviewSessionService, private readonly questions: QuestionStrategy, private readonly evaluator: AnswerEvaluator, private readonly difficulty: AdaptiveDifficultyPolicy, private readonly now: () => Date = () => new Date()) {}
  async handle(ownerId: string, text: string, profile: UserProfile, context: ConversationContext): Promise<string> {
    const active = await this.sessions.findActive(ownerId);
    if (/\b(end|stop|cancel)\s+(the\s+)?interview\b/i.test(text)) return this.close(active, "cancelled");
    if (!active) return this.start(ownerId, text, profile, context);
    if (!active.currentQuestion) return "Your interview session cannot continue right now. Please start a new mock interview.";
    return this.answer(active, text, profile, context);
  }
  async hasActive(ownerId: string): Promise<boolean> { return (await this.sessions.findActive(ownerId)) !== null; }
  private async start(ownerId: string, request: string, profile: UserProfile, context: ConversationContext): Promise<string> {
    const now = this.now().toISOString(); const session: InterviewSession = { schemaVersion: INTERVIEW_SESSION_SCHEMA_VERSION, id: `int_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, ownerId, status: "active", interviewType: this.typeFor(request), difficulty: this.difficulty.initial(profile.preferredDifficulty), focusAreas: profile.weakTopics.slice(0, 3), questionLimit: 5, turns: [], metrics: { answeredCount: 0, cumulativeScore: 0 }, startedAt: now, lastInteractionAt: now };
    const question = await this.questions.nextQuestion(session, profile, context); const saved = { ...session, currentQuestion: question }; await this.sessions.save(saved);
    return `Mock ${saved.interviewType} interview started (${saved.difficulty}).\n\nQuestion 1: ${question.prompt}`;
  }
  private async answer(session: InterviewSession, answer: string, profile: UserProfile, context: ConversationContext): Promise<string> {
    const evaluation = await this.evaluator.evaluate(session.currentQuestion!, answer, profile);
    const nextDifficulty = this.difficulty.next(session.difficulty, evaluation); const now = this.now().toISOString();
    const completedTurns = [...session.turns, { question: session.currentQuestion!, answer, evaluation, answeredAt: now }];
    if (completedTurns.length >= session.questionLimit) { const completed = { ...session, status: "completed" as const, turns: completedTurns, currentQuestion: undefined, metrics: undefined, completedAt: now, lastInteractionAt: now }; await this.sessions.save(completed); return this.feedback(evaluation) + "\n\nInterview complete. Great work."; }
    const candidate: InterviewSession = { ...session, turns: completedTurns, difficulty: nextDifficulty, focusAreas: evaluation.recommendedTopic ? [evaluation.recommendedTopic] : session.focusAreas, metrics: { answeredCount: completedTurns.length, cumulativeScore: (session.metrics?.cumulativeScore ?? 0) + evaluation.score }, lastInteractionAt: now };
    // Do not persist the evaluation until the next question is successfully generated; retries remain consistent.
    const question = await this.questions.nextQuestion(candidate, profile, context); await this.sessions.save({ ...candidate, currentQuestion: question });
    return `${this.feedback(evaluation)}\n\nNext question (${nextDifficulty}): ${question.prompt}`;
  }
  private async close(session: InterviewSession | null, status: "cancelled"): Promise<string> { if (!session) return "There is no active interview to end."; const now = this.now().toISOString(); await this.sessions.save({ ...session, status, currentQuestion: undefined, metrics: undefined, completedAt: now, lastInteractionAt: now }); return "Interview ended. Reply “mock interview” whenever you want to start another one."; }
  private typeFor(text: string): InterviewType { const normalized = text.toLowerCase(); if (normalized.includes("hr")) return "hr"; if (normalized.includes("behavioral")) return "behavioral"; return "technical"; }
  private feedback(evaluation: import("../types/interview.js").AnswerEvaluation): string { return `Feedback (${evaluation.score}/5, ${evaluation.confidence} confidence): ${evaluation.conciseFeedback}`; }
}
