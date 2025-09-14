#!/usr/bin/env node

/**
 * SmartStart Collaboration API Endpoints
 * RESTful API for collaborative editing and team features
 */

const express = require('express');
const collaborationService = require('./collaboration-service');

const router = express.Router();

// Middleware for authentication and validation
const authenticateUser = (req, res, next) => {
    const token = req.headers.authorization ? .split(' ')[1];
    if (!token) {
        return res.status(401).json({ success: false, error: 'No token provided' });
    }

    // In a real implementation, this would validate the JWT token
    req.user = { id: 'user-123', email: 'user@example.com', name: 'Test User' };
    next();
};

// Start collaboration session
router.post('/session/start', authenticateUser, async(req, res) => {
    try {
        const { documentId, documentType = 'document' } = req.body;
        const userId = req.user.id;

        if (!documentId) {
            return res.status(400).json({
                success: false,
                error: 'documentId is required'
            });
        }

        const result = await collaborationService.startCollaborationSession(userId, documentId, documentType);

        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// End collaboration session
router.post('/session/end', authenticateUser, async(req, res) => {
    try {
        const { sessionId } = req.body;
        const userId = req.user.id;

        if (!sessionId) {
            return res.status(400).json({
                success: false,
                error: 'sessionId is required'
            });
        }

        const result = await collaborationService.endCollaborationSession(sessionId, userId);

        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get document state
router.get('/document/:documentId/state', authenticateUser, async(req, res) => {
    try {
        const { documentId } = req.params;
        const userId = req.user.id;

        const result = await collaborationService.getDocumentState(documentId, userId);

        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Apply document operation
router.post('/document/:documentId/operation', authenticateUser, async(req, res) => {
    try {
        const { documentId } = req.params;
        const { sessionId, operation } = req.body;
        const userId = req.user.id;

        if (!sessionId || !operation) {
            return res.status(400).json({
                success: false,
                error: 'sessionId and operation are required'
            });
        }

        const result = await collaborationService.applyDocumentOperation(sessionId, documentId, operation, userId);

        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Add document comment
router.post('/document/:documentId/comment', authenticateUser, async(req, res) => {
    try {
        const { documentId } = req.params;
        const { comment } = req.body;
        const userId = req.user.id;

        if (!comment) {
            return res.status(400).json({
                success: false,
                error: 'comment is required'
            });
        }

        const result = await collaborationService.addDocumentComment(documentId, comment, userId);

        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Resolve document comment
router.put('/document/:documentId/comment/:commentId/resolve', authenticateUser, async(req, res) => {
    try {
        const { documentId, commentId } = req.params;
        const userId = req.user.id;

        const result = await collaborationService.resolveDocumentComment(documentId, commentId, userId);

        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Share document
router.post('/document/:documentId/share', authenticateUser, async(req, res) => {
    try {
        const { documentId } = req.params;
        const { shareWith, permissions } = req.body;
        const userId = req.user.id;

        if (!shareWith || !permissions) {
            return res.status(400).json({
                success: false,
                error: 'shareWith and permissions are required'
            });
        }

        const result = await collaborationService.shareDocument(documentId, shareWith, permissions, userId);

        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Update document permissions
router.put('/document/:documentId/permissions/:targetUserId', authenticateUser, async(req, res) => {
    try {
        const { documentId, targetUserId } = req.params;
        const { permissions } = req.body;
        const userId = req.user.id;

        if (!permissions) {
            return res.status(400).json({
                success: false,
                error: 'permissions are required'
            });
        }

        const result = await collaborationService.updateDocumentPermissions(documentId, targetUserId, permissions, userId);

        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get collaboration stats
router.get('/stats', authenticateUser, async(req, res) => {
    try {
        const stats = await collaborationService.getCollaborationStats();

        res.json({
            success: true,
            stats: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get active sessions
router.get('/sessions', authenticateUser, async(req, res) => {
    try {
        const { documentId } = req.query;
        const userId = req.user.id;

        // This would query active sessions from the service
        // For now, return mock data
        const sessions = [{
            id: 'session-1',
            userId: 'user-1',
            documentId: documentId || 'doc-1',
            documentType: 'document',
            startTime: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
            status: 'active'
        }];

        res.json({
            success: true,
            sessions: sessions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get document collaborators
router.get('/document/:documentId/collaborators', authenticateUser, async(req, res) => {
    try {
        const { documentId } = req.params;
        const userId = req.user.id;

        const result = await collaborationService.getDocumentState(documentId, userId);

        res.json({
            success: true,
            collaborators: result.collaborators
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get document version history
router.get('/document/:documentId/history', authenticateUser, async(req, res) => {
    try {
        const { documentId } = req.params;
        const { limit = 50, offset = 0 } = req.query;
        const userId = req.user.id;

        const result = await collaborationService.getDocumentState(documentId, userId);

        res.json({
            success: true,
            history: result.versionHistory.slice(offset, offset + limit),
            total: result.versionHistory.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get document comments
router.get('/document/:documentId/comments', authenticateUser, async(req, res) => {
    try {
        const { documentId } = req.params;
        const { status = 'all' } = req.query;
        const userId = req.user.id;

        // This would query comments from database
        // For now, return mock data
        const comments = [{
            id: 'comment-1',
            documentId: documentId,
            userId: 'user-1',
            content: 'This section needs clarification',
            position: { line: 10, column: 5 },
            timestamp: new Date().toISOString(),
            status: 'active',
            replies: []
        }];

        res.json({
            success: true,
            comments: comments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Update cursor position
router.post('/document/:documentId/cursor', authenticateUser, async(req, res) => {
    try {
        const { documentId } = req.params;
        const { sessionId, position } = req.body;
        const userId = req.user.id;

        if (!sessionId || !position) {
            return res.status(400).json({
                success: false,
                error: 'sessionId and position are required'
            });
        }

        // This would update cursor position
        res.json({
            success: true,
            message: 'Cursor position updated'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Health check
router.get('/health', (req, res) => {
    try {
        const health = collaborationService.getHealth();
        res.json({
            success: true,
            health: health
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;