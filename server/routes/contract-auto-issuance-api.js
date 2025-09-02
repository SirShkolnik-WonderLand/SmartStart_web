const express = require('express');
const { PrismaClient } = require('@prisma/client');
const ContractTemplateEngine = require('../services/contract-template-engine');

const router = express.Router();
const prisma = new PrismaClient();
const templateEngine = new ContractTemplateEngine();

/**
 * Contract Auto-Issuance API Routes
 * Handles automatic contract generation and issuance for ventures
 */

// Health check endpoint
router.get('/health', async (req, res) => {
    try {
        const metrics = await getAutoIssuanceMetrics();
        res.json({
            success: true,
            message: 'Contract Auto-Issuance API is healthy',
            timestamp: new Date().toISOString(),
            metrics
        });
    } catch (error) {
        console.error('Health check failed:', error);
        res.status(500).json({
            success: false,
            message: 'Health check failed',
            error: error.message
        });
    }
});

// Get available contract types for auto-issuance
router.get('/templates', async (req, res) => {
    try {
        const templates = await templateEngine.getAvailableContractTypes();
        res.json({
            success: true,
            message: 'Available contract templates retrieved successfully',
            templates,
            count: templates.length
        });
    } catch (error) {
        console.error('Failed to get templates:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get contract templates',
            error: error.message
        });
    }
});

// Auto-issue contract for a venture
router.post('/issue/:ventureId', async (req, res) => {
    try {
        const { ventureId } = req.params;
        const { contractType, context = {} } = req.body;

        if (!contractType) {
            return res.status(400).json({
                success: false,
                message: 'Contract type is required'
            });
        }

        // Validate venture exists
        const venture = await prisma.venture.findUnique({
            where: { id: ventureId }
        });

        if (!venture) {
            return res.status(404).json({
                success: false,
                message: 'Venture not found'
            });
        }

        // Auto-issue the contract
        const contract = await templateEngine.autoIssueContract(ventureId, contractType, context);

        res.json({
            success: true,
            message: `Contract ${contractType} auto-issued successfully`,
            contract: {
                id: contract.id,
                title: contract.title,
                type: contract.type,
                status: contract.status,
                createdAt: contract.createdAt
            }
        });

    } catch (error) {
        console.error('Failed to auto-issue contract:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to auto-issue contract',
            error: error.message
        });
    }
});

// Auto-issue all required contracts for venture onboarding
router.post('/onboard/:ventureId', async (req, res) => {
    try {
        const { ventureId } = req.params;
        const { skipExisting = false } = req.body;

        // Validate venture exists
        const venture = await prisma.venture.findUnique({
            where: { id: ventureId }
        });

        if (!venture) {
            return res.status(404).json({
                success: false,
                message: 'Venture not found'
            });
        }

        // Define required contracts for onboarding
        const requiredContracts = [
            'EQUITY_AGREEMENT',
            'VESTING_SCHEDULE',
            'CONFIDENTIALITY_AGREEMENT'
        ];

        const results = [];
        const errors = [];

        for (const contractType of requiredContracts) {
            try {
                // Check if contract already exists
                if (skipExisting) {
                    const existingContract = await prisma.legalDocument.findFirst({
                        where: {
                            ventureId,
                            type: contractType,
                            isTemplate: false
                        }
                    });

                    if (existingContract) {
                        results.push({
                            contractType,
                            status: 'SKIPPED',
                            message: 'Contract already exists',
                            contractId: existingContract.id
                        });
                        continue;
                    }
                }

                // Auto-issue the contract
                const contract = await templateEngine.autoIssueContract(ventureId, contractType);

                results.push({
                    contractType,
                    status: 'ISSUED',
                    message: 'Contract auto-issued successfully',
                    contractId: contract.id
                });

            } catch (error) {
                errors.push({
                    contractType,
                    status: 'FAILED',
                    message: error.message
                });
            }
        }

        const successCount = results.filter(r => r.status === 'ISSUED').length;
        const skippedCount = results.filter(r => r.status === 'SKIPPED').length;
        const failedCount = errors.length;

        res.json({
            success: true,
            message: `Venture onboarding contracts processed`,
            summary: {
                total: requiredContracts.length,
                issued: successCount,
                skipped: skippedCount,
                failed: failedCount
            },
            results,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        console.error('Failed to process venture onboarding:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process venture onboarding',
            error: error.message
        });
    }
});

// Preview contract content before issuance
router.post('/preview/:ventureId', async (req, res) => {
    try {
        const { ventureId } = req.params;
        const { contractType, context = {} } = req.body;

        if (!contractType) {
            return res.status(400).json({
                success: false,
                message: 'Contract type is required'
            });
        }

        // Generate contract content preview
        const preview = await templateEngine.generateContractContent(contractType, ventureId, context);

        res.json({
            success: true,
            message: 'Contract preview generated successfully',
            preview: {
                content: preview.content,
                variables: preview.variables,
                generatedAt: preview.generatedAt,
                templateId: preview.templateId
            }
        });

    } catch (error) {
        console.error('Failed to generate contract preview:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate contract preview',
            error: error.message
        });
    }
});

