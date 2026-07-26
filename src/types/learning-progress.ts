import type { PreferredDifficulty } from "./profile.js";
export const LEARNING_PROGRESS_SCHEMA_VERSION = 1;
export type MasterySource = "interview" | "dsa" | "resume" | "roadmap";
export interface MasterySignal { topic: string; score: 1 | 2 | 3 | 4 | 5; confidence: "low" | "medium" | "high"; occurredAt: string; source: MasterySource; }
export interface TopicMastery { mastery: number; confidence: number; evidenceCount: number; latestSignalScore?: number; lastPracticedAt: string; updatedAt: string; }
export interface LearningProgress { schemaVersion: number; userId: string; topics: Record<string, TopicMastery>; createdAt: string; updatedAt: string; }
export interface RoadmapTopic { topic: string; mastery: number; priorityReason: string; recommendedDifficulty: PreferredDifficulty; estimatedHours: number; }
export interface StructuredRoadmapPlan { focusTopics: RoadmapTopic[]; phases: Array<{ title: string; objective: string; topics: string[] }>; }
