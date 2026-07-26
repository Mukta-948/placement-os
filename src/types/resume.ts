export const RESUME_PROFILE_SCHEMA_VERSION = 1;
export interface ResumeEvidence { title?: string; skills: string[]; bullets: string[]; quantifiedBullets: number; actionVerbBullets: number; }
export interface ResumeProfile { schemaVersion: number; userId: string; lastUploadedAt: string; lastAnalyzedAt: string; skills: string[]; projects: ResumeEvidence[]; experience: ResumeEvidence[]; sections: Record<string, boolean>; }
export interface WeightedScore { weight: number; score: number; weighted: number; }
export interface ATSAnalysis { overallScore: number; scores: Record<string, WeightedScore>; findings: string[]; }
export interface ResumeRecommendation { priority: 1|2|3; category: string; suggestedChange: string; supportingEvidence: string[]; }
