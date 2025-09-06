const express = require('express');
const router = express.Router();
const authService = require('../services/auth-service');
const { authenticateToken, rateLimit } = require('../middleware/unified-auth');

// Rate limiting for auth endpoints
const authRateLimit = rateLimit(10, 15 * 60 * 1000); // 10 requests per 15 minutes

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', authRateLimit, async (req, res) => {
  try {
    const { email, password, name, firstName, lastName } = req.body;
    const deviceInfo = {
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    };

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
        code: 'MISSING_CREDENTIALS'
      });
    }

    const result = await authService.register({
      email,
      password,
      name: name || `${firstName || ''} ${lastName || ''}`.trim() || email.split('@')[0],
      firstName,
      lastName
    }, deviceInfo);

    if (!result.success) {
      return res.status(400).json(result);
    }

    // Set secure HTTP-only cookie
    res.cookie('auth-token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/'
    });

    res.json({
      success: true,
      message: 'Registration successful',
      user: result.user,
      sessionId: result.sessionId
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * POST /api/auth/login
 * Authenticate user with email and password
 */
router.post('/login', authRateLimit, async (req, res) => {
  try {
    const { email, password } = req.body;
    const deviceInfo = {
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    };

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
        code: 'MISSING_CREDENTIALS'
      });
    }

    const result = await authService.authenticate(email, password, deviceInfo);

    if (!result.success) {
      return res.status(401).json(result);
    }

    // Set secure HTTP-only cookie
    res.cookie('auth-token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/'
    });

    res.json({
      success: true,
      message: 'Login successful',
      user: result.user,
      token: result.token,
      sessionId: result.sessionId
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.',
      code: 'LOGIN_ERROR'
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout user and invalidate session
 */
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const success = await authService.invalidateSession(req.token);
    
    // Clear cookie
    res.clearCookie('auth-token', { path: '/' });

    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      code: 'LOGOUT_ERROR'
    });
  }
});

/**
 * GET /api/auth/me
 * Get current user information
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user information',
      code: 'USER_FETCH_ERROR'
    });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh JWT token
 */
router.post('/refresh', authenticateToken, async (req, res) => {
  try {
    // Get fresh user data
    const user = await authService.verifyToken(req.token);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }

    // Generate new token
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const account = await prisma.account.findUnique({
      where: { id: user.accountId },
      include: {
        user: true,
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true
              }
            }
          }
        }
      }
    });

    if (!account) {
      return res.status(401).json({
        success: false,
        message: 'Account not found',
        code: 'ACCOUNT_NOT_FOUND'
      });
    }

    const newToken = await authService.generateToken(account);
    
    // Update session with new token
    await prisma.session.updateMany({
      where: { token: req.token },
      data: { token: newToken }
    });

    // Set new cookie
    res.cookie('auth-token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/'
    });

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      token: newToken,
      user: user
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Token refresh failed',
      code: 'REFRESH_ERROR'
    });
  }
});

/**
 * POST /api/auth/logout-all
 * Logout from all devices
 */
router.post('/logout-all', authenticateToken, async (req, res) => {
  try {
    const success = await authService.invalidateAllSessions(req.user.accountId);
    
    // Clear cookie
    res.clearCookie('auth-token', { path: '/' });

    res.json({
      success: true,
      message: 'Logged out from all devices'
    });

  } catch (error) {
    console.error('Logout all error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      code: 'LOGOUT_ALL_ERROR'
    });
  }
});

/**
 * GET /api/auth/sessions
 * Get active sessions for current user
 */
router.get('/sessions', authenticateToken, async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const sessions = await prisma.session.findMany({
      where: { 
        accountId: req.user.accountId,
        expiresAt: { gt: new Date() }
      },
      select: {
        id: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
        lastUsed: true,
        expiresAt: true
      },
      orderBy: { lastUsed: 'desc' }
    });

    res.json({
      success: true,
      sessions: sessions
    });

  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get sessions',
      code: 'SESSIONS_FETCH_ERROR'
    });
  }
});

/**
 * DELETE /api/auth/sessions/:sessionId
 * Terminate specific session
 */
router.delete('/sessions/:sessionId', authenticateToken, async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const session = await prisma.session.findFirst({
      where: {
        id: req.params.sessionId,
        accountId: req.user.accountId
      }
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
        code: 'SESSION_NOT_FOUND'
      });
    }

    await prisma.session.delete({
      where: { id: session.id }
    });

    res.json({
      success: true,
      message: 'Session terminated'
    });

  } catch (error) {
    console.error('Terminate session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to terminate session',
      code: 'SESSION_TERMINATE_ERROR'
    });
  }
});

/**
 * GET /api/auth/health
 * Health check for authentication service
 */
router.get('/health', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Authentication service is healthy',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Authentication service health check failed',
      error: error.message
    });
  }
});

/**
 * POST /api/auth/seed
 * Seed the database with test users (development/staging only)
 */
router.post('/seed', async (req, res) => {
  try {
    // Only allow seeding in development or if explicitly enabled
    if (process.env.NODE_ENV === 'production' && !process.env.ALLOW_SEEDING) {
      return res.status(403).json({
        success: false,
        message: 'Seeding is not allowed in production',
        code: 'SEEDING_DISABLED'
      });
    }

    const { PrismaClient } = require('@prisma/client');
    const bcrypt = require('bcryptjs');
    const prisma = new PrismaClient();

    // Test users to create
    const testUsers = [
      {
        name: 'Admin User',
        email: 'admin@smartstart.com',
        password: 'admin123',
        roleName: 'SUPER_ADMIN',
        level: 'WISE_OWL',
        xp: 250
      },
      {
        name: 'Regular User',
        email: 'user@smartstart.com',
        password: 'user123',
        roleName: 'MEMBER',
        level: 'WISE_OWL',
        xp: 250
      },
      {
        name: 'Brian Johnson',
        email: 'brian@smartstart.com',
        password: 'brian123',
        roleName: 'MEMBER',
        level: 'WISE_OWL',
        xp: 180
      }
    ];

    const createdUsers = [];

    for (const userData of testUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (existingUser) {
        console.log(`User ${userData.email} already exists, skipping...`);
        createdUsers.push({
          email: userData.email,
          status: 'already_exists'
        });
        continue;
      }

      // Create user
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          name: userData.name,
          password: hashedPassword,
          xp: userData.xp,
          level: userData.level,
          status: 'ACTIVE',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      // Find or create role
      let role = await prisma.role.findUnique({
        where: { name: userData.roleName }
      });

      if (!role) {
        role = await prisma.role.create({
          data: {
            name: userData.roleName,
            description: `${userData.roleName} role`,
            level: 1,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
      }

      // Create account
      const account = await prisma.account.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          isActive: true,
          userId: user.id,
          roleId: role.id,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      createdUsers.push({
        email: userData.email,
        userId: user.id,
        accountId: account.id,
        status: 'created'
      });

      console.log(`Created user: ${userData.email}`);
    }

    res.json({
      success: true,
      message: 'Database seeded successfully',
      users: createdUsers,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Seeding error:', error);
    res.status(500).json({
      success: false,
      message: 'Seeding failed',
      error: error.message,
      code: 'SEEDING_ERROR'
    });
  }
});

module.exports = router;
