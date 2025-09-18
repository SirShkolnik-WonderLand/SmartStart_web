#!/usr/bin/env node

/**
 * Minimal SmartStart Proxy Server
 * Ultra-simple proxy using only Node.js built-in modules
 */

const http = require('http');
const { URL } = require('url');

const PORT = process.env.PORT || 3001;
const PYTHON_BRAIN_URL = process.env.PYTHON_BRAIN_URL || 'http://python-brain:5000';

// Create HTTP server
const server = http.createServer((req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Health check endpoint
    if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'healthy',
            service: 'smartstart-proxy',
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            python_brain_url: PYTHON_BRAIN_URL,
            proxy_mode: 'active'
        }));
        return;
    }

    // Proxy API requests to Python Brain
    if (req.url.startsWith('/api')) {
        console.log(`Proxying request: ${req.method} ${req.url} to ${PYTHON_BRAIN_URL}${req.url}`);

        // Parse the target URL
        const targetUrl = new URL(req.url, PYTHON_BRAIN_URL);

        // Create request options
        const options = {
            hostname: targetUrl.hostname,
            port: targetUrl.port || 80,
            path: targetUrl.pathname + targetUrl.search,
            method: req.method,
            headers: {
                ...req.headers,
                host: targetUrl.host
            }
        };

        // Forward the request
        const proxyReq = http.request(options, (proxyRes) => {
            // Set response headers
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            // Pipe the response
            proxyRes.pipe(res);
        });

        // Handle errors
        proxyReq.on('error', (err) => {
            console.error('Proxy request error:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                error: 'Proxy error',
                message: 'Unable to connect to Python Brain'
            }));
        });

        // Forward the request body
        req.pipe(proxyReq);
    } else {
        // 404 for non-API requests
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: false,
            error: 'Not found',
            message: 'Route not found'
        }));
    }
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SmartStart Proxy Server running on port ${PORT}`);
    console.log(`🔗 Proxying to Python Brain: ${PYTHON_BRAIN_URL}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
        process.exit(0);
    });
});