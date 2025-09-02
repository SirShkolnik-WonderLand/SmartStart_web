const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ===== COMPANY MANAGEMENT API =====

// ===== HEALTH CHECK =====
router.get('/health', async(req, res) => {
    try {
        const companyCount = await prisma.company.count();
        const tagCount = await prisma.companyTag.count();
        const metricCount = await prisma.companyMetric.count();
        const documentCount = await prisma.companyDocument.count();

        res.json({
            success: true,
            message: 'Company Management System is healthy',
            stats: {
                companies: companyCount,
                tags: tagCount,
                metrics: metricCount,
                documents: documentCount
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Company management health check error:', error);
        res.status(500).json({
            success: false,
            message: 'Health check failed',
            error: error.message
        });
    }
});

// ===== COMPANY CRUD OPERATIONS =====

// Create a new company
router.post('/create', async(req, res) => {
    try {
        const {
            name,
            description,
            industry,
            size,
            stage,
            status = 'ACTIVE',
            visibility = 'PUBLIC',
            foundedDate,
            website,
            location,
            logoUrl,
            ownerId,
            parentCompanyId,
            settings = {}
        } = req.body;

        // Validate required fields
        if (!name || !industry || !size || !stage || !ownerId) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: name, industry, size, stage, ownerId'
            });
        }

        // Create company
        const company = await prisma.company.create({
            data: {
                name,
                description,
                industry,
                size,
                stage,
                status,
                visibility,
                foundedDate: foundedDate ? new Date(foundedDate) : null,
                website,
                location,
                logoUrl,
                ownerId,
                parentCompanyId,
                settings
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                parentCompany: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                subsidiaries: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        res.status(201).json({
            success: true,
            message: 'Company created successfully',
            company
        });
    } catch (error) {
        console.error('Company creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Company creation failed',
            error: error.message
        });
    }
});

// Get all companies
router.get('/', async(req, res) => {
    try {
        const {
            industry,
            size,
            stage,
            status,
            visibility,
            page = 1,
            limit = 20
        } = req.query;

        const skip = (page - 1) * limit;

        // Build filter object
        const where = {};
        if (industry) where.industry = industry;
        if (sector) where.sector = sector;
        if (size) where.size = size;
        if (stage) where.stage = stage;
        if (region) where.region = region;
        if (status) where.status = status;
        if (visibility) where.visibility = visibility;

        const companies = await prisma.company.findMany({
            where,
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                parentCompany: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                subsidiaries: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                teams: {
                    select: {
                        id: true,
                        name: true,
                        size: true
                    }
                },
                ventures: {
                    select: {
                        id: true,
                        name: true,
                        status: true
                    }
                }
            },
            skip,
            take: parseInt(limit),
            orderBy: {
                createdAt: 'desc'
            }
        });

        const total = await prisma.company.count({ where });

        res.json({
            success: true,
            companies,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Companies fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch companies',
            error: error.message
        });
    }
});

// Get company by ID
router.get('/:id', async(req, res) => {
    try {
        const { id } = req.params;

        const company = await prisma.company.findUnique({
            where: { id },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                parentCompany: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                subsidiaries: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                teams: {
                    include: {
                        lead: {
                            select: {
                                id: true,
                                name: true
                            }
                        },
                        members: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        name: true
                                    }
                                }
                            }
                        }
                    }
                },
                ventures: {
                    include: {
                        owner: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                },
                companyTags: true,
                _count: {
                    select: {
                        teams: true,
                        ventures: true,
                        subsidiaries: true
                    }
                }
            }
        });

        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        res.json({
            success: true,
            company
        });
    } catch (error) {
        console.error('Company fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch company',
            error: error.message
        });
    }
});

