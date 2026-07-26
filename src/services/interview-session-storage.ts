import type { InterviewSession } from "../types/interview.js";
export interface InterviewSessionStorage { load(id: string): Promise<InterviewSession | null>; save(session: InterviewSession): Promise<void>; findActiveByOwner(ownerId: string): Promise<InterviewSession | null>; }
