/**
 * SmartStart Opportunities Service
 * Comprehensive service for managing collaboration opportunities
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class OpportunitiesService {
    constructor() {
        this.defaultFilters = {
            page: 1,
            limit: 20,
            status: 'ACTIVE',
            visibilityLevel: 'PUBLIC'
        };
    }

    // ===== OPPORTUNITY CRUD OPERATIONS =====

    /**
     * Create a new opportunity
     */
    async createOpportunity(opportunityData, creatorId) {
        try {
            // Validate required fields
            const requiredFields = ['title', 'description', 'type', 'collaborationType', 'requiredSkills', 'compensationType'];
            for (const field of requiredFields) {
                if (!opportunityData[field]) {
                    throw new Error(`${field} is required`);
                }
            }

            // Create opportunity
            const opportunity = await prisma.opportunity.create({
                data: {
                    ...opportunityData,
                    createdBy: creatorId,
                    requiredSkills: opportunityData.requiredSkills || [],
                    preferredSkills: opportunityData.preferredSkills || [],
                    targetAudience: opportunityData.targetAudience || [],
                    tags: opportunityData.tags || []
                },
                include: {
                    creator: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            level: true
                        }
                    },
                    venture: {
                        select: {
                            id: true,
                            name: true,
                            createdAt: true
                        }
                    },
                    project: {
                        select: {
                            id: true,
                            name: true,
                            createdAt: true
                        }
                    }
                }
            });

            // Auto-generate legal documents if required
            if (opportunity.requiresNDA) {
                await this.autoGenerateLegalDocuments(opportunity.id, opportunity.legalLevel);
            }

            // Create initial analytics record
            await prisma.opportunityAnalytics.create({
                data: {
                    opportunityId: opportunity.id,
                    views: 0,
                    applications: 0,
                    matches: 0,
                    conversions: 0
                }
            });

            return {
                success: true,
                data: opportunity,
                message: 'Opportunity created successfully'
            };
        } catch (error) {
            console.error('Error creating opportunity:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    /**
     * Get opportunities with filtering and pagination
     */
    async getOpportunities(filters = {}, userId = null) {
        try {
            const {
                page = 1,
                limit = 20,
                type,
                status = 'ACTIVE',
                ventureId,
                location,
                skills = [],
                remote,
                compensation,
                search,
                visibilityLevel = 'PUBLIC',
                includeUmbrellaNetwork = true
            } = filters;

            // Build where clause
            const where = {
                status: status
            };

            // Handle visibility based on user level and umbrella network
            if (userId && includeUmbrellaNetwork) {
                const userLevel = await this.getUserLevel(userId);
                const umbrellaNetwork = await this.getUmbrellaNetwork(userId);
                
                // Build visibility conditions
                const visibilityConditions = [];
                
                // Public opportunities
                visibilityConditions.push({ visibilityLevel: 'PUBLIC' });
                
                // Member-only opportunities
                if (['MEMBER', 'SUBSCRIBER', 'SEAT_HOLDER', 'VENTURE_OWNER', 'VENTURE_PARTICIPANT', 'ADMIN'].includes(userLevel)) {
                    visibilityConditions.push({ visibilityLevel: 'MEMBER_ONLY' });
                }
                
                // Subscriber-only opportunities
                if (['SUBSCRIBER', 'SEAT_HOLDER', 'VENTURE_OWNER', 'VENTURE_PARTICIPANT', 'ADMIN'].includes(userLevel)) {
                    visibilityConditions.push({ visibilityLevel: 'SUBSCRIBER_ONLY' });
                }
                
                // Venture-only opportunities (from user's ventures or umbrella network)
                const ventureIds = await this.getUserVentureIds(userId);
                const umbrellaVentureIds = await this.getUmbrellaVentureIds(umbrellaNetwork);
                const allVentureIds = [...ventureIds, ...umbrellaVentureIds];
                
                if (allVentureIds.length > 0) {
                    visibilityConditions.push({
                        AND: [
                            { visibilityLevel: 'VENTURE_ONLY' },
                            { ventureId: { in: allVentureIds } }
                        ]
                    });
                }
                
                // Private opportunities (user's own)
                visibilityConditions.push({
                    AND: [
                        { visibilityLevel: 'PRIVATE' },
                        { createdBy: userId }
                    ]
                });
                
                where.OR = visibilityConditions;
            } else {
                // Default to public only if no user or umbrella network disabled
                where.visibilityLevel = visibilityLevel;
            }

            // Add filters
            if (type) where.type = type;
            if (ventureId) where.ventureId = ventureId;
            if (location) where.location = { contains: location, mode: 'insensitive' };
            if (remote !== undefined) where.isRemote = remote;
            if (compensation) where.compensationType = compensation;

            // Search in title and description
            if (search) {
                where.OR = [
                    { title: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } }
                ];
            }

            // Skills filter
            if (skills.length > 0) {
                where.requiredSkills = {
                    hasSome: skills
                };
            }

            // Calculate pagination
            const skip = (page - 1) * limit;

            // Get opportunities
            const [opportunities, total] = await Promise.all([
                prisma.opportunity.findMany({
                    where,
                    skip,
                    take: limit,
                    include: {
                        creator: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                level: true
                            }
                        },
                        venture: {
                            select: {
                                id: true,
                                name: true,
                                createdAt: true
                            }
                        },
                    project: {
                        select: {
                            id: true,
                            name: true,
                            createdAt: true
                        }
                    },
                        _count: {
                            select: {
                                applications: true,
                                matches: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                }),
                prisma.opportunity.count({ where })
            ]);

            return {
                success: true,
                data: {
                    opportunities,
                    pagination: {
                        page,
                        limit,
                        total,
                        pages: Math.ceil(total / limit)
                    }
                }
            };
        } catch (error) {
            console.error('Error getting opportunities:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    /**
     * Get opportunity by ID
     */
    async getOpportunityById(id, userId = null) {
        try {
            const opportunity = await prisma.opportunity.findUnique({
                where: { id },
                include: {
                    creator: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            level: true
                        }
                    },
                    venture: {
                        select: {
                            id: true,
                            name: true,
                            createdAt: true
                        }
                    },
                    project: {
                        select: {
                            id: true,
                            name: true,
                            createdAt: true
                        }
                    },
                    applications: {
                        include: {
                            applicant: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    level: true
                                }
                            }
                        }
                    },
                    matches: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    level: true
                                }
                            }
                        }
                    },
                    legalDocuments: {
                        include: {
                            document: {
                                select: {
                                    id: true,
                                    title: true,
                                    type: true,
                                    createdAt: true
                                }
                            }
                        }
                    },
                    analytics: {
                        orderBy: { date: 'desc' },
                        take: 30
                    }
                }
            });

            if (!opportunity) {
                return {
                    success: false,
                    message: 'Opportunity not found'
                };
            }

            // Increment view count
            await this.incrementViewCount(id);

            return {
                success: true,
                data: opportunity
            };
        } catch (error) {
            console.error('Error getting opportunity:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    /**
     * Update opportunity
     */
    async updateOpportunity(id, updateData, userId) {
        try {
            // Check if user is the creator
            const opportunity = await prisma.opportunity.findUnique({
                where: { id },
                select: { createdBy: true }
            });

            if (!opportunity) {
                return {
                    success: false,
                    message: 'Opportunity not found'
                };
            }

            if (opportunity.createdBy !== userId) {
                return {
                    success: false,
                    message: 'Unauthorized: Only the creator can update this opportunity'
                };
            }

            const updatedOpportunity = await prisma.opportunity.update({
                where: { id },
                data: {
                    ...updateData,
                    updatedAt: new Date()
                },
                include: {
                    creator: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            level: true
                        }
                    },
                    venture: {
                        select: {
                            id: true,
                            name: true,
                            createdAt: true
                        }
                    },
                    project: {
                        select: {
                            id: true,
                            name: true,
                            createdAt: true
                        }
                    }
                }
            });

            return {
                success: true,
                data: updatedOpportunity,
                message: 'Opportunity updated successfully'
            };
        } catch (error) {
            console.error('Error updating opportunity:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    /**
     * Delete opportunity
     */
    async deleteOpportunity(id, userId) {
        try {
            // Check if user is the creator
            const opportunity = await prisma.opportunity.findUnique({
                where: { id },
                select: { createdBy: true }
            });

            if (!opportunity) {
                return {
                    success: false,
                    message: 'Opportunity not found'
                };
            }

            if (opportunity.createdBy !== userId) {
                return {
                    success: false,
                    message: 'Unauthorized: Only the creator can delete this opportunity'
                };
            }

            await prisma.opportunity.delete({
                where: { id }
            });

            return {
                success: true,
                message: 'Opportunity deleted successfully'
            };
        } catch (error) {
            console.error('Error deleting opportunity:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    // ===== APPLICATION MANAGEMENT =====

    /**
     * Apply to an opportunity
     */
    async applyToOpportunity(opportunityId, applicationData, applicantId) {
        try {
            // Check if opportunity exists and is active
            const opportunity = await prisma.opportunity.findUnique({
                where: { id: opportunityId },
                select: { 
                    id: true, 
                    status: true, 
                    requiresNDA: true,
                    legalLevel: true
                }
            });

            if (!opportunity) {
                return {
                    success: false,
                    message: 'Opportunity not found'
                };
            }

            if (opportunity.status !== 'ACTIVE') {
                return {
                    success: false,
                    message: 'This opportunity is not currently accepting applications'
                };
            }

            // Check if user already applied
            const existingApplication = await prisma.opportunityApplication.findUnique({
                where: {
                    opportunityId_applicantId: {
                        opportunityId,
                        applicantId
                    }
                }
            });

            if (existingApplication) {
                return {
                    success: false,
                    message: 'You have already applied to this opportunity'
                };
            }

            // Get user's legal level
            const user = await prisma.user.findUnique({
                where: { id: applicantId },
                select: { level: true }
            });

            if (!user) {
                return {
                    success: false,
                    message: 'User not found'
                };
            }

            // Create application
            const application = await prisma.opportunityApplication.create({
                data: {
                    opportunityId,
                    applicantId,
                    coverLetter: applicationData.coverLetter,
                    relevantSkills: applicationData.relevantSkills || [],
                    experience: applicationData.experience,
                    availability: applicationData.availability,
                    motivation: applicationData.motivation,
                    legalLevel: user.level,
                    ndaAccepted: applicationData.ndaAccepted || false,
                    complianceMet: this.checkLegalCompliance(user.level, opportunity.legalLevel)
                },
                include: {
                    applicant: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            level: true
                        }
                    },
                    opportunity: {
                        select: {
                            id: true,
                            title: true,
                            type: true
                        }
                    }
                }
            });

            // Update analytics
            await this.incrementApplicationCount(opportunityId);

            return {
                success: true,
                data: application,
                message: 'Application submitted successfully'
            };
        } catch (error) {
            console.error('Error applying to opportunity:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    /**
     * Get applications for an opportunity (creator only)
     */
    async getOpportunityApplications(opportunityId, userId) {
        try {
            // Check if user is the creator
            const opportunity = await prisma.opportunity.findUnique({
                where: { id: opportunityId },
                select: { createdBy: true }
            });

            if (!opportunity) {
                return {
                    success: false,
                    message: 'Opportunity not found'
                };
            }

            if (opportunity.createdBy !== userId) {
                return {
                    success: false,
                    message: 'Unauthorized: Only the creator can view applications'
                };
            }

            const applications = await prisma.opportunityApplication.findMany({
                where: { opportunityId },
                include: {
                    applicant: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            level: true
                        }
                    }
                },
                orderBy: { appliedAt: 'desc' }
            });

            return {
                success: true,
                data: applications
            };
        } catch (error) {
            console.error('Error getting applications:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    // ===== MATCHING SYSTEM =====

    /**
     * Generate matches for an opportunity
     */
    async generateMatches(opportunityId) {
        try {
            const opportunity = await prisma.opportunity.findUnique({
                where: { id: opportunityId },
                select: {
                    id: true,
                    requiredSkills: true,
                    preferredSkills: true,
                    location: true,
                    isRemote: true,
                    legalLevel: true,
                    type: true
                }
            });

            if (!opportunity) {
                return {
                    success: false,
                    message: 'Opportunity not found'
                };
            }

            // Find potential matches
            const potentialMatches = await this.findPotentialMatches(opportunity);

            // Calculate match scores
            const matches = [];
            for (const user of potentialMatches) {
                const matchScore = await this.calculateMatchScore(opportunity, user);
                
                if (matchScore.overall > 0.3) { // Only include matches with score > 30%
                    matches.push({
                        opportunityId,
                        userId: user.id,
                        matchScore: matchScore.overall,
                        matchReasons: matchScore.reasons,
                        skillMatch: matchScore.skillMatch,
                        experienceMatch: matchScore.experienceMatch,
                        locationMatch: matchScore.locationMatch,
                        timeMatch: matchScore.timeMatch,
                        legalMatch: matchScore.legalMatch
                    });
                }
            }

            // Sort by match score
            matches.sort((a, b) => b.matchScore - a.matchScore);

            // Create match records
            const createdMatches = [];
            for (const match of matches.slice(0, 10)) { // Top 10 matches
                const createdMatch = await prisma.opportunityMatch.upsert({
                    where: {
                        opportunityId_userId: {
                            opportunityId,
                            userId: match.userId
                        }
                    },
                    update: match,
                    create: match
                });
                createdMatches.push(createdMatch);
            }

            return {
                success: true,
                data: createdMatches,
                message: `Generated ${createdMatches.length} matches`
            };
        } catch (error) {
            console.error('Error generating matches:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    // ===== ANALYTICS =====

    /**
     * Get opportunity analytics
     */
    async getOpportunityAnalytics(opportunityId, userId) {
        try {
            // Check if user is the creator
            const opportunity = await prisma.opportunity.findUnique({
                where: { id: opportunityId },
                select: { createdBy: true }
            });

            if (!opportunity) {
                return {
                    success: false,
                    message: 'Opportunity not found'
                };
            }

            if (opportunity.createdBy !== userId) {
                return {
                    success: false,
                    message: 'Unauthorized: Only the creator can view analytics'
                };
            }

            const analytics = await prisma.opportunityAnalytics.findMany({
                where: { opportunityId },
                orderBy: { date: 'desc' },
                take: 30
            });

            // Calculate summary
            const summary = analytics.reduce((acc, day) => {
                acc.totalViews += day.views;
                acc.totalApplications += day.applications;
                acc.totalMatches += day.matches;
                acc.totalConversions += day.conversions;
                return acc;
            }, {
                totalViews: 0,
                totalApplications: 0,
                totalMatches: 0,
                totalConversions: 0
            });

            summary.conversionRate = summary.totalApplications > 0 
                ? (summary.totalConversions / summary.totalApplications) * 100 
                : 0;

            return {
                success: true,
                data: {
                    analytics,
                    summary
                }
            };
        } catch (error) {
            console.error('Error getting analytics:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    // ===== HELPER METHODS =====

    /**
     * Get user level for RBAC
     */
    async getUserLevel(userId) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { level: true }
            });
            return user ? user.level : 'GUEST';
        } catch (error) {
            console.error('Error getting user level:', error);
            return 'GUEST';
        }
    }

    /**
     * Get user's umbrella network (referrers and referrals)
     */
    async getUmbrellaNetwork(userId) {
        try {
            const [referrers, referrals] = await Promise.all([
                // Get users who referred this user
                prisma.umbrellaRelationship.findMany({
                    where: { referredId: userId, status: 'ACTIVE' },
                    select: { referrerId: true }
                }),
                // Get users referred by this user
                prisma.umbrellaRelationship.findMany({
                    where: { referrerId: userId, status: 'ACTIVE' },
                    select: { referredId: true }
                })
            ]);

            const networkUserIds = [
                ...referrers.map(r => r.referrerId),
                ...referrals.map(r => r.referredId)
            ];

            return [...new Set(networkUserIds)]; // Remove duplicates
        } catch (error) {
            console.error('Error getting umbrella network:', error);
            return [];
        }
    }

    /**
     * Get venture IDs owned by user
     */
    async getUserVentureIds(userId) {
        try {
            const ventures = await prisma.venture.findMany({
                where: { ownerUserId: userId },
                select: { id: true }
            });
            return ventures.map(v => v.id);
        } catch (error) {
            console.error('Error getting user venture IDs:', error);
            return [];
        }
    }

    /**
     * Get venture IDs from umbrella network
     */
    async getUmbrellaVentureIds(networkUserIds) {
        try {
            if (networkUserIds.length === 0) return [];

            const ventures = await prisma.venture.findMany({
                where: { 
                    ownerUserId: { in: networkUserIds },
                    status: { in: ['ACTIVE', 'PENDING_CONTRACTS'] }
                },
                select: { id: true }
            });
            return ventures.map(v => v.id);
        } catch (error) {
            console.error('Error getting umbrella venture IDs:', error);
            return [];
        }
    }

    /**
     * Auto-generate legal documents for opportunity
     */
    async autoGenerateLegalDocuments(opportunityId, legalLevel) {
        try {
            // This would integrate with the legal document service
            // For now, we'll create a placeholder
            console.log(`Auto-generating legal documents for opportunity ${opportunityId} with level ${legalLevel}`);
            return true;
        } catch (error) {
            console.error('Error auto-generating legal documents:', error);
            return false;
        }
    }

    /**
     * Check legal compliance
     */
    checkLegalCompliance(userLevel, requiredLevel) {
        const levelHierarchy = {
            'GUEST': 0,
            'MEMBER': 1,
            'SUBSCRIBER': 2,
            'SEAT_HOLDER': 3,
            'VENTURE_OWNER': 4,
            'VENTURE_PARTICIPANT': 5,
            'CONFIDENTIAL_ACCESS': 6,
            'RESTRICTED_ACCESS': 7,
            'HIGHLY_RESTRICTED_ACCESS': 8,
            'BILLING_ADMIN': 9,
            'SECURITY_ADMIN': 10,
            'LEGAL_ADMIN': 11
        };

        const userLevelNum = levelHierarchy[userLevel] || 0;
        const requiredLevelNum = levelHierarchy[requiredLevel] || 0;

        return userLevelNum >= requiredLevelNum;
    }

    /**
     * Find potential matches
     */
    async findPotentialMatches(opportunity) {
        // This would implement sophisticated matching logic
        // For now, return a simple query
        return await prisma.user.findMany({
            where: {
                status: 'ACTIVE',
                level: {
                    gte: opportunity.legalLevel
                }
            },
            select: {
                id: true,
                name: true,
                email: true,
                level: true
            },
            take: 50
        });
    }

    /**
     * Calculate match score
     */
    async calculateMatchScore(opportunity, user) {
        // This would implement sophisticated scoring algorithm
        // For now, return a simple score
        const skillMatch = 0.7; // Would calculate based on skills
        const experienceMatch = 0.6; // Would calculate based on experience
        const locationMatch = 0.8; // Would calculate based on location
        const timeMatch = 0.9; // Would calculate based on availability
        const legalMatch = 1.0; // Already filtered by legal level

        const overall = (skillMatch + experienceMatch + locationMatch + timeMatch + legalMatch) / 5;

        return {
            overall,
            skillMatch,
            experienceMatch,
            locationMatch,
            timeMatch,
            legalMatch,
            reasons: ['Skills match', 'Experience relevant', 'Location compatible']
        };
    }

    /**
     * Increment view count
     */
    async incrementViewCount(opportunityId) {
        try {
            await prisma.opportunityAnalytics.upsert({
                where: {
                    opportunityId_date: {
                        opportunityId,
                        date: new Date().toISOString().split('T')[0]
                    }
                },
                update: {
                    views: { increment: 1 }
                },
                create: {
                    opportunityId,
                    views: 1,
                    applications: 0,
                    matches: 0,
                    conversions: 0
                }
            });
        } catch (error) {
            console.error('Error incrementing view count:', error);
        }
    }

    /**
     * Increment application count
     */
    async incrementApplicationCount(opportunityId) {
        try {
            await prisma.opportunityAnalytics.upsert({
                where: {
                    opportunityId_date: {
                        opportunityId,
                        date: new Date().toISOString().split('T')[0]
                    }
                },
                update: {
                    applications: { increment: 1 }
                },
                create: {
                    opportunityId,
                    views: 0,
                    applications: 1,
                    matches: 0,
                    conversions: 0
                }
            });
        } catch (error) {
            console.error('Error incrementing application count:', error);
        }
    }
}

module.exports = new OpportunitiesService();
