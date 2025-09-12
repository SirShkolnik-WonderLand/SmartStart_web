const express = require('express');
const app = express();

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Test BUZ route
app.get('/api/buz-test', (req, res) => {
    res.json({ message: 'BUZ test successful!' });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Test server running on port ${PORT}`);
});

module.exports = app;
