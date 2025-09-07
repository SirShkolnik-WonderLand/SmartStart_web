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
            service: 'billing-api',
            timestamp: new Date().toISOString(),
            database: 'connected'
        });
    } catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            service: 'billing-api',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Get all billing plans
router.get('/plans', async(req, res) => {
    try {
        const plans = await prisma.billingPlan.findMany({
            orderBy: {
                price: 'asc'
            }
        });

        res.json({
            success: true,
            data: plans
        });
    } catch (error) {
        console.error('Failed to fetch billing plans:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch billing plans',
            error: error.message
        });
    }
});

// Get user's invoices
router.get('/invoices/user/:userId', async(req, res) => {
    try {
        const { userId } = req.params;
        const { status, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = { userId };
        if (status) {
            where.status = status;
        }

        const [invoices, total] = await Promise.all([
            prisma.invoice.findMany({
                where,
                include: {
                    subscription: {
                        include: {
                            plan: true
                        }
                    },
                    payments: {
                        orderBy: { createdAt: 'desc' }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(limit)
            }),
            prisma.invoice.count({ where })
        ]);

        res.json({
            success: true,
            data: invoices,
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
            error: 'Failed to fetch user invoices',
            details: error.message
        });
    }
});

// Get invoice details
router.get('/invoices/:invoiceId', async(req, res) => {
    try {
        const { invoiceId } = req.params;

        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true
                    }
                },
                subscription: {
                    include: {
                        plan: true
                    }
                },
                payments: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!invoice) {
            return res.status(404).json({
                success: false,
                error: 'Invoice not found'
            });
        }

        res.json({
            success: true,
            data: invoice
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch invoice',
            details: error.message
        });
    }
});

// Create a new invoice
router.post('/invoices', async(req, res) => {
    try {
        const { userId, subscriptionId, amount, currency = 'USD', dueDate } = req.body;

        if (!userId || !amount) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: userId, amount'
            });
        }

        const invoice = await prisma.invoice.create({
            data: {
                userId,
                subscriptionId,
                amount: parseFloat(amount),
                currency,
                dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            },
            include: {
                subscription: {
                    include: {
                        plan: true
                    }
                }
            }
        });

        res.status(201).json({
            success: true,
            data: invoice,
            message: 'Invoice created successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to create invoice',
            details: error.message
        });
    }
});

// Process a payment
router.post('/payments', async(req, res) => {
    try {
        const { userId, invoiceId, amount, method, transactionId, metadata } = req.body;

        if (!userId || !invoiceId || !amount || !method) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: userId, invoiceId, amount, method'
            });
        }

        // Get the invoice
        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId }
        });

        if (!invoice) {
            return res.status(404).json({
                success: false,
                error: 'Invoice not found'
            });
        }

        if (invoice.userId !== userId) {
            return res.status(403).json({
                success: false,
                error: 'Unauthorized to pay this invoice'
            });
        }

        // Create the payment
        const payment = await prisma.payment.create({
            data: {
                userId,
                invoiceId,
                amount: parseFloat(amount),
                currency: invoice.currency,
                method,
                transactionId,
                metadata: metadata ? JSON.parse(metadata) : null,
                status: 'COMPLETED'
            }
        });

        // Update invoice status
        await prisma.invoice.update({
            where: { id: invoiceId },
            data: {
                status: 'PAID',
                paidDate: new Date()
            }
        });

        res.status(201).json({
            success: true,
            data: payment,
            message: 'Payment processed successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to process payment',
            details: error.message
        });
    }
});

// Get user's payments
router.get('/payments/user/:userId', async(req, res) => {
    try {
        const { userId } = req.params;
        const { status, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = { userId };
        if (status) {
            where.status = status;
        }

        const [payments, total] = await Promise.all([
            prisma.payment.findMany({
                where,
                include: {
                    invoice: {
                        include: {
                            subscription: {
                                include: {
                                    plan: true
                                }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(limit)
            }),
            prisma.payment.count({ where })
        ]);

        res.json({
            success: true,
            data: payments,
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
            error: 'Failed to fetch user payments',
            details: error.message
        });
    }
});

// Get payment details
router.get('/payments/:paymentId', async(req, res) => {
    try {
        const { paymentId } = req.params;

        const payment = await prisma.payment.findUnique({
            where: { id: paymentId },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true
                    }
                },
                invoice: {
                    include: {
                        subscription: {
                            include: {
                                plan: true
                            }
                        }
                    }
                }
            }
        });

        if (!payment) {
            return res.status(404).json({
                success: false,
                error: 'Payment not found'
            });
        }

        res.json({
            success: true,
            data: payment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch payment',
            details: error.message
        });
    }
});

// Get all invoices (admin)
router.get('/invoices', async(req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = status ? { status } : {};

        const [invoices, total] = await Promise.all([
            prisma.invoice.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            name: true
                        }
                    },
                    subscription: {
                        include: {
                            plan: true
                        }
                    },
                    payments: {
                        orderBy: { createdAt: 'desc' }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(limit)
            }),
            prisma.invoice.count({ where })
        ]);

        res.json({
            success: true,
            data: invoices,
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
            error: 'Failed to fetch invoices',
            details: error.message
        });
    }
});

// Get all payments (admin)
router.get('/payments', async(req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = status ? { status } : {};

        const [payments, total] = await Promise.all([
            prisma.payment.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            name: true
                        }
                    },
                    invoice: {
                        include: {
                            subscription: {
                                include: {
                                    plan: true
                                }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(limit)
            }),
            prisma.payment.count({ where })
        ]);

        res.json({
            success: true,
            data: payments,
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
            error: 'Failed to fetch payments',
            details: error.message
        });
    }
});

module.exports = router;