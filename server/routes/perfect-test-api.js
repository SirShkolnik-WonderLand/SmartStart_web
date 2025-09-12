const express = require('express');
const router = express.Router();

// Perfect test API - simple and clean
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Perfect test API is working!',
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method
    });
});

router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Perfect test API is healthy',
        timestamp: new Date().toISOString()
    });
});

router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Perfect test endpoint is working!',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
