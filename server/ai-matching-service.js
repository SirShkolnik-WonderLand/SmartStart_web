#!/usr/bin/env node

/**
 * SmartStart AI Matching Service
 * AI-powered matching and recommendation engine
 */

const eventSystem = require('./event-system');
const messageQueue = require('./message-queue');
const { PrismaClient } = require('@prisma/client');

class SmartStartAIMatchingService {
    constructor(options = {}) {
        this.prisma = new PrismaClient();
        this.userProfiles = new Map();
        this.ventureProfiles = new Map();
        this.teamProfiles = new Map();
        this.opportunityProfiles = new Map();
        this.matchingCache = new Map();
        this.recommendationCache = new Map();
        this.cacheTimeout = options.cacheTimeout || 300000; // 5 minutes
        this.batchSize = options.batchSize || 100;
        this.processInterval = options.processInterval || 60000; // 1 minute

        this.setupEventHandlers();
        this.startMatchingProcessor();
        this.loadProfiles();
    }

    setupEventHandlers() {
        // Listen for profile changes to trigger re-matching
        const eventTypes = [
            'user.updated', 'user.profile.updated',
            'venture.updated', 'venture.created',
            'team.updated', 'team.created',
            'opportunity.updated', 'opportunity.created',
            'application.created', 'application.updated',
            'match.created', 'match.updated'
        ];

        eventTypes.forEach(eventType => {
            eventSystem.subscribe(eventType, this.handleProfileChange.bind(this));
        });
    }

    startMatchingProcessor() {
        // Process matching every minute
        setInterval(() => {
            this.processMatchingQueue();
        }, this.processInterval);

        console.log('🤖 AI Matching service started');
    }

    async handleProfileChange(event) {
        try {
            const { type, data } = event;

            switch (type) {
                case 'user.updated':
                case 'user.profile.updated':
                    await this.updateUserProfile(data.userId);
                    break;
                case 'venture.updated':
                case 'venture.created':
                    await this.updateVentureProfile(data.ventureId);
                    break;
                case 'team.updated':
                case 'team.created':
                    await this.updateTeamProfile(data.teamId);
                    break;
                case 'opportunity.updated':
                case 'opportunity.created':
                    await this.updateOpportunityProfile(data.opportunityId);
                    break;
            }

            // Clear relevant caches
            this.clearMatchingCache();
        } catch (error) {
            console.error('❌ Error handling profile change:', error);
        }
    }

    async loadProfiles() {
        try {
            await Promise.all([
                this.loadUserProfiles(),
                this.loadVentureProfiles(),
                this.loadTeamProfiles(),
                this.loadOpportunityProfiles()
            ]);
            console.log('🤖 AI profiles loaded successfully');
        } catch (error) {
            console.error('❌ Error loading profiles:', error);
        }
    }

    async loadUserProfiles() {
        try {
            const users = await this.prisma.user.findMany({
                include: {
                    userProfile: true,
                    userConnections: true,
                    ventures: true,
                    teams: true
                }
            });

            users.forEach(user => {
                this.userProfiles.set(user.id, this.createUserProfile(user));
            });
        } catch (error) {
            console.error('❌ Error loading user profiles:', error);
        }
    }

    async loadVentureProfiles() {
        try {
            const ventures = await this.prisma.venture.findMany({
                include: {
                    ventureMembers: true,
                    ventureDocuments: true,
                    ventureMilestones: true
                }
            });

            ventures.forEach(venture => {
                this.ventureProfiles.set(venture.id, this.createVentureProfile(venture));
            });
        } catch (error) {
            console.error('❌ Error loading venture profiles:', error);
        }
    }

    async loadTeamProfiles() {
        try {
            const teams = await this.prisma.team.findMany({
                include: {
                    teamMembers: true,
                    teamGoals: true,
                    teamProjects: true
                }
            });

            teams.forEach(team => {
                this.teamProfiles.set(team.id, this.createTeamProfile(team));
            });
        } catch (error) {
            console.error('❌ Error loading team profiles:', error);
        }
    }

