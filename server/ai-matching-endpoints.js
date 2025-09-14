#!/usr/bin/env node

/**
 * SmartStart AI Matching API Endpoints
 * RESTful API for AI-powered matching and recommendations
 */

const express = require('express');
const aiMatchingService = require('./ai-matching-service');

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

// Get personalized recommendations
router.get('/recommendations', authenticateUser, async(req, res) => {
    try {
        const { type = 'all' } = req.query;
        const userId = req.user.id;

        const recommendations = await aiMatchingService.getPersonalizedRecommendations(userId, type);

        res.json({
            success: true,
            recommendations: recommendations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get venture matches
router.get('/ventures', authenticateUser, async(req, res) => {
    try {
        const userId = req.user.id;
        const matches = await aiMatchingService.findVentureMatches(userId);

        res.json({
            success: true,
            matches: matches
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get team matches
router.get('/teams', authenticateUser, async(req, res) => {
    try {
        const userId = req.user.id;
        const matches = await aiMatchingService.findTeamMatches(userId);

        res.json({
            success: true,
            matches: matches
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get opportunity matches
router.get('/opportunities', authenticateUser, async(req, res) => {
    try {
        const userId = req.user.id;
        const matches = await aiMatchingService.findOpportunityMatches(userId);

        res.json({
            success: true,
            matches: matches
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get user recommendations
router.get('/users', authenticateUser, async(req, res) => {
    try {
        const userId = req.user.id;
        const recommendations = await aiMatchingService.findUserRecommendations(userId);

        res.json({
            success: true,
            recommendations: recommendations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get AI insights
router.get('/insights', authenticateUser, async(req, res) => {
    try {
        const userId = req.user.id;
        const insights = await aiMatchingService.generateInsights(userId);

        res.json({
            success: true,
            insights: insights
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get match details
router.get('/match/:matchId', authenticateUser, async(req, res) => {
    try {
        const { matchId } = req.params;
        const { type } = req.query;
        const userId = req.user.id;

        let match = null;

        switch (type) {
            case 'venture':
                const ventureMatches = await aiMatchingService.findVentureMatches(userId);
                match = ventureMatches.find(m => m.ventureId === matchId);
                break;
            case 'team':
                const teamMatches = await aiMatchingService.findTeamMatches(userId);
                match = teamMatches.find(m => m.teamId === matchId);
                break;
            case 'opportunity':
                const oppMatches = await aiMatchingService.findOpportunityMatches(userId);
                match = oppMatches.find(m => m.opportunityId === matchId);
                break;
            case 'user':
                const userRecommendations = await aiMatchingService.findUserRecommendations(userId);
                match = userRecommendations.find(m => m.userId === matchId);
                break;
        }

        if (!match) {
            return res.status(404).json({
                success: false,
                error: 'Match not found'
            });
        }

        res.json({
            success: true,
            match: match
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get matching statistics
router.get('/stats', authenticateUser, async(req, res) => {
    try {
        const userId = req.user.id;

        const [
            ventureMatches,
            teamMatches,
            opportunityMatches,
            userRecommendations,
            insights
        ] = await Promise.all([
            aiMatchingService.findVentureMatches(userId),
            aiMatchingService.findTeamMatches(userId),
            aiMatchingService.findOpportunityMatches(userId),
            aiMatchingService.findUserRecommendations(userId),
            aiMatchingService.generateInsights(userId)
        ]);

        const stats = {
            totalMatches: ventureMatches.length + teamMatches.length + opportunityMatches.length,
            ventureMatches: ventureMatches.length,
            teamMatches: teamMatches.length,
            opportunityMatches: opportunityMatches.length,
            userRecommendations: userRecommendations.length,
            insights: insights.length,
            averageScore: {
                ventures: ventureMatches.length > 0 ?
                    ventureMatches.reduce((sum, m) => sum + m.score, 0) / ventureMatches.length : 0,
                teams: teamMatches.length > 0 ?
                    teamMatches.reduce((sum, m) => sum + m.score, 0) / teamMatches.length : 0,
                opportunities: opportunityMatches.length > 0 ?
                    opportunityMatches.reduce((sum, m) => sum + m.score, 0) / opportunityMatches.length : 0,
                users: userRecommendations.length > 0 ?
                    userRecommendations.reduce((sum, m) => sum + m.score, 0) / userRecommendations.length : 0
            }
        };

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

// Refresh recommendations
router.post('/refresh', authenticateUser, async(req, res) => {
    try {
        const { type = 'all' } = req.body;
        const userId = req.user.id;

        // Clear cache for this user
        aiMatchingService.clearUserCache(userId);

        // Get fresh recommendations
        const recommendations = await aiMatchingService.getPersonalizedRecommendations(userId, type);

        res.json({
            success: true,
            message: 'Recommendations refreshed',
            recommendations: recommendations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get matching preferences
router.get('/preferences', authenticateUser, async(req, res) => {
    try {
        const userId = req.user.id;

        // This would get user matching preferences from database
        // For now, return default preferences
        const preferences = {
            userId: userId,
            matchingCriteria: {
                skillsWeight: 0.4,
                locationWeight: 0.2,
                experienceWeight: 0.2,
                interestsWeight: 0.2
            },
            filters: {
                minScore: 0.3,
                maxDistance: 50,
                experienceRange: [0, 20],
                preferredIndustries: [],
                excludedIndustries: []
            },
            notifications: {
                newMatches: true,
                highScoreMatches: true,
                weeklyDigest: true
            }
        };

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

// Update matching preferences
router.put('/preferences', authenticateUser, async(req, res) => {
    try {
        const { preferences } = req.body;
        const userId = req.user.id;

        // This would update user matching preferences in database
        console.log(`🤖 Updating matching preferences for user ${userId}`);

        // Clear cache to force recalculation
        aiMatchingService.clearUserCache(userId);

        res.json({
            success: true,
            message: 'Matching preferences updated'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get match history
router.get('/history', authenticateUser, async(req, res) => {
    try {
        const { type = 'all', limit = 50, offset = 0 } = req.query;
        const userId = req.user.id;

        // This would get match history from database
        // For now, return mock data
        const history = [{
                id: 'match-1',
                type: 'venture',
                targetId: 'venture-1',
                targetName: 'Tech Startup',
                score: 0.85,
                matchedAt: new Date().toISOString(),
                status: 'viewed'
            },
            {
                id: 'match-2',
                type: 'team',
                targetId: 'team-1',
                targetName: 'Development Team',
                score: 0.72,
                matchedAt: new Date(Date.now() - 86400000).toISOString(),
                status: 'applied'
            }
        ];

        res.json({
            success: true,
            history: history,
            total: history.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Record match interaction
router.post('/interaction', authenticateUser, async(req, res) => {
    try {
        const { matchId, type, action } = req.body;
        const userId = req.user.id;

        // This would record the interaction in database
        console.log(`🤖 Recording match interaction: ${action} on ${type} match ${matchId}`);

        res.json({
            success: true,
            message: 'Interaction recorded'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get AI model status
router.get('/model-status', authenticateUser, async(req, res) => {
    try {
        const status = {
            modelVersion: '1.0.0',
            lastTrained: new Date().toISOString(),
            accuracy: {
                ventureMatching: 0.87,
                teamMatching: 0.82,
                opportunityMatching: 0.85,
                userRecommendations: 0.79
            },
            performance: {
                averageResponseTime: 150, // milliseconds
                cacheHitRate: 0.73,
                dailyMatches: 1250
            },
            features: [
                'skill_matching',
                'location_matching',
                'experience_matching',
                'interest_matching',
                'collaboration_style_matching'
            ]
        };

        res.json({
            success: true,
            status: status
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
        const health = aiMatchingService.getHealth();
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