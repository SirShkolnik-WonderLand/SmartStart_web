const crypto = require('crypto');

class EmailService {
  constructor() {
    this.verificationTokens = new Map(); // In production, use Redis or database
  }

  /**
   * Generate email verification token
   */
  generateVerificationToken(userId, email) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    this.verificationTokens.set(token, {
      userId,
      email,
      expiresAt,
      used: false
    });
    
    return token;
  }

  /**
   * Verify email token
   */
  verifyToken(token) {
    const tokenData = this.verificationTokens.get(token);
    
    if (!tokenData) {
      return { valid: false, error: 'Invalid token' };
    }
    
    if (tokenData.used) {
      return { valid: false, error: 'Token already used' };
    }
    
    if (new Date() > tokenData.expiresAt) {
      return { valid: false, error: 'Token expired' };
    }
    
    // Mark token as used
    tokenData.used = true;
    this.verificationTokens.set(token, tokenData);
    
    return { 
      valid: true, 
      userId: tokenData.userId, 
      email: tokenData.email 
    };
  }

  /**
   * Send verification email (simple logging for now)
   */
  async sendVerificationEmail(email, token) {
    const verificationUrl = `${process.env.FRONTEND_URL || 'https://smartstart-frontend.onrender.com'}/verify-email?token=${token}`;
    
    // For now, just log the email (in production, use SendGrid, AWS SES, etc.)
    console.log('📧 EMAIL VERIFICATION:');
    console.log(`To: ${email}`);
    console.log(`Subject: Verify your SmartStart account`);
    console.log(`Verification URL: ${verificationUrl}`);
    console.log('---');
    
    // In production, you would send actual email here:
    // await this.sendActualEmail(email, 'Verify your SmartStart account', verificationUrl);
    
    return { success: true, message: 'Verification email sent (logged to console)' };
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(email, name) {
    console.log('📧 WELCOME EMAIL:');
    console.log(`To: ${email}`);
    console.log(`Subject: Welcome to SmartStart, ${name}!`);
    console.log(`Message: Welcome to SmartStart! Your account is now active.`);
    console.log('---');
    
    return { success: true, message: 'Welcome email sent (logged to console)' };
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email, token) {
    const resetUrl = `${process.env.FRONTEND_URL || 'https://smartstart-frontend.onrender.com'}/reset-password?token=${token}`;
    
    console.log('📧 PASSWORD RESET EMAIL:');
    console.log(`To: ${email}`);
    console.log(`Subject: Reset your SmartStart password`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log('---');
    
    return { success: true, message: 'Password reset email sent (logged to console)' };
  }

  /**
   * Clean up expired tokens (call this periodically)
   */
  cleanupExpiredTokens() {
    const now = new Date();
    for (const [token, data] of this.verificationTokens.entries()) {
      if (now > data.expiresAt) {
        this.verificationTokens.delete(token);
      }
    }
  }
}

// Singleton instance
const emailService = new EmailService();

// Clean up expired tokens every hour
setInterval(() => {
  emailService.cleanupExpiredTokens();
}, 60 * 60 * 1000);

module.exports = emailService;