// Update company
router.put('/:id', async(req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Remove fields that shouldn't be updated
        delete updateData.id;
        delete updateData.createdAt;
        delete updateData.updatedAt;

        // Handle date fields
        if (updateData.founded) {
            updateData.founded = new Date(updateData.founded);
        }

        const company = await prisma.company.update({
            where: { id },
            data: updateData,
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        res.json({
            success: true,
            message: 'Company updated successfully',
            company
        });
    } catch (error) {
        console.error('Company update error:', error);
        res.status(500).json({
            success: false,
            message: 'Company update failed',
            error: error.message
        });
    }
});

// Delete company
router.delete('/:id', async(req, res) => {
    try {
        const { id } = req.params;

        // Check if company has active teams or ventures
        const activeTeams = await prisma.team.count({
            where: { companyId: id, status: 'ACTIVE' }
        });

        const activeVentures = await prisma.venture.count({
            where: { companyId: id, status: 'ACTIVE' }
        });

        if (activeTeams > 0 || activeVentures > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete company with active teams or ventures',
                details: {
                    activeTeams,
                    activeVentures
                }
            });
        }

        await prisma.company.delete({
            where: { id }
        });

        res.json({
            success: true,
            message: 'Company deleted successfully'
        });
    } catch (error) {
        console.error('Company deletion error:', error);
        res.status(500).json({
            success: false,
            message: 'Company deletion failed',
            error: error.message
        });
    }
});

// ===== COMPANY HIERARCHY =====

// Get company hierarchy
router.get('/:id/hierarchy', async(req, res) => {
    try {
        const { id } = req.params;

        const hierarchy = await prisma.companyHierarchy.findMany({
            where: {
                OR: [
                    { parentCompanyId: id },
                    { childCompanyId: id }
                ]
            },
            include: {
                parentCompany: {
                    select: {
                        id: true,
                        name: true,
                        industry: true
                    }
                },
                childCompany: {
                    select: {
                        id: true,
                        name: true,
                        industry: true
                    }
                }
            }
        });

        res.json({
            success: true,
            hierarchy
        });
    } catch (error) {
        console.error('Company hierarchy fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch company hierarchy',
            error: error.message
        });
    }
});

// Create company relationship
router.post('/:id/relationship', async(req, res) => {
    try {
        const { id } = req.params;
        const { childCompanyId, relationshipType, ownershipPercent } = req.body;

        if (!childCompanyId || !relationshipType) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: childCompanyId, relationshipType'
            });
        }

        const relationship = await prisma.companyHierarchy.create({
            data: {
                parentCompanyId: id,
                childCompanyId,
                relationshipType,
                ownershipPercent
            },
            include: {
                parentCompany: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                childCompany: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        res.status(201).json({
            success: true,
            message: 'Company relationship created successfully',
            relationship
        });
    } catch (error) {
        console.error('Company relationship creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Company relationship creation failed',
            error: error.message
        });
    }
});

// ===== COMPANY METRICS =====

// Get company metrics
router.get('/:id/metrics', async(req, res) => {
    try {
        const { id } = req.params;
        const { period, metricType } = req.query;

        const where = { companyId: id };
        if (period) where.period = period;
        if (metricType) where.metricType = metricType;

        const metrics = await prisma.companyMetric.findMany({
            where,
            orderBy: {
                effectiveDate: 'desc'
            }
        });

        res.json({
            success: true,
            metrics
        });
    } catch (error) {
        console.error('Company metrics fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch company metrics',
            error: error.message
        });
    }
});

// Add company metric
router.post('/:id/metrics', async(req, res) => {
    try {
        const { id } = req.params;
        const { metricType, value, unit, period, source, confidence, notes, effectiveDate } = req.body;

        if (!metricType || value === undefined || !period) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: metricType, value, period'
            });
        }

        const metric = await prisma.companyMetric.create({
            data: {
                companyId: id,
                metricType,
                value: parseFloat(value),
                unit,
                period,
                source,
                confidence: confidence ? parseFloat(confidence) : 1.0,
                notes,
                effectiveDate: effectiveDate ? new Date(effectiveDate) : new Date()
            }
        });

        res.status(201).json({
            success: true,
            message: 'Company metric added successfully',
            metric
        });
    } catch (error) {
        console.error('Company metric creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Company metric creation failed',
            error: error.message
        });
    }
});

// ===== COMPANY DOCUMENTS =====

