import type { UserProfile } from "../types/profile.js";

export interface ProfileStorage {
  load(userId: string): Promise<UserProfile | null>;
  save(profile: UserProfile): Promise<void>;
}
