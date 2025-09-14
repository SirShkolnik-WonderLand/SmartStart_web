#!/usr/bin/env node

/**
 * SmartStart Collaboration Service
 * Real-time collaborative editing and team features
 */

const eventSystem = require('./event-system');
const messageQueue = require('./message-queue');
const { PrismaClient } = require('@prisma/client');

class SmartStartCollaborationService {
    constructor(options = {}) {
        this.prisma = new PrismaClient();
        this.activeSessions = new Map(); // sessionId -> session data
        this.userSessions = new Map(); // userId -> Set of sessionIds
        this.documentVersions = new Map(); // documentId -> version history
        this.cursorPositions = new Map(); // sessionId -> cursor position
        this.operationQueue = new Map(); // documentId -> operation queue
        this.batchSize = options.batchSize || 100;
        this.processInterval = options.processInterval || 1000; // 1 second

        this.setupEventHandlers();
        this.startOperationProcessor();
    }

    setupEventHandlers() {
        // Listen for collaboration events
        const eventTypes = [
            'collaboration.session.start',
            'collaboration.session.end',
            'collaboration.document.open',
            'collaboration.document.close',
            'collaboration.operation',
            'collaboration.cursor.move',
            'collaboration.comment.add',
            'collaboration.comment.resolve',
            'collaboration.share',
            'collaboration.permission.change'
        ];

        eventTypes.forEach(eventType => {
            eventSystem.subscribe(eventType, this.handleCollaborationEvent.bind(this));
        });
    }

    startOperationProcessor() {
        // Process collaborative operations every second
        setInterval(() => {
            this.processOperationQueue();
        }, this.processInterval);

        console.log('🤝 Collaboration service started');
    }

    async handleCollaborationEvent(event) {
        try {
            switch (event.type) {
                case 'collaboration.session.start':
                    await this.handleSessionStart(event.data);
                    break;
                case 'collaboration.session.end':
                    await this.handleSessionEnd(event.data);
                    break;
                case 'collaboration.document.open':
                    await this.handleDocumentOpen(event.data);
                    break;
                case 'collaboration.document.close':
                    await this.handleDocumentClose(event.data);
                    break;
                case 'collaboration.operation':
                    await this.handleOperation(event.data);
                    break;
                case 'collaboration.cursor.move':
                    await this.handleCursorMove(event.data);
                    break;
                case 'collaboration.comment.add':
                    await this.handleCommentAdd(event.data);
                    break;
                case 'collaboration.comment.resolve':
                    await this.handleCommentResolve(event.data);
                    break;
                case 'collaboration.share':
                    await this.handleShare(event.data);
                    break;
                case 'collaboration.permission.change':
                    await this.handlePermissionChange(event.data);
                    break;
            }
        } catch (error) {
            console.error('❌ Error handling collaboration event:', error);
        }
    }

    async handleSessionStart(data) {
        try {
            const { sessionId, userId, documentId, documentType } = data;

            const session = {
                id: sessionId,
                userId: userId,
                documentId: documentId,
                documentType: documentType,
                startTime: new Date(),
                lastActivity: new Date(),
                status: 'active'
            };

            this.activeSessions.set(sessionId, session);

            if (!this.userSessions.has(userId)) {
                this.userSessions.set(userId, new Set());
            }
            this.userSessions.get(userId).add(sessionId);

            // Notify other users in the document
            await this.notifyDocumentUsers(documentId, {
                type: 'USER_JOINED',
                userId: userId,
                sessionId: sessionId,
                timestamp: new Date()
            });

            console.log(`🤝 User ${userId} started collaboration session on ${documentType}:${documentId}`);
        } catch (error) {
            console.error('❌ Error handling session start:', error);
        }
    }

    async handleSessionEnd(data) {
        try {
            const { sessionId, userId } = data;

            const session = this.activeSessions.get(sessionId);
            if (session) {
                session.status = 'ended';
                session.endTime = new Date();

                // Notify other users
                await this.notifyDocumentUsers(session.documentId, {
                    type: 'USER_LEFT',
                    userId: userId,
                    sessionId: sessionId,
                    timestamp: new Date()
                });

                // Clean up
                this.activeSessions.delete(sessionId);
                this.cursorPositions.delete(sessionId);

                if (this.userSessions.has(userId)) {
                    this.userSessions.get(userId).delete(sessionId);
                }

                console.log(`🤝 User ${userId} ended collaboration session ${sessionId}`);
            }
        } catch (error) {
            console.error('❌ Error handling session end:', error);
        }
    }

