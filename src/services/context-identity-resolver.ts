import type { IncomingMessage } from "../types/index.js";

/** Uses the stable sender identity currently exposed by the existing communication boundary, scoped to channel. */
export class ContextIdentityResolver {
  resolve(message: IncomingMessage): string {
    const sender = message.senderName.trim().toLowerCase() || "unknown";
    return `${message.channel.toLowerCase()}:${sender}`;
  }
}
