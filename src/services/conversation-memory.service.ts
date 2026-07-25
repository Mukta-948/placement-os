import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ConversationMessage, LlmMessage } from "../types/index.js";

interface MemoryStore { conversations: Record<string, ConversationMessage[]>; }

export interface ConversationMemory {
  get(conversationId: string): Promise<LlmMessage[]>;
  append(conversationId: string, message: ConversationMessage): Promise<void>;
  clear(conversationId: string): Promise<void>;
}

export class FileConversationMemory implements ConversationMemory {
  private store: MemoryStore = { conversations: {} };
  private initialized = false;
  private writeQueue = Promise.resolve();

  constructor(private readonly filename: string, private readonly maxTurns: number) {}

  async get(conversationId: string): Promise<LlmMessage[]> {
    await this.initialize();
    return (this.store.conversations[conversationId] ?? []).map(({ role, content }) => ({ role, content }));
  }

  async append(conversationId: string, message: ConversationMessage): Promise<void> {
    await this.initialize();
    const current = this.store.conversations[conversationId] ?? [];
    this.store.conversations[conversationId] = [...current, message].slice(-this.maxTurns * 2);
    await this.persist();
  }

  async clear(conversationId: string): Promise<void> {
    await this.initialize();
    delete this.store.conversations[conversationId];
    await this.persist();
  }

  private async initialize(): Promise<void> {
    if (this.initialized) return;
    try {
      this.store = JSON.parse(await readFile(this.filename, "utf8")) as MemoryStore;
      if (!this.store.conversations || typeof this.store.conversations !== "object") this.store = { conversations: {} };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw new Error("Could not read conversation memory.");
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
}
