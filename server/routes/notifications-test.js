const express = require('express');
const router = express.Router();

// Simple test endpoint for notifications
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Notifications test route is working!',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
