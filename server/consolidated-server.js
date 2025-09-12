const express = require('express');
const cors = require('cors');
const { setupSecurity } = require('./middleware/security');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const app = express();

// Setup security middleware first - CLI System Ready
setupSecurity(app);

// CORS configuration
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? ['https://smartstart-frontend.onrender.com', 'https://smartstart-platform.onrender.com'] : ['http://localhost:3000'],
    credentials: true
}));

// Basic middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        cli: 'enabled',
        version: '2.0.1'
    });
});

// Route listing endpoint for debugging
app.get('/api/routes', (req, res) => {
    const routes = [];
    app._router.stack.forEach((middleware) => {
        if (middleware.route) {
            routes.push({
                path: middleware.route.path,
                methods: Object.keys(middleware.route.methods)
            });
        } else if (middleware.name === 'router') {
            middleware.handle.stack.forEach((handler) => {
                if (handler.route) {
                    routes.push({
                        path: middleware.regexp.source.replace(/\\|\^|\$|\?|\*|\+|\(|\)|\[|\]|\{|\}/g, '') + handler.route.path,
                        methods: Object.keys(handler.route.methods)
                    });
                }
            });
        }
    });

    res.json({
        success: true,
        routes: routes,
        timestamp: new Date().toISOString()
    });
});

// Debug: Log when mounting CLI routes
console.log('🚀 Mounting CLI API routes...');

// Mount CLI API routes
const cliApiRoutes = require('./routes/cli-api');
app.use('/api/cli', cliApiRoutes);

// Mount AI CLI API routes
const aiCliApiRoutes = require('./routes/ai-cli-api');
app.use('/api/ai-cli', aiCliApiRoutes);

console.log('✅ CLI API routes mounted successfully');

// Simple auth routes removed - using unified auth only

// Mount existing API routes
const v1ApiRoutes = require('./routes/v1-api');
app.use('/api/v1', v1ApiRoutes);

const userManagementApiRoutes = require('./routes/user-management-api');
app.use('/api/users', userManagementApiRoutes);

const ventureManagementApiRoutes = require('./routes/venture-management-api');
app.use('/api/ventures', ventureManagementApiRoutes);

const meetingsApiRoutes = require('./routes/meetings-api');
app.use('/api/meetings', meetingsApiRoutes);

const companyManagementApiRoutes = require('./routes/company-management-api');
app.use('/api/companies', companyManagementApiRoutes);

const teamManagementApiRoutes = require('./routes/team-management-api');
app.use('/api/teams', teamManagementApiRoutes);

// Perfect test route - first and simple
console.log('Loading perfect test API...');
try {
    const perfectTestApiRoutes = require('./routes/perfect-test-api');
    console.log('Perfect test API loaded successfully');
    app.use('/api/perfect-test', perfectTestApiRoutes);
    console.log('Perfect test API routes registered successfully');
} catch (error) {
    console.error('Error loading perfect test API:', error);
}

// Test route first to isolate issues
const testNewRoutesApiRoutes = require('./routes/test-new-routes');
app.use('/api/test-new-routes', testNewRoutesApiRoutes);

// Simple test route without dependencies
console.log('Loading simple test API...');
try {
    const simpleTestApiRoutes = require('./routes/simple-test-api');
    console.log('Simple test API loaded successfully');
    app.use('/api/simple-test', simpleTestApiRoutes);
    console.log('Simple test API routes registered');
} catch (error) {
    console.error('Error loading simple test API:', error);
}

// Diagnostic API for debugging
console.log('Loading diagnostic API...');
try {
    const diagnosticApiRoutes = require('./routes/diagnostic-api');
    console.log('Diagnostic API loaded successfully');
    app.use('/api/diagnostic', diagnosticApiRoutes);
    console.log('Diagnostic API routes registered');
} catch (error) {
    console.error('Error loading diagnostic API:', error);
}

// Auth test API for debugging
console.log('Loading auth test API...');
try {
    const authTestApiRoutes = require('./routes/auth-test-api');
    console.log('Auth test API loaded successfully');
    app.use('/api/auth-test', authTestApiRoutes);
    console.log('Auth test API routes registered');
} catch (error) {
    console.error('Error loading auth test API:', error);
}

// Route debug API for testing
console.log('Loading route debug API...');
try {
    const routeDebugApiRoutes = require('./routes/route-debug-api');
    console.log('Route debug API loaded successfully');
    app.use('/api/route-debug', routeDebugApiRoutes);
    console.log('Route debug API routes registered');
} catch (error) {
    console.error('Error loading route debug API:', error);
}

