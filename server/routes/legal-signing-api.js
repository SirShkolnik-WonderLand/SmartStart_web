const express = require('express');
const { PrismaClient } = require('@prisma/client');
const legalDocumentService = require('../services/legal-document-service');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw `SELECT 1`;
    res.json({
      status: 'healthy',
      service: 'legal-signing-api',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      service: 'legal-signing-api',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Get legal pack status for a user
 */
router.get('/status/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get all available documents
    const documents = legalDocumentService.getDocuments();
    
    // For now, return mock status - in production this would check actual signatures
    const mockStatus = {
      signed: false,
      signedAt: null,
      documents: documents.map(doc => ({
        id: doc.id,
        name: doc.name,
        status: 'pending',
        signedAt: null
      }))
    };
    
    res.json({
      success: true,
      data: mockStatus
    });
  } catch (error) {
    console.error('Error getting legal pack status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get legal pack status'
    });
  }
});

/**
 * Get all available legal documents
 */
router.get('/documents', async (req, res) => {
  try {
    const documents = legalDocumentService.getDocuments();
    
    res.json({
      success: true,
      data: documents.map(doc => ({
        id: doc.id,
        name: doc.name,
        description: doc.description,
        required: doc.required,
        order: doc.order,
        version: doc.version,
        lastUpdated: doc.lastUpdated
      }))
    });
  } catch (error) {
    console.error('Error getting legal documents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get legal documents'
    });
  }
});

/**
 * Get a specific legal document content
 */
router.get('/documents/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;
    const document = legalDocumentService.getDocument(documentId);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        id: document.id,
        name: document.name,
        description: document.description,
        content: document.content,
        version: document.version,
        lastUpdated: document.lastUpdated
      }
    });
  } catch (error) {
    console.error('Error getting legal document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get legal document'
    });
  }
});

/**
 * Start a legal document signing session
 */
router.post('/session/start', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { documentIds } = req.body;
    
    console.log('🚀 Starting signing session:', { userId, documentIds });
    
    const session = legalDocumentService.generateSigningSession(userId, documentIds);
    
    console.log('✅ Session created:', { sessionId: session.sessionId, documentIds: session.documentIds });
    
    res.json({
      success: true,
      data: {
        sessionId: session.sessionId,
        documentIds: session.documentIds,
        expiresAt: session.expiresAt
      }
    });
  } catch (error) {
    console.error('Error starting signing session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start signing session'
    });
  }
});

/**
 * Sign a document
 */
router.post('/session/:sessionId/sign', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { documentId, signatureData, documentType = 'SOBA' } = req.body;
    const { userId } = req.user;
    
    console.log('🔍 Signing request:', { sessionId, documentId, userId, signatureData, documentType });
    
    // Validate required fields
    if (!signatureData) {
      return res.status(400).json({
        success: false,
        message: 'Signature data is required'
      });
    }
    
    // Add user info to signature data
    const enhancedSignatureData = {
      ...signatureData,
      userId,
      ip_address: req.ip || req.connection.remoteAddress,
      user_agent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    };
    
    console.log('🔍 Enhanced signature data:', enhancedSignatureData);
    console.log('🚀 LEGAL SIGNING API v2.0 - Enhanced for production deployment');
    
    // Check if document exists, create if needed
    let actualDocumentId = documentId;
    if (!documentId || documentId === 'undefined') {
      // Create a new document for signing
      const LegalDocumentCRUDService = require('../services/legal-document-crud-service');
      const crudService = new LegalDocumentCRUDService();
      
      const documentData = {
        title: `Seat Order & Billing Authorization (SOBA)`,
        type: 'TERMS_OF_SERVICE',
        content: `SEAT ORDER & BILLING AUTHORIZATION

This agreement authorizes billing for additional platform seats and team members.

1. SEAT PROVISIONING
- Additional seats for team members
- Role-based access control
- User management capabilities
- Seat utilization tracking

2. BILLING AUTHORIZATION
- Per-seat monthly billing
- Automatic seat provisioning
- Usage-based adjustments
- Invoice generation and delivery

3. USER MANAGEMENT
- Add/remove team members
- Role assignment and permissions
- Access control and monitoring
- Compliance requirements

4. TERMS AND CONDITIONS
- Seat minimums and maximums
- Billing cycles and terms
- Cancellation procedures
- Data handling requirements

This authorization enables team expansion and collaboration on the platform.`,
        version: '1.0',
        status: 'DRAFT',
        requiresSignature: true,
        complianceRequired: true
      };
      
      const newDocument = await crudService.createDocument(documentData, userId);
      actualDocumentId = newDocument.id;
      console.log('🔍 Created new document:', actualDocumentId);
    }
    
    // Use direct database signing instead of session-based
    console.log('🔍 Calling signDocument with:', { sessionId, actualDocumentId, enhancedSignatureData });
    const signature = await legalDocumentService.signDocument(sessionId, actualDocumentId, enhancedSignatureData);
    
    console.log('🔍 Signing result:', signature);
    
    res.json({
      success: true,
      data: {
        signature: signature,
        documentId: actualDocumentId,
        message: 'Document signed successfully'
      }
    });
  } catch (error) {
    console.error('Error signing document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sign document',
      error: error.message
    });
  }
});

/**
 * Get signing session status
 */
router.get('/session/:sessionId', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { userId } = req.user;
    
    const session = legalDocumentService.getSigningSession(sessionId);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }
    
    if (session.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    res.json({
      success: true,
      data: {
        sessionId: session.sessionId,
        status: session.status,
        documentIds: session.documentIds,
        signatures: Object.keys(session.signatures),
        createdAt: session.createdAt,
        expiresAt: session.expiresAt
      }
    });
  } catch (error) {
    console.error('Error getting signing session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get signing session'
    });
  }
});

/**
 * Get user's signed documents
 */
router.get('/user/signatures', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    
    const signatures = await legalDocumentService.getUserSignatures(userId);
    
    res.json({
      success: true,
      data: signatures
    });
  } catch (error) {
    console.error('Error getting user signatures:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user signatures'
    });
  }
});

/**
 * Check if user has signed all required documents
 */
router.get('/user/compliance', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    
    const hasSignedAll = await legalDocumentService.hasSignedAllRequired(userId);
    const signatures = await legalDocumentService.getUserSignatures(userId);
    
    res.json({
      success: true,
      data: {
        compliant: hasSignedAll,
        signatures: signatures,
        requiredDocuments: ['PPA', 'ESCA', 'PNA', 'MNDA'],
        message: hasSignedAll ? 'All required documents signed' : 'Missing required document signatures'
      }
    });
  } catch (error) {
    console.error('Error checking user compliance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check user compliance'
    });
  }
});

/**
 * Verify a document signature
 */
router.post('/verify', authenticateToken, async (req, res) => {
  try {
    const { sessionId, documentId } = req.body;
    
    const verification = legalDocumentService.verifySignature(sessionId, documentId);
    
    if (!verification.valid) {
      return res.status(400).json({
        success: false,
        message: verification.error
      });
    }
    
    res.json({
      success: true,
      data: {
        valid: true,
        signature: verification.signature
      }
    });
  } catch (error) {
    console.error('Error verifying signature:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify signature'
    });
  }
});

module.exports = router;
