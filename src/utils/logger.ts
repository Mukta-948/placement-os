export interface Logger {
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
}

export function createLogger(minimum: "debug" | "info" | "warn" | "error"): Logger {
  const levels = ["debug", "info", "warn", "error"] as const;
  const threshold = levels.indexOf(minimum);
  const write = (level: typeof levels[number], message: string, context?: Record<string, unknown>) => {
    const index = levels.indexOf(level);
    if (index < threshold) return;
    const entry = { timestamp: new Date().toISOString(), level, message, ...context };
    console[level === "debug" ? "log" : level](JSON.stringify(entry));
  };
  return {
    debug: (message, context) => write("debug", message, context),
    info: (message, context) => write("info", message, context),
    warn: (message, context) => write("warn", message, context),
    error: (message, context) => write("error", message, context),
  };
}
