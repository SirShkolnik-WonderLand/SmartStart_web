const express = require('express');
const router = express.Router();

// Route debug API to test route registration
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Route debug API is working!',
        timestamp: new Date().toISOString()
    });
});

// Test route with different path
router.get('/test2', (req, res) => {
    res.json({
        success: true,
        message: 'Route debug API test2 is working!',
        timestamp: new Date().toISOString()
    });
});

// Health check
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Route debug API is healthy',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
