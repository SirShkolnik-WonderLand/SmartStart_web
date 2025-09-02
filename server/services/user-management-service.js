const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

class UserManagementService {
    constructor() {
        this.defaultUserSettings = {
            theme: 'auto',
            notifications: {
                email: true,
                push: true,
                sms: false
            },
            privacy: {
                showExactPercToHub: false,
                showActivity: true,
                showSkills: true,
                showReputation: true,
                showPortfolio: true,
                showEquity: false
            },
            preferences: {
                language: 'en',
                timezone: 'UTC',
                currency: 'USD'
            }
        };
    }

    // ===== USER CRUD OPERATIONS =====

    async createUser(userData) {
        try {
            const { email, name, password, ...additionalData } = userData;

            // Hash password if provided
            let hashedPassword = null;
            if (password) {
                hashedPassword = await bcrypt.hash(password, 12);
            }

            // Create user with comprehensive setup
            const user = await prisma.user.create({
                data: {
                    email,
                    name,
                    // Set default values
                    level: 'OWLET',
                    xp: 0,
                    reputation: 50, // Start with neutral reputation
                    status: 'ACTIVE',
                    lastActive: new Date(),
                    // Create related records
                    userProfile: {
                        create: {
                            nickname: name || email.split('@')[0],
                            bio: additionalData.bio || null,
                            location: additionalData.location || null,
                            websiteUrl: additionalData.websiteUrl || null,
                            level: 1,
                            xp: 0,
                            repScore: 50,
                            isPublic: true
                        }
                    },
                    profilePrivacy: {
                        create: {
                            showExactPercToHub: false,
                            showActivity: true,
                            showSkills: true,
                            showReputation: true
                        }
                    },
                    wallet: {
                        create: {
                            buzBalance: 0,
                            pendingLock: 0
                        }
                    }
                },
                include: {
                    userProfile: true,
                    profilePrivacy: true,
                    wallet: true
                }
            });

            // Log user creation
            await this.logUserActivity(user.id, 'USER_CREATED', 'system', {
                action: 'user_created',
                timestamp: new Date().toISOString()
            });

            return {
                success: true,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    level: user.level,
                    xp: user.xp,
                    reputation: user.reputation,
                    status: user.status,
                    createdAt: user.createdAt
                },
                profile: user.userProfile,
                privacy: user.profilePrivacy,
                wallet: user.wallet
            };
        } catch (error) {
            console.error('Error creating user:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    async getUserById(userId, includeRelations = []) {
        try {
            const include = {};
            
            // Build include object based on requested relations
            if (includeRelations.includes('profile')) include.userProfile = true;
            if (includeRelations.includes('privacy')) include.profilePrivacy = true;
            if (includeRelations.includes('wallet')) include.wallet = true;
            if (includeRelations.includes('skills')) include.userSkills = { include: { skill: true } };
            if (includeRelations.includes('portfolio')) include.portfolio = true;
            if (includeRelations.includes('badges')) include.userBadges = { include: { badge: true } };
            if (includeRelations.includes('ventures')) include.venturesOwned = true;
            if (includeRelations.includes('activity')) include.activityLog = { take: 20, orderBy: { createdAt: 'desc' } };

            const user = await prisma.user.findUnique({
                where: { id: userId },
                include
            });

            if (!user) {
                return {
                    success: false,
                    message: 'User not found'
                };
            }

            return {
                success: true,
                user
            };
        } catch (error) {
            console.error('Error getting user:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    async updateUser(userId, updateData) {
        try {
            const allowedFields = [
                'name', 'email', 'level', 'xp', 'reputation', 
                'status', 'lastActive', 'totalPortfolioValue',
                'activeProjectsCount', 'totalContributions'
            ];

            const filteredData = {};
            Object.keys(updateData).forEach(key => {
                if (allowedFields.includes(key)) {
                    filteredData[key] = updateData[key];
                }
            });

            if (Object.keys(filteredData).length === 0) {
                return {
                    success: false,
                    message: 'No valid fields to update'
                };
            }

            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: filteredData
            });

            // Log user update
            await this.logUserActivity(userId, 'USER_UPDATED', 'system', {
                action: 'user_updated',
                fields: Object.keys(filteredData),
                timestamp: new Date().toISOString()
            });

            return {
                success: true,
                user: updatedUser
            };
        } catch (error) {
            console.error('Error updating user:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    // ===== USER PROFILE MANAGEMENT =====

    async updateUserProfile(userId, profileData) {
        try {
            const allowedFields = [
                'nickname', 'bio', 'location', 'websiteUrl', 
                'theme', 'level', 'xp', 'repScore', 'isPublic'
            ];

            const filteredData = {};
            Object.keys(profileData).forEach(key => {
                if (allowedFields.includes(key)) {
                    filteredData[key] = profileData[key];
                }
            });

            if (Object.keys(filteredData).length === 0) {
                return {
                    success: false,
                    message: 'No valid profile fields to update'
                };
            }

            // Update or create profile
            const profile = await prisma.userProfile.upsert({
                where: { userId },
                update: filteredData,
                create: {
                    userId,
                    ...filteredData,
                    nickname: filteredData.nickname || 'User',
                    level: filteredData.level || 1,
                    xp: filteredData.xp || 0,
                    repScore: filteredData.repScore || 50,
                    isPublic: filteredData.isPublic !== undefined ? filteredData.isPublic : true
                }
            });

            return {
                success: true,
                profile
            };
        } catch (error) {
            console.error('Error updating user profile:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    async updatePrivacySettings(userId, privacyData) {
        try {
            const allowedFields = [
                'showExactPercToHub', 'showActivity', 
                'showSkills', 'showReputation'
            ];

            const filteredData = {};
            Object.keys(privacyData).forEach(key => {
                if (allowedFields.includes(key)) {
                    filteredData[key] = privacyData[key];
                }
            });

            if (Object.keys(filteredData).length === 0) {
                return {
                    success: false,
                    message: 'No valid privacy fields to update'
                };
            }

            // Update or create privacy settings
            const privacy = await prisma.profilePrivacy.upsert({
                where: { userId },
                update: filteredData,
                create: {
                    userId,
                    ...filteredData
                }
            });

            return {
                success: true,
                privacy
            };
        } catch (error) {
            console.error('Error updating privacy settings:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    // ===== USER CONNECTIONS & NETWORKING =====

    async createUserConnection(requesterId, targetId, connectionType = 'CONNECTION') {
        try {
            // Check if connection already exists
            const existingConnection = await prisma.userConnection.findFirst({
                where: {
                    OR: [
                        { requesterId, targetId },
                        { requesterId: targetId, targetId: requesterId }
                    ]
                }
            });

            if (existingConnection) {
                return {
                    success: false,
                    message: 'Connection already exists'
                };
            }

            // Create connection
            const connection = await prisma.userConnection.create({
                data: {
                    requesterId,
                    targetId,
                    connectionType,
                    status: 'PENDING'
                }
            });

            // Log connection request
            await this.logUserActivity(requesterId, 'CONNECTION_REQUESTED', 'user', {
                targetUserId: targetId,
                connectionType,
                timestamp: new Date().toISOString()
            });

            return {
                success: true,
                connection
            };
        } catch (error) {
            console.error('Error creating user connection:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    async acceptConnection(connectionId, userId) {
        try {
            const connection = await prisma.userConnection.findUnique({
                where: { id: connectionId }
            });

            if (!connection || connection.targetId !== userId) {
                return {
                    success: false,
                    message: 'Connection not found or unauthorized'
                };
            }

            if (connection.status !== 'PENDING') {
                return {
                    success: false,
                    message: 'Connection is not pending'
                };
            }

            // Accept connection
            const updatedConnection = await prisma.userConnection.update({
                where: { id: connectionId },
                data: { status: 'ACCEPTED', acceptedAt: new Date() }
            });

            // Log connection acceptance
            await this.logUserActivity(userId, 'CONNECTION_ACCEPTED', 'user', {
                requesterUserId: connection.requesterId,
                connectionType: connection.connectionType,
                timestamp: new Date().toISOString()
            });

            return {
                success: true,
                connection: updatedConnection
            };
        } catch (error) {
            console.error('Error accepting connection:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    async getUserConnections(userId, status = 'ACCEPTED') {
        try {
            const connections = await prisma.userConnection.findMany({
                where: {
                    OR: [
                        { requesterId: userId, status },
                        { targetId: userId, status }
                    ]
                },
                include: {
                    requester: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            level: true,
                            reputation: true
                        }
                    },
                    target: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            level: true,
                            reputation: true
                        }
                    }
                }
            });

            // Format connections to show connected users
            const formattedConnections = connections.map(conn => {
                const connectedUser = conn.requesterId === userId ? conn.target : conn.requester;
                return {
                    id: conn.id,
                    connectedUser,
                    connectionType: conn.connectionType,
                    createdAt: conn.createdAt,
                    acceptedAt: conn.acceptedAt
                };
            });

            return {
                success: true,
                connections: formattedConnections,
                totalConnections: formattedConnections.length
            };
        } catch (error) {
            console.error('Error getting user connections:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    // ===== USER PORTFOLIO MANAGEMENT =====

    async addPortfolioItem(userId, portfolioData) {
        try {
            const { title, summary, fileId, externalUrl, taskId, buzEarned, impactScore } = portfolioData;

            if (!title) {
                return {
                    success: false,
                    message: 'Title is required for portfolio item'
                };
            }

            const portfolioItem = await prisma.portfolioItem.create({
                data: {
                    userId,
                    title,
                    summary: summary || null,
                    fileId: fileId || null,
                    externalUrl: externalUrl || null,
                    taskId: taskId || null,
                    buzEarned: buzEarned || 0,
                    impactScore: impactScore || 0,
                    isPublic: true
                }
            });

            // Update user portfolio metrics
            await this.updateUserPortfolioMetrics(userId);

            // Log portfolio addition
            await this.logUserActivity(userId, 'PORTFOLIO_ITEM_ADDED', 'portfolio', {
                portfolioItemId: portfolioItem.id,
                title: portfolioItem.title,
                buzEarned: portfolioItem.buzEarned,
                timestamp: new Date().toISOString()
            });

            return {
                success: true,
                portfolioItem
            };
        } catch (error) {
            console.error('Error adding portfolio item:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    async updateUserPortfolioMetrics(userId) {
        try {
            // Get portfolio summary
            const portfolioSummary = await prisma.portfolioItem.aggregate({
                where: { userId },
                _sum: {
                    buzEarned: true,
                    impactScore: true
                },
                _count: true
            });

            // Update user metrics
            await prisma.user.update({
                where: { id: userId },
                data: {
                    totalPortfolioValue: portfolioSummary._sum.buzEarned || 0,
                    lastActive: new Date()
                }
            });

            return {
                success: true,
                metrics: {
                    totalPortfolioValue: portfolioSummary._sum.buzEarned || 0,
                    averageImpactScore: portfolioSummary._count > 0 ? 
                        (portfolioSummary._sum.impactScore || 0) / portfolioSummary._count : 0,
                    totalItems: portfolioSummary._count
                }
            };
        } catch (error) {
            console.error('Error updating portfolio metrics:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    // ===== USER SKILLS & ENDORSEMENTS =====

    async addUserSkill(userId, skillData) {
        try {
            const { skillName, level, verified } = skillData;

            if (!skillName || !level) {
                return {
                    success: false,
                    message: 'Skill name and level are required'
                };
            }

            // Find or create skill
            let skill = await prisma.skill.findUnique({
                where: { name: skillName }
            });

            if (!skill) {
                skill = await prisma.skill.create({
                    data: {
                        name: skillName,
                        category: 'Custom',
                        description: `User-defined skill: ${skillName}`,
                        demand: 3,
                        complexity: level
                    }
                });
            }

            // Create or update user skill
            const userSkill = await prisma.userSkill.upsert({
                where: {
                    userId_skillId: {
                        userId,
                        skillId: skill.id
                    }
                },
                update: {
                    level,
                    verified: verified || false
                },
                create: {
                    userId,
                    skillId: skill.id,
                    level,
                    verified: verified || false
                }
            });

            // Log skill addition
            await this.logUserActivity(userId, 'SKILL_ADDED', 'skill', {
                skillName: skill.name,
                level: userSkill.level,
                verified: userSkill.verified,
                timestamp: new Date().toISOString()
            });

            return {
                success: true,
                userSkill: {
                    ...userSkill,
                    skill: {
                        name: skill.name,
                        category: skill.category,
                        demand: skill.demand,
                        complexity: skill.complexity
                    }
                }
            };
        } catch (error) {
            console.error('Error adding user skill:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    // ===== USER ACTIVITY & ANALYTICS =====

    async logUserActivity(userId, type, entityType, data) {
        try {
            const activity = await prisma.userActivity.create({
                data: {
                    userId,
                    type,
                    entityType,
                    data,
                    createdAt: new Date()
                }
            });

            return {
                success: true,
                activity
            };
        } catch (error) {
            console.error('Error logging user activity:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    async getUserAnalytics(userId) {
        try {
            // Get user stats
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: {
                    userProfile: true,
                    portfolio: true,
                    userSkills: true,
                    userBadges: true,
                    activityLog: {
                        take: 100,
                        orderBy: { createdAt: 'desc' }
                    }
                }
            });

            if (!user) {
                return {
                    success: false,
                    message: 'User not found'
                };
            }

            // Calculate analytics
            const portfolioValue = user.portfolio.reduce((sum, item) => sum + (item.buzEarned || 0), 0);
            const averageImpactScore = user.portfolio.length > 0 ? 
                user.portfolio.reduce((sum, item) => sum + (item.impactScore || 0), 0) / user.portfolio.length : 0;
            
            const verifiedSkills = user.userSkills.filter(skill => skill.verified).length;
            const totalSkills = user.userSkills.length;
            
            const totalBadges = user.userBadges.length;
            const recentActivity = user.activityLog.slice(0, 10);

            // Calculate growth trends
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            const recentActivityCount = user.activityLog.filter(activity => 
                activity.createdAt >= thirtyDaysAgo
            ).length;

            return {
                success: true,
                analytics: {
                    // Portfolio metrics
                    portfolioValue,
                    portfolioItems: user.portfolio.length,
                    averageImpactScore: Math.round(averageImpactScore * 100) / 100,
                    
                    // Skills metrics
                    totalSkills,
                    verifiedSkills,
                    verificationRate: totalSkills > 0 ? Math.round((verifiedSkills / totalSkills) * 100) : 0,
                    
                    // Achievement metrics
                    totalBadges,
                    level: user.level,
                    xp: user.xp,
                    reputation: user.reputation,
                    
                    // Activity metrics
                    recentActivityCount,
                    totalActivity: user.activityLog.length,
                    recentActivity: recentActivity.map(activity => ({
                        type: activity.type,
                        entityType: activity.entityType,
                        createdAt: activity.createdAt
                    }))
                }
            };
        } catch (error) {
            console.error('Error getting user analytics:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    // ===== USER SETTINGS & PREFERENCES =====

    async getUserSettings(userId) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: {
                    userProfile: true,
                    profilePrivacy: true
                }
            });

            if (!user) {
                return {
                    success: false,
                    message: 'User not found'
                };
            }

            const settings = {
                profile: user.userProfile || {},
                privacy: user.profilePrivacy || {},
                preferences: {
                    theme: user.userProfile?.theme || 'auto',
                    language: 'en',
                    timezone: 'UTC',
                    currency: 'USD'
                }
            };

            return {
                success: true,
                settings
            };
        } catch (error) {
            console.error('Error getting user settings:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    async updateUserSettings(userId, settingsData) {
        try {
            const updates = [];

            // Update profile if provided
            if (settingsData.profile) {
                const profileUpdate = await this.updateUserProfile(userId, settingsData.profile);
                if (profileUpdate.success) updates.push('profile');
            }

            // Update privacy if provided
            if (settingsData.privacy) {
                const privacyUpdate = await this.updatePrivacySettings(userId, settingsData.privacy);
                if (privacyUpdate.success) updates.push('privacy');
            }

            if (updates.length === 0) {
                return {
                    success: false,
                    message: 'No valid settings to update'
                };
            }

            return {
                success: true,
                message: `Updated: ${updates.join(', ')}`,
                updatedSections: updates
            };
        } catch (error) {
            console.error('Error updating user settings:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    // ===== USER SEARCH & DISCOVERY =====

    async searchUsers(searchParams) {
        try {
            const { query, skills, level, location, limit = 20, offset = 0 } = searchParams;

            let whereClause = {
                status: 'ACTIVE'
            };

            // Add search filters
            if (query) {
                whereClause.OR = [
                    { name: { contains: query, mode: 'insensitive' } },
                    { email: { contains: query, mode: 'insensitive' } }
                ];
            }

            if (level) {
                whereClause.level = level;
            }

            if (location) {
                whereClause.userProfile = {
                    location: { contains: location, mode: 'insensitive' }
                };
            }

            const users = await prisma.user.findMany({
                where: whereClause,
                include: {
                    userProfile: {
                        select: {
                            nickname: true,
                            bio: true,
                            location: true,
                            level: true
                        }
                    },
                    userSkills: {
                        include: {
                            skill: {
                                select: {
                                    name: true,
                                    category: true
                                }
                            }
                        }
                    }
                },
                take: parseInt(limit),
                skip: parseInt(offset),
                orderBy: { reputation: 'desc' }
            });

            // Filter by skills if specified
            let filteredUsers = users;
            if (skills && skills.length > 0) {
                filteredUsers = users.filter(user => 
                    skills.some(skill => 
                        user.userSkills.some(userSkill => 
                            userSkill.skill.name.toLowerCase().includes(skill.toLowerCase())
                        )
                    )
                );
            }

            const totalUsers = await prisma.user.count({ where: whereClause });

            return {
                success: true,
                users: filteredUsers,
                pagination: {
                    total: totalUsers,
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    hasMore: offset + filteredUsers.length < totalUsers
                }
            };
        } catch (error) {
            console.error('Error searching users:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }
}

module.exports = UserManagementService;
