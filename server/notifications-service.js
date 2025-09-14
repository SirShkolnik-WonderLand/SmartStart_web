#!/usr/bin/env node

/**
 * SmartStart Notifications Service
 * Comprehensive real-time notification system
 */

const eventSystem = require('./event-system');
const messageQueue = require('./message-queue');
const { PrismaClient } = require('@prisma/client');

class SmartStartNotificationsService {
    constructor(options = {}) {
        this.prisma = new PrismaClient();
        this.notificationTypes = new Map();
        this.userPreferences = new Map();
        this.notificationQueue = new Map();
        this.batchSize = options.batchSize || 100;
        this.processInterval = options.processInterval || 5000; // 5 seconds

        this.setupNotificationTypes();
        this.setupEventHandlers();
        this.startNotificationProcessor();
    }

    setupNotificationTypes() {
        const types = [{
                id: 'user.welcome',
                name: 'Welcome Notification',
                description: 'Welcome new users to the platform',
                category: 'system',
                priority: 'low',
                channels: ['in_app', 'email'],
                template: 'Welcome to SmartStart! Get started by creating your first venture.'
            },
            {
                id: 'venture.created',
                name: 'Venture Created',
                description: 'Notify when a new venture is created',
                category: 'venture',
                priority: 'medium',
                channels: ['in_app', 'email'],
                template: 'New venture "{ventureName}" has been created by {userName}.'
            },
            {
                id: 'venture.updated',
                name: 'Venture Updated',
                description: 'Notify when a venture is updated',
                category: 'venture',
                priority: 'medium',
                channels: ['in_app'],
                template: 'Venture "{ventureName}" has been updated by {userName}.'
            },
            {
                id: 'team.invitation',
                name: 'Team Invitation',
                description: 'Invite users to join a team',
                category: 'team',
                priority: 'high',
                channels: ['in_app', 'email', 'push'],
                template: 'You have been invited to join team "{teamName}" by {userName}.'
            },
            {
                id: 'buz.transaction',
                name: 'BUZ Transaction',
                description: 'Notify about BUZ token transactions',
                category: 'buz',
                priority: 'medium',
                channels: ['in_app'],
                template: 'BUZ transaction: {amount} tokens {type} - {description}.'
            },
            {
                id: 'payment.succeeded',
                name: 'Payment Successful',
                description: 'Notify when payment is successful',
                category: 'payment',
                priority: 'high',
                channels: ['in_app', 'email'],
                template: 'Payment of ${amount} has been processed successfully.'
            },
            {
                id: 'payment.failed',
                name: 'Payment Failed',
                description: 'Notify when payment fails',
                category: 'payment',
                priority: 'high',
                channels: ['in_app', 'email'],
                template: 'Payment of ${amount} failed. Please check your payment method.'
            },
            {
                id: 'subscription.created',
                name: 'Subscription Created',
                description: 'Notify when subscription is created',
                category: 'subscription',
                priority: 'medium',
                channels: ['in_app', 'email'],
                template: 'Your subscription to {planName} has been activated.'
            },
            {
                id: 'subscription.cancelled',
                name: 'Subscription Cancelled',
                description: 'Notify when subscription is cancelled',
                category: 'subscription',
                priority: 'medium',
                channels: ['in_app', 'email'],
                template: 'Your subscription to {planName} has been cancelled.'
            },
            {
                id: 'legal.document.signed',
                name: 'Document Signed',
                description: 'Notify when legal document is signed',
                category: 'legal',
                priority: 'high',
                channels: ['in_app', 'email'],
                template: 'Legal document "{documentName}" has been signed by {userName}.'
            },
            {
                id: 'revenue.share.completed',
                name: 'Revenue Share Completed',
                description: 'Notify when revenue share is completed',
                category: 'revenue',
                priority: 'high',
                channels: ['in_app', 'email'],
                template: 'Revenue share of ${amount} has been processed for {ventureName}.'
            },
            {
                id: 'system.maintenance',
                name: 'System Maintenance',
                description: 'Notify about system maintenance',
                category: 'system',
                priority: 'high',
                channels: ['in_app', 'email', 'push'],
                template: 'System maintenance scheduled for {date} from {startTime} to {endTime}.'
            }
        ];

        types.forEach(type => {
            this.notificationTypes.set(type.id, type);
        });
    }

