const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requirePermission } = require('../middleware/unified-auth');
const { createLegalPacksForUser } = require('./legal-pack-helpers');

const prisma = new PrismaClient();

// ============================================================================
// LEGAL PACK SYSTEM - COMPREHENSIVE LEGAL DOCUMENT MANAGEMENT
// ============================================================================

/**
 * GET /api/legal-pack - Get legal packs based on user role and venture requirements
 */
router.get('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role?.name;
        
        // Get user's ventures and their requirements
        const userVentures = await prisma.project.findMany({
            where: {
                OR: [
                    { ownerId: userId },
                    { 
                        members: {
                            some: { userId: userId }
                        }
                    }
                ]
            },
            include: {
                owner: {
                    select: { id: true, name: true, email: true }
                },
                members: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true }
                        }
                    }
                }
            }
        });

        // Get all legal documents
        const allDocuments = await prisma.legalDocument.findMany({
            include: {
                signatures: {
                    include: {
                        signer: {
                            select: { id: true, name: true, email: true }
                        }
                    }
                },
                project: {
                    select: { id: true, name: true }
                },
                entity: {
                    select: { id: true, name: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Create legal packs based on user role and venture requirements
        const legalPacks = await createLegalPacksForUser(userId, userRole, userVentures, allDocuments);

        res.json({
            success: true,
            message: 'Legal packs retrieved successfully',
            data: legalPacks,
            userRole,
            ventureCount: userVentures.length,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Legal pack retrieval error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve legal packs',
            error: error.message
        });
    }
});

/**
 * GET /api/legal-pack/status/:userId - Get legal pack status for user
 */
router.get('/status/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user.id;
        
        // Check if user can access this status (own status or admin)
        if (userId !== currentUserId && req.user.role?.name !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Get user's legal packs
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { role: true }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const userVentures = await prisma.project.findMany({
            where: {
                OR: [
                    { ownerId: userId },
                    { 
                        members: {
                            some: { userId: userId }
                        }
                    }
                ]
            },
            include: {
                owner: {
                    select: { id: true, name: true, email: true }
                },
                members: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true }
                        }
                    }
                }
            }
        });

        const allDocuments = await prisma.legalDocument.findMany({
            include: {
                signatures: {
                    include: {
                        signer: {
                            select: { id: true, name: true, email: true }
                        }
                    }
                }
            }
        });

        const legalPacks = await createLegalPacksForUser(userId, user.role?.name, userVentures, allDocuments);

        // Calculate overall status
        const requiredPacks = legalPacks.filter(pack => pack.required);
        const completedPacks = requiredPacks.filter(pack => pack.status === 'COMPLETED');
        const overallStatus = completedPacks.length === requiredPacks.length ? 'COMPLETED' : 'PENDING';

        res.json({
            success: true,
            message: 'Legal pack status retrieved successfully',
            data: {
                userId,
                overallStatus,
                totalPacks: legalPacks.length,
                requiredPacks: requiredPacks.length,
                completedPacks: completedPacks.length,
                packs: legalPacks.map(pack => ({
                    id: pack.id,
                    name: pack.name,
                    status: pack.status,
                    required: pack.required,
                    documentCount: pack.documents.length
                }))
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Legal pack status retrieval error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve legal pack status',
            error: error.message
        });
    }
});

module.exports = router;