#!/usr/bin/env node

/**
 * SmartStart Billing Service
 * Automated subscription billing and revenue sharing system
 */

const eventSystem = require('./event-system');
const messageQueue = require('./message-queue');
const paymentService = require('./payment-service');

class SmartStartBillingService {
    constructor(options = {}) {
        this.subscriptionPlans = new Map();
        this.revenueSharingRules = new Map();
        this.billingCycles = new Map(); // userId -> billing cycle info
        this.umbrellaNetwork = new Map(); // referral relationships

        this.setupDefaultPlans();
        this.setupRevenueSharingRules();
        this.setupEventHandlers();
        this.startBillingScheduler();
    }

    setupDefaultPlans() {
        // Define subscription plans
        const plans = [{
                id: 'basic',
                name: 'Basic Plan',
                description: 'Essential features for individual users',
                price: 9.99,
                currency: 'usd',
                interval: 'month',
                features: [
                    'Create up to 2 ventures',
                    'Basic team collaboration',
                    'Standard support',
                    '100 BUZ tokens monthly'
                ],
                limits: {
                    ventures: 2,
                    teamMembers: 5,
                    storage: '1GB'
                }
            },
            {
                id: 'pro',
                name: 'Pro Plan',
                description: 'Advanced features for growing teams',
                price: 29.99,
                currency: 'usd',
                interval: 'month',
                features: [
                    'Create unlimited ventures',
                    'Advanced team collaboration',
                    'Priority support',
                    '500 BUZ tokens monthly',
                    'Advanced analytics'
                ],
                limits: {
                    ventures: -1, // unlimited
                    teamMembers: 25,
                    storage: '10GB'
                }
            },
            {
                id: 'enterprise',
                name: 'Enterprise Plan',
                description: 'Full features for large organizations',
                price: 99.99,
                currency: 'usd',
                interval: 'month',
                features: [
                    'Everything in Pro',
                    'White-label options',
                    'Dedicated support',
                    '2000 BUZ tokens monthly',
                    'Custom integrations',
                    'Advanced security'
                ],
                limits: {
                    ventures: -1,
                    teamMembers: -1,
                    storage: '100GB'
                }
            }
        ];

        plans.forEach(plan => {
            this.subscriptionPlans.set(plan.id, plan);
        });
    }

    setupRevenueSharingRules() {
        // Define revenue sharing rules
        const rules = [{
                id: 'venture_revenue',
                name: 'Venture Revenue Sharing',
                description: 'Revenue sharing for venture projects',
                platformFee: 0.05, // 5% platform fee
                umbrellaFee: 0.15, // 15% umbrella network fee
                ventureShare: 0.80, // 80% to venture
                conditions: {
                    minRevenue: 100, // Minimum $100 revenue
                    activeSubscription: true
                }
            },
            {
                id: 'referral_revenue',
                name: 'Referral Revenue Sharing',
                description: 'Revenue sharing for referrals',
                platformFee: 0.05, // 5% platform fee
                umbrellaFee: 0.20, // 20% umbrella network fee
                referrerShare: 0.75, // 75% to referrer
                conditions: {
                    activeReferral: true,
                    minReferralRevenue: 50
                }
            },
            {
                id: 'legal_services',
                name: 'Legal Services Revenue',
                description: 'Revenue sharing for legal document services',
                platformFee: 0.10, // 10% platform fee
                umbrellaFee: 0.10, // 10% umbrella network fee
                serviceShare: 0.80, // 80% to service provider
                conditions: {
                    verifiedProvider: true
                }
            }
        ];

        rules.forEach(rule => {
            this.revenueSharingRules.set(rule.id, rule);
        });
    }

    setupEventHandlers() {
        // Listen for billing-related events
        eventSystem.subscribe('subscription.created', this.handleSubscriptionCreated.bind(this));
        eventSystem.subscribe('subscription.updated', this.handleSubscriptionUpdated.bind(this));
        eventSystem.subscribe('subscription.deleted', this.handleSubscriptionDeleted.bind(this));
        eventSystem.subscribe('invoice.payment.succeeded', this.handleInvoicePaymentSucceeded.bind(this));
        eventSystem.subscribe('invoice.payment.failed', this.handleInvoicePaymentFailed.bind(this));
        eventSystem.subscribe('revenue.generated', this.handleRevenueGenerated.bind(this));
        eventSystem.subscribe('umbrella.referral.created', this.handleUmbrellaReferralCreated.bind(this));
    }

