const express = require('express');
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const router = express.Router();
const prisma = new PrismaClient();

// ===== HEALTH CHECK =====

/**
 * GET /contracts/health - Contracts system health check
 */
router.get('/health', async (req, res) => {
    try {
        const [totalContracts, totalTemplates, totalSignatures] = await Promise.all([
            prisma.legalDocument.count(),
            prisma.legalDocument.count({
                where: { status: 'APPROVED' }
            }),
            prisma.legalDocumentSignature.count()
        ]);

        res.json({
            success: true,
            message: 'Contracts system is healthy',
            status: 'healthy',
            metrics: {
                totalContracts,
                totalTemplates,
                totalSignatures,
                averageSignaturesPerContract: totalContracts > 0 ? (totalSignatures / totalContracts).toFixed(2) : 0
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Contracts health check error:', error);
        res.status(500).json({
            success: false,
            message: 'Contracts system health check failed',
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// ===== CONTRACT TEMPLATES SYSTEM =====

/**
 * GET /contracts/templates - Get all contract templates
 */
router.get('/templates', async (req, res) => {
    try {
        const templates = await prisma.legalDocument.findMany({
            where: {
                type: {
                    in: [
                        'ARTICLES_OF_INCORPORATION',
                        'BYLAWS',
                        'OPERATING_AGREEMENT',
                        'PARTNERSHIP_AGREEMENT',
                        'EMPLOYMENT_CONTRACT',
                        'EQUITY_AGREEMENT',
                        'VESTING_SCHEDULE',
                        'INTELLECTUAL_PROPERTY',
                        'CONFIDENTIALITY_AGREEMENT',
                        'TERMS_OF_SERVICE',
                        'PRIVACY_POLICY'
                    ]
                },
                status: 'APPROVED'
            },
            orderBy: { createdAt: 'desc' },
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
            message: 'Contract templates retrieved successfully',
            templates: templates.map(t => ({
                id: t.id,
                title: t.title,
                type: t.type,
                version: t.version,
                status: t.status,
                requiresSignature: t.requiresSignature,
                complianceRequired: t.complianceRequired,
                effectiveDate: t.effectiveDate,
                expiryDate: t.expiryDate,
                signatureCount: t.signatures.length,
                createdAt: t.createdAt,
                updatedAt: t.updatedAt
            })),
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Contract templates retrieval error:', error);
        res.status(500).json({
            error: 'Failed to retrieve contract templates',
            details: error.message
        });
    }
});

/**
 * GET /contracts/templates/:type - Get contract template by type
 */
router.get('/templates/:type', async (req, res) => {
    try {
        const { type } = req.params;
        
        const template = await prisma.legalDocument.findFirst({
            where: {
                type: type.toUpperCase(),
                status: 'APPROVED'
            },
            orderBy: { version: 'desc' },
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

        if (!template) {
            return res.status(404).json({
                error: 'Contract template not found',
                details: `No approved template found for type: ${type}`
            });
        }

        res.json({
            success: true,
            message: 'Contract template retrieved successfully',
            template: {
                id: template.id,
                title: template.title,
                type: template.type,
                content: template.content,
                version: template.version,
                status: template.status,
                requiresSignature: template.requiresSignature,
                complianceRequired: template.complianceRequired,
                effectiveDate: template.effectiveDate,
                expiryDate: template.expiryDate,
                signatures: template.signatures,
                createdAt: template.createdAt,
                updatedAt: template.updatedAt
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Contract template retrieval error:', error);
        res.status(500).json({
            error: 'Failed to retrieve contract template',
            details: error.message
        });
    }
});

// ===== CONTRACT CREATION & MANAGEMENT =====

/**
 * POST /contracts/create - Create a new contract from template
 */
router.post('/create', async (req, res) => {
    try {
        const {
            templateType,
            projectId,
            entityId,
            title,
            content,
            requiresSignature = true,
            complianceRequired = false,
            effectiveDate,
            expiryDate,
            createdBy
        } = req.body;

        if (!templateType || !title || !content || !createdBy) {
            return res.status(400).json({
                error: 'Missing required fields',
                details: 'templateType, title, content, and createdBy are required'
            });
        }

        // Create the contract
        const contract = await prisma.legalDocument.create({
            data: {
                title,
                type: templateType.toUpperCase(),
                content,
                version: '1.0',
                status: 'DRAFT',
                requiresSignature,
                complianceRequired,
                effectiveDate: effectiveDate ? new Date(effectiveDate) : null,
                expiryDate: expiryDate ? new Date(expiryDate) : null,
                projectId: projectId || null,
                entityId: entityId || null,
                createdBy
            }
        });

        res.json({
            success: true,
            message: 'Contract created successfully',
            contract: {
                id: contract.id,
                title: contract.title,
                type: contract.type,
                version: contract.version,
                status: contract.status,
                requiresSignature: contract.requiresSignature,
                complianceRequired: contract.complianceRequired,
                effectiveDate: contract.effectiveDate,
                expiryDate: contract.expiryDate,
                projectId: contract.projectId,
                entityId: contract.entityId,
                createdAt: contract.createdAt,
                updatedAt: contract.updatedAt
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Contract creation error:', error);
        res.status(500).json({
            error: 'Failed to create contract',
            details: error.message
        });
    }
});

/**
 * PUT /contracts/:id - Update contract
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title,
            content,
            status,
            effectiveDate,
            expiryDate,
            requiresSignature,
            complianceRequired
        } = req.body;

        const contract = await prisma.legalDocument.update({
            where: { id },
            data: {
                ...(title && { title }),
                ...(content && { content }),
                ...(status && { status: status.toUpperCase() }),
                ...(effectiveDate && { effectiveDate: new Date(effectiveDate) }),
                ...(expiryDate && { expiryDate: new Date(expiryDate) }),
                ...(typeof requiresSignature === 'boolean' && { requiresSignature }),
                ...(typeof complianceRequired === 'boolean' && { complianceRequired }),
                updatedAt: new Date()
            }
        });

        res.json({
            success: true,
            message: 'Contract updated successfully',
            contract: {
                id: contract.id,
                title: contract.title,
                type: contract.type,
                version: contract.version,
                status: contract.status,
                requiresSignature: contract.requiresSignature,
                complianceRequired: contract.complianceRequired,
                effectiveDate: contract.effectiveDate,
                expiryDate: contract.expiryDate,
                projectId: contract.projectId,
                entityId: contract.entityId,
                createdAt: contract.createdAt,
                updatedAt: contract.updatedAt
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Contract update error:', error);
        res.status(500).json({
            error: 'Failed to update contract',
            details: error.message
        });
    }
});

/**
 * DELETE /contracts/:id - Delete contract (soft delete)
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Check if contract has signatures
        const signatures = await prisma.legalDocumentSignature.findMany({
            where: { documentId: id }
        });

        if (signatures.length > 0) {
            return res.status(400).json({
                error: 'Cannot delete signed contract',
                details: 'Contract has signatures and cannot be deleted'
            });
        }

        // Soft delete by setting status to TERMINATED
        const contract = await prisma.legalDocument.update({
            where: { id },
            data: {
                status: 'TERMINATED',
                updatedAt: new Date()
            }
        });

        res.json({
            success: true,
            message: 'Contract terminated successfully',
            contract: {
                id: contract.id,
                title: contract.title,
                status: contract.status,
                updatedAt: contract.updatedAt
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Contract termination error:', error);
        res.status(500).json({
            error: 'Failed to terminate contract',
            details: error.message
        });
    }
});

// ===== DIGITAL SIGNING SYSTEM =====

/**
 * POST /contracts/:id/sign - Sign a contract digitally
 */
router.post('/:id/sign', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            signerId,
            termsAccepted = true,
            privacyAccepted = true,
            ipAddress,
            userAgent
        } = req.body;

        if (!signerId) {
            return res.status(400).json({
                error: 'Missing required fields',
                details: 'signerId is required'
            });
        }

        // Check if contract exists and requires signature
        const contract = await prisma.legalDocument.findUnique({
            where: { id },
            include: {
                signatures: {
                    where: { signerId }
                }
            }
        });

        if (!contract) {
            return res.status(404).json({
                error: 'Contract not found',
                details: 'The specified contract does not exist'
            });
        }

        if (!contract.requiresSignature) {
            return res.status(400).json({
                error: 'Contract does not require signature',
                details: 'This contract does not require digital signatures'
            });
        }

        // Check if already signed by this user
        if (contract.signatures.length > 0) {
            return res.status(400).json({
                error: 'Already signed',
                details: 'This user has already signed this contract'
            });
        }

        // Generate signature hash
        const signatureData = `${contract.id}-${signerId}-${contract.version}-${new Date().toISOString()}`;
        const signatureHash = crypto.createHash('sha256').update(signatureData).digest('hex');

        // Create signature record
        const signature = await prisma.legalDocumentSignature.create({
            data: {
                documentId: id,
                signerId,
                signatureHash,
                ipAddress: ipAddress || req.ip,
                userAgent: userAgent || req.get('User-Agent'),
                termsAccepted,
                privacyAccepted,
                identityVerified: true // Assuming KYC is already done
            }
        });

        // Update contract status if all required signatures are complete
        const allSignatures = await prisma.legalDocumentSignature.findMany({
            where: { documentId: id }
        });

        // For now, assume single signature is sufficient
        // In a real system, you'd check against required signers
        if (allSignatures.length >= 1) {
            await prisma.legalDocument.update({
                where: { id },
                data: {
                    status: 'EFFECTIVE',
                    effectiveDate: new Date(),
                    updatedAt: new Date()
                }
            });
        }

        res.json({
            success: true,
            message: 'Contract signed successfully',
            signature: {
                id: signature.id,
                documentId: signature.documentId,
                signerId: signature.signerId,
                signatureHash: signature.signatureHash,
                signedAt: signature.signedAt,
                termsAccepted: signature.termsAccepted,
                privacyAccepted: signature.privacyAccepted,
                identityVerified: signature.identityVerified
            },
            contractStatus: 'EFFECTIVE',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Contract signing error:', error);
        res.status(500).json({
            error: 'Failed to sign contract',
            details: error.message
        });
    }
});

/**
 * GET /contracts/:id/signatures - Get all signatures for a contract
 */
router.get('/:id/signatures', async (req, res) => {
    try {
        const { id } = req.params;

        const signatures = await prisma.legalDocumentSignature.findMany({
            where: { documentId: id },
            include: {
                signer: {
                    select: { id: true, name: true, email: true }
                }
            },
            orderBy: { signedAt: 'asc' }
        });

        res.json({
            success: true,
            message: 'Contract signatures retrieved successfully',
            signatures: signatures.map(s => ({
                id: s.id,
                signerId: s.signerId,
                signerName: s.signer.name,
                signerEmail: s.signer.email,
                signatureHash: s.signatureHash,
                signedAt: s.signedAt,
                ipAddress: s.ipAddress,
                userAgent: s.userAgent,
                termsAccepted: s.termsAccepted,
                privacyAccepted: s.privacyAccepted,
                identityVerified: s.identityVerified
            })),
            totalSignatures: signatures.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Contract signatures retrieval error:', error);
        res.status(500).json({
            error: 'Failed to retrieve contract signatures',
            details: error.message
        });
    }
});

// ===== CONTRACT QUERIES & SEARCH =====

/**
 * GET /contracts - Get all contracts with filtering
 */
router.get('/', async (req, res) => {
    try {
        const {
            type,
            status,
            projectId,
            entityId,
            requiresSignature,
            page = 1,
            limit = 20
        } = req.query;

        const where = {};
        if (type) where.type = type.toUpperCase();
        if (status) where.status = status.toUpperCase();
        if (projectId) where.projectId = projectId;
        if (entityId) where.entityId = entityId;
        if (typeof requiresSignature === 'boolean') where.requiresSignature = requiresSignature;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [contracts, total] = await Promise.all([
            prisma.legalDocument.findMany({
                where,
                skip,
                take: parseInt(limit),
                orderBy: { updatedAt: 'desc' },
                include: {
                    signatures: {
                        include: {
                            signer: {
                                select: { id: true, name: true, email: true }
                            }
                        }
                    },
                    project: {
                        select: { id: true, name: true }
                    },
                    entity: {
                        select: { id: true, name: true }
                    }
                }
            }),
            prisma.legalDocument.count({ where })
        ]);

        res.json({
            success: true,
            message: 'Contracts retrieved successfully',
            contracts: contracts.map(c => ({
                id: c.id,
                title: c.title,
                type: c.type,
                version: c.version,
                status: c.status,
                requiresSignature: c.requiresSignature,
                complianceRequired: c.complianceRequired,
                effectiveDate: c.effectiveDate,
                expiryDate: c.expiryDate,
                projectId: c.projectId,
                projectName: c.project?.name,
                entityId: c.entityId,
                entityName: c.entity?.name,
                signatureCount: c.signatures.length,
                createdAt: c.createdAt,
                updatedAt: c.updatedAt
            })),
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Contracts retrieval error:', error);
        res.status(500).json({
            error: 'Failed to retrieve contracts',
            details: error.message
        });
    }
});

/**
 * GET /contracts/:id - Get specific contract details
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const contract = await prisma.legalDocument.findUnique({
            where: { id },
            include: {
                signatures: {
                    include: {
                        signer: {
                            select: { id: true, name: true, email: true }
                        }
                    }
                },
                project: {
                    select: { id: true, name: true, summary: true }
                },
                entity: {
                    select: { id: true, name: true, type: true }
                }
            }
        });

        if (!contract) {
            return res.status(404).json({
                error: 'Contract not found',
                details: 'The specified contract does not exist'
            });
        }

        res.json({
            success: true,
            message: 'Contract retrieved successfully',
            contract: {
                id: contract.id,
                title: contract.title,
                type: contract.type,
                content: contract.content,
                version: contract.version,
                status: contract.status,
                requiresSignature: contract.requiresSignature,
                complianceRequired: contract.complianceRequired,
                effectiveDate: contract.effectiveDate,
                expiryDate: contract.expiryDate,
                projectId: contract.projectId,
                project: contract.project,
                entityId: contract.entityId,
                entity: contract.entity,
                signatures: contract.signatures,
                signatureCount: contract.signatures.length,
                createdAt: contract.createdAt,
                updatedAt: contract.updatedAt
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Contract retrieval error:', error);
        res.status(500).json({
            error: 'Failed to retrieve contract',
            details: error.message
        });
    }
});

// ===== CONTRACT TEMPLATE MANAGEMENT =====

/**
 * POST /contracts/templates/create - Create a new contract template
 */
router.post('/templates/create', async (req, res) => {
    try {
        const {
            title,
            type,
            content,
            requiresSignature = true,
            complianceRequired = true,
            effectiveDate,
            expiryDate,
            createdBy
        } = req.body;

        if (!title || !type || !content || !createdBy) {
            return res.status(400).json({
                error: 'Missing required fields',
                details: 'title, type, content, and createdBy are required'
            });
        }

        // Validate document type
        const validTypes = [
            'ARTICLES_OF_INCORPORATION',
            'BYLAWS',
            'OPERATING_AGREEMENT',
            'PARTNERSHIP_AGREEMENT',
            'EMPLOYMENT_CONTRACT',
            'EQUITY_AGREEMENT',
            'VESTING_SCHEDULE',
            'INTELLECTUAL_PROPERTY',
            'CONFIDENTIALITY_AGREEMENT',
            'TERMS_OF_SERVICE',
            'PRIVACY_POLICY'
        ];

        if (!validTypes.includes(type.toUpperCase())) {
            return res.status(400).json({
                error: 'Invalid document type',
                details: `Type must be one of: ${validTypes.join(', ')}`
            });
        }

        const template = await prisma.legalDocument.create({
            data: {
                title,
                type: type.toUpperCase(),
                content,
                version: '1.0',
                status: 'DRAFT',
                requiresSignature,
                complianceRequired,
                effectiveDate: effectiveDate ? new Date(effectiveDate) : null,
                expiryDate: expiryDate ? new Date(expiryDate) : null,
                createdBy
            }
        });

        res.json({
            success: true,
            message: 'Contract template created successfully',
            template: {
                id: template.id,
                title: template.title,
                type: template.type,
                version: template.version,
                status: template.status,
                requiresSignature: template.requiresSignature,
                complianceRequired: template.complianceRequired,
                effectiveDate: template.effectiveDate,
                expiryDate: template.expiryDate,
                createdAt: template.createdAt,
                updatedAt: template.updatedAt
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Contract template creation error:', error);
        res.status(500).json({
            error: 'Failed to create contract template',
            details: error.message
        });
    }
});

/**
 * PUT /contracts/templates/:id/approve - Approve a contract template
 */
router.put('/templates/:id/approve', async (req, res) => {
    try {
        const { id } = req.params;
        const { approvedBy } = req.body;

        if (!approvedBy) {
            return res.status(400).json({
                error: 'Missing required fields',
                details: 'approvedBy is required'
            });
        }

        const template = await prisma.legalDocument.update({
            where: { id },
            data: {
                status: 'APPROVED',
                effectiveDate: new Date(),
                updatedAt: new Date()
            }
        });

        res.json({
            success: true,
            message: 'Contract template approved successfully',
            template: {
                id: template.id,
                title: template.title,
                type: template.type,
                version: template.version,
                status: template.status,
                effectiveDate: template.effectiveDate,
                updatedAt: template.updatedAt
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Contract template approval error:', error);
        res.status(500).json({
            error: 'Failed to approve contract template',
            details: error.message
        });
    }
});

// ===== CONTRACT COMPLIANCE & AUDIT =====

/**
 * GET /contracts/compliance/status - Get compliance status for all contracts
 */
router.get('/compliance/status', async (req, res) => {
    try {
        const contracts = await prisma.legalDocument.findMany({
            where: {
                complianceRequired: true
            },
            include: {
                signatures: true,
                project: {
                    select: { id: true, name: true }
                }
            }
        });

        const complianceStatus = contracts.map(contract => {
            const isCompliant = contract.status === 'EFFECTIVE' && contract.signatures.length > 0;
            const isExpired = contract.expiryDate && new Date() > new Date(contract.expiryDate);
            
            return {
                id: contract.id,
                title: contract.title,
                type: contract.type,
                status: contract.status,
                isCompliant,
                isExpired,
                effectiveDate: contract.effectiveDate,
                expiryDate: contract.expiryDate,
                signatureCount: contract.signatures.length,
                projectId: contract.projectId,
                projectName: contract.project?.name,
                complianceIssues: []
            };
        });

        res.json({
            success: true,
            message: 'Compliance status retrieved successfully',
            complianceStatus,
            summary: {
                total: complianceStatus.length,
                compliant: complianceStatus.filter(c => c.isCompliant).length,
                nonCompliant: complianceStatus.filter(c => !c.isCompliant).length,
                expired: complianceStatus.filter(c => c.isExpired).length
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Compliance status retrieval error:', error);
        res.status(500).json({
            error: 'Failed to retrieve compliance status',
            details: error.message
        });
    }
});

module.exports = router;
