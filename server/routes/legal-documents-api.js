const express = require('express');
const router = express.Router();
const LegalDocumentService = require('../services/legal-document-service');
const { authenticateToken } = require('../middleware/auth');

const legalDocumentService = new LegalDocumentService();

// Get available documents for user
router.get('/documents', authenticateToken, async (req, res) => {
    try {
        const documents = await legalDocumentService.getAvailableDocuments(req.user.id);
        res.json({
            success: true,
            data: documents
        });
    } catch (error) {
        console.error('Error getting available documents:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get required documents for current level
router.get('/documents/required', authenticateToken, async (req, res) => {
    try {
        const documents = await legalDocumentService.getRequiredDocuments(req.user.id);
        res.json({
            success: true,
            data: documents
        });
    } catch (error) {
        console.error('Error getting required documents:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get pending documents for next level
router.get('/documents/pending', authenticateToken, async (req, res) => {
    try {
        const documents = await legalDocumentService.getPendingDocuments(req.user.id);
        res.json({
            success: true,
            data: documents
        });
    } catch (error) {
        console.error('Error getting pending documents:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get specific document
router.get('/documents/:id', authenticateToken, async (req, res) => {
    try {
        const document = await legalDocumentService.getDocument(req.params.id);
        
        // Log document access
        await legalDocumentService.logDocumentAction(req.user.id, req.params.id, 'view', {
            ip_address: req.ip,
            user_agent: req.get('User-Agent')
        });

        res.json({
            success: true,
            data: document
        });
    } catch (error) {
        console.error('Error getting document:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Sign a document
router.post('/documents/:id/sign', authenticateToken, async (req, res) => {
    try {
        const signatureData = {
            method: req.body.method || 'click',
            ip_address: req.ip,
            user_agent: req.get('User-Agent'),
            location: req.body.location,
            mfa_verified: req.body.mfa_verified || false,
            timestamp: new Date().toISOString(),
            ...req.body
        };

        const signature = await legalDocumentService.signDocument(
            req.user.id,
            req.params.id,
            signatureData
        );

        res.json({
            success: true,
            data: signature
        });
    } catch (error) {
        console.error('Error signing document:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get user document status
router.get('/status', authenticateToken, async (req, res) => {
    try {
        const status = await legalDocumentService.getUserDocumentStatus(req.user.id);
        res.json({
            success: true,
            data: status
        });
    } catch (error) {
        console.error('Error getting user document status:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Verify document signature
router.post('/documents/verify', authenticateToken, async (req, res) => {
    try {
        const verification = await legalDocumentService.verifyDocumentSignature(
            req.body.documentId,
            req.body.signatureHash
        );
        res.json({
            success: true,
            data: verification
        });
    } catch (error) {
        console.error('Error verifying document signature:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get document audit log
router.get('/audit', authenticateToken, async (req, res) => {
    try {
        const { documentId, startDate, endDate, page = 1, limit = 50 } = req.query;
        
        const auditLog = await legalDocumentService.getDocumentAuditLog(
            req.user.id,
            documentId,
            startDate,
            endDate,
            parseInt(page),
            parseInt(limit)
        );

        res.json({
            success: true,
            data: auditLog.logs,
            pagination: auditLog.pagination
        });
    } catch (error) {
        console.error('Error getting document audit log:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Generate compliance report
router.get('/compliance/report', authenticateToken, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Start date and end date are required'
            });
        }

        const report = await legalDocumentService.generateComplianceReport(
            req.user.id,
            startDate,
            endDate
        );

        res.json({
            success: true,
            data: report
        });
    } catch (error) {
        console.error('Error generating compliance report:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get document templates
router.get('/templates', authenticateToken, async (req, res) => {
    try {
        const templates = await legalDocumentService.getAvailableDocuments(req.user.id);
        const documentTemplates = templates.filter(doc => doc.is_template);
        
        res.json({
            success: true,
            data: documentTemplates
        });
    } catch (error) {
        console.error('Error getting document templates:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Generate document from template
router.post('/templates/:templateId/generate', authenticateToken, async (req, res) => {
    try {
        const { projectName, projectDescription, confidentialityLevel, parties } = req.body;
        
        // This would generate a new document from a template
        // For now, we'll return a success response
        const generatedDocument = {
            id: `doc-${Date.now()}`,
            name: `Generated Document - ${projectName}`,
            legal_name: `Generated Document - ${projectName}`,
            version: '1.0',
            category: '08-templates',
            rbac_level: 'MEMBER',
            template_path: `generated/${projectName.toLowerCase().replace(/\s+/g, '-')}.md`,
            is_required: false,
            is_template: false,
            generated_from: req.params.templateId,
            generated_at: new Date().toISOString(),
            created_at: new Date().toISOString()
        };

        res.json({
            success: true,
            data: generatedDocument
        });
    } catch (error) {
        console.error('Error generating document from template:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Download document
router.get('/documents/:id/download', authenticateToken, async (req, res) => {
    try {
        const document = await legalDocumentService.getDocument(req.params.id);
        
        // Log document download
        await legalDocumentService.logDocumentAction(req.user.id, req.params.id, 'download', {
            ip_address: req.ip,
            user_agent: req.get('User-Agent')
        });

        // Set headers for file download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${document.name}.pdf"`);
        
        // For now, return the document content as text
        // In a real implementation, you would generate a PDF
        res.send(document.content || 'Document content not available');
    } catch (error) {
        console.error('Error downloading document:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Legal Documents API is healthy',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
// Force redeploy Tue Sep  9 08:12:05 EDT 2025