    async handleDocumentOpen(data) {
        try {
            const { documentId, userId, documentType } = data;

            // Load document content and version history
            const document = await this.loadDocument(documentId, documentType);
            const versionHistory = this.documentVersions.get(documentId) || [];

            // Send document state to user
            eventSystem.publishEvent('websocket.document.state', {
                type: 'DOCUMENT_STATE',
                documentId: documentId,
                content: document.content,
                version: document.version,
                history: versionHistory,
                collaborators: await this.getDocumentCollaborators(documentId)
            });

            console.log(`📄 User ${userId} opened document ${documentId}`);
        } catch (error) {
            console.error('❌ Error handling document open:', error);
        }
    }

    async handleDocumentClose(data) {
        try {
            const { documentId, userId } = data;

            // Save document state
            await this.saveDocumentState(documentId, userId);

            console.log(`📄 User ${userId} closed document ${documentId}`);
        } catch (error) {
            console.error('❌ Error handling document close:', error);
        }
    }

    async handleOperation(data) {
        try {
            const { sessionId, documentId, operation, userId } = data;

            // Add operation to queue
            if (!this.operationQueue.has(documentId)) {
                this.operationQueue.set(documentId, []);
            }

            const operationWithMeta = {
                ...operation,
                sessionId: sessionId,
                userId: userId,
                timestamp: new Date(),
                id: this.generateOperationId()
            };

            this.operationQueue.get(documentId).push(operationWithMeta);

            // Apply operation locally
            await this.applyOperation(documentId, operationWithMeta);

            // Notify other collaborators
            await this.notifyDocumentUsers(documentId, {
                type: 'OPERATION',
                operation: operationWithMeta,
                excludeUserId: userId
            });

            console.log(`✏️ Operation applied to document ${documentId} by user ${userId}`);
        } catch (error) {
            console.error('❌ Error handling operation:', error);
        }
    }

    async handleCursorMove(data) {
        try {
            const { sessionId, documentId, position, userId } = data;

            this.cursorPositions.set(sessionId, {
                position: position,
                timestamp: new Date(),
                userId: userId
            });

            // Notify other collaborators
            await this.notifyDocumentUsers(documentId, {
                type: 'CURSOR_MOVE',
                sessionId: sessionId,
                position: position,
                userId: userId,
                excludeUserId: userId
            });
        } catch (error) {
            console.error('❌ Error handling cursor move:', error);
        }
    }

    async handleCommentAdd(data) {
        try {
            const { documentId, comment, userId } = data;

            const commentWithMeta = {
                ...comment,
                id: this.generateCommentId(),
                userId: userId,
                timestamp: new Date(),
                status: 'active'
            };

            // Store comment
            await this.storeComment(documentId, commentWithMeta);

            // Notify collaborators
            await this.notifyDocumentUsers(documentId, {
                type: 'COMMENT_ADDED',
                comment: commentWithMeta
            });

            console.log(`💬 Comment added to document ${documentId} by user ${userId}`);
        } catch (error) {
            console.error('❌ Error handling comment add:', error);
        }
    }

    async handleCommentResolve(data) {
        try {
            const { documentId, commentId, userId } = data;

            // Update comment status
            await this.updateCommentStatus(documentId, commentId, 'resolved', userId);

            // Notify collaborators
            await this.notifyDocumentUsers(documentId, {
                type: 'COMMENT_RESOLVED',
                commentId: commentId,
                userId: userId
            });

            console.log(`💬 Comment ${commentId} resolved by user ${userId}`);
        } catch (error) {
            console.error('❌ Error handling comment resolve:', error);
        }
    }

    async handleShare(data) {
        try {
            const { documentId, shareWith, permissions, userId } = data;

            // Update document permissions
            await this.updateDocumentPermissions(documentId, shareWith, permissions, userId);

            // Notify new collaborators
            for (const userId of shareWith) {
                eventSystem.publishEvent('websocket.document.shared', {
                    type: 'DOCUMENT_SHARED',
                    documentId: documentId,
                    permissions: permissions,
                    sharedBy: userId
                });
            }

            console.log(`🔗 Document ${documentId} shared with ${shareWith.length} users`);
        } catch (error) {
            console.error('❌ Error handling share:', error);
        }
    }