// Get company documents
router.get('/:id/documents', async(req, res) => {
    try {
        const { id } = req.params;
        const { documentType, isPublic } = req.query;

        const where = { companyId: id };
        if (documentType) where.documentType = documentType;
        if (isPublic !== undefined) where.isPublic = isPublic === 'true';

        const documents = await prisma.companyDocument.findMany({
            where,
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.json({
            success: true,
            documents
        });
    } catch (error) {
        console.error('Company documents fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch company documents',
            error: error.message
        });
    }
});

// Add company document
router.post('/:id/documents', async(req, res) => {
    try {
        const { id } = req.params;
        const { title, description, documentType, fileUrl, fileName, fileSize, mimeType, tags, isPublic, version } = req.body;

        if (!title || !documentType || !fileUrl || !fileName) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: title, documentType, fileUrl, fileName'
            });
        }

        const document = await prisma.companyDocument.create({
            data: {
                companyId: id,
                title,
                description,
                documentType,
                fileUrl,
                fileName,
                fileSize: fileSize ? parseInt(fileSize) : null,
                mimeType,
                tags: tags || [],
                isPublic: isPublic !== undefined ? isPublic : false,
                version: version || '1.0'
            }
        });

        res.status(201).json({
            success: true,
            message: 'Company document added successfully',
            document
        });
    } catch (error) {
        console.error('Company document creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Company document creation failed',
            error: error.message
        });
    }
});

// ===== COMPANY TAGS =====

// Get all company tags
router.get('/tags/all', async(req, res) => {
    try {
        const { category } = req.query;

        const where = {};
        if (category) where.category = category;

        const tags = await prisma.companyTag.findMany({
            where,
            include: {
                _count: {
                    select: {
                        companies: true
                    }
                }
            },
            orderBy: {
                usageCount: 'desc'
            }
        });

        res.json({
            success: true,
            tags
        });
    } catch (error) {
        console.error('Company tags fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch company tags',
            error: error.message
        });
    }
});

// Create company tag
router.post('/tags/create', async(req, res) => {
    try {
        const { name, category, description, synonyms, relatedTags } = req.body;

        if (!name || !category) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: name, category'
            });
        }

        const tag = await prisma.companyTag.create({
            data: {
                name,
                category,
                description,
                synonyms: synonyms || [],
                relatedTags: relatedTags || []
            }
        });

        res.status(201).json({
            success: true,
            message: 'Company tag created successfully',
            tag
        });
    } catch (error) {
        console.error('Company tag creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Company tag creation failed',
            error: error.message
        });
    }
});

// ===== COMPANY ANALYTICS =====

// Get company analytics
router.get('/:id/analytics', async(req, res) => {
    try {
        const { id } = req.params;

        // Get company stats
        const company = await prisma.company.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        teams: true,
                        ventures: true,
                        subsidiaries: true
                    }
                }
            }
        });

        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        // Get recent metrics
        const recentMetrics = await prisma.companyMetric.findMany({
            where: { companyId: id },
            orderBy: { effectiveDate: 'desc' },
            take: 10
        });

        // Get team performance
        const teamStats = await prisma.team.findMany({
            where: { companyId: id },
            include: {
                _count: {
                    select: {
                        members: true,
                        goals: true
                    }
                },
                metrics: {
                    orderBy: { effectiveDate: 'desc' },
                    take: 1
                }
            }
        });

        const analytics = {
            company,
            recentMetrics,
            teamStats,
            summary: {
                totalTeams: company._count.teams,
                totalVentures: company._count.ventures,
                totalSubsidiaries: company._count.subsidiaries,
                totalTeamMembers: teamStats.reduce((sum, team) => sum + team._count.members, 0),
                totalGoals: teamStats.reduce((sum, team) => sum + team._count.goals, 0)
            }
        };

        res.json({
            success: true,
            analytics
        });
    } catch (error) {
        console.error('Company analytics fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch company analytics',
            error: error.message
        });
    }
});

// ===== SEARCH & DISCOVERY =====

