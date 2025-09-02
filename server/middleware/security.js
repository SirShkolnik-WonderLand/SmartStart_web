const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');

function setupSecurity(app) {
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
function issueCsrf(res) {
  const token = crypto.randomBytes(24).toString('base64url');
  res.cookie('csrft', token, { 
    httpOnly: false, 
    sameSite: 'strict', 
    secure: true, 
    maxAge: 3600 * 1000 // 1 hour
  });
  return token;
}

function verifyCsrf(req) {
  const cookieToken = req.cookies?.csrft;
  const bodyToken = req.body?.csrf || req.get('x-csrf');
  return cookieToken && bodyToken && cookieToken === bodyToken;
}

function requireCsrf(req, res, next) {
  if (!verifyCsrf(req)) {
    return res.status(403).json({ ok: false, out: 'CSRF token validation failed' });
  }
  next();
}

module.exports = {
  setupSecurity,
  issueCsrf,
  verifyCsrf,
  requireCsrf
};
