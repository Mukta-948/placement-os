export type Role = "user" | "assistant";

export interface ConversationMessage {
  readonly role: Role;
  readonly content: string;
  readonly createdAt: string;
}

export interface LlmMessage {
  readonly role: "system" | Role;
  readonly content: string;
}

export interface IncomingMessage {
  readonly id: string;
  readonly conversationId: string;
  readonly channel: string;
  readonly text: string | null;
  readonly senderName: string;
}

export interface ReplyTarget {
  reply(text: string): Promise<unknown>;
  typing(): Promise<unknown>;
}

export interface AgentResponse {
  readonly text: string;
  readonly shouldClearMemory?: boolean;
}

export type Intent =
  | "resume_review"
  | "interview"
  | "dsa"
  | "roadmap"
  | "behavioral"
  | "progress"
  | "help"
  | "unknown";
