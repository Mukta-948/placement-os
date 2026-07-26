import type { AgentResponse } from "../types/index.js";
import type { IntentHandler, IntentHandlerContext } from "./intent-handler.js";

/** Shared behavior for focused coaching services that only need an intent-specific instruction. */
export abstract class PromptedIntentService implements IntentHandler {
  abstract readonly intents: readonly import("../types/index.js").Intent[];
  abstract readonly serviceName: string;
  protected abstract readonly instruction: string;

  handle(context: IntentHandlerContext): Promise<AgentResponse> {
    return context.generate(this.instruction);
  }
}
