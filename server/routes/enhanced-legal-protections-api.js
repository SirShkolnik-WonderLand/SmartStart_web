/**
 * Enhanced Legal Protections API Routes
 * Comprehensive legal protection system with worldwide enforcement
 */

const express = require('express');
const router = express.Router();
const EnhancedLegalProtectionsService = require('../services/enhanced-legal-protections-service');
const { authenticateToken, requireRole } = require('../middleware/auth');

const legalService = new EnhancedLegalProtectionsService();

// ============================================================================
// LEGAL DOCUMENT TEMPLATE MANAGEMENT
// ============================================================================

/**
 * GET /api/legal-protections/templates
 * Get all legal document templates
 */
router.get('/templates', authenticateToken, async (req, res) => {
    try {
        const { type, rbacLevel, jurisdiction } = req.query;
        
        const result = await legalService.getLegalTemplates({
            type,
            rbacLevel,
            jurisdiction
        });

        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error getting legal templates:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get legal templates'
        });
    }
});

/**
 * POST /api/legal-protections/templates
 * Create a new legal document template
 */
router.post('/templates', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
    try {
        const result = await legalService.createLegalTemplate(req.body, req.user.id);

        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error creating legal template:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create legal template'
        });
    }
});

/**
 * PUT /api/legal-protections/templates/:templateId
 * Update a legal document template
 */
router.put('/templates/:templateId', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
    try {
        const { templateId } = req.params;
        const result = await legalService.updateLegalTemplate(templateId, req.body, req.user.id);

        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error updating legal template:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update legal template'
        });
    }
});

// ============================================================================
// LEGAL COMPLIANCE MANAGEMENT
// ============================================================================

/**
 * GET /api/legal-protections/compliance/:userId/:rbacLevel
 * Check user's legal compliance status
 */
router.get('/compliance/:userId/:rbacLevel', authenticateToken, async (req, res) => {
    try {
        const { userId, rbacLevel } = req.params;

        // Verify user can check this compliance (own user or admin)
        if (req.user.id !== userId && !req.user.roles.includes('ADMIN')) {
            return res.status(403).json({
                success: false,
                error: 'Insufficient permissions to check compliance'
            });
        }

        const result = await legalService.checkUserCompliance(userId, rbacLevel);

        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error checking user compliance:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to check user compliance'
        });
    }
});

/**
 * POST /api/legal-protections/compliance/requirements
 * Create a compliance requirement for a user
 */
router.post('/compliance/requirements', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
    try {
        const { userId, documentId, rbacLevel, requiredBy } = req.body;

        if (!userId || !documentId || !rbacLevel) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: userId, documentId, rbacLevel'
            });
        }

        const result = await legalService.createComplianceRequirement(
            userId,
            documentId,
            rbacLevel,
            requiredBy
        );

        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error creating compliance requirement:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create compliance requirement'
        });
    }
});

/**
 * PUT /api/legal-protections/compliance/:complianceId
 * Update compliance status
 */
router.put('/compliance/:complianceId', authenticateToken, async (req, res) => {
    try {
        const { complianceId } = req.params;
        const { status, violations } = req.body;

        const result = await legalService.updateComplianceStatus(complianceId, status, violations);

        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error updating compliance status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update compliance status'
        });
    }
});

// ============================================================================
// IP THEFT DETECTION AND ENFORCEMENT
// ============================================================================

/**
 * POST /api/legal-protections/ip-theft/detect
 * Detect IP theft violation
 */
router.post('/ip-theft/detect', authenticateToken, requireRole(['ADMIN', 'MODERATOR']), async (req, res) => {
    try {
        const {
            userId,
            ventureId,
            projectId,
            detectionType,
            evidence,
            severity
        } = req.body;

        if (!userId || !detectionType || !evidence) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: userId, detectionType, evidence'
            });
        }

        const result = await legalService.detectIPTheft(userId, {
            ventureId,
            projectId,
            detectionType,
            evidence,
            severity
        });

        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error detecting IP theft:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to detect IP theft'
        });
    }
});

