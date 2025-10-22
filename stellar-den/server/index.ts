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
import {
  securityHeaders,
  corsConfig,
  validateInput,
  formSubmissionRateLimit,
  requestSizeLimit,
  requestLogger,
  errorHandler,
  securityMonitor,
  generalLimiter,
  strictLimiter
} from "./middleware/security";

export function createServer() {
  const app = express();

  // Security middleware (order matters!)
  app.use(securityHeaders);
  app.use(corsConfig);
  app.use(requestLogger);
  app.use(securityMonitor);
  app.use(validateInput);
  app.use(requestSizeLimit(5 * 1024 * 1024)); // 5MB limit

  // Rate limiting (only in production)
  if (process.env.NODE_ENV === 'production') {
    app.use("/api/", generalLimiter);
    app.use("/api/iso/save", strictLimiter);
    app.use("/api/iso/export", strictLimiter);
    app.use("/api/iso/send-checklist", formSubmissionRateLimit);
  }

  // Body parsing
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true, limit: '5mb' }));

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

  // Error handling (must be last)
  app.use(errorHandler);

  return app;
}
