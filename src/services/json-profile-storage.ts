import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { UserProfile } from "../types/profile.js";
import type { ProfileStorage } from "./profile-storage.js";

interface ProfileStore { profiles: Record<string, UserProfile>; }

export class JsonProfileStorage implements ProfileStorage {
  private store: ProfileStore = { profiles: {} };
  private initialized = false;
  private writeQueue = Promise.resolve();
  constructor(private readonly filename: string) {}

  async load(userId: string): Promise<UserProfile | null> {
    await this.initialize();
    const profile = this.store.profiles[userId];
    return profile && this.isProfile(profile) ? profile : null;
  }
  async save(profile: UserProfile): Promise<void> {
    await this.initialize();
    this.store.profiles[profile.userId] = profile;
    await this.persist();
  }
  private async initialize(): Promise<void> {
    if (this.initialized) return;
    try {
      const parsed: unknown = JSON.parse(await readFile(this.filename, "utf8"));
      if (this.isStore(parsed)) this.store = parsed;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") this.store = { profiles: {} };
    }
    this.initialized = true;
  }
  private async persist(): Promise<void> {
    this.writeQueue = this.writeQueue.then(async () => {
      await mkdir(path.dirname(this.filename), { recursive: true });
      const temporary = `${this.filename}.tmp`;
      await writeFile(temporary, JSON.stringify(this.store, null, 2), "utf8");
      await rename(temporary, this.filename);
    });
    return this.writeQueue;
  }
  private isStore(value: unknown): value is ProfileStore {
    return typeof value === "object" && value !== null && "profiles" in value && typeof (value as { profiles?: unknown }).profiles === "object" && (value as { profiles?: unknown }).profiles !== null;
  }
  private isProfile(value: unknown): value is UserProfile {
    return typeof value === "object" && value !== null && typeof (value as { userId?: unknown }).userId === "string" && typeof (value as { schemaVersion?: unknown }).schemaVersion === "number";
  }
}
