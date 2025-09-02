const express = require('express');
const router = express.Router();

// ===== SYSTEM INSTRUCTIONS & DOCUMENTATION API =====
// This endpoint provides comprehensive documentation for the entire SmartStart platform

router.get('/', async (req, res) => {
    try {
        const systemInstructions = {
            system: {
                name: "SmartStart Platform",
                version: "2.0.0",
                description: "Comprehensive startup ecosystem platform with legal, venture, and gamification systems",
                architecture: "Microservices with PostgreSQL database and Node.js/Express backend",
                deployment: "Render.com with auto-deployment from GitHub"
            },
            
            // ===== CORE SYSTEMS OVERVIEW =====
            coreSystems: {
                userManagement: {
                    description: "Complete user lifecycle management with profiles, privacy, and networking",
                    status: "✅ DEPLOYED",
                    features: [
                        "User CRUD operations",
                        "Profile management",
                        "Privacy controls",
                        "User connections/networking",
                        "Portfolio management",
                        "Skills & endorsements",
                        "Activity tracking & analytics"
                    ]
                },
                
                gamification: {
                    description: "XP, levels, badges, reputation, and community engagement system",
                    status: "✅ DEPLOYED",
                    features: [
                        "XP & level progression (OWLET → SKY_MASTER)",
                        "Badge system with conditions",
                        "Reputation scoring",
                        "Portfolio analytics",
                        "Skill endorsements",
                        "Community challenges",
                        "Leaderboards"
                    ]
                },
                
                legalFoundation: {
                    description: "Advanced contract management with auto-issuance and compliance",
                    status: "✅ DEPLOYED",
                    features: [
                        "Contract templates & auto-issuance",
                        "Digital signatures",
                        "Contract amendments",
                        "Multi-party signing",
                        "Compliance tracking",
                        "Legal rule engine"
                    ]
                },
                
                ventureManagement: {
                    description: "Complete venture creation and management system",
                    status: "✅ DEPLOYED",
                    features: [
                        "Venture creation & setup",
                        "Legal entity management",
                        "Equity framework",
                        "IT pack provisioning",
                        "Document management"
                    ]
                }
            },
            
            // ===== API ENDPOINTS DOCUMENTATION =====
            apiEndpoints: {
                baseUrl: "https://smartstart-api.onrender.com",
                
                userManagement: {
                    base: "/api/users",
                    endpoints: {
                        "GET /health": "System health check",
                        "POST /create": "Create new user",
                        "GET /": "Get all users (admin)",
                        "GET /:userId": "Get user by ID",
                        "PUT /:userId": "Update user",
                        "GET /search": "Search users",
                        "GET /stats/system": "System statistics",
                        "GET /:userId/profile": "Get user profile",
                        "PUT /:userId/profile": "Update user profile",
                        "PUT /:userId/privacy": "Update privacy settings",
                        "GET /:userId/settings": "Get user settings",
                        "PUT /:userId/settings": "Update user settings",
                        "GET /:userId/connections": "Get user connections",
                        "POST /:userId/connections": "Create connection request",
                        "PUT /:userId/connections/:connectionId/accept": "Accept connection",
                        "GET /:userId/portfolio": "Get user portfolio",
                        "POST /:userId/portfolio": "Add portfolio item",
                        "GET /:userId/skills": "Get user skills",
                        "POST /:userId/skills": "Add user skill",
                        "GET /:userId/analytics": "Get user analytics",
                        "GET /:userId/activity": "Get user activity",
                        "GET /:userId/stats": "Get user statistics"
                    }
                },
                
                gamification: {
                    base: "/api/gamification",
                    endpoints: {
                        "GET /health": "System health check",
                        "POST /xp/add": "Add XP for user activity",
                        "GET /xp/:userId": "Get user XP and level info",
                        "POST /badges/check/:userId": "Check and award badges",
                        "GET /badges/:userId": "Get user badges",
                        "GET /badges": "Get all available badges",
                        "POST /reputation/calculate/:userId": "Calculate user reputation",
                        "GET /reputation/:userId": "Get user reputation",
                        "POST /portfolio/insights/:userId": "Generate portfolio insights",
                        "GET /portfolio/:userId": "Get user portfolio",
                        "GET /skills/:userId": "Get user skills",
                        "POST /skills/endorse": "Add skill endorsement",
                        "POST /community/score/:userId": "Calculate community score",
                        "GET /challenges/daily/:userId": "Generate daily challenge",
                        "GET /leaderboard/:category": "Get leaderboard by category",
                        "GET /leaderboards": "Get all leaderboards",
                        "GET /activity/:userId": "Get user activity log",
                        "POST /migrate": "Run gamification migration",
                        "POST /seed": "Seed gamification data",
                        "POST /create-tables": "Create gamification tables"
                    }
                },
                
                contracts: {
                    base: "/api/contracts",
                    endpoints: {
                        "GET /health": "System health check",
                        "GET /templates": "Get contract templates",
                        "GET /templates/:type": "Get template by type",
                        "POST /templates/create": "Create new template",
                        "PUT /templates/:id/approve": "Approve template",
                        "POST /create": "Create new contract",
                        "GET /": "Get all contracts",
                        "GET /:id": "Get contract by ID",
                        "PUT /:id": "Update contract",
                        "DELETE /:id": "Delete contract",
                        "POST /:id/sign": "Sign contract",
                        "GET /:id/signatures": "Get contract signatures",
                        "GET /compliance/status": "Get compliance status"
                    }
                },
                
                advancedContracts: {
                    base: "/api/contracts/advanced",
                    endpoints: {
                        "GET /health": "System health check",
                        "POST /:id/amend": "Create contract amendment",
                        "GET /:id/amendments": "Get contract amendments",
                        "POST /:id/sign/multi-party": "Multi-party signing",
                        "POST /:id/enforce": "Enforce contract",
                        "GET /:id/enforcement": "Get enforcement status",
                        "POST /:id/verify-signature": "Verify signature",
                        "POST /templates/:id/version": "Create template version",
                        "GET /compliance/advanced": "Advanced compliance check"
                    }
                },
                
                contractAutoIssuance: {
                    base: "/api/contracts/auto-issuance",
                    endpoints: {
                        "GET /health": "System health check",
                        "GET /templates": "Get auto-issuance templates",
                        "POST /issue/:ventureId": "Auto-issue contracts for venture",
                        "POST /onboard/:ventureId": "Complete venture onboarding",
                        "GET /preview/:ventureId": "Preview contracts for venture",
                        "POST /validate/:templateId": "Validate template",
                        "GET /venture/:ventureId/status": "Get venture contract status"
                    }
                },
                
                ventures: {
                    base: "/api/ventures",
                    endpoints: {
                        "GET /health": "System health check",
                        "POST /create": "Create new venture",
                        "GET /:ventureId": "Get venture details",
                        "PUT /:ventureId/status": "Update venture status",
                        "POST /:ventureId/it-pack": "Provision IT pack",
                        "GET /statistics/overview": "Get venture statistics",
                        "GET /list/all": "List all ventures",
                        "GET /:ventureId/equity": "Get venture equity details",
                        "PUT /:ventureId/profile": "Update venture profile",
                        "GET /:ventureId/documents": "Get venture documents",
                        "POST /migrate": "Run venture migration",
                        "POST /create-tables": "Create venture tables",
                        "POST /regenerate-prisma": "Regenerate Prisma client",
                        "POST /create-test": "Create test venture"
                    }
                }
            },
            
            // ===== DATA MODELS & RELATIONSHIPS =====
            dataModels: {
                user: {
                    core: ["id", "email", "name", "level", "xp", "reputation", "status"],
                    computed: ["totalPortfolioValue", "activeProjectsCount", "totalContributions"],
                    relations: ["userProfile", "profile", "wallet", "userSkills", "portfolio", "userBadges", "venturesOwned", "connections"]
                },
                
                userProfile: {
                    fields: ["nickname", "bio", "location", "websiteUrl", "theme", "level", "xp", "repScore", "isPublic"],
                    relation: "One-to-one with User"
                },
                
                profilePrivacy: {
                    fields: ["showExactPercToHub", "showActivity", "showSkills", "showReputation"],
                    relation: "One-to-one with User"
                },
                
                wallet: {
                    fields: ["buzBalance", "pendingLock", "chainAddress", "chainType"],
                    relation: "One-to-one with User"
                },
                
                userConnection: {
                    fields: ["requesterId", "targetId", "connectionType", "status", "acceptedAt"],
                    relation: "Many-to-many between Users"
                },
                
                portfolioItem: {
                    fields: ["title", "summary", "fileId", "externalUrl", "buzEarned", "impactScore"],
                    relation: "Many-to-one with User"
                },
                
                userSkill: {
                    fields: ["skillId", "level", "verified", "endorsements"],
                    relation: "Many-to-many between User and Skill"
                },
                
                skill: {
                    fields: ["name", "category", "description", "demand", "complexity"],
                    relation: "One-to-many with UserSkill"
                },
                
                endorsement: {
                    fields: ["endorserId", "endorsedId", "skillId", "weight", "note"],
                    relation: "Many-to-many between Users"
                },
                
                badge: {
                    fields: ["name", "description", "icon", "condition", "category", "rarity"],
                    relation: "Many-to-many with User through UserBadge"
                },
                
                userBadge: {
                    fields: ["userId", "badgeId", "earnedAt"],
                    relation: "Junction table for User and Badge"
                },
                
                userActivity: {
                    fields: ["type", "entityType", "data", "createdAt"],
                    relation: "One-to-many with User"
                },
                
                venture: {
                    fields: ["name", "description", "status", "equityModel", "vestingSchedule"],
                    relations: ["owner", "legalEntity", "equityFramework", "documents"]
                },
                
                legalDocument: {
                    fields: ["type", "title", "content", "status", "version"],
                    relations: ["venture", "signatures", "amendments"]
                }
            },
            
            // ===== SYSTEM FEATURES & CAPABILITIES =====
            features: {
                userGrowth: {
                    levels: {
                        OWLET: { min: 0, max: 999, multiplier: 1.0 },
                        NIGHT_WATCHER: { min: 1000, max: 4999, multiplier: 1.2 },
                        WISE_OWL: { min: 5000, max: 19999, multiplier: 1.5 },
                        SKY_MASTER: { min: 20000, max: 99999, multiplier: 2.0 }
                    },
                    xpRewards: {
                        LOGIN: 5,
                        CONTRIBUTION: 25,
                        IDEA: 15,
                        POLL_VOTE: 5,
                        MESSAGE: 3,
                        KUDOS_GIVEN: 10,
                        KUDOS_RECEIVED: 20,
                        SKILL_ENDORSEMENT: 15,
                        BADGE_EARNED: 100,
                        EQUITY_EARNED: 50,
                        PROJECT_COMPLETION: 200,
                        COMMUNITY_HELP: 30
                    }
                },
                
                portfolioManagement: {
                    metrics: ["totalPortfolioValue", "averageImpactScore", "portfolioDiversity"],
                    features: ["BUZ tracking", "Impact scoring", "External links", "File attachments"]
                },
                
                networking: {
                    connectionTypes: ["CONNECTION", "MENTOR", "COLLABORATOR"],
                    statuses: ["PENDING", "ACCEPTED", "REJECTED", "BLOCKED"]
                },
                
                legalSystem: {
                    contractTypes: ["EQUITY_AGREEMENT", "EMPLOYMENT_CONTRACT", "INTELLECTUAL_PROPERTY", "CONFIDENTIALITY_AGREEMENT", "VESTING_SCHEDULE"],
                    features: ["Template engine", "Auto-issuance", "Digital signatures", "Compliance tracking"]
                }
            },
            
            // ===== INTEGRATION PATTERNS =====
            integrationPatterns: {
                userOnboarding: [
                    "1. Create user via /api/users/create",
                    "2. Add profile via /api/users/:userId/profile",
                    "3. Set privacy via /api/users/:userId/privacy",
                    "4. Add skills via /api/users/:userId/skills",
                    "5. Create portfolio via /api/users/:userId/portfolio"
                ],
                
                ventureSetup: [
                    "1. Create venture via /api/ventures/create",
                    "2. Auto-issue contracts via /api/contracts/auto-issuance/issue/:ventureId",
                    "3. Complete onboarding via /api/contracts/auto-issuance/onboard/:ventureId",
                    "4. Provision IT pack via /api/ventures/:ventureId/it-pack"
                ],
                
                gamificationFlow: [
                    "1. User performs action",
                    "2. Add XP via /api/gamification/xp/add",
                    "3. Check badges via /api/gamification/badges/check/:userId",
                    "4. Update reputation via /api/gamification/reputation/calculate/:userId",
                    "5. Generate insights via /api/gamification/portfolio/insights/:userId"
                ]
            },
            
            // ===== DEVELOPMENT & TESTING =====
            development: {
                testing: {
                    gamification: "./test-gamification-system.sh",
                    userManagement: "./test-user-management-system.sh",
                    ventureSystem: "./test-venture-system.sh",
                    contracts: "./test-advanced-contracts.sh"
                },
                
                database: {
                    migrations: "npx prisma migrate deploy",
                    seeding: "Use /seed endpoints for each system",
                    schema: "prisma/schema.prisma"
                },
                
                deployment: {
                    git: "git add . && git commit -m 'message' && git push origin main",
                    render: "Auto-deploys from GitHub main branch",
                    waitTime: "80 seconds for deployment completion"
                }
            },
            
            // ===== SYSTEM STATUS & METRICS =====
            systemStatus: {
                deployed: true,
                lastUpdated: new Date().toISOString(),
                activeSystems: [
                    "User Management System",
                    "Gamification System", 
                    "Legal Foundation System",
                    "Venture Management System"
                ],
                nextPhase: "User Onboarding & KYC System",
                estimatedCompletion: "2-3 weeks"
            }
        };

        res.json({
            success: true,
            message: "SmartStart Platform System Instructions",
            instructions: systemInstructions,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error generating system instructions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate system instructions',
            error: error.message
        });
    }
});

