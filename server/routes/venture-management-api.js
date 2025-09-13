/**
 * Venture Management API Routes
 * Handles venture management, sprints, and Slack integration
 */

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const prisma = new PrismaClient();

// ===== VENTURE MANAGEMENT =====

// Get venture details
router.get('/:ventureId', authenticateToken, async(req, res) => {
    try {
        const { ventureId } = req.params;
        const userId = req.user.id;

        const venture = await prisma.venture.findUnique({
            where: { id: ventureId },
            include: {
                owner: {
                    select: { id: true, name: true, email: true }
                },
                teamMembers: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true }
                        }
                    }
                },
                sprints: {
                    orderBy: { createdAt: 'desc' },
                    take: 10
                },
                risks: {
                    orderBy: { createdAt: 'desc' },
                    take: 10
                }
            }
        });

        if (!venture) {
            return res.status(404).json({
                success: false,
                message: 'Venture not found'
            });
        }

        // Check if user has access to this venture
        const hasAccess = venture.ownerUserId === userId ||
            venture.teamMembers.some(member => member.userId === userId);

        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                message: 'Access denied to this venture'
            });
        }

        res.json({
            success: true,
            data: venture,
            message: 'Venture details retrieved successfully'
        });
    } catch (error) {
        console.error('Error fetching venture:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch venture details',
            error: error.message
        });
    }
});

// ===== SPRINT MANAGEMENT =====

// Get sprints for a venture
router.get('/:ventureId/sprints', authenticateToken, async(req, res) => {
    try {
        const { ventureId } = req.params;
        const { status, limit = 20, offset = 0 } = req.query;

        const whereClause = { ventureId };
        if (status) {
            whereClause.status = status;
        }

        const sprints = await prisma.ventureSprint.findMany({
            where: whereClause,
            include: {
                tasks: {
                    include: {
                        assignee: {
                            select: { id: true, name: true, email: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: parseInt(limit),
            skip: parseInt(offset)
        });

        res.json({
            success: true,
            data: sprints,
            message: 'Sprints retrieved successfully'
        });
    } catch (error) {
        console.error('Error fetching sprints:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch sprints',
            error: error.message
        });
    }
});

// Create sprint
router.post('/:ventureId/sprints', authenticateToken, async(req, res) => {
    try {
        const { ventureId } = req.params;
        const { name, description, startDate, endDate, goals } = req.body;
        const userId = req.user.id;

        const sprint = await prisma.ventureSprint.create({
            data: {
                ventureId,
                name,
                description,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                goals: goals || [],
                status: 'PLANNING',
                createdBy: userId
            }
        });

        res.status(201).json({
            success: true,
            data: sprint,
            message: 'Sprint created successfully'
        });
    } catch (error) {
        console.error('Error creating sprint:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create sprint',
            error: error.message
        });
    }
});

// ===== RISK MANAGEMENT =====

// Get risks for a venture
router.get('/:ventureId/risks', authenticateToken, async(req, res) => {
    try {
        const { ventureId } = req.params;

        const risks = await prisma.ventureRisk.findMany({
            where: { ventureId },
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            success: true,
            data: risks,
            message: 'Risks retrieved successfully'
        });
    } catch (error) {
        console.error('Error fetching risks:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch risks',
            error: error.message
        });
    }
});

// Create risk
router.post('/:ventureId/risks', authenticateToken, async(req, res) => {
    try {
        const { ventureId } = req.params;
        const { title, description, severity, probability, impact, mitigation } = req.body;
        const userId = req.user.id;

        const risk = await prisma.ventureRisk.create({
            data: {
                ventureId,
                title,
                description,
                severity,
                probability,
                impact,
                mitigation,
                status: 'ACTIVE',
                ownerId: userId
            }
        });

        res.status(201).json({
            success: true,
            data: risk,
            message: 'Risk created successfully'
        });
    } catch (error) {
        console.error('Error creating risk:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create risk',
            error: error.message
        });
    }
});

// ===== SLACK INTEGRATION =====

// Get Slack integration for venture
router.get('/:ventureId/slack', authenticateToken, async(req, res) => {
    try {
        const { ventureId } = req.params;

        const integration = await prisma.integration.findFirst({
            where: {
                ventureId,
                type: 'SLACK'
            }
        });

        res.json({
            success: true,
            data: integration,
            message: 'Slack integration retrieved successfully'
        });
    } catch (error) {
        console.error('Error fetching Slack integration:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch Slack integration',
            error: error.message
        });
    }
});

