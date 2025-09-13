/**
 * Umbrella API Routes
 * Handles umbrella relationships and revenue sharing
 */

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const prisma = new PrismaClient();

// ===== UMBRELLA RELATIONSHIPS =====

// Get all umbrella relationships for a user
router.get('/relationships', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const relationships = await prisma.umbrellaRelationship.findMany({
            where: {
                OR: [
                    { referrerId: userId },
                    { referredId: userId }
                ]
            },
            include: {
                referrer: {
                    select: { id: true, name: true, email: true }
                },
                referred: {
                    select: { id: true, name: true, email: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            success: true,
            data: relationships,
            message: 'Umbrella relationships retrieved successfully'
        });
    } catch (error) {
        console.error('Error fetching umbrella relationships:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch umbrella relationships',
            error: error.message
        });
    }
});

// Create umbrella relationship
router.post('/relationships', authenticateToken, async (req, res) => {
    try {
        const { referredId, relationshipType = 'REFERRAL', notes } = req.body;
        const referrerId = req.user.id;

        if (!referredId) {
            return res.status(400).json({
                success: false,
                message: 'Referred user ID is required'
            });
        }

        if (referrerId === referredId) {
            return res.status(400).json({
                success: false,
                message: 'Cannot create relationship with yourself'
            });
        }

        const relationship = await prisma.umbrellaRelationship.create({
            data: {
                referrerId,
                referredId,
                relationshipType,
                notes,
                status: 'ACTIVE'
            },
            include: {
                referrer: {
                    select: { id: true, name: true, email: true }
                },
                referred: {
                    select: { id: true, name: true, email: true }
                }
            }
        });

        res.status(201).json({
            success: true,
            data: relationship,
            message: 'Umbrella relationship created successfully'
        });
    } catch (error) {
        console.error('Error creating umbrella relationship:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create umbrella relationship',
            error: error.message
        });
    }
});

// ===== REVENUE SHARING =====

// Get revenue shares for a user
router.get('/revenue/shares', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const revenueShares = await prisma.revenueShare.findMany({
            where: {
                OR: [
                    { referrerId: userId },
                    { referredId: userId }
                ]
            },
            include: {
                referrer: {
                    select: { id: true, name: true, email: true }
                },
                referred: {
                    select: { id: true, name: true, email: true }
                },
                venture: {
                    select: { id: true, name: true, purpose: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            success: true,
            data: revenueShares,
            message: 'Revenue shares retrieved successfully'
        });
    } catch (error) {
        console.error('Error fetching revenue shares:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch revenue shares',
            error: error.message
        });
    }
});

// Create revenue share
router.post('/revenue/shares', authenticateToken, async (req, res) => {
    try {
        const { referredId, ventureId, amount, percentage, description } = req.body;
        const referrerId = req.user.id;

        if (!referredId || !ventureId || !amount) {
            return res.status(400).json({
                success: false,
                message: 'Referred user ID, venture ID, and amount are required'
            });
        }

        const revenueShare = await prisma.revenueShare.create({
            data: {
                referrerId,
                referredId,
                ventureId,
                amount: parseFloat(amount),
                percentage: percentage ? parseFloat(percentage) : null,
                description,
                status: 'PENDING'
            },
            include: {
                referrer: {
                    select: { id: true, name: true, email: true }
                },
                referred: {
                    select: { id: true, name: true, email: true }
                },
                venture: {
                    select: { id: true, name: true, purpose: true }
                }
            }
        });

        res.status(201).json({
            success: true,
            data: revenueShare,
            message: 'Revenue share created successfully'
        });
    } catch (error) {
        console.error('Error creating revenue share:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create revenue share',
            error: error.message
        });
    }
});

// ===== UMBRELLA ANALYTICS =====

