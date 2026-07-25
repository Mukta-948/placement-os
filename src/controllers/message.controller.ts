import type { MessageProcessor } from "../communication/caspian.service.js";
import type { PlacementAgentService } from "../services/placement-agent.service.js";
import type { IncomingMessage, ReplyTarget } from "../types/index.js";
import type { Logger } from "../utils/logger.js";

export class MessageController implements MessageProcessor {
  constructor(private readonly agent: PlacementAgentService, private readonly logger: Logger) {}

  async process(message: IncomingMessage, target: ReplyTarget): Promise<void> {
    this.logger.info("Inbound placement-prep message", { messageId: message.id, conversationId: message.conversationId, channel: message.channel });
    await target.typing().catch(() => undefined); // Not every provider supports typing.
    const response = await this.agent.respond(message);
    await target.reply(response.text);
  }
}
