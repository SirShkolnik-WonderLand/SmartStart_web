/**
 * Legal Framework API Routes
 * Handles legal document compliance and framework management
 */

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const prisma = new PrismaClient();

// ===== LEGAL FRAMEWORK HEALTH =====

// Get legal framework health
router.get('/health', async (req, res) => {
    try {
        const [
            totalDocuments,
            activeDocuments,
            totalSignatures,
            pendingSignatures,
            complianceChecks
        ] = await Promise.all([
            prisma.legalDocument.count(),
            prisma.legalDocument.count({ where: { status: 'ACTIVE' } }),
            prisma.legalDocumentSignature.count(),
            prisma.legalDocumentSignature.count({ where: { status: 'PENDING' } }),
            prisma.legalDocumentCompliance.count()
        ]);

        res.json({
            success: true,
            data: {
                documents: {
                    total: totalDocuments,
                    active: activeDocuments
                },
                signatures: {
                    total: totalSignatures,
                    pending: pendingSignatures
                },
                compliance: {
                    checks: complianceChecks
                },
                status: 'OPERATIONAL'
            },
            message: 'Legal framework health retrieved successfully'
        });
    } catch (error) {
        console.error('Error fetching legal framework health:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch legal framework health',
            error: error.message
        });
    }
});

// ===== DOCUMENT COMPLIANCE =====

// Check user compliance
router.get('/compliance/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const requestingUserId = req.user.id;

        // Check if user can view compliance (own data or admin)
        if (requestingUserId !== userId && !req.user.permissions?.includes('user:read')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to view compliance data'
            });
        }

        const compliance = await prisma.legalDocumentCompliance.findMany({
            where: { userId },
            include: {
                document: {
                    select: { id: true, name: true, type: true, status: true }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        const complianceStatus = {
            userId,
            totalDocuments: compliance.length,
            compliant: compliance.filter(c => c.status === 'COMPLIANT').length,
            nonCompliant: compliance.filter(c => c.status === 'NON_COMPLIANT').length,
            pending: compliance.filter(c => c.status === 'PENDING').length,
            documents: compliance
        };

        res.json({
            success: true,
            data: complianceStatus,
            message: 'Compliance status retrieved successfully'
        });
    } catch (error) {
        console.error('Error fetching compliance:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch compliance status',
            error: error.message
        });
    }
});

// Update compliance status
router.put('/compliance/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const { documentId, status, notes } = req.body;
        const requestingUserId = req.user.id;

        if (!documentId || !status) {
            return res.status(400).json({
                success: false,
                message: 'Document ID and status are required'
            });
        }

        const compliance = await prisma.legalDocumentCompliance.upsert({
            where: {
                userId_documentId: {
                    userId,
                    documentId
                }
            },
            update: {
                status,
                notes,
                updatedBy: requestingUserId,
                updatedAt: new Date()
            },
            create: {
                userId,
                documentId,
                status,
                notes,
                createdBy: requestingUserId
            }
        });

        res.json({
            success: true,
            data: compliance,
            message: 'Compliance status updated successfully'
        });
    } catch (error) {
        console.error('Error updating compliance:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update compliance status',
            error: error.message
        });
    }
});

// ===== DOCUMENT SIGNATURES =====

// Get user signatures
router.get('/signatures/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const requestingUserId = req.user.id;

        if (requestingUserId !== userId && !req.user.permissions?.includes('user:read')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to view signature data'
            });
        }

        const signatures = await prisma.legalDocumentSignature.findMany({
            where: { signerId: userId },
            include: {
                document: {
                    select: { id: true, name: true, type: true, status: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            success: true,
            data: signatures,
            message: 'Signatures retrieved successfully'
        });
    } catch (error) {
        console.error('Error fetching signatures:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch signatures',
            error: error.message
        });
    }
});

// Create signature
router.post('/signatures', authenticateToken, async (req, res) => {
    try {
        const { documentId, signerId, signatureData, ipAddress, userAgent } = req.body;
        const requestingUserId = req.user.id;

        if (!documentId || !signerId || !signatureData) {
            return res.status(400).json({
                success: false,
                message: 'Document ID, signer ID, and signature data are required'
            });
        }

        const signature = await prisma.legalDocumentSignature.create({
            data: {
                documentId,
                signerId,
                signatureData,
                ipAddress,
                userAgent,
                status: 'SIGNED',
                signedAt: new Date(),
                createdBy: requestingUserId
            },
            include: {
                document: {
                    select: { id: true, name: true, type: true }
                }
            }
        });

        res.status(201).json({
            success: true,
            data: signature,
            message: 'Signature created successfully'
        });
    } catch (error) {
        console.error('Error creating signature:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create signature',
            error: error.message
        });
    }
});

// ===== LEGAL DOCUMENTS =====

// Get available legal documents
router.get('/documents', authenticateToken, async (req, res) => {
    try {
        const { type, status = 'ACTIVE' } = req.query;

        const whereClause = { status };
        if (type) {
            whereClause.type = type;
        }

        const documents = await prisma.legalDocument.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            success: true,
            data: documents,
            message: 'Legal documents retrieved successfully'
        });
    } catch (error) {
        console.error('Error fetching legal documents:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch legal documents',
            error: error.message
        });
    }
});

// Get document by ID
router.get('/documents/:documentId', authenticateToken, async (req, res) => {
    try {
        const { documentId } = req.params;

        const document = await prisma.legalDocument.findUnique({
            where: { id: documentId },
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

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        res.json({
            success: true,
            data: document,
            message: 'Document retrieved successfully'
        });
    } catch (error) {
        console.error('Error fetching document:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch document',
            error: error.message
        });
    }
});

// ===== LEGAL ANALYTICS =====

// Get legal analytics
router.get('/analytics', authenticateToken, async (req, res) => {
    try {
        const [
            totalDocuments,
            activeDocuments,
            totalSignatures,
            pendingSignatures,
            complianceRate,
            recentActivity
        ] = await Promise.all([
            prisma.legalDocument.count(),
            prisma.legalDocument.count({ where: { status: 'ACTIVE' } }),
            prisma.legalDocumentSignature.count(),
            prisma.legalDocumentSignature.count({ where: { status: 'PENDING' } }),
            prisma.legalDocumentCompliance.aggregate({
                _avg: {
                    status: true
                }
            }),
            prisma.legalDocumentSignature.findMany({
                include: {
                    document: {
                        select: { id: true, name: true, type: true }
                    },
                    signer: {
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
                documents: {
                    total: totalDocuments,
                    active: activeDocuments
                },
                signatures: {
                    total: totalSignatures,
                    pending: pendingSignatures
                },
                compliance: {
                    rate: complianceRate._avg.status || 0
                },
                recentActivity
            },
            message: 'Legal analytics retrieved successfully'
        });
    } catch (error) {
        console.error('Error fetching legal analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch legal analytics',
            error: error.message
        });
    }
});

module.exports = router;