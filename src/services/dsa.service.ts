import type { AgentResponse, Intent } from "../types/index.js";
import { DailyDsaService } from "./daily-dsa.service.js";
import type { IntentHandler, IntentHandlerContext } from "./intent-handler.js";

export class DsaService implements IntentHandler {
  readonly intents: readonly Intent[] = ["dsa"];
  readonly serviceName = "dsa";
  constructor(private readonly dailyDsa: DailyDsaService) {}

  async handle(context: IntentHandlerContext): Promise<AgentResponse> {
    const text = context.message.text?.toLowerCase() ?? "";
    if (/(today'?s|todays)\s+dsa\s+(problem|challenge)/.test(text)) {
      return { text: this.dailyDsa.getChallenge() };
    }
    return context.generate("Coach the student on DSA. Explain concepts clearly, encourage an approach before a full solution, and use concise examples.");
  }
}
