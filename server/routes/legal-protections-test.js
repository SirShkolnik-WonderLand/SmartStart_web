/**
 * Legal Protections Test Route
 * Simple test route to verify legal protections API loading
 */

const express = require('express');
const router = express.Router();

router.get('/test', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Legal protections test route is working!', 
        timestamp: new Date().toISOString() 
    });
});

module.exports = router;
