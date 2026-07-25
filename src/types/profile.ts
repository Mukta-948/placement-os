export const PROFILE_SCHEMA_VERSION = 1;
export type PreferredDifficulty = "easy" | "medium" | "hard";

export interface UserProfile {
  readonly schemaVersion: number;
  readonly userId: string;
  readonly displayName?: string;
  readonly targetRole?: string;
  readonly targetCompanies: string[];
  readonly graduationYear?: number;
  readonly skills: string[];
  readonly learningGoals: string[];
  readonly preferredTopics: string[];
  readonly strongTopics: string[];
  readonly weakTopics: string[];
  readonly preferredDifficulty?: PreferredDifficulty;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ProfileUpdate {
  readonly displayName?: string;
  readonly targetRole?: string;
  readonly targetCompanies?: string[];
  readonly graduationYear?: number;
  readonly skills?: string[];
  readonly learningGoals?: string[];
  readonly preferredTopics?: string[];
  readonly strongTopics?: string[];
  readonly weakTopics?: string[];
  readonly preferredDifficulty?: PreferredDifficulty;
}
