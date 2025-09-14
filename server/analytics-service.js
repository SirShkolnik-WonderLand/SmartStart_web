#!/usr/bin/env node

/**
 * SmartStart Analytics Service
 * Unified analytics and reporting across all systems
 */

const eventSystem = require('./event-system');
const messageQueue = require('./message-queue');
const { PrismaClient } = require('@prisma/client');

class SmartStartAnalyticsService {
    constructor(options = {}) {
        this.prisma = new PrismaClient();
        this.metrics = new Map();
        this.realTimeMetrics = new Map();
        this.analyticsCache = new Map();
        this.cacheTimeout = options.cacheTimeout || 300000; // 5 minutes
        this.batchSize = options.batchSize || 1000;

        this.setupEventHandlers();
        this.startMetricsCollection();
        this.startRealTimeUpdates();
    }

    setupEventHandlers() {
        // Listen for all system events to collect metrics
        const eventTypes = [
            'user.created', 'user.updated', 'user.deleted',
            'venture.created', 'venture.updated', 'venture.deleted',
            'team.created', 'team.updated', 'team.deleted',
            'buz.transaction', 'buz.award', 'buz.spend',
            'legal.document.signed', 'legal.document.updated',
            'subscription.created', 'subscription.updated', 'subscription.cancelled',
            'payment.succeeded', 'payment.failed',
            'revenue.share.completed', 'revenue.umbrella.transfer',
            'websocket.connection', 'websocket.disconnection',
            'data.sync.completed', 'data.sync.failed'
        ];

        eventTypes.forEach(eventType => {
            eventSystem.subscribe(eventType, this.handleAnalyticsEvent.bind(this));
        });
    }

    startMetricsCollection() {
        // Collect metrics every minute
        setInterval(() => {
            this.collectSystemMetrics();
        }, 60000);

        // Process analytics queue every 30 seconds
        setInterval(() => {
            this.processAnalyticsQueue();
        }, 30000);

        console.log('📊 Analytics service started');
    }

    startRealTimeUpdates() {
        // Send real-time metrics every 10 seconds
        setInterval(() => {
            this.broadcastRealTimeMetrics();
        }, 10000);
    }

    async handleAnalyticsEvent(event) {
        try {
            // Queue analytics processing
            await messageQueue.addJob('analytics', {
                type: 'EVENT_ANALYTICS',
                eventType: event.type,
                data: event.data,
                timestamp: event.timestamp,
                source: event.source
            });

            // Update real-time metrics
            this.updateRealTimeMetrics(event);

        } catch (error) {
            console.error('❌ Error handling analytics event:', error);
        }
    }

    updateRealTimeMetrics(event) {
        const now = new Date();
        const hour = now.getHours();
        const day = now.getDate();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        // Update event counts
        const eventKey = `events.${event.type}`;
        this.incrementMetric(eventKey, 1);
        this.incrementMetric(`events.${event.type}.hour.${hour}`, 1);
        this.incrementMetric(`events.${event.type}.day.${day}`, 1);

        // Update system-specific metrics
        this.updateSystemMetrics(event);

        // Update user activity
        if (event.data.userId) {
            this.incrementMetric(`users.${event.data.userId}.activity`, 1);
            this.incrementMetric(`users.active.${hour}`, 1);
        }

        // Update venture metrics
        if (event.data.ventureId) {
            this.incrementMetric(`ventures.${event.data.ventureId}.activity`, 1);
        }

        // Update team metrics
        if (event.data.teamId) {
            this.incrementMetric(`teams.${event.data.teamId}.activity`, 1);
        }
    }

