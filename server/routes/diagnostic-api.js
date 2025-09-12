const express = require('express');
const router = express.Router();

// Diagnostic route to check environment and dependencies
router.get('/environment', (req, res) => {
    res.json({
        success: true,
        environment: {
            NODE_ENV: process.env.NODE_ENV,
            JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT_SET',
            DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT_SET',
            EMAIL_USER: process.env.EMAIL_USER ? 'SET' : 'NOT_SET',
            EMAIL_PASS: process.env.EMAIL_PASS ? 'SET' : 'NOT_SET',
            PORT: process.env.PORT,
            platform: process.platform,
            nodeVersion: process.version
        },
        timestamp: new Date().toISOString()
    });
});

// Test auth middleware loading
router.get('/auth-test', (req, res) => {
    try {
        const { authenticateToken } = require('../middleware/auth');
        res.json({
            success: true,
            message: 'Auth middleware loaded successfully',
            authFunctionType: typeof authenticateToken,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.json({
            success: false,
            message: 'Auth middleware failed to load',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Test Prisma client loading
router.get('/prisma-test', (req, res) => {
    try {
        const { PrismaClient } = require('@prisma/client');
        res.json({
            success: true,
            message: 'Prisma client loaded successfully',
            prismaType: typeof PrismaClient,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.json({
            success: false,
            message: 'Prisma client failed to load',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Test route loading
router.get('/route-test', (req, res) => {
    try {
        const digitalSignaturesRoute = require('./digital-signatures-api');
        res.json({
            success: true,
            message: 'Digital signatures route loaded successfully',
            routeType: typeof digitalSignaturesRoute,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.json({
            success: false,
            message: 'Digital signatures route failed to load',
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
    }
});

// Health check
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Diagnostic API is healthy',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
