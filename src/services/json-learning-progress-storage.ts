import { mkdir, readFile, rename, writeFile } from "node:fs/promises"; import path from "node:path";
import type { LearningProgress } from "../types/learning-progress.js"; import type { LearningProgressStorage } from "./learning-progress-storage.js";
export class JsonLearningProgressStorage implements LearningProgressStorage { private values: Record<string, LearningProgress> = {}; private ready = false; private writes = Promise.resolve(); constructor(private readonly filename: string) {}
  async load(id: string) { await this.init(); const value = this.values[id]; return value && typeof value.userId === "string" ? value : null; }
  async save(progress: LearningProgress) { await this.init(); this.values[progress.userId] = progress; this.writes = this.writes.then(async () => { await mkdir(path.dirname(this.filename), { recursive: true }); const temp = `${this.filename}.tmp`; await writeFile(temp, JSON.stringify({ progress: this.values }, null, 2)); await rename(temp, this.filename); }); return this.writes; }
  private async init() { if (this.ready) return; try { const parsed: unknown = JSON.parse(await readFile(this.filename, "utf8")); if (typeof parsed === "object" && parsed && typeof (parsed as { progress?: unknown }).progress === "object") this.values = (parsed as { progress: Record<string, LearningProgress> }).progress; } catch { this.values = {}; } this.ready = true; }
}