    async handlePermissionChange(data) {
        try {
            const { documentId, userId, newPermissions, changedBy } = data;

            // Update user permissions
            await this.updateUserPermissions(documentId, userId, newPermissions, changedBy);

            // Notify user
            eventSystem.publishEvent('websocket.permission.changed', {
                type: 'PERMISSION_CHANGED',
                documentId: documentId,
                permissions: newPermissions,
                changedBy: changedBy
            });

            console.log(`🔐 Permissions updated for user ${userId} on document ${documentId}`);
        } catch (error) {
            console.error('❌ Error handling permission change:', error);
        }
    }

    async processOperationQueue() {
        try {
            for (const [documentId, operations] of this.operationQueue) {
                if (operations.length === 0) continue;

                // Process operations in batches
                const batch = operations.splice(0, this.batchSize);

                for (const operation of batch) {
                    await this.processOperation(operation);
                }
            }
        } catch (error) {
            console.error('❌ Error processing operation queue:', error);
        }
    }

    async processOperation(operation) {
        try {
            // Apply operation to document
            await this.applyOperation(operation.documentId, operation);

            // Update document version
            await this.updateDocumentVersion(operation.documentId, operation);

            // Store operation in history
            await this.storeOperationHistory(operation);
        } catch (error) {
            console.error('❌ Error processing operation:', error);
        }
    }

    async applyOperation(documentId, operation) {
        try {
            // This would apply the operation to the document content
            // For now, just log
            console.log(`✏️ Applying operation ${operation.id} to document ${documentId}`);
        } catch (error) {
            console.error('❌ Error applying operation:', error);
        }
    }

    async updateDocumentVersion(documentId, operation) {
        try {
            if (!this.documentVersions.has(documentId)) {
                this.documentVersions.set(documentId, []);
            }

            const versions = this.documentVersions.get(documentId);
            versions.push({
                operationId: operation.id,
                userId: operation.userId,
                timestamp: operation.timestamp,
                version: versions.length + 1
            });
        } catch (error) {
            console.error('❌ Error updating document version:', error);
        }
    }

    async storeOperationHistory(operation) {
        try {
            // This would store in database
            console.log(`📝 Storing operation history: ${operation.id}`);
        } catch (error) {
            console.error('❌ Error storing operation history:', error);
        }
    }

    async loadDocument(documentId, documentType) {
        try {
            // This would load from database
            // For now, return mock data
            return {
                id: documentId,
                content: 'Mock document content',
                version: 1,
                lastModified: new Date()
            };
        } catch (error) {
            console.error('❌ Error loading document:', error);
            return null;
        }
    }

    async saveDocumentState(documentId, userId) {
        try {
            // This would save to database
            console.log(`💾 Saving document state for ${documentId} by user ${userId}`);
        } catch (error) {
            console.error('❌ Error saving document state:', error);
        }
    }

    async getDocumentCollaborators(documentId) {
        try {
            const collaborators = [];

            for (const [sessionId, session] of this.activeSessions) {
                if (session.documentId === documentId && session.status === 'active') {
                    collaborators.push({
                        userId: session.userId,
                        sessionId: sessionId,
                        lastActivity: session.lastActivity,
                        cursorPosition: this.cursorPositions.get(sessionId)
                    });
                }
            }

            return collaborators;
        } catch (error) {
            console.error('❌ Error getting document collaborators:', error);
            return [];
        }
    }

    async notifyDocumentUsers(documentId, message) {
        try {
            const collaborators = await this.getDocumentCollaborators(documentId);

            for (const collaborator of collaborators) {
                if (message.excludeUserId && collaborator.userId === message.excludeUserId) {
                    continue;
                }

                eventSystem.publishEvent('websocket.collaboration', {
                    type: 'COLLABORATION_UPDATE',
                    userId: collaborator.userId,
                    documentId: documentId,
                    message: message
                });
            }
        } catch (error) {
            console.error('❌ Error notifying document users:', error);
        }
    }

    async storeComment(documentId, comment) {
        try {
            // This would store in database
            console.log(`💬 Storing comment: ${comment.id}`);
        } catch (error) {
            console.error('❌ Error storing comment:', error);
        }
    }

    async updateCommentStatus(documentId, commentId, status, userId) {
        try {
            // This would update in database
            console.log(`💬 Updating comment ${commentId} status to ${status}`);
        } catch (error) {
            console.error('❌ Error updating comment status:', error);
        }
    }

    async updateDocumentPermissions(documentId, shareWith, permissions, userId) {
        try {
            // This would update in database
            console.log(`🔐 Updating document permissions for ${documentId}`);
        } catch (error) {
            console.error('❌ Error updating document permissions:', error);
        }
    }

