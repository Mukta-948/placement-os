import type { Intent } from "../types/index.js";
import { PromptedIntentService } from "./prompted-intent.service.js";

export class HelpService extends PromptedIntentService {
  readonly intents: readonly Intent[] = ["help"];
  readonly serviceName = "help";
  protected readonly instruction = "Explain the available coaching capabilities concisely, with example requests for DSA, mock interviews, resume review, behavioral practice, study roadmaps, and CS fundamentals.";
}
