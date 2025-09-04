const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// Health check endpoint
router.get('/health', async(req, res) => {
    try {
        await prisma.$queryRaw `SELECT 1`;
        res.json({
            status: 'healthy',
            service: 'legal-pack-api',
            timestamp: new Date().toISOString(),
            database: 'connected'
        });
    } catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            service: 'legal-pack-api',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Get user's legal pack status
router.get('/status/:userId', async(req, res) => {
    try {
        const { userId } = req.params;

        const [legalPack, nda, consents] = await Promise.all([
            prisma.platformLegalPack.findFirst({
                where: { userId },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.platformNDA.findFirst({
                where: { userId },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.eSignatureConsent.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' }
            })
        ]);

        res.json({
            success: true,
            data: {
                legalPack: legalPack || null,
                nda: nda || null,
                consents: consents || [],
                isComplete: legalPack ? .status === 'SIGNED' &&
                    nda ? .status === 'SIGNED' &&
                    consents.length > 0
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch legal pack status',
            details: error.message
        });
    }
});

// Sign platform legal pack
router.post('/sign', async(req, res) => {
    try {
        const { userId, ipAddress, userAgent } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'Missing required field: userId'
            });
        }

        // Check if user already has a signed legal pack
        const existingLegalPack = await prisma.platformLegalPack.findFirst({
            where: {
                userId,
                status: 'SIGNED'
            }
        });

        if (existingLegalPack) {
            return res.status(400).json({
                success: false,
                error: 'User already has a signed legal pack'
            });
        }

        // Create new legal pack
        const legalPack = await prisma.platformLegalPack.create({
            data: {
                userId,
                status: 'SIGNED',
                signedAt: new Date(),
                expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
            }
        });

        res.status(201).json({
            success: true,
            data: legalPack,
            message: 'Platform legal pack signed successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to sign legal pack',
            details: error.message
        });
    }
});

// Sign platform NDA
router.post('/nda/sign', async(req, res) => {
    try {
        const { userId, ipAddress, userAgent } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'Missing required field: userId'
            });
        }

        // Check if user already has a signed NDA
        const existingNDA = await prisma.platformNDA.findFirst({
            where: {
                userId,
                status: 'SIGNED'
            }
        });

        if (existingNDA) {
            return res.status(400).json({
                success: false,
                error: 'User already has a signed NDA'
            });
        }

        // Create new NDA
        const nda = await prisma.platformNDA.create({
            data: {
                userId,
                status: 'SIGNED',
                signedAt: new Date(),
                expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
            }
        });

        res.status(201).json({
            success: true,
            data: nda,
            message: 'Platform NDA signed successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to sign NDA',
            details: error.message
        });
    }
});

// Grant e-signature consent
router.post('/consent', async(req, res) => {
    try {
        const { userId, consentType, ipAddress, userAgent } = req.body;

        if (!userId || !consentType) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: userId, consentType'
            });
        }

        // Check if user already has this consent type
        const existingConsent = await prisma.eSignatureConsent.findFirst({
            where: {
                userId,
                consentType,
                status: 'GRANTED'
            }
        });

        if (existingConsent) {
            return res.status(400).json({
                success: false,
                error: 'User already has this consent type'
            });
        }

        // Create new consent
        const consent = await prisma.eSignatureConsent.create({
            data: {
                userId,
                consentType,
                status: 'GRANTED',
                signedAt: new Date(),
                ipAddress,
                userAgent
            }
        });

        res.status(201).json({
            success: true,
            data: consent,
            message: 'E-signature consent granted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to grant consent',
            details: error.message
        });
    }
});

// Get user's consents
router.get('/consents/:userId', async(req, res) => {
    try {
        const { userId } = req.params;

        const consents = await prisma.eSignatureConsent.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            success: true,
            data: consents,
            count: consents.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch consents',
            details: error.message
        });
    }
});

// Revoke consent
router.patch('/consent/:consentId/revoke', async(req, res) => {
    try {
        const { consentId } = req.params;

        const consent = await prisma.eSignatureConsent.update({
            where: { id: consentId },
            data: { status: 'REVOKED' }
        });

        res.json({
            success: true,
            data: consent,
            message: 'Consent revoked successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to revoke consent',
            details: error.message
        });
    }
});

// Get all legal packs (admin)
router.get('/legal-packs', async(req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = status ? { status } : {};

        const [legalPacks, total] = await Promise.all([
            prisma.platformLegalPack.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            name: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(limit)
            }),
            prisma.platformLegalPack.count({ where })
        ]);

        res.json({
            success: true,
            data: legalPacks,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch legal packs',
            details: error.message
        });
    }
});

// Get all NDAs (admin)
router.get('/ndas', async(req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = status ? { status } : {};

        const [ndas, total] = await Promise.all([
            prisma.platformNDA.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            name: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(limit)
            }),
            prisma.platformNDA.count({ where })
        ]);

        res.json({
            success: true,
            data: ndas,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch NDAs',
            details: error.message
        });
    }
});

// Get all consents (admin)
router.get('/consents', async(req, res) => {
    try {
        const { status, consentType, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};
        if (status) where.status = status;
        if (consentType) where.consentType = consentType;

        const [consents, total] = await Promise.all([
            prisma.eSignatureConsent.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            name: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(limit)
            }),
            prisma.eSignatureConsent.count({ where })
        ]);

        res.json({
            success: true,
            data: consents,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch consents',
            details: error.message
        });
    }
});

module.exports = router;