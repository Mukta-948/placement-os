import type { LlmClient } from "../llm/openai-compatible-client.js";
import type { AnswerEvaluation, InterviewQuestion } from "../types/interview.js";
import type { UserProfile } from "../types/profile.js";
import type { AnswerEvaluator } from "./answer-evaluator.js";
export class LlmAnswerEvaluator implements AnswerEvaluator {
  constructor(private readonly llm: LlmClient) {}
  async evaluate(question: InterviewQuestion, answer: string, profile: UserProfile): Promise<AnswerEvaluation> {
    const prompt = `Return JSON only with score (1-5), confidence (low|medium|high), strengths (string[]), improvements (string[]), conciseFeedback (string), recommendedTopic (optional string), followUpQuestionRequired (boolean). Evaluate this answer for a ${profile.targetRole ?? "software engineer"} interview. Question: ${question.prompt}\nAnswer: ${answer}`;
    const raw = await this.llm.complete([{ role: "system", content: prompt }]); const value = JSON.parse(raw) as Record<string, unknown>;
    if (![1, 2, 3, 4, 5].includes(value.score as number) || !["low", "medium", "high"].includes(value.confidence as string) || typeof value.conciseFeedback !== "string" || typeof value.followUpQuestionRequired !== "boolean" || !Array.isArray(value.strengths) || !Array.isArray(value.improvements)) throw new Error("Invalid interview evaluation payload.");
    return { score: value.score as AnswerEvaluation["score"], confidence: value.confidence as AnswerEvaluation["confidence"], strengths: value.strengths.filter((v): v is string => typeof v === "string"), improvements: value.improvements.filter((v): v is string => typeof v === "string"), conciseFeedback: value.conciseFeedback, recommendedTopic: typeof value.recommendedTopic === "string" ? value.recommendedTopic : undefined, followUpQuestionRequired: value.followUpQuestionRequired };
  }
}
