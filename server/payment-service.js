#!/usr/bin/env node

/**
 * SmartStart Payment Service
 * Stripe integration for real payment processing and subscription management
 */

const Stripe = require('stripe');
const eventSystem = require('./event-system');
const messageQueue = require('./message-queue');

class SmartStartPaymentService {
    constructor(options = {}) {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_...');
        this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        this.currency = options.currency || 'usd';
        this.taxRate = options.taxRate || 0.13; // 13% tax rate
        this.platformFeeRate = options.platformFeeRate || 0.05; // 5% platform fee

        this.setupWebhooks();
        this.setupEventHandlers();
    }

    setupWebhooks() {
        // Webhook handlers for Stripe events
        this.webhookHandlers = {
            'payment_intent.succeeded': this.handlePaymentSucceeded.bind(this),
            'payment_intent.payment_failed': this.handlePaymentFailed.bind(this),
            'customer.subscription.created': this.handleSubscriptionCreated.bind(this),
            'customer.subscription.updated': this.handleSubscriptionUpdated.bind(this),
            'customer.subscription.deleted': this.handleSubscriptionDeleted.bind(this),
            'invoice.payment_succeeded': this.handleInvoicePaymentSucceeded.bind(this),
            'invoice.payment_failed': this.handleInvoicePaymentFailed.bind(this),
            'checkout.session.completed': this.handleCheckoutCompleted.bind(this)
        };
    }

    setupEventHandlers() {
        // Listen for internal events
        eventSystem.subscribe('buz.purchase.request', this.handleBuzPurchaseRequest.bind(this));
        eventSystem.subscribe('subscription.create.request', this.handleSubscriptionCreateRequest.bind(this));
        eventSystem.subscribe('venture.payment.request', this.handleVenturePaymentRequest.bind(this));
    }

    // Customer Management
    async createCustomer(userData) {
        try {
            const customer = await this.stripe.customers.create({
                email: userData.email,
                name: userData.name,
                metadata: {
                    userId: userData.id,
                    role: userData.role
                }
            });

            console.log(`👤 Stripe customer created: ${customer.id}`);
            return customer;
        } catch (error) {
            console.error('❌ Error creating Stripe customer:', error);
            throw error;
        }
    }

    async getCustomer(customerId) {
        try {
            return await this.stripe.customers.retrieve(customerId);
        } catch (error) {
            console.error('❌ Error retrieving Stripe customer:', error);
            throw error;
        }
    }

    async updateCustomer(customerId, updateData) {
        try {
            return await this.stripe.customers.update(customerId, updateData);
        } catch (error) {
            console.error('❌ Error updating Stripe customer:', error);
            throw error;
        }
    }

    // Payment Methods
    async createPaymentMethod(customerId, paymentMethodData) {
        try {
            const paymentMethod = await this.stripe.paymentMethods.create({
                type: 'card',
                card: paymentMethodData.card,
                billing_details: paymentMethodData.billing_details
            });

            // Attach to customer
            await this.stripe.paymentMethods.attach(paymentMethod.id, {
                customer: customerId
            });

            return paymentMethod;
        } catch (error) {
            console.error('❌ Error creating payment method:', error);
            throw error;
        }
    }

    async getPaymentMethods(customerId) {
        try {
            const paymentMethods = await this.stripe.paymentMethods.list({
                customer: customerId,
                type: 'card'
            });

            return paymentMethods.data;
        } catch (error) {
            console.error('❌ Error retrieving payment methods:', error);
            throw error;
        }
    }

    // One-time Payments
    async createPaymentIntent(amount, currency, customerId, metadata = {}) {
        try {
            const paymentIntent = await this.stripe.paymentIntents.create({
                amount: Math.round(amount * 100), // Convert to cents
                currency: currency || this.currency,
                customer: customerId,
                metadata: {
                    ...metadata,
                    platform: 'smartstart'
                },
                automatic_payment_methods: {
                    enabled: true
                }
            });

            console.log(`💳 Payment intent created: ${paymentIntent.id}`);
            return paymentIntent;
        } catch (error) {
            console.error('❌ Error creating payment intent:', error);
            throw error;
        }
    }