// Add routes back one by one to identify the problematic one
console.log('Loading digital signatures minimal API...');
try {
    const digitalSignaturesMinimalApiRoutes = require('./routes/digital-signatures-minimal');
    console.log('Digital signatures minimal API loaded successfully');
    app.use('/api/digital-signatures-minimal', digitalSignaturesMinimalApiRoutes);
    console.log('Digital signatures minimal API routes registered');
} catch (error) {
    console.error('Error loading digital signatures minimal API:', error);
}

console.log('Loading digital signatures no-prisma API...');
try {
    const digitalSignaturesNoPrismaApiRoutes = require('./routes/digital-signatures-no-prisma');
    console.log('Digital signatures no-prisma API loaded successfully');
    app.use('/api/digital-signatures-no-prisma', digitalSignaturesNoPrismaApiRoutes);
    console.log('Digital signatures no-prisma API routes registered');
} catch (error) {
    console.error('Error loading digital signatures no-prisma API:', error);
}

// Perfect digital signatures API
console.log('Loading perfect digital signatures API...');
try {
    const digitalSignaturesPerfectApiRoutes = require('./routes/digital-signatures-perfect');
    console.log('Perfect digital signatures API loaded successfully');
    app.use('/api/digital-signatures-perfect', digitalSignaturesPerfectApiRoutes);
    console.log('Perfect digital signatures API routes registered successfully');
} catch (error) {
    console.error('Error loading perfect digital signatures API:', error);
}

// Perfect team invitations API
console.log('Loading perfect team invitations API...');
try {
    const teamInvitationsPerfectApiRoutes = require('./routes/team-invitations-perfect');
    console.log('Perfect team invitations API loaded successfully');
    app.use('/api/team-invitations-perfect', teamInvitationsPerfectApiRoutes);
    console.log('Perfect team invitations API routes registered successfully');
} catch (error) {
    console.error('Error loading perfect team invitations API:', error);
}

// Perfect gamification API
console.log('Loading perfect gamification API...');
try {
    const gamificationPerfectApiRoutes = require('./routes/gamification-perfect');
    console.log('Perfect gamification API loaded successfully');
    app.use('/api/gamification-perfect', gamificationPerfectApiRoutes);
    console.log('Perfect gamification API routes registered successfully');
} catch (error) {
    console.error('Error loading perfect gamification API:', error);
}

// Perfect revenue sharing API
console.log('Loading perfect revenue sharing API...');
try {
    const revenueSharingPerfectApiRoutes = require('./routes/revenue-sharing-perfect');
    console.log('Perfect revenue sharing API loaded successfully');
    app.use('/api/revenue-sharing-perfect', revenueSharingPerfectApiRoutes);
    console.log('Perfect revenue sharing API routes registered successfully');
} catch (error) {
    console.error('Error loading perfect revenue sharing API:', error);
}

// Perfect notifications API
console.log('Loading perfect notifications API...');
try {
    const notificationsPerfectApiRoutes = require('./routes/notifications-perfect');
    console.log('Perfect notifications API loaded successfully');
    app.use('/api/notifications-perfect', notificationsPerfectApiRoutes);
    console.log('Perfect notifications API routes registered successfully');
} catch (error) {
    console.error('Error loading perfect notifications API:', error);
}

// BUZ Token API - Complete token management system
console.log('Loading BUZ Token API...');
try {
    const buzTokenApiRoutes = require('./routes/buz-token-api');
    console.log('BUZ Token API loaded successfully');
    app.use('/api/buz-token', buzTokenApiRoutes);
    console.log('BUZ Token API routes registered successfully');
} catch (error) {
    console.error('Error loading BUZ Token API:', error);
}

console.log('Loading digital signatures API...');
try {
    const digitalSignaturesApiRoutes = require('./routes/digital-signatures-api');
    console.log('Digital signatures API loaded successfully');
    console.log('Digital signatures API type:', typeof digitalSignaturesApiRoutes);
    console.log('Digital signatures API keys:', Object.keys(digitalSignaturesApiRoutes));
    app.use('/api/digital-signatures', digitalSignaturesApiRoutes);
    console.log('Digital signatures API routes registered successfully');
} catch (error) {
    console.error('Error loading digital signatures API:', error);
    console.error('Error stack:', error.stack);
}

// Testing team invitations route
console.log('Loading team invitations API...');
try {
    const teamInvitationsApiRoutes = require('./routes/team-invitations-api');
    console.log('Team invitations API loaded successfully');
    app.use('/api/team-invitations', teamInvitationsApiRoutes);
    console.log('Team invitations API routes registered');
} catch (error) {
    console.error('Error loading team invitations API:', error);
}