// ===== SYSTEM STATUS ENDPOINT =====
router.get('/status', async (req, res) => {
    try {
        const systemStatus = {
            platform: "SmartStart Platform",
            version: "2.0.0",
            status: "OPERATIONAL",
            deployedSystems: [
                {
                    name: "User Management System",
                    status: "✅ DEPLOYED",
                    endpoints: 25,
                    features: ["CRUD", "Profiles", "Privacy", "Networking", "Portfolio", "Skills", "Analytics"]
                },
                {
                    name: "Gamification System", 
                    status: "✅ DEPLOYED",
                    endpoints: 20,
                    features: ["XP", "Levels", "Badges", "Reputation", "Portfolio", "Skills", "Leaderboards"]
                },
                {
                    name: "Legal Foundation System",
                    status: "✅ DEPLOYED", 
                    endpoints: 35,
                    features: ["Contracts", "Templates", "Signatures", "Amendments", "Compliance"]
                },
                {
                    name: "Venture Management System",
                    status: "✅ DEPLOYED",
                    endpoints: 15,
                    features: ["Ventures", "Legal Entities", "Equity", "IT Packs", "Documents"]
                },
                {
                    name: "Company Management System",
                    status: "✅ DEPLOYED",
                    endpoints: 17,
                    features: ["Company CRUD", "Industry Classification", "Hierarchy", "Metrics", "Documents", "Tagging"]
                },
                {
                    name: "Team Management System",
                    status: "✅ DEPLOYED",
                    endpoints: 15,
                    features: ["Team Structure", "Collaboration", "Goals", "Metrics", "Communication", "Analytics"]
                },
                {
                    name: "Contribution Pipeline System",
                    status: "✅ DEPLOYED",
                    endpoints: 18,
                    features: ["Project Management", "Task Management", "Workflow Automation", "Performance Tracking", "Contribution Analytics", "BUZ Integration Ready"]
                }
            ],
            totalEndpoints: 145,
            totalFeatures: 84,
            databaseTables: 31,
            lastDeployment: new Date().toISOString(),
            nextPhase: "Financial Integration & BUZ Token System",
        currentIssues: [
            "Company listing endpoint needs schema alignment fix",
            "Team creation endpoint needs enum type resolution",
            "Deployment caching issues being investigated"
        ]
        };

        res.json({
            success: true,
            systemStatus
        });
    } catch (error) {
        console.error('Error getting system status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get system status',
            error: error.message
        });
    }
});

