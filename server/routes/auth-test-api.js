const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// Test route with auth middleware
router.get('/test', authenticateToken, (req, res) => {
    res.json({
        success: true,
        message: 'Auth test API is working!',
        user: req.user,
        timestamp: new Date().toISOString()
    });
});

// Test route without auth middleware
router.get('/public', (req, res) => {
    res.json({
        success: true,
        message: 'Auth test API public endpoint is working!',
        timestamp: new Date().toISOString()
    });
});

// Health check
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Auth test API is healthy',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
