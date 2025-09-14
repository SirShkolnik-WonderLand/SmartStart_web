#!/usr/bin/env node

/**
 * SmartStart Analytics API Endpoints
 * RESTful API for analytics and reporting
 */

const express = require('express');
const analyticsService = require('./analytics-service');

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

// Get dashboard metrics
router.get('/dashboard', authenticateUser, async(req, res) => {
    try {
        const { timeRange = '24h' } = req.query;
        const metrics = await analyticsService.getDashboardMetrics(timeRange);

        res.json({
            success: true,
            metrics: metrics
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get real-time metrics
router.get('/realtime', authenticateUser, (req, res) => {
    try {
        const metrics = analyticsService.getRealTimeMetrics();

        res.json({
            success: true,
            metrics: metrics
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get user metrics
router.get('/users', authenticateUser, async(req, res) => {
    try {
        const { timeRange = '24h' } = req.query;
        const now = new Date();
        const startDate = analyticsService.getStartDate(now, timeRange);

        const metrics = await analyticsService.getUserMetrics(startDate, now);

        res.json({
            success: true,
            metrics: metrics
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get venture metrics
router.get('/ventures', authenticateUser, async(req, res) => {
    try {
        const { timeRange = '24h' } = req.query;
        const now = new Date();
        const startDate = analyticsService.getStartDate(now, timeRange);

        const metrics = await analyticsService.getVentureMetrics(startDate, now);

        res.json({
            success: true,
            metrics: metrics
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get revenue metrics
router.get('/revenue', authenticateUser, async(req, res) => {
    try {
        const { timeRange = '24h' } = req.query;
        const now = new Date();
        const startDate = analyticsService.getStartDate(now, timeRange);

        const metrics = await analyticsService.getRevenueMetrics(startDate, now);

        res.json({
            success: true,
            metrics: metrics
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get engagement metrics
router.get('/engagement', authenticateUser, async(req, res) => {
    try {
        const { timeRange = '24h' } = req.query;
        const now = new Date();
        const startDate = analyticsService.getStartDate(now, timeRange);

        const metrics = await analyticsService.getEngagementMetrics(startDate, now);

        res.json({
            success: true,
            metrics: metrics
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get system metrics
router.get('/system', authenticateUser, (req, res) => {
    try {
        const metrics = analyticsService.getSystemMetrics();

        res.json({
            success: true,
            metrics: metrics
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get BUZ token metrics
router.get('/buz', authenticateUser, async(req, res) => {
    try {
        const { timeRange = '24h' } = req.query;
        const now = new Date();
        const startDate = analyticsService.getStartDate(now, timeRange);

        const metrics = await analyticsService.calculateBuzMetrics();

        res.json({
            success: true,
            metrics: metrics
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get subscription metrics
router.get('/subscriptions', authenticateUser, async(req, res) => {
    try {
        const { timeRange = '24h' } = req.query;
        const now = new Date();
        const startDate = analyticsService.getStartDate(now, timeRange);

        // This would calculate actual subscription metrics
        const metrics = {
            total: 250,
            active: 200,
            cancelled: 50,
            new: 25,
            revenue: 12000,
            growth: 15.5
        };

        res.json({
            success: true,
            metrics: metrics
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get legal document metrics
router.get('/legal', authenticateUser, async(req, res) => {
    try {
        const { timeRange = '24h' } = req.query;
        const now = new Date();
        const startDate = analyticsService.getStartDate(now, timeRange);

        // This would calculate actual legal document metrics
        const metrics = {
            total: 500,
            signed: 400,
            pending: 100,
            new: 50,
            completionRate: 80.0
        };

        res.json({
            success: true,
            metrics: metrics
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get team metrics
router.get('/teams', authenticateUser, async(req, res) => {
    try {
        const { timeRange = '24h' } = req.query;
        const now = new Date();
        const startDate = analyticsService.getStartDate(now, timeRange);

        // This would calculate actual team metrics
        const metrics = {
            total: 75,
            active: 60,
            new: 10,
            averageSize: 3.2,
            collaborationScore: 85.5
        };

        res.json({
            success: true,
            metrics: metrics
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get custom analytics
router.post('/custom', authenticateUser, async(req, res) => {
    try {
        const { query } = req.body;

        if (!query) {
            return res.status(400).json({
                success: false,
                error: 'Query is required'
            });
        }

        const results = await analyticsService.getCustomAnalytics(query);

        res.json({
            success: true,
            results: results
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Export analytics data
router.get('/export', authenticateUser, async(req, res) => {
    try {
        const { format = 'json', timeRange = '30d' } = req.query;

        const data = await analyticsService.exportAnalytics(format, timeRange);

        res.setHeader('Content-Type', format === 'csv' ? 'text/csv' : 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="analytics-${timeRange}.${format}"`);
        res.send(data);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get analytics health
router.get('/health', (req, res) => {
    try {
        const health = analyticsService.getHealth();
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

// Get analytics summary
router.get('/summary', authenticateUser, async(req, res) => {
    try {
        const { timeRange = '24h' } = req.query;

        const [
            userMetrics,
            ventureMetrics,
            revenueMetrics,
            engagementMetrics
        ] = await Promise.all([
            analyticsService.getUserMetrics(
                analyticsService.getStartDate(new Date(), timeRange),
                new Date()
            ),
            analyticsService.getVentureMetrics(
                analyticsService.getStartDate(new Date(), timeRange),
                new Date()
            ),
            analyticsService.getRevenueMetrics(
                analyticsService.getStartDate(new Date(), timeRange),
                new Date()
            ),
            analyticsService.getEngagementMetrics(
                analyticsService.getStartDate(new Date(), timeRange),
                new Date()
            )
        ]);

        const summary = {
            timeRange,
            users: {
                total: userMetrics.total || 0,
                new: userMetrics.new || 0,
                active: userMetrics.active || 0
            },
            ventures: {
                total: ventureMetrics.total || 0,
                new: ventureMetrics.new || 0,
                active: ventureMetrics.active || 0
            },
            revenue: {
                total: revenueMetrics.total || 0,
                period: revenueMetrics.period || 0,
                growth: revenueMetrics.growth || 0
            },
            engagement: {
                dailyActiveUsers: engagementMetrics.dailyActiveUsers || 0,
                averageSessionDuration: engagementMetrics.averageSessionDuration || 0
            }
        };

        res.json({
            success: true,
            summary: summary
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;