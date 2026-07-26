import type { PreferredDifficulty } from "./profile.js";

export const INTERVIEW_SESSION_SCHEMA_VERSION = 1;
export type InterviewStatus = "active" | "completed" | "cancelled" | "expired";
export type InterviewType = "hr" | "technical" | "behavioral";

export interface InterviewQuestion { id: string; prompt: string; topic: string; difficulty: PreferredDifficulty; rubric: string[]; }
export interface AnswerEvaluation { score: 1 | 2 | 3 | 4 | 5; confidence: "low" | "medium" | "high"; strengths: string[]; improvements: string[]; conciseFeedback: string; recommendedTopic?: string; followUpQuestionRequired: boolean; }
export interface InterviewTurn { question: InterviewQuestion; answer: string; evaluation: AnswerEvaluation; answeredAt: string; }
/** Exists only while a session is active; it is removed when the session closes. */
export interface InterviewMetrics { answeredCount: number; cumulativeScore: number; }
export interface InterviewSession {
  schemaVersion: number; id: string; ownerId: string; status: InterviewStatus; interviewType: InterviewType; difficulty: PreferredDifficulty; focusAreas: string[]; questionLimit: number;
  currentQuestion?: InterviewQuestion; turns: InterviewTurn[]; metrics?: InterviewMetrics; startedAt: string; lastInteractionAt: string; completedAt?: string;
}
