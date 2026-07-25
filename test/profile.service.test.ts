import { describe, expect, it, vi } from "vitest";
import { ProfileService } from "../src/services/profile.service.js";
import { ProfileMerger } from "../src/services/profile-merger.js";
import type { ProfileExtractor, ProfileInformationDetector } from "../src/services/profile-extractor.js";
import type { ProfileStorage } from "../src/services/profile-storage.js";
import type { UserProfile } from "../src/types/profile.js";

const message = (text: string) => ({ id: "m1", conversationId: "c1", channel: "email", text, senderName: "Asha" });
function storage(): ProfileStorage & { profiles: Map<string, UserProfile> } {
  const profiles = new Map<string, UserProfile>();
  return { profiles, load: vi.fn(async (id) => profiles.get(id) ?? null), save: vi.fn(async (profile) => { profiles.set(profile.userId, profile); }) };
}

describe("ProfileService", () => {
  it("creates a default profile for a new user", async () => {
    const store = storage();
    const service = new ProfileService(store, new ProfileMerger(), { extract: vi.fn() }, { shouldExtract: vi.fn(() => false) }, () => new Date("2026-07-26T00:00:00.000Z"));
    const profile = await service.getOrCreate("c1", "Asha");
    expect(profile).toMatchObject({ userId: "c1", displayName: "Asha", schemaVersion: 1, skills: [], strongTopics: [], weakTopics: [] });
    expect(store.save).toHaveBeenCalledOnce();
  });
  it("extracts and persists only profile-like messages", async () => {
    const store = storage();
    const extractor: ProfileExtractor = { extract: vi.fn(async () => ({ skills: ["TypeScript"], targetCompanies: ["Acme"] })) };
    const detector: ProfileInformationDetector = { shouldExtract: vi.fn((incoming) => incoming.text?.includes("skills") ?? false) };
    const service = new ProfileService(store, new ProfileMerger(), extractor, detector);
    const updated = await service.captureFromMessage("c1", message("My skills are TypeScript"));
    await service.captureFromMessage("c1", message("Quiz me on DBMS"));
    expect(updated.skills).toEqual(["TypeScript"]);
    expect(extractor.extract).toHaveBeenCalledOnce();
  });
  it("retains the created profile when extraction fails", async () => {
    const store = storage();
    const service = new ProfileService(store, new ProfileMerger(), { extract: vi.fn(async () => { throw new Error("bad JSON"); }) }, { shouldExtract: vi.fn(() => true) });
    const profile = await service.captureFromMessage("c1", message("My goal is backend"));
    expect(await service.load("c1")).toEqual(profile);
  });
});