// Setup Slack integration
router.post('/:ventureId/slack', authenticateToken, async(req, res) => {
    try {
        const { ventureId } = req.params;
        const { workspaceId, workspaceName, channelId, channelName, botToken, webhookUrl } = req.body;
        const userId = req.user.id;

        const integration = await prisma.integration.upsert({
            where: {
                ventureId_type: {
                    ventureId,
                    type: 'SLACK'
                }
            },
            update: {
                config: {
                    workspaceId,
                    workspaceName,
                    channelId,
                    channelName,
                    botToken,
                    webhookUrl
                },
                status: 'ACTIVE',
                updatedBy: userId
            },
            create: {
                ventureId,
                type: 'SLACK',
                config: {
                    workspaceId,
                    workspaceName,
                    channelId,
                    channelName,
                    botToken,
                    webhookUrl
                },
                status: 'ACTIVE',
                createdBy: userId
            }
        });

        res.status(201).json({
            success: true,
            data: integration,
            message: 'Slack integration setup successfully'
        });
    } catch (error) {
        console.error('Error setting up Slack integration:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to setup Slack integration',
            error: error.message
        });
    }
});

// Get Slack messages
router.get('/:ventureId/slack/messages', authenticateToken, async(req, res) => {
    try {
        const { ventureId } = req.params;
        const { limit = 50, offset = 0 } = req.query;

        const messages = await prisma.message.findMany({
            where: {
                ventureId,
                channel: 'SLACK'
            },
            orderBy: { createdAt: 'desc' },
            take: parseInt(limit),
            skip: parseInt(offset)
        });

        res.json({
            success: true,
            data: messages,
            message: 'Slack messages retrieved successfully'
        });
    } catch (error) {
        console.error('Error fetching Slack messages:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch Slack messages',
            error: error.message
        });
    }
});

// ===== VENTURE ANALYTICS =====

// Get venture analytics
router.get('/:ventureId/analytics', authenticateToken, async(req, res) => {
    try {
        const { ventureId } = req.params;

        const [
            totalSprints,
            activeSprints,
            completedSprints,
            totalTasks,
            completedTasks,
            totalRisks,
            activeRisks,
            teamMembers
        ] = await Promise.all([
            prisma.ventureSprint.count({ where: { ventureId } }),
            prisma.ventureSprint.count({ where: { ventureId, status: 'ACTIVE' } }),
            prisma.ventureSprint.count({ where: { ventureId, status: 'COMPLETED' } }),
            prisma.ventureSprintTask.count({ where: { ventureId } }),
            prisma.ventureSprintTask.count({ where: { ventureId, status: 'COMPLETED' } }),
            prisma.ventureRisk.count({ where: { ventureId } }),
            prisma.ventureRisk.count({ where: { ventureId, status: 'ACTIVE' } }),
            prisma.ventureTeamMember.count({ where: { ventureId } })
        ]);

        res.json({
            success: true,
            data: {
                sprints: {
                    total: totalSprints,
                    active: activeSprints,
                    completed: completedSprints
                },
                tasks: {
                    total: totalTasks,
                    completed: completedTasks,
                    completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
                },
                risks: {
                    total: totalRisks,
                    active: activeRisks
                },
                team: {
                    members: teamMembers
                }
            },
            message: 'Venture analytics retrieved successfully'
        });
    } catch (error) {
        console.error('Error fetching venture analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch venture analytics',
            error: error.message
        });
    }
});

