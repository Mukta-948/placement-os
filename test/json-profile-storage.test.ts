import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { JsonProfileStorage } from "../src/services/json-profile-storage.js";
import { PROFILE_SCHEMA_VERSION, type UserProfile } from "../src/types/profile.js";

const profile = (userId = "u1"): UserProfile => ({ schemaVersion: PROFILE_SCHEMA_VERSION, userId, targetCompanies: [], skills: ["TypeScript"], learningGoals: [], preferredTopics: [], strongTopics: [], weakTopics: [], createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" });
describe("JsonProfileStorage", () => {
  it("persists profiles across storage instances", async () => {
    const directory = await mkdtemp(path.join(tmpdir(), "placement-os-profile-"));
    try { const filename = path.join(directory, "profiles.json"); await new JsonProfileStorage(filename).save(profile()); await expect(new JsonProfileStorage(filename).load("u1")).resolves.toEqual(profile()); }
    finally { await rm(directory, { recursive: true, force: true }); }
  });
  it("recovers from malformed data and accepts a valid later save", async () => {
    const directory = await mkdtemp(path.join(tmpdir(), "placement-os-profile-"));
    try { const filename = path.join(directory, "profiles.json"); await writeFile(filename, "{ invalid", "utf8"); const storage = new JsonProfileStorage(filename); await expect(storage.load("u1")).resolves.toBeNull(); await storage.save(profile()); await expect(storage.load("u1")).resolves.toEqual(profile()); }
    finally { await rm(directory, { recursive: true, force: true }); }
  });
});
