const express = require('express');
const router = express.Router();

// Minimal digital signatures route
router.get('/', (req, res) => {
    res.json({
        success: false,
        message: 'Access token required'
    });
});

router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Digital signatures API is healthy',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
