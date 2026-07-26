import type { AnswerEvaluation } from "../types/interview.js";
import type { PreferredDifficulty } from "../types/profile.js";
export class AdaptiveDifficultyPolicy {
  initial(preferred: PreferredDifficulty | undefined): PreferredDifficulty { return preferred ?? "medium"; }
  next(current: PreferredDifficulty, evaluation: AnswerEvaluation): PreferredDifficulty { const levels: PreferredDifficulty[] = ["easy", "medium", "hard"]; const index = levels.indexOf(current); if (evaluation.score >= 4) return levels[Math.min(index + 1, 2)]!; if (evaluation.score <= 2) return levels[Math.max(index - 1, 0)]!; return current; }
}
