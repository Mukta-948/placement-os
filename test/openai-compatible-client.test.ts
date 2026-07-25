import { describe, expect, it } from "vitest";
import { LlmError, OpenAiCompatibleClient } from "../src/llm/openai-compatible-client.js";

describe("OpenAiCompatibleClient", () => {
  it("returns the first completion", async () => {
    const client = new OpenAiCompatibleClient({ apiKey: "key", baseUrl: "https://llm.test/v1", model: "model", timeoutMs: 1000, fetch: async () => new Response(JSON.stringify({ choices: [{ message: { content: " Answer " } }] }), { status: 200 }) });
    await expect(client.complete([{ role: "user", content: "hello" }])).resolves.toBe("Answer");
  });
  it("maps an invalid key to an authentication error", async () => {
    const client = new OpenAiCompatibleClient({ apiKey: "key", baseUrl: "https://llm.test/v1", model: "model", timeoutMs: 1000, fetch: async () => new Response("no", { status: 401 }) });
    await expect(client.complete([{ role: "user", content: "hello" }])).rejects.toMatchObject<Partial<LlmError>>({ kind: "auth" });
  });
});