/**
 * GET /api/legal-protections/ip-theft/detections
 * Get IP theft detections
 */
router.get('/ip-theft/detections', authenticateToken, requireRole(['ADMIN', 'MODERATOR']), async (req, res) => {
    try {
        const { userId, ventureId, projectId, severity, status } = req.query;

        const result = await legalService.getIPTheftDetections({
            userId,
            ventureId,
            projectId,
            severity,
            status
        });

        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error getting IP theft detections:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get IP theft detections'
        });
    }
});

// ============================================================================
// REVENUE SHARING VIOLATION DETECTION
// ============================================================================

/**
 * POST /api/legal-protections/revenue-violations/detect
 * Detect revenue sharing violation
 */
router.post('/revenue-violations/detect', authenticateToken, requireRole(['ADMIN', 'MODERATOR']), async (req, res) => {
    try {
        const {
            userId,
            ventureId,
            projectId,
            violationType,
            amount,
            evidence
        } = req.body;

        if (!userId || !ventureId || !violationType || !amount || !evidence) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: userId, ventureId, violationType, amount, evidence'
            });
        }

        const result = await legalService.detectRevenueSharingViolation({
            userId,
            ventureId,
            projectId,
            violationType,
            amount,
            evidence
        });

        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error detecting revenue sharing violation:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to detect revenue sharing violation'
        });
    }
});

/**
 * GET /api/legal-protections/revenue-violations
 * Get revenue sharing violations
 */
router.get('/revenue-violations', authenticateToken, requireRole(['ADMIN', 'MODERATOR']), async (req, res) => {
    try {
        const { userId, ventureId, projectId, status } = req.query;

        const result = await legalService.getRevenueSharingViolations({
            userId,
            ventureId,
            projectId,
            status
        });

        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error getting revenue sharing violations:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get revenue sharing violations'
        });
    }
});

// ============================================================================
// ENFORCEMENT ACTIONS
// ============================================================================

/**
 * POST /api/legal-protections/enforcement/initiate
 * Initiate enforcement actions for a violation
 */
router.post('/enforcement/initiate', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
    try {
        const { violationId, violationType } = req.body;

        if (!violationId || !violationType) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: violationId, violationType'
            });
        }

        const result = await legalService.initiateEnforcementActions(violationId, violationType);

        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error initiating enforcement actions:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to initiate enforcement actions'
        });
    }
});

/**
 * PUT /api/legal-protections/enforcement/:actionId/execute
 * Execute an enforcement action
 */
router.put('/enforcement/:actionId/execute', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
    try {
        const { actionId } = req.params;
        const { result, executedAt } = req.body;

        const executionResult = await legalService.executeEnforcementAction(actionId, {
            result,
            executedAt
        });

        if (executionResult.success) {
            res.json(executionResult);
        } else {
            res.status(400).json(executionResult);
        }
    } catch (error) {
        console.error('Error executing enforcement action:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to execute enforcement action'
        });
    }
});

// ============================================================================
// DIGITAL EVIDENCE MANAGEMENT
// ============================================================================

/**
 * POST /api/legal-protections/evidence
 * Create digital evidence
 */
router.post('/evidence', authenticateToken, requireRole(['ADMIN', 'MODERATOR']), async (req, res) => {
    try {
        const { caseId, evidenceType, evidenceData, blockchainTx } = req.body;

        if (!caseId || !evidenceType || !evidenceData) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: caseId, evidenceType, evidenceData'
            });
        }

        const result = await legalService.createDigitalEvidence(caseId, {
            evidenceType,
            evidenceData,
            blockchainTx
        });

        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error creating digital evidence:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create digital evidence'
        });
    }
});

/**
 * GET /api/legal-protections/evidence/:caseId
 * Get digital evidence for a case
 */
router.get('/evidence/:caseId', authenticateToken, requireRole(['ADMIN', 'MODERATOR']), async (req, res) => {
    try {
        const { caseId } = req.params;

        const result = await legalService.getDigitalEvidence(caseId);

        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error getting digital evidence:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get digital evidence'
        });
    }
});

