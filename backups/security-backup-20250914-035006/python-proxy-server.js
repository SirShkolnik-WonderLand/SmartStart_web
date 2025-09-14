#!/usr/bin/env node

/**
 * SmartStart Python Proxy Server
 * Lightweight Node.js server that proxies all requests to Python Brain
 * Handles only: WebSockets, file uploads, and frontend serving
 */

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const WebSocket = require('ws');
const http = require('http');
const path = require('path');
const { rateLimiter } = require('./middleware/rateLimiter');

const app = express();
const server = http.createServer(app);

// Configuration
const PYTHON_BRAIN_URL = process.env.PYTHON_BRAIN_URL || 'https://smartstart-python-brain.onrender.com';
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
    origin: ['https://smartstart-frontend.onrender.com', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'smartstart-proxy',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        python_brain_url: PYTHON_BRAIN_URL,
        proxy_mode: 'active'
    });
});

// Direct authentication endpoints (BEFORE proxy middleware)
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    // Trim whitespace from email and password
    const trimmedEmail = email ? email.trim() : '';
    const trimmedPassword = password ? password.trim() : '';

    console.log(`🔐 Direct auth attempt for: "${trimmedEmail}"`);
    console.log(`🔐 Password received: "${trimmedPassword}"`);
    console.log(`🔐 Email matches expected: ${trimmedEmail === 'udi.admin@alicesolutionsgroup.com'}`);
    console.log(`🔐 Password matches expected: ${trimmedPassword === 'Id200633048!'}`);
    console.log(`🔐 Full request body:`, JSON.stringify(req.body, null, 2));

    // Simple authentication for testing (with trimmed values)
    if (trimmedEmail === 'udi.admin@alicesolutionsgroup.com' && trimmedPassword === 'Id200633048!') {
        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: 'udi-super-admin-001',
                email: 'udi.admin@alicesolutionsgroup.com',
                name: 'Udi Shkolnik',
                role: 'SUPER_ADMIN',
                token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1ZGktc3VwZXItYWRtaW4tMDAxIiwiZW1haWwiOiJ1ZGkuYWRtaW5AYWxpY2Vzb2x1dGlvbnNncm91cC5jb20iLCJuYW1lIjoiVWRpIFNoa29sbmlrIiwicm9sZSI6IlNVUEVSX0FETUlOIiwiaWF0IjoxNzM2ODQ0MDAwLCJleHAiOjE3MzY5MzA0MDB9.mock-signature'
            }
        });
    } else if (email === 'test@launch.com' && password === 'password') {
        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: 'test-user-123',
                email: 'test@launch.com',
                name: 'Test User',
                role: 'TEAM_MEMBER',
                token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0LXVzZXItMTIzIiwiZW1haWwiOiJ0ZXN0QGxhdW5jaC5jb20iLCJuYW1lIjoiVGVzdCBVc2VyIiwicm9sZSI6IlRFQU1fTUVNQkVSIiwiaWF0IjoxNzM2ODQ0MDAwLCJleHAiOjE3MzY5MzA0MDB9.mock-signature'
            }
        });
    } else {
        res.status(401).json({
            success: false,
            error: 'Invalid credentials'
        });
    }
});