    async confirmPaymentIntent(paymentIntentId, paymentMethodId) {
        try {
            const paymentIntent = await this.stripe.paymentIntents.confirm(paymentIntentId, {
                payment_method: paymentMethodId
            });

            return paymentIntent;
        } catch (error) {
            console.error('❌ Error confirming payment intent:', error);
            throw error;
        }
    }

    // BUZ Token Purchases
    async purchaseBuzTokens(userId, amount, paymentMethodId) {
        try {
            // Calculate pricing
            const buzPrice = 0.01; // $0.01 per BUZ token
            const subtotal = amount * buzPrice;
            const tax = subtotal * this.taxRate;
            const total = subtotal + tax;

            // Create payment intent
            const paymentIntent = await this.createPaymentIntent(
                total,
                this.currency,
                userId, {
                    type: 'buz_purchase',
                    buzAmount: amount,
                    buzPrice: buzPrice
                }
            );

            // Confirm payment
            const confirmedPayment = await this.confirmPaymentIntent(
                paymentIntent.id,
                paymentMethodId
            );

            if (confirmedPayment.status === 'succeeded') {
                // Award BUZ tokens
                await this.awardBuzTokens(userId, amount, paymentIntent.id);

                // Publish event
                eventSystem.publishEvent('buz.purchase.completed', {
                    userId: userId,
                    amount: amount,
                    paymentIntentId: paymentIntent.id,
                    totalPaid: total
                });

                return {
                    success: true,
                    paymentIntent: confirmedPayment,
                    buzAmount: amount,
                    totalPaid: total
                };
            } else {
                throw new Error('Payment not completed');
            }
        } catch (error) {
            console.error('❌ Error purchasing BUZ tokens:', error);
            throw error;
        }
    }

    async awardBuzTokens(userId, amount, paymentIntentId) {
        // This would integrate with the BUZ token system
        console.log(`💰 Awarding ${amount} BUZ tokens to user ${userId}`);

        // Publish event for BUZ system to handle
        eventSystem.publishEvent('buz.award', {
            userId: userId,
            amount: amount,
            reason: 'Token Purchase',
            paymentIntentId: paymentIntentId
        });
    }

    // Subscription Management
    async createSubscription(customerId, priceId, metadata = {}) {
        try {
            const subscription = await this.stripe.subscriptions.create({
                customer: customerId,
                items: [{ price: priceId }],
                metadata: {
                    ...metadata,
                    platform: 'smartstart'
                },
                payment_behavior: 'default_incomplete',
                payment_settings: { save_default_payment_method: 'on_subscription' },
                expand: ['latest_invoice.payment_intent']
            });

            console.log(`📋 Subscription created: ${subscription.id}`);
            return subscription;
        } catch (error) {
            console.error('❌ Error creating subscription:', error);
            throw error;
        }
    }

    async getSubscription(subscriptionId) {
        try {
            return await this.stripe.subscriptions.retrieve(subscriptionId);
        } catch (error) {
            console.error('❌ Error retrieving subscription:', error);
            throw error;
        }
    }

    async updateSubscription(subscriptionId, updateData) {
        try {
            return await this.stripe.subscriptions.update(subscriptionId, updateData);
        } catch (error) {
            console.error('❌ Error updating subscription:', error);
            throw error;
        }
    }

    async cancelSubscription(subscriptionId, immediately = false) {
        try {
            const subscription = await this.stripe.subscriptions.update(subscriptionId, {
                cancel_at_period_end: !immediately
            });

            if (immediately) {
                await this.stripe.subscriptions.cancel(subscriptionId);
            }

            console.log(`❌ Subscription cancelled: ${subscriptionId}`);
            return subscription;
        } catch (error) {
            console.error('❌ Error cancelling subscription:', error);
            throw error;
        }
    }

