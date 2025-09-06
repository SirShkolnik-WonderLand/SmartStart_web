const express = require('express');
const { PrismaClient } = require('@prisma/client');
const VentureManagementService = require('../services/venture-management-service');

const router = express.Router();
const prisma = new PrismaClient();
const ventureService = new VentureManagementService();

/**
 * Venture Management API Routes
 * Handles venture creation, management, and IT pack provisioning
 */

// Health check endpoint
router.get('/health', async(req, res) => {
    try {
        const stats = await ventureService.getVentureStatistics();
        res.json({
            success: true,
            message: 'Venture Management API is healthy',
            timestamp: new Date().toISOString(),
            statistics: stats
        });
    } catch (error) {
        console.error('Health check failed:', error);
        res.status(500).json({
            success: false,
            message: 'Health check failed',
            error: error.message
        });
    }
});

// Create new venture
router.post('/create', async(req, res) => {
    try {
        const ventureData = req.body;

        // Validate required fields
        if (!ventureData.name || !ventureData.purpose || !ventureData.ownerUserId) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: name, purpose, ownerUserId'
            });
        }

        // Create venture with complete setup
        const result = await ventureService.createVenture(ventureData);

        res.json({
            success: true,
            message: 'Venture created successfully',
            venture: {
                id: result.venture.id,
                name: result.venture.name,
                status: result.venture.status,
                createdAt: result.venture.createdAt
            },
            legalEntity: {
                id: result.legalEntity.id,
                name: result.legalEntity.name,
                type: result.legalEntity.type
            },
            equityFramework: {
                id: result.equityFramework.id,
                ownerPercent: result.equityFramework.ownerPercent,
                alicePercent: result.equityFramework.alicePercent,
                cepPercent: result.equityFramework.cepPercent
            }
        });

    } catch (error) {
        console.error('Failed to create venture:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create venture',
            error: error.message
        });
    }
});

// Get venture details
router.get('/:ventureId', async(req, res) => {
    try {
        const { ventureId } = req.params;
        const venture = await ventureService.getVentureWithDetails(ventureId);

        res.json({
            success: true,
            message: 'Venture details retrieved successfully',
            venture: {
                id: venture.id,
                name: venture.name,
                purpose: venture.purpose,
                region: venture.region,
                status: venture.status,
                createdAt: venture.createdAt,
                updatedAt: venture.updatedAt
            },
            owner: venture.owner,
            legalEntity: venture.legalEntity,
            equityFramework: venture.equityFramework,
            ventureProfile: venture.ventureProfile,
            ventureITPack: venture.ventureITPack,
            legalDocuments: venture.legalDocuments
        });

    } catch (error) {
        console.error('Failed to get venture details:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get venture details',
            error: error.message
        });
    }
});

// Update venture status
router.put('/:ventureId/status', async(req, res) => {
    try {
        const { ventureId } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            });
        }

        const venture = await ventureService.updateVentureStatus(ventureId, status);

        res.json({
            success: true,
            message: 'Venture status updated successfully',
            venture: {
                id: venture.id,
                name: venture.name,
                status: venture.status,
                updatedAt: venture.updatedAt
            }
        });

    } catch (error) {
        console.error('Failed to update venture status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update venture status',
            error: error.message
        });
    }
});

// Provision IT pack for venture
router.post('/:ventureId/it-pack', async(req, res) => {
    try {
        const { ventureId } = req.params;
        const itPack = await ventureService.provisionITPack(ventureId);

        res.json({
            success: true,
            message: 'IT pack provisioning initiated',
            itPack: {
                id: itPack.id,
                ventureId: itPack.ventureId,
                status: itPack.status,
                m365TenantId: itPack.m365TenantId,
                emailAddress: itPack.emailAddress,
                githubOrg: itPack.githubOrg,
                renderServiceId: itPack.renderServiceId,
                provisionedAt: itPack.provisionedAt
            }
        });

    } catch (error) {
        console.error('Failed to provision IT pack:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to provision IT pack',
            error: error.message
        });
    }
});

