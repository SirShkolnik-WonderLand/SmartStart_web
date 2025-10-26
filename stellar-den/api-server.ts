import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { getStoryBotQuestions, getControls } from "./server/routes/iso";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApiServer() {
  const app = express();

  // Basic middleware
  app.use(cors());
  app.use(express.json());

  // API routes
  app.get("/api/iso/story-bot-questions", getStoryBotQuestions);
  app.get("/api/iso/controls", getControls);

  return app;
}
