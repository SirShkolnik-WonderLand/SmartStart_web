#!/usr/bin/env node

/**
 * Simple SmartStart Proxy Server
 * Lightweight proxy that forwards requests to Python Brain
 */

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3001;
const PYTHON_BRAIN_URL = process.env.PYTHON_BRAIN_URL || 'http://python-brain:5000';

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
    credentials: true
}));

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'smartstart-proxy',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        python_brain_url: PYTHON_BRAIN_URL,
        proxy_mode: 'active'
    });
});

// Proxy all API requests to Python Brain
app.use('/api', createProxyMiddleware({
    target: PYTHON_BRAIN_URL,
    changeOrigin: true,
    pathRewrite: {
        '^/api': '/api'
    },
    onError: (err, req, res) => {
        console.error('Proxy error:', err);
        res.status(500).json({
            success: false,
            error: 'Proxy error',
            message: 'Unable to connect to Python Brain'
        });
    }
}));

// Serve static files (if needed)
app.use(express.static('public'));

// Catch all handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Not found',
        message: 'Route not found'
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SmartStart Proxy Server running on port ${PORT}`);
    console.log(`🔗 Proxying to Python Brain: ${PYTHON_BRAIN_URL}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});