    setupEventHandlers() {
        // Listen for all system events to generate notifications
        const eventTypes = [
            'user.created', 'user.updated', 'user.deleted',
            'venture.created', 'venture.updated', 'venture.deleted',
            'team.created', 'team.updated', 'team.deleted',
            'team.member.invited', 'team.member.joined', 'team.member.left',
            'buz.transaction', 'buz.award', 'buz.spend',
            'payment.succeeded', 'payment.failed',
            'subscription.created', 'subscription.updated', 'subscription.cancelled',
            'legal.document.signed', 'legal.document.updated',
            'revenue.share.completed', 'revenue.umbrella.transfer',
            'system.maintenance', 'system.alert'
        ];

        eventTypes.forEach(eventType => {
            eventSystem.subscribe(eventType, this.handleEventForNotifications.bind(this));
        });
    }

    startNotificationProcessor() {
        // Process notification queue every 5 seconds
        setInterval(() => {
            this.processNotificationQueue();
        }, this.processInterval);

        console.log('🔔 Notifications service started');
    }

    async handleEventForNotifications(event) {
        try {
            const notificationType = this.getNotificationTypeFromEvent(event.type);
            if (!notificationType) return;

            const notification = await this.createNotification(notificationType, event);
            if (notification) {
                await this.queueNotification(notification);
            }
        } catch (error) {
            console.error('❌ Error handling event for notifications:', error);
        }
    }

    getNotificationTypeFromEvent(eventType) {
        const typeMap = {
            'user.created': 'user.welcome',
            'venture.created': 'venture.created',
            'venture.updated': 'venture.updated',
            'team.member.invited': 'team.invitation',
            'buz.transaction': 'buz.transaction',
            'payment.succeeded': 'payment.succeeded',
            'payment.failed': 'payment.failed',
            'subscription.created': 'subscription.created',
            'subscription.cancelled': 'subscription.cancelled',
            'legal.document.signed': 'legal.document.signed',
            'revenue.share.completed': 'revenue.share.completed',
            'system.maintenance': 'system.maintenance'
        };

        const typeId = typeMap[eventType];
        return typeId ? this.notificationTypes.get(typeId) : null;
    }

    async createNotification(notificationType, event) {
        try {
            const notification = {
                id: this.generateNotificationId(),
                type: notificationType.id,
                userId: event.data.userId || event.data.recipientId,
                title: notificationType.name,
                message: this.formatMessage(notificationType.template, event.data),
                category: notificationType.category,
                priority: notificationType.priority,
                channels: notificationType.channels,
                data: event.data,
                timestamp: new Date(),
                status: 'pending'
            };

            return notification;
        } catch (error) {
            console.error('❌ Error creating notification:', error);
            return null;
        }
    }

    formatMessage(template, data) {
        let message = template;

        // Replace placeholders with actual data
        const placeholders = {
            '{userName}': data.userName || data.name || 'User',
            '{ventureName}': data.ventureName || data.name || 'Venture',
            '{teamName}': data.teamName || data.name || 'Team',
            '{documentName}': data.documentName || data.name || 'Document',
            '{planName}': data.planName || data.plan || 'Plan',
            '{amount}': data.amount ? `$${data.amount}` : '$0',
            '{type}': data.type || 'transaction',
            '{description}': data.description || '',
            '{date}': data.date || new Date().toLocaleDateString(),
            '{startTime}': data.startTime || 'TBD',
            '{endTime}': data.endTime || 'TBD'
        };

        Object.entries(placeholders).forEach(([placeholder, value]) => {
            message = message.replace(new RegExp(placeholder, 'g'), value);
        });

        return message;
    }

