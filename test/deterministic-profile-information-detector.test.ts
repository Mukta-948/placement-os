import { describe, expect, it } from "vitest";
import { DeterministicProfileInformationDetector } from "../src/services/deterministic-profile-information-detector.js";

const message = (text: string) => ({ id: "m", conversationId: "c", channel: "email", text, senderName: "Asha" });

describe("DeterministicProfileInformationDetector", () => {
  const detector = new DeterministicProfileInformationDetector();

  it("identifies messages that state durable placement preferences or capabilities", () => {
    expect(detector.shouldExtract(message("My skills are TypeScript and SQL"))).toBe(true);
    expect(detector.shouldExtract(message("I struggle with dynamic programming"))).toBe(true);
    expect(detector.shouldExtract(message("My target company is Acme"))).toBe(true);
  });

  it("does not invoke extraction for ordinary coaching requests", () => {
    expect(detector.shouldExtract(message("Quiz me on DBMS"))).toBe(false);
    expect(detector.shouldExtract(message("Explain Dijkstra"))).toBe(false);
  });
});
