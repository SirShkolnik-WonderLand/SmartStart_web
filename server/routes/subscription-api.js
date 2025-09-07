const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();
const { authenticateToken } = require('../middleware/auth');
const onboardingOrchestrator = require('../services/onboarding-orchestrator');

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

// ===== SUBSCRIPTION PLANS =====

// Get all available subscription plans
router.get('/plans', async(req, res) => {
    try {
        const plans = await prisma.billingPlan.findMany({
            where: { isActive: true },
            orderBy: { price: 'asc' }
        });

        res.json({
            success: true,
            data: plans,
            count: plans.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching subscription plans:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch subscription plans',
            details: error.message
        });
    }
});

// Get specific subscription plan
router.get('/plans/:planId', async(req, res) => {
    try {
        const { planId } = req.params;
        
        const plan = await prisma.billingPlan.findUnique({
            where: { id: planId }
        });

        if (!plan) {
            return res.status(404).json({
                success: false,
                error: 'Subscription plan not found'
            });
        }

        res.json({
            success: true,
            data: plan,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching subscription plan:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch subscription plan',
            details: error.message
        });
    }
});

// ===== USER SUBSCRIPTIONS =====

// Get user's subscriptions
router.get('/user/:userId', authenticateToken, async(req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user.id;

        // Check if user can access this data (own data or admin)
        if (userId !== currentUserId && req.user.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

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
            count: subscriptions.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching user subscriptions:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user subscriptions',
            details: error.message
        });
    }
});