// Testing gamification route first
console.log('Loading gamification enhanced API...');
try {
    const gamificationEnhancedApiRoutes = require('./routes/gamification-enhanced-api');
    console.log('Gamification enhanced API loaded successfully');
    app.use('/api/gamification-enhanced', gamificationEnhancedApiRoutes);
    console.log('Gamification enhanced API routes registered');
} catch (error) {
    console.error('Error loading gamification enhanced API:', error);
}

// Testing revenue sharing route
console.log('Loading revenue sharing API...');
try {
    const revenueSharingApiRoutes = require('./routes/revenue-sharing-api');
    console.log('Revenue sharing API loaded successfully');
    app.use('/api/revenue-sharing', revenueSharingApiRoutes);
    console.log('Revenue sharing API routes registered');
} catch (error) {
    console.error('Error loading revenue sharing API:', error);
}

// Test route for debugging
const notificationsTestRoutes = require('./routes/notifications-test');
app.use('/api/notifications-test', notificationsTestRoutes);

// Use simplified notifications route (without WebSocket for now)
console.log('Loading notifications simple API...');
const notificationsSimpleApiRoutes = require('./routes/notifications-simple-api');
console.log('Notifications simple API loaded successfully');
app.use('/api/notifications', notificationsSimpleApiRoutes);
console.log('Notifications API routes registered');

// Simple Legal Test Route
console.log('Loading simple legal test route...');
const simpleLegalTestRoutes = require('./routes/simple-legal-test');
console.log('Simple legal test route loaded successfully');
app.use('/api/simple-legal-test', simpleLegalTestRoutes);
console.log('Simple legal test routes registered');

// Enhanced Legal Protections API
console.log('Loading enhanced legal protections API...');
try {
    const enhancedLegalProtectionsApiRoutes = require('./routes/enhanced-legal-protections-api');
    console.log('Enhanced legal protections API loaded successfully');
    app.use('/api/legal-protections', enhancedLegalProtectionsApiRoutes);
    console.log('Enhanced legal protections API routes registered');
} catch (error) {
    console.error('Error loading enhanced legal protections API:', error);
}

const contributionPipelineApiRoutes = require('./routes/contribution-pipeline-api');
app.use('/api/contributions', contributionPipelineApiRoutes);

const gamificationApiRoutes = require('./routes/gamification-api');
app.use('/api/gamification', gamificationApiRoutes);

const contractsApiRoutes = require('./routes/contracts-api');
app.use('/api/contracts', contractsApiRoutes);

const legalPackApiRoutes = require('./routes/legal-pack-api');
app.use('/api/legal-pack', legalPackApiRoutes);

const advancedContractsApiRoutes = require('./routes/advanced-contracts-api');
app.use('/api/advanced-contracts', advancedContractsApiRoutes);

const contractAutoIssuanceApiRoutes = require('./routes/contract-auto-issuance-api');
app.use('/api/contract-auto-issuance', contractAutoIssuanceApiRoutes);

// Mount unified authentication API
try {
    console.log('🚀 Mounting unified authentication API...');
    const unifiedAuthRoutes = require('./routes/unified-auth-api');
    app.use('/api/auth', unifiedAuthRoutes);
    console.log('✅ Unified authentication API mounted successfully');
} catch (error) {
    console.error('❌ Failed to mount unified auth API:', error.message);
    // Fallback to simple auth if unified auth fails
    console.log('🔄 Falling back to simple auth...');
    try {
        const simpleAuthRoutes = require('./routes/simple-auth-api');
        app.use('/api/auth', simpleAuthRoutes);
        console.log('✅ Simple auth fallback mounted successfully');
    } catch (fallbackError) {
        console.error('❌ Simple auth fallback also failed:', fallbackError.message);
    }
}

// Mount documents API routes (enhanced SOBA/PUOHA)
try {
    console.log('🚀 Mounting documents API...');
    const documentsApiRoutes = require('./routes/documents-api');
    app.use('/api/documents', documentsApiRoutes);
    console.log('✅ Documents API mounted successfully');
} catch (error) {
    console.error('❌ Failed to mount documents API:', error.message);
}

const systemInstructionsApiRoutes = require('./routes/system-instructions-api');
app.use('/api/system', systemInstructionsApiRoutes);

// Mount Umbrella API routes
try {
    console.log('🚀 Mounting Umbrella API...');
    const umbrellaApiRoutes = require('./routes/umbrella-api');
    app.use('/api/umbrella', umbrellaApiRoutes);
    console.log('✅ Umbrella API mounted successfully');
} catch (error) {
    console.error('❌ Failed to mount Umbrella API:', error.message);
}

