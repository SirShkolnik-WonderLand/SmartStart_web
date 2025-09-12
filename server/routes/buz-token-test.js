const express = require('express');
const router = express.Router();

// Simple BUZ Token Test API
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'BUZ Token API is working!',
        timestamp: new Date().toISOString()
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