    async loadOpportunityProfiles() {
        try {
            // This would load from opportunities table
            // For now, create mock profiles
            const opportunities = [{
                id: 'opp-1',
                title: 'Frontend Developer',
                description: 'React/Next.js developer needed',
                skills: ['React', 'TypeScript', 'Next.js'],
                location: 'Remote',
                type: 'FULL_TIME'
            }];

            opportunities.forEach(opp => {
                this.opportunityProfiles.set(opp.id, this.createOpportunityProfile(opp));
            });
        } catch (error) {
            console.error('❌ Error loading opportunity profiles:', error);
        }
    }

    createUserProfile(user) {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            skills: this.extractSkills(user),
            interests: this.extractInterests(user),
            experience: this.calculateExperience(user),
            location: user.userProfile ? .location || 'Unknown',
            availability: user.userProfile ? .availability || 'Unknown',
            preferences: this.extractPreferences(user),
            connections: user.userConnections ? .length || 0,
            ventures: user.ventures ? .length || 0,
            teams: user.teams ? .length || 0,
            lastActivity: user.updatedAt,
            profileCompleteness: this.calculateProfileCompleteness(user)
        };
    }

    createVentureProfile(venture) {
        return {
            id: venture.id,
            name: venture.name,
            description: venture.description,
            stage: venture.stage,
            industry: this.extractIndustry(venture),
            skillsNeeded: this.extractSkillsNeeded(venture),
            teamSize: venture.ventureMembers ? .length || 0,
            funding: this.extractFunding(venture),
            location: venture.location || 'Unknown',
            timeline: this.extractTimeline(venture),
            milestones: venture.ventureMilestones ? .length || 0,
            documents: venture.ventureDocuments ? .length || 0,
            lastActivity: venture.updatedAt
        };
    }

    createTeamProfile(team) {
        return {
            id: team.id,
            name: team.name,
            description: team.description,
            skills: this.extractTeamSkills(team),
            goals: team.teamGoals ? .length || 0,
            projects: team.teamProjects ? .length || 0,
            size: team.teamMembers ? .length || 0,
            collaborationStyle: this.extractCollaborationStyle(team),
            lastActivity: team.updatedAt
        };
    }

    createOpportunityProfile(opportunity) {
        return {
            id: opportunity.id,
            title: opportunity.title,
            description: opportunity.description,
            skills: opportunity.skills || [],
            location: opportunity.location,
            type: opportunity.type,
            requirements: this.extractRequirements(opportunity),
            benefits: this.extractBenefits(opportunity),
            lastActivity: new Date()
        };
    }

    extractSkills(user) {
        // Extract skills from user profile, experience, etc.
        const skills = [];

        if (user.userProfile ? .skills) {
            skills.push(...user.userProfile.skills);
        }

        // Add skills from ventures
        if (user.ventures) {
            user.ventures.forEach(venture => {
                if (venture.skills) {
                    skills.push(...venture.skills);
                }
            });
        }

        return [...new Set(skills)]; // Remove duplicates
    }

    extractInterests(user) {
        // Extract interests from user profile
        return user.userProfile ? .interests || [];
    }

    calculateExperience(user) {
        // Calculate years of experience
        const startDate = user.userProfile ? .experienceStartDate;
        if (startDate) {
            const years = (new Date() - new Date(startDate)) / (1000 * 60 * 60 * 24 * 365);
            return Math.floor(years);
        }
        return 0;
    }

    extractPreferences(user) {
        return {
            workStyle: user.userProfile ? .workStyle || 'flexible',
            communication: user.userProfile ? .communication || 'email',
            timezone: user.userProfile ? .timezone || 'UTC',
            remote: user.userProfile ? .remote || true
        };
    }

    calculateProfileCompleteness(user) {
        let completeness = 0;
        const fields = [
            user.name, user.email, user.userProfile ? .bio,
            user.userProfile ? .skills, user.userProfile ? .location,
            user.userProfile ? .experience, user.userProfile ? .interests
        ];

        const filledFields = fields.filter(field => field && field.length > 0).length;
        return (filledFields / fields.length) * 100;
    }

    extractIndustry(venture) {
        return venture.industry || 'Technology';
    }

    extractSkillsNeeded(venture) {
        return venture.skillsNeeded || [];
    }

    extractFunding(venture) {
        return venture.funding || 0;
    }

    extractTimeline(venture) {
        return venture.timeline || '6 months';
    }

    extractTeamSkills(team) {
        const skills = [];
        if (team.teamMembers) {
            team.teamMembers.forEach(member => {
                if (member.skills) {
                    skills.push(...member.skills);
                }
            });
        }
        return [...new Set(skills)];
    }

    extractCollaborationStyle(team) {
        return team.collaborationStyle || 'agile';
    }

    extractRequirements(opportunity) {
        return opportunity.requirements || [];
    }

    extractBenefits(opportunity) {
        return opportunity.benefits || [];
    }

    // Matching Algorithms
    async findVentureMatches(userId) {
        try {
            const userProfile = this.userProfiles.get(userId);
            if (!userProfile) return [];

            const cacheKey = `venture_matches_${userId}`;
            const cached = this.matchingCache.get(cacheKey);
            if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.matches;
            }

            const matches = [];
            for (const [ventureId, ventureProfile] of this.ventureProfiles) {
                const score = this.calculateVentureMatchScore(userProfile, ventureProfile);
                if (score > 0.3) { // Threshold for relevant matches
                    matches.push({
                        ventureId,
                        ventureProfile,
                        score,
                        reasons: this.getVentureMatchReasons(userProfile, ventureProfile)
                    });
                }
            }

            // Sort by score descending
            matches.sort((a, b) => b.score - a.score);

            // Cache results
            this.matchingCache.set(cacheKey, {
                matches: matches.slice(0, 10), // Top 10 matches
                timestamp: Date.now()
            });

            return matches.slice(0, 10);
        } catch (error) {
            console.error('❌ Error finding venture matches:', error);
            return [];
        }
    }

    async findTeamMatches(userId) {
        try {
            const userProfile = this.userProfiles.get(userId);
            if (!userProfile) return [];

            const cacheKey = `team_matches_${userId}`;
            const cached = this.matchingCache.get(cacheKey);
            if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.matches;
            }

            const matches = [];
            for (const [teamId, teamProfile] of this.teamProfiles) {
                const score = this.calculateTeamMatchScore(userProfile, teamProfile);
                if (score > 0.3) {
                    matches.push({
                        teamId,
                        teamProfile,
                        score,
                        reasons: this.getTeamMatchReasons(userProfile, teamProfile)
                    });
                }
            }

            matches.sort((a, b) => b.score - a.score);

            this.matchingCache.set(cacheKey, {
                matches: matches.slice(0, 10),
                timestamp: Date.now()
            });

            return matches.slice(0, 10);
        } catch (error) {
            console.error('❌ Error finding team matches:', error);
            return [];
        }
    }

    async findOpportunityMatches(userId) {
        try {
            const userProfile = this.userProfiles.get(userId);
            if (!userProfile) return [];

            const cacheKey = `opportunity_matches_${userId}`;
            const cached = this.matchingCache.get(cacheKey);
            if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.matches;
            }

            const matches = [];
            for (const [oppId, oppProfile] of this.opportunityProfiles) {
                const score = this.calculateOpportunityMatchScore(userProfile, oppProfile);
                if (score > 0.3) {
                    matches.push({
                        opportunityId: oppId,
                        opportunityProfile: oppProfile,
                        score,
                        reasons: this.getOpportunityMatchReasons(userProfile, oppProfile)
                    });
                }
            }

            matches.sort((a, b) => b.score - a.score);

            this.matchingCache.set(cacheKey, {
                matches: matches.slice(0, 10),
                timestamp: Date.now()
            });

            return matches.slice(0, 10);
        } catch (error) {
            console.error('❌ Error finding opportunity matches:', error);
            return [];
        }
    }

    calculateVentureMatchScore(userProfile, ventureProfile) {
        let score = 0;
        let factors = 0;

        // Skills match (40% weight)
        const skillMatch = this.calculateSkillMatch(userProfile.skills, ventureProfile.skillsNeeded);
        score += skillMatch * 0.4;
        factors += 0.4;

        // Location match (20% weight)
        const locationMatch = this.calculateLocationMatch(userProfile.location, ventureProfile.location);
        score += locationMatch * 0.2;
        factors += 0.2;

        // Experience level (20% weight)
        const experienceMatch = this.calculateExperienceMatch(userProfile.experience, ventureProfile.stage);
        score += experienceMatch * 0.2;
        factors += 0.2;

        // Interests alignment (20% weight)
        const interestMatch = this.calculateInterestMatch(userProfile.interests, ventureProfile.industry);
        score += interestMatch * 0.2;
        factors += 0.2;

        return factors > 0 ? score / factors : 0;
    }

    calculateTeamMatchScore(userProfile, teamProfile) {
        let score = 0;
        let factors = 0;

        // Skills complementarity (50% weight)
        const skillComplement = this.calculateSkillComplement(userProfile.skills, teamProfile.skills);
        score += skillComplement * 0.5;
        factors += 0.5;

        // Collaboration style (30% weight)
        const collaborationMatch = this.calculateCollaborationMatch(userProfile.preferences, teamProfile.collaborationStyle);
        score += collaborationMatch * 0.3;
        factors += 0.3;

        // Team size preference (20% weight)
        const sizeMatch = this.calculateSizeMatch(userProfile.preferences, teamProfile.size);
        score += sizeMatch * 0.2;
        factors += 0.2;

        return factors > 0 ? score / factors : 0;
    }

    calculateOpportunityMatchScore(userProfile, oppProfile) {
        let score = 0;
        let factors = 0;

        // Skills match (60% weight)
        const skillMatch = this.calculateSkillMatch(userProfile.skills, oppProfile.skills);
        score += skillMatch * 0.6;
        factors += 0.6;

        // Location match (20% weight)
        const locationMatch = this.calculateLocationMatch(userProfile.location, oppProfile.location);
        score += locationMatch * 0.2;
        factors += 0.2;

        // Availability match (20% weight)
        const availabilityMatch = this.calculateAvailabilityMatch(userProfile.availability, oppProfile.type);
        score += availabilityMatch * 0.2;
        factors += 0.2;

        return factors > 0 ? score / factors : 0;
    }

    calculateSkillMatch(userSkills, requiredSkills) {
        if (!userSkills || !requiredSkills || requiredSkills.length === 0) return 0;

        const matchingSkills = userSkills.filter(skill =>
            requiredSkills.some(req => req.toLowerCase().includes(skill.toLowerCase()) ||
                skill.toLowerCase().includes(req.toLowerCase()))
        );

        return matchingSkills.length / requiredSkills.length;
    }

    calculateSkillComplement(userSkills, teamSkills) {
        if (!userSkills || !teamSkills) return 0;

        const uniqueSkills = [...new Set([...userSkills, ...teamSkills])];
        const userUniqueSkills = userSkills.filter(skill => !teamSkills.includes(skill));

        return userUniqueSkills.length / uniqueSkills.length;
    }

    calculateLocationMatch(userLocation, targetLocation) {
        if (!userLocation || !targetLocation) return 0;

        if (targetLocation.toLowerCase() === 'remote') return 1;
        if (userLocation.toLowerCase() === targetLocation.toLowerCase()) return 1;

        return 0.5; // Partial match for different locations
    }

    calculateExperienceMatch(userExperience, ventureStage) {
        const stageExperienceMap = {
            'idea': 0,
            'mvp': 1,
            'growth': 3,
            'scale': 5,
            'mature': 7
        };

        const requiredExperience = stageExperienceMap[ventureStage] || 0;
        return userExperience >= requiredExperience ? 1 : userExperience / Math.max(requiredExperience, 1);
    }

    calculateInterestMatch(userInterests, industry) {
        if (!userInterests || !industry) return 0;

        return userInterests.some(interest =>
            interest.toLowerCase().includes(industry.toLowerCase()) ||
            industry.toLowerCase().includes(interest.toLowerCase())
        ) ? 1 : 0.5;
    }

    calculateCollaborationMatch(userPreferences, teamStyle) {
        if (!userPreferences || !teamStyle) return 0.5;

        const userStyle = userPreferences.workStyle || 'flexible';
        return userStyle.toLowerCase() === teamStyle.toLowerCase() ? 1 : 0.7;
    }

    calculateSizeMatch(userPreferences, teamSize) {
        if (!userPreferences || teamSize === undefined) return 0.5;

        const preferredSize = userPreferences.teamSize || 'medium';
        const sizeRanges = {
            'small': [1, 3],
            'medium': [4, 8],
            'large': [9, 20]
        };

        const [min, max] = sizeRanges[preferredSize] || [4, 8];
        return teamSize >= min && teamSize <= max ? 1 : 0.5;
    }

    calculateAvailabilityMatch(userAvailability, oppType) {
        if (!userAvailability || !oppType) return 0.5;

        const availabilityMap = {
            'full-time': ['immediately available', 'available'],
            'part-time': ['immediately available', 'available', 'part-time'],
            'contract': ['immediately available', 'available', 'contract']
        };

        const compatibleTypes = availabilityMap[oppType.toLowerCase()] || [];
        return compatibleTypes.some(type =>
            userAvailability.toLowerCase().includes(type.toLowerCase())
        ) ? 1 : 0.3;
    }

    getVentureMatchReasons(userProfile, ventureProfile) {
        const reasons = [];

        const skillMatch = this.calculateSkillMatch(userProfile.skills, ventureProfile.skillsNeeded);
        if (skillMatch > 0.5) {
            reasons.push(`Strong skills match (${Math.round(skillMatch * 100)}%)`);
        }

        if (userProfile.location === ventureProfile.location) {
            reasons.push('Same location');
        }

        if (userProfile.experience >= 3 && ventureProfile.stage === 'growth') {
            reasons.push('Experience level matches venture stage');
        }

        return reasons;
    }

    getTeamMatchReasons(userProfile, teamProfile) {
        const reasons = [];

        const skillComplement = this.calculateSkillComplement(userProfile.skills, teamProfile.skills);
        if (skillComplement > 0.3) {
            reasons.push(`Skills complement team (${Math.round(skillComplement * 100)}%)`);
        }

        if (userProfile.preferences ? .workStyle === teamProfile.collaborationStyle) {
            reasons.push('Compatible work style');
        }

        return reasons;
    }

    getOpportunityMatchReasons(userProfile, oppProfile) {
        const reasons = [];

        const skillMatch = this.calculateSkillMatch(userProfile.skills, oppProfile.skills);
        if (skillMatch > 0.5) {
            reasons.push(`Skills match (${Math.round(skillMatch * 100)}%)`);
        }

        if (oppProfile.location === 'Remote' || userProfile.location === oppProfile.location) {
            reasons.push('Location compatible');
        }

        return reasons;
    }

    // Recommendations
    async getPersonalizedRecommendations(userId, type = 'all') {
        try {
            const cacheKey = `recommendations_${userId}_${type}`;
            const cached = this.recommendationCache.get(cacheKey);
            if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.recommendations;
            }

            const recommendations = {
                ventures: [],
                teams: [],
                opportunities: [],
                users: [],
                insights: []
            };

            if (type === 'all' || type === 'ventures') {
                recommendations.ventures = await this.findVentureMatches(userId);
            }

            if (type === 'all' || type === 'teams') {
                recommendations.teams = await this.findTeamMatches(userId);
            }

            if (type === 'all' || type === 'opportunities') {
                recommendations.opportunities = await this.findOpportunityMatches(userId);
            }

            if (type === 'all' || type === 'users') {
                recommendations.users = await this.findUserRecommendations(userId);
            }

            if (type === 'all' || type === 'insights') {
                recommendations.insights = await this.generateInsights(userId);
            }

            this.recommendationCache.set(cacheKey, {
                recommendations,
                timestamp: Date.now()
            });

            return recommendations;
        } catch (error) {
            console.error('❌ Error getting personalized recommendations:', error);
            return { ventures: [], teams: [], opportunities: [], users: [], insights: [] };
        }
    }

    async findUserRecommendations(userId) {
        try {
            const userProfile = this.userProfiles.get(userId);
            if (!userProfile) return [];

            const recommendations = [];
            for (const [otherUserId, otherProfile] of this.userProfiles) {
                if (otherUserId === userId) continue;

                const score = this.calculateUserMatchScore(userProfile, otherProfile);
                if (score > 0.4) {
                    recommendations.push({
                        userId: otherUserId,
                        userProfile: otherProfile,
                        score,
                        reasons: this.getUserMatchReasons(userProfile, otherProfile)
                    });
                }
            }

            return recommendations.sort((a, b) => b.score - a.score).slice(0, 5);
        } catch (error) {
            console.error('❌ Error finding user recommendations:', error);
            return [];
        }
    }

    calculateUserMatchScore(userProfile, otherProfile) {
        let score = 0;
        let factors = 0;

        // Skills overlap (40% weight)
        const skillOverlap = this.calculateSkillOverlap(userProfile.skills, otherProfile.skills);
        score += skillOverlap * 0.4;
        factors += 0.4;

        // Interests alignment (30% weight)
        const interestAlignment = this.calculateInterestAlignment(userProfile.interests, otherProfile.interests);
        score += interestAlignment * 0.3;
        factors += 0.3;

        // Experience level (20% weight)
        const experienceAlignment = this.calculateExperienceAlignment(userProfile.experience, otherProfile.experience);
        score += experienceAlignment * 0.2;
        factors += 0.2;

        // Location proximity (10% weight)
        const locationProximity = this.calculateLocationProximity(userProfile.location, otherProfile.location);
        score += locationProximity * 0.1;
        factors += 0.1;

        return factors > 0 ? score / factors : 0;
    }

    calculateSkillOverlap(skills1, skills2) {
        if (!skills1 || !skills2) return 0;

        const commonSkills = skills1.filter(skill => skills2.includes(skill));
        const totalSkills = [...new Set([...skills1, ...skills2])].length;

        return totalSkills > 0 ? commonSkills.length / totalSkills : 0;
    }

    calculateInterestAlignment(interests1, interests2) {
        if (!interests1 || !interests2) return 0;

        const commonInterests = interests1.filter(interest => interests2.includes(interest));
        const totalInterests = [...new Set([...interests1, ...interests2])].length;

        return totalInterests > 0 ? commonInterests.length / totalInterests : 0;
    }

    calculateExperienceAlignment(exp1, exp2) {
        if (exp1 === undefined || exp2 === undefined) return 0.5;

        const diff = Math.abs(exp1 - exp2);
        return diff <= 2 ? 1 : Math.max(0, 1 - diff / 10);
    }

    calculateLocationProximity(loc1, loc2) {
        if (!loc1 || !loc2) return 0.5;

        if (loc1 === loc2) return 1;
        if (loc1.toLowerCase().includes('remote') || loc2.toLowerCase().includes('remote')) return 0.8;

        return 0.3; // Different locations
    }

    getUserMatchReasons(userProfile, otherProfile) {
        const reasons = [];

        const skillOverlap = this.calculateSkillOverlap(userProfile.skills, otherProfile.skills);
        if (skillOverlap > 0.3) {
            reasons.push(`Shared skills (${Math.round(skillOverlap * 100)}%)`);
        }

        const interestAlignment = this.calculateInterestAlignment(userProfile.interests, otherProfile.interests);
        if (interestAlignment > 0.3) {
            reasons.push(`Common interests (${Math.round(interestAlignment * 100)}%)`);
        }

        if (Math.abs(userProfile.experience - otherProfile.experience) <= 2) {
            reasons.push('Similar experience level');
        }

        return reasons;
    }

    async generateInsights(userId) {
        try {
            const userProfile = this.userProfiles.get(userId);
            if (!userProfile) return [];

            const insights = [];

            // Profile completeness insight
            if (userProfile.profileCompleteness < 70) {
                insights.push({
                    type: 'profile_completeness',
                    title: 'Complete Your Profile',
                    message: `Your profile is ${Math.round(userProfile.profileCompleteness)}% complete. Complete it to get better matches!`,
                    priority: 'medium',
                    action: 'update_profile'
                });
            }

            // Skills gap insight
            const ventureMatches = await this.findVentureMatches(userId);
            if (ventureMatches.length > 0) {
                const topVenture = ventureMatches[0];
                const missingSkills = this.findMissingSkills(userProfile.skills, topVenture.ventureProfile.skillsNeeded);
                if (missingSkills.length > 0) {
                    insights.push({
                        type: 'skills_gap',
                        title: 'Skills to Learn',
                        message: `Consider learning: ${missingSkills.slice(0, 3).join(', ')} to improve your matches`,
                        priority: 'low',
                        action: 'learn_skills'
                    });
                }
            }

            // Network growth insight
            if (userProfile.connections < 10) {
                insights.push({
                    type: 'network_growth',
                    title: 'Expand Your Network',
                    message: 'Connect with more people to discover new opportunities',
                    priority: 'low',
                    action: 'connect'
                });
            }

            return insights;
        } catch (error) {
            console.error('❌ Error generating insights:', error);
            return [];
        }
    }

    findMissingSkills(userSkills, requiredSkills) {
        if (!userSkills || !requiredSkills) return [];

        return requiredSkills.filter(skill =>
            !userSkills.some(userSkill =>
                userSkill.toLowerCase().includes(skill.toLowerCase()) ||
                skill.toLowerCase().includes(userSkill.toLowerCase())
            )
        );
    }

    async processMatchingQueue() {
        try {
            // Process any queued matching requests
            console.log('🤖 Processing matching queue');
        } catch (error) {
            console.error('❌ Error processing matching queue:', error);
        }
    }

    async updateUserProfile(userId) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                include: {
                    userProfile: true,
                    userConnections: true,
                    ventures: true,
                    teams: true
                }
            });

            if (user) {
                this.userProfiles.set(userId, this.createUserProfile(user));
                this.clearUserCache(userId);
            }
        } catch (error) {
            console.error('❌ Error updating user profile:', error);
        }
    }

    async updateVentureProfile(ventureId) {
        try {
            const venture = await this.prisma.venture.findUnique({
                where: { id: ventureId },
                include: {
                    ventureMembers: true,
                    ventureDocuments: true,
                    ventureMilestones: true
                }
            });

            if (venture) {
                this.ventureProfiles.set(ventureId, this.createVentureProfile(venture));
                this.clearVentureCache(ventureId);
            }
        } catch (error) {
            console.error('❌ Error updating venture profile:', error);
        }
    }

    async updateTeamProfile(teamId) {
        try {
            const team = await this.prisma.team.findUnique({
                where: { id: teamId },
                include: {
                    teamMembers: true,
                    teamGoals: true,
                    teamProjects: true
                }
            });

            if (team) {
                this.teamProfiles.set(teamId, this.createTeamProfile(team));
                this.clearTeamCache(teamId);
            }
        } catch (error) {
            console.error('❌ Error updating team profile:', error);
        }
    }

    async updateOpportunityProfile(opportunityId) {
        try {
            // This would update from opportunities table
            console.log(`🤖 Updating opportunity profile: ${opportunityId}`);
        } catch (error) {
            console.error('❌ Error updating opportunity profile:', error);
        }
    }

    clearMatchingCache() {
        this.matchingCache.clear();
    }

    clearUserCache(userId) {
        const keysToDelete = [];
        for (const key of this.matchingCache.keys()) {
            if (key.includes(userId)) {
                keysToDelete.push(key);
            }
        }
        keysToDelete.forEach(key => this.matchingCache.delete(key));
    }

    clearVentureCache(ventureId) {
        const keysToDelete = [];
        for (const key of this.matchingCache.keys()) {
            if (key.includes('venture_matches')) {
                keysToDelete.push(key);
            }
        }
        keysToDelete.forEach(key => this.matchingCache.delete(key));
    }

    clearTeamCache(teamId) {
        const keysToDelete = [];
        for (const key of this.matchingCache.keys()) {
            if (key.includes('team_matches')) {
                keysToDelete.push(key);
            }
        }
        keysToDelete.forEach(key => this.matchingCache.delete(key));
    }

    // Health check
    getHealth() {
        return {
            status: 'healthy',
            service: 'ai-matching',
            timestamp: new Date(),
            profiles: {
                users: this.userProfiles.size,
                ventures: this.ventureProfiles.size,
                teams: this.teamProfiles.size,
                opportunities: this.opportunityProfiles.size
            },
            cache: {
                matching: this.matchingCache.size,
                recommendations: this.recommendationCache.size
            },
            uptime: process.uptime()
        };
    }

    // Cleanup
    async destroy() {
        try {
            await this.prisma.$disconnect();
            this.userProfiles.clear();
            this.ventureProfiles.clear();
            this.teamProfiles.clear();
            this.opportunityProfiles.clear();
            this.matchingCache.clear();
            this.recommendationCache.clear();
            console.log('✅ AI Matching service destroyed');
        } catch (error) {
            console.error('❌ Error destroying AI Matching service:', error);
        }
    }
}

// Create singleton instance
const aiMatchingService = new SmartStartAIMatchingService({
    cacheTimeout: 300000, // 5 minutes
    batchSize: 100,
    processInterval: 60000 // 1 minute
});

module.exports = aiMatchingService;