// Mount Umbrella State Machine API routes
try {
    console.log('🚀 Mounting Umbrella State Machine API...');
    const umbrellaStateMachineApiRoutes = require('./routes/umbrella-state-machine-api');
    app.use('/api/umbrella/state-machine', umbrellaStateMachineApiRoutes);
    console.log('✅ Umbrella State Machine API mounted successfully');
} catch (error) {
    console.error('❌ Failed to mount Umbrella State Machine API:', error.message);
}

// Mount Umbrella Security API routes
try {
    console.log('🚀 Mounting Umbrella Security API...');
    const umbrellaSecurityApiRoutes = require('./routes/umbrella-security-api');
    app.use('/api/umbrella/security', umbrellaSecurityApiRoutes);
    console.log('✅ Umbrella Security API mounted successfully');
} catch (error) {
    console.error('❌ Failed to mount Umbrella Security API:', error.message);
}

// Mount Opportunities API routes
try {
    console.log('🚀 Mounting Opportunities API...');
    const opportunitiesApiRoutes = require('./routes/opportunities-api');
    app.use('/api/opportunities', opportunitiesApiRoutes);
    console.log('✅ Opportunities API mounted successfully');
} catch (error) {
    console.error('❌ Failed to mount Opportunities API:', error.message);
}

// Old authentication routes removed - using unified-auth-api instead

const invitationApiRoutes = require('./routes/invitation-api');
app.use('/api/invitations', invitationApiRoutes);

const fileManagementApiRoutes = require('./routes/file-management-api');
app.use('/api/files', fileManagementApiRoutes);

const digitalDocumentsApiRoutes = require('./routes/digital-documents-api');
app.use('/api/documents', digitalDocumentsApiRoutes);

// Mount User Journey APIs
const userProfileApiRoutes = require('./routes/user-profile-api');
app.use('/api/user-profile', userProfileApiRoutes);

const userPortfolioApiRoutes = require('./routes/user-portfolio-api');
app.use('/api/user-portfolio', userPortfolioApiRoutes);

const userGamificationApiRoutes = require('./routes/user-gamification-api');
app.use('/api/user-gamification', userGamificationApiRoutes);

// Mount Role-Based Business Systems
const roleDashboardApiRoutes = require('./routes/role-dashboard-api');
app.use('/api/role-dashboard', roleDashboardApiRoutes);

const taskManagementApiRoutes = require('./routes/task-management-api');
app.use('/api/tasks', taskManagementApiRoutes);

const fundingPipelineApiRoutes = require('./routes/funding-pipeline-api');
app.use('/api/funding', fundingPipelineApiRoutes);

// Mount new Subscription & Billing APIs
const subscriptionApiRoutes = require('./routes/subscription-api');
app.use('/api/subscriptions', subscriptionApiRoutes);

const billingApiRoutes = require('./routes/billing-api');
app.use('/api/billing', billingApiRoutes);

// Mount Platform Legal Pack APIs
// (Already mounted above with contracts API)

// Mount Legal Framework APIs
const legalFrameworkApiRoutes = require('./routes/legal-framework-api');
const legalStateMachineApiRoutes = require('./routes/legal-state-machine-api');
const stateMachineManagerApiRoutes = require('./routes/state-machine-manager-api');
app.use('/api/legal', legalFrameworkApiRoutes);
app.use('/api/legal/state-machine', legalStateMachineApiRoutes);
app.use('/api/state-machines', stateMachineManagerApiRoutes);

// Mount User Journey State Management APIs
const journeyApiRoutes = require('./routes/journey-api');
app.use('/api/journey', journeyApiRoutes);

// Mount RBAC APIs
const rbacApiRoutes = require('./routes/rbac-api');
app.use('/api/rbac', rbacApiRoutes);

// Mount Enhanced RBAC APIs
const enhancedRbacApiRoutes = require('./routes/enhanced-rbac-api');
app.use('/api/enhanced-rbac', enhancedRbacApiRoutes);

// Mount Comprehensive Dashboard APIs
const comprehensiveDashboardApiRoutes = require('./routes/comprehensive-dashboard-api');
app.use('/api/dashboard', comprehensiveDashboardApiRoutes);

// Mount Journey State Management APIs
const journeyStateApiRoutes = require('./routes/journey-state-api');
app.use('/api/journey-state', journeyStateApiRoutes);

// Mount Enhanced Journey APIs
const enhancedJourneyApiRoutes = require('./routes/enhanced-journey-api');
app.use('/api/enhanced-journey', enhancedJourneyApiRoutes);

// Mount KYC/Identity Verification APIs
const kycApiRoutes = require('./routes/kyc-api');
app.use('/api/kyc', kycApiRoutes);