// ============================================================================
// LEGAL DOCUMENT VERSIONING
// ============================================================================

/**
 * POST /api/legal-protections/documents/:documentId/versions
 * Create a new version of a legal document
 */
router.post('/documents/:documentId/versions', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
    try {
        const { documentId } = req.params;
        const { version, content, changeLog } = req.body;

        if (!version || !content) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: version, content'
            });
        }

        const result = await legalService.createDocumentVersion(documentId, {
            version,
            content,
            changeLog
        }, req.user.id);

        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error creating document version:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create document version'
        });
    }
});

/**
 * GET /api/legal-protections/documents/:documentId/versions
 * Get all versions of a legal document
 */
router.get('/documents/:documentId/versions', authenticateToken, async (req, res) => {
    try {
        const { documentId } = req.params;

        const result = await legalService.getDocumentVersions(documentId);

        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error getting document versions:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get document versions'
        });
    }
});

// ============================================================================
// COMPREHENSIVE LEGAL STATUS
// ============================================================================

/**
 * GET /api/legal-protections/status/:userId
 * Get comprehensive legal status for a user
 */
router.get('/status/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;

        // Verify user can check this status (own user or admin)
        if (req.user.id !== userId && !req.user.roles.includes('ADMIN')) {
            return res.status(403).json({
                success: false,
                error: 'Insufficient permissions to check legal status'
            });
        }

        const result = await legalService.getComprehensiveLegalStatus(userId);

        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error getting comprehensive legal status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get comprehensive legal status'
        });
    }
});

// ============================================================================
// LEGAL PROTECTION DASHBOARD
// ============================================================================

/**
 * GET /api/legal-protections/dashboard
 * Get legal protection dashboard data
 */
router.get('/dashboard', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
    try {
        const [
            templatesResult,
            ipTheftResult,
            revenueViolationsResult
        ] = await Promise.all([
            legalService.getLegalTemplates(),
            legalService.getIPTheftDetections({}),
            legalService.getRevenueSharingViolations({})
        ]);

        const dashboard = {
            templates: {
                total: templatesResult.data?.length || 0,
                active: templatesResult.data?.filter(t => t.isActive).length || 0
            },
            ipTheft: {
                totalDetections: ipTheftResult.data?.length || 0,
                criticalDetections: ipTheftResult.data?.filter(d => d.severity === 'CRITICAL').length || 0,
                totalDamages: ipTheftResult.data?.reduce((sum, d) => sum + (d.damages || 0), 0) || 0
            },
            revenueViolations: {
                totalViolations: revenueViolationsResult.data?.length || 0,
                totalAmount: revenueViolationsResult.data?.reduce((sum, v) => sum + (v.amount || 0), 0) || 0,
                totalDamages: revenueViolationsResult.data?.reduce((sum, v) => sum + (v.liquidatedDamages || 0), 0) || 0
            }
        };

        res.json({
            success: true,
            data: dashboard
        });
    } catch (error) {
        console.error('Error getting legal protection dashboard:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get legal protection dashboard'
        });
    }
});

// ============================================================================
// AUTOMATED LEGAL MONITORING
// ============================================================================

/**
 * POST /api/legal-protections/monitor/start
 * Start automated legal monitoring
 */
router.post('/monitor/start', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
    try {
        const { monitoringType, parameters } = req.body;

        // This would integrate with your monitoring systems
        // For now, return success
        res.json({
            success: true,
            message: 'Automated legal monitoring started',
            monitoringType,
            parameters
        });
    } catch (error) {
        console.error('Error starting legal monitoring:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to start legal monitoring'
        });
    }
});

/**
 * POST /api/legal-protections/monitor/stop
 * Stop automated legal monitoring
 */
router.post('/monitor/stop', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
    try {
        const { monitoringType } = req.body;

        // This would stop your monitoring systems
        // For now, return success
        res.json({
            success: true,
            message: 'Automated legal monitoring stopped',
            monitoringType
        });
    } catch (error) {
        console.error('Error stopping legal monitoring:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to stop legal monitoring'
        });
    }
});

module.exports = router;
