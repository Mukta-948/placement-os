import type { InterviewSession } from "../types/interview.js";
import type { InterviewSessionStorage } from "./interview-session-storage.js";
import type { InterviewContinuationResolver } from "./interview-continuation-resolver.js";
import type { CoachingState } from "./intent-router.service.js";
import type { IncomingMessage, Intent } from "../types/index.js";
import type { InterviewOutcomeProvider } from "./interview-outcome-provider.js";
export const DEFAULT_INTERVIEW_INACTIVITY_MS = 60 * 60 * 1000;
/** Storage and retrieval only; interview workflow belongs to InterviewOrchestrator. */
export class InterviewSessionService implements InterviewContinuationResolver, InterviewOutcomeProvider {
  constructor(private readonly storage: InterviewSessionStorage, private readonly inactivityMs = DEFAULT_INTERVIEW_INACTIVITY_MS, private readonly now: () => Date = () => new Date()) {}
  load(id: string): Promise<InterviewSession | null> { return this.storage.load(id); }
  save(session: InterviewSession): Promise<void> { return this.storage.save(session); }
  async findActive(ownerId: string): Promise<InterviewSession | null> { const session = await this.storage.findActiveByOwner(ownerId); if (!session) return null; if (this.now().getTime() - new Date(session.lastInteractionAt).getTime() <= this.inactivityMs) return session; const expired = { ...session, status: "expired" as const, currentQuestion: undefined, metrics: undefined, completedAt: this.now().toISOString(), lastInteractionAt: this.now().toISOString() }; await this.save(expired); return null; }
  async resolve(_message: IncomingMessage, state: CoachingState): Promise<Intent | undefined> { return (await this.findActive(state.conversationContext.contextId)) ? "interview" : undefined; }
  async recentOutcomes(ownerId: string) { return (await this.storage.listByOwner(ownerId)).flatMap((session) => session.turns.map((turn) => ({ topic: turn.question.topic, score: turn.evaluation.score, confidence: turn.evaluation.confidence, occurredAt: turn.answeredAt }))).slice(-10); }
}
