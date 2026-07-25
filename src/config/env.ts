import path from "node:path";

export interface AppConfig {
  readonly port: number;
  readonly logLevel: "debug" | "info" | "warn" | "error";
  readonly caspian: {
    readonly apiKey: string;
    readonly baseUrl: string;
    readonly emailEnabled: boolean;
    readonly emailUsername?: string;
    readonly telegramEnabled: boolean;
    readonly telegramBotToken?: string;
  };
  readonly llm: { readonly apiKey: string; readonly baseUrl: string; readonly model: string; readonly timeoutMs: number };
  readonly memoryFile: string;
  readonly maxConversationTurns: number;
}

function required(env: NodeJS.ProcessEnv, name: string): string {
  const value = env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function positiveInt(value: string | undefined, fallback: number, name: string): number {
  const parsed = Number(value ?? fallback);
  if (!Number.isInteger(parsed) || parsed <= 0) throw new Error(`${name} must be a positive integer`);
  return parsed;
}

function boolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  return value.toLowerCase() === "true";
}

export function loadConfig(env = process.env): AppConfig {
  const logLevel = (env.LOG_LEVEL ?? "info").toLowerCase();
  if (!(["debug", "info", "warn", "error"] as const).includes(logLevel as AppConfig["logLevel"])) {
    throw new Error("LOG_LEVEL must be debug, info, warn, or error");
  }
  return {
    port: positiveInt(env.PORT, 3000, "PORT"),
    logLevel: logLevel as AppConfig["logLevel"],
    caspian: {
      apiKey: required(env, "CASPIAN_API_KEY"),
      baseUrl: (env.CASPIAN_BASE_URL ?? "https://api.trycaspianai.com").replace(/\/+$/, ""),
      emailEnabled: boolean(env.CASPIAN_ENABLE_EMAIL, true),
      emailUsername: env.CASPIAN_EMAIL_USERNAME?.trim() || undefined,
      telegramEnabled: boolean(env.CASPIAN_ENABLE_TELEGRAM, false),
      telegramBotToken: env.TELEGRAM_BOT_TOKEN?.trim() || undefined,
    },
    llm: {
      apiKey: required(env, "LLM_API_KEY"),
      baseUrl: (env.LLM_BASE_URL ?? "https://api.openai.com/v1").replace(/\/+$/, ""),
      model: env.LLM_MODEL?.trim() || "gpt-4.1-mini",
      timeoutMs: positiveInt(env.LLM_TIMEOUT_MS, 20_000, "LLM_TIMEOUT_MS"),
    },
    memoryFile: path.resolve(env.MEMORY_FILE ?? "data/conversations.json"),
    maxConversationTurns: positiveInt(env.MAX_CONVERSATION_TURNS, 12, "MAX_CONVERSATION_TURNS"),
  };
}
