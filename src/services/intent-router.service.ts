import type { AgentResponse, IncomingMessage, Intent } from "../types/index.js";
import type { IntentDetector } from "./intent-detector.js";
import type { IntentHandler, IntentHandlerContext } from "./intent-handler.js";

export class IntentRouterService {
  private readonly handlers = new Map<Intent, IntentHandler>();

  constructor(private readonly detector: IntentDetector, handlers: readonly IntentHandler[]) {
    for (const handler of handlers) {
      for (const intent of handler.intents) {
        if (this.handlers.has(intent)) throw new Error(`Intent handler already registered: ${intent}`);
        this.handlers.set(intent, handler);
      }
    }
    if (!this.handlers.has("unknown")) throw new Error("An unknown intent handler is required.");
  }

  async route(
    message: IncomingMessage,
    generate: (instruction: string) => Promise<AgentResponse>,
  ): Promise<AgentResponse> {
    const intent = this.detector.detect(message);
    const handler = this.handlers.get(intent) ?? this.handlers.get("unknown")!;
    const context: IntentHandlerContext = { message, intent, generate };
    return handler.handle(context);
  }
}