// Create venture endpoint with legal document integration
router.post('/create', authenticateToken, async(req, res) => {
    try {
        const userId = req.user.id;
        const {
            name,
            description,
            industry,
            stage,
            teamSize,
            tier,
            residency,
            lookingFor,
            requiredSkills,
            rewardType,
            amount,
            tags,
            visibility
        } = req.body;

        // Check if user has completed legal document requirements
        const legalComplianceCheck = await checkUserLegalCompliance(userId);
        if (!legalComplianceCheck.compliant) {
            return res.status(400).json({
                success: false,
                message: 'Legal document requirements not met',
                error: {
                    code: 'LEGAL_COMPLIANCE_REQUIRED',
                    message: 'You must complete all required legal documents before creating ventures',
                    missingDocuments: legalComplianceCheck.missingDocuments
                }
            });
        }

        // Create the venture
        const venture = await prisma.venture.create({
            data: {
                name,
                description,
                industry,
                stage,
                teamSize: parseInt(teamSize),
                tier,
                residency,
                lookingFor: lookingFor || [],
                requiredSkills: requiredSkills || [],
                rewardType,
                amount: parseFloat(amount),
                tags: tags || [],
                visibility,
                ownerUserId: userId,
                status: 'ACTIVE'
            }
        });

        // Auto-generate required legal documents for the venture
        await generateVentureLegalDocuments(venture.id, userId);

        // Create initial venture team membership
        await prisma.ventureTeamMember.create({
            data: {
                ventureId: venture.id,
                userId: userId,
                role: 'OWNER',
                status: 'ACTIVE',
                joinedAt: new Date()
            }
        });

        res.status(201).json({
            success: true,
            data: {
                venture,
                legalDocuments: await getVentureLegalDocuments(venture.id),
                message: 'Venture created successfully with legal document requirements'
            }
        });

    } catch (error) {
        console.error('Error creating venture:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create venture',
            error: error.message
        });
    }
});

// Helper function to check user legal compliance
async function checkUserLegalCompliance(userId) {
    try {
        const legalPacks = await prisma.platformLegalPack.findMany({
            where: { userId },
            include: { documents: true }
        });

        const requiredDocuments = [
            'platform-participation-agreement',
            'mutual-confidentiality-agreement',
            'inventions-ip-agreement'
        ];

        let signedDocuments = 0;
        let missingDocuments = [];

        for (const pack of legalPacks) {
            for (const doc of pack.documents) {
                if (requiredDocuments.includes(doc.key) &&
                    (doc.status === 'EFFECTIVE' || doc.signatureCount > 0)) {
                    signedDocuments++;
                }
            }
        }

        // Check for missing documents
        for (const requiredDoc of requiredDocuments) {
            let found = false;
            for (const pack of legalPacks) {
                for (const doc of pack.documents) {
                    if (doc.key === requiredDoc &&
                        (doc.status === 'EFFECTIVE' || doc.signatureCount > 0)) {
                        found = true;
                        break;
                    }
                }
                if (found) break;
            }
            if (!found) {
                missingDocuments.push(requiredDoc);
            }
        }

        return {
            compliant: signedDocuments === requiredDocuments.length,
            signedDocuments,
            totalRequired: requiredDocuments.length,
            missingDocuments
        };

    } catch (error) {
        console.error('Error checking legal compliance:', error);
        return {
            compliant: false,
            signedDocuments: 0,
            totalRequired: 3,
            missingDocuments: ['platform-participation-agreement', 'mutual-confidentiality-agreement', 'inventions-ip-agreement']
        };
    }
}

// Helper function to generate venture-specific legal documents
async function generateVentureLegalDocuments(ventureId, userId) {
    try {
        const ventureDocuments = [{
                key: `venture-nda-${ventureId}`,
                name: 'Venture-Specific NDA',
                description: 'Non-disclosure agreement for this specific venture',
                category: 'venture-project',
                status: 'DRAFT',
                content: `This Non-Disclosure Agreement ("NDA") governs the confidentiality obligations for venture: ${ventureId}...`
            },
            {
                key: `venture-equity-${ventureId}`,
                name: 'Venture Equity Agreement',
                description: 'Equity distribution agreement for this venture',
                category: 'venture-project',
                status: 'DRAFT',
                content: `This Equity Agreement governs the distribution of equity in venture: ${ventureId}...`
            }
        ];

        for (const doc of ventureDocuments) {
            await prisma.legalDocument.create({
                data: {
                    ...doc,
                    userId: userId,
                    ventureId: ventureId
                }
            });
        }

        console.log(`Generated ${ventureDocuments.length} legal documents for venture ${ventureId}`);

    } catch (error) {
        console.error('Error generating venture legal documents:', error);
    }
}

