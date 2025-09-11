const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// ===== DIGITAL SIGNATURE SYSTEM =====

// Create digital signature for a document
router.post('/create', authenticateToken, async(req, res) => {
    try {
        const {
            documentId,
            documentType, // 'PPA', 'MNDA', 'CONTRACT', etc.
            signerId,
            signatureData, // Base64 encoded signature image/data
            signatureMethod = 'DRAWING', // 'DRAWING', 'TYPED', 'UPLOADED'
            ipAddress,
            userAgent,
            location
        } = req.body;

        // Validate required fields
        if (!documentId || !documentType || !signerId || !signatureData) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: documentId, documentType, signerId, signatureData'
            });
        }

        // Generate unique signature ID
        const signatureId = crypto.randomUUID();

        // Create signature record
        const signature = await prisma.digitalSignature.create({
            data: {
                id: signatureId,
                documentId,
                documentType,
                signerId,
                signatureData,
                signatureMethod,
                ipAddress: ipAddress || req.ip,
                userAgent: userAgent || req.get('User-Agent'),
                location: location || null,
                status: 'PENDING',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        });

        // Update document status if this is the final signature
        await updateDocumentSignatureStatus(documentId);

        res.json({
            success: true,
            data: { signature },
            message: 'Digital signature created successfully'
        });

    } catch (error) {
        console.error('Error creating digital signature:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create digital signature'
        });
    }
});

// Get signatures for a document
router.get('/document/:documentId', authenticateToken, async(req, res) => {
    try {
        const { documentId } = req.params;

        const signatures = await prisma.digitalSignature.findMany({
            where: { documentId },
            include: {
                signer: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        profilePicture: true
                    }
                }
            },
            orderBy: { createdAt: 'asc' }
        });

        res.json({
            success: true,
            data: { signatures }
        });

    } catch (error) {
        console.error('Error fetching document signatures:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch document signatures'
        });
    }
});

// Get user's signatures
router.get('/user', authenticateToken, async(req, res) => {
    try {
        const userId = req.user.id;

        const signatures = await prisma.digitalSignature.findMany({
            where: { signerId: userId },
            include: {
                document: {
                    select: {
                        id: true,
                        title: true,
                        type: true,
                        status: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            success: true,
            data: { signatures }
        });

    } catch (error) {
        console.error('Error fetching user signatures:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user signatures'
        });
    }
});

// Verify signature
router.post('/verify/:signatureId', authenticateToken, async(req, res) => {
    try {
        const { signatureId } = req.params;
        const { verificationData } = req.body;

        const signature = await prisma.digitalSignature.findUnique({
            where: { id: signatureId }
        });

        if (!signature) {
            return res.status(404).json({
                success: false,
                error: 'Signature not found'
            });
        }

        // Verify signature integrity
        const isValid = await verifySignatureIntegrity(signature, verificationData);

        // Update verification status
        await prisma.digitalSignature.update({
            where: { id: signatureId },
            data: {
                verifiedAt: new Date(),
                verificationStatus: isValid ? 'VERIFIED' : 'FAILED',
                updatedAt: new Date()
            }
        });

        res.json({
            success: true,
            data: {
                signatureId,
                isValid,
                verifiedAt: new Date()
            }
        });

    } catch (error) {
        console.error('Error verifying signature:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to verify signature'
        });
    }
});

// Revoke signature
router.post('/revoke/:signatureId', authenticateToken, async(req, res) => {
    try {
        const { signatureId } = req.params;
        const { reason } = req.body;

        const signature = await prisma.digitalSignature.findUnique({
            where: { id: signatureId }
        });

        if (!signature) {
            return res.status(404).json({
                success: false,
                error: 'Signature not found'
            });
        }

        // Check if user has permission to revoke
        if (signature.signerId !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to revoke this signature'
            });
        }

        // Update signature status
        await prisma.digitalSignature.update({
            where: { id: signatureId },
            data: {
                status: 'REVOKED',
                revokedAt: new Date(),
                revocationReason: reason,
                updatedAt: new Date()
            }
        });

        // Update document status
        await updateDocumentSignatureStatus(signature.documentId);

        res.json({
            success: true,
            message: 'Signature revoked successfully'
        });

    } catch (error) {
        console.error('Error revoking signature:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to revoke signature'
        });
    }
});

// Get signature analytics
router.get('/analytics', authenticateToken, async(req, res) => {
    try {
        const { documentType, startDate, endDate } = req.query;

        const whereClause = {
            ...(documentType && { documentType }),
            ...(startDate && endDate && {
                createdAt: {
                    gte: new Date(startDate),
                    lte: new Date(endDate)
                }
            })
        };

        const [
            totalSignatures,
            pendingSignatures,
            verifiedSignatures,
            revokedSignatures,
            signaturesByType,
            signaturesByMonth
        ] = await Promise.all([
            prisma.digitalSignature.count({ where: whereClause }),
            prisma.digitalSignature.count({ where: {...whereClause, status: 'PENDING' } }),
            prisma.digitalSignature.count({ where: {...whereClause, status: 'VERIFIED' } }),
            prisma.digitalSignature.count({ where: {...whereClause, status: 'REVOKED' } }),
            prisma.digitalSignature.groupBy({
                by: ['documentType'],
                where: whereClause,
                _count: { id: true }
            }),
            prisma.digitalSignature.groupBy({
                by: ['createdAt'],
                where: whereClause,
                _count: { id: true }
            })
        ]);

        res.json({
            success: true,
            data: {
                totalSignatures,
                pendingSignatures,
                verifiedSignatures,
                revokedSignatures,
                signaturesByType,
                signaturesByMonth
            }
        });

    } catch (error) {
        console.error('Error fetching signature analytics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch signature analytics'
        });
    }
});

// ===== HELPER FUNCTIONS =====

async function updateDocumentSignatureStatus(documentId) {
    try {
        // Get all signatures for the document
        const signatures = await prisma.digitalSignature.findMany({
            where: { documentId }
        });

        // Check if all required signatures are present and verified
        const requiredSignatures = await getRequiredSignatures(documentId);
        const verifiedSignatures = signatures.filter(s => s.status === 'VERIFIED');

        let newStatus = 'PENDING';
        if (verifiedSignatures.length === requiredSignatures.length) {
            newStatus = 'FULLY_SIGNED';
        } else if (verifiedSignatures.length > 0) {
            newStatus = 'PARTIALLY_SIGNED';
        }

        // Update document status
        await prisma.legalDocument.update({
            where: { id: documentId },
            data: {
                signatureStatus: newStatus,
                updatedAt: new Date()
            }
        });

    } catch (error) {
        console.error('Error updating document signature status:', error);
    }
}

async function getRequiredSignatures(documentId) {
    // This would typically come from document configuration
    // For now, return a default set of required signatures
    return ['SIGNER_1', 'SIGNER_2']; // Example required signers
}

async function verifySignatureIntegrity(signature, verificationData) {
    try {
        // Implement signature verification logic
        // This would typically involve:
        // 1. Verifying the signature data hasn't been tampered with
        // 2. Checking the signature against the original document
        // 3. Validating the signer's identity

        // For now, return true as a placeholder
        return true;
    } catch (error) {
        console.error('Error verifying signature integrity:', error);
        return false;
    }
}

module.exports = router;