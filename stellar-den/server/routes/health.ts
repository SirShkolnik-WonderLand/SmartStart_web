import { Router } from "express";
import axios from "axios";
import os from "os";

type CheckResult = {
  name: string;
  status: "pass" | "fail";
  latencyMs?: number;
  httpStatus?: number;
  detail?: string;
  metadata?: Record<string, unknown>;
};

const router = Router();

const ANALYTICS_TIMEOUT = parseInt(process.env.HEALTHCHECK_TIMEOUT ?? "5000", 10);

function getAnalyticsBaseUrl(): string {
  const envUrl =
    process.env.ANALYTICS_API_URL ??
    process.env.VITE_ANALYTICS_API_URL ??
    "https://analytics-hub-server.onrender.com";

  return envUrl.replace(/\/$/, "");
}

async function probeEndpoint(name: string, url: string): Promise<CheckResult> {
  const started = Date.now();

  try {
    const response = await axios.get(url, { timeout: ANALYTICS_TIMEOUT });
    return {
      name,
      status: response.status >= 200 && response.status < 400 ? "pass" : "fail",
      latencyMs: Date.now() - started,
      httpStatus: response.status,
      metadata: typeof response.data === "object" ? response.data : { body: response.data },
    };
  } catch (error) {
    const err = error as axios.AxiosError;
    return {
      name,
      status: "fail",
      latencyMs: Date.now() - started,
      httpStatus: err.response?.status,
      detail: err.message,
      metadata: err.response?.data as Record<string, unknown> | undefined,
    };
  }
}

router.get("/", async (req, res) => {
  const pageParam = typeof req.query.page === "string" ? req.query.page : undefined;

  if (pageParam) {
    const articleEvents = ["article_open", "article_scroll_75", "article_cta_click"];
    const pageEvents: Record<string, string[]> = {
      "toronto-cybersecurity-consulting": ["lead_open", "cta_click_primary", "form_submit_success", "scroll_75"],
      "cybersecurity-for-toronto-smes": articleEvents,
      "innovation-on-campus": articleEvents,
      "new-generation-of-builders": articleEvents,
      "beyond-silicon-valley-canadian-students": articleEvents,
      "the-smartstart-way": articleEvents,
      "letter-to-the-builders": articleEvents,
      "builders-manifesto": articleEvents,
      "parents-digital-world": articleEvents,
    };

    if (pageEvents[pageParam]) {
      return res.json({
        ok: true,
        page: pageParam,
        events: pageEvents[pageParam],
      });
    }

    return res.status(404).json({
      ok: false,
      error: "Unknown page lookup",
      page: pageParam,
    });
  }

  const analyticsBase = getAnalyticsBaseUrl();

  const [analyticsHealth, analyticsDb] = await Promise.all([
    probeEndpoint("analyticsHealth", `${analyticsBase}/health`),
    probeEndpoint("analyticsDatabase", `${analyticsBase}/db-test`),
  ]);

  const overallStatus =
    analyticsHealth.status === "pass" && analyticsDb.status === "pass" ? "healthy" : "degraded";

  res.status(overallStatus === "healthy" ? 200 : 503).json({
    status: overallStatus,
    timestamp: new Date().toISOString(),
    metrics: {
      uptimeSeconds: process.uptime(),
      memory: process.memoryUsage(),
      loadAverage: os.loadavg(),
    },
    environment: {
      node: process.version,
      platform: `${os.type()} ${os.release()}`,
      mode: process.env.NODE_ENV ?? "development",
      analyticsApi: analyticsBase,
      cronEnabled:
        process.env.NODE_ENV === "production" || process.env.ENABLE_ANALYTICS_CRON === "true",
    },
    security: {
      nonceCsp: true,
      rateLimiting: process.env.NODE_ENV === "production",
      helmet: true,
      requestBodyLimitBytes: 5 * 1024 * 1024,
    },
    checks: [analyticsHealth, analyticsDb],
  });
});

router.get("/extended", async (_req, res) => {
  const analyticsBase = getAnalyticsBaseUrl();
  const trackerUrl = `${analyticsBase}/tracker.js`;

  const [health, db, tracker] = await Promise.all([
    probeEndpoint("analyticsHealth", `${analyticsBase}/health`),
    probeEndpoint("analyticsDatabase", `${analyticsBase}/db-test`),
    probeEndpoint("analyticsTracker", trackerUrl),
  ]);

  const failures = [health, db, tracker].filter((check) => check.status === "fail").length;

  res.status(failures === 0 ? 200 : 503).json({
    status: failures === 0 ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    checks: [health, db, tracker],
    guidance:
      failures === 0
        ? "All upstream analytics services responded successfully."
        : "Investigate failing checks immediately to restore full analytics coverage.",
  });
});

export default router;

