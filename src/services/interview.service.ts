import type { AgentResponse, Intent } from "../types/index.js";
import type { IntentHandler, IntentHandlerContext } from "./intent-handler.js";
import { InterviewOrchestrator } from "./interview-orchestrator.js";

export class InterviewService implements IntentHandler {
  readonly intents: readonly Intent[] = ["interview"];
  readonly serviceName = "interview";
  constructor(private readonly interviews: InterviewOrchestrator) {}
  async handle(context: IntentHandlerContext): Promise<AgentResponse> { return { text: await this.interviews.handle(context.conversationContext.contextId, context.message.text ?? "", context.profile, context.conversationContext) }; }
}
