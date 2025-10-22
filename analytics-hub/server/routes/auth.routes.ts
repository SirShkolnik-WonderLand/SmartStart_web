/**
 * AUTHENTICATION ROUTES
 * Login, logout, token refresh
 */

import { Router, type Request, Response } from 'express';
import { findUserByEmail, updateUser } from '../services/authService.simple.js';
import {
  verifyPassword,
  generateToken,
  refreshToken as refreshJWT,
  checkLoginAllowed,
  recordFailedLogin,
  recordSuccessfulLogin,
} from '../config/auth.js';
import type { LoginRequest, LoginResponse } from '../../shared/types.js';

const router = Router();

/**
 * GET /api/admin/debug
 * Debug endpoint to check admin user (temporary)
 */
router.get('/debug', async (req: Request, res: Response) => {
  try {
    const user = await findUserByEmail('udi.shkolnik@alicesolutionsgroup.com');
    const allUsers = await import('../config/database.simple.js').then(m => m.db.read('users'));
    
    return res.status(200).json({
      success: true,
      adminUser: user,
      allUsers: allUsers,
      env: {
        ADMIN_EMAIL: process.env.ADMIN_EMAIL,
        ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ? '***' : 'NOT_SET',
      }
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/admin/login
 * Admin login endpoint
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password }: LoginRequest = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

    const clientIP = req.ip || '';

    // Check if login is allowed (rate limiting)
    const loginCheck = checkLoginAllowed(email);
    if (!loginCheck.allowed) {
      return res.status(429).json({
        success: false,
        error: 'Too many login attempts',
        lockedUntil: loginCheck.lockedUntil,
      });
    }

    // Find user by email
    const user = await findUserByEmail(email);

    if (!user) {
      recordFailedLogin(email);
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    // Check if user is active
    if (!user.active) {
      return res.status(403).json({
        success: false,
        error: 'Account is disabled',
      });
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return res.status(403).json({
        success: false,
        error: 'Account is temporarily locked',
        lockedUntil: user.lockedUntil,
      });
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);

    if (!isValid) {
      // Record failed login
      recordFailedLogin(email);

      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
        remainingAttempts: loginCheck.remainingAttempts,
      });
    }

    // Successful login!
    recordSuccessfulLogin(email);

    // Update user login info
    await updateUser(user.id, {
      lastLogin: new Date().toISOString(),
      lastLoginIp: clientIP,
      loginCount: user.loginCount + 1,
    });

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const response: LoginResponse = {
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name || undefined,
        role: user.role as any,
        canExport: user.canExport,
        canEditGoals: user.canEditGoals,
        canManageUsers: user.canManageUsers,
        lastLogin: user.lastLogin || undefined,
        loginCount: user.loginCount,
        active: user.active,
        emailVerified: user.emailVerified,
        twoFactorEnabled: user.twoFactorEnabled,
      },
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error in login:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * POST /api/admin/logout
 * Admin logout (client-side token removal, server-side optional blacklist)
 */
router.post('/logout', (req: Request, res: Response) => {
  try {
    // In a more advanced setup, you might want to blacklist the token
    // For now, client-side token removal is sufficient

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Error in logout:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * POST /api/admin/refresh
 * Refresh JWT token
 */
router.post('/refresh', (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token is required',
      });
    }

    const newToken = refreshJWT(token);

    if (!newToken) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
      });
    }

    return res.status(200).json({
      success: true,
      token: newToken,
    });
  } catch (error) {
    console.error('Error refreshing token:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;
