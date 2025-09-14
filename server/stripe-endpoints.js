#!/usr/bin/env node

/**
 * SmartStart Stripe API Endpoints
 * RESTful API endpoints for payment processing and subscription management
 */

const express = require('express');
const paymentService = require('./payment-service');
const eventSystem = require('./event-system');
const messageQueue = require('./message-queue');

const router = express.Router();

// Middleware for authentication and validation
const authenticateUser = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ success: false, error: 'No token provided' });
    }

    // In a real implementation, this would validate the JWT token
    req.user = { id: 'user-123', email: 'user@example.com', name: 'Test User' };
    next();
};

// Customer Management Endpoints
router.post('/customers', authenticateUser, async(req, res) => {
    try {
        const customer = await paymentService.createCustomer(req.user);
        res.json({
            success: true,
            customer: {
                id: customer.id,
                email: customer.email,
                name: customer.name,
                created: customer.created
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.get('/customers/:customerId', authenticateUser, async(req, res) => {
    try {
        const customer = await paymentService.getCustomer(req.params.customerId);
        res.json({
            success: true,
            customer: {
                id: customer.id,
                email: customer.email,
                name: customer.name,
                created: customer.created
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Payment Methods Endpoints
router.post('/customers/:customerId/payment-methods', authenticateUser, async(req, res) => {
    try {
        const { card, billing_details } = req.body;
        const paymentMethod = await paymentService.createPaymentMethod(
            req.params.customerId, { card, billing_details }
        );

        res.json({
            success: true,
            paymentMethod: {
                id: paymentMethod.id,
                type: paymentMethod.type,
                card: {
                    brand: paymentMethod.card.brand,
                    last4: paymentMethod.card.last4,
                    exp_month: paymentMethod.card.exp_month,
                    exp_year: paymentMethod.card.exp_year
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.get('/customers/:customerId/payment-methods', authenticateUser, async(req, res) => {
    try {
        const paymentMethods = await paymentService.getPaymentMethods(req.params.customerId);
        res.json({
            success: true,
            paymentMethods: paymentMethods.map(pm => ({
                id: pm.id,
                type: pm.type,
                card: {
                    brand: pm.card.brand,
                    last4: pm.card.last4,
                    exp_month: pm.card.exp_month,
                    exp_year: pm.card.exp_year
                }
            }))
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Payment Intent Endpoints
router.post('/payment-intents', authenticateUser, async(req, res) => {
    try {
        const { amount, currency, customerId, metadata } = req.body;
        const paymentIntent = await paymentService.createPaymentIntent(
            amount,
            currency,
            customerId,
            metadata
        );

        res.json({
            success: true,
            paymentIntent: {
                id: paymentIntent.id,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency,
                status: paymentIntent.status,
                client_secret: paymentIntent.client_secret
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.post('/payment-intents/:paymentIntentId/confirm', authenticateUser, async(req, res) => {
    try {
        const { paymentMethodId } = req.body;
        const paymentIntent = await paymentService.confirmPaymentIntent(
            req.params.paymentIntentId,
            paymentMethodId
        );

        res.json({
            success: true,
            paymentIntent: {
                id: paymentIntent.id,
                status: paymentIntent.status,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// BUZ Token Purchase Endpoints
router.post('/buz/purchase', authenticateUser, async(req, res) => {
    try {
        const { amount, paymentMethodId } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid amount'
            });
        }

        const result = await paymentService.purchaseBuzTokens(
            req.user.id,
            amount,
            paymentMethodId
        );

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Subscription Endpoints
router.post('/subscriptions', authenticateUser, async(req, res) => {
    try {
        const { customerId, priceId, metadata } = req.body;
        const subscription = await paymentService.createSubscription(
            customerId,
            priceId,
            metadata
        );

        res.json({
            success: true,
            subscription: {
                id: subscription.id,
                status: subscription.status,
                customer: subscription.customer,
                current_period_start: subscription.current_period_start,
                current_period_end: subscription.current_period_end
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.get('/subscriptions/:subscriptionId', authenticateUser, async(req, res) => {
    try {
        const subscription = await paymentService.getSubscription(req.params.subscriptionId);
        res.json({
            success: true,
            subscription: {
                id: subscription.id,
                status: subscription.status,
                customer: subscription.customer,
                current_period_start: subscription.current_period_start,
                current_period_end: subscription.current_period_end
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.put('/subscriptions/:subscriptionId', authenticateUser, async(req, res) => {
    try {
        const { updateData } = req.body;
        const subscription = await paymentService.updateSubscription(
            req.params.subscriptionId,
            updateData
        );

        res.json({
            success: true,
            subscription: {
                id: subscription.id,
                status: subscription.status,
                customer: subscription.customer
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.delete('/subscriptions/:subscriptionId', authenticateUser, async(req, res) => {
    try {
        const { immediately } = req.query;
        const subscription = await paymentService.cancelSubscription(
            req.params.subscriptionId,
            immediately === 'true'
        );

        res.json({
            success: true,
            subscription: {
                id: subscription.id,
                status: subscription.status,
                cancel_at_period_end: subscription.cancel_at_period_end
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Product and Price Endpoints
router.post('/products', authenticateUser, async(req, res) => {
    try {
        const { name, description, metadata } = req.body;
        const product = await paymentService.createProduct(name, description, metadata);

        res.json({
            success: true,
            product: {
                id: product.id,
                name: product.name,
                description: product.description,
                created: product.created
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.post('/prices', authenticateUser, async(req, res) => {
    try {
        const { productId, amount, currency, interval, metadata } = req.body;
        const price = await paymentService.createPrice(
            productId,
            amount,
            currency,
            interval,
            metadata
        );

        res.json({
            success: true,
            price: {
                id: price.id,
                product: price.product,
                unit_amount: price.unit_amount,
                currency: price.currency,
                recurring: price.recurring
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Checkout Session Endpoints
router.post('/checkout/sessions', authenticateUser, async(req, res) => {
    try {
        const { customerId, priceId, successUrl, cancelUrl, metadata } = req.body;
        const session = await paymentService.createCheckoutSession(
            customerId,
            priceId,
            successUrl,
            cancelUrl,
            metadata
        );

        res.json({
            success: true,
            session: {
                id: session.id,
                url: session.url,
                customer: session.customer
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Revenue Sharing Endpoints
router.post('/revenue-share', authenticateUser, async(req, res) => {
    try {
        const { ventureId, amount, platformFee } = req.body;
        const transfer = await paymentService.processRevenueShare(
            ventureId,
            amount,
            platformFee
        );

        res.json({
            success: true,
            transfer: {
                id: transfer.id,
                amount: transfer.amount,
                currency: transfer.currency,
                destination: transfer.destination
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Webhook Endpoint
router.post('/webhooks', express.raw({ type: 'application/json' }), async(req, res) => {
    try {
        const signature = req.headers['stripe-signature'];
        const result = await paymentService.handleWebhook(req.body, signature);

        res.json(result);
    } catch (error) {
        console.error('❌ Webhook error:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// Analytics Endpoints
router.get('/analytics', authenticateUser, async(req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const start = new Date(startDate);
        const end = new Date(endDate);

        const analytics = await paymentService.getPaymentAnalytics(start, end);

        res.json({
            success: true,
            analytics: analytics
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Health Check
router.get('/health', (req, res) => {
    const stats = paymentService.getStats();
    res.json({
        success: true,
        status: 'healthy',
        stats: stats
    });
});

module.exports = router;