// Create new subscription
router.post('/subscribe', authenticateToken, async(req, res) => {
    try {
        const userId = req.user.id;
        const { planId, paymentMethod, paymentData } = req.body;

        if (!planId) {
            return res.status(400).json({
                success: false,
                error: 'Plan ID is required'
            });
        }

        // Get the plan
        const plan = await prisma.billingPlan.findUnique({
            where: { id: planId }
        });

        if (!plan) {
            return res.status(404).json({
                success: false,
                error: 'Subscription plan not found'
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
                error: 'User already has an active subscription',
                data: existingSubscription
            });
        }

        // Create subscription
        const subscription = await prisma.subscription.create({
            data: {
                userId,
                planId,
                status: 'ACTIVE',
                startDate: new Date(),
                autoRenew: true
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
                status: 'PAID', // Assuming payment is processed
                dueDate: new Date(),
                paidDate: new Date()
            }
        });

        // Create payment record
        const payment = await prisma.payment.create({
            data: {
                userId,
                invoiceId: invoice.id,
                amount: plan.price,
                currency: plan.currency,
                method: paymentMethod || 'CREDIT_CARD',
                status: 'COMPLETED',
                transactionId: `txn_${Date.now()}`,
                metadata: paymentData || {}
            }
        });

        // Update journey progress
        await onboardingOrchestrator.handleSubscriptionActivation(userId, {
            subscriptionId: subscription.id,
            planId: plan.id,
            planName: plan.name,
            amount: plan.price,
            currency: plan.currency,
            paymentId: payment.id
        });

        res.status(201).json({
            success: true,
            message: 'Subscription created successfully',
            data: {
                subscription,
                invoice,
                payment
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error creating subscription:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create subscription',
            details: error.message
        });
    }
});

// Cancel subscription
router.post('/cancel/:subscriptionId', authenticateToken, async(req, res) => {
    try {
        const { subscriptionId } = req.params;
        const userId = req.user.id;

        // Get subscription
        const subscription = await prisma.subscription.findUnique({
            where: { id: subscriptionId },
            include: { plan: true }
        });

        if (!subscription) {
            return res.status(404).json({
                success: false,
                error: 'Subscription not found'
            });
        }

        // Check if user owns this subscription
        if (subscription.userId !== userId && req.user.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Cancel subscription
        const updatedSubscription = await prisma.subscription.update({
            where: { id: subscriptionId },
            data: {
                status: 'CANCELLED',
                endDate: new Date(),
                autoRenew: false
            },
            include: { plan: true }
        });

        res.json({
            success: true,
            message: 'Subscription cancelled successfully',
            data: updatedSubscription,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error cancelling subscription:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to cancel subscription',
            details: error.message
        });
    }
});

// ===== INVOICES & PAYMENTS =====

// Get user's invoices
router.get('/invoices/:userId', authenticateToken, async(req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user.id;

        // Check if user can access this data (own data or admin)
        if (userId !== currentUserId && req.user.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const invoices = await prisma.invoice.findMany({
            where: { userId },
            include: {
                subscription: {
                    include: { plan: true }
                },
                payments: true
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            success: true,
            data: invoices,
            count: invoices.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching user invoices:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user invoices',
            details: error.message
        });
    }
});

// Get user's payments
router.get('/payments/:userId', authenticateToken, async(req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user.id;

        // Check if user can access this data (own data or admin)
        if (userId !== currentUserId && req.user.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const payments = await prisma.payment.findMany({
            where: { userId },
            include: {
                invoice: {
                    include: {
                        subscription: {
                            include: { plan: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            success: true,
            data: payments,
            count: payments.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching user payments:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user payments',
            details: error.message
        });
    }
});

// ===== SUBSCRIPTION ANALYTICS =====

// Get subscription statistics
router.get('/analytics', authenticateToken, async(req, res) => {
    try {
        // Only admins can access analytics
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Access denied - Admin role required'
            });
        }

        const [
            totalSubscriptions,
            activeSubscriptions,
            totalRevenue,
            planStats
        ] = await Promise.all([
            prisma.subscription.count(),
            prisma.subscription.count({ where: { status: 'ACTIVE' } }),
            prisma.payment.aggregate({
                where: { status: 'COMPLETED' },
                _sum: { amount: true }
            }),
            prisma.subscription.groupBy({
                by: ['planId'],
                where: { status: 'ACTIVE' },
                _count: { planId: true },
                include: {
                    plan: true
                }
            })
        ]);

        res.json({
            success: true,
            data: {
                totalSubscriptions,
                activeSubscriptions,
                totalRevenue: totalRevenue._sum.amount || 0,
                planStats,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error fetching subscription analytics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch subscription analytics',
            details: error.message
        });
    }
});

// ===== SEEDING ENDPOINT =====
router.post('/seed', async (req, res) => {
    try {
        console.log('🌱 Seeding subscription plans...');

        // Create default subscription plans
        const defaultPlans = [
            {
                name: 'Starter Pack',
                description: 'Perfect for individuals getting started with SmartStart',
                price: 9.99,
                currency: 'USD',
                interval: 'MONTHLY',
                features: [
                    'Create up to 2 ventures',
                    'Basic team collaboration',
                    'Standard support',
                    'Core platform features'
                ],
                isActive: true
            },
            {
                name: 'All Features Pack',
                description: 'Complete access to all SmartStart features',
                price: 29.99,
                currency: 'USD',
                interval: 'MONTHLY',
                features: [
                    'Unlimited ventures',
                    'Advanced team collaboration',
                    'Priority support',
                    'Advanced analytics',
                    'Custom integrations',
                    'Legal document automation'
                ],
                isActive: true
            },
            {
                name: 'Enterprise Pack',
                description: 'For large teams and organizations',
                price: 99.99,
                currency: 'USD',
                interval: 'MONTHLY',
                features: [
                    'Everything in All Features Pack',
                    'Dedicated account manager',
                    'Custom legal agreements',
                    'Advanced security features',
                    'API access',
                    'White-label options'
                ],
                isActive: true
            }
        ];

        // Create subscription plans (check if they already exist first)
        for (const planData of defaultPlans) {
            const existingPlan = await prisma.billingPlan.findFirst({
                where: { name: planData.name }
            });
            
            if (!existingPlan) {
                await prisma.billingPlan.create({
                    data: planData
                });
            } else {
                // Update existing plan
                await prisma.billingPlan.update({
                    where: { id: existingPlan.id },
                    data: {
                        description: planData.description,
                        price: planData.price,
                        currency: planData.currency,
                        interval: planData.interval,
                        features: planData.features,
                        isActive: planData.isActive
                    }
                });
            }
        }

        console.log(`✅ Created ${defaultPlans.length} subscription plans`);

        res.json({
            success: true,
            message: 'Subscription plans seeded successfully',
            plansCreated: defaultPlans.length,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Subscription seeding error:', error);
        res.status(500).json({
            success: false,
            message: 'Subscription seeding failed',
            error: error.message
        });
    }
});

module.exports = router;