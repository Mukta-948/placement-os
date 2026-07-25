import { readFileSync } from "node:fs";

/** Loads a small, dependency-free subset of .env syntax without overwriting real environment variables. */
export function loadDotEnv(filename = ".env"): void {
  try {
    for (const rawLine of readFileSync(filename, "utf8").split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const separator = line.indexOf("=");
      if (separator < 1) continue;
      const key = line.slice(0, separator).trim();
      const rawValue = line.slice(separator + 1).trim();
      const value = rawValue.replace(/^("|')(.*)\1$/, "$2");
      if (process.env[key] === undefined) process.env[key] = value;
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
}
