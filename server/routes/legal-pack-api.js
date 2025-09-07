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
        const userRole = req.user.role;
        
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
        
        console.log('Legal pack status request:', { userId, currentUserId });
        
        // Check if user can access this status (own status or admin)
        if (userId !== currentUserId && req.user.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Get user's legal packs
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        console.log('User found:', { id: user.id, email: user.email, role: user.role });

        // Get user's ventures with proper error handling
        let userVentures = [];
        try {
            userVentures = await prisma.project.findMany({
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
            console.log('User ventures found:', userVentures.length);
        } catch (ventureError) {
            console.error('Error fetching user ventures:', ventureError);
            // Continue with empty ventures array
        }

        // Get all documents with proper error handling
        let allDocuments = [];
        try {
            allDocuments = await prisma.legalDocument.findMany({
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
            console.log('Legal documents found:', allDocuments.length);
        } catch (docError) {
            console.error('Error fetching legal documents:', docError);
            // Continue with empty documents array
        }

        // Create legal packs with proper error handling
        let legalPacks = [];
        try {
            legalPacks = await createLegalPacksForUser(userId, user.role, userVentures, allDocuments);
            console.log('Legal packs created:', legalPacks.length);
        } catch (packError) {
            console.error('Error creating legal packs:', packError);
            // Return default packs
            legalPacks = [{
                id: 'default',
                name: 'Default Pack',
                status: 'PENDING',
                required: true,
                documents: []
            }];
        }

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
                    documentCount: pack.documents ? pack.documents.length : 0
                }))
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Legal pack status retrieval error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve legal pack status',
            error: error.message,
            stack: error.stack
        });
    }
});

// Test endpoint to verify the fix
router.get('/test-fix', authenticateToken, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id }
        });
        
        res.json({
            success: true,
            message: 'Fix is working!',
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;