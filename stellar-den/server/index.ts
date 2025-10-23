import "dotenv/config";
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url"; // Added for ES modules __dirname equivalent

// ES modules equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  strictLimiter,
  additionalSecurityHeaders
} from "./middleware/security";

export function createServer() {
  const app = express();

  // Security middleware (order matters!)
  app.use(nonceCSP);
  app.use(corsConfig);
  app.use(additionalSecurityHeaders);
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

  // Health check endpoint for Render
  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "healthy", timestamp: new Date().toISOString() });
  });

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

  // Serve static files (CSS, JS, images, etc.) from the built SPA
  const staticPath = path.join(__dirname, '../spa');
  console.log('Static files path:', staticPath);
  console.log('Static path exists:', fs.existsSync(staticPath));
  
  // Add explicit MIME type handling for JavaScript files
  app.use('/assets', express.static(path.join(staticPath, 'assets'), {
    setHeaders: (res, path) => {
      if (path.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript');
      }
    }
  }));
  
  app.use(express.static(staticPath));

  // Serve HTML with nonce for SPA (catch-all route - must be last before error handler)
  app.get('/*', (req, res) => {
    let templatePath = ''; // Declare outside try block for error logging
    
    try {
      // Read the HTML template - try multiple possible paths
      const possiblePaths = [
        path.join(__dirname, 'templates', 'index.html'),
        path.join(process.cwd(), 'dist', 'server', 'templates', 'index.html'),
        path.join(process.cwd(), 'server', 'templates', 'index.html'),
        path.join(process.cwd(), 'stellar-den', 'server', 'templates', 'index.html')
      ];
      
      let html: string;
      let found = false;
      
      for (const testPath of possiblePaths) {
        try {
          templatePath = testPath;
          html = fs.readFileSync(templatePath, 'utf8');
          found = true;
          break;
        } catch (error) {
          // Continue to next path
          continue;
        }
      }
      
      if (!found) {
        throw new Error('Template not found in any of the expected locations');
      }
      
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
      console.error('Template path attempted:', templatePath);
      console.error('Current working directory:', process.cwd());
      console.error('__dirname:', __dirname);
      res.status(500).send('Internal Server Error');
    }
  });

  // Error handling (must be last)
  app.use(errorHandler);

  return app;
}
