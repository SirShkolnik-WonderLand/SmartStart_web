/**
 * LOGGING MIDDLEWARE
 * Request/response logging
 */

import type { Request, Response, NextFunction } from 'express';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// HTTP method colors
const methodColors: Record<string, string> = {
  GET: colors.green,
  POST: colors.cyan,
  PUT: colors.yellow,
  DELETE: colors.red,
  PATCH: colors.blue,
};

/**
 * Request logger middleware
 */
export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const start = Date.now();
  const { method, url, ip } = req;
  
  // Capture the original response methods
  const originalSend = res.send;
  const originalJson = res.json;

  // Override res.send to log response
  res.send = function (data): Response {
    res.send = originalSend;
    const duration = Date.now() - start;
    logRequest(method, url, res.statusCode, duration, ip);
    return res.send(data);
  };

  // Override res.json to log response
  res.json = function (data): Response {
    res.json = originalJson;
    const duration = Date.now() - start;
    logRequest(method, url, res.statusCode, duration, ip);
    return res.json(data);
  };

  next();
}

/**
 * Log request details
 */
function logRequest(
  method: string,
  url: string,
  statusCode: number,
  duration: number,
  ip?: string
): void {
  const methodColor = methodColors[method] || colors.reset;
  const statusColor = getStatusColor(statusCode);
  const timestamp = new Date().toISOString();

  // Format: [timestamp] METHOD /path STATUS duration ms IP
  console.log(
    `${colors.dim}[${timestamp}]${colors.reset} ` +
    `${methodColor}${method}${colors.reset} ` +
    `${url} ` +
    `${statusColor}${statusCode}${colors.reset} ` +
    `${colors.dim}${duration}ms${colors.reset} ` +
    `${colors.dim}${ip || 'unknown'}${colors.reset}`
  );

  // Warn on slow requests
  if (duration > 1000) {
    console.warn(
      `${colors.yellow}⚠️  Slow request: ${method} ${url} took ${duration}ms${colors.reset}`
    );
  }

  // Warn on errors
  if (statusCode >= 500) {
    console.error(
      `${colors.red}❌ Server error: ${method} ${url} returned ${statusCode}${colors.reset}`
    );
  }
}

/**
 * Get color based on status code
 */
function getStatusColor(statusCode: number): string {
  if (statusCode >= 500) return colors.red;
  if (statusCode >= 400) return colors.yellow;
  if (statusCode >= 300) return colors.cyan;
  if (statusCode >= 200) return colors.green;
  return colors.reset;
}

/**
 * Error logger middleware
 */
export function errorLogger(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const timestamp = new Date().toISOString();
  
  console.error(
    `${colors.red}${colors.bright}[ERROR]${colors.reset} ` +
    `${colors.dim}[${timestamp}]${colors.reset} ` +
    `${colors.red}${err.name}: ${err.message}${colors.reset}`
  );
  
  if (err.stack) {
    console.error(`${colors.dim}${err.stack}${colors.reset}`);
  }
  
  console.error(
    `${colors.dim}Request: ${req.method} ${req.url}${colors.reset}`
  );
  
  console.error(
    `${colors.dim}IP: ${req.ip}${colors.reset}`
  );

  next(err);
}
