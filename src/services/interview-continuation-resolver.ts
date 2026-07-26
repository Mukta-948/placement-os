import type { Intent } from "../types/index.js";
import type { CoachingState } from "./intent-router.service.js";
import type { IncomingMessage } from "../types/index.js";
export interface InterviewContinuationResolver { resolve(message: IncomingMessage, state: CoachingState): Promise<Intent | undefined>; }
