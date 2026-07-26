import { describe, expect, it } from "vitest";
import { ContextIdentityResolver } from "../src/services/context-identity-resolver.js";

describe("ContextIdentityResolver", () => {
  it("keys temporary context by channel and stable exposed sender identity, not thread", () => {
    const resolver = new ContextIdentityResolver();
    const base = { id: "m", channel: "email", text: "hi", senderName: "Asha@example.com" };
    expect(resolver.resolve({ ...base, conversationId: "thread-one" })).toBe(resolver.resolve({ ...base, conversationId: "thread-two" }));
  });
});
