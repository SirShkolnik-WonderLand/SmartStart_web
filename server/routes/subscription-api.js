const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// Health check endpoint
router.get('/health', async(req, res) => {
    try {
        await prisma.$queryRaw `SELECT 1`;
        res.json({
            status: 'healthy',
            service: 'subscription-api',
            timestamp: new Date().toISOString(),
            database: 'connected'
        });
    } catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            service: 'subscription-api',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Get all billing plans
router.get('/plans', async(req, res) => {
    try {
        const plans = await prisma.billingPlan.findMany({
            where: { isActive: true },
            orderBy: { price: 'asc' }
        });

        res.json({
            success: true,
            data: plans,
            count: plans.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch billing plans',
            details: error.message
        });
    }
});

// Create a new billing plan (admin only)
router.post('/plans', async(req, res) => {
    try {
        const { name, description, price, currency, interval, features } = req.body;

        if (!name || !price || !interval) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: name, price, interval'
            });
        }

        const plan = await prisma.billingPlan.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                currency: currency || 'USD',
                interval,
                features: features || []
            }
        });

        res.status(201).json({
            success: true,
            data: plan,
            message: 'Billing plan created successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to create billing plan',
            details: error.message
        });
    }
});

// Get user's subscriptions
router.get('/user/:userId', async(req, res) => {
    try {
        const { userId } = req.params;

        const subscriptions = await prisma.subscription.findMany({
            where: { userId },
            include: {
                plan: true,
                invoices: {
                    orderBy: { createdAt: 'desc' },
                    take: 5
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            success: true,
            data: subscriptions,
            count: subscriptions.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user subscriptions',
            details: error.message
        });
    }
});

// Create a new subscription
router.post('/create', async(req, res) => {
    try {
        const { userId, planId, autoRenew = true } = req.body;

        if (!userId || !planId) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: userId, planId'
            });
        }

        // Check if user already has an active subscription
        const existingSubscription = await prisma.subscription.findFirst({
            where: {
                userId,
                status: 'ACTIVE'
            }
        });

        if (existingSubscription) {
            return res.status(400).json({
                success: false,
                error: 'User already has an active subscription'
            });
        }

        // Get the plan details
        const plan = await prisma.billingPlan.findUnique({
            where: { id: planId }
        });

        if (!plan) {
            return res.status(404).json({
                success: false,
                error: 'Billing plan not found'
            });
        }

        // Calculate end date based on interval
        let endDate = new Date();
        switch (plan.interval) {
            case 'MONTHLY':
                endDate.setMonth(endDate.getMonth() + 1);
                break;
            case 'QUARTERLY':
                endDate.setMonth(endDate.getMonth() + 3);
                break;
            case 'YEARLY':
                endDate.setFullYear(endDate.getFullYear() + 1);
                break;
            case 'LIFETIME':
                endDate = null; // Lifetime subscription
                break;
        }

        const subscription = await prisma.subscription.create({
            data: {
                userId,
                planId,
                autoRenew,
                endDate
            },
            include: {
                plan: true
            }
        });

        // Create initial invoice
        const invoice = await prisma.invoice.create({
            data: {
                userId,
                subscriptionId: subscription.id,
                amount: plan.price,
                currency: plan.currency,
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
            }
        });

        res.status(201).json({
            success: true,
            data: {
                subscription,
                invoice
            },
            message: 'Subscription created successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to create subscription',
            details: error.message
        });
    }
});

// Cancel a subscription
router.patch('/:subscriptionId/cancel', async(req, res) => {
    try {
        const { subscriptionId } = req.params;

        const subscription = await prisma.subscription.update({
            where: { id: subscriptionId },
            data: {
                status: 'CANCELLED',
                autoRenew: false
            },
            include: {
                plan: true
            }
        });

        res.json({
            success: true,
            data: subscription,
            message: 'Subscription cancelled successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to cancel subscription',
            details: error.message
        });
    }
});

// Get subscription details
router.get('/:subscriptionId', async(req, res) => {
    try {
        const { subscriptionId } = req.params;

        const subscription = await prisma.subscription.findUnique({
            where: { id: subscriptionId },
            include: {
                plan: true,
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true
                    }
                },
                invoices: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!subscription) {
            return res.status(404).json({
                success: false,
                error: 'Subscription not found'
            });
        }

        res.json({
            success: true,
            data: subscription
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch subscription',
            details: error.message
        });
    }
});

// Get all subscriptions (admin)
router.get('/', async(req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = status ? { status } : {};

        const [subscriptions, total] = await Promise.all([
            prisma.subscription.findMany({
                where,
                include: {
                    plan: true,
                    user: {
                        select: {
                            id: true,
                            email: true,
                            name: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(limit)
            }),
            prisma.subscription.count({ where })
        ]);

        res.json({
            success: true,
            data: subscriptions,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch subscriptions',
            details: error.message
        });
    }
});

module.exports = router;