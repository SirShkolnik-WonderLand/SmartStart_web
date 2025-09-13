/**
 * Umbrella API Routes
 * Handles umbrella relationships and revenue sharing
 */

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const prisma = new PrismaClient();

// ===== UMBRELLA RELATIONSHIPS =====

// Get all umbrella relationships for a user
router.get('/relationships', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const relationships = await prisma.umbrellaRelationship.findMany({
            where: {
                OR: [
                    { referrerId: userId },
                    { referredId: userId }
                ]
            },
            include: {
                referrer: {
                    select: { id: true, name: true, email: true }
                },
                referred: {
                    select: { id: true, name: true, email: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            success: true,
            data: relationships,
            message: 'Umbrella relationships retrieved successfully'
        });
    } catch (error) {
        console.error('Error fetching umbrella relationships:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch umbrella relationships',
            error: error.message
        });
    }
});

// Create umbrella relationship
router.post('/relationships', authenticateToken, async (req, res) => {
    try {
        const { referredId, relationshipType = 'REFERRAL', notes } = req.body;
        const referrerId = req.user.id;

        if (!referredId) {
            return res.status(400).json({
                success: false,
                message: 'Referred user ID is required'
            });
        }

        if (referrerId === referredId) {
            return res.status(400).json({
                success: false,
                message: 'Cannot create relationship with yourself'
            });
        }

        const relationship = await prisma.umbrellaRelationship.create({
            data: {
                referrerId,
                referredId,
                relationshipType,
                notes,
                status: 'ACTIVE'
            },
            include: {
                referrer: {
                    select: { id: true, name: true, email: true }
                },
                referred: {
                    select: { id: true, name: true, email: true }
                }
            }
        });

        res.status(201).json({
            success: true,
            data: relationship,
            message: 'Umbrella relationship created successfully'
        });
    } catch (error) {
        console.error('Error creating umbrella relationship:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create umbrella relationship',
            error: error.message
        });
    }
});

// ===== REVENUE SHARING =====

// Get revenue shares for a user
router.get('/revenue/shares', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const revenueShares = await prisma.revenueShare.findMany({
            where: {
                OR: [
                    { referrerId: userId },
                    { referredId: userId }
                ]
            },
            include: {
                referrer: {
                    select: { id: true, name: true, email: true }
                },
                referred: {
                    select: { id: true, name: true, email: true }
                },
                venture: {
                    select: { id: true, name: true, purpose: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            success: true,
            data: revenueShares,
            message: 'Revenue shares retrieved successfully'
        });
    } catch (error) {
        console.error('Error fetching revenue shares:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch revenue shares',
            error: error.message
        });
    }
});

// Create revenue share
router.post('/revenue/shares', authenticateToken, async (req, res) => {
    try {
        const { referredId, ventureId, amount, percentage, description } = req.body;
        const referrerId = req.user.id;

        if (!referredId || !ventureId || !amount) {
            return res.status(400).json({
                success: false,
                message: 'Referred user ID, venture ID, and amount are required'
            });
        }

        const revenueShare = await prisma.revenueShare.create({
            data: {
                referrerId,
                referredId,
                ventureId,
                amount: parseFloat(amount),
                percentage: percentage ? parseFloat(percentage) : null,
                description,
                status: 'PENDING'
            },
            include: {
                referrer: {
                    select: { id: true, name: true, email: true }
                },
                referred: {
                    select: { id: true, name: true, email: true }
                },
                venture: {
                    select: { id: true, name: true, purpose: true }
                }
            }
        });

        res.status(201).json({
            success: true,
            data: revenueShare,
            message: 'Revenue share created successfully'
        });
    } catch (error) {
        console.error('Error creating revenue share:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create revenue share',
            error: error.message
        });
    }
});

// ===== UMBRELLA ANALYTICS =====

// Get umbrella analytics
router.get('/analytics', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const [
            totalRelationships,
            activeRelationships,
            totalRevenue,
            monthlyRevenue,
            topReferrers,
            recentActivity
        ] = await Promise.all([
            prisma.umbrellaRelationship.count({
                where: { referrerId: userId }
            }),
            prisma.umbrellaRelationship.count({
                where: { 
                    referrerId: userId,
                    status: 'ACTIVE'
                }
            }),
            prisma.revenueShare.aggregate({
                where: { referrerId: userId },
                _sum: { amount: true }
            }),
            prisma.revenueShare.aggregate({
                where: {
                    referrerId: userId,
                    createdAt: {
                        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                    }
                },
                _sum: { amount: true }
            }),
            prisma.umbrellaRelationship.groupBy({
                by: ['referredId'],
                where: { referrerId: userId },
                _count: { id: true },
                orderBy: { _count: { id: 'desc' } },
                take: 5
            }),
            prisma.umbrellaRelationship.findMany({
                where: { referrerId: userId },
                include: {
                    referred: {
                        select: { id: true, name: true, email: true }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: 10
            })
        ]);

        res.json({
            success: true,
            data: {
                totalRelationships,
                activeRelationships,
                totalRevenue: totalRevenue._sum.amount || 0,
                monthlyRevenue: monthlyRevenue._sum.amount || 0,
                topReferrers,
                recentActivity
            },
            message: 'Umbrella analytics retrieved successfully'
        });
    } catch (error) {
        console.error('Error fetching umbrella analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch umbrella analytics',
            error: error.message
        });
    }
});

module.exports = router;