const express = require('express');
const router = express.Router();

// Minimal BUZ API without dependencies
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

router.get('/balance/:userId', (req, res) => {
    const { userId } = req.params;
    res.json({
        success: true,
        data: {
            userId,
            balance: 0,
            stakedBalance: 0,
            totalEarned: 0,
            totalSpent: 0,
            totalBurned: 0,
            lastActivity: null
        }
    });
});

module.exports = router;