// Mount Multi-Factor Authentication APIs
const mfaApiRoutes = require('./routes/mfa-api');
app.use('/api/mfa', mfaApiRoutes);

// Mount Email Verification APIs
const emailVerificationApiRoutes = require('./routes/email-verification-api');
app.use('/api/email-verification', emailVerificationApiRoutes);

// Mount Legal Document Signing APIs
const legalSigningApiRoutes = require('./routes/legal-signing-api');
app.use('/api/legal-signing', legalSigningApiRoutes);

// Debug API for troubleshooting
const debugApiRoutes = require('./routes/debug-api');
app.use('/api/debug', debugApiRoutes);

// Mount Business Logic APIs
const businessLogicApiRoutes = require('./routes/business-logic-api');
app.use('/api/business-logic', businessLogicApiRoutes);

// Mount Migration API
const migrationApiRoutes = require('./routes/migration-api');
app.use('/api/migration', migrationApiRoutes);

// Mount Database Fix API
const databaseFixApiRoutes = require('./routes/database-fix-api');
app.use('/api/database-fix', databaseFixApiRoutes);

// Mount Legal Documents API
try {
    console.log('🚀 Mounting Legal Documents API...');
    const legalDocumentsApiRoutes = require('./routes/legal-documents-api');
    app.use('/api/legal-documents', legalDocumentsApiRoutes);
    console.log('✅ Legal Documents API mounted successfully');
} catch (error) {
    console.error('❌ Failed to mount Legal Documents API:', error.message);
}

console.log('✅ User Journey APIs mounted successfully');
console.log('✅ Role-Based Business Systems mounted successfully');
console.log('✅ Subscription & Billing APIs mounted successfully');
console.log('✅ Platform Legal Pack APIs mounted successfully');
console.log('✅ User Journey State Management APIs mounted successfully');
console.log('✅ RBAC APIs mounted successfully');
console.log('✅ Journey State Management APIs mounted successfully');
console.log('✅ Enhanced RBAC APIs mounted successfully');
console.log('✅ Comprehensive Dashboard APIs mounted successfully');
console.log('✅ Enhanced Journey APIs mounted successfully');
console.log('✅ Business Logic APIs mounted successfully');

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Not found',
        message: `Route ${req.originalUrl} not found`,
        availableRoutes: ['/health', '/api/cli/*', '/api/v1/*', '/api/users/*', '/api/companies/*', '/api/teams/*', '/api/subscriptions/*', '/api/billing/*', '/api/legal-pack/*', '/api/journey/*']
    });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
            console.log(`🚀 SmartStart Platform Server running on port ${PORT}`);
            console.log(`📡 CLI API available at /api/cli`);
            console.log(`🔐 Security middleware enabled`);
            console.log(`📊 All 12 systems operational`);
            console.log(`🔄 CLI System Version: 2.0.1`);

            // Ensure Postgres enum GateType exists and includes expected values
            (async() => {
                    try {
                        const required = ['SUBSCRIPTION', 'LEGAL_PACK', 'NDA', 'CONTRACT', 'PAYMENT', 'VERIFICATION', 'PROFILE', 'DOCUMENT', 'LAUNCH', 'VENTURE', 'TEAM', 'PROJECT', 'LEGAL_ENTITY', 'EQUITY', 'CUSTOM'];

                        // Create enum if missing with all values at once
                        const typeExists = await prisma.$queryRawUnsafe("SELECT 1 FROM pg_type WHERE typname = 'GateType' LIMIT 1");
                        if (!typeExists || typeExists.length === 0) {
                            console.log('[DB] Creating GateType enum...');
                            const createEnum = `DO $$\nBEGIN\n  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'GateType') THEN\n    CREATE TYPE "GateType" AS ENUM (${required.map(v => `'${v}'`).join(', ')});\n  END IF;\nEND$$;`;
                await prisma.$executeRawUnsafe(createEnum);
                console.log('[DB] GateType enum created');
                return;
            }

            // Add any missing values
            const existing = await prisma.$queryRawUnsafe("SELECT enumlabel FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'GateType'");
            const existingLabels = (existing || []).map(r => r.enumlabel);
            for (const label of required) {
                if (!existingLabels.includes(label)) {
                    console.log(`[DB] Adding missing GateType value: ${label}`);
                    await prisma.$executeRawUnsafe(`ALTER TYPE "GateType" ADD VALUE IF NOT EXISTS '${label}'`);
                }
            }
            console.log('[DB] GateType enum synchronized');
        } catch (e) {
            console.error('[DB] Failed to synchronize GateType enum:', e.message);
        }
    })();
});

module.exports = app;