const express = require('express');
const router = express.Router();

// Diagnostic route to test BUZ API loading
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'BUZ Diagnostic API is working!',
        timestamp: new Date().toISOString(),
        routes: [
            'GET /api/buz-diagnostic/health',
            'GET /api/buz-diagnostic/test',
            'GET /api/buz-diagnostic/supply'
        ]
    });
});

router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'BUZ Test endpoint working!',
        data: {
            totalSupply: 1000000000,
            currentPrice: 0.01,
            marketCap: 10000000
        }
    });
});

router.get('/supply', (req, res) => {
    res.json({
        success: true,
        data: {
            totalSupply: 1000000000,
            circulatingSupply: 0,
            burnedSupply: 0,
            stakedSupply: 0,
            currentPrice: 0.01,
            marketCap: 0,
            lastUpdated: new Date().toISOString()
        }
    });
});

module.exports = router;