// Get venture statistics
router.get('/statistics/overview', async(req, res) => {
    try {
        const stats = await ventureService.getVentureStatistics();

        res.json({
            success: true,
            message: 'Venture statistics retrieved successfully',
            statistics: stats
        });

    } catch (error) {
        console.error('Failed to get venture statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get venture statistics',
            error: error.message
        });
    }
});

// List all ventures
router.get('/list/all', async(req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        const offset = (page - 1) * limit;

        const whereClause = status ? { status } : {};

        const [ventures, total] = await Promise.all([
            prisma.venture.findMany({
                where: whereClause,
                include: {
                    owner: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    },
                    ventureLegalEntity: {
                        include: {
                            legalEntity: {
                                select: {
                                    name: true,
                                    type: true,
                                    jurisdiction: true
                                }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip: offset,
                take: parseInt(limit)
            }),
            prisma.venture.count({ where: whereClause })
        ]);

        res.json({
            success: true,
            message: 'Ventures retrieved successfully',
            ventures,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Failed to list ventures:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to list ventures',
            error: error.message
        });
    }
});

// Get venture equity details
router.get('/:ventureId/equity', async(req, res) => {
    try {
        const { ventureId } = req.params;

        const equityDetails = await prisma.equityLedger.findMany({
            where: { ventureId },
            include: {
                vestingPolicy: true
            },
            orderBy: { effectiveFrom: 'desc' }
        });

        const equityFramework = await prisma.equityFramework.findUnique({
            where: { ventureId }
        });

        res.json({
            success: true,
            message: 'Venture equity details retrieved successfully',
            equityFramework,
            equityLedger: equityDetails
        });

    } catch (error) {
        console.error('Failed to get venture equity details:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get venture equity details',
            error: error.message
        });
    }
});

// Update venture profile
router.put('/:ventureId/profile', async(req, res) => {
    try {
        const { ventureId } = req.params;
        const profileData = req.body;

        const updatedProfile = await prisma.ventureProfile.update({
            where: { ventureId },
            data: {
                ...profileData,
                updatedAt: new Date()
            }
        });

        res.json({
            success: true,
            message: 'Venture profile updated successfully',
            profile: updatedProfile
        });

    } catch (error) {
        console.error('Failed to update venture profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update venture profile',
            error: error.message
        });
    }
});

// Run venture management migration
router.post('/migrate', async(req, res) => {
    try {
        const { migrateVentureManagement } = require('../../migrate-venture-management');
        await migrateVentureManagement();

        res.json({
            success: true,
            message: 'Venture Management System migration completed successfully',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Migration failed:', error);
        res.status(500).json({
            success: false,
            message: 'Venture Management migration failed',
            error: error.message
        });
    }
});

// Test venture creation with raw SQL
router.post('/create-test', async(req, res) => {
    try {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();

        console.log('🧪 Creating test venture with raw SQL...');

        // Create a test venture using raw SQL
        const ventureId = 'test-venture-' + Date.now();
        const result = await prisma.$executeRaw `
            INSERT INTO "Venture" ("id", "name", "purpose", "region", "status", "ownerUserId", "createdAt", "updatedAt")
            VALUES (${ventureId}, 'Test Venture', 'Testing Venture Management System', 'US', 'DRAFT', 'cmf1r92vo0001s8299wr0vh66', NOW(), NOW())
        `;

        // Fetch the created venture
        const venture = await prisma.$queryRaw `
            SELECT * FROM "Venture" WHERE "id" = ${ventureId}
        `;

        await prisma.$disconnect();

        res.json({
            success: true,
            message: 'Test venture created successfully with raw SQL',
            venture: venture[0],
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Raw SQL venture creation failed:', error);
        res.status(500).json({
            success: false,
            message: 'Raw SQL venture creation failed',
            error: error.message
        });
    }
});

// Get venture legal documents
router.get('/:ventureId/documents', async(req, res) => {
    try {
        const { ventureId } = req.params;

        const documents = await prisma.legalDocument.findMany({
            where: {
                entityId: ventureId,
                isTemplate: false
            },
            include: {
                signatures: {
                    include: {
                        signer: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            success: true,
            message: 'Venture legal documents retrieved successfully',
            documents,
            count: documents.length
        });

    } catch (error) {
        console.error('Failed to get venture documents:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get venture documents',
            error: error.message
        });
    }
});

module.exports = router;