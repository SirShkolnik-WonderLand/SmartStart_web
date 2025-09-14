#!/usr/bin/env node

/**
 * SmartStart Notifications API Endpoints
 * RESTful API for notification management
 */

const express = require('express');
const notificationsService = require('./notifications-service');

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

// Get user notifications
router.get('/', authenticateUser, async(req, res) => {
    try {
        const { limit = 50, offset = 0, category = null, status = null } = req.query;
        const userId = req.user.id;

        const result = await notificationsService.getUserNotifications(userId, {
            limit: parseInt(limit),
            offset: parseInt(offset),
            category,
            status
        });

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

// Mark notification as read
router.put('/:notificationId/read', authenticateUser, async(req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.user.id;

        await notificationsService.markNotificationAsRead(notificationId, userId);

        res.json({
            success: true,
            message: 'Notification marked as read'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Mark all notifications as read
router.put('/read-all', authenticateUser, async(req, res) => {
    try {
        const userId = req.user.id;

        await notificationsService.markAllNotificationsAsRead(userId);

        res.json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Delete notification
router.delete('/:notificationId', authenticateUser, async(req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.user.id;

        await notificationsService.deleteNotification(notificationId, userId);

        res.json({
            success: true,
            message: 'Notification deleted'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get notification preferences
router.get('/preferences', authenticateUser, async(req, res) => {
    try {
        const userId = req.user.id;
        const preferences = await notificationsService.getUserNotificationPreferences(userId);

        res.json({
            success: true,
            preferences: preferences
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Update notification preferences
router.put('/preferences', authenticateUser, async(req, res) => {
    try {
        const userId = req.user.id;
        const { preferences } = req.body;

        await notificationsService.updateUserNotificationPreferences(userId, preferences);

        res.json({
            success: true,
            message: 'Notification preferences updated'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Send custom notification
router.post('/send', authenticateUser, async(req, res) => {
    try {
        const { userId, notification } = req.body;

        if (!userId || !notification) {
            return res.status(400).json({
                success: false,
                error: 'userId and notification are required'
            });
        }

        const result = await notificationsService.sendCustomNotification(userId, notification);

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

// Get notification stats (admin only)
router.get('/stats', authenticateUser, async(req, res) => {
    try {
        const stats = await notificationsService.getNotificationStats();

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

// Get notification types
router.get('/types', authenticateUser, (req, res) => {
    try {
        const types = Array.from(notificationsService.notificationTypes.values());

        res.json({
            success: true,
            types: types
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Test notification
router.post('/test', authenticateUser, async(req, res) => {
    try {
        const { type = 'test', message = 'This is a test notification' } = req.body;
        const userId = req.user.id;

        const testNotification = {
            title: 'Test Notification',
            message: message,
            category: 'system',
            priority: 'low',
            channels: ['in_app']
        };

        const result = await notificationsService.sendCustomNotification(userId, testNotification);

        res.json({
            success: true,
            message: 'Test notification sent',
            ...result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get unread count
router.get('/unread-count', authenticateUser, async(req, res) => {
    try {
        const userId = req.user.id;
        const result = await notificationsService.getUserNotifications(userId, {
            limit: 1,
            offset: 0,
            status: 'unread'
        });

        res.json({
            success: true,
            unreadCount: result.total
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
        const health = notificationsService.getHealth();
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