    async updateUserPermissions(documentId, userId, permissions, changedBy) {
        try {
            // This would update in database
            console.log(`🔐 Updating user permissions for ${userId} on ${documentId}`);
        } catch (error) {
            console.error('❌ Error updating user permissions:', error);
        }
    }

    // API Methods
    async startCollaborationSession(userId, documentId, documentType) {
        try {
            const sessionId = this.generateSessionId();

            await this.handleSessionStart({
                sessionId: sessionId,
                userId: userId,
                documentId: documentId,
                documentType: documentType
            });

            return { sessionId: sessionId };
        } catch (error) {
            console.error('❌ Error starting collaboration session:', error);
            throw error;
        }
    }

    async endCollaborationSession(sessionId, userId) {
        try {
            await this.handleSessionEnd({
                sessionId: sessionId,
                userId: userId
            });

            return { success: true };
        } catch (error) {
            console.error('❌ Error ending collaboration session:', error);
            throw error;
        }
    }

    async getDocumentState(documentId, userId) {
        try {
            const document = await this.loadDocument(documentId, 'document');
            const collaborators = await this.getDocumentCollaborators(documentId);
            const versionHistory = this.documentVersions.get(documentId) || [];

            return {
                document: document,
                collaborators: collaborators,
                versionHistory: versionHistory
            };
        } catch (error) {
            console.error('❌ Error getting document state:', error);
            throw error;
        }
    }

    async applyDocumentOperation(sessionId, documentId, operation, userId) {
        try {
            await this.handleOperation({
                sessionId: sessionId,
                documentId: documentId,
                operation: operation,
                userId: userId
            });

            return { success: true };
        } catch (error) {
            console.error('❌ Error applying document operation:', error);
            throw error;
        }
    }

    async addDocumentComment(documentId, comment, userId) {
        try {
            await this.handleCommentAdd({
                documentId: documentId,
                comment: comment,
                userId: userId
            });

            return { success: true };
        } catch (error) {
            console.error('❌ Error adding document comment:', error);
            throw error;
        }
    }

    async resolveDocumentComment(documentId, commentId, userId) {
        try {
            await this.handleCommentResolve({
                documentId: documentId,
                commentId: commentId,
                userId: userId
            });

            return { success: true };
        } catch (error) {
            console.error('❌ Error resolving document comment:', error);
            throw error;
        }
    }

    async shareDocument(documentId, shareWith, permissions, userId) {
        try {
            await this.handleShare({
                documentId: documentId,
                shareWith: shareWith,
                permissions: permissions,
                userId: userId
            });

            return { success: true };
        } catch (error) {
            console.error('❌ Error sharing document:', error);
            throw error;
        }
    }

    async updateDocumentPermissions(documentId, userId, permissions, changedBy) {
        try {
            await this.handlePermissionChange({
                documentId: documentId,
                userId: userId,
                newPermissions: permissions,
                changedBy: changedBy
            });

            return { success: true };
        } catch (error) {
            console.error('❌ Error updating document permissions:', error);
            throw error;
        }
    }

    async getCollaborationStats() {
        try {
            return {
                activeSessions: this.activeSessions.size,
                activeUsers: this.userSessions.size,
                documentsInUse: new Set(Array.from(this.activeSessions.values()).map(s => s.documentId)).size,
                totalOperations: Array.from(this.operationQueue.values()).reduce((total, queue) => total + queue.length, 0)
            };
        } catch (error) {
            console.error('❌ Error getting collaboration stats:', error);
            throw error;
        }
    }

    generateSessionId() {
        return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    generateOperationId() {
        return `op-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    generateCommentId() {
        return `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Health check
    getHealth() {
        return {
            status: 'healthy',
            service: 'collaboration',
            timestamp: new Date(),
            activeSessions: this.activeSessions.size,
            activeUsers: this.userSessions.size,
            uptime: process.uptime()
        };
    }

    // Cleanup
    async destroy() {
        try {
            await this.prisma.$disconnect();
            this.activeSessions.clear();
            this.userSessions.clear();
            this.documentVersions.clear();
            this.cursorPositions.clear();
            this.operationQueue.clear();
            console.log('✅ Collaboration service destroyed');
        } catch (error) {
            console.error('❌ Error destroying collaboration service:', error);
        }
    }
}

// Create singleton instance
const collaborationService = new SmartStartCollaborationService({
    batchSize: 100,
    processInterval: 1000
});

module.exports = collaborationService;