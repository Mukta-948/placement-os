import { describe, expect, it } from "vitest";
import { loadConfig } from "../src/config/env.js";

describe("loadConfig", () => {
  it("validates and maps explicit environment values", () => {
    const config = loadConfig({ CASPIAN_API_KEY: "caspian-key", LLM_API_KEY: "llm-key", PORT: "4040", CASPIAN_ENABLE_EMAIL: "false", CASPIAN_ENABLE_TELEGRAM: "true", TELEGRAM_BOT_TOKEN: "token" });
    expect(config.port).toBe(4040);
    expect(config.caspian.emailEnabled).toBe(false);
    expect(config.caspian.telegramEnabled).toBe(true);
  });
  it("rejects absent LLM credentials", () => {
    expect(() => loadConfig({})).toThrow("CASPIAN_API_KEY");
  });
});
