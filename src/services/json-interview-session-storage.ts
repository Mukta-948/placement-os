import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { InterviewSession } from "../types/interview.js";
import type { InterviewSessionStorage } from "./interview-session-storage.js";
interface Store { sessions: Record<string, InterviewSession>; }
export class JsonInterviewSessionStorage implements InterviewSessionStorage {
  private store: Store = { sessions: {} }; private initialized = false; private writes = Promise.resolve();
  constructor(private readonly filename: string) {}
  async load(id: string): Promise<InterviewSession | null> { await this.init(); const s = this.store.sessions[id]; return s && this.valid(s) ? s : null; }
  async save(session: InterviewSession): Promise<void> { await this.init(); this.store.sessions[session.id] = session; await this.persist(); }
  async findActiveByOwner(ownerId: string): Promise<InterviewSession | null> { await this.init(); return Object.values(this.store.sessions).find((s) => this.valid(s) && s.ownerId === ownerId && s.status === "active") ?? null; }
  async listByOwner(ownerId: string): Promise<InterviewSession[]> { await this.init(); return Object.values(this.store.sessions).filter((s) => this.valid(s) && s.ownerId === ownerId); }
  private async init(): Promise<void> { if (this.initialized) return; try { const value: unknown = JSON.parse(await readFile(this.filename, "utf8")); if (typeof value === "object" && value !== null && "sessions" in value && typeof (value as { sessions?: unknown }).sessions === "object") this.store = value as Store; } catch (e) { if ((e as NodeJS.ErrnoException).code !== "ENOENT") this.store = { sessions: {} }; } this.initialized = true; }
  private async persist(): Promise<void> { this.writes = this.writes.then(async () => { await mkdir(path.dirname(this.filename), { recursive: true }); const temporary = `${this.filename}.tmp`; await writeFile(temporary, JSON.stringify(this.store, null, 2), "utf8"); await rename(temporary, this.filename); }); return this.writes; }
  private valid(value: unknown): value is InterviewSession { return typeof value === "object" && value !== null && typeof (value as { id?: unknown }).id === "string" && typeof (value as { ownerId?: unknown }).ownerId === "string" && typeof (value as { schemaVersion?: unknown }).schemaVersion === "number"; }
}