// Helper function to get venture legal documents
async function getVentureLegalDocuments(ventureId) {
    try {
        return await prisma.legalDocument.findMany({
            where: { ventureId },
            select: {
                id: true,
                key: true,
                name: true,
                description: true,
                category: true,
                status: true,
                createdAt: true
            }
        });
    } catch (error) {
        console.error('Error getting venture legal documents:', error);
        return [];
    }
}

// ===== LEGAL ENTITY INTEGRATION =====

// Create legal entity for venture
router.post('/:ventureId/legal-entity', authenticateToken, async(req, res) => {
    try {
        const { ventureId } = req.params;
        const { entityType, jurisdiction, businessName, taxId, registeredAddress } = req.body;
        const userId = req.user.id;

        // Check if user has access to this venture
        const venture = await prisma.venture.findUnique({
            where: { id: ventureId },
            include: { teamMembers: true }
        });

        if (!venture) {
            return res.status(404).json({
                success: false,
                message: 'Venture not found'
            });
        }

        const hasAccess = venture.ownerUserId === userId ||
            venture.teamMembers.some(member => member.userId === userId);

        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                message: 'Access denied to this venture'
            });
        }

        // Check legal compliance for legal entity creation
        const legalCompliance = await checkUserLegalCompliance(userId);
        if (!legalCompliance.compliant) {
            return res.status(400).json({
                success: false,
                message: 'Legal document requirements not met for legal entity creation',
                error: {
                    code: 'LEGAL_COMPLIANCE_REQUIRED',
                    message: 'You must complete all required legal documents before creating legal entities',
                    missingDocuments: legalCompliance.missingDocuments
                }
            });
        }

        // Create legal entity
        const legalEntity = await prisma.ventureLegalEntity.create({
            data: {
                ventureId: ventureId,
                entityType: entityType || 'LLC',
                jurisdiction: jurisdiction || 'US',
                businessName: businessName || venture.name,
                taxId: taxId,
                registeredAddress: registeredAddress,
                status: 'PENDING_REGISTRATION',
                createdBy: userId,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        });

        // Generate legal documents for the entity
        await generateVentureLegalEntityDocuments(legalEntity.id, ventureId, userId);

        res.status(201).json({
            success: true,
            data: {
                legalEntity,
                legalDocuments: await getVentureLegalEntityDocuments(legalEntity.id),
                message: 'Legal entity created successfully with legal compliance check'
            },
            message: 'Legal entity created successfully with legal documents'
        });

    } catch (error) {
        console.error('Error creating legal entity:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create legal entity',
            error: error.message
        });
    }
});

