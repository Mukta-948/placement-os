import type { AnswerEvaluation, InterviewQuestion } from "../types/interview.js";
import type { UserProfile } from "../types/profile.js";
export interface AnswerEvaluator { evaluate(question: InterviewQuestion, answer: string, profile: UserProfile): Promise<AnswerEvaluation>; }
