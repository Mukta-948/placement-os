import type { Intent } from "../types/index.js";
import { PromptedIntentService } from "./prompted-intent.service.js";

export class BehavioralService extends PromptedIntentService {
  readonly intents: readonly Intent[] = ["behavioral"];
  readonly serviceName = "behavioral";
  protected readonly instruction = "Coach behavioral interview answers using the STAR structure. Ask one question at a time and give direct feedback on specificity, ownership, outcomes, and clarity after each answer.";
}