    startBillingScheduler() {
        // Run billing processes every hour
        setInterval(() => {
            this.processBillingCycle();
        }, 60 * 60 * 1000); // 1 hour

        // Run revenue sharing every 6 hours
        setInterval(() => {
            this.processRevenueSharing();
        }, 6 * 60 * 60 * 1000); // 6 hours

        console.log('💰 Billing scheduler started');
    }

    // Subscription Management
    async createSubscription(userId, planId, paymentMethodId) {
        try {
            const plan = this.subscriptionPlans.get(planId);
            if (!plan) {
                throw new Error(`Plan ${planId} not found`);
            }

            // Create Stripe subscription
            const subscription = await paymentService.createSubscription(
                userId,
                plan.stripePriceId, // This would be set when creating Stripe prices
                {
                    userId: userId,
                    planId: planId
                }
            );

            // Store billing cycle info
            this.billingCycles.set(userId, {
                planId: planId,
                subscriptionId: subscription.id,
                nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                status: 'active',
                features: plan.features,
                limits: plan.limits
            });

            // Publish event
            eventSystem.publishEvent('subscription.billing.created', {
                userId: userId,
                planId: planId,
                subscriptionId: subscription.id,
                nextBillingDate: this.billingCycles.get(userId).nextBillingDate
            });

            console.log(`📋 Subscription created for user ${userId}: ${planId}`);
            return subscription;
        } catch (error) {
            console.error('❌ Error creating subscription:', error);
            throw error;
        }
    }

    async updateSubscription(userId, newPlanId) {
        try {
            const currentBilling = this.billingCycles.get(userId);
            if (!currentBilling) {
                throw new Error('No active subscription found');
            }

            const newPlan = this.subscriptionPlans.get(newPlanId);
            if (!newPlan) {
                throw new Error(`Plan ${newPlanId} not found`);
            }

            // Update Stripe subscription
            const subscription = await paymentService.updateSubscription(
                currentBilling.subscriptionId, { planId: newPlanId }
            );

            // Update billing cycle info
            this.billingCycles.set(userId, {
                ...currentBilling,
                planId: newPlanId,
                features: newPlan.features,
                limits: newPlan.limits
            });

            // Publish event
            eventSystem.publishEvent('subscription.billing.updated', {
                userId: userId,
                oldPlanId: currentBilling.planId,
                newPlanId: newPlanId,
                subscriptionId: subscription.id
            });

            console.log(`📋 Subscription updated for user ${userId}: ${newPlanId}`);
            return subscription;
        } catch (error) {
            console.error('❌ Error updating subscription:', error);
            throw error;
        }
    }

    async cancelSubscription(userId, immediately = false) {
        try {
            const billing = this.billingCycles.get(userId);
            if (!billing) {
                throw new Error('No active subscription found');
            }

            // Cancel Stripe subscription
            await paymentService.cancelSubscription(billing.subscriptionId, immediately);

            // Update billing cycle info
            this.billingCycles.set(userId, {
                ...billing,
                status: immediately ? 'cancelled' : 'cancelling',
                cancelledAt: new Date()
            });

            // Publish event
            eventSystem.publishEvent('subscription.billing.cancelled', {
                userId: userId,
                planId: billing.planId,
                subscriptionId: billing.subscriptionId,
                immediately: immediately
            });

            console.log(`❌ Subscription cancelled for user ${userId}`);
            return true;
        } catch (error) {
            console.error('❌ Error cancelling subscription:', error);
            throw error;
        }
    }

    // Billing Cycle Processing
    async processBillingCycle() {
        console.log('💰 Processing billing cycle...');

        const now = new Date();
        const dueSubscriptions = [];

        // Find subscriptions due for billing
        for (const [userId, billing] of this.billingCycles) {
            if (billing.status === 'active' && billing.nextBillingDate <= now) {
                dueSubscriptions.push({ userId, billing });
            }
        }

        // Process each due subscription
        for (const { userId, billing }
            of dueSubscriptions) {
            try {
                await this.processSubscriptionBilling(userId, billing);
            } catch (error) {
                console.error(`❌ Error processing billing for user ${userId}:`, error);
            }
        }

        console.log(`💰 Processed ${dueSubscriptions.length} billing cycles`);
    }

