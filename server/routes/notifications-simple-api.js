const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const prisma = new PrismaClient();

// ===== SIMPLIFIED NOTIFICATIONS SYSTEM =====

// Create notification
router.post('/create', authenticateToken, async (req, res) => {
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
router.get('/user/:userId', authenticateToken, async (req, res) => {
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
router.put('/:notificationId/read', authenticateToken, async (req, res) => {
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
router.put('/user/:userId/read-all', authenticateToken, async (req, res) => {
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
router.delete('/:notificationId', authenticateToken, async (req, res) => {
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
router.get('/stats/:userId', authenticateToken, async (req, res) => {
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

module.exports = router;
