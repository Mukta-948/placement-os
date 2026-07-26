import type { Intent } from "../types/index.js";
import { PromptedIntentService } from "./prompted-intent.service.js";

export class InterviewService extends PromptedIntentService {
  readonly intents: readonly Intent[] = ["interview"];
  readonly serviceName = "interview";
  protected readonly instruction = "Run a realistic placement interview. Ask exactly one question at a time, wait for the student's answer, then assess it and ask a relevant follow-up.";
}
