#!/usr/bin/env node

/**
 * SmartStart Event System
 * Event-driven architecture with message queues for cross-system communication
 */

const EventEmitter = require('events');
const Redis = require('ioredis');

class SmartStartEventSystem extends EventEmitter {
    constructor(options = {}) {
        super();

        this.redis = options.redis || null;
        this.channels = new Map(); // channel -> Set of subscribers
        this.eventHistory = new Map(); // eventId -> event data
        this.maxHistorySize = options.maxHistorySize || 1000;
        this.retryAttempts = options.retryAttempts || 3;
        this.retryDelay = options.retryDelay || 1000;

        this.setupRedis();
        this.setupEventHandlers();
    }

    setupRedis() {
        if (this.redis) {
            this.redis.on('connect', () => {
                console.log('🔗 Redis connected for event system');
                this.subscribeToRedisEvents();
            });

            this.redis.on('error', (err) => {
                console.error('❌ Redis error in event system:', err);
            });
        }
    }

    setupEventHandlers() {
        // Handle system events
        this.on('system.startup', this.handleSystemStartup.bind(this));
        this.on('system.shutdown', this.handleSystemShutdown.bind(this));
        this.on('user.created', this.handleUserCreated.bind(this));
        this.on('user.updated', this.handleUserUpdated.bind(this));
        this.on('venture.created', this.handleVentureCreated.bind(this));
        this.on('venture.updated', this.handleVentureUpdated.bind(this));
        this.on('team.member.added', this.handleTeamMemberAdded.bind(this));
        this.on('buz.transaction', this.handleBuzTransaction.bind(this));
        this.on('legal.document.signed', this.handleLegalDocumentSigned.bind(this));
        this.on('notification.send', this.handleNotificationSend.bind(this));
    }

    subscribeToRedisEvents() {
        if (!this.redis) return;

        // Subscribe to all event channels
        const eventChannels = [
            'smartstart:events:user',
            'smartstart:events:venture',
            'smartstart:events:team',
            'smartstart:events:buz',
            'smartstart:events:legal',
            'smartstart:events:notification',
            'smartstart:events:system'
        ];

        eventChannels.forEach(channel => {
            this.redis.subscribe(channel);
        });

        this.redis.on('message', (channel, message) => {
            try {
                const event = JSON.parse(message);
                this.processIncomingEvent(event);
            } catch (error) {
                console.error('❌ Error parsing Redis event:', error);
            }
        });
    }

    // Event Publishing
    publishEvent(eventType, data, options = {}) {
        const event = {
            id: this.generateEventId(),
            type: eventType,
            data: data,
            timestamp: new Date().toISOString(),
            source: options.source || 'system',
            priority: options.priority || 'NORMAL',
            retryCount: 0,
            metadata: options.metadata || {}
        };

        // Store in history
        this.storeEvent(event);

        // Emit locally
        this.emit(eventType, event);

        // Publish to Redis if available
        if (this.redis) {
            this.publishToRedis(event);
        }

        // Notify local subscribers
        this.notifyLocalSubscribers(event);

        console.log(`📡 Event published: ${eventType} (${event.id})`);
        return event;
    }

    publishToRedis(event) {
        if (!this.redis) return;

        const channel = this.getEventChannel(event.type);
        const message = JSON.stringify(event);

        this.redis.publish(channel, message).catch(error => {
            console.error('❌ Error publishing to Redis:', error);
            this.handlePublishError(event, error);
        });
    }

    getEventChannel(eventType) {
        const typeMap = {
            'user': 'smartstart:events:user',
            'venture': 'smartstart:events:venture',
            'team': 'smartstart:events:team',
            'buz': 'smartstart:events:buz',
            'legal': 'smartstart:events:legal',
            'notification': 'smartstart:events:notification',
            'system': 'smartstart:events:system'
        };

        const category = eventType.split('.')[0];
        return typeMap[category] || 'smartstart:events:system';
    }

    processIncomingEvent(event) {
        // Avoid processing our own events
        if (event.source === 'system') return;

        // Store in history
        this.storeEvent(event);

        // Emit locally
        this.emit(event.type, event);

        // Notify local subscribers
        this.notifyLocalSubscribers(event);

        console.log(`📨 Event received: ${event.type} (${event.id})`);
    }

    notifyLocalSubscribers(event) {
        const subscribers = this.channels.get(event.type);
        if (subscribers) {
            subscribers.forEach(callback => {
                try {
                    callback(event);
                } catch (error) {
                    console.error('❌ Error in event subscriber:', error);
                }
            });
        }
    }

    // Event Subscription
    subscribe(eventType, callback) {
        if (!this.channels.has(eventType)) {
            this.channels.set(eventType, new Set());
        }
        this.channels.get(eventType).add(callback);

        console.log(`📝 Subscribed to event: ${eventType}`);
    }

    unsubscribe(eventType, callback) {
        const subscribers = this.channels.get(eventType);
        if (subscribers) {
            subscribers.delete(callback);
            if (subscribers.size === 0) {
                this.channels.delete(eventType);
            }
        }

        console.log(`📝 Unsubscribed from event: ${eventType}`);
    }

    // Event History
    storeEvent(event) {
        this.eventHistory.set(event.id, event);

        // Maintain history size limit
        if (this.eventHistory.size > this.maxHistorySize) {
            const oldestEvent = this.eventHistory.keys().next().value;
            this.eventHistory.delete(oldestEvent);
        }
    }