    updateSystemMetrics(event) {
        switch (event.type.split('.')[0]) {
            case 'user':
                this.incrementMetric('system.users.total', 1);
                if (event.type === 'user.created') {
                    this.incrementMetric('system.users.new', 1);
                }
                break;

            case 'venture':
                this.incrementMetric('system.ventures.total', 1);
                if (event.type === 'venture.created') {
                    this.incrementMetric('system.ventures.new', 1);
                }
                break;

            case 'buz':
                this.incrementMetric('system.buz.transactions', 1);
                if (event.data.amount) {
                    this.incrementMetric('system.buz.volume', event.data.amount);
                }
                break;

            case 'payment':
                this.incrementMetric('system.payments.total', 1);
                if (event.data.amount) {
                    this.incrementMetric('system.payments.volume', event.data.amount);
                }
                break;

            case 'websocket':
                if (event.type === 'websocket.connection') {
                    this.incrementMetric('system.websocket.connections', 1);
                } else if (event.type === 'websocket.disconnection') {
                    this.incrementMetric('system.websocket.disconnections', 1);
                }
                break;
        }
    }

    incrementMetric(key, value = 1) {
        const current = this.realTimeMetrics.get(key) || 0;
        this.realTimeMetrics.set(key, current + value);
    }

    async collectSystemMetrics() {
        try {
            // Collect database metrics
            const dbMetrics = await this.collectDatabaseMetrics();

            // Collect system metrics
            const systemMetrics = await this.collectSystemHealthMetrics();

            // Collect business metrics
            const businessMetrics = await this.collectBusinessMetrics();

            // Store metrics
            const allMetrics = {
                timestamp: new Date(),
                database: dbMetrics,
                system: systemMetrics,
                business: businessMetrics,
                realTime: Object.fromEntries(this.realTimeMetrics)
            };

            // Store in cache
            this.analyticsCache.set('latest_metrics', allMetrics);

            // Reset real-time metrics
            this.realTimeMetrics.clear();

            console.log('📊 System metrics collected');
        } catch (error) {
            console.error('❌ Error collecting system metrics:', error);
        }
    }

    async collectDatabaseMetrics() {
        try {
            const [
                userCount,
                ventureCount,
                teamCount,
                buzTransactionCount,
                legalDocumentCount,
                subscriptionCount
            ] = await Promise.all([
                this.prisma.user.count(),
                this.prisma.venture.count(),
                this.prisma.team.count(),
                this.prisma.bUZTransaction.count(),
                this.prisma.legalDocument.count(),
                this.prisma.subscription.count()
            ]);

            return {
                users: userCount,
                ventures: ventureCount,
                teams: teamCount,
                buzTransactions: buzTransactionCount,
                legalDocuments: legalDocumentCount,
                subscriptions: subscriptionCount
            };
        } catch (error) {
            console.error('❌ Error collecting database metrics:', error);
            return {};
        }
    }

    async collectSystemHealthMetrics() {
        try {
            const memoryUsage = process.memoryUsage();
            const uptime = process.uptime();

            return {
                memory: {
                    rss: memoryUsage.rss,
                    heapTotal: memoryUsage.heapTotal,
                    heapUsed: memoryUsage.heapUsed,
                    external: memoryUsage.external
                },
                uptime: uptime,
                nodeVersion: process.version,
                platform: process.platform
            };
        } catch (error) {
            console.error('❌ Error collecting system health metrics:', error);
            return {};
        }
    }

    async collectBusinessMetrics() {
        try {
            // Revenue metrics
            const revenueMetrics = await this.calculateRevenueMetrics();

            // User engagement metrics
            const engagementMetrics = await this.calculateEngagementMetrics();

            // Venture success metrics
            const ventureMetrics = await this.calculateVentureMetrics();

            // BUZ token economy metrics
            const buzMetrics = await this.calculateBuzMetrics();

            return {
                revenue: revenueMetrics,
                engagement: engagementMetrics,
                ventures: ventureMetrics,
                buz: buzMetrics
            };
        } catch (error) {
            console.error('❌ Error collecting business metrics:', error);
            return {};
        }
    }

    async calculateRevenueMetrics() {
        try {
            // This would calculate actual revenue from database
            // For now, return mock data
            return {
                totalRevenue: 125000,
                monthlyRevenue: 15000,
                subscriptionRevenue: 12000,
                transactionRevenue: 3000,
                revenueGrowth: 25.5
            };
        } catch (error) {
            console.error('❌ Error calculating revenue metrics:', error);
            return {};
        }
    }

