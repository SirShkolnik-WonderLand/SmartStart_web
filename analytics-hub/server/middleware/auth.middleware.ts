/**
 * AUTHENTICATION MIDDLEWARE
 * Protect admin routes with JWT verification
 */

import type { Request, Response, NextFunction } from 'express';
import { verifyToken, extractToken, type JWTPayload } from '../config/auth.js';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Verify JWT token and attach user to request
 */
export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const token = extractToken(req.headers.authorization);

  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Authentication required',
      code: 'NO_TOKEN',
    });
    return;
  }

  const payload = verifyToken(token);

  if (!payload) {
    res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
      code: 'INVALID_TOKEN',
    });
    return;
  }

  // Attach user to request
  req.user = payload;
  next();
}

/**
 * Require specific role(s)
 */
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'NO_USER',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        code: 'FORBIDDEN',
        required: roles,
        current: req.user.role,
      });
      return;
    }

    next();
  };
}

/**
 * Optional authentication (user attached if token is valid, but not required)
 */
export function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const token = extractToken(req.headers.authorization);

  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      req.user = payload;
    }
  }

  next();
}