// Get legal entity for venture
router.get('/:ventureId/legal-entity', authenticateToken, async(req, res) => {
    try {
        const { ventureId } = req.params;
        const userId = req.user.id;

        // Check if user has access to this venture
        const venture = await prisma.venture.findUnique({
            where: { id: ventureId },
            include: { teamMembers: true }
        });

        if (!venture) {
            return res.status(404).json({
                success: false,
                message: 'Venture not found'
            });
        }

        const hasAccess = venture.ownerUserId === userId ||
            venture.teamMembers.some(member => member.userId === userId);

        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                message: 'Access denied to this venture'
            });
        }

        const legalEntity = await prisma.ventureLegalEntity.findFirst({
            where: { ventureId: ventureId },
            include: {
                legalDocuments: {
                    include: {
                        signatures: {
                            include: {
                                signer: {
                                    select: { id: true, name: true, email: true }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!legalEntity) {
            return res.status(404).json({
                success: false,
                message: 'Legal entity not found for this venture'
            });
        }

        res.json({
            success: true,
            data: legalEntity,
            message: 'Legal entity retrieved successfully'
        });

    } catch (error) {
        console.error('Error fetching legal entity:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch legal entity',
            error: error.message
        });
    }
});

// Update legal entity
router.put('/:ventureId/legal-entity/:entityId', authenticateToken, async(req, res) => {
    try {
        const { ventureId, entityId } = req.params;
        const updateData = req.body;
        const userId = req.user.id;

        // Check if user has access to this venture
        const venture = await prisma.venture.findUnique({
            where: { id: ventureId },
            include: { teamMembers: true }
        });

        if (!venture) {
            return res.status(404).json({
                success: false,
                message: 'Venture not found'
            });
        }

        const hasAccess = venture.ownerUserId === userId ||
            venture.teamMembers.some(member => member.userId === userId);

        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                message: 'Access denied to this venture'
            });
        }

        // Update legal entity
        const legalEntity = await prisma.ventureLegalEntity.update({
            where: { id: entityId },
            data: {
                ...updateData,
                updatedAt: new Date()
            }
        });

        res.json({
            success: true,
            data: legalEntity,
            message: 'Legal entity updated successfully'
        });

    } catch (error) {
        console.error('Error updating legal entity:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update legal entity',
            error: error.message
        });
    }
});

// Get venture legal compliance status
router.get('/:ventureId/legal-compliance', authenticateToken, async(req, res) => {
    try {
        const { ventureId } = req.params;
        const userId = req.user.id;

        // Check if user has access to this venture
        const venture = await prisma.venture.findUnique({
            where: { id: ventureId },
            include: { teamMembers: true }
        });

        if (!venture) {
            return res.status(404).json({
                success: false,
                message: 'Venture not found'
            });
        }

        const hasAccess = venture.ownerUserId === userId ||
            venture.teamMembers.some(member => member.userId === userId);

        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                message: 'Access denied to this venture'
            });
        }

        // Check legal compliance for venture owner
        const ownerLegalCompliance = await checkUserLegalCompliance(venture.ownerUserId);
        
        // Check legal compliance for team members
        const teamLegalCompliance = [];
        for (const member of venture.teamMembers) {
            const memberCompliance = await checkUserLegalCompliance(member.userId);
            teamLegalCompliance.push({
                userId: member.userId,
                name: member.user.name,
                compliance: memberCompliance
            });
        }

        // Get venture-specific legal documents
        const ventureLegalDocs = await prisma.legalDocument.findMany({
            where: {
                entityId: ventureId,
                entityType: 'VENTURE'
            },
            include: {
                signatures: {
                    include: {
                        signer: {
                            select: { id: true, name: true, email: true }
                        }
                    }
                }
            }
        });

        res.json({
            success: true,
            data: {
                ventureId,
                ownerLegalCompliance,
                teamLegalCompliance,
                ventureLegalDocuments: ventureLegalDocs,
                overallCompliance: {
                    compliant: ownerLegalCompliance.compliant && 
                              teamLegalCompliance.every(member => member.compliance.compliant),
                    totalTeamMembers: venture.teamMembers.length,
                    compliantTeamMembers: teamLegalCompliance.filter(member => member.compliance.compliant).length
                }
            },
            message: 'Venture legal compliance status retrieved successfully'
        });

    } catch (error) {
        console.error('Error fetching venture legal compliance:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch venture legal compliance',
            error: error.message
        });
    }
});

