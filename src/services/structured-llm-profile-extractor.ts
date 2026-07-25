import type { LlmClient } from "../llm/openai-compatible-client.js";
import type { IncomingMessage, LlmMessage } from "../types/index.js";
import type { PreferredDifficulty, ProfileUpdate } from "../types/profile.js";
import type { ProfileExtractor } from "./profile-extractor.js";

const extractionPrompt: LlmMessage = { role: "system", content: "Extract only stable career-profile facts from the student's message. Return JSON only, with no markdown. Allowed keys: displayName, targetRole, targetCompanies, graduationYear, skills, learningGoals, preferredTopics, strongTopics, weakTopics, preferredDifficulty. Use strings, arrays of strings, graduationYear as an integer, and preferredDifficulty as easy, medium, or hard. Omit facts that are not explicitly stated." };

export class StructuredLlmProfileExtractor implements ProfileExtractor {
  constructor(private readonly llm: LlmClient) {}
  async extract(message: IncomingMessage): Promise<ProfileUpdate> {
    const raw = await this.llm.complete([extractionPrompt, { role: "user", content: message.text ?? "" }]);
    return this.toUpdate(this.parseObject(raw));
  }
  private parseObject(raw: string): Record<string, unknown> {
    const json = raw.trim().replace(/^```json\s*/i, "").replace(/\s*```$/, "");
    const value: unknown = JSON.parse(json);
    if (typeof value !== "object" || value === null || Array.isArray(value)) throw new Error("Profile extraction did not return a JSON object.");
    return value as Record<string, unknown>;
  }
  private toUpdate(value: Record<string, unknown>): ProfileUpdate {
    const list = (key: string): string[] | undefined => Array.isArray(value[key]) ? value[key].filter((item): item is string => typeof item === "string") : undefined;
    const difficulty = value.preferredDifficulty;
    return {
      displayName: typeof value.displayName === "string" ? value.displayName : undefined,
      targetRole: typeof value.targetRole === "string" ? value.targetRole : undefined,
      targetCompanies: list("targetCompanies"), graduationYear: typeof value.graduationYear === "number" ? value.graduationYear : undefined,
      skills: list("skills"), learningGoals: list("learningGoals"), preferredTopics: list("preferredTopics"), strongTopics: list("strongTopics"), weakTopics: list("weakTopics"),
      preferredDifficulty: ["easy", "medium", "hard"].includes(String(difficulty)) ? difficulty as PreferredDifficulty : undefined,
    };
  }
}