    async calculateEngagementMetrics() {
        try {
            // This would calculate actual engagement from database
            // For now, return mock data
            return {
                dailyActiveUsers: 450,
                weeklyActiveUsers: 1200,
                monthlyActiveUsers: 3500,
                averageSessionDuration: 25.5, // minutes
                pageViews: 12500,
                bounceRate: 35.2
            };
        } catch (error) {
            console.error('❌ Error calculating engagement metrics:', error);
            return {};
        }
    }

    async calculateVentureMetrics() {
        try {
            // This would calculate actual venture metrics from database
            // For now, return mock data
            return {
                totalVentures: 150,
                activeVentures: 120,
                successfulVentures: 45,
                averageTeamSize: 3.2,
                averageFunding: 25000,
                successRate: 30.0
            };
        } catch (error) {
            console.error('❌ Error calculating venture metrics:', error);
            return {};
        }
    }

    async calculateBuzMetrics() {
        try {
            // This would calculate actual BUZ metrics from database
            // For now, return mock data
            return {
                totalSupply: 1000000,
                circulatingSupply: 750000,
                stakedSupply: 200000,
                totalTransactions: 5000,
                dailyVolume: 15000,
                averageTransactionValue: 25.5
            };
        } catch (error) {
            console.error('❌ Error calculating BUZ metrics:', error);
            return {};
        }
    }

    async processAnalyticsQueue() {
        try {
            // This would process queued analytics jobs
            // For now, just log
            console.log('📊 Processing analytics queue');
        } catch (error) {
            console.error('❌ Error processing analytics queue:', error);
        }
    }

    broadcastRealTimeMetrics() {
        try {
            const realTimeData = {
                timestamp: new Date(),
                metrics: Object.fromEntries(this.realTimeMetrics)
            };

            // Broadcast to WebSocket clients
            eventSystem.publishEvent('analytics.realtime.update', realTimeData);
        } catch (error) {
            console.error('❌ Error broadcasting real-time metrics:', error);
        }
    }