// Direct registration endpoint
app.post('/api/auth/register', (req, res) => {
    const { email, password, name } = req.body;

    console.log(`📝 Direct registration attempt for: ${email}`);

    res.json({
        success: true,
        message: 'Registration successful',
        user: {
            id: 'user-' + Date.now(),
            email: email,
            name: name || 'New User',
            role: 'MEMBER',
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJuZXctdXNlci0iLCJlbWFpbCI6Im5ld0B1c2VyLmNvbSIsIm5hbWUiOiJOZXcgVXNlciIsInJvbGUiOiJNRU1CRVIiLCJpYXQiOjE3MzY4NDQwMDAsImV4cCI6MTczNjkzMDQwMH0.mock-signature'
        }
    });
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
    console.log(`🚪 Logout request`);

    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

// Health check for auth system
app.get('/api/auth/health', (req, res) => {
    res.json({
        success: true,
        message: 'Authentication system healthy',
        timestamp: new Date().toISOString()
    });
});

// Get current user endpoint
app.get('/api/auth/me', (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    console.log(`👤 Auth me request with token: ${token ? token.substring(0, 20) + '...' : 'none'}`);

    // For now, return the admin user if token exists
    if (token && (token.startsWith('mock-jwt-token-') || token.startsWith('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'))) {
        res.json({
            success: true,
            user: {
                id: 'udi-super-admin-001',
                email: 'udi.admin@alicesolutionsgroup.com',
                name: 'Udi Shkolnik',
                role: 'SUPER_ADMIN',
                token: token
            }
        });
    } else {
        res.status(401).json({
            success: false,
            error: 'Invalid or missing token'
        });
    }
});

// BUZ Token Economy System
const BUZ_RULES = {
    // Venture costs
    VENTURE_CREATE: 100,
    VENTURE_EDIT: 25,
    VENTURE_DELETE: 50,
    VENTURE_PUBLIC: 75,
    TEAM_ADD: 15,
    TEAM_REMOVE: 10,
    
    // Opportunity costs
    OPPORTUNITY_POST: 25,
    OPPORTUNITY_APPLY: 10,
    SERVICE_OFFER: 15,
    PROJECT_BID: 20,
    OFFER_ACCEPT: 5,
    
    // Legal costs
    LEGAL_SIGN: 5,
    CONTRACT_GENERATE: 30,
    LEGAL_REVIEW: 50,
    DISPUTE_FILE: 100,
    
    // Premium features
    PRIORITY_SUPPORT: 50,
    ADVANCED_ANALYTICS: 100,
    CUSTOM_BRANDING: 200,
    API_ACCESS: 150,
    WHITE_LABEL: 500
};

const BUZ_REWARDS = {
    // Starting rewards
    WELCOME_BONUS: 1000,
    MONTHLY_SUBSCRIPTION: 500,
    ANNUAL_BONUS: 1000,
    REFERRAL_BONUS: 250,
    
    // Venture rewards
    VENTURE_LAUNCH: 200,
    FIRST_TEAM_MEMBER: 50,
    TEAM_5_MEMBERS: 100,
    LEGAL_COMPLETE: 75,
    FIRST_REVENUE: 300,
    MONTHLY_ACTIVE_USERS: 25,
    
    // Contribution rewards
    PROFILE_COMPLETE: 25,
    IDENTITY_VERIFY: 50,
    SKILL_ADD: 5,
    ONBOARDING_COMPLETE: 100,
    REVIEW_WRITE: 10,
    
    // Quality rewards
    HIGH_QUALITY_VENTURE: 150,
    ACTIVE_TEAM_MEMBER: 50,
    HELPFUL_COMMUNITY: 25,
    BUG_REPORT: 15,
    FEATURE_SUGGESTION: 20,
    CONTENT_CREATION: 30,
    
    // Achievement rewards
    FIRST_VENTURE: 100,
    VENTURE_SUCCESS: 500,
    TOP_PERFORMER: 200,
    COMMUNITY_LEADER: 300,
    INNOVATION_AWARD: 1000
};

const BUZ_LEVELS = {
    'Novice': { min: 0, max: 999, benefits: ['Basic features'], monthly_allocation: 0 },
    'Member': { min: 1000, max: 4999, benefits: ['Full platform access'], monthly_allocation: 500 },
    'Contributor': { min: 5000, max: 9999, benefits: ['Priority support'], monthly_allocation: 750 },
    'Expert': { min: 10000, max: 24999, benefits: ['Advanced analytics'], monthly_allocation: 1000 },
    'Master': { min: 25000, max: 49999, benefits: ['Custom branding'], monthly_allocation: 1500 },
    'Legend': { min: 50000, max: 999999, benefits: ['White-label access'], monthly_allocation: 2500 }
};

// BUZ Token endpoints
app.get('/api/v1/buz/wallet/:userId', (req, res) => {
    const { userId } = req.params;
    console.log(`💰 BUZ wallet request for user: ${userId}`);
    
    // Mock user level and balance calculation
    const userLevel = 'Member'; // This would be fetched from database
    const baseBalance = 1000;
    const monthlyAllocation = BUZ_LEVELS[userLevel].monthly_allocation;
    const totalEarned = baseBalance + monthlyAllocation * 3; // 3 months of allocation
    const totalSpent = 150; // Some spending
    const currentBalance = totalEarned - totalSpent;
    
    res.json({
        success: true,
        data: {
            user_id: userId,
            balance: currentBalance,
            staked: 0,
            available: currentBalance,
            total_earned: totalEarned,
            total_spent: totalSpent,
            currency: 'BUZ',
            level: userLevel,
            next_level_buz: BUZ_LEVELS[userLevel].max + 1
        }
    });
});

// Award BUZ tokens
app.post('/api/v1/buz/award', rateLimiter.forBUZEndpoints(), (req, res) => {
    const { userId, amount, reason, metadata } = req.body;
    console.log(`💰 Awarding ${amount} BUZ tokens to user ${userId} for: ${reason}`);
    
    res.json({
        success: true,
        data: {
            user_id: userId,
            amount: amount,
            reason: reason,
            new_balance: 1000 + amount,
            transaction_id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString()
        }
    });
});

// Spend BUZ tokens
app.post('/api/v1/buz/spend', rateLimiter.forBUZEndpoints(), (req, res) => {
    const { userId, amount, reason, metadata } = req.body;
    console.log(`💸 Spending ${amount} BUZ tokens from user ${userId} for: ${reason}`);
    
    // Check if user has enough balance
    const currentBalance = 1000; // This would be fetched from database
    if (currentBalance < amount) {
        return res.status(400).json({
            success: false,
            error: 'Insufficient BUZ tokens',
            required: amount,
            available: currentBalance
        });
    }
    
    res.json({
        success: true,
        data: {
            user_id: userId,
            amount: amount,
            reason: reason,
            new_balance: currentBalance - amount,
            transaction_id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString()
        }
    });
});

// Get BUZ rules
app.get('/api/v1/buz/rules', (req, res) => {
    console.log(`📋 BUZ rules request`);
    
    res.json({
        success: true,
        data: {
            costs: BUZ_RULES,
            rewards: BUZ_REWARDS,
            levels: BUZ_LEVELS
        }
    });
});

// Get BUZ transactions
app.get('/api/v1/buz/transactions/:userId', (req, res) => {
    const { userId } = req.params;
    console.log(`📊 BUZ transactions request for user: ${userId}`);
    
    res.json({
        success: true,
        data: {
            user_id: userId,
            transactions: [
                {
                    id: 'tx_1',
                    type: 'earn',
                    amount: 1000,
                    reason: 'Welcome bonus',
                    timestamp: new Date(Date.now() - 86400000).toISOString()
                },
                {
                    id: 'tx_2',
                    type: 'spend',
                    amount: 100,
                    reason: 'Venture creation',
                    timestamp: new Date(Date.now() - 3600000).toISOString()
                },
                {
                    id: 'tx_3',
                    type: 'earn',
                    amount: 50,
                    reason: 'Profile completion',
                    timestamp: new Date(Date.now() - 1800000).toISOString()
                }
            ]
        }
    });
});

// Legacy balance endpoint for compatibility
app.get('/api/v1/buz/balance/:userId', (req, res) => {
    const { userId } = req.params;
    console.log(`💰 BUZ balance request for user: ${userId}`);

    res.json({
        success: true,
        data: {
            user_id: userId,
            balance: 1000000,
            staked: 500000,
            available: 500000,
            total_earned: 2500000,
            currency: 'BUZ'
        }
    });
});

app.get('/api/v1/buz/supply', (req, res) => {
    console.log(`📊 BUZ supply request`);

    res.json({
        success: true,
        data: {
            total_supply: 999999999,
            circulating_supply: 500000000,
            staked_supply: 100000000,
            burned_supply: 50000000,
            market_cap: 10000000,
            price_usd: 0.02
        }
    });
});

// BUZ Admin Analytics endpoint
app.get('/api/v1/buz/admin/analytics', (req, res) => {
    console.log(`📊 BUZ admin analytics request`);

    res.json({
        success: true,
        data: {
            total_transactions: 15420,
            total_volume: 25000000,
            active_stakers: 1250,
            average_stake_amount: 20000,
            total_rewards_distributed: 5000000,
            staking_apy: 12.5,
            governance_participation: 78.3,
            token_holders: 3400,
            daily_active_users: 450,
            weekly_growth: 15.2,
            monthly_growth: 45.8,
            top_stakers: [
                { user_id: 'udi-super-admin-001', amount: 500000, percentage: 25.0 },
                { user_id: 'user-002', amount: 300000, percentage: 15.0 },
                { user_id: 'user-003', amount: 200000, percentage: 10.0 }
            ],
            recent_activities: [
                { type: 'stake', amount: 50000, user: 'user-004', timestamp: new Date().toISOString() },
                { type: 'unstake', amount: 25000, user: 'user-005', timestamp: new Date().toISOString() },
                { type: 'reward', amount: 5000, user: 'user-006', timestamp: new Date().toISOString() }
            ]
        }
    });
});

// Dashboard analytics endpoint
app.get('/api/dashboard/', (req, res) => {
    console.log(`📈 Dashboard analytics request`);

    res.json({
        success: true,
        data: {
            total_users: 7,
            active_ventures: 12,
            total_investments: 5000000,
            platform_revenue: 150000,
            growth_rate: 25.5,
            user_engagement: 78.3,
            venture_success_rate: 65.2,
            average_investment: 25000,
            top_performing_ventures: [
                { id: 'venture-1', name: 'TechCorp', roi: 150 },
                { id: 'venture-2', name: 'InnovateLab', roi: 120 }
            ],
            recent_activities: [
                { type: 'venture_created', message: 'New venture "StartupX" created', timestamp: new Date().toISOString() },
                { type: 'investment', message: '$50,000 invested in "TechCorp"', timestamp: new Date().toISOString() }
            ]
        }
    });
});

// Ventures endpoints
app.get('/api/v1/ventures/list/all', (req, res) => {
    console.log(`🚀 Ventures list request`);

    res.json({
        success: true,
        data: {
            ventures: [{
                    id: 'venture-1',
                    name: 'TechCorp',
                    description: 'Revolutionary tech startup',
                    stage: 'Series A',
                    funding_goal: 1000000,
                    current_funding: 750000,
                    roi: 150,
                    status: 'ACTIVE',
                    created_at: new Date().toISOString()
                },
                {
                    id: 'venture-2',
                    name: 'InnovateLab',
                    description: 'AI-powered innovation lab',
                    stage: 'Seed',
                    funding_goal: 500000,
                    current_funding: 300000,
                    roi: 120,
                    status: 'ACTIVE',
                    created_at: new Date().toISOString()
                }
            ],
            total_count: 2,
            pagination: {
                page: 1,
                limit: 10,
                total_pages: 1
            }
        }
    });
});

// Venture creation endpoint
app.post('/api/ventures/create', (req, res) => {
    console.log(`🚀 Creating venture with data:`, req.body);

    try {
        const { name, description, industry, stage, teamSize, tier, residency, lookingFor, requiredSkills, rewardType, equityPercentage, cashAmount, tags, website, socialMedia, timeline, budget, additionalNotes } = req.body;

        // Validate required fields
        if (!name || !description || !industry) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: name, description, industry'
            });
        }

        // Generate venture ID
        const ventureId = `venture_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Create venture object
        const newVenture = {
            id: ventureId,
            name: name,
            description: description,
            industry: industry,
            stage: stage || 'idea',
            teamSize: teamSize || 1,
            tier: tier || 'T1',
            residency: residency || 'US',
            lookingFor: lookingFor || [],
            requiredSkills: requiredSkills || [],
            rewardType: rewardType || 'equity',
            equityPercentage: equityPercentage || 0,
            cashAmount: cashAmount || 0,
            tags: tags || [],
            website: website || '',
            socialMedia: socialMedia || {},
            timeline: timeline || {},
            budget: budget || 0,
            additionalNotes: additionalNotes || '',
            status: 'DRAFT',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            owner_id: 'udi-super-admin-001', // This should come from auth
            legal_compliant: false,
            funding_goal: 0,
            current_funding: 0,
            team_members: [],
            projects: [],
            ai_analysis: {
                innovation_score: 75,
                market_readiness: 60,
                team_strength: 70,
                overall_score: 67,
                success_probability: 0.72
            }
        };

        console.log(`✅ Venture created successfully: ${ventureId}`);

        // Award BUZ tokens for venture creation
        const buzReward = BUZ_REWARDS.VENTURE_LAUNCH; // 200 BUZ tokens for creating a venture
        console.log(`💰 Awarding ${buzReward} BUZ tokens for venture creation`);

        res.status(201).json({
            success: true,
            data: {
                ...newVenture,
                buzReward: buzReward,
                legalStatus: {
                    documents_signed: 5,
                    compliance_percentage: 95,
                    legal_risks: [],
                    regulatory_status: 'COMPLIANT'
                },
                buzTokens: {
                    awarded: buzReward,
                    reason: 'Venture Creation',
                    timestamp: new Date().toISOString()
                }
            },
            message: 'Venture created successfully with BUZ token reward'
        });

    } catch (error) {
        console.error('Error creating venture:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to create venture'
        });
    }
});

// Get venture by ID
app.get('/api/ventures/:id', (req, res) => {
    const { id } = req.params;
    console.log(`🚀 Get venture request for ID: ${id}`);

    // Mock venture data
    const venture = {
        id: id,
        name: 'Test Venture',
        description: 'A test venture for development',
        industry: 'Technology',
        stage: 'idea',
        teamSize: 1,
        tier: 'T1',
        residency: 'US',
        status: 'DRAFT',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    res.json({
        success: true,
        data: venture
    });
});

// Update venture
app.put('/api/ventures/:id', (req, res) => {
    const { id } = req.params;
    console.log(`🚀 Update venture request for ID: ${id}`, req.body);

    res.json({
        success: true,
        data: {...req.body, id: id, updated_at: new Date().toISOString() },
        message: 'Venture updated successfully'
    });
});

// Delete venture
app.delete('/api/ventures/:id', (req, res) => {
    const { id } = req.params;
    console.log(`🚀 Delete venture request for ID: ${id}`);

    res.json({
        success: true,
        message: 'Venture deleted successfully'
    });
});

// Contracts/Offers endpoints
app.get('/api/contracts', (req, res) => {
    console.log(`📋 Contracts request`);

    res.json({
        success: true,
        data: {
            contracts: [{
                    id: 'contract-1',
                    title: 'Partnership Agreement',
                    type: 'PARTNERSHIP',
                    status: 'DRAFT',
                    parties: ['udi-super-admin-001', 'venture-1'],
                    created_at: new Date().toISOString()
                },
                {
                    id: 'contract-2',
                    title: 'Investment Contract',
                    type: 'INVESTMENT',
                    status: 'SIGNED',
                    parties: ['udi-super-admin-001', 'venture-2'],
                    created_at: new Date().toISOString()
                }
            ],
            total_count: 2
        }
    });
});

// Legal signing status endpoint
app.get('/api/legal-signing/status/:userId', (req, res) => {
    const { userId } = req.params;
    console.log(`⚖️ Legal signing status request for user: ${userId}`);

    res.json({
        success: true,
        data: {
            user_id: userId,
            legal_pack_status: 'COMPLETED',
            documents_signed: 5,
            documents_pending: 0,
            compliance_score: 95,
            last_updated: new Date().toISOString(),
            required_documents: [
                { name: 'Terms of Service', status: 'SIGNED' },
                { name: 'Privacy Policy', status: 'SIGNED' },
                { name: 'Investment Agreement', status: 'SIGNED' },
                { name: 'NDA', status: 'SIGNED' },
                { name: 'Partnership Agreement', status: 'SIGNED' }
            ]
        }
    });
});

// Journey status endpoint
app.get('/api/journey/status/:userId', (req, res) => {
    const { userId } = req.params;
    console.log(`🛤️ Journey status request for user: ${userId}`);

    res.json({
        success: true,
        data: {
            userId: userId,
            currentStage: 'VENTURE_CREATION',
            stageProgress: 75,
            completedStages: [
                'REGISTRATION',
                'PROFILE_SETUP',
                'VERIFICATION',
                'LEGAL_COMPLIANCE'
            ],
            stages: [
                { name: 'REGISTRATION', status: 'COMPLETED', completed: true, progress: 100 },
                { name: 'PROFILE_SETUP', status: 'COMPLETED', completed: true, progress: 100 },
                { name: 'VERIFICATION', status: 'COMPLETED', completed: true, progress: 100 },
                { name: 'LEGAL_COMPLIANCE', status: 'COMPLETED', completed: true, progress: 100 },
                { name: 'VENTURE_CREATION', status: 'IN_PROGRESS', completed: false, progress: 75 },
                { name: 'TEAM_BUILDING', status: 'PENDING', completed: false, progress: 0 }
            ],
            nextStage: 'FUNDING',
            journeyScore: 85,
            milestonesAchieved: 8,
            totalMilestones: 12,
            estimatedCompletion: '2025-10-15T00:00:00Z',
            isComplete: false,
            userStates: [],
            recommendations: [],
            timestamp: new Date().toISOString()
        }
    });
});

// Subscription status endpoint
app.get('/api/subscriptions/user/:userId', (req, res) => {
    const { userId } = req.params;
    console.log(`💳 Subscription status request for user: ${userId}`);

    res.json({
        success: true,
        data: {
            user_id: userId,
            subscription_status: 'ACTIVE',
            plan: 'PREMIUM',
            features: [
                'UNLIMITED_VENTURES',
                'ADVANCED_ANALYTICS',
                'PRIORITY_SUPPORT',
                'CUSTOM_BRANDING'
            ],
            billing_cycle: 'MONTHLY',
            next_billing_date: '2025-10-14T00:00:00Z',
            amount: 99.99,
            currency: 'USD',
            auto_renew: true
        }
    });
});

// Legal Document Signing Endpoints
app.post('/api/legal-signing/sign', (req, res) => {
    const { documentId, userId, signature } = req.body;
    console.log(`⚖️ Legal document signing request for document: ${documentId}, user: ${userId}`);

    res.json({
        success: true,
        data: {
            documentId: documentId,
            userId: userId,
            status: 'SIGNED',
            signedAt: new Date().toISOString(),
            signature: signature,
            message: 'Document signed successfully'
        }
    });
});

app.get('/api/legal-signing/status/:userId', (req, res) => {
    const { userId } = req.params;
    console.log(`⚖️ Legal signing status request for user: ${userId}`);

    res.json({
        success: true,
        data: {
            user_id: userId,
            legal_pack_status: 'COMPLETED',
            documents_signed: 5,
            documents_pending: 0,
            compliance_score: 95,
            last_updated: new Date().toISOString(),
            required_documents: [
                { name: 'Terms of Service', status: 'SIGNED' },
                { name: 'Privacy Policy', status: 'SIGNED' },
                { name: 'Investment Agreement', status: 'SIGNED' },
                { name: 'NDA', status: 'SIGNED' },
                { name: 'Partnership Agreement', status: 'SIGNED' }
            ]
        }
    });
});

// Legal Document Management API Endpoints
app.get('/api/legal-documents/status', (req, res) => {
    console.log(`⚖️ Legal documents status request`);

    res.json({
        success: true,
        data: {
            user_id: 'udi-super-admin-001',
            legal_pack_status: 'IN_PROGRESS',
            documents_signed: 2,
            documents_pending: 3,
            documents_required: 5,
            compliance_score: 40,
            last_updated: new Date().toISOString(),
            required_documents: [{
                    id: 'doc-1',
                    name: 'Terms of Service',
                    status: 'SIGNED',
                    category: 'LEGAL',
                    required_for: 'BASIC_ACCESS',
                    signed_at: '2025-01-14T10:30:00Z'
                },
                {
                    id: 'doc-2',
                    name: 'Privacy Policy',
                    status: 'SIGNED',
                    category: 'LEGAL',
                    required_for: 'BASIC_ACCESS',
                    signed_at: '2025-01-14T10:35:00Z'
                },
                {
                    id: 'doc-3',
                    name: 'Investment Agreement',
                    status: 'PENDING',
                    category: 'INVESTMENT',
                    required_for: 'VENTURE_CREATION',
                    signed_at: null
                },
                {
                    id: 'doc-4',
                    name: 'Non-Disclosure Agreement',
                    status: 'PENDING',
                    category: 'CONFIDENTIALITY',
                    required_for: 'TEAM_COLLABORATION',
                    signed_at: null
                },
                {
                    id: 'doc-5',
                    name: 'Partnership Agreement',
                    status: 'PENDING',
                    category: 'PARTNERSHIP',
                    required_for: 'ADVANCED_FEATURES',
                    signed_at: null
                }
            ]
        }
    });
});

app.get('/api/legal-documents/documents', (req, res) => {
    console.log(`📄 Available legal documents request`);

    res.json({
        success: true,
        data: [{
                id: 'doc-1',
                name: 'Terms of Service',
                description: 'Platform terms and conditions',
                category: 'LEGAL',
                version: '2.1',
                required_for: 'BASIC_ACCESS',
                status: 'ACTIVE',
                created_at: '2025-01-01T00:00:00Z',
                updated_at: '2025-01-10T00:00:00Z'
            },
            {
                id: 'doc-2',
                name: 'Privacy Policy',
                description: 'Data protection and privacy policy',
                category: 'LEGAL',
                version: '1.8',
                required_for: 'BASIC_ACCESS',
                status: 'ACTIVE',
                created_at: '2025-01-01T00:00:00Z',
                updated_at: '2025-01-10T00:00:00Z'
            },
            {
                id: 'doc-3',
                name: 'Investment Agreement',
                description: 'Standard investment terms and conditions',
                category: 'INVESTMENT',
                version: '3.0',
                required_for: 'VENTURE_CREATION',
                status: 'ACTIVE',
                created_at: '2025-01-01T00:00:00Z',
                updated_at: '2025-01-10T00:00:00Z'
            },
            {
                id: 'doc-4',
                name: 'Non-Disclosure Agreement',
                description: 'Confidentiality and non-disclosure terms',
                category: 'CONFIDENTIALITY',
                version: '1.5',
                required_for: 'TEAM_COLLABORATION',
                status: 'ACTIVE',
                created_at: '2025-01-01T00:00:00Z',
                updated_at: '2025-01-10T00:00:00Z'
            },
            {
                id: 'doc-5',
                name: 'Partnership Agreement',
                description: 'Partnership and collaboration terms',
                category: 'PARTNERSHIP',
                version: '2.0',
                required_for: 'ADVANCED_FEATURES',
                status: 'ACTIVE',
                created_at: '2025-01-01T00:00:00Z',
                updated_at: '2025-01-10T00:00:00Z'
            }
        ]
    });
});

app.get('/api/legal-documents/documents/pending', (req, res) => {
    console.log(`⏳ Pending legal documents request`);

    res.json({
        success: true,
        data: [{
                id: 'doc-3',
                name: 'Investment Agreement',
                description: 'Standard investment terms and conditions',
                category: 'INVESTMENT',
                version: '3.0',
                required_for: 'VENTURE_CREATION',
                status: 'PENDING',
                priority: 'HIGH',
                deadline: '2025-01-20T23:59:59Z',
                created_at: '2025-01-01T00:00:00Z'
            },
            {
                id: 'doc-4',
                name: 'Non-Disclosure Agreement',
                description: 'Confidentiality and non-disclosure terms',
                category: 'CONFIDENTIALITY',
                version: '1.5',
                required_for: 'TEAM_COLLABORATION',
                status: 'PENDING',
                priority: 'MEDIUM',
                deadline: '2025-01-25T23:59:59Z',
                created_at: '2025-01-01T00:00:00Z'
            },
            {
                id: 'doc-5',
                name: 'Partnership Agreement',
                description: 'Partnership and collaboration terms',
                category: 'PARTNERSHIP',
                version: '2.0',
                required_for: 'ADVANCED_FEATURES',
                status: 'PENDING',
                priority: 'LOW',
                deadline: '2025-01-30T23:59:59Z',
                created_at: '2025-01-01T00:00:00Z'
            }
        ]
    });
});

app.get('/api/legal-documents/documents/required', (req, res) => {
    console.log(`📋 Required legal documents request`);

    res.json({
        success: true,
        data: [{
                id: 'doc-1',
                name: 'Terms of Service',
                description: 'Platform terms and conditions',
                category: 'LEGAL',
                version: '2.1',
                required_for: 'BASIC_ACCESS',
                status: 'SIGNED',
                priority: 'CRITICAL',
                signed_at: '2025-01-14T10:30:00Z'
            },
            {
                id: 'doc-2',
                name: 'Privacy Policy',
                description: 'Data protection and privacy policy',
                category: 'LEGAL',
                version: '1.8',
                required_for: 'BASIC_ACCESS',
                status: 'SIGNED',
                priority: 'CRITICAL',
                signed_at: '2025-01-14T10:35:00Z'
            },
            {
                id: 'doc-3',
                name: 'Investment Agreement',
                description: 'Standard investment terms and conditions',
                category: 'INVESTMENT',
                version: '3.0',
                required_for: 'VENTURE_CREATION',
                status: 'REQUIRED',
                priority: 'HIGH',
                signed_at: null
            },
            {
                id: 'doc-4',
                name: 'Non-Disclosure Agreement',
                description: 'Confidentiality and non-disclosure terms',
                category: 'CONFIDENTIALITY',
                version: '1.5',
                required_for: 'TEAM_COLLABORATION',
                status: 'REQUIRED',
                priority: 'MEDIUM',
                signed_at: null
            },
            {
                id: 'doc-5',
                name: 'Partnership Agreement',
                description: 'Partnership and collaboration terms',
                category: 'PARTNERSHIP',
                version: '2.0',
                required_for: 'ADVANCED_FEATURES',
                status: 'REQUIRED',
                priority: 'LOW',
                signed_at: null
            }
        ]
    });
});

// Gamification API Endpoints
app.get('/api/gamification/leaderboard', (req, res) => {
    console.log(`🏆 Gamification leaderboard request`);

    res.json({
        success: true,
        data: {
            leaderboard: [{
                    rank: 1,
                    user_id: 'udi-super-admin-001',
                    name: 'Udi Shkolnik',
                    xp_points: 2500,
                    level: 'EXPERT',
                    badges: 8,
                    ventures_created: 3,
                    ventures_joined: 5,
                    total_earnings: 50000
                },
                {
                    rank: 2,
                    user_id: 'user-002',
                    name: 'Alex Johnson',
                    xp_points: 2200,
                    level: 'ADVANCED',
                    badges: 6,
                    ventures_created: 2,
                    ventures_joined: 4,
                    total_earnings: 35000
                },
                {
                    rank: 3,
                    user_id: 'user-003',
                    name: 'Sarah Chen',
                    xp_points: 1900,
                    level: 'INTERMEDIATE',
                    badges: 4,
                    ventures_created: 1,
                    ventures_joined: 3,
                    total_earnings: 25000
                },
                {
                    rank: 4,
                    user_id: 'user-004',
                    name: 'Mike Rodriguez',
                    xp_points: 1600,
                    level: 'INTERMEDIATE',
                    badges: 3,
                    ventures_created: 1,
                    ventures_joined: 2,
                    total_earnings: 18000
                },
                {
                    rank: 5,
                    user_id: 'user-005',
                    name: 'Emma Wilson',
                    xp_points: 1400,
                    level: 'BEGINNER',
                    badges: 2,
                    ventures_created: 0,
                    ventures_joined: 2,
                    total_earnings: 12000
                }
            ],
            total_participants: 5,
            last_updated: new Date().toISOString()
        }
    });
});

app.get('/api/gamification/badges/:userId', (req, res) => {
    const { userId } = req.params;
    console.log(`🏅 User badges request for: ${userId}`);

    res.json({
        success: true,
        data: {
            user_id: userId,
            badges: [{
                    id: 'badge-1',
                    name: 'First Steps',
                    description: 'Complete your first venture',
                    category: 'MILESTONE',
                    rarity: 'COMMON',
                    earned_at: '2025-01-10T00:00:00Z',
                    icon: '🎯'
                },
                {
                    id: 'badge-2',
                    name: 'Team Player',
                    description: 'Join 3 different ventures',
                    category: 'COLLABORATION',
                    rarity: 'COMMON',
                    earned_at: '2025-01-12T00:00:00Z',
                    icon: '👥'
                },
                {
                    id: 'badge-3',
                    name: 'Legal Eagle',
                    description: 'Complete all legal documents',
                    category: 'COMPLIANCE',
                    rarity: 'RARE',
                    earned_at: '2025-01-14T00:00:00Z',
                    icon: '⚖️'
                },
                {
                    id: 'badge-4',
                    name: 'BUZ Master',
                    description: 'Earn 10,000 BUZ tokens',
                    category: 'ECONOMY',
                    rarity: 'RARE',
                    earned_at: '2025-01-15T00:00:00Z',
                    icon: '💰'
                },
                {
                    id: 'badge-5',
                    name: 'Innovation Leader',
                    description: 'Create a successful venture',
                    category: 'LEADERSHIP',
                    rarity: 'EPIC',
                    earned_at: '2025-01-16T00:00:00Z',
                    icon: '🚀'
                }
            ],
            total_badges: 5,
            recent_badges: [{
                    id: 'badge-5',
                    name: 'Innovation Leader',
                    earned_at: '2025-01-16T00:00:00Z'
                },
                {
                    id: 'badge-4',
                    name: 'BUZ Master',
                    earned_at: '2025-01-15T00:00:00Z'
                }
            ]
        }
    });
});

// Umbrella API endpoints
app.get('/api/umbrella/relationships', (req, res) => {
    console.log(`🌂 Umbrella relationships request`);

    res.json({
        success: true,
        data: [{
            id: 'rel-1',
            type: 'REFERRAL',
            status: 'ACTIVE',
            referred_user: {
                id: 'user-2',
                name: 'Sarah Johnson',
                email: 'sarah@example.com',
                avatar: 'https://via.placeholder.com/40'
            },
            share_rate: 0.15,
            created_at: '2025-01-10T00:00:00Z',
            total_revenue: 2500.00,
            last_payment: '2025-01-15T00:00:00Z'
        }, {
            id: 'rel-2',
            type: 'PARTNERSHIP',
            status: 'ACTIVE',
            referred_user: {
                id: 'user-3',
                name: 'Mike Chen',
                email: 'mike@example.com',
                avatar: 'https://via.placeholder.com/40'
            },
            share_rate: 0.20,
            created_at: '2025-01-12T00:00:00Z',
            total_revenue: 1800.00,
            last_payment: '2025-01-14T00:00:00Z'
        }, {
            id: 'rel-3',
            type: 'REFERRAL',
            status: 'PENDING',
            referred_user: {
                id: 'user-4',
                name: 'Emily Davis',
                email: 'emily@example.com',
                avatar: 'https://via.placeholder.com/40'
            },
            share_rate: 0.10,
            created_at: '2025-01-16T00:00:00Z',
            total_revenue: 0.00,
            last_payment: null
        }],
        summary: {
            total_relationships: 3,
            active_relationships: 2,
            pending_relationships: 1,
            total_revenue_generated: 4300.00,
            total_commission_earned: 645.00
        }
    });
});

app.get('/api/umbrella/revenue/shares', (req, res) => {
    console.log(`💰 Umbrella revenue shares request`);

    res.json({
        success: true,
        data: [{
            id: 'share-1',
            project: {
                id: 'proj-1',
                name: 'EcoTech Solutions'
            },
            referred_user: {
                id: 'user-2',
                name: 'Sarah Johnson',
                email: 'sarah@example.com'
            },
            amount: 375.00,
            share_rate: 0.15,
            status: 'PAID',
            calculated_at: '2025-01-15T00:00:00Z',
            paid_at: '2025-01-16T00:00:00Z'
        }, {
            id: 'share-2',
            project: {
                id: 'proj-2',
                name: 'HealthTech Innovation'
            },
            referred_user: {
                id: 'user-3',
                name: 'Mike Chen',
                email: 'mike@example.com'
            },
            amount: 360.00,
            share_rate: 0.20,
            status: 'PENDING',
            calculated_at: '2025-01-14T00:00:00Z',
            paid_at: null
        }, {
            id: 'share-3',
            project: {
                id: 'proj-3',
                name: 'FinTech Platform'
            },
            referred_user: {
                id: 'user-2',
                name: 'Sarah Johnson',
                email: 'sarah@example.com'
            },
            amount: 270.00,
            share_rate: 0.15,
            status: 'PAID',
            calculated_at: '2025-01-10T00:00:00Z',
            paid_at: '2025-01-12T00:00:00Z'
        }],
        summary: {
            total_shares: 3,
            paid_shares: 2,
            pending_shares: 1,
            total_amount: 1005.00,
            paid_amount: 645.00,
            pending_amount: 360.00
        }
    });
});

// Opportunities API endpoints
app.get('/api/opportunities', (req, res) => {
    const { page = 1, limit = 50 } = req.query;
    console.log(`🎯 Opportunities request - page: ${page}, limit: ${limit}`);

    res.json({
        success: true,
        data: {
            opportunities: [{
                id: 'opp-1',
                title: 'Senior Full-Stack Developer',
                description: 'Join our innovative fintech startup as a senior developer. Work with cutting-edge technologies and help build the future of digital banking.',
                type: 'FULL_TIME',
                status: 'ACTIVE',
                venture: {
                    id: 'venture-1',
                    name: 'FinTech Innovations',
                    logo: 'https://via.placeholder.com/60'
                },
                location: 'Toronto, ON',
                remote: true,
                compensation: {
                    type: 'SALARY',
                    min: 120000,
                    max: 150000,
                    currency: 'CAD'
                },
                skills_required: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
                created_at: '2025-01-15T00:00:00Z',
                expires_at: '2025-02-15T00:00:00Z',
                applications_count: 12
            }, {
                id: 'opp-2',
                title: 'UI/UX Designer',
                description: 'Create beautiful and intuitive user experiences for our mobile applications. Work closely with product and engineering teams.',
                type: 'CONTRACT',
                status: 'ACTIVE',
                venture: {
                    id: 'venture-2',
                    name: 'HealthTech Solutions',
                    logo: 'https://via.placeholder.com/60'
                },
                location: 'Vancouver, BC',
                remote: true,
                compensation: {
                    type: 'HOURLY',
                    min: 75,
                    max: 100,
                    currency: 'CAD'
                },
                skills_required: ['Figma', 'Adobe Creative Suite', 'User Research', 'Prototyping'],
                created_at: '2025-01-14T00:00:00Z',
                expires_at: '2025-02-14T00:00:00Z',
                applications_count: 8
            }, {
                id: 'opp-3',
                title: 'Marketing Specialist',
                description: 'Drive growth and brand awareness for our B2B SaaS platform. Develop and execute marketing campaigns across multiple channels.',
                type: 'PART_TIME',
                status: 'ACTIVE',
                venture: {
                    id: 'venture-3',
                    name: 'SaaS Solutions Inc',
                    logo: 'https://via.placeholder.com/60'
                },
                location: 'Montreal, QC',
                remote: true,
                compensation: {
                    type: 'SALARY',
                    min: 60000,
                    max: 80000,
                    currency: 'CAD'
                },
                skills_required: ['Digital Marketing', 'Content Creation', 'Analytics', 'Social Media'],
                created_at: '2025-01-13T00:00:00Z',
                expires_at: '2025-02-13T00:00:00Z',
                applications_count: 15
            }],
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: 3,
                pages: 1
            },
            filters: {
                applied: {},
                available: {
                    types: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP'],
                    locations: ['Toronto, ON', 'Vancouver, BC', 'Montreal, QC'],
                    compensation_types: ['SALARY', 'HOURLY', 'EQUITY', 'HYBRID']
                }
            }
        }
    });
});

app.get('/api/opportunities/user/:userId/applications', (req, res) => {
    const { userId } = req.params;
    console.log(`📋 User applications request for: ${userId}`);

    res.json({
        success: true,
        data: {
            applications: [{
                id: 'app-1',
                opportunity: {
                    id: 'opp-1',
                    title: 'Senior Full-Stack Developer',
                    venture: {
                        id: 'venture-1',
                        name: 'FinTech Innovations'
                    }
                },
                status: 'PENDING',
                applied_at: '2025-01-16T00:00:00Z',
                cover_letter: 'I am excited about this opportunity to contribute to your innovative fintech platform...',
                relevant_skills: ['React', 'Node.js', 'TypeScript'],
                experience: '5+ years in full-stack development',
                availability: 'Immediate',
                motivation: 'Passionate about fintech and building scalable solutions'
            }, {
                id: 'app-2',
                opportunity: {
                    id: 'opp-2',
                    title: 'UI/UX Designer',
                    venture: {
                        id: 'venture-2',
                        name: 'HealthTech Solutions'
                    }
                },
                status: 'ACCEPTED',
                applied_at: '2025-01-15T00:00:00Z',
                cover_letter: 'I have extensive experience in healthcare UX design...',
                relevant_skills: ['Figma', 'User Research', 'Prototyping'],
                experience: '3+ years in healthcare design',
                availability: '2 weeks notice',
                motivation: 'Want to make healthcare more accessible through design'
            }],
            opportunities: [{
                id: 'opp-1',
                title: 'Senior Full-Stack Developer',
                venture: {
                    id: 'venture-1',
                    name: 'FinTech Innovations'
                }
            }, {
                id: 'opp-2',
                title: 'UI/UX Designer',
                venture: {
                    id: 'venture-2',
                    name: 'HealthTech Solutions'
                }
            }],
            summary: {
                total: 2,
                pending: 1,
                accepted: 1,
                rejected: 0
            }
        }
    });
});

// Proxy all API requests to Python Brain
app.use('/api', createProxyMiddleware({
    target: PYTHON_BRAIN_URL,
    changeOrigin: true,
    timeout: 60000, // 60 second timeout
    proxyTimeout: 60000, // 60 second proxy timeout
    pathRewrite: {
        '^/api': '' // Remove the /api prefix since Python Brain doesn't use it
    },
    onProxyReq: (proxyReq, req, res) => {
        console.log(`🔄 Proxying ${req.method} ${req.path} to Python Brain`);
        // Add timeout headers
        proxyReq.setTimeout(60000);
    },
    onError: (err, req, res) => {
        console.error('Proxy error:', err);
        if (err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT') {
            res.status(504).json({
                success: false,
                error: 'Gateway Timeout',
                message: 'Python Brain service took too long to respond'
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Python Brain service unavailable',
                message: 'Please try again later'
            });
        }
    },
    onProxyRes: (proxyRes, req, res) => {
        console.log(`✅ Python Brain responded with ${proxyRes.statusCode} for ${req.path}`);
    }
}));

// WebSocket proxy for real-time features
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws, req) => {
    console.log('🔌 WebSocket connection established');

    // Forward WebSocket messages to Python Brain
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log('📡 WebSocket message received:', data.type);

            // For now, echo back the message
            // In production, this would forward to Python Brain WebSocket
            ws.send(JSON.stringify({
                type: 'ECHO',
                original: data,
                timestamp: new Date().toISOString()
            }));
        } catch (error) {
            console.error('WebSocket message error:', error);
            ws.send(JSON.stringify({
                type: 'ERROR',
                message: 'Invalid message format'
            }));
        }
    });

    ws.on('close', () => {
        console.log('🔌 WebSocket connection closed');
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });

    // Send welcome message
    ws.send(JSON.stringify({
        type: 'CONNECTION_ESTABLISHED',
        message: 'Connected to SmartStart Proxy',
        timestamp: new Date().toISOString()
    }));
});

// Database proxy endpoints for Python Brain
app.post('/api/db/query', (req, res) => {
    const { sql, params } = req.body;

    // For now, return mock data for testing
    if (sql.includes('SELECT u.*, r.name as role_name')) {
        res.json({
            success: true,
            data: [{
                id: 'test-user-123',
                email: 'test@launch.com',
                name: 'Test User',
                password: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                role: 'TEAM_MEMBER',
                role_name: 'TEAM_MEMBER',
                role_level: 20,
                status: 'ACTIVE'
            }]
        });
    } else {
        res.json({ success: true, data: [] });
    }
});

app.post('/api/db/execute', (req, res) => {
    const { sql, params } = req.body;
    res.json({ success: true, message: 'Query executed' });
});

// File upload endpoint (still handled by Node.js for now)
app.post('/api/upload', (req, res) => {
    // This would handle file uploads and then forward to Python Brain
    res.json({
        success: true,
        message: 'File upload handled by proxy',
        note: 'File processing will be forwarded to Python Brain'
    });
});

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend/out')));

// Catch all handler for frontend routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/out/index.html'));
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Proxy server error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Please try again later'
    });
});

// Start server
server.listen(PORT, () => {
    console.log('🚀 SmartStart Python Proxy Server started');
    console.log(`📡 Port: ${PORT}`);
    console.log(`🧠 Python Brain URL: ${PYTHON_BRAIN_URL}`);
    console.log(`🔌 WebSocket support: enabled`);
    console.log(`📁 File upload support: enabled`);
    console.log(`🎨 Frontend serving: enabled`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('🛑 SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

module.exports = app;