    // Products and Pricing
    async createProduct(name, description, metadata = {}) {
        try {
            const product = await this.stripe.products.create({
                name: name,
                description: description,
                metadata: {
                    ...metadata,
                    platform: 'smartstart'
                }
            });

            console.log(`📦 Product created: ${product.id}`);
            return product;
        } catch (error) {
            console.error('❌ Error creating product:', error);
            throw error;
        }
    }

    async createPrice(productId, amount, currency, interval = null, metadata = {}) {
        try {
            const priceData = {
                product: productId,
                unit_amount: Math.round(amount * 100), // Convert to cents
                currency: currency || this.currency,
                metadata: {
                    ...metadata,
                    platform: 'smartstart'
                }
            };

            if (interval) {
                priceData.recurring = { interval: interval };
            }

            const price = await this.stripe.prices.create(priceData);

            console.log(`💰 Price created: ${price.id}`);
            return price;
        } catch (error) {
            console.error('❌ Error creating price:', error);
            throw error;
        }
    }

    // Checkout Sessions
    async createCheckoutSession(customerId, priceId, successUrl, cancelUrl, metadata = {}) {
        try {
            const session = await this.stripe.checkout.sessions.create({
                customer: customerId,
                payment_method_types: ['card'],
                line_items: [{
                    price: priceId,
                    quantity: 1
                }],
                mode: 'subscription',
                success_url: successUrl,
                cancel_url: cancelUrl,
                metadata: {
                    ...metadata,
                    platform: 'smartstart'
                }
            });

            console.log(`🛒 Checkout session created: ${session.id}`);
            return session;
        } catch (error) {
            console.error('❌ Error creating checkout session:', error);
            throw error;
        }
    }

    // Revenue Sharing
    async processRevenueShare(ventureId, amount, platformFee = null) {
        try {
            const fee = platformFee || (amount * this.platformFeeRate);
            const ventureAmount = amount - fee;

            // Create transfer to venture account
            const transfer = await this.stripe.transfers.create({
                amount: Math.round(ventureAmount * 100),
                currency: this.currency,
                destination: ventureId, // This would be the venture's Stripe account
                metadata: {
                    type: 'revenue_share',
                    ventureId: ventureId,
                    platformFee: fee
                }
            });

            console.log(`💰 Revenue share processed: ${transfer.id}`);

            // Publish event
            eventSystem.publishEvent('revenue.share.completed', {
                ventureId: ventureId,
                amount: ventureAmount,
                platformFee: fee,
                transferId: transfer.id
            });

            return transfer;
        } catch (error) {
            console.error('❌ Error processing revenue share:', error);
            throw error;
        }
    }

    // Webhook Handlers
    async handleWebhook(payload, signature) {
        try {
            const event = this.stripe.webhooks.constructEvent(
                payload,
                signature,
                this.webhookSecret
            );

            const handler = this.webhookHandlers[event.type];
            if (handler) {
                await handler(event.data.object);
            } else {
                console.log(`⚠️ Unhandled webhook event: ${event.type}`);
            }

            return { success: true };
        } catch (error) {
            console.error('❌ Webhook error:', error);
            throw error;
        }
    }

    handlePaymentSucceeded(paymentIntent) {
        console.log(`✅ Payment succeeded: ${paymentIntent.id}`);

        eventSystem.publishEvent('payment.succeeded', {
            paymentIntentId: paymentIntent.id,
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency,
            customerId: paymentIntent.customer,
            metadata: paymentIntent.metadata
        });
    }

    handlePaymentFailed(paymentIntent) {
        console.log(`❌ Payment failed: ${paymentIntent.id}`);

        eventSystem.publishEvent('payment.failed', {
            paymentIntentId: paymentIntent.id,
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency,
            customerId: paymentIntent.customer,
            error: paymentIntent.last_payment_error
        });
    }

    handleSubscriptionCreated(subscription) {
        console.log(`📋 Subscription created: ${subscription.id}`);

        eventSystem.publishEvent('subscription.created', {
            subscriptionId: subscription.id,
            customerId: subscription.customer,
            status: subscription.status,
            metadata: subscription.metadata
        });
    }

