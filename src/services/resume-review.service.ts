import type{AgentResponse,Intent}from"../types/index.js";import type{IntentHandler,IntentHandlerContext}from"./intent-handler.js";import{ResumeIntelligenceService}from"./resume-intelligence.service.js";

export class ResumeReviewService implements IntentHandler {
  readonly intents: readonly Intent[] = ["resume_review"];
  readonly serviceName = "resume_review";
  constructor(private readonly intelligence:ResumeIntelligenceService){}
  async handle(c:IntentHandlerContext):Promise<AgentResponse>{const t=c.message.text??"";if(t.length<120)return{text:"Please paste your resume text so I can run the ATS review."};return{text:await this.intelligence.analyze(c.profile.userId,t,c.profile)}}
}
