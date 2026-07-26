import type { AgentResponse, IncomingMessage, Intent } from "../types/index.js";
import type { ConversationContext } from "../types/conversation-context.js";
import type { UserProfile } from "../types/profile.js";

export interface IntentHandlerContext {
  readonly message: IncomingMessage;
  readonly intent: Intent;
  readonly profile: UserProfile;
  readonly conversationContext: ConversationContext;
  generate(instruction: string): Promise<AgentResponse>;
}

export interface IntentHandler {
  readonly intents: readonly Intent[];
  readonly serviceName: string;
  handle(context: IntentHandlerContext): Promise<AgentResponse>;
}
