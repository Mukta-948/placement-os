import type { AgentResponse, Intent } from "../types/index.js";
import type { IntentHandlerContext } from "./intent-handler.js";
import { PromptedIntentService } from "./prompted-intent.service.js";

export class GeneralCoachService extends PromptedIntentService {
  readonly intents: readonly Intent[] = ["unknown", "progress"];
  readonly serviceName = "general_coach";
  protected readonly instruction = "Provide general placement coaching. If the student asks about progress, explain that profile-based progress tracking is not enabled yet and offer a concrete next practice step. Otherwise, help with their request or ask one focused clarification.";

  override handle(context: IntentHandlerContext): Promise<AgentResponse> {
    return context.generate(this.instruction);
  }
}
