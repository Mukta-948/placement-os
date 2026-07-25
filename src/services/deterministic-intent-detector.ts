import type { IncomingMessage, Intent } from "../types/index.js";
import type { IntentDetector } from "./intent-detector.js";

export class DeterministicIntentDetector implements IntentDetector {
  detect(message: IncomingMessage): Intent {
    const text = message.text?.trim().toLowerCase() ?? "";
    if (!text) return "unknown";
    if (this.matches(text, ["resume", "cv", "curriculum vitae"])) return "resume_review";
    if (this.matches(text, ["behavioral", "behavioural", "star method", "tell me about yourself"])) return "behavioral";
    if (this.matches(text, ["mock interview", "hr interview", "technical interview", "system design interview", "interview me"])) return "interview";
    if (this.matches(text, ["dsa", "leetcode", "data structure", "algorithm", "dijkstra", "today's dsa", "todays dsa"])) return "dsa";
    if (this.matches(text, ["roadmap", "study plan", "learning plan", "preparation plan"])) return "roadmap";
    if (this.matches(text, ["progress", "streak", "how am i doing", "how am i progressing"])) return "progress";
    if (this.matches(text, ["help", "what can you do", "commands"])) return "help";
    return "unknown";
  }

  private matches(text: string, phrases: readonly string[]): boolean {
    return phrases.some((phrase) => text.includes(phrase));
  }
}
