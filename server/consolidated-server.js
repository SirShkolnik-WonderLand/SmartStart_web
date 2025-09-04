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
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
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

// Debug: Log when mounting CLI routes
console.log('🚀 Mounting CLI API routes...');

// Mount CLI API routes
const cliApiRoutes = require('./routes/cli-api');
app.use('/api/cli', cliApiRoutes);

// Mount AI CLI API routes
const aiCliApiRoutes = require('./routes/ai-cli-api');
app.use('/api/ai-cli', aiCliApiRoutes);

console.log('✅ CLI API routes mounted successfully');

// Mount simple auth API routes (workaround for production)
const simpleAuthRoutes = require('./routes/simple-auth-api');
app.use('/api/simple-auth', simpleAuthRoutes);

// Mount existing API routes
const v1ApiRoutes = require('./routes/v1-api');
app.use('/api/v1', v1ApiRoutes);

const userManagementApiRoutes = require('./routes/user-management-api');
app.use('/api/users', userManagementApiRoutes);

const ventureManagementApiRoutes = require('./routes/venture-management-api');
app.use('/api/ventures', ventureManagementApiRoutes);

const companyManagementApiRoutes = require('./routes/company-management-api');
app.use('/api/companies', companyManagementApiRoutes);

const teamManagementApiRoutes = require('./routes/team-management-api');
app.use('/api/teams', teamManagementApiRoutes);

const contributionPipelineApiRoutes = require('./routes/contribution-pipeline-api');
app.use('/api/contributions', contributionPipelineApiRoutes);

const gamificationApiRoutes = require('./routes/gamification-api');
app.use('/api/gamification', gamificationApiRoutes);

const contractsApiRoutes = require('./routes/contracts-api');
app.use('/api/contracts', contractsApiRoutes);

const advancedContractsApiRoutes = require('./routes/advanced-contracts-api');
app.use('/api/advanced-contracts', advancedContractsApiRoutes);

const contractAutoIssuanceApiRoutes = require('./routes/contract-auto-issuance-api');
app.use('/api/contract-auto-issuance', contractAutoIssuanceApiRoutes);

// Mount documents API routes
const documentsApiRoutes = require('./routes/documents-api');
app.use('/api/documents', documentsApiRoutes);

const systemInstructionsApiRoutes = require('./routes/system-instructions-api');
app.use('/api/system', systemInstructionsApiRoutes);

const authenticationApiRoutes = require('./routes/authentication-api');
app.use('/api/auth', authenticationApiRoutes);

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
const legalPackApiRoutes = require('./routes/legal-pack-api');
app.use('/api/legal-pack', legalPackApiRoutes);

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

// Mount Business Logic APIs
const businessLogicApiRoutes = require('./routes/business-logic-api');
app.use('/api/business-logic', businessLogicApiRoutes);

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

    // Ensure Postgres enum GateType includes all expected values
    (async () => {
        try {
            const required = ['SUBSCRIPTION','LEGAL_PACK','NDA','CONTRACT','PAYMENT','VERIFICATION','PROFILE','DOCUMENT','LAUNCH','VENTURE','TEAM','PROJECT','LEGAL_ENTITY','CUSTOM'];
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