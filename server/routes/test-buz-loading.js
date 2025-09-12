const express = require('express');
const router = express.Router();

router.get('/test', (req, res) => {
    res.json({ message: 'BUZ loading test successful!' });
});

module.exports = router;
