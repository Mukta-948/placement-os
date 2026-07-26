import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ConversationContext } from "../types/conversation-context.js";
import type { ContextStorage } from "./context-storage.js";

interface ContextStore { contexts: Record<string, ConversationContext>; }

export class JsonContextStorage implements ContextStorage {
  private store: ContextStore = { contexts: {} };
  private initialized = false;
  private writeQueue = Promise.resolve();
  constructor(private readonly filename: string) {}

  async load(contextId: string): Promise<ConversationContext | null> {
    await this.initialize();
    const context = this.store.contexts[contextId];
    return context && this.isContext(context) ? context : null;
  }
  async save(context: ConversationContext): Promise<void> {
    await this.initialize();
    this.store.contexts[context.contextId] = context;
    await this.persist();
  }
  private async initialize(): Promise<void> {
    if (this.initialized) return;
    try {
      const parsed: unknown = JSON.parse(await readFile(this.filename, "utf8"));
      if (typeof parsed === "object" && parsed !== null && "contexts" in parsed && typeof (parsed as { contexts?: unknown }).contexts === "object") this.store = parsed as ContextStore;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") this.store = { contexts: {} };
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
  private isContext(value: unknown): value is ConversationContext {
    return typeof value === "object" && value !== null && typeof (value as { contextId?: unknown }).contextId === "string" && typeof (value as { schemaVersion?: unknown }).schemaVersion === "number";
  }
}