    getEventHistory(eventType = null, limit = 100) {
        const events = Array.from(this.eventHistory.values());

        let filteredEvents = events;
        if (eventType) {
            filteredEvents = events.filter(event => event.type === eventType);
        }

        return filteredEvents
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, limit);
    }

    // Event Handlers
    handleSystemStartup(event) {
        console.log('🚀 System startup event processed');
        this.publishEvent('system.ready', {
            timestamp: new Date().toISOString(),
            services: ['api', 'websocket', 'event-system']
        });
    }

    handleSystemShutdown(event) {
        console.log('🛑 System shutdown event processed');
        this.publishEvent('system.shutdown.complete', {
            timestamp: new Date().toISOString()
        });
    }

    handleUserCreated(event) {
        console.log('👤 User created event processed:', event.data.userId);

        // Trigger related events
        this.publishEvent('user.profile.initialize', {
            userId: event.data.userId,
            userData: event.data
        });

        this.publishEvent('buz.wallet.initialize', {
            userId: event.data.userId,
            initialBalance: 1000
        });

        this.publishEvent('notification.send', {
            userId: event.data.userId,
            type: 'WELCOME',
            title: 'Welcome to SmartStart!',
            message: 'Your account has been created successfully.'
        });
    }

    handleUserUpdated(event) {
        console.log('👤 User updated event processed:', event.data.userId);

        // Update related systems
        this.publishEvent('user.profile.sync', {
            userId: event.data.userId,
            changes: event.data.changes
        });
    }

    handleVentureCreated(event) {
        console.log('🚀 Venture created event processed:', event.data.ventureId);

        // Initialize venture systems
        this.publishEvent('venture.team.initialize', {
            ventureId: event.data.ventureId,
            ownerId: event.data.ownerId
        });

        this.publishEvent('venture.legal.initialize', {
            ventureId: event.data.ventureId,
            requiredDocuments: ['NDA', 'Partnership Agreement']
        });

        this.publishEvent('buz.reward.award', {
            userId: event.data.ownerId,
            amount: 25,
            reason: 'Venture Creation',
            ventureId: event.data.ventureId
        });
    }

    handleVentureUpdated(event) {
        console.log('🚀 Venture updated event processed:', event.data.ventureId);

        // Sync changes across systems
        this.publishEvent('venture.analytics.update', {
            ventureId: event.data.ventureId,
            changes: event.data.changes
        });
    }

    handleTeamMemberAdded(event) {
        console.log('👥 Team member added event processed:', event.data.teamId);

        // Initialize team member access
        this.publishEvent('team.member.permissions.grant', {
            teamId: event.data.teamId,
            userId: event.data.userId,
            role: event.data.role
        });

        this.publishEvent('notification.send', {
            userId: event.data.userId,
            type: 'TEAM_INVITATION',
            title: 'You\'ve been added to a team!',
            message: `You've been added to team: ${event.data.teamName}`
        });
    }

    handleBuzTransaction(event) {
        console.log('💰 BUZ transaction event processed:', event.data.transactionId);

        // Update user level if needed
        this.publishEvent('buz.level.check', {
            userId: event.data.userId,
            newBalance: event.data.newBalance
        });

        // Log transaction for analytics
        this.publishEvent('analytics.transaction.log', {
            transactionId: event.data.transactionId,
            userId: event.data.userId,
            amount: event.data.amount,
            type: event.data.type
        });
    }

    handleLegalDocumentSigned(event) {
        console.log('⚖️ Legal document signed event processed:', event.data.documentId);

        // Update compliance status
        this.publishEvent('legal.compliance.update', {
            userId: event.data.userId,
            documentId: event.data.documentId,
            complianceScore: event.data.complianceScore
        });

        // Award BUZ tokens for compliance
        this.publishEvent('buz.reward.award', {
            userId: event.data.userId,
            amount: 15,
            reason: 'Legal Compliance',
            documentId: event.data.documentId
        });
    }

    handleNotificationSend(event) {
        console.log('🔔 Notification send event processed:', event.data.userId);

        // This would integrate with the WebSocket system
        this.publishEvent('websocket.notification.send', {
            userId: event.data.userId,
            notification: event.data
        });
    }

    // Error Handling
    handlePublishError(event, error) {
        if (event.retryCount < this.retryAttempts) {
            event.retryCount++;
            console.log(`🔄 Retrying event publish (${event.retryCount}/${this.retryAttempts}): ${event.type}`);

            setTimeout(() => {
                this.publishToRedis(event);
            }, this.retryDelay * event.retryCount);
        } else {
            console.error('❌ Max retry attempts reached for event:', event.type);
            this.publishEvent('system.error', {
                type: 'PUBLISH_FAILED',
                eventId: event.id,
                error: error.message
            });
        }
    }

    // Utility Methods
    generateEventId() {
        return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    getStats() {
        return {
            totalEvents: this.eventHistory.size,
            activeSubscriptions: this.channels.size,
            redisConnected: this.redis ? this.redis.status === 'ready' : false,
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage()
        };
    }

    // Cleanup
    destroy() {
        if (this.redis) {
            this.redis.disconnect();
        }
        this.removeAllListeners();
        this.channels.clear();
        this.eventHistory.clear();
    }
}

// Create singleton instance
const eventSystem = new SmartStartEventSystem({
    redis: process.env.REDIS_URL ? new Redis(process.env.REDIS_URL) : null,
    maxHistorySize: 1000,
    retryAttempts: 3,
    retryDelay: 1000
});

module.exports = eventSystem;