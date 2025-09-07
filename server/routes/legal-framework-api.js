/**
 * Legal Framework API Routes
 * Handles document generation, signing, and compliance checking
 */

const express = require('express');
const router = express.Router();
const LegalFrameworkService = require('../services/legal-framework');
const { authenticateToken, requireRole } = require('../middleware/auth');

const legalService = new LegalFrameworkService();

// ============================================================================
// DOCUMENT COMPLIANCE & RBAC GATING
// ============================================================================

/**
 * Check user's document compliance for RBAC level
 * GET /api/legal/compliance/:userId/:rbacLevel
 */
router.get('/compliance/:userId/:rbacLevel', authenticateToken, async(req, res) => {
    try {
        const { userId, rbacLevel } = req.params;

        // Verify user can check this compliance (own user or admin)
        if (req.user.id !== userId && !req.user.roles.includes('ADMIN')) {
            return res.status(403).json({
                success: false,
                error: 'Insufficient permissions to check compliance'
            });
        }

        const compliance = await legalService.checkUserDocumentCompliance(userId, rbacLevel);

        res.json({
            success: true,
            data: compliance
        });
    } catch (error) {
        console.error('Error checking compliance:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to check document compliance'
        });
    }
});

/**
 * Check if user can perform specific action
 * POST /api/legal/can-perform-action
 */
router.post('/can-perform-action', authenticateToken, async(req, res) => {
    try {
        const { action, context = {} } = req.body;
        const userId = req.user.id;

        if (!action) {
            return res.status(400).json({
                success: false,
                error: 'Action is required'
            });
        }

        const result = await legalService.canUserPerformAction(userId, action, context);

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error checking action permission:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to check action permission'
        });
    }
});

/**
 * Get required documents for action
 * GET /api/legal/required-documents/:action
 */
router.get('/required-documents/:action', authenticateToken, async(req, res) => {
    try {
        const { action } = req.params;
        const { context } = req.query;

        const requiredDocuments = legalService.getRequiredDocumentsForAction(
            action,
            context ? JSON.parse(context) : {}
        );

        res.json({
            success: true,
            data: {
                action,
                requiredDocuments,
                rbacLevel: legalService.getRbacLevelForAction(action)
            }
        });
    } catch (error) {
        console.error('Error getting required documents:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get required documents'
        });
    }
});

// ============================================================================
// DOCUMENT GENERATION
// ============================================================================

/**
 * Generate document from template
 * POST /api/legal/generate-document
 */
router.post('/generate-document', authenticateToken, async(req, res) => {
    try {
        const { templateType, variables = {} } = req.body;

        if (!templateType) {
            return res.status(400).json({
                success: false,
                error: 'Template type is required'
            });
        }

        // Add user info to variables
        const documentVariables = {
            ...variables,
            userName: req.user.name || req.user.email,
            userEmail: req.user.email,
            currentDate: new Date().toISOString().split('T')[0],
            userId: req.user.id
        };

        // Validate Canadian compliance
        const compliance = legalService.validateCanadianCompliance(templateType, documentVariables);
        if (!compliance.valid) {
            return res.status(400).json({
                success: false,
                error: 'Document does not meet Canadian compliance requirements',
                compliance
            });
        }

        const document = await legalService.generateDocument(templateType, documentVariables);

        res.json({
            success: true,
            data: {
                templateType,
                document,
                variables: documentVariables,
                compliance
            }
        });
    } catch (error) {
        console.error('Error generating document:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate document'
        });
    }
});

/**
 * Store document and get signing URL
 * POST /api/legal/store-document
 */
router.post('/store-document', authenticateToken, async(req, res) => {
    try {
        const { templateType, document, variables = {} } = req.body;

        if (!templateType || !document) {
            return res.status(400).json({
                success: false,
                error: 'Template type and document are required'
            });
        }

        const result = await legalService.storeDocument(
            templateType,
            document,
            variables,
            req.user.id
        );

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error storing document:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to store document'
        });
    }
});

// ============================================================================
// E-SIGNATURE PROCESSING
// ============================================================================

/**
 * Process e-signature
 * POST /api/legal/sign-document
 */
router.post('/sign-document', authenticateToken, async(req, res) => {
    try {
        const { documentId, signerInfo } = req.body;

        if (!documentId || !signerInfo) {
            return res.status(400).json({
                success: false,
                error: 'Document ID and signer info are required'
            });
        }

        // Add request info to signer info
        const enhancedSignerInfo = {
            ...signerInfo,
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent'),
            signerEmail: req.user.email,
            signerName: req.user.name || req.user.email
        };

        const result = await legalService.processESignature(documentId, enhancedSignerInfo);

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error processing signature:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process signature'
        });
    }
});

