const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const crypto = require('crypto');

// ===== DIGITAL SIGNATURE SYSTEM (NO PRISMA) =====

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
                message: 'Missing required fields: documentId, documentType, signerId, signatureData'
            });
        }

        // Generate signature hash
        const signatureHash = crypto.createHash('sha256')
            .update(signatureData + documentId + signerId + Date.now())
            .digest('hex');

        // Create signature record (mock for now)
        const signature = {
            id: crypto.randomUUID(),
            documentId,
            documentType,
            signerId,
            signatureHash,
            signatureData,
            signatureMethod,
            ipAddress: ipAddress || req.ip,
            userAgent: userAgent || req.get('User-Agent'),
            location: location || 'Unknown',
            signedAt: new Date().toISOString(),
            status: 'ACTIVE'
        };

        res.json({
            success: true,
            message: 'Digital signature created successfully',
            data: {
                signatureId: signature.id,
                signatureHash,
                signedAt: signature.signedAt
            }
        });
    } catch (error) {
        console.error('Error creating digital signature:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create digital signature',
            error: error.message
        });
    }
});

// Get digital signature by ID
router.get('/:signatureId', authenticateToken, async(req, res) => {
    try {
        const { signatureId } = req.params;

        // Mock signature data
        const signature = {
            id: signatureId,
            documentId: 'mock-document-id',
            documentType: 'PPA',
            signerId: 'mock-signer-id',
            signatureHash: 'mock-hash',
            signatureData: 'mock-signature-data',
            signatureMethod: 'DRAWING',
            ipAddress: '127.0.0.1',
            userAgent: 'Mock User Agent',
            location: 'Mock Location',
            signedAt: new Date().toISOString(),
            status: 'ACTIVE'
        };

        res.json({
            success: true,
            data: signature
        });
    } catch (error) {
        console.error('Error retrieving digital signature:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve digital signature',
            error: error.message
        });
    }
});

// Verify digital signature
router.post('/verify', authenticateToken, async(req, res) => {
    try {
        const { signatureId, signatureData } = req.body;

        if (!signatureId || !signatureData) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: signatureId, signatureData'
            });
        }

        // Mock verification
        const isValid = true; // In real implementation, verify against stored hash

        res.json({
            success: true,
            data: {
                isValid,
                verifiedAt: new Date().toISOString(),
                confidence: 0.95
            }
        });
    } catch (error) {
        console.error('Error verifying digital signature:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify digital signature',
            error: error.message
        });
    }
});

// Health check
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Digital signatures API (no Prisma) is healthy',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
