const express = require('express');
const app = express();

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Direct BUZ test route
app.get('/api/buz-minimal-test', (req, res) => {
    res.json({ message: 'BUZ minimal test successful!' });
});

// Route listing
app.get('/api/routes', (req, res) => {
    const routes = [];
    app._router.stack.forEach((middleware) => {
        if (middleware.route) {
            routes.push({
                path: middleware.route.path,
                methods: Object.keys(middleware.route.methods)
            });
        }
    });
    res.json({ routes });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Minimal test server running on port ${PORT}`);
});

module.exports = app;