    handleSubscriptionUpdated(subscription) {
        console.log(`📋 Subscription updated: ${subscription.id}`);

        eventSystem.publishEvent('subscription.updated', {
            subscriptionId: subscription.id,
            customerId: subscription.customer,
            status: subscription.status,
            metadata: subscription.metadata
        });
    }

    handleSubscriptionDeleted(subscription) {
        console.log(`❌ Subscription deleted: ${subscription.id}`);

        eventSystem.publishEvent('subscription.deleted', {
            subscriptionId: subscription.id,
            customerId: subscription.customer,
            metadata: subscription.metadata
        });
    }

    handleInvoicePaymentSucceeded(invoice) {
        console.log(`✅ Invoice payment succeeded: ${invoice.id}`);

        eventSystem.publishEvent('invoice.payment.succeeded', {
            invoiceId: invoice.id,
            subscriptionId: invoice.subscription,
            customerId: invoice.customer,
            amount: invoice.amount_paid / 100
        });
    }

    handleInvoicePaymentFailed(invoice) {
        console.log(`❌ Invoice payment failed: ${invoice.id}`);

        eventSystem.publishEvent('invoice.payment.failed', {
            invoiceId: invoice.id,
            subscriptionId: invoice.subscription,
            customerId: invoice.customer,
            amount: invoice.amount_due / 100
        });
    }

    handleCheckoutCompleted(session) {
        console.log(`🛒 Checkout completed: ${session.id}`);

        eventSystem.publishEvent('checkout.completed', {
            sessionId: session.id,
            customerId: session.customer,
            subscriptionId: session.subscription,
            metadata: session.metadata
        });
    }

    // Event Handlers
    async handleBuzPurchaseRequest(event) {
        try {
            const { userId, amount, paymentMethodId } = event.data;

            await this.purchaseBuzTokens(userId, amount, paymentMethodId);
        } catch (error) {
            console.error('❌ Error handling BUZ purchase request:', error);
        }
    }

    async handleSubscriptionCreateRequest(event) {
        try {
            const { customerId, priceId, metadata } = event.data;

            await this.createSubscription(customerId, priceId, metadata);
        } catch (error) {
            console.error('❌ Error handling subscription create request:', error);
        }
    }

    async handleVenturePaymentRequest(event) {
        try {
            const { ventureId, amount, platformFee } = event.data;

            await this.processRevenueShare(ventureId, amount, platformFee);
        } catch (error) {
            console.error('❌ Error handling venture payment request:', error);
        }
    }

    // Analytics and Reporting
    async getPaymentAnalytics(startDate, endDate) {
        try {
            const payments = await this.stripe.paymentIntents.list({
                created: {
                    gte: Math.floor(startDate.getTime() / 1000),
                    lte: Math.floor(endDate.getTime() / 1000)
                },
                limit: 100
            });

            const subscriptions = await this.stripe.subscriptions.list({
                created: {
                    gte: Math.floor(startDate.getTime() / 1000),
                    lte: Math.floor(endDate.getTime() / 1000)
                },
                limit: 100
            });

            return {
                totalPayments: payments.data.length,
                totalRevenue: payments.data.reduce((sum, payment) => sum + payment.amount, 0) / 100,
                totalSubscriptions: subscriptions.data.length,
                activeSubscriptions: subscriptions.data.filter(sub => sub.status === 'active').length
            };
        } catch (error) {
            console.error('❌ Error getting payment analytics:', error);
            throw error;
        }
    }

    // Utility Methods
    formatAmount(amount, currency = this.currency) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency.toUpperCase()
        }).format(amount);
    }

    getStats() {
        return {
            currency: this.currency,
            taxRate: this.taxRate,
            platformFeeRate: this.platformFeeRate,
            stripeConnected: !!this.stripe,
            uptime: process.uptime()
        };
    }
}

// Create singleton instance
const paymentService = new SmartStartPaymentService({
    currency: 'usd',
    taxRate: 0.13,
    platformFeeRate: 0.05
});

module.exports = paymentService;