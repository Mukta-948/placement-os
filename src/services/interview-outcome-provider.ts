export interface InterviewOutcome { topic: string; score: 1 | 2 | 3 | 4 | 5; confidence: "low" | "medium" | "high"; occurredAt: string; }
export interface InterviewOutcomeProvider { recentOutcomes(ownerId: string): Promise<InterviewOutcome[]>; }
