import "dotenv/config";
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
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
  nonceCSP,
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
  app.use(nonceCSP);
  app.use(corsConfig);
  app.use(requestLogger);
  app.use(securityMonitor);
  app.use(validateInput);
  app.use(requestSizeLimit(5 * 1024 * 1024)); // 5MB limit

  // Rate limiting (only in production)
  if (process.env.NODE_ENV === 'production') {
    app.use("/api", generalLimiter);
    app.use("/api/iso/save", strictLimiter);
    app.use("/api/iso/export", strictLimiter);
    app.use("/api/iso/send-checklist", formSubmissionRateLimit);
  }

  // Body parsing
  app.use(express.json({ limit: 5 * 1024 * 1024 })); // 5MB in bytes
  app.use(express.urlencoded({ extended: true, limit: 5 * 1024 * 1024 })); // 5MB in bytes

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

  // Serve HTML with nonce for SPA (catch-all route - must be last before error handler)
  app.get("*", (req, res) => {
    try {
      // Read the HTML template
      const templatePath = path.join(__dirname, 'templates', 'index.html');
      let html = fs.readFileSync(templatePath, 'utf8');
      
      // Get nonce from response locals (set by nonceCSP middleware)
      const nonce = res.locals.nonce || '';
      
      // Replace placeholders
      html = html.replace(/\{\{NONCE\}\}/g, nonce);
      html = html.replace(/\{\{HASH\}\}/g, 'BUSY1Sdf'); // This should be dynamic in production
      html = html.replace(/\{\{ANALYTICS_API_URL\}\}/g, process.env.ANALYTICS_API_URL || 'https://analytics-hub-server.onrender.com');
      
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (error) {
      console.error('Error serving HTML:', error);
      res.status(500).send('Internal Server Error');
    }
  });

  // Error handling (must be last)
  app.use(errorHandler);

  return app;
}