// Helper function to check user legal compliance
async function checkUserLegalCompliance(userId) {
    try {
        // Check user's signed legal documents
        const signedLegalDocs = await prisma.legalDocumentSignature.findMany({
            where: { signerId: userId },
            include: {
                document: {
                    select: {
                        id: true,
                        title: true,
                        type: true,
                        status: true
                    }
                }
            }
        });

        const requiredDocumentTitles = [
            'Platform Participation Agreement',
            'Mutual Confidentiality Agreement',
            'Inventions & Intellectual Property Agreement'
        ];

        let signedDocuments = 0;
        let missingDocuments = [];

        // Check which required documents are signed
        for (const requiredDoc of requiredDocumentTitles) {
            let found = false;
            for (const signedDoc of signedLegalDocs) {
                if (signedDoc.document.title.includes(requiredDoc.split(' ')[0])) {
                    found = true;
                    signedDocuments++;
                    break;
                }
            }
            if (!found) {
                missingDocuments.push(requiredDoc.toLowerCase().replace(/\s+/g, '-'));
            }
        }

        return {
            compliant: signedDocuments === requiredDocumentTitles.length,
            signedDocuments,
            totalRequired: requiredDocumentTitles.length,
            missingDocuments,
            signedDocumentsList: signedLegalDocs.map(doc => ({
                title: doc.document.title,
                type: doc.document.type,
                signedAt: doc.signedAt
            }))
        };

    } catch (error) {
        console.error('Error checking legal compliance:', error);
        return {
            compliant: false,
            signedDocuments: 0,
            totalRequired: 3,
            missingDocuments: ['platform-participation-agreement', 'mutual-confidentiality-agreement', 'inventions-ip-agreement'],
            signedDocumentsList: []
        };
    }
}

// Helper function to generate venture legal entity documents
async function generateVentureLegalEntityDocuments(entityId, ventureId, userId) {
    try {
        const venture = await prisma.venture.findUnique({
            where: { id: ventureId },
            include: { owner: true }
        });

        if (!venture) {
            throw new Error('Venture not found');
        }

        // Generate venture-specific legal documents
        const ventureDocs = [
            {
                title: 'Venture Formation Agreement',
                type: 'VENTURE_FORMATION',
                content: `Venture Formation Agreement for ${venture.name}`,
                requiresSignature: true,
                complianceRequired: true,
                entityId: ventureId,
                entityType: 'VENTURE'
            },
            {
                title: 'Venture Operating Agreement',
                type: 'VENTURE_OPERATING',
                content: `Operating Agreement for ${venture.name}`,
                requiresSignature: true,
                complianceRequired: true,
                entityId: ventureId,
                entityType: 'VENTURE'
            },
            {
                title: 'Venture IP Assignment Agreement',
                type: 'VENTURE_IP_ASSIGNMENT',
                content: `IP Assignment Agreement for ${venture.name}`,
                requiresSignature: true,
                complianceRequired: true,
                entityId: ventureId,
                entityType: 'VENTURE'
            }
        ];

        const createdDocs = [];
        for (const docData of ventureDocs) {
            const doc = await prisma.legalDocument.create({
                data: {
                    id: `doc-${crypto.randomBytes(8).toString('hex')}`,
                    title: docData.title,
                    type: docData.type,
                    content: docData.content,
                    version: '1.0',
                    status: 'DRAFT',
                    requiresSignature: docData.requiresSignature,
                    complianceRequired: docData.complianceRequired,
                    createdBy: userId,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    entityId: docData.entityId,
                    entityType: docData.entityType
                }
            });
            createdDocs.push(doc);
        }

        return createdDocs;

    } catch (error) {
        console.error('Error generating venture legal entity documents:', error);
        throw error;
    }
}

// Helper function to get venture legal entity documents
async function getVentureLegalEntityDocuments(entityId) {
    try {
        const legalEntity = await prisma.ventureLegalEntity.findUnique({
            where: { id: entityId },
            include: {
                venture: true
            }
        });

        if (!legalEntity) {
            return [];
        }

        const documents = await prisma.legalDocument.findMany({
            where: {
                entityId: legalEntity.ventureId,
                entityType: 'VENTURE'
            },
            include: {
                signatures: {
                    include: {
                        signer: {
                            select: { id: true, name: true, email: true }
                        }
                    }
                }
            }
        });

        return documents;

    } catch (error) {
        console.error('Error getting venture legal entity documents:', error);
        return [];
    }
}

module.exports = router;