// Get umbrella analytics
router.get('/analytics', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const [
            totalRelationships,
            activeRelationships,
            totalRevenue,
            monthlyRevenue,
            topReferrers,
            recentActivity
        ] = await Promise.all([
            prisma.umbrellaRelationship.count({
                where: { referrerId: userId }
            }),
            prisma.umbrellaRelationship.count({
                where: { 
                    referrerId: userId,
                    status: 'ACTIVE'
                }
            }),
            prisma.revenueShare.aggregate({
                where: { referrerId: userId },
                _sum: { amount: true }
            }),
            prisma.revenueShare.aggregate({
                where: {
                    referrerId: userId,
                    createdAt: {
                        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                    }
                },
                _sum: { amount: true }
            }),
            prisma.umbrellaRelationship.groupBy({
                by: ['referredId'],
                where: { referrerId: userId },
                _count: { id: true },
                orderBy: { _count: { id: 'desc' } },
                take: 5
            }),
            prisma.umbrellaRelationship.findMany({
                where: { referrerId: userId },
                include: {
                    referred: {
                        select: { id: true, name: true, email: true }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: 10
            })
        ]);

        res.json({
            success: true,
            data: {
                totalRelationships,
                activeRelationships,
                totalRevenue: totalRevenue._sum.amount || 0,
                monthlyRevenue: monthlyRevenue._sum.amount || 0,
                topReferrers,
                recentActivity
            },
            message: 'Umbrella analytics retrieved successfully'
        });
    } catch (error) {
        console.error('Error fetching umbrella analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch umbrella analytics',
            error: error.message
        });
    }
});

// ===== UMBRELLA-LEGAL INTEGRATION =====

// Create umbrella relationship with legal compliance check
router.post('/create-relationship', authenticateToken, async (req, res) => {
    try {
        const { referredEmail, agreementTerms } = req.body;
        const referrerId = req.user.id;

        // Check if referrer has completed required legal documents
        const referrerLegalCompliance = await checkUserLegalCompliance(referrerId);
        if (!referrerLegalCompliance.compliant) {
            return res.status(400).json({
                success: false,
                message: 'Legal document requirements not met',
                error: {
                    code: 'LEGAL_COMPLIANCE_REQUIRED',
                    message: 'You must complete all required legal documents before creating umbrella relationships',
                    missingDocuments: referrerLegalCompliance.missingDocuments
                }
            });
        }

        // Find the referred user
        const referredUser = await prisma.user.findUnique({
            where: { email: referredEmail }
        });

        if (!referredUser) {
            return res.status(404).json({
                success: false,
                message: 'Referred user not found'
            });
        }

        // Check if referred user has completed required legal documents
        const referredLegalCompliance = await checkUserLegalCompliance(referredUser.id);
        if (!referredLegalCompliance.compliant) {
            return res.status(400).json({
                success: false,
                message: 'Referred user legal compliance required',
                error: {
                    code: 'REFERRED_USER_LEGAL_COMPLIANCE_REQUIRED',
                    message: 'Referred user must complete all required legal documents before umbrella relationship can be established',
                    missingDocuments: referredLegalCompliance.missingDocuments
                }
            });
        }

        // Check if relationship already exists
        const existingRelationship = await prisma.umbrellaRelationship.findFirst({
            where: {
                OR: [
                    { referrerId, referredId: referredUser.id },
                    { referrerId: referredUser.id, referredId: referrerId }
                ]
            }
        });

        if (existingRelationship) {
            return res.status(400).json({
                success: false,
                message: 'Umbrella relationship already exists between these users'
            });
        }

        // Create umbrella relationship
        const relationship = await prisma.umbrellaRelationship.create({
            data: {
                referrerId,
                referredId: referredUser.id,
                agreementTerms: agreementTerms || 'Standard umbrella revenue sharing agreement',
                status: 'PENDING_APPROVAL'
            },
            include: {
                referrer: {
                    select: { id: true, name: true, email: true }
                },
                referred: {
                    select: { id: true, name: true, email: true }
                }
            }
        });

        // Generate umbrella-specific legal documents
        await generateUmbrellaLegalDocuments(relationship.id, referrerId, referredUser.id);

        res.status(201).json({
            success: true,
            data: {
                relationship,
                legalDocuments: await getUmbrellaLegalDocuments(relationship.id),
                message: 'Umbrella relationship created successfully with legal compliance'
            }
        });

    } catch (error) {
        console.error('Error creating umbrella relationship:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create umbrella relationship',
            error: error.message
        });
    }
});

