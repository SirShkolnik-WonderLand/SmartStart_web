const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

// Simple login that works with current schema
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: email, password'
            });
        }

        // Find user by email only
        const user = await prisma.user.findFirst({
            where: { 
                email: email.toLowerCase()
            }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if user has a password (using raw SQL since field might not be in schema)
        const userWithPassword = await prisma.$queryRaw`
            SELECT id, email, name, level, xp, reputation, status, password 
            FROM "User" 
            WHERE email = ${email.toLowerCase()}
        `;

        if (!userWithPassword || userWithPassword.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const userData = userWithPassword[0];

        // Check if user has a password
        if (!userData.password) {
            return res.status(401).json({
                success: false,
                message: 'Account not properly set up. Please contact support.'
            });
        }

        // Check if user is active
        if (userData.status !== 'ACTIVE') {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated. Please contact support.'
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, userData.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: userData.id, 
                email: userData.email,
                role: userData.level || 'TEAM_MEMBER'
            },
            process.env.JWT_SECRET || 'fallback-secret',
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            token: token,
            user: {
                id: userData.id,
                email: userData.email,
                name: userData.name,
                level: userData.level,
                xp: userData.xp,
                reputation: userData.reputation,
                status: userData.status
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message
        });
    }
});

// Simple health check
router.get('/health', async (req, res) => {
    try {
        const userCount = await prisma.user.count();
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            userCount: userCount
        });
    } catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            error: error.message
        });
    }
});

module.exports = router;