    async queueNotification(notification) {
        try {
            // Add to notification queue
            if (!this.notificationQueue.has(notification.userId)) {
                this.notificationQueue.set(notification.userId, []);
            }

            this.notificationQueue.get(notification.userId).push(notification);

            // Store in database
            await this.storeNotification(notification);

            console.log(`🔔 Notification queued for user ${notification.userId}: ${notification.type}`);
        } catch (error) {
            console.error('❌ Error queuing notification:', error);
        }
    }

    async storeNotification(notification) {
        try {
            // This would store in database
            // For now, just log
            console.log(`📝 Storing notification: ${notification.id}`);
        } catch (error) {
            console.error('❌ Error storing notification:', error);
        }
    }

    async processNotificationQueue() {
        try {
            for (const [userId, notifications] of this.notificationQueue) {
                if (notifications.length === 0) continue;

                // Process in batches
                const batch = notifications.splice(0, this.batchSize);

                for (const notification of batch) {
                    await this.sendNotification(notification);
                }
            }
        } catch (error) {
            console.error('❌ Error processing notification queue:', error);
        }
    }

    async sendNotification(notification) {
        try {
            // Send to each channel
            for (const channel of notification.channels) {
                await this.sendToChannel(notification, channel);
            }

            // Update notification status
            notification.status = 'sent';
            notification.sentAt = new Date();

            console.log(`✅ Notification sent: ${notification.id}`);
        } catch (error) {
            console.error('❌ Error sending notification:', error);
            notification.status = 'failed';
            notification.error = error.message;
        }
    }

    async sendToChannel(notification, channel) {
        try {
            switch (channel) {
                case 'in_app':
                    await this.sendInAppNotification(notification);
                    break;
                case 'email':
                    await this.sendEmailNotification(notification);
                    break;
                case 'push':
                    await this.sendPushNotification(notification);
                    break;
                case 'sms':
                    await this.sendSmsNotification(notification);
                    break;
                default:
                    console.warn(`Unknown notification channel: ${channel}`);
            }
        } catch (error) {
            console.error(`❌ Error sending to channel ${channel}:`, error);
        }
    }

    async sendInAppNotification(notification) {
        try {
            // Send via WebSocket
            eventSystem.publishEvent('websocket.notification', {
                type: 'NOTIFICATION',
                userId: notification.userId,
                notification: {
                    id: notification.id,
                    type: notification.type,
                    title: notification.title,
                    message: notification.message,
                    category: notification.category,
                    priority: notification.priority,
                    timestamp: notification.timestamp
                }
            });
        } catch (error) {
            console.error('❌ Error sending in-app notification:', error);
        }
    }

    async sendEmailNotification(notification) {
        try {
            // Queue email job
            await messageQueue.addJob('email', {
                type: 'NOTIFICATION_EMAIL',
                to: notification.userId, // Would be actual email
                subject: notification.title,
                body: notification.message,
                template: 'notification',
                data: notification.data
            });
        } catch (error) {
            console.error('❌ Error sending email notification:', error);
        }
    }

    async sendPushNotification(notification) {
        try {
            // Queue push notification job
            await messageQueue.addJob('push', {
                type: 'NOTIFICATION_PUSH',
                userId: notification.userId,
                title: notification.title,
                body: notification.message,
                data: notification.data
            });
        } catch (error) {
            console.error('❌ Error sending push notification:', error);
        }
    }

    async sendSmsNotification(notification) {
        try {
            // Queue SMS job
            await messageQueue.addJob('sms', {
                type: 'NOTIFICATION_SMS',
                userId: notification.userId,
                message: notification.message,
                data: notification.data
            });
        } catch (error) {
            console.error('❌ Error sending SMS notification:', error);
        }
    }

    // API Methods
    async getUserNotifications(userId, options = {}) {
        try {
            const { limit = 50, offset = 0, category = null, status = null } = options;

            // This would query from database
            // For now, return mock data
            const notifications = [{
                id: 'notif-1',
                type: 'venture.created',
                title: 'Venture Created',
                message: 'New venture "My Startup" has been created by John Doe.',
                category: 'venture',
                priority: 'medium',
                status: 'unread',
                timestamp: new Date().toISOString()
            }];

            return {
                notifications: notifications,
                total: notifications.length,
                hasMore: false
            };
        } catch (error) {
            console.error('❌ Error getting user notifications:', error);
            throw error;
        }
    }

