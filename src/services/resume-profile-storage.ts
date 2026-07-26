import type { ResumeProfile } from "../types/resume.js"; export interface ResumeProfileStorage{load(id:string):Promise<ResumeProfile|null>;save(p:ResumeProfile):Promise<void>}
