import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { JsonContextStorage } from "../src/services/json-context-storage.js";

const context = { schemaVersion: 1, contextId: "email:asha", lastInteractionAt: "2026-07-26T10:00:00.000Z", createdAt: "2026-07-26T10:00:00.000Z", updatedAt: "2026-07-26T10:00:00.000Z" };
describe("JsonContextStorage", () => {
  it("persists context across storage instances", async () => {
    const directory = await mkdtemp(path.join(tmpdir(), "placement-os-context-"));
    try { const filename = path.join(directory, "contexts.json"); await new JsonContextStorage(filename).save(context); await expect(new JsonContextStorage(filename).load(context.contextId)).resolves.toEqual(context); }
    finally { await rm(directory, { recursive: true, force: true }); }
  });
  it("recovers from malformed JSON", async () => {
    const directory = await mkdtemp(path.join(tmpdir(), "placement-os-context-"));
    try { const filename = path.join(directory, "contexts.json"); await writeFile(filename, "not json", "utf8"); const storage = new JsonContextStorage(filename); await expect(storage.load(context.contextId)).resolves.toBeNull(); await storage.save(context); await expect(storage.load(context.contextId)).resolves.toEqual(context); }
    finally { await rm(directory, { recursive: true, force: true }); }
  });
});
