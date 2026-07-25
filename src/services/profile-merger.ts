import type { PreferredDifficulty, ProfileUpdate, UserProfile } from "../types/profile.js";

const validDifficulties = new Set<PreferredDifficulty>(["easy", "medium", "hard"]);

export class ProfileMerger {
  merge(current: UserProfile, update: ProfileUpdate, updatedAt: string): UserProfile {
    return {
      ...current,
      displayName: this.stringOrCurrent(update.displayName, current.displayName),
      targetRole: this.stringOrCurrent(update.targetRole, current.targetRole),
      graduationYear: this.yearOrCurrent(update.graduationYear, current.graduationYear),
      preferredDifficulty: this.difficultyOrCurrent(update.preferredDifficulty, current.preferredDifficulty),
      targetCompanies: this.mergeList(current.targetCompanies, update.targetCompanies),
      skills: this.mergeList(current.skills, update.skills),
      learningGoals: this.mergeList(current.learningGoals, update.learningGoals),
      preferredTopics: this.mergeList(current.preferredTopics, update.preferredTopics),
      strongTopics: this.mergeList(current.strongTopics, update.strongTopics),
      weakTopics: this.mergeList(current.weakTopics, update.weakTopics),
      updatedAt,
    };
  }

  private stringOrCurrent(value: unknown, current: string | undefined): string | undefined {
    return typeof value === "string" && value.trim() ? value.trim() : current;
  }
  private yearOrCurrent(value: unknown, current: number | undefined): number | undefined {
    return typeof value === "number" && Number.isInteger(value) && value >= 2020 && value <= 2100 ? value : current;
  }
  private difficultyOrCurrent(value: unknown, current: PreferredDifficulty | undefined): PreferredDifficulty | undefined {
    return typeof value === "string" && validDifficulties.has(value as PreferredDifficulty) ? value as PreferredDifficulty : current;
  }
  private mergeList(current: string[], incoming: unknown): string[] {
    if (!Array.isArray(incoming)) return current;
    const seen = new Map<string, string>();
    for (const value of [...current, ...incoming]) {
      if (typeof value !== "string") continue;
      const normalized = value.trim();
      if (normalized) seen.set(normalized.toLowerCase(), normalized);
    }
    return [...seen.values()];
  }
}
