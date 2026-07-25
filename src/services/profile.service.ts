import type { IncomingMessage } from "../types/index.js";
import { PROFILE_SCHEMA_VERSION, type ProfileUpdate, type UserProfile } from "../types/profile.js";
import type { ProfileExtractor, ProfileInformationDetector } from "./profile-extractor.js";
import { ProfileMerger } from "./profile-merger.js";
import type { ProfileStorage } from "./profile-storage.js";

export class ProfileService {
  constructor(private readonly storage: ProfileStorage, private readonly merger: ProfileMerger, private readonly extractor: ProfileExtractor, private readonly informationDetector: ProfileInformationDetector, private readonly now: () => Date = () => new Date()) {}
  async create(userId: string, displayName?: string): Promise<UserProfile> {
    const timestamp = this.now().toISOString();
    const profile: UserProfile = { schemaVersion: PROFILE_SCHEMA_VERSION, userId, displayName: displayName?.trim() || undefined, targetCompanies: [], skills: [], learningGoals: [], preferredTopics: [], strongTopics: [], weakTopics: [], createdAt: timestamp, updatedAt: timestamp };
    await this.storage.save(profile);
    return profile;
  }
  load(userId: string): Promise<UserProfile | null> { return this.storage.load(userId); }
  async getOrCreate(userId: string, displayName?: string): Promise<UserProfile> { return (await this.load(userId)) ?? this.create(userId, displayName); }
  async update(userId: string, update: ProfileUpdate, displayName?: string): Promise<UserProfile> {
    const current = await this.getOrCreate(userId, displayName);
    const merged = this.merger.merge(current, update, this.now().toISOString());
    await this.storage.save(merged);
    return merged;
  }
  async captureFromMessage(userId: string, message: IncomingMessage): Promise<UserProfile> {
    const profile = await this.getOrCreate(userId, message.senderName);
    if (!this.informationDetector.shouldExtract(message)) return profile;
    try { return await this.update(userId, await this.extractor.extract(message), message.senderName); }
    catch { return profile; }
  }
}
