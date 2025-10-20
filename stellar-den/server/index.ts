import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  getControls,
  getStoryBotQuestions,
  saveAssessment,
  loadAssessment,
  exportAssessment,
  sendChecklist,
} from "./routes/iso";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // ISO Studio API routes
  app.get("/api/iso/controls", getControls);
  app.get("/api/iso/story-bot-questions", getStoryBotQuestions);
  app.post("/api/iso/save", saveAssessment);
  app.get("/api/iso/load", loadAssessment);
  app.post("/api/iso/export", exportAssessment);
  app.post("/api/iso/send-checklist", sendChecklist);

  return app;
}
