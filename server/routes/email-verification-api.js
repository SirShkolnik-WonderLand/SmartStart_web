const express = require('express');
const { PrismaClient } = require('@prisma/client');
const emailService = require('../services/email-service');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw `SELECT 1`;
    res.json({
      status: 'healthy',
      service: 'email-verification-api',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      service: 'email-verification-api',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Send verification email
 */
router.post('/send-verification', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    
    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { account: true }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (user.account?.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email already verified'
      });
    }
    
    // Generate verification token
    const token = emailService.generateVerificationToken(userId, user.account.email);
    
    // Send verification email
    await emailService.sendVerificationEmail(user.account.email, token);
    
    res.json({
      success: true,
      message: 'Verification email sent successfully'
    });
    
  } catch (error) {
    console.error('Error sending verification email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send verification email'
    });
  }
});

/**
 * Verify email with token
 */
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }
    
    // Verify token
    const verification = emailService.verifyToken(token);
    
    if (!verification.valid) {
      return res.status(400).json({
        success: false,
        message: verification.error
      });
    }
    
    // Update user's email verification status
    await prisma.account.update({
      where: { userId: verification.userId },
      data: { emailVerified: true }
    });
    
    // Send welcome email
    const user = await prisma.user.findUnique({
      where: { id: verification.userId }
    });
    
    if (user) {
      await emailService.sendWelcomeEmail(verification.email, user.name);
    }
    
    res.json({
      success: true,
      message: 'Email verified successfully'
    });
    
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify email'
    });
  }
});

/**
 * Check email verification status
 */
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    
    const account = await prisma.account.findUnique({
      where: { userId },
      select: { emailVerified: true }
    });
    
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }
    
    res.json({
      success: true,
      emailVerified: account.emailVerified
    });
    
  } catch (error) {
    console.error('Error checking email verification status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check verification status'
    });
  }
});

/**
 * Resend verification email
 */
router.post('/resend', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    
    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { account: true }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (user.account?.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email already verified'
      });
    }
    
    // Generate new verification token
    const token = emailService.generateVerificationToken(userId, user.account.email);
    
    // Send verification email
    await emailService.sendVerificationEmail(user.account.email, token);
    
    res.json({
      success: true,
      message: 'Verification email resent successfully'
    });
    
  } catch (error) {
    console.error('Error resending verification email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend verification email'
    });
  }
});

module.exports = router;
