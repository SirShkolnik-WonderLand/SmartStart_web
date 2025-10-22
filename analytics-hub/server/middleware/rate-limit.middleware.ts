/**
 * RATE LIMITING MIDDLEWARE
 * Protect API from abuse
 */

import rateLimit from 'express-rate-limit';

// General API rate limit (100 requests per 15 minutes)
export const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: {
    success: false,
    error: 'Too many requests, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health' || req.path === '/api/health';
  },
});

// Strict rate limit for tracking endpoints (500 events per 15 minutes per IP)
export const trackingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: {
    success: false,
    error: 'Too many tracking events, please slow down.',
    code: 'TRACKING_RATE_LIMIT',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use IP + session ID for better tracking
    const sessionId = req.body?.event?.sessionId || '';
    return `${req.ip}-${sessionId}`;
  },
});

// Auth rate limit (5 login attempts per 15 minutes)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    error: 'Too many login attempts, please try again later.',
    code: 'AUTH_RATE_LIMIT',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
});

// Export rate limit (10 exports per hour)
export const exportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    error: 'Too many export requests, please try again later.',
    code: 'EXPORT_RATE_LIMIT',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
