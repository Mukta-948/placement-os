import type { Intent } from "../types/index.js";
import { PromptedIntentService } from "./prompted-intent.service.js";

export class ResumeReviewService extends PromptedIntentService {
  readonly intents: readonly Intent[] = ["resume_review"];
  readonly serviceName = "resume_review";
  protected readonly instruction = "Perform a resume review. Ask for pasted resume text when it is missing. Give prioritized, specific feedback on impact, clarity, skills, projects, and ATS readability.";
}
