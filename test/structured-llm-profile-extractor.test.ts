import { describe, expect, it } from "vitest";
import { StructuredLlmProfileExtractor } from "../src/services/structured-llm-profile-extractor.js";
const message = { id: "m", conversationId: "c", channel: "email", text: "I know TypeScript", senderName: "Asha" };
describe("StructuredLlmProfileExtractor", () => {
  it("parses JSON-only profile updates", async () => {
    const extractor = new StructuredLlmProfileExtractor({ complete: async () => "{\"skills\":[\"TypeScript\"],\"preferredDifficulty\":\"medium\"}" });
    await expect(extractor.extract(message)).resolves.toEqual({ skills: ["TypeScript"], preferredDifficulty: "medium" });
  });
  it("rejects malformed extraction payloads", async () => {
    const extractor = new StructuredLlmProfileExtractor({ complete: async () => "not json" });
    await expect(extractor.extract(message)).rejects.toThrow();
  });
});