// ===== API EXPLORER ENDPOINT =====
router.get('/explorer', async (req, res) => {
    try {
        const apiExplorer = {
            title: "SmartStart API Explorer",
            description: "Interactive API documentation and testing guide",
            
            quickStart: {
                step1: "Check system health: GET /api/system/health",
                step2: "Create a user: POST /api/users/create",
                step3: "Add XP: POST /api/gamification/xp/add", 
                step4: "Create venture: POST /api/ventures/create",
                step5: "Auto-issue contracts: POST /api/contracts/auto-issuance/issue/:ventureId"
            },
            
            testingTools: {
                gamification: "Use test-gamification-system.sh for comprehensive testing",
                userManagement: "Use test-user-management-system.sh for user system testing",
                ventureSystem: "Use test-venture-system.sh for venture testing",
                contracts: "Use test-advanced-contracts.sh for contract testing"
            },
            
            commonPatterns: {
                authentication: "Currently open API - add JWT middleware as needed",
                errorHandling: "All endpoints return {success: boolean, message: string, data?: any}",
                pagination: "Use ?limit=X&offset=Y for paginated endpoints",
                filtering: "Use query parameters for filtering (e.g., ?status=ACTIVE&level=OWLET)"
            }
        };

        res.json({
            success: true,
            apiExplorer
        });
    } catch (error) {
        console.error('Error generating API explorer:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate API explorer',
            error: error.message
        });
    }
});

module.exports = router;