    // Analytics API Methods
    async getDashboardMetrics(timeRange = '24h') {
        try {
            const cacheKey = `dashboard_${timeRange}`;
            const cached = this.analyticsCache.get(cacheKey);

            if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }

            const metrics = await this.calculateDashboardMetrics(timeRange);

            // Cache the result
            this.analyticsCache.set(cacheKey, {
                data: metrics,
                timestamp: Date.now()
            });

            return metrics;
        } catch (error) {
            console.error('❌ Error getting dashboard metrics:', error);
            throw error;
        }
    }

    async calculateDashboardMetrics(timeRange) {
        try {
            const now = new Date();
            const startDate = this.getStartDate(now, timeRange);

            const [
                userMetrics,
                ventureMetrics,
                revenueMetrics,
                engagementMetrics,
                systemMetrics
            ] = await Promise.all([
                this.getUserMetrics(startDate, now),
                this.getVentureMetrics(startDate, now),
                this.getRevenueMetrics(startDate, now),
                this.getEngagementMetrics(startDate, now),
                this.getSystemMetrics()
            ]);

            return {
                timeRange,
                period: { start: startDate, end: now },
                users: userMetrics,
                ventures: ventureMetrics,
                revenue: revenueMetrics,
                engagement: engagementMetrics,
                system: systemMetrics
            };
        } catch (error) {
            console.error('❌ Error calculating dashboard metrics:', error);
            throw error;
        }
    }

    getStartDate(now, timeRange) {
        const ranges = {
            '1h': 60 * 60 * 1000,
            '24h': 24 * 60 * 60 * 1000,
            '7d': 7 * 24 * 60 * 60 * 1000,
            '30d': 30 * 24 * 60 * 60 * 1000,
            '90d': 90 * 24 * 60 * 60 * 1000
        };

        const milliseconds = ranges[timeRange] || ranges['24h'];
        return new Date(now.getTime() - milliseconds);
    }

    async getUserMetrics(startDate, endDate) {
        try {
            // This would query actual user metrics from database
            // For now, return mock data
            return {
                total: 3500,
                new: 150,
                active: 450,
                growth: 12.5,
                retention: 78.3
            };
        } catch (error) {
            console.error('❌ Error getting user metrics:', error);
            return {};
        }
    }

    async getVentureMetrics(startDate, endDate) {
        try {
            // This would query actual venture metrics from database
            // For now, return mock data
            return {
                total: 150,
                new: 25,
                active: 120,
                successful: 45,
                averageTeamSize: 3.2,
                successRate: 30.0
            };
        } catch (error) {
            console.error('❌ Error getting venture metrics:', error);
            return {};
        }
    }

    async getRevenueMetrics(startDate, endDate) {
        try {
            // This would query actual revenue metrics from database
            // For now, return mock data
            return {
                total: 125000,
                period: 15000,
                growth: 25.5,
                subscription: 12000,
                transactions: 3000,
                averageTransaction: 25.5
            };
        } catch (error) {
            console.error('❌ Error getting revenue metrics:', error);
            return {};
        }
    }

    async getEngagementMetrics(startDate, endDate) {
        try {
            // This would query actual engagement metrics from database
            // For now, return mock data
            return {
                dailyActiveUsers: 450,
                weeklyActiveUsers: 1200,
                monthlyActiveUsers: 3500,
                averageSessionDuration: 25.5,
                pageViews: 12500,
                bounceRate: 35.2
            };
        } catch (error) {
            console.error('❌ Error getting engagement metrics:', error);
            return {};
        }
    }

    async getSystemMetrics() {
        try {
            const memoryUsage = process.memoryUsage();
            const uptime = process.uptime();

            return {
                memory: {
                    rss: memoryUsage.rss,
                    heapTotal: memoryUsage.heapTotal,
                    heapUsed: memoryUsage.heapUsed,
                    external: memoryUsage.external
                },
                uptime: uptime,
                nodeVersion: process.version,
                platform: process.platform,
                cpuUsage: process.cpuUsage()
            };
        } catch (error) {
            console.error('❌ Error getting system metrics:', error);
            return {};
        }
    }

    // Real-time metrics
    getRealTimeMetrics() {
        return {
            timestamp: new Date(),
            metrics: Object.fromEntries(this.realTimeMetrics)
        };
    }

    // Custom analytics queries
    async getCustomAnalytics(query) {
        try {
            // This would execute custom analytics queries
            // For now, return mock data
            return {
                query: query,
                results: [],
                timestamp: new Date()
            };
        } catch (error) {
            console.error('❌ Error executing custom analytics query:', error);
            throw error;
        }
    }

    // Export analytics data
    async exportAnalytics(format = 'json', timeRange = '30d') {
        try {
            const metrics = await this.getDashboardMetrics(timeRange);

            switch (format) {
                case 'json':
                    return JSON.stringify(metrics, null, 2);
                case 'csv':
                    return this.convertToCSV(metrics);
                default:
                    return metrics;
            }
        } catch (error) {
            console.error('❌ Error exporting analytics:', error);
            throw error;
        }
    }

    convertToCSV(data) {
        // Simple CSV conversion
        // In a real implementation, this would be more sophisticated
        return JSON.stringify(data);
    }

    // Health check
    getHealth() {
        return {
            status: 'healthy',
            service: 'analytics',
            timestamp: new Date(),
            cacheSize: this.analyticsCache.size,
            realTimeMetrics: this.realTimeMetrics.size,
            uptime: process.uptime()
        };
    }

    // Cleanup
    async destroy() {
        try {
            await this.prisma.$disconnect();
            this.analyticsCache.clear();
            this.realTimeMetrics.clear();
            console.log('✅ Analytics service destroyed');
        } catch (error) {
            console.error('❌ Error destroying analytics service:', error);
        }
    }
}

// Create singleton instance
const analyticsService = new SmartStartAnalyticsService({
    cacheTimeout: 300000, // 5 minutes
    batchSize: 1000
});

module.exports = analyticsService;