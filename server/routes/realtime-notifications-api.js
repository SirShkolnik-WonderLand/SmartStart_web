const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const WebSocket = require('ws');

const prisma = new PrismaClient();

// WebSocket connections storage
const connections = new Map();

// ===== REAL-TIME NOTIFICATIONS SYSTEM =====

// Create notification
router.post('/create', authenticateToken, async(req, res) => {
    try {
        const {
            recipientId,
            type, // 'TEAM_INVITATION', 'DOCUMENT_SIGNED', 'GOAL_COMPLETED', etc.
            title,
            message,
            data = {},
            priority = 'NORMAL', // 'LOW', 'NORMAL', 'HIGH', 'URGENT'
            expiresAt = null
        } = req.body;

        // Validate required fields
        if (!recipientId || !type || !title || !message) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: recipientId, type, title, message'
            });
        }

        // Create notification
        const notification = await prisma.notification.create({
            data: {
                recipientId,
                type,
                title,
                message,
                data: JSON.stringify(data),
                priority,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                status: 'UNREAD',
                createdAt: new Date()
            }
        });

        // Send real-time notification via WebSocket
        await sendRealtimeNotification(recipientId, notification);

        res.json({
            success: true,
            data: { notification }
        });

    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create notification'
        });
    }
});

// Get user notifications
router.get('/user/:userId', authenticateToken, async(req, res) => {
    try {
        const { userId } = req.params;
        const {
            page = 1,
                limit = 20,
                status = 'ALL',
                type,
                priority
        } = req.query;

        const whereClause = {
            recipientId: userId,
            ...(status !== 'ALL' && { status }),
            ...(type && { type }),
            ...(priority && { priority })
        };

        const [notifications, totalCount] = await Promise.all([
            prisma.notification.findMany({
                where: whereClause,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: parseInt(limit)
            }),
            prisma.notification.count({ where: whereClause })
        ]);

        res.json({
            success: true,
            data: {
                notifications,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: totalCount,
                    pages: Math.ceil(totalCount / limit)
                }
            }
        });

    } catch (error) {
        console.error('Error fetching user notifications:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user notifications'
        });
    }
});

// Mark notification as read
router.put('/:notificationId/read', authenticateToken, async(req, res) => {
    try {
        const { notificationId } = req.params;

        const notification = await prisma.notification.update({
            where: { id: notificationId },
            data: {
                status: 'READ',
                readAt: new Date()
            }
        });

        res.json({
            success: true,
            data: { notification }
        });

    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to mark notification as read'
        });
    }
});

// Mark all notifications as read
router.put('/user/:userId/read-all', authenticateToken, async(req, res) => {
    try {
        const { userId } = req.params;

        const result = await prisma.notification.updateMany({
            where: {
                recipientId: userId,
                status: 'UNREAD'
            },
            data: {
                status: 'READ',
                readAt: new Date()
            }
        });

        res.json({
            success: true,
            data: { updatedCount: result.count }
        });

    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to mark all notifications as read'
        });
    }
});

// Delete notification
router.delete('/:notificationId', authenticateToken, async(req, res) => {
    try {
        const { notificationId } = req.params;

        await prisma.notification.delete({
            where: { id: notificationId }
        });

        res.json({
            success: true,
            message: 'Notification deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete notification'
        });
    }
});

// Get notification statistics
router.get('/stats/:userId', authenticateToken, async(req, res) => {
    try {
        const { userId } = req.params;

        const [
            totalNotifications,
            unreadCount,
            notificationsByType,
            notificationsByPriority,
            recentNotifications
        ] = await Promise.all([
            prisma.notification.count({
                where: { recipientId: userId }
            }),
            prisma.notification.count({
                where: {
                    recipientId: userId,
                    status: 'UNREAD'
                }
            }),
            prisma.notification.groupBy({
                by: ['type'],
                where: { recipientId: userId },
                _count: { id: true }
            }),
            prisma.notification.groupBy({
                by: ['priority'],
                where: { recipientId: userId },
                _count: { id: true }
            }),
            prisma.notification.findMany({
                where: { recipientId: userId },
                orderBy: { createdAt: 'desc' },
                take: 5
            })
        ]);

        res.json({
            success: true,
            data: {
                totalNotifications,
                unreadCount,
                notificationsByType,
                notificationsByPriority,
                recentNotifications
            }
        });

    } catch (error) {
        console.error('Error fetching notification statistics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch notification statistics'
        });
    }
});

// ===== WEBSOCKET CONNECTION MANAGEMENT =====

