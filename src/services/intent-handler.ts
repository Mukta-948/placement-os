import type { AgentResponse, IncomingMessage, Intent } from "../types/index.js";

export interface IntentHandlerContext {
  readonly message: IncomingMessage;
  readonly intent: Intent;
  generate(instruction: string): Promise<AgentResponse>;
}

export interface IntentHandler {
  readonly intents: readonly Intent[];
  handle(context: IntentHandlerContext): Promise<AgentResponse>;
}
