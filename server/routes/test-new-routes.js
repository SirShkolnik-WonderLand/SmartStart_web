const express = require('express');
const router = express.Router();

// Simple test endpoint
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'New routes are working!',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
