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
                        teamMembers: {
                            some: { userId: userId }
                        }
                    }
                ]
            },
            include: {
                owner: {
                    select: { id: true, name: true, email: true }
                },
                teamMembers: {
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

module.exports = router;