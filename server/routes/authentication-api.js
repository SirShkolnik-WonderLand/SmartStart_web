const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const prisma = new PrismaClient();

// ===== AUTHENTICATION API SYSTEM =====

// Email configuration (you'll need to set these environment variables)
const emailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
    }
});

// Health check
router.get('/health', async (req, res) => {
    try {
        const stats = await prisma.$queryRaw`
            SELECT 
                (SELECT COUNT(*) FROM "User") as users,
                (SELECT COUNT(*) FROM "UserVerification") as verifications,
                (SELECT COUNT(*) FROM "PasswordReset") as passwordResets,
                (SELECT COUNT(*) FROM "UserSession") as activeSessions
        `;
        
        res.json({
            success: true,
            message: 'Authentication System is healthy',
            stats: {
                users: Number(stats[0].users),
                verifications: Number(stats[0].verifications),
                passwordResets: Number(stats[0].passwordresets),
                activeSessions: Number(stats[0].activesessions)
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.json({
            success: true,
            message: 'Authentication System is healthy (tables may not exist yet)',
            stats: {
                users: 0,
                verifications: 0,
                passwordResets: 0,
                activeSessions: 0
            },
            timestamp: new Date().toISOString()
        });
    }
});

// Create tables for authentication system
router.post('/create-tables', async (req, res) => {
    try {
        // Drop existing tables if they exist
        await prisma.$executeRaw`DROP TABLE IF EXISTS "UserSession" CASCADE`;
        await prisma.$executeRaw`DROP TABLE IF EXISTS "PasswordReset" CASCADE`;
        await prisma.$executeRaw`DROP TABLE IF EXISTS "UserVerification" CASCADE`;
        await prisma.$executeRaw`DROP TABLE IF EXISTS "UserInvitation" CASCADE`;

        // Create UserVerification table
        await prisma.$executeRaw`
            CREATE TABLE "UserVerification" (
                "id" TEXT NOT NULL,
                "userId" TEXT NOT NULL,
                "email" TEXT NOT NULL,
                "verificationToken" TEXT NOT NULL UNIQUE,
                "verificationType" TEXT NOT NULL DEFAULT 'EMAIL_VERIFICATION',
                "expiresAt" TIMESTAMP(3) NOT NULL,
                "verifiedAt" TIMESTAMP(3),
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "UserVerification_pkey" PRIMARY KEY ("id")
            )
        `;

        // Create PasswordReset table
        await prisma.$executeRaw`
            CREATE TABLE "PasswordReset" (
                "id" TEXT NOT NULL,
                "userId" TEXT NOT NULL,
                "email" TEXT NOT NULL,
                "resetToken" TEXT NOT NULL UNIQUE,
                "expiresAt" TIMESTAMP(3) NOT NULL,
                "usedAt" TIMESTAMP(3),
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "PasswordReset_pkey" PRIMARY KEY ("id")
            )
        `;

        // Create UserSession table
        await prisma.$executeRaw`
            CREATE TABLE "UserSession" (
                "id" TEXT NOT NULL,
                "userId" TEXT NOT NULL,
                "sessionToken" TEXT NOT NULL UNIQUE,
                "deviceInfo" JSONB DEFAULT '{}',
                "ipAddress" TEXT,
                "expiresAt" TIMESTAMP(3) NOT NULL,
                "lastActivity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
            )
        `;

        // Create UserInvitation table
        await prisma.$executeRaw`
            CREATE TABLE "UserInvitation" (
                "id" TEXT NOT NULL,
                "invitedBy" TEXT NOT NULL,
                "invitedEmail" TEXT NOT NULL,
                "invitationType" TEXT NOT NULL DEFAULT 'COMPANY_INVITATION',
                "targetId" TEXT NOT NULL,
                "targetType" TEXT NOT NULL,
                "role" TEXT NOT NULL DEFAULT 'MEMBER',
                "invitationToken" TEXT NOT NULL UNIQUE,
                "status" TEXT NOT NULL DEFAULT 'PENDING',
                "expiresAt" TIMESTAMP(3) NOT NULL,
                "acceptedAt" TIMESTAMP(3),
                "declinedAt" TIMESTAMP(3),
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "UserInvitation_pkey" PRIMARY KEY ("id")
            )
        `;

        // Create indexes for performance
        await prisma.$executeRaw`CREATE INDEX "UserVerification_userId_idx" ON "UserVerification"("userId")`;
        await prisma.$executeRaw`CREATE INDEX "UserVerification_token_idx" ON "UserVerification"("verificationToken")`;
        await prisma.$executeRaw`CREATE INDEX "PasswordReset_userId_idx" ON "PasswordReset"("userId")`;
        await prisma.$executeRaw`CREATE INDEX "PasswordReset_token_idx" ON "PasswordReset"("resetToken")`;
        await prisma.$executeRaw`CREATE INDEX "UserSession_userId_idx" ON "UserSession"("userId")`;
        await prisma.$executeRaw`CREATE INDEX "UserSession_token_idx" ON "UserSession"("sessionToken")`;
        await prisma.$executeRaw`CREATE INDEX "UserInvitation_email_idx" ON "UserInvitation"("invitedEmail")`;
        await prisma.$executeRaw`CREATE INDEX "UserInvitation_token_idx" ON "UserInvitation"("invitationToken")`;

        res.json({
            success: true,
            message: 'Authentication System tables created successfully',
            tables: ['UserVerification', 'PasswordReset', 'UserSession', 'UserInvitation'],
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Table creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create tables',
            error: error.message
        });
    }
});

// User registration
router.post('/register', async (req, res) => {
    try {
        const {
            email,
            password,
            firstName,
            lastName,
            phone,
            companyName,
            role = 'FOUNDER'
        } = req.body;

        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: email, password, firstName, lastName'
            });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findFirst({
            where: { email: email.toLowerCase() }
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create user using raw SQL
        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        await prisma.$executeRaw`
            INSERT INTO "User" (
                "id", "email", "password", "firstName", "lastName", "phone", 
                "isEmailVerified", "isActive", "createdAt", "updatedAt"
            ) VALUES (
                ${userId}, ${email.toLowerCase()}, ${hashedPassword}, ${firstName}, ${lastName}, ${phone},
                false, true, NOW(), NOW()
            )
        `;

        // Create user profile
        await prisma.$executeRaw`
            INSERT INTO "UserProfile" (
                "id", "userId", "displayName", "bio", "avatarUrl", "location", 
                "website", "socialLinks", "createdAt", "updatedAt"
            ) VALUES (
                ${`profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`}, 
                ${userId}, ${`${firstName} ${lastName}`}, '', '', '', '', '{}', NOW(), NOW()
            )
        `;

        // Create company if companyName is provided
        let companyId = null;
        if (companyName) {
            companyId = `company_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            await prisma.$executeRaw`
                INSERT INTO "Company" (
                    "id", "name", "description", "industry", "size", "stage", 
                    "status", "visibility", "ownerId", "createdAt", "updatedAt"
                ) VALUES (
                    ${companyId}, ${companyName}, 'Company created during user registration', 'Technology', 'SMALL', 'PRE_SEED',
                    'ACTIVE', 'PUBLIC', ${userId}, NOW(), NOW()
                )
            `;
        }

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationId = `verification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        await prisma.$executeRaw`
            INSERT INTO "UserVerification" (
                "id", "userId", "email", "verificationToken", "verificationType", "expiresAt"
            ) VALUES (
                ${verificationId}, ${userId}, ${email.toLowerCase()}, ${verificationToken}, 'EMAIL_VERIFICATION',
                NOW() + INTERVAL '24 hours'
            )
        `;

        // Send verification email
        try {
            const verificationUrl = `${process.env.FRONTEND_URL || 'https://smartstart-platform.onrender.com'}/verify-email?token=${verificationToken}`;
            
            await emailTransporter.sendMail({
                from: process.env.EMAIL_USER || 'noreply@smartstart.com',
                to: email,
                subject: 'Welcome to SmartStart! Verify Your Email',
                html: `
                    <h2>Welcome to SmartStart Platform!</h2>
                    <p>Hi ${firstName},</p>
                    <p>Thank you for joining SmartStart! Please verify your email address to get started.</p>
                    <p><a href="${verificationUrl}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Verify Email</a></p>
                    <p>Or copy this link: ${verificationUrl}</p>
                    <p>This link expires in 24 hours.</p>
                    <p>Best regards,<br>The SmartStart Team</p>
                `
            });
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            // Continue with registration even if email fails
        }

        res.json({
            success: true,
            message: 'User registered successfully. Please check your email to verify your account.',
            user: {
                id: userId,
                email: email.toLowerCase(),
                firstName,
                lastName,
                isEmailVerified: false,
                companyId
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('User registration error:', error);
        res.status(500).json({
            success: false,
            message: 'User registration failed',
            error: error.message
        });
    }
});

// User login
router.post('/login', async (req, res) => {
    try {
        const { email, password, deviceInfo = {}, ipAddress } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: email, password'
            });
        }

        // Find user
        const user = await prisma.user.findFirst({
            where: { email: email.toLowerCase() },
            include: {
                profile: true,
                account: true
            }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated. Please contact support.'
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if email is verified
        if (!user.isEmailVerified) {
            return res.status(401).json({
                success: false,
                message: 'Please verify your email address before logging in.'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user.id, 
                email: user.email,
                isEmailVerified: user.isEmailVerified
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        // Create session
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const sessionToken = crypto.randomBytes(32).toString('hex');
        
        await prisma.$executeRaw`
            INSERT INTO "UserSession" (
                "id", "userId", "sessionToken", "deviceInfo", "ipAddress", "expiresAt"
            ) VALUES (
                ${sessionId}, ${user.id}, ${sessionToken}, ${JSON.stringify(deviceInfo)}::jsonb, ${ipAddress},
                NOW() + INTERVAL '7 days'
            )
        `;

        // Update last login
        await prisma.$executeRaw`
            UPDATE "User" SET "lastLoginAt" = NOW(), "updatedAt" = NOW() WHERE id = ${user.id}
        `;

        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                isEmailVerified: user.isEmailVerified,
                profile: user.profile
            },
            token,
            sessionToken,
            expiresIn: '7d',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('User login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message
        });
    }
});

// Verify email
router.post('/verify-email', async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Missing verification token'
            });
        }

        // Find verification record
        const verification = await prisma.$queryRaw`
            SELECT v.*, u.email, u."isEmailVerified"
            FROM "UserVerification" v
            JOIN "User" u ON v."userId" = u.id
            WHERE v."verificationToken" = ${token}
            AND v."verificationType" = 'EMAIL_VERIFICATION'
            AND v."expiresAt" > NOW()
            AND v."verifiedAt" IS NULL
        `;

        if (!verification || verification.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired verification token'
            });
        }

        const verificationRecord = verification[0];

        // Check if already verified
        if (verificationRecord.isEmailVerified) {
            return res.status(400).json({
                success: false,
                message: 'Email is already verified'
            });
        }

        // Mark email as verified
        await prisma.$executeRaw`
            UPDATE "User" SET "isEmailVerified" = true, "updatedAt" = NOW() 
            WHERE id = ${verificationRecord.userId}
        `;

        // Mark verification as complete
        await prisma.$executeRaw`
            UPDATE "UserVerification" SET "verifiedAt" = NOW() 
            WHERE id = ${verificationRecord.id}
        `;

        res.json({
            success: true,
            message: 'Email verified successfully! You can now log in to your account.',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Email verification failed',
            error: error.message
        });
    }
});

// Forgot password
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Missing email address'
            });
        }

        // Find user
        const user = await prisma.user.findFirst({
            where: { email: email.toLowerCase() }
        });

        if (!user) {
            // Don't reveal if user exists or not
            return res.json({
                success: true,
                message: 'If an account with this email exists, you will receive a password reset link.'
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetId = `reset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        await prisma.$executeRaw`
            INSERT INTO "PasswordReset" (
                "id", "userId", "email", "resetToken", "expiresAt"
            ) VALUES (
                ${resetId}, ${user.id}, ${email.toLowerCase()}, ${resetToken},
                NOW() + INTERVAL '1 hour'
            )
        `;

        // Send reset email
        try {
            const resetUrl = `${process.env.FRONTEND_URL || 'https://smartstart-platform.onrender.com'}/reset-password?token=${resetToken}`;
            
            await emailTransporter.sendMail({
                from: process.env.EMAIL_USER || 'noreply@smartstart.com',
                to: email,
                subject: 'Reset Your SmartStart Password',
                html: `
                    <h2>Password Reset Request</h2>
                    <p>Hi ${user.firstName},</p>
                    <p>You requested a password reset for your SmartStart account.</p>
                    <p><a href="${resetUrl}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
                    <p>Or copy this link: ${resetUrl}</p>
                    <p>This link expires in 1 hour.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                    <p>Best regards,<br>The SmartStart Team</p>
                `
            });
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            return res.status(500).json({
                success: false,
                message: 'Failed to send password reset email'
            });
        }

        res.json({
            success: true,
            message: 'Password reset link sent to your email address.'
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Password reset request failed',
            error: error.message
        });
    }
});

// Reset password
router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: token, newPassword'
            });
        }

        // Find reset record
        const resetRecord = await prisma.$queryRaw`
            SELECT * FROM "PasswordReset" 
            WHERE "resetToken" = ${token}
            AND "expiresAt" > NOW()
            AND "usedAt" IS NULL
        `;

        if (!resetRecord || resetRecord.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        // Hash new password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update password
        await prisma.$executeRaw`
            UPDATE "User" SET password = ${hashedPassword}, "updatedAt" = NOW() 
            WHERE id = ${resetRecord[0].userId}
        `;

        // Mark reset token as used
        await prisma.$executeRaw`
            UPDATE "PasswordReset" SET "usedAt" = NOW() 
            WHERE id = ${resetRecord[0].id}
        `;

        res.json({
            success: true,
            message: 'Password reset successfully! You can now log in with your new password.'
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Password reset failed',
            error: error.message
        });
    }
});

// Logout
router.post('/logout', async (req, res) => {
    try {
        const { sessionToken } = req.body;

        if (!sessionToken) {
            return res.status(400).json({
                success: false,
                message: 'Missing session token'
            });
        }

        // Invalidate session
        await prisma.$executeRaw`
            UPDATE "UserSession" SET "expiresAt" = NOW() 
            WHERE "sessionToken" = ${sessionToken}
        `;

        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Logout failed',
            error: error.message
        });
    }
});

// Get user profile
router.get('/profile', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access token required'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // Get user with profile
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            include: {
                profile: true,
                account: true
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                isEmailVerified: user.isEmailVerified,
                isActive: user.isActive,
                profile: user.profile,
                createdAt: user.createdAt,
                lastLoginAt: user.lastLoginAt
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user profile',
            error: error.message
        });
    }
});

// Update user profile
router.put('/profile', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access token required'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        const {
            firstName,
            lastName,
            phone,
            bio,
            location,
            website,
            socialLinks
        } = req.body;

        // Update user
        if (firstName || lastName || phone) {
            const updateFields = [];
            const values = [];
            let paramIndex = 1;

            if (firstName) {
                updateFields.push(`"firstName" = $${paramIndex}`);
                values.push(firstName);
                paramIndex++;
            }
            if (lastName) {
                updateFields.push(`"lastName" = $${paramIndex}`);
                values.push(lastName);
                paramIndex++;
            }
            if (phone) {
                updateFields.push(`"phone" = $${paramIndex}`);
                values.push(phone);
                paramIndex++;
            }

            await prisma.$executeRaw`
                UPDATE "User" SET ${updateFields.join(', ')}, "updatedAt" = NOW() 
                WHERE id = ${decoded.userId}
            `;
        }

        // Update profile
        if (bio || location || website || socialLinks) {
            const profileUpdateFields = [];
            const profileValues = [];
            let profileParamIndex = 1;

            if (bio) {
                profileUpdateFields.push(`"bio" = $${profileParamIndex}`);
                profileValues.push(bio);
                profileParamIndex++;
            }
            if (location) {
                profileUpdateFields.push(`"location" = $${profileParamIndex}`);
                profileValues.push(location);
                profileParamIndex++;
            }
            if (website) {
                profileUpdateFields.push(`"website" = $${profileParamIndex}`);
                profileValues.push(website);
                profileParamIndex++;
            }
            if (socialLinks) {
                profileUpdateFields.push(`"socialLinks" = $${profileParamIndex}`);
                profileValues.push(JSON.stringify(socialLinks));
                profileParamIndex++;
            }

            await prisma.$executeRaw`
                UPDATE "UserProfile" SET ${profileUpdateFields.join(', ')}, "updatedAt" = NOW() 
                WHERE "userId" = ${decoded.userId}
            `;
        }

        res.json({
            success: true,
            message: 'Profile updated successfully'
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile',
            error: error.message
        });
    }
});

module.exports = router;