    async processSubscriptionBilling(userId, billing) {
        try {
            const plan = this.subscriptionPlans.get(billing.planId);
            if (!plan) {
                throw new Error(`Plan ${billing.planId} not found`);
            }

            // Create invoice
            const invoice = await this.createInvoice(userId, plan);

            // Process payment
            const paymentResult = await this.processPayment(userId, invoice);

            if (paymentResult.success) {
                // Update billing cycle
                this.billingCycles.set(userId, {
                    ...billing,
                    nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    lastBillingDate: new Date()
                });

                // Award BUZ tokens
                await this.awardSubscriptionTokens(userId, plan);

                // Publish success event
                eventSystem.publishEvent('subscription.billing.success', {
                    userId: userId,
                    planId: billing.planId,
                    amount: plan.price,
                    invoiceId: invoice.id
                });

                console.log(`✅ Billing successful for user ${userId}: $${plan.price}`);
            } else {
                // Handle payment failure
                await this.handlePaymentFailure(userId, billing, paymentResult.error);
            }
        } catch (error) {
            console.error(`❌ Error processing subscription billing for user ${userId}:`, error);
            throw error;
        }
    }

    async createInvoice(userId, plan) {
        const invoice = {
            id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId: userId,
            planId: plan.id,
            amount: plan.price,
            currency: plan.currency,
            description: `${plan.name} subscription`,
            dueDate: new Date(),
            status: 'pending',
            items: [{
                description: plan.name,
                amount: plan.price,
                quantity: 1
            }]
        };

        // Store invoice (in real implementation, this would be stored in database)
        console.log(`📄 Invoice created: ${invoice.id}`);
        return invoice;
    }

