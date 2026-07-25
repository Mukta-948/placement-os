import { CommClient, CommError, type Message } from "caspian-sdk";
import type { AppConfig } from "../config/env.js";
import type { IncomingMessage, ReplyTarget } from "../types/index.js";
import type { Logger } from "../utils/logger.js";

export interface MessageProcessor { process(message: IncomingMessage, target: ReplyTarget): Promise<void>; }

/** The only channel adapter: all Caspian channels flow through this one handler. */
export class CaspianCommunicationService {
  private readonly client: CommClient;
  constructor(private readonly config: AppConfig, private readonly processor: MessageProcessor, private readonly logger: Logger) {
    this.client = new CommClient({ apiKey: config.caspian.apiKey, baseUrl: config.caspian.baseUrl });
  }

  async start(): Promise<void> {
    await this.connectConfiguredChannels();
    this.client.onMessage(async (message) => this.handle(message));
    this.logger.info("Caspian listener started");
    await this.client.listen({ concurrency: "queue" });
  }

  private async connectConfiguredChannels(): Promise<void> {
    if (!this.config.caspian.emailEnabled && !this.config.caspian.telegramEnabled) {
      throw new Error("At least one Caspian channel must be enabled.");
    }
    if (this.config.caspian.emailEnabled) {
      const email = await this.client.connectEmail({ username: this.config.caspian.emailUsername });
      this.logger.info("Email channel connected", { connectionId: email.id, address: email.address });
    }
    if (this.config.caspian.telegramEnabled) {
      const token = this.config.caspian.telegramBotToken;
      if (!token) throw new Error("TELEGRAM_BOT_TOKEN is required when CASPIAN_ENABLE_TELEGRAM=true");
      const telegram = await this.client.connectTelegram({ botToken: token });
      this.logger.info("Telegram channel connected", { connectionId: telegram.id });
    }
  }

  private async handle(message: Message): Promise<void> {
    const incoming: IncomingMessage = {
      id: message.id,
      conversationId: message.conversationId,
      channel: message.channel,
      text: message.text,
      senderName: String(message.sender?.["name"] ?? message.sender?.["address"] ?? "Student"),
    };
    try {
      await this.processor.process(incoming, message);
    } catch (error) {
      const detail = error instanceof CommError ? error.detail : error instanceof Error ? error.message : "Unknown error";
      this.logger.error("Caspian message processing failed", { messageId: message.id, channel: message.channel, detail });
      await message.reply("I ran into a temporary issue. Please send that again in a moment.").catch((replyError) => {
        this.logger.error("Could not send Caspian fallback reply", { detail: String(replyError) });
      });
    }
  }
}
