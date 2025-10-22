/**
 * AUTHENTICATION CONFIGURATION
 * JWT + bcrypt for admin authentication
 */

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import type { AdminUser } from '../../shared/types.js';

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-CHANGE-THIS';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// JWT payload interface
export interface JWTPayload {
  userId: number;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Hash password using SHA256 (simple for testing)
 */
export async function hashPassword(password: string): Promise<string> {
  return crypto.createHash('sha256').update(password).digest('hex');
}

/**
 * Verify password against hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  try {
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    return passwordHash === hash;
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

/**
 * Generate JWT token
 */
export function generateToken(user: Pick<AdminUser, 'id' | 'email' | 'role'>): string {
  const payload: JWTPayload = {
    userId: user.id!,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'analytics-hub',
    audience: 'analytics-admin',
  } as jwt.SignOptions);
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'analytics-hub',
      audience: 'analytics-admin',
    }) as JWTPayload;

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.warn('Token expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.warn('Invalid token');
    } else {
      console.error('Token verification error:', error);
    }
    return null;
  }
}

/**
 * Extract token from Authorization header
 */
export function extractToken(authHeader?: string): string | null {
  if (!authHeader) {
    return null;
  }

  // Format: "Bearer <token>"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

/**
 * Refresh token (issue new token with extended expiry)
 */
export function refreshToken(currentToken: string): string | null {
  const payload = verifyToken(currentToken);
  if (!payload) {
    return null;
  }

  // Issue new token with same payload but extended expiry
  return jwt.sign(
    {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'analytics-hub',
      audience: 'analytics-admin',
    } as jwt.SignOptions
  );
}

/**
 * Decode token without verification (useful for expired tokens)
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true;
  }

  return decoded.exp * 1000 < Date.now();
}

/**
 * Get token expiry time
 */
export function getTokenExpiry(token: string): Date | null {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return null;
  }

  return new Date(decoded.exp * 1000);
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Generate random password
 */
export function generateRandomPassword(length: number = 16): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  const all = lowercase + uppercase + numbers + special;

  let password = '';
  
  // Ensure at least one of each type
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }

  // Shuffle the password
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}

/**
 * Rate limiting for login attempts
 */
interface LoginAttempt {
  count: number;
  lastAttempt: number;
  lockedUntil?: number;
}

const loginAttempts = new Map<string, LoginAttempt>();

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION = 15 * 60 * 1000; // 15 minutes
const ATTEMPT_WINDOW = 15 * 60 * 1000; // 15 minutes

/**
 * Check if login is allowed for identifier (email or IP)
 */
export function checkLoginAllowed(identifier: string): {
  allowed: boolean;
  remainingAttempts?: number;
  lockedUntil?: Date;
} {
  const attempt = loginAttempts.get(identifier);
  const now = Date.now();

  if (!attempt) {
    return { allowed: true, remainingAttempts: MAX_LOGIN_ATTEMPTS };
  }

  // Check if locked
  if (attempt.lockedUntil && attempt.lockedUntil > now) {
    return {
      allowed: false,
      lockedUntil: new Date(attempt.lockedUntil),
    };
  }

  // Check if attempt window expired
  if (now - attempt.lastAttempt > ATTEMPT_WINDOW) {
    loginAttempts.delete(identifier);
    return { allowed: true, remainingAttempts: MAX_LOGIN_ATTEMPTS };
  }

  // Check if max attempts reached
  if (attempt.count >= MAX_LOGIN_ATTEMPTS) {
    const lockedUntil = now + LOCK_DURATION;
    loginAttempts.set(identifier, {
      ...attempt,
      lockedUntil,
    });
    return {
      allowed: false,
      lockedUntil: new Date(lockedUntil),
    };
  }

  return {
    allowed: true,
    remainingAttempts: MAX_LOGIN_ATTEMPTS - attempt.count,
  };
}

/**
 * Record failed login attempt
 */
export function recordFailedLogin(identifier: string): void {
  const attempt = loginAttempts.get(identifier);
  const now = Date.now();

  if (!attempt || now - attempt.lastAttempt > ATTEMPT_WINDOW) {
    loginAttempts.set(identifier, {
      count: 1,
      lastAttempt: now,
    });
  } else {
    loginAttempts.set(identifier, {
      count: attempt.count + 1,
      lastAttempt: now,
      lockedUntil: attempt.lockedUntil,
    });
  }
}

/**
 * Record successful login (clear attempts)
 */
export function recordSuccessfulLogin(identifier: string): void {
  loginAttempts.delete(identifier);
}

/**
 * Clear expired login attempts (cleanup)
 */
export function clearExpiredLoginAttempts(): void {
  const now = Date.now();
  for (const [identifier, attempt] of loginAttempts.entries()) {
    if (now - attempt.lastAttempt > ATTEMPT_WINDOW) {
      loginAttempts.delete(identifier);
    }
  }
}

// Run cleanup every 5 minutes
setInterval(clearExpiredLoginAttempts, 5 * 60 * 1000);
