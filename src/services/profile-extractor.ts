import type { IncomingMessage } from "../types/index.js";
import type { ProfileUpdate } from "../types/profile.js";
export interface ProfileExtractor { extract(message: IncomingMessage): Promise<ProfileUpdate>; }
export interface ProfileInformationDetector { shouldExtract(message: IncomingMessage): boolean; }