// WebSocket connection handler
function handleWebSocketConnection(ws, req) {
    const userId = req.user ? .id;

    if (!userId) {
        ws.close(1008, 'Authentication required');
        return;
    }

    // Store connection
    connections.set(userId, ws);

    // Send connection confirmation
    ws.send(JSON.stringify({
        type: 'CONNECTION_ESTABLISHED',
        userId,
        timestamp: new Date().toISOString()
    }));

    // Handle incoming messages
    ws.on('message', async(message) => {
        try {
            const data = JSON.parse(message);
            await handleWebSocketMessage(userId, data);
        } catch (error) {
            console.error('Error handling WebSocket message:', error);
            ws.send(JSON.stringify({
                type: 'ERROR',
                message: 'Invalid message format'
            }));
        }
    });

    // Handle connection close
    ws.on('close', () => {
        connections.delete(userId);
        console.log(`WebSocket connection closed for user ${userId}`);
    });

    // Handle errors
    ws.on('error', (error) => {
        console.error(`WebSocket error for user ${userId}:`, error);
        connections.delete(userId);
    });
}

// Handle WebSocket messages
async function handleWebSocketMessage(userId, data) {
    const { type, payload } = data;

    switch (type) {
        case 'PING':
            // Respond to ping with pong
            const connection = connections.get(userId);
            if (connection) {
                connection.send(JSON.stringify({
                    type: 'PONG',
                    timestamp: new Date().toISOString()
                }));
            }
            break;

        case 'SUBSCRIBE_TO_VENTURE':
            // Subscribe to venture updates
            if (payload.ventureId) {
                // Implementation for venture-specific subscriptions
                console.log(`User ${userId} subscribed to venture ${payload.ventureId}`);
            }
            break;

        case 'SUBSCRIBE_TO_TEAM':
            // Subscribe to team updates
            if (payload.teamId) {
                // Implementation for team-specific subscriptions
                console.log(`User ${userId} subscribed to team ${payload.teamId}`);
            }
            break;

        default:
            console.log(`Unknown WebSocket message type: ${type}`);
    }
}

// Send real-time notification
async function sendRealtimeNotification(recipientId, notification) {
    const connection = connections.get(recipientId);

    if (connection && connection.readyState === WebSocket.OPEN) {
        try {
            connection.send(JSON.stringify({
                type: 'NOTIFICATION',
                data: notification
            }));
        } catch (error) {
            console.error('Error sending real-time notification:', error);
        }
    }
}

// Broadcast to all connected users
function broadcastToAll(message) {
    connections.forEach((connection, userId) => {
        if (connection.readyState === WebSocket.OPEN) {
            try {
                connection.send(JSON.stringify(message));
            } catch (error) {
                console.error(`Error broadcasting to user ${userId}:`, error);
            }
        }
    });
}

// Broadcast to specific users
function broadcastToUsers(userIds, message) {
    userIds.forEach(userId => {
        const connection = connections.get(userId);
        if (connection && connection.readyState === WebSocket.OPEN) {
            try {
                connection.send(JSON.stringify(message));
            } catch (error) {
                console.error(`Error broadcasting to user ${userId}:`, error);
            }
        }
    });
}

// ===== NOTIFICATION TRIGGERS =====

// Trigger notification for team invitation
async function triggerTeamInvitationNotification(invitation) {
    const notification = await prisma.notification.create({
        data: {
            recipientId: invitation.invitedUserId,
            type: 'TEAM_INVITATION',
            title: 'Team Invitation',
            message: `You've been invited to join a team as ${invitation.role}`,
            data: JSON.stringify({
                invitationId: invitation.id,
                teamId: invitation.teamId,
                role: invitation.role
            }),
            priority: 'NORMAL',
            status: 'UNREAD',
            createdAt: new Date()
        }
    });

    await sendRealtimeNotification(invitation.invitedUserId, notification);
}

// Trigger notification for document signature
async function triggerDocumentSignatureNotification(signature) {
    const notification = await prisma.notification.create({
        data: {
            recipientId: signature.signerId,
            type: 'DOCUMENT_SIGNED',
            title: 'Document Signed',
            message: `You have successfully signed a ${signature.documentType} document`,
            data: JSON.stringify({
                signatureId: signature.id,
                documentId: signature.documentId,
                documentType: signature.documentType
            }),
            priority: 'NORMAL',
            status: 'UNREAD',
            createdAt: new Date()
        }
    });

    await sendRealtimeNotification(signature.signerId, notification);
}

// Trigger notification for goal completion
async function triggerGoalCompletionNotification(goal, userId) {
    const notification = await prisma.notification.create({
        data: {
            recipientId: userId,
            type: 'GOAL_COMPLETED',
            title: 'Goal Completed!',
            message: `Congratulations! You've completed the goal: ${goal.title}`,
            data: JSON.stringify({
                goalId: goal.id,
                goalTitle: goal.title,
                xpReward: goal.xpReward || 0
            }),
            priority: 'HIGH',
            status: 'UNREAD',
            createdAt: new Date()
        }
    });

    await sendRealtimeNotification(userId, notification);
}

// Export WebSocket handler
router.handleWebSocketConnection = handleWebSocketConnection;

// Export notification triggers
router.triggerTeamInvitationNotification = triggerTeamInvitationNotification;
router.triggerDocumentSignatureNotification = triggerDocumentSignatureNotification;
router.triggerGoalCompletionNotification = triggerGoalCompletionNotification;

// Export broadcast functions
router.broadcastToAll = broadcastToAll;
router.broadcastToUsers = broadcastToUsers;

module.exports = router;