    async markNotificationAsRead(notificationId, userId) {
        try {
            // This would update in database
            console.log(`📖 Marking notification ${notificationId} as read for user ${userId}`);
            return { success: true };
        } catch (error) {
            console.error('❌ Error marking notification as read:', error);
            throw error;
        }
    }

    async markAllNotificationsAsRead(userId) {
        try {
            // This would update in database
            console.log(`📖 Marking all notifications as read for user ${userId}`);
            return { success: true };
        } catch (error) {
            console.error('❌ Error marking all notifications as read:', error);
            throw error;
        }
    }

    async deleteNotification(notificationId, userId) {
        try {
            // This would delete from database
            console.log(`🗑️ Deleting notification ${notificationId} for user ${userId}`);
            return { success: true };
        } catch (error) {
            console.error('❌ Error deleting notification:', error);
            throw error;
        }
    }

    async getUserNotificationPreferences(userId) {
        try {
            // This would query from database
            // For now, return default preferences
            return {
                userId: userId,
                preferences: {
                    in_app: true,
                    email: true,
                    push: false,
                    sms: false
                },
                categories: {
                    system: true,
                    venture: true,
                    team: true,
                    buz: true,
                    payment: true,
                    subscription: true,
                    legal: true,
                    revenue: true
                },
                quietHours: {
                    enabled: false,
                    start: '22:00',
                    end: '08:00'
                }
            };
        } catch (error) {
            console.error('❌ Error getting notification preferences:', error);
            throw error;
        }
    }

    async updateUserNotificationPreferences(userId, preferences) {
        try {
            // This would update in database
            console.log(`⚙️ Updating notification preferences for user ${userId}`);
            return { success: true };
        } catch (error) {
            console.error('❌ Error updating notification preferences:', error);
            throw error;
        }
    }

    async sendCustomNotification(userId, notification) {
        try {
            const customNotification = {
                id: this.generateNotificationId(),
                type: 'custom',
                userId: userId,
                title: notification.title,
                message: notification.message,
                category: notification.category || 'system',
                priority: notification.priority || 'medium',
                channels: notification.channels || ['in_app'],
                data: notification.data || {},
                timestamp: new Date(),
                status: 'pending'
            };

            await this.queueNotification(customNotification);
            return { success: true, notificationId: customNotification.id };
        } catch (error) {
            console.error('❌ Error sending custom notification:', error);
            throw error;
        }
    }

    async getNotificationStats() {
        try {
            // This would calculate from database
            // For now, return mock data
            return {
                total: 1250,
                sent: 1200,
                failed: 50,
                pending: 0,
                byCategory: {
                    system: 200,
                    venture: 300,
                    team: 250,
                    buz: 200,
                    payment: 150,
                    subscription: 100,
                    legal: 50
                },
                byPriority: {
                    low: 500,
                    medium: 600,
                    high: 150
                }
            };
        } catch (error) {
            console.error('❌ Error getting notification stats:', error);
            throw error;
        }
    }

    generateNotificationId() {
        return `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Health check
    getHealth() {
        return {
            status: 'healthy',
            service: 'notifications',
            timestamp: new Date(),
            queueSize: Array.from(this.notificationQueue.values()).reduce((total, queue) => total + queue.length, 0),
            notificationTypes: this.notificationTypes.size,
            uptime: process.uptime()
        };
    }

    // Cleanup
    async destroy() {
        try {
            await this.prisma.$disconnect();
            this.notificationQueue.clear();
            console.log('✅ Notifications service destroyed');
        } catch (error) {
            console.error('❌ Error destroying notifications service:', error);
        }
    }
}

// Create singleton instance
const notificationsService = new SmartStartNotificationsService({
    batchSize: 100,
    processInterval: 5000
});

module.exports = notificationsService;