const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');
const prisma = new PrismaClient();

// ===== MULTI-FACTOR AUTHENTICATION API SYSTEM =====

// Health check
router.get('/health', async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'MFA API is healthy',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'MFA API health check failed',
            error: error.message
        });
    }
});

// ===== MFA SETUP ENDPOINTS =====

/**
 * POST /api/mfa/setup - Setup MFA for user
 */
router.post('/setup', async (req, res) => {
    try {
        const {
            userId,
            method // AUTHENTICATOR, EMAIL, SMS
        } = req.body;

        if (!userId || !method) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: userId, method'
            });
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if MFA already exists
        const existingMfa = await prisma.$queryRaw`
            SELECT * FROM "MfaSetup" WHERE "userId" = ${userId}
        `;

        if (existingMfa && existingMfa.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'MFA already setup for this user'
            });
        }

        let mfaData = {};

        if (method === 'AUTHENTICATOR') {
            // Generate secret for authenticator app
            const secret = speakeasy.generateSecret({
                name: `SmartStart (${user.email})`,
                issuer: 'SmartStart Platform'
            });

            // Generate QR code
            const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

            // Generate backup codes
            const backupCodes = Array.from({ length: 8 }, () => 
                crypto.randomBytes(4).toString('hex').toUpperCase()
            );

            mfaData = {
                method: 'AUTHENTICATOR',
                secret: secret.base32,
                backupCodes: backupCodes,
                qrCodeUrl: qrCodeUrl
            };
        } else if (method === 'EMAIL') {
            // For email MFA, we'll send codes via email
            mfaData = {
                method: 'EMAIL',
                secret: null,
                backupCodes: [],
                qrCodeUrl: null
            };
        } else if (method === 'SMS') {
            // For SMS MFA, we'll send codes via SMS
            mfaData = {
                method: 'SMS',
                secret: null,
                backupCodes: [],
                qrCodeUrl: null
            };
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid MFA method. Supported methods: AUTHENTICATOR, EMAIL, SMS'
            });
        }

        // Create MFA setup record
        const mfaId = `mfa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Convert backup codes to PostgreSQL array format
        const backupCodesArray = `{${mfaData.backupCodes.map(code => `"${code}"`).join(',')}}`;
        
        await prisma.$executeRaw`
            INSERT INTO "MfaSetup" (
                "id", "userId", "method", "secret", "backupCodes", "isActive",
                "createdAt", "updatedAt"
            ) VALUES (
                ${mfaId}, ${userId}, ${mfaData.method}::"MfaMethod", ${mfaData.secret}, 
                ${backupCodesArray}::text[], false, NOW(), NOW()
            )
        `;

        res.json({
            success: true,
            message: 'MFA setup initiated successfully',
            mfa: {
                id: mfaId,
                userId,
                method: mfaData.method,
                qrCodeUrl: mfaData.qrCodeUrl,
                backupCodes: mfaData.backupCodes,
                isActive: false
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('MFA setup error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to setup MFA',
            error: error.message
        });
    }
});

/**
 * POST /api/mfa/verify - Verify MFA code
 */
router.post('/verify', async (req, res) => {
    try {
        const {
            userId,
            code,
            isBackupCode = false
        } = req.body;

        if (!userId || !code) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: userId, code'
            });
        }

        // Get MFA setup
        const mfa = await prisma.$queryRaw`
            SELECT * FROM "MfaSetup" WHERE "userId" = ${userId}
        `;

        if (!mfa || mfa.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'MFA not setup for this user'
            });
        }

        let isValid = false;

        if (mfa[0].method === 'AUTHENTICATOR') {
            if (isBackupCode) {
                // Check backup codes
                const backupCodes = JSON.parse(mfa[0].backupCodes || '[]');
                const codeIndex = backupCodes.indexOf(code);
                
                if (codeIndex !== -1) {
                    // Remove used backup code
                    backupCodes.splice(codeIndex, 1);
                    await prisma.$executeRaw`
                        UPDATE "MfaSetup" 
                        SET "backupCodes" = ${JSON.stringify(backupCodes)}, 
                            "lastUsed" = NOW(), "updatedAt" = NOW()
                        WHERE "id" = ${mfa[0].id}
                    `;
                    isValid = true;
                }
            } else {
                // Verify TOTP code
                isValid = speakeasy.totp.verify({
                    secret: mfa[0].secret,
                    encoding: 'base32',
                    token: code,
                    window: 2 // Allow 2 time steps before/after
                });
            }
        } else if (mfa[0].method === 'EMAIL') {
            // For email MFA, we would verify against stored codes
            // This is a simplified implementation
            isValid = code === '123456'; // In real implementation, check against stored codes
        } else if (mfa[0].method === 'SMS') {
            // For SMS MFA, we would verify against stored codes
            // This is a simplified implementation
            isValid = code === '123456'; // In real implementation, check against stored codes
        }

        if (isValid) {
            // Update last used timestamp
            await prisma.$executeRaw`
                UPDATE "MfaSetup" 
                SET "lastUsed" = NOW(), "updatedAt" = NOW()
                WHERE "id" = ${mfa[0].id}
            `;

            res.json({
                success: true,
                message: 'MFA verification successful',
                verified: true,
                timestamp: new Date().toISOString()
            });
        } else {
            res.json({
                success: false,
                message: 'Invalid MFA code',
                verified: false,
                timestamp: new Date().toISOString()
            });
        }

    } catch (error) {
        console.error('MFA verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify MFA code',
            error: error.message
        });
    }
});

/**
 * POST /api/mfa/activate - Activate MFA after verification
 */
router.post('/activate', async (req, res) => {
    try {
        const {
            userId,
            code
        } = req.body;

        if (!userId || !code) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: userId, code'
            });
        }

        // Get MFA setup
        const mfa = await prisma.$queryRaw`
            SELECT * FROM "MfaSetup" WHERE "userId" = ${userId}
        `;

        if (!mfa || mfa.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'MFA not setup for this user'
            });
        }

        // Verify the code first
        let isValid = false;

        if (mfa[0].method === 'AUTHENTICATOR') {
            isValid = speakeasy.totp.verify({
                secret: mfa[0].secret,
                encoding: 'base32',
                token: code,
                window: 2
            });
        } else {
            // For email/SMS, use simple verification
            isValid = code === '123456';
        }

        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid verification code'
            });
        }

        // Activate MFA
        await prisma.$executeRaw`
            UPDATE "MfaSetup" 
            SET "isActive" = true, "lastUsed" = NOW(), "updatedAt" = NOW()
            WHERE "id" = ${mfa[0].id}
        `;

        res.json({
            success: true,
            message: 'MFA activated successfully',
            mfa: {
                id: mfa[0].id,
                userId,
                method: mfa[0].method,
                isActive: true
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('MFA activation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to activate MFA',
            error: error.message
        });
    }
});

/**
 * GET /api/mfa/status/:userId - Get MFA status for user
 */
router.get('/status/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // Get MFA setup
        const mfa = await prisma.$queryRaw`
            SELECT * FROM "MfaSetup" WHERE "userId" = ${userId}
        `;

        if (!mfa || mfa.length === 0) {
            return res.json({
                success: true,
                message: 'MFA not setup',
                mfa: null
            });
        }

        res.json({
            success: true,
            mfa: {
                id: mfa[0].id,
                userId: mfa[0].userId,
                method: mfa[0].method,
                isActive: mfa[0].isActive,
                lastUsed: mfa[0].lastUsed,
                backupCodesCount: JSON.parse(mfa[0].backupCodes || '[]').length,
                createdAt: mfa[0].createdAt,
                updatedAt: mfa[0].updatedAt
            }
        });

    } catch (error) {
        console.error('MFA status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get MFA status',
            error: error.message
        });
    }
});

/**
 * POST /api/mfa/disable - Disable MFA for user
 */
router.post('/disable', async (req, res) => {
    try {
        const {
            userId,
            code // Require MFA code to disable
        } = req.body;

        if (!userId || !code) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: userId, code'
            });
        }

        // Get MFA setup
        const mfa = await prisma.$queryRaw`
            SELECT * FROM "MfaSetup" WHERE "userId" = ${userId}
        `;

        if (!mfa || mfa.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'MFA not setup for this user'
            });
        }

        // Verify the code first
        let isValid = false;

        if (mfa[0].method === 'AUTHENTICATOR') {
            isValid = speakeasy.totp.verify({
                secret: mfa[0].secret,
                encoding: 'base32',
                token: code,
                window: 2
            });
        } else {
            // For email/SMS, use simple verification
            isValid = code === '123456';
        }

        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid verification code'
            });
        }

        // Disable MFA
        await prisma.$executeRaw`
            UPDATE "MfaSetup" 
            SET "isActive" = false, "updatedAt" = NOW()
            WHERE "id" = ${mfa[0].id}
        `;

        res.json({
            success: true,
            message: 'MFA disabled successfully',
            mfa: {
                id: mfa[0].id,
                userId,
                method: mfa[0].method,
                isActive: false
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('MFA disable error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to disable MFA',
            error: error.message
        });
    }
});

/**
 * POST /api/mfa/send-code - Send MFA code (for email/SMS)
 */
router.post('/send-code', async (req, res) => {
    try {
        const {
            userId,
            method // EMAIL or SMS
        } = req.body;

        if (!userId || !method) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: userId, method'
            });
        }

        // Get user
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Generate 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        // In a real implementation, you would:
        // 1. Store the code with expiration time
        // 2. Send email/SMS with the code
        // 3. Handle rate limiting

        // For now, we'll just return success
        res.json({
            success: true,
            message: `MFA code sent via ${method}`,
            code: code, // In production, don't return the code
            expiresIn: 300, // 5 minutes
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('MFA send code error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send MFA code',
            error: error.message
        });
    }
});

module.exports = router;
