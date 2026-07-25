import type { IncomingMessage, Intent } from "../types/index.js";

/** Allows rules, an LLM classifier, or another classifier to be substituted without changing routing. */
export interface IntentDetector {
  detect(message: IncomingMessage): Intent;
}
