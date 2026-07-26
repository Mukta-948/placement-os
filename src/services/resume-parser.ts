import type { ResumeProfile } from "../types/resume.js";
export interface ResumeParser { parse(userId: string, text: string, now: string): ResumeProfile; }