// Search companies
router.get('/search/companies', async(req, res) => {
    try {
        const {
            query,
            industry,
            size,
            stage,
            status,
            visibility,
            page = 1,
            limit = 20
        } = req.query;

        const skip = (page - 1) * limit;

        // Build search conditions
        const where = {};

        if (query) {
            where.OR = [
                { name: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
                { industry: { contains: query, mode: 'insensitive' } }
            ];
        }

        if (industry) where.industry = industry;
        if (size) where.size = size;
        if (stage) where.stage = stage;
        if (status) where.status = status;
        if (visibility) where.visibility = visibility;

        const companies = await prisma.company.findMany({
            where,
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                _count: {
                    select: {
                        teams: true,
                        ventures: true
                    }
                }
            },
            skip,
            take: parseInt(limit),
            orderBy: {
                createdAt: 'desc'
            }
        });

        const total = await prisma.company.count({ where });

        res.json({
            success: true,
            companies,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Company search error:', error);
        res.status(500).json({
            success: false,
            message: 'Company search failed',
            error: error.message
        });
    }
});

// ===== TABLE CREATION ENDPOINT =====
router.post('/create-tables', async(req, res) => {
    try {
        console.log('🔨 Creating company management system tables...');

        // Drop existing tables if they exist
        console.log('🗑️ Dropping existing tables...');
        await prisma.$executeRaw `DROP TABLE IF EXISTS "CompanyDocument" CASCADE;`;
        await prisma.$executeRaw `DROP TABLE IF EXISTS "CompanyMetric" CASCADE;`;
        await prisma.$executeRaw `DROP TABLE IF EXISTS "CompanyHierarchy" CASCADE;`;
        await prisma.$executeRaw `DROP TABLE IF EXISTS "CompanyTag" CASCADE;`;
        await prisma.$executeRaw `DROP TABLE IF EXISTS "Company" CASCADE;`;

        // Create Company table
        await prisma.$executeRaw `
      CREATE TABLE "Company" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "industry" TEXT NOT NULL,
        "size" TEXT NOT NULL,
        "stage" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'ACTIVE',
        "visibility" TEXT NOT NULL DEFAULT 'PUBLIC',
        "foundedDate" TIMESTAMP(3),
        "website" TEXT,
        "location" TEXT,
        "logoUrl" TEXT,
        "parentCompanyId" TEXT,
        "ownerId" TEXT NOT NULL,
        "settings" JSONB,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
      );
    `;

        // Create CompanyTag table
        await prisma.$executeRaw `
      CREATE TABLE "CompanyTag" (
        "id" TEXT NOT NULL,
        "companyId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "category" TEXT NOT NULL,
        "value" TEXT,
        "description" TEXT,
        "isPrimary" BOOLEAN NOT NULL DEFAULT false,
        "confidence" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "CompanyTag_pkey" PRIMARY KEY ("id")
      );
    `;

        // Create CompanyHierarchy table
        await prisma.$executeRaw `
      CREATE TABLE "CompanyHierarchy" (
        "id" TEXT NOT NULL,
        "companyId" TEXT NOT NULL,
        "parentId" TEXT,
        "relationshipType" TEXT NOT NULL DEFAULT 'SUBSIDIARY',
        "ownershipPercent" DOUBLE PRECISION,
        "level" INTEGER NOT NULL DEFAULT 0,
        "path" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "CompanyHierarchy_pkey" PRIMARY KEY ("id")
      );
    `;

        // Create CompanyMetric table
        await prisma.$executeRaw `
      CREATE TABLE "CompanyMetric" (
        "id" TEXT NOT NULL,
        "companyId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "value" DOUBLE PRECISION NOT NULL,
        "unit" TEXT,
        "metricType" TEXT NOT NULL,
        "description" TEXT,
        "target" DOUBLE PRECISION,
        "threshold" DOUBLE PRECISION,
        "period" TEXT NOT NULL,
        "effectiveDate" TIMESTAMP(3) NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "CompanyMetric_pkey" PRIMARY KEY ("id")
      );
    `;

        // Create CompanyDocument table
        await prisma.$executeRaw `
      CREATE TABLE "CompanyDocument" (
        "id" TEXT NOT NULL,
        "companyId" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "documentType" TEXT NOT NULL,
        "fileName" TEXT NOT NULL,
        "fileSize" INTEGER,
        "mimeType" TEXT,
        "storageUri" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'ACTIVE',
        "isPublic" BOOLEAN NOT NULL DEFAULT false,
        "uploadedBy" TEXT NOT NULL,
        "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "lastAccessed" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "CompanyDocument_pkey" PRIMARY KEY ("id")
      );
    `;

        // Create indexes
        await prisma.$executeRaw `CREATE INDEX IF NOT EXISTS "Company_industry_idx" ON "Company"("industry");`;
        await prisma.$executeRaw `CREATE INDEX IF NOT EXISTS "Company_size_idx" ON "Company"("size");`;
        await prisma.$executeRaw `CREATE INDEX IF NOT EXISTS "Company_stage_idx" ON "Company"("stage");`;
        await prisma.$executeRaw `CREATE INDEX IF NOT EXISTS "Company_status_idx" ON "Company"("status");`;
        await prisma.$executeRaw `CREATE INDEX IF NOT EXISTS "Company_visibility_idx" ON "Company"("visibility");`;
        await prisma.$executeRaw `CREATE INDEX IF NOT EXISTS "Company_parentCompanyId_idx" ON "Company"("parentCompanyId");`;
        await prisma.$executeRaw `CREATE INDEX IF NOT EXISTS "Company_ownerId_idx" ON "Company"("ownerId");`;

        await prisma.$executeRaw `CREATE INDEX IF NOT EXISTS "CompanyTag_companyId_idx" ON "CompanyTag"("companyId");`;
        await prisma.$executeRaw `CREATE INDEX IF NOT EXISTS "CompanyTag_category_idx" ON "CompanyTag"("category");`;
        await prisma.$executeRaw `CREATE INDEX IF NOT EXISTS "CompanyTag_name_idx" ON "CompanyTag"("name");`;

        await prisma.$executeRaw `CREATE INDEX IF NOT EXISTS "CompanyHierarchy_companyId_idx" ON "CompanyHierarchy"("companyId");`;
        await prisma.$executeRaw `CREATE INDEX IF NOT EXISTS "CompanyHierarchy_parentId_idx" ON "CompanyHierarchy"("parentId");`;
        await prisma.$executeRaw `CREATE INDEX IF NOT EXISTS "CompanyHierarchy_relationshipType_idx" ON "CompanyHierarchy"("relationshipType");`;
        await prisma.$executeRaw `CREATE INDEX IF NOT EXISTS "CompanyHierarchy_level_idx" ON "CompanyHierarchy"("level");`;

        await prisma.$executeRaw `CREATE INDEX IF NOT EXISTS "CompanyMetric_companyId_idx" ON "CompanyMetric"("companyId");`;
        await prisma.$executeRaw `CREATE INDEX IF NOT EXISTS "CompanyMetric_metricType_idx" ON "CompanyMetric"("metricType");`;
        await prisma.$executeRaw `CREATE INDEX IF NOT EXISTS "CompanyMetric_period_idx" ON "CompanyMetric"("period");`;
        await prisma.$executeRaw `CREATE INDEX IF NOT EXISTS "CompanyMetric_effectiveDate_idx" ON "CompanyMetric"("effectiveDate");`;

        await prisma.$executeRaw `CREATE INDEX IF NOT EXISTS "CompanyDocument_companyId_idx" ON "CompanyDocument"("companyId");`;
        await prisma.$executeRaw `CREATE INDEX IF NOT EXISTS "CompanyDocument_documentType_idx" ON "CompanyDocument"("documentType");`;
        await prisma.$executeRaw `CREATE INDEX IF NOT EXISTS "CompanyDocument_status_idx" ON "CompanyDocument"("status");`;
        await prisma.$executeRaw `CREATE INDEX IF NOT EXISTS "CompanyDocument_uploadedBy_idx" ON "CompanyDocument"("uploadedBy");`;

        res.json({
            success: true,
            message: 'Company management system tables created successfully',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Table creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Table creation failed',
            error: error.message
        });
    }
});

module.exports = router;