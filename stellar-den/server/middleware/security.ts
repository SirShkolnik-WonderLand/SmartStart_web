/**
 * Production-Grade Security Middleware
 * Comprehensive security measures for all API endpoints
 */

import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import crypto from 'crypto';
import { RateLimiter } from '../../client/lib/validation';

// Rate limiting instances
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Custom rate limiter for form submissions
const formSubmissionLimiter = new RateLimiter(3, 15 * 60 * 1000); // 3 attempts per 15 minutes

// Additional security headers middleware
export function additionalSecurityHeaders(req: Request, res: Response, next: NextFunction) {
  // Add cache-busting headers for HTML files
  if (req.url === '/' || req.url.endsWith('.html')) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  
  // Add additional security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');
  
  next();
}

// Generate cryptographically secure nonce
export function generateNonce(): string {
  return crypto.randomBytes(16).toString('base64');
}

// Nonce-based CSP middleware
export function nonceCSP(req: Request, res: Response, next: NextFunction) {
  const nonce = generateNonce();
  
  // Store nonce in response locals for use in templates
  res.locals.nonce = nonce;
  
  // Set CSP header with nonce
  const cspHeader = process.env.NODE_ENV === 'production' ? 
    `default-src 'self'; script-src 'nonce-${nonce}' 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://plausible.io https://www.google-analytics.com https://analytics-hub-server.onrender.com; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests;` :
    // Development CSP - more permissive
    `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:* ws://localhost:*; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: http: blob:; connect-src 'self' http://localhost:* ws://localhost:* wss://localhost:*; frame-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self';`;
  
  res.setHeader('Content-Security-Policy', cspHeader);
  next();
}

// Security headers middleware
export const securityHeaders = helmet({
  // Hide X-Powered-By header
  hidePoweredBy: true,
  
  // HSTS (HTTP Strict Transport Security)
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  
  // X-Frame-Options (clickjacking protection)
  frameguard: { action: 'deny' },
  
  // X-Content-Type-Options (MIME sniffing protection)
  noSniff: true,
  
  // Referrer Policy
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  
  // Permissions Policy
  permissionsPolicy: {
    camera: [],
    microphone: [],
    geolocation: [],
    interestCohort: []
  },
  
  // Cache control for HTML files (disable caching)
  cacheControl: {
    noStore: true
  },
  
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "https://plausible.io",
        "https://www.google-analytics.com",
        "https://analytics-hub-server.onrender.com"
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com"
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com"
      ],
      imgSrc: [
        "'self'",
        "data:",
        "https:",
        "blob:"
      ],
      connectSrc: [
        "'self'",
        "https://plausible.io",
        "https://www.google-analytics.com",
        "https://analytics-hub-server.onrender.com"
      ],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: []
    }
  } : {
    // Development CSP - more permissive for Vite dev server
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        "http://localhost:*",
        "ws://localhost:*"
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com"
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com"
      ],
      imgSrc: [
        "'self'",
        "data:",
        "https:",
        "http:",
        "blob:"
      ],
      connectSrc: [
        "'self'",
        "http://localhost:*",
        "ws://localhost:*",
        "wss://localhost:*"
      ],
      frameSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false
});

// CORS configuration
export const corsConfig = (req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://alicesolutionsgroup.com',
    'https://www.alicesolutionsgroup.com',
    'https://alicesolutionsgroup.netlify.app',
    'http://localhost:3000',
    'http://localhost:8080',
    'http://localhost:5173'
  ];

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  next();
};

// Input validation middleware
export const validateInput = (req: Request, res: Response, next: NextFunction) => {
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /union\s+select/i,
    /drop\s+table/i,
    /delete\s+from/i,
    /insert\s+into/i,
    /update\s+set/i,
    /exec\s*\(/i,
    /eval\s*\(/i,
    /document\.cookie/i,
    /window\.location/i
  ];

  const bodyString = JSON.stringify(req.body);
  const queryString = JSON.stringify(req.query);
  const paramsString = JSON.stringify(req.params);

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(bodyString) || pattern.test(queryString) || pattern.test(paramsString)) {
      console.warn(`Suspicious input detected from IP: ${req.ip}`, {
        pattern: pattern.toString(),
        body: req.body,
        query: req.query,
        params: req.params
      });
      
      return res.status(400).json({
        error: 'Invalid input detected',
        message: 'Your request contains potentially malicious content'
      });
    }
  }

  next();
};

// Form submission rate limiting
export const formSubmissionRateLimit = (req: Request, res: Response, next: NextFunction) => {
  const identifier = req.ip || 'unknown';
  
  if (!formSubmissionLimiter.isAllowed(identifier)) {
    const remainingTime = formSubmissionLimiter.getRemainingTime(identifier);
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'Too many form submissions. Please try again later.',
      retryAfter: Math.ceil(remainingTime / 1000)
    });
  }

  next();
};

// Request size limiting
export const requestSizeLimit = (maxSize: number = 1024 * 1024) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.headers['content-length'] || '0');
    
    if (contentLength > maxSize) {
      return res.status(413).json({
        error: 'Request too large',
        message: `Request size exceeds ${maxSize} bytes`
      });
    }

    next();
  };
};

// IP whitelist (for admin endpoints)
export const ipWhitelist = (allowedIPs: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    
    if (!allowedIPs.includes(clientIP)) {
      console.warn(`Unauthorized IP access attempt: ${clientIP}`);
      return res.status(403).json({
        error: 'Access denied',
        message: 'Your IP address is not authorized'
      });
    }

    next();
  };
};

// Request logging
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    };

    // Log suspicious requests
    if (res.statusCode >= 400) {
      console.warn('Request completed with error:', logData);
    } else {
      console.log('Request completed:', logData);
    }
  });

  next();
};

// Error handling middleware
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    error: 'Internal server error',
    message: isDevelopment ? err.message : 'Something went wrong',
    ...(isDevelopment && { stack: err.stack })
  });
};

// Security monitoring
export const securityMonitor = (req: Request, res: Response, next: NextFunction) => {
  // Monitor for potential attacks
  const suspiciousHeaders = [
    'x-forwarded-for',
    'x-real-ip',
    'x-cluster-client-ip',
    'x-forwarded',
    'forwarded-for',
    'forwarded'
  ];

  const suspiciousValues = req.headers;
  for (const [key, value] of Object.entries(suspiciousValues)) {
    if (typeof value === 'string' && value.includes('..')) {
      console.warn(`Potential path traversal attempt from ${req.ip}:`, {
        header: key,
        value: value,
        url: req.url
      });
    }
  }

  next();
};

// Export rate limiters
export { generalLimiter, strictLimiter, authLimiter };