/**
 * Get document status
 * GET /api/legal/document-status/:documentId
 */
router.get('/document-status/:documentId', authenticateToken, async(req, res) => {
    try {
        const { documentId } = req.params;

        // This would typically load from your database
        // For now, return a basic response
        res.json({
            success: true,
            data: {
                documentId,
                status: 'DRAFTED',
                message: 'Document status endpoint - implement with your database'
            }
        });
    } catch (error) {
        console.error('Error getting document status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get document status'
        });
    }
});

// ============================================================================
// SECURITY TIER MANAGEMENT
// ============================================================================

/**
 * Get security tier requirements
 * GET /api/legal/security-tier/:tier
 */
router.get('/security-tier/:tier', authenticateToken, async(req, res) => {
    try {
        const { tier } = req.params;

        const requirements = legalService.getSecurityTierRequirements(tier);

        if (!requirements) {
            return res.status(404).json({
                success: false,
                error: 'Security tier not found'
            });
        }

        res.json({
            success: true,
            data: requirements
        });
    } catch (error) {
        console.error('Error getting security tier requirements:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get security tier requirements'
        });
    }
});

/**
 * List all security tiers
 * GET /api/legal/security-tiers
 */
router.get('/security-tiers', authenticateToken, async(req, res) => {
    try {
        const tiers = Object.keys(legalService.securityTierRequirements).map(tier => ({
            tier,
            ...legalService.securityTierRequirements[tier]
        }));

        res.json({
            success: true,
            data: tiers
        });
    } catch (error) {
        console.error('Error getting security tiers:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get security tiers'
        });
    }
});

// ============================================================================
// RBAC GATING MIDDLEWARE
// ============================================================================

/**
 * Middleware to check document compliance before action
 */
const requireDocumentCompliance = (action) => {
    return async(req, res, next) => {
        try {
            const result = await legalService.canUserPerformAction(req.user.id, action, req.body);

            if (!result.allowed) {
                return res.status(403).json({
                    success: false,
                    error: 'Document compliance required',
                    data: {
                        missingDocuments: result.missingDocuments,
                        requiredDocuments: result.requiredDocuments,
                        action
                    }
                });
            }

            // Add compliance info to request
            req.documentCompliance = result;
            next();
        } catch (error) {
            console.error('Error checking document compliance:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to verify document compliance'
            });
        }
    };
};

// ============================================================================
// BULK OPERATIONS
// ============================================================================

/**
 * Generate multiple documents for user action
 * POST /api/legal/generate-action-documents
 */
router.post('/generate-action-documents', authenticateToken, async(req, res) => {
    try {
        const { action, context = {} } = req.body;

        if (!action) {
            return res.status(400).json({
                success: false,
                error: 'Action is required'
            });
        }

        const requiredDocuments = legalService.getRequiredDocumentsForAction(action, context);
        const documents = [];

        for (const docType of requiredDocuments) {
            try {
                const document = await legalService.generateDocument(docType, {
                    ...context,
                    userName: req.user.name || req.user.email,
                    userEmail: req.user.email,
                    currentDate: new Date().toISOString().split('T')[0],
                    userId: req.user.id
                });

                documents.push({
                    documentType: docType,
                    document,
                    status: 'GENERATED'
                });
            } catch (error) {
                console.error(`Error generating document ${docType}:`, error);
                documents.push({
                    documentType: docType,
                    error: error.message,
                    status: 'FAILED'
                });
            }
        }

        res.json({
            success: true,
            data: {
                action,
                requiredDocuments,
                documents,
                rbacLevel: legalService.getRbacLevelForAction(action)
            }
        });
    } catch (error) {
        console.error('Error generating action documents:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate action documents'
        });
    }
});

/**
 * Get user's document status summary
 * GET /api/legal/user-documents/:userId
 */
router.get('/user-documents/:userId', authenticateToken, async(req, res) => {
    try {
        const { userId } = req.params;

        // Verify user can access this info
        if (req.user.id !== userId && !req.user.roles.includes('ADMIN')) {
            return res.status(403).json({
                success: false,
                error: 'Insufficient permissions'
            });
        }

        // This would typically query your database
        // For now, return a basic response
        res.json({
            success: true,
            data: {
                userId,
                documents: [],
                message: 'User documents endpoint - implement with your database'
            }
        });
    } catch (error) {
        console.error('Error getting user documents:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get user documents'
        });
    }
});

// Export the middleware for use in other routes
router.requireDocumentCompliance = requireDocumentCompliance;

module.exports = router;