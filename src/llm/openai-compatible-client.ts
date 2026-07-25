import type { LlmMessage } from "../types/index.js";

export class LlmError extends Error {
  constructor(message: string, readonly kind: "auth" | "rate_limit" | "network" | "timeout" | "upstream") {
    super(message);
    this.name = "LlmError";
  }
}

export interface LlmClient { complete(messages: LlmMessage[]): Promise<string>; }

interface LlmOptions { apiKey: string; baseUrl: string; model: string; timeoutMs: number; fetch?: typeof fetch; }

export class OpenAiCompatibleClient implements LlmClient {
  private readonly fetcher: typeof fetch;
  constructor(private readonly options: LlmOptions) { this.fetcher = options.fetch ?? globalThis.fetch; }

  async complete(messages: LlmMessage[]): Promise<string> {
    let response: Response;
    try {
      response = await this.fetcher(`${this.options.baseUrl}/chat/completions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${this.options.apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: this.options.model, messages, temperature: 0.4 }),
        signal: AbortSignal.timeout(this.options.timeoutMs),
      });
    } catch (error) {
      const timeout = error instanceof DOMException && error.name === "TimeoutError";
      throw new LlmError(timeout ? "The AI response timed out." : "Could not reach the AI service.", timeout ? "timeout" : "network");
    }
    if (!response.ok) {
  const errorBody = await response.text();

  console.error("OpenAI Error:");
  console.error("Status:", response.status);
  console.error(errorBody);

  if (response.status === 401 || response.status === 403)
    throw new LlmError("The AI service rejected its API key.", "auth");

  if (response.status === 429)
    throw new LlmError("The AI service is busy. Please try again shortly.", "rate_limit");

  throw new LlmError(`The AI service returned ${response.status}.`, "upstream");
}
    const payload = await response.json() as { choices?: Array<{ message?: { content?: string | null } }> };
    const content = payload.choices?.[0]?.message?.content?.trim();
    if (!content) throw new LlmError("The AI service returned an empty response.", "upstream");
    return content;
  }
}
