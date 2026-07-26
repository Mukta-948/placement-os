import type { LearningProgress } from "../types/learning-progress.js";
export interface LearningProgressStorage { load(userId: string): Promise<LearningProgress | null>; save(progress: LearningProgress): Promise<void>; }
