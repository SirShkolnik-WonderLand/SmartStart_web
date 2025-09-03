const express = require('express');
const cors = require('cors');
const { setupSecurity } = require('./middleware/security');

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

console.log('✅ User Journey APIs mounted successfully');

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
        availableRoutes: ['/health', '/api/cli/*', '/api/v1/*', '/api/users/*', '/api/companies/*', '/api/teams/*']
    });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`🚀 SmartStart Platform Server running on port ${PORT}`);
    console.log(`📡 CLI API available at /api/cli`);
    console.log(`🔐 Security middleware enabled`);
    console.log(`📊 All 7 systems operational`);
    console.log(`🔄 CLI System Version: 2.0.1`);
});

module.exports = app;