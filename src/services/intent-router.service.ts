import type { AgentResponse, IncomingMessage, Intent } from "../types/index.js";
import type { IntentDetector } from "./intent-detector.js";
import type { IntentHandler, IntentHandlerContext } from "./intent-handler.js";
import type { ConversationContext } from "../types/conversation-context.js";
import type { UserProfile } from "../types/profile.js";
import type { InterviewContinuationResolver } from "./interview-continuation-resolver.js";

export interface CoachingState {
  readonly profile: UserProfile;
  readonly conversationContext: ConversationContext;
}

export interface RoutedResponse {
  readonly response: AgentResponse;
  readonly intent: Intent;
  readonly serviceName: string;
}

export class IntentRouterService {
  private readonly handlers = new Map<Intent, IntentHandler>();

  constructor(private readonly detector: IntentDetector, handlers: readonly IntentHandler[], private readonly interviewContinuation?: InterviewContinuationResolver) {
    for (const handler of handlers) {
      for (const intent of handler.intents) {
        if (this.handlers.has(intent)) throw new Error(`Intent handler already registered: ${intent}`);
        this.handlers.set(intent, handler);
      }
    }
    if (!this.handlers.has("unknown")) throw new Error("An unknown intent handler is required.");
  }

  async route(
    message: IncomingMessage,
    coachingState: CoachingState,
    generate: (instruction: string) => Promise<AgentResponse>,
  ): Promise<RoutedResponse> {
    const intent = await this.interviewContinuation?.resolve(message, coachingState) ?? this.detector.detect(message);
    const handler = this.handlers.get(intent) ?? this.handlers.get("unknown")!;
    const context: IntentHandlerContext = { message, intent, ...coachingState, generate };
    return { response: await handler.handle(context), intent, serviceName: handler.serviceName };
  }
}
