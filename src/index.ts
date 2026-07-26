import { createApp } from "./app.js";
import { CaspianCommunicationService } from "./communication/caspian.service.js";
import { loadDotEnv } from "./config/dotenv.js";
import { loadConfig } from "./config/env.js";
import { MessageController } from "./controllers/message.controller.js";
import { OpenAiCompatibleClient } from "./llm/openai-compatible-client.js";
import { FileConversationMemory } from "./services/conversation-memory.service.js";
import { DailyDsaService } from "./services/daily-dsa.service.js";
import { DeterministicIntentDetector } from "./services/deterministic-intent-detector.js";
import { DsaService } from "./services/dsa.service.js";
import { GeneralCoachService } from "./services/general-coach.service.js";
import { HelpService } from "./services/help.service.js";
import { IntentRouterService } from "./services/intent-router.service.js";
import { InterviewService } from "./services/interview.service.js";
import { PlacementAgentService } from "./services/placement-agent.service.js";
import { ResumeReviewService } from "./services/resume-review.service.js";
import { RoadmapService } from "./services/roadmap.service.js";
import { BehavioralService } from "./services/behavioral.service.js";
import { createLogger } from "./utils/logger.js";
import path from "node:path";
import { DeterministicProfileInformationDetector } from "./services/deterministic-profile-information-detector.js";
import { JsonProfileStorage } from "./services/json-profile-storage.js";
import { ProfileMerger } from "./services/profile-merger.js";
import { ProfileService } from "./services/profile.service.js";
import { StructuredLlmProfileExtractor } from "./services/structured-llm-profile-extractor.js";
import { ConversationContextService } from "./services/conversation-context.service.js";
import { ConversationStateManager } from "./services/conversation-state-manager.js";
import { JsonContextStorage } from "./services/json-context-storage.js";
import { JsonInterviewSessionStorage } from "./services/json-interview-session-storage.js";
import { InterviewSessionService } from "./services/interview-session.service.js";
import { InterviewOrchestrator } from "./services/interview-orchestrator.js";
import { LlmQuestionGenerator } from "./services/llm-question-generator.js";
import { LlmAnswerEvaluator } from "./services/llm-answer-evaluator.js";
import { AdaptiveDifficultyPolicy } from "./services/adaptive-difficulty-policy.js";
import { JsonLearningProgressStorage } from "./services/json-learning-progress-storage.js";
import { LearningProgressService } from "./services/learning-progress.service.js";
import { MasteryPolicy } from "./services/mastery-policy.js";
import { ProgressUpdater } from "./services/progress-updater.js";
import { RoadmapEngine } from "./services/roadmap-engine.js";

async function main(): Promise<void> {
  loadDotEnv();
  const config = loadConfig();
  const logger = createLogger(config.logLevel);
  const memory = new FileConversationMemory(config.memoryFile, config.maxConversationTurns);
  const llm = new OpenAiCompatibleClient(config.llm);
  const profiles = new ProfileService(
    new JsonProfileStorage(path.join(path.dirname(config.memoryFile), "profiles.json")),
    new ProfileMerger(),
    new StructuredLlmProfileExtractor(llm),
    new DeterministicProfileInformationDetector(),
  );
  const contexts = new ConversationContextService(
    new JsonContextStorage(path.join(path.dirname(config.memoryFile), "contexts.json")),
    new ConversationStateManager(),
  );
  const interviewSessions = new InterviewSessionService(new JsonInterviewSessionStorage(path.join(path.dirname(config.memoryFile), "interview-sessions.json")));
  const learningProgress = new LearningProgressService(new JsonLearningProgressStorage(path.join(path.dirname(config.memoryFile), "learning-progress.json")), new ProgressUpdater(new MasteryPolicy()));
  const interviews = new InterviewOrchestrator(interviewSessions, new LlmQuestionGenerator(llm), new LlmAnswerEvaluator(llm), new AdaptiveDifficultyPolicy(), learningProgress);
  const router = new IntentRouterService(
    new DeterministicIntentDetector(),
    [
      new ResumeReviewService(),
      new InterviewService(interviews),
      new DsaService(new DailyDsaService()),
      new RoadmapService(learningProgress, new RoadmapEngine(llm), interviewSessions),
      new BehavioralService(),
      new HelpService(),
      new GeneralCoachService(),
    ],
    interviewSessions,
  );
  const agent = new PlacementAgentService(memory, llm, router, profiles, contexts);
  const controller = new MessageController(agent, logger);
  const communication = new CaspianCommunicationService(config, controller, logger);
  const app = createApp();

  const server = app.listen(config.port, () => logger.info("HTTP server started", { port: config.port }));
  const shutdown = () => server.close(() => process.exit(0));
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
  await communication.start();
}

main().catch((error) => {
  console.error(JSON.stringify({ level: "error", message: "Application failed to start", detail: error instanceof Error ? error.message : String(error) }));
  process.exitCode = 1;
});
