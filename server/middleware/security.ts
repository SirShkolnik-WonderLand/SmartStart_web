import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';

export function setupSecurity(app: express.Application) {
  // Basic security headers
  app.disable('x-powered-by');
  
  // Cookie parser
  app.use(cookieParser());
  
  // Body parsing with limits
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json({ limit: '64kb' }));
  
  // Helmet security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'none'"],
        baseUri: ["'none'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
        imgSrc: ["'self'", "data:"],
        fontSrc: ["'self'"],
        styleSrc: ["'self'"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    referrerPolicy: { policy: 'no-referrer' },
    permissionsPolicy: {
      features: {
        camera: [],
        microphone: [],
        geolocation: [],
        payment: [],
        usb: [],
        magnetometer: [],
        gyroscope: [],
        accelerometer: []
      }
    }
  }));
  
  // Trust proxy for Render
  app.set('trust proxy', 1);
  
  // Rate limiting
  const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 120, // limit each IP to 120 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      ok: false,
      out: 'Too many requests, please try again later.'
    }
  });
  
  app.use('/api', limiter);
  
  // CSRF protection middleware
  app.use((req, res, next) => {
    const nonce = crypto.randomBytes(16).toString('base64');
    res.locals.scriptNonce = nonce;
    next();
  });
}

// CSRF token management
export function issueCsrf(res: express.Response): string {
  const token = crypto.randomBytes(24).toString('base64url');
  res.cookie('csrft', token, { 
    httpOnly: false, 
    sameSite: 'strict', 
    secure: true, 
    maxAge: 3600 * 1000 // 1 hour
  });
  return token;
}

export function verifyCsrf(req: express.Request): boolean {
  const cookieToken = req.cookies?.csrft;
  const bodyToken = req.body?.csrf || req.get('x-csrf');
  return cookieToken && bodyToken && cookieToken === bodyToken;
}

export function requireCsrf(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!verifyCsrf(req)) {
    return res.status(403).json({ ok: false, out: 'CSRF token validation failed' });
  }
  next();
}
