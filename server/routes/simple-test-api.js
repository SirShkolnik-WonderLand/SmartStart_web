const express = require('express');
const router = express.Router();

// Simple test route
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Simple test API is working!',
        timestamp: new Date().toISOString()
    });
});

// Health check
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Simple test API is healthy',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
