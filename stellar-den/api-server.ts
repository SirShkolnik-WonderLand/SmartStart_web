import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import {
  getStoryBotQuestions,
  getControls,
  saveAssessment,
  loadAssessment,
  exportAssessment,
  sendChecklist,
  sendQuickBotReport,
} from "./server/routes/iso";
import {
  initTOTP,
  verifyCode,
  confirmBackup,
  checkUser,
  getUserInfo,
  saveAssessmentData,
  loadAssessmentData,
} from "./server/routes/auth";
import zohoRoutes from "./server/routes/zoho";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApiServer() {
  const app = express();

  // Basic middleware
  app.use(cors());
  app.use(express.json());

  // ISO Studio API routes
  app.get("/iso/controls", getControls);
  app.get("/iso/story-bot-questions", getStoryBotQuestions);
  app.post("/iso/save", saveAssessment);
  app.get("/iso/load", loadAssessment);
  app.post("/iso/export", exportAssessment);
  app.post("/iso/send-checklist", sendChecklist);
  app.post("/iso/send-quickbot-report", sendQuickBotReport);
  
  // Authentication routes for Full Assessment
  app.post("/auth/init-totp", initTOTP);
  app.post("/auth/verify", verifyCode);
  app.post("/auth/confirm-backup", confirmBackup);
  app.get("/auth/check-user", checkUser);
  app.post("/auth/user-info", getUserInfo);
  app.post("/auth/save-assessment", saveAssessmentData);
  app.post("/auth/load-assessment", loadAssessmentData);
  
  // Zoho routes
  app.use("/zoho", zohoRoutes);

  return app;
}
