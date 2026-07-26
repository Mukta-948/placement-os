import type { ConversationContext } from "../types/conversation-context.js";
import type { InterviewQuestion, InterviewSession } from "../types/interview.js";
import type { UserProfile } from "../types/profile.js";
export interface QuestionStrategy { nextQuestion(session: InterviewSession, profile: UserProfile, context: ConversationContext): Promise<InterviewQuestion>; }