    async processPayment(userId, invoice) {
        try {
            // In real implementation, this would process the actual payment
            // For now, we'll simulate a successful payment
            console.log(`💳 Processing payment for invoice ${invoice.id}: $${invoice.amount}`);

            // Simulate payment processing delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            return { success: true, transactionId: `tx_${Date.now()}` };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async awardSubscriptionTokens(userId, plan) {
        // Award monthly BUZ token allocation
        const tokenAmount = this.getMonthlyTokenAllocation(plan.id);

        eventSystem.publishEvent('buz.award', {
            userId: userId,
            amount: tokenAmount,
            reason: 'Monthly Subscription',
            planId: plan.id
        });

        console.log(`💰 Awarded ${tokenAmount} BUZ tokens to user ${userId}`);
    }

    getMonthlyTokenAllocation(planId) {
        const allocations = {
            'basic': 100,
            'pro': 500,
            'enterprise': 2000
        };
        return allocations[planId] || 0;
    }

    async handlePaymentFailure(userId, billing, error) {
        // Update billing status
        this.billingCycles.set(userId, {
            ...billing,
            status: 'payment_failed',
            lastFailureDate: new Date(),
            failureCount: (billing.failureCount || 0) + 1
        });

        // Publish failure event
        eventSystem.publishEvent('subscription.billing.failed', {
            userId: userId,
            planId: billing.planId,
            error: error,
            failureCount: billing.failureCount + 1
        });

        // Send notification
        await messageQueue.addJob('notification', {
            userId: userId,
            type: 'PAYMENT_FAILED',
            title: 'Payment Failed',
            message: 'Your subscription payment failed. Please update your payment method.'
        });

        console.log(`❌ Payment failed for user ${userId}: ${error}`);
    }

    // Revenue Sharing
    async processRevenueSharing() {
        console.log('💰 Processing revenue sharing...');

        // Get all pending revenue shares
        const pendingShares = await this.getPendingRevenueShares();

        for (const share of pendingShares) {
            try {
                await this.processRevenueShare(share);
            } catch (error) {
                console.error(`❌ Error processing revenue share ${share.id}:`, error);
            }
        }

        console.log(`💰 Processed ${pendingShares.length} revenue shares`);
    }

    async getPendingRevenueShares() {
        // In real implementation, this would query the database
        // For now, return empty array
        return [];
    }

    async processRevenueShare(share) {
        try {
            const rule = this.revenueSharingRules.get(share.ruleId);
            if (!rule) {
                throw new Error(`Revenue sharing rule ${share.ruleId} not found`);
            }

            // Calculate shares
            const platformFee = share.amount * rule.platformFee;
            const umbrellaFee = share.amount * rule.umbrellaFee;
            const recipientShare = share.amount - platformFee - umbrellaFee;

            // Process platform fee
            await this.processPlatformFee(platformFee, share);

            // Process umbrella network fee
            await this.processUmbrellaFee(umbrellaFee, share);

            // Process recipient share
            await this.processRecipientShare(recipientShare, share);

            // Mark as processed
            await this.markRevenueShareProcessed(share.id);

            console.log(`💰 Revenue share processed: ${share.id}`);
        } catch (error) {
            console.error(`❌ Error processing revenue share ${share.id}:`, error);
            throw error;
        }
    }

    async processPlatformFee(amount, share) {
        // Platform fee goes to SmartStart
        eventSystem.publishEvent('revenue.platform.fee', {
            amount: amount,
            shareId: share.id,
            type: 'platform_fee'
        });
    }

    async processUmbrellaFee(amount, share) {
        // Umbrella network fee is distributed to referrers
        const referrers = this.getUmbrellaReferrers(share.userId);

        for (const referrer of referrers) {
            const referrerShare = amount * referrer.shareRate;
            await this.transferToReferrer(referrer.userId, referrerShare, share);
        }
    }

    async processRecipientShare(amount, share) {
        // Recipient gets their share
        await this.transferToRecipient(share.userId, amount, share);
    }

    getUmbrellaReferrers(userId) {
        // Get referrers from umbrella network
        const referrers = [];
        let currentUserId = userId;

        // Traverse up the referral chain
        while (this.umbrellaNetwork.has(currentUserId)) {
            const referral = this.umbrellaNetwork.get(currentUserId);
            referrers.push({
                userId: referral.referrerId,
                shareRate: referral.shareRate
            });
            currentUserId = referral.referrerId;
        }

        return referrers;
    }

    async transferToReferrer(referrerId, amount, share) {
        // Transfer to referrer's account
        eventSystem.publishEvent('revenue.umbrella.transfer', {
            referrerId: referrerId,
            amount: amount,
            shareId: share.id,
            type: 'umbrella_fee'
        });
    }

    async transferToRecipient(userId, amount, share) {
        // Transfer to recipient's account
        eventSystem.publishEvent('revenue.recipient.transfer', {
            userId: userId,
            amount: amount,
            shareId: share.id,
            type: 'recipient_share'
        });
    }

    async markRevenueShareProcessed(shareId) {
        // Mark revenue share as processed in database
        console.log(`✅ Revenue share marked as processed: ${shareId}`);
    }

    // Event Handlers
    async handleSubscriptionCreated(event) {
        console.log('📋 Subscription created event received:', event.data.subscriptionId);
    }

    async handleSubscriptionUpdated(event) {
        console.log('📋 Subscription updated event received:', event.data.subscriptionId);
    }

    async handleSubscriptionDeleted(event) {
        console.log('❌ Subscription deleted event received:', event.data.subscriptionId);
    }

    async handleInvoicePaymentSucceeded(event) {
        console.log('✅ Invoice payment succeeded:', event.data.invoiceId);
    }

    async handleInvoicePaymentFailed(event) {
        console.log('❌ Invoice payment failed:', event.data.invoiceId);
    }

    async handleRevenueGenerated(event) {
        console.log('💰 Revenue generated event received:', event.data);
        // Process revenue sharing for this revenue
    }

    async handleUmbrellaReferralCreated(event) {
        console.log('🌂 Umbrella referral created:', event.data);
        // Add to umbrella network
        this.umbrellaNetwork.set(event.data.referredUserId, {
            referrerId: event.data.referrerId,
            shareRate: event.data.shareRate,
            createdAt: new Date()
        });
    }

    // Utility Methods
    getSubscriptionPlans() {
        return Array.from(this.subscriptionPlans.values());
    }

    getRevenueSharingRules() {
        return Array.from(this.revenueSharingRules.values());
    }

    getUserBillingInfo(userId) {
        return this.billingCycles.get(userId);
    }

    getStats() {
        return {
            totalPlans: this.subscriptionPlans.size,
            totalRevenueRules: this.revenueSharingRules.size,
            activeSubscriptions: Array.from(this.billingCycles.values()).filter(b => b.status === 'active').length,
            umbrellaReferrals: this.umbrellaNetwork.size,
            uptime: process.uptime()
        };
    }
}

// Create singleton instance
const billingService = new SmartStartBillingService();

module.exports = billingService;