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
  sendQuickBotReport,
} from "./routes/iso";
import {
  initTOTP,
  verifyCode,
  confirmBackup,
  checkUser,
  getUserInfo,
  saveAssessmentData,
  loadAssessmentData,
} from "./routes/auth";
import zohoRoutes from "./routes/zoho";
import { startDailyAnalyticsCron } from "./cron/dailyAnalytics";
import privacyRoutes from "./routes/privacy";
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

export async function createServer() {
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
  app.post("/api/iso/send-quickbot-report", sendQuickBotReport);

  // Authentication routes for Full Assessment
  app.post("/api/auth/init-totp", initTOTP);
  app.post("/api/auth/verify", verifyCode);
  app.post("/api/auth/confirm-backup", confirmBackup);
  app.get("/api/auth/check-user", checkUser);
  app.post("/api/auth/user-info", getUserInfo);
  app.post("/api/auth/save-assessment", saveAssessmentData);
  app.post("/api/auth/load-assessment", loadAssessmentData);

  // Zoho Integration API routes
  app.use("/api/zoho", zohoRoutes);

  // Privacy API routes
  app.use("/api/privacy", privacyRoutes);

  // Analytics API routes
  const analyticsRoutes = await import('./routes/analytics.js');
  app.use("/api/analytics", analyticsRoutes.default);

  // Start daily reports cron jobs (only in production or if enabled)
  if (process.env.NODE_ENV === 'production' || process.env.ENABLE_ANALYTICS_CRON === 'true') {
    console.log('📅 Starting daily reports cron jobs...');
    console.log('   NODE_ENV:', process.env.NODE_ENV);
    console.log('   ENABLE_ANALYTICS_CRON:', process.env.ENABLE_ANALYTICS_CRON);
    console.log('   SMTP_HOST:', process.env.SMTP_HOST || 'smtp.zohocloud.ca');
    console.log('   SMTP_USER:', process.env.SMTP_USER || 'support@alicesolutionsgroup.com');
    console.log('   SMTP_PASSWORD:', process.env.SMTP_PASSWORD ? '***SET***' : '***MISSING***');
    const { startDailyReportsCron } = await import('./cron/dailyReports.js');
    startDailyReportsCron();
    console.log('✅ Daily reports cron jobs started');
  } else {
    console.log('⚠️ Daily reports cron jobs NOT started');
    console.log('   NODE_ENV:', process.env.NODE_ENV);
    console.log('   ENABLE_ANALYTICS_CRON:', process.env.ENABLE_ANALYTICS_CRON);
    console.log('   💡 To enable: Set ENABLE_ANALYTICS_CRON=true or NODE_ENV=production');
  }

  // Serve static files (CSS, JS, images, etc.) from the built SPA
  const staticPath = path.join(__dirname, '../spa');
  const assetsPath = path.join(staticPath, 'assets');
  console.log('Static files path:', staticPath);
  console.log('Static path exists:', fs.existsSync(staticPath));
  console.log('Assets path:', assetsPath);
  console.log('Assets path exists:', fs.existsSync(assetsPath));
  
  // Log CSS files if assets directory exists
  if (fs.existsSync(assetsPath)) {
    try {
      const files = fs.readdirSync(assetsPath);
      const cssFiles = files.filter(f => f.endsWith('.css'));
      console.log('CSS files found:', cssFiles);
    } catch (err) {
      console.log('Could not read assets directory:', err);
    }
  }
  
  // CRITICAL: Serve assets BEFORE the catch-all route
  // This ensures CSS/JS files are served with correct MIME types
  app.use('/assets', (req, res, next) => {
    // First try to serve the file
    express.static(path.join(staticPath, 'assets'), {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.js')) {
          res.setHeader('Content-Type', 'application/javascript');
          res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        } else if (filePath.endsWith('.css')) {
          res.setHeader('Content-Type', 'text/css');
          res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        }
      },
      // Don't fall through to catch-all if file doesn't exist
      fallthrough: false
    })(req, res, () => {
      // If static middleware didn't serve the file, handle 404 with correct MIME type
      if (req.path.endsWith('.css')) {
        res.status(404).type('text/css').send('/* CSS file not found */');
      } else if (req.path.endsWith('.js')) {
        res.status(404).type('application/javascript').send('// JS file not found');
      } else {
        res.status(404).type('text/plain').send('Asset not found');
      }
    });
  });
  
  // Serve other static files (images, etc.)
  app.use(express.static(staticPath, {
    // Don't serve index.html for static files
    index: false
  }));

  // Serve HTML with nonce for SPA (catch-all route - must be last before error handler)
  // Only catch routes that don't start with /api or /assets
  app.get('*', (req, res) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    
    // Skip asset requests (CSS, JS, images) - these should be handled by static middleware
    // This should never be reached if static middleware is working correctly
    if (req.path.startsWith('/assets/')) {
      // This is a fallback - should not happen, but handle it correctly
      if (req.path.endsWith('.css')) {
        return res.status(404).type('text/css').send('/* CSS file not found */');
      } else if (req.path.endsWith('.js')) {
        return res.status(404).type('application/javascript').send('// JS file not found');
      }
      // For other assets, return 404 with plain text (not JSON)
      return res.status(404).type('text/plain').send('Asset not found');
    }
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
      
      // Get the actual JavaScript and CSS file hashes from the built assets
      let jsHash = 'BUSY1Sdf'; // fallback
      let cssHash = null; // null means CSS might be inlined in JS
      let cssFileExists = false;
      
      try {
        const assetsPath = path.join(__dirname, '../spa/assets');
        if (fs.existsSync(assetsPath)) {
          const files = fs.readdirSync(assetsPath);
          console.log(`[HTML] Assets directory found: ${assetsPath}`);
          console.log(`[HTML] Files in assets: ${files.slice(0, 10).join(', ')}${files.length > 10 ? '...' : ''}`);
          
          const jsFile = files.find(file => file.startsWith('index-') && file.endsWith('.js'));
          // Look for CSS files - try multiple patterns
          let cssFile = files.find(file => file.startsWith('index-') && file.endsWith('.css'));
          
          // If no index-*.css, try style-*.css (Vite might name it differently)
          if (!cssFile) {
            cssFile = files.find(file => file.startsWith('style-') && file.endsWith('.css'));
          }
          
          // If still no CSS, try any CSS file
          if (!cssFile) {
            cssFile = files.find(file => file.endsWith('.css'));
          }
          
          if (jsFile) {
            jsHash = jsFile.replace('index-', '').replace('.js', '');
            console.log(`[HTML] Found JS file: index-${jsHash}.js`);
          } else {
            console.log(`[HTML] WARNING: No JS file found!`);
          }
          
          if (cssFile) {
            // Extract hash from CSS filename (handle both index-*.css and style-*.css)
            cssHash = cssFile.replace(/^(index|style)-/, '').replace('.css', '');
            cssFileExists = true;
            console.log(`[HTML] Found CSS file: ${cssFile} (hash: ${cssHash})`);
          } else {
            console.log(`[HTML] No separate CSS file found - CSS is likely inlined in JS`);
            console.log(`[HTML] CSS will load via JS bundle (App.tsx imports global.css)`);
          }
        } else {
          console.log(`[HTML] WARNING: Assets directory not found: ${assetsPath}`);
          console.log(`[HTML] Current working directory: ${process.cwd()}`);
          console.log(`[HTML] __dirname: ${__dirname}`);
        }
      } catch (error) {
        console.log('[HTML] ERROR: Could not determine asset hashes:', error);
      }
      
      // Replace placeholders
      html = html.replace(/\{\{NONCE\}\}/g, nonce);
      html = html.replace(/\{\{HASH\}\}/g, jsHash);
      
      // Replace CSSHASH - use 'null' string if CSS is inlined (template will handle it)
      // Template uses CSSHASH with conditional loading to prevent MIME type errors
      html = html.replace(/\{\{CSSHASH\}\}/g, cssHash || 'null');
      // Remove CSSLINK placeholder if it exists (we're using CSSHASH now)
      html = html.replace(/\{\{CSSLINK\}\}/g, '');
      
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
