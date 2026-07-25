import type { IncomingMessage } from "../types/index.js";
import type { ProfileInformationDetector } from "./profile-extractor.js";

export class DeterministicProfileInformationDetector implements ProfileInformationDetector {
  shouldExtract(message: IncomingMessage): boolean {
    const text = message.text?.toLowerCase() ?? "";
    return ["my name is", "i am a", "i'm a", "i am in", "i'm in", "i graduate", "graduating", "my skills", "i know", "i am good at", "i'm good at", "i struggle", "i am weak", "i'm weak", "i want to work", "my target", "target company", "dream company", "prefer easy", "prefer medium", "prefer hard", "focus on", "my goal", "learning goal"].some((phrase) => text.includes(phrase));
  }
}
