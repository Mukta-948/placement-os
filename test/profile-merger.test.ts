import { describe, expect, it } from "vitest";
import { ProfileMerger } from "../src/services/profile-merger.js";
import { PROFILE_SCHEMA_VERSION, type UserProfile } from "../src/types/profile.js";

const profile = (): UserProfile => ({ schemaVersion: PROFILE_SCHEMA_VERSION, userId: "student-1", targetRole: "Backend Engineer", targetCompanies: ["Acme"], skills: ["TypeScript"], learningGoals: ["DSA"], preferredTopics: ["DBMS"], strongTopics: ["OOP"], weakTopics: ["Graphs"], preferredDifficulty: "medium", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" });

describe("ProfileMerger", () => {
  it("merges normalized lists without discarding existing facts", () => {
    const result = new ProfileMerger().merge(profile(), { skills: ["typescript", "Node.js"], targetCompanies: ["Acme", "Globex"], weakTopics: ["DP"] }, "2026-02-01T00:00:00.000Z");
    expect(result.skills).toEqual(["typescript", "Node.js"]);
    expect(result.targetCompanies).toEqual(["Acme", "Globex"]);
    expect(result.weakTopics).toEqual(["Graphs", "DP"]);
    expect(result.targetRole).toBe("Backend Engineer");
  });
  it("ignores invalid scalar values", () => {
    const result = new ProfileMerger().merge(profile(), { graduationYear: 1900, preferredDifficulty: "expert" as never }, "2026-02-01T00:00:00.000Z");
    expect(result.graduationYear).toBeUndefined();
    expect(result.preferredDifficulty).toBe("medium");
  });
});