// Get umbrella legal compliance status
router.get('/legal-compliance/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user.id;

        // Check if user can access this endpoint (own compliance or admin)
        if (userId !== currentUserId && req.user.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Check user's legal compliance
        const legalCompliance = await checkUserLegalCompliance(userId);

        // Get user's umbrella relationships
        const umbrellaRelationships = await prisma.umbrellaRelationship.findMany({
            where: {
                OR: [
                    { referrerId: userId },
                    { referredId: userId }
                ]
            },
            include: {
                referrer: {
                    select: { id: true, name: true, email: true }
                },
                referred: {
                    select: { id: true, name: true, email: true }
                }
            }
        });

        // Get umbrella-specific legal documents
        const umbrellaLegalDocs = await prisma.legalDocument.findMany({
            where: {
                OR: [
                    { createdBy: userId, title: { contains: 'Umbrella' } },
                    { createdBy: userId, title: { contains: 'Revenue Sharing' } }
                ]
            }
        });

        res.json({
            success: true,
            data: {
                userId,
                legalCompliance,
                umbrellaRelationships: umbrellaRelationships.length,
                umbrellaLegalDocuments: umbrellaLegalDocs.length,
                canCreateUmbrellaRelationships: legalCompliance.compliant
            },
            message: 'Umbrella legal compliance status retrieved successfully'
        });

    } catch (error) {
        console.error('Error fetching umbrella legal compliance:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch umbrella legal compliance',
            error: error.message
        });
    }
});

// Helper function to check user legal compliance (reused from venture creation)
async function checkUserLegalCompliance(userId) {
    try {
        const legalPacks = await prisma.platformLegalPack.findMany({
            where: { userId },
            include: { documents: true }
        });

        const requiredDocuments = [
            'platform-participation-agreement',
            'mutual-confidentiality-agreement', 
            'inventions-ip-agreement'
        ];

        let signedDocuments = 0;
        let missingDocuments = [];

        for (const pack of legalPacks) {
            for (const doc of pack.documents) {
                if (requiredDocuments.includes(doc.key) && 
                    (doc.status === 'EFFECTIVE' || doc.signatureCount > 0)) {
                    signedDocuments++;
                }
            }
        }

        // Check for missing documents
        for (const requiredDoc of requiredDocuments) {
            let found = false;
            for (const pack of legalPacks) {
                for (const doc of pack.documents) {
                    if (doc.key === requiredDoc && 
                        (doc.status === 'EFFECTIVE' || doc.signatureCount > 0)) {
                        found = true;
                        break;
                    }
                }
                if (found) break;
            }
            if (!found) {
                missingDocuments.push(requiredDoc);
            }
        }

        return {
            compliant: signedDocuments === requiredDocuments.length,
            signedDocuments,
            totalRequired: requiredDocuments.length,
            missingDocuments
        };

    } catch (error) {
        console.error('Error checking legal compliance:', error);
        return {
            compliant: false,
            signedDocuments: 0,
            totalRequired: 3,
            missingDocuments: ['platform-participation-agreement', 'mutual-confidentiality-agreement', 'inventions-ip-agreement']
        };
    }
}

// Helper function to generate umbrella-specific legal documents
async function generateUmbrellaLegalDocuments(relationshipId, referrerId, referredId) {
    try {
        const umbrellaDocuments = [
            {
                title: 'Umbrella Revenue Sharing Agreement',
                type: 'REVENUE_SHARING_AGREEMENT',
                content: `This Umbrella Revenue Sharing Agreement governs the revenue sharing relationship between users ${referrerId} and ${referredId}...`,
                status: 'DRAFT',
                requiresSignature: true
            },
            {
                title: 'Umbrella Confidentiality Agreement',
                type: 'CONFIDENTIALITY_AGREEMENT',
                content: `This Umbrella Confidentiality Agreement ensures confidentiality in the umbrella relationship...`,
                status: 'DRAFT',
                requiresSignature: true
            }
        ];

        for (const doc of umbrellaDocuments) {
            await prisma.legalDocument.create({
                data: {
                    ...doc,
                    createdBy: referrerId
                }
            });
        }

        console.log(`Generated ${umbrellaDocuments.length} umbrella legal documents for relationship ${relationshipId}`);

    } catch (error) {
        console.error('Error generating umbrella legal documents:', error);
    }
}

// Helper function to get umbrella legal documents
async function getUmbrellaLegalDocuments(relationshipId) {
    try {
        return await prisma.legalDocument.findMany({
            where: {
                title: { contains: 'Umbrella' }
            },
            select: {
                id: true,
                title: true,
                type: true,
                status: true,
                createdAt: true
            }
        });
    } catch (error) {
        console.error('Error getting umbrella legal documents:', error);
        return [];
    }
}

module.exports = router;