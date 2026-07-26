import type { LlmClient } from "../llm/openai-compatible-client.js";
import type { ConversationContext } from "../types/conversation-context.js";
import type { InterviewQuestion, InterviewSession } from "../types/interview.js";
import type { UserProfile } from "../types/profile.js";
import type { QuestionStrategy } from "./question-strategy.js";
export class LlmQuestionGenerator implements QuestionStrategy {
  constructor(private readonly llm: LlmClient) {}
  async nextQuestion(session: InterviewSession, profile: UserProfile, context: ConversationContext): Promise<InterviewQuestion> {
    const prompt = `Return JSON only: {"prompt":string,"topic":string,"rubric":string[]}. Generate one ${session.difficulty} ${session.interviewType} placement-interview question. Target role: ${profile.targetRole ?? "software engineer"}. Focus areas: ${session.focusAreas.join(", ") || context.activeTopic || "general"}.`;
    const raw = await this.llm.complete([{ role: "system", content: prompt }]); const value = JSON.parse(raw) as { prompt?: unknown; topic?: unknown; rubric?: unknown };
    if (typeof value.prompt !== "string" || typeof value.topic !== "string" || !Array.isArray(value.rubric) || !value.rubric.every((r) => typeof r === "string")) throw new Error("Invalid interview question payload.");
    return { id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, prompt: value.prompt, topic: value.topic, rubric: value.rubric, difficulty: session.difficulty };
  }
}
