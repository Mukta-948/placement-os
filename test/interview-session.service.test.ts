import { describe, expect, it } from "vitest";
import type { InterviewSession } from "../src/types/interview.js";
import { InterviewSessionService } from "../src/services/interview-session.service.js";
import type { InterviewSessionStorage } from "../src/services/interview-session-storage.js";

class Storage implements InterviewSessionStorage {
  value: InterviewSession | null = null;
  async load() { return this.value; }
  async save(session: InterviewSession) { this.value = session; }
  async findActiveByOwner(ownerId: string) { return this.value?.ownerId === ownerId && this.value.status === "active" ? this.value : null; }
}

describe("InterviewSessionService", () => {
  it("expires and preserves a recoverable session record after prolonged inactivity", async () => {
    const storage = new Storage();
    storage.value = { schemaVersion: 1, id: "s1", ownerId: "email:u", status: "active", interviewType: "technical", difficulty: "medium", focusAreas: [], questionLimit: 5, turns: [], metrics: { answeredCount: 0, cumulativeScore: 0 }, startedAt: "2026-07-26T08:00:00.000Z", lastInteractionAt: "2026-07-26T08:00:00.000Z" };
    const service = new InterviewSessionService(storage, 60_000, () => new Date("2026-07-26T10:00:00.000Z"));
    await expect(service.findActive("email:u")).resolves.toBeNull();
    expect(storage.value).toMatchObject({ status: "expired", currentQuestion: undefined, metrics: undefined });
  });
});
