import type { Intent } from "../types/index.js";
import { PromptedIntentService } from "./prompted-intent.service.js";

export class RoadmapService extends PromptedIntentService {
  readonly intents: readonly Intent[] = ["roadmap"];
  protected readonly instruction = "Create a practical placement study roadmap. First obtain the target role, deadline, current level, and available weekly time if they are missing. Then provide a phased plan with measurable weekly outcomes.";
}