// Validate contract template
router.get('/validate/:templateId', async (req, res) => {
    try {
        const { templateId } = req.params;
        const validation = await templateEngine.validateTemplate(templateId);

        res.json({
            success: true,
            message: 'Template validation completed',
            validation
        });

    } catch (error) {
        console.error('Failed to validate template:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to validate template',
            error: error.message
        });
    }
});

// Get auto-issuance metrics
async function getAutoIssuanceMetrics() {
    try {
        const [
            totalTemplates,
            totalAutoIssued,
            venturesWithContracts,
            recentIssuances
        ] = await Promise.all([
            prisma.legalDocument.count({
                where: { entityId: null, projectId: null, status: 'APPROVED' }
            }),
            prisma.legalDocument.count({
                where: {
                    createdBy: 'system-auto-issue'
                }
            }),
            prisma.legalDocument.count({
                where: {
                    entityId: { not: null }
                }
            }),
            prisma.legalDocument.count({
                where: {
                    createdBy: 'system-auto-issue',
                    createdAt: {
                        gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
                    }
                }
            })
        ]);

        return {
            totalTemplates,
            totalAutoIssued,
            venturesWithContracts,
            recentIssuances24h: recentIssuances,
            autoIssuanceRate: totalAutoIssued > 0 ?
                ((recentIssuances / totalAutoIssued) * 100).toFixed(2) + '%' : '0%'
        };
    } catch (error) {
        console.error('Failed to get auto-issuance metrics:', error);
        return {
            totalTemplates: 0,
            totalAutoIssued: 0,
            venturesWithContracts: 0,
            recentIssuances24h: 0,
            autoIssuanceRate: '0%'
        };
    }
}

// Get venture contract status
router.get('/venture/:ventureId/status', async (req, res) => {
    try {
        const { ventureId } = req.params;

        // Get venture with all contracts
        const venture = await prisma.venture.findUnique({
            where: { id: ventureId },
            include: {
                legalDocuments: {
                    where: { isTemplate: false },
                    select: {
                        id: true,
                        type: true,
                        title: true,
                        status: true,
                        requiresSignature: true,
                        createdAt: true,
                        signatures: {
                            select: {
                                id: true,
                                signerId: true,
                                signedAt: true
                            }
                        }
                    }
                }
            }
        });

        if (!venture) {
            return res.status(404).json({
                success: false,
                message: 'Venture not found'
            });
        }

        // Analyze contract status
        const contractStatus = {
            ventureId: venture.id,
            ventureName: venture.name,
            totalContracts: venture.legalDocuments.length,
            contractsByType: {},
            signatureStatus: {},
            complianceStatus: {}
        };

        for (const contract of venture.legalDocuments) {
            // Count by type
            if (!contractStatus.contractsByType[contract.type]) {
                contractStatus.contractsByType[contract.type] = 0;
            }
            contractStatus.contractsByType[contract.type]++;

            // Signature status
            if (contract.requiresSignature) {
                const signedCount = contract.signatures.length;
                contractStatus.signatureStatus[contract.id] = {
                    type: contract.type,
                    signed: signedCount > 0,
                    signatureCount: signedCount,
                    status: contract.status
                };
            }

            // Compliance status
            contractStatus.complianceStatus[contract.id] = {
                type: contract.type,
                status: contract.status,
                compliant: contract.status === 'EFFECTIVE'
            };
        }

        res.json({
            success: true,
            message: 'Venture contract status retrieved successfully',
            contractStatus
        });

    } catch (error) {
        console.error('Failed to get venture contract status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get venture contract status',
            error: error.message
        });
    }
});

module.exports = router;