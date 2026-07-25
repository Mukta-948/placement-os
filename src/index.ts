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
  const router = new IntentRouterService(
    new DeterministicIntentDetector(),
    [
      new ResumeReviewService(),
      new InterviewService(),
      new DsaService(new DailyDsaService()),
      new RoadmapService(),
      new BehavioralService(),
      new HelpService(),
      new GeneralCoachService(),
    ],
  );
  const agent = new PlacementAgentService(memory, llm, router, profiles);
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
