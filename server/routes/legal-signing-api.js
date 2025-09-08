const express = require('express');
const { PrismaClient } = require('@prisma/client');
const legalDocumentService = require('../services/legal-document-service');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

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
    
    const session = legalDocumentService.generateSigningSession(userId, documentIds);
    
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
    const { documentId, signatureData } = req.body;
    const { userId } = req.user;
    
    // Add user info to signature data
    const enhancedSignatureData = {
      ...signatureData,
      userId,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    };
    
    const result = legalDocumentService.signDocument(sessionId, documentId, enhancedSignatureData);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }
    
    res.json({
      success: true,
      data: {
        signature: result.signature,
        allSigned: result.allSigned,
        message: result.allSigned ? 'All documents signed successfully!' : 'Document signed successfully'
      }
    });
  } catch (error) {
    console.error('Error signing document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sign document'
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
    
    const signatures = legalDocumentService.getUserSignatures(userId);
    
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
    
    const hasSignedAll = legalDocumentService.hasSignedAllRequired(userId);
    const signatures = legalDocumentService.getUserSignatures(userId);
    
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
