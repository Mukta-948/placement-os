import type { AgentResponse, Intent } from "../types/index.js";
import type { IntentHandler, IntentHandlerContext } from "./intent-handler.js";
import { LearningProgressService } from "./learning-progress.service.js";
import { RoadmapEngine } from "./roadmap-engine.js";
import type { InterviewOutcomeProvider } from "./interview-outcome-provider.js";

export class RoadmapService implements IntentHandler {
  readonly intents: readonly Intent[] = ["roadmap"];
  readonly serviceName = "roadmap";
  constructor(private readonly progress: LearningProgressService, private readonly engine: RoadmapEngine, private readonly outcomes: InterviewOutcomeProvider) {}
  async handle(context: IntentHandlerContext): Promise<AgentResponse> { return { text: await this.engine.build(context.profile, context.conversationContext, await this.progress.getOrCreate(context.profile.userId), await this.outcomes.recentOutcomes(context.conversationContext.contextId)) }; }
}
