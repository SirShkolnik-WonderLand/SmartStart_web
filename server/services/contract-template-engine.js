const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

/**
 * Contract Template Engine for AliceSolutions Hub
 * Handles dynamic template generation, variable substitution, and auto-issuance
 */
class ContractTemplateEngine {
    constructor() {
        this.templateVariables = {
            // Venture-specific variables
            '{{VENTURE_NAME}}': 'venture.name',
            '{{VENTURE_PURPOSE}}': 'venture.purpose',
            '{{VENTURE_REGION}}': 'venture.region',
            '{{VENTURE_CREATED_AT}}': 'venture.createdAt',

            // Owner variables
            '{{OWNER_NAME}}': 'owner.displayName',
            '{{OWNER_EMAIL}}': 'owner.email',
            '{{OWNER_KYC_STATUS}}': 'owner.kycStatus',
            '{{OWNER_TRUST_SCORE}}': 'owner.trustScore',

            // Equity framework variables
            '{{OWNER_EQUITY_PERCENT}}': 'equity.ownerPercent',
            '{{ALICE_EQUITY_PERCENT}}': 'equity.alicePercent',
            '{{CEP_PERCENT}}': 'equity.cepPercent',
            '{{VESTING_POLICY}}': 'equity.vestingPolicy',

            // Legal entity variables
            '{{LEGAL_ENTITY_NAME}}': 'legalEntity.name',
            '{{TAX_ID}}': 'legalEntity.taxId',
            '{{JURISDICTION}}': 'legalEntity.jurisdiction',
            '{{INCORPORATION_DATE}}': 'legalEntity.incorporationDate',

            // System variables
            '{{CURRENT_DATE}}': 'system.currentDate',
            '{{CONTRACT_VERSION}}': 'system.contractVersion',
            '{{ALICESOLUTIONS_LEGAL_NAME}}': 'system.aliceSolutionsLegalName',
            '{{ALICESOLUTIONS_ADDRESS}}': 'system.aliceSolutionsAddress',
            '{{ALICESOLUTIONS_TAX_ID}}': 'system.aliceSolutionsTaxId'
        };
    }

    /**
     * Generate contract content with variable substitution
     */
    async generateContractContent(templateType, ventureId, context = {}) {
        try {
            // Get the base template
            const template = await this.getTemplateByType(templateType);
            if (!template) {
                throw new Error(`Template not found for type: ${templateType}`);
            }

            // Get venture and related data
            const venture = await this.getVentureWithContext(ventureId);
            if (!venture) {
                throw new Error(`Venture not found: ${ventureId}`);
            }

            // Build context object for variable substitution
            const substitutionContext = await this.buildSubstitutionContext(venture, context);

            // Perform variable substitution
            let content = template.content;
            for (const [placeholder, value] of Object.entries(substitutionContext)) {
                content = content.replace(new RegExp(placeholder, 'g'), value || '');
            }

            return {
                content,
                templateId: template.id,
                variables: substitutionContext,
                generatedAt: new Date()
            };
        } catch (error) {
            console.error('Error generating contract content:', error);
            throw error;
        }
    }

    /**
     * Get template by type
     */
    async getTemplateByType(templateType) {
        return await prisma.legalDocument.findFirst({
            where: {
                type: templateType,
                status: 'APPROVED',
                entityId: null,
                projectId: null
            },
            orderBy: { version: 'desc' }
        });
    }

    /**
     * Get venture with all necessary context
     */
    async getVentureWithContext(ventureId) {
        return await prisma.venture.findUnique({
            where: { id: ventureId },
            include: {
                owner: {
                    select: {
                        id: true,
                        displayName: true,
                        email: true,
                        kycStatus: true,
                        trustScore: true
                    }
                },
                legalEntity: true,
                equityFramework: true
            }
        });
    }

    /**
     * Build substitution context for variable replacement
     */
    async buildSubstitutionContext(venture, additionalContext = {}) {
        const systemContext = {
            '{{CURRENT_DATE}}': new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            '{{CONTRACT_VERSION}}': '1.0',
            '{{ALICESOLUTIONS_LEGAL_NAME}}': 'AliceSolutions Inc.',
            '{{ALICESOLUTIONS_ADDRESS}}': '123 Innovation Drive, Tech City, TC 12345',
            '{{ALICESOLUTIONS_TAX_ID}}': '12-3456789'
        };

        const ventureContext = {
            '{{VENTURE_NAME}}': venture.name || '',
            '{{VENTURE_PURPOSE}}': venture.purpose || '',
            '{{VENTURE_REGION}}': venture.region || '',
            '{{VENTURE_CREATED_AT}}': venture.createdAt ?
                new Date(venture.createdAt).toLocaleDateString('en-US') : ''
        };

        const ownerContext = venture.owner ? {
            '{{OWNER_NAME}}': venture.owner.displayName || '',
            '{{OWNER_EMAIL}}': venture.owner.email || '',
            '{{OWNER_KYC_STATUS}}': venture.owner.kycStatus || 'PENDING',
            '{{OWNER_TRUST_SCORE}}': venture.owner.trustScore ? .toString() || '0'
        } : {};

        const equityContext = venture.equityFramework ? {
            '{{OWNER_EQUITY_PERCENT}}': venture.equityFramework.ownerPercent ? .toString() || '35',
            '{{ALICE_EQUITY_PERCENT}}': venture.equityFramework.alicePercent ? .toString() || '20',
            '{{CEP_PERCENT}}': venture.equityFramework.cepPercent ? .toString() || '45',
            '{{VESTING_POLICY}}': venture.equityFramework.vestingPolicy || '4-year vest, 1-year cliff'
        } : {};

        const legalContext = venture.legalEntity ? {
            '{{LEGAL_ENTITY_NAME}}': venture.legalEntity.name || '',
            '{{TAX_ID}}': venture.legalEntity.taxId || '',
            '{{JURISDICTION}}': venture.legalEntity.jurisdiction || '',
            '{{INCORPORATION_DATE}}': venture.legalEntity.incorporationDate ?
                new Date(venture.legalEntity.incorporationDate).toLocaleDateString('en-US') : ''
        } : {};

        return {
            ...systemContext,
            ...ventureContext,
            ...ownerContext,
            ...equityContext,
            ...legalContext,
            ...additionalContext
        };
    }

    /**
     * Auto-issue contract based on venture creation
     */
    async autoIssueContract(ventureId, contractType, context = {}) {
        try {
            console.log(`🚀 Auto-issuing ${contractType} for venture: ${ventureId}`);

            // Generate contract content
            const generatedContract = await this.generateContractContent(contractType, ventureId, context);

            // Create the contract record
            const contract = await prisma.legalDocument.create({
                data: {
                    title: `${contractType.replace('_', ' ')} - ${generatedContract.variables['{{VENTURE_NAME}}'] || 'Venture'}`,
                    type: contractType,
                    content: generatedContract.content,
                    version: generatedContract.variables['{{CONTRACT_VERSION}}'],
                    status: 'DRAFT',
                    requiresSignature: true,
                    complianceRequired: true,
                    entityId: ventureId, // Link to venture
                    createdBy: 'system-auto-issue',
                    effectiveDate: null
                }
            });

            console.log(`✅ Auto-issued contract: ${contract.id} (${contractType})`);

            // Trigger contract workflow
            await this.triggerContractWorkflow(contract.id, contractType);

            return contract;
        } catch (error) {
            console.error(`❌ Failed to auto-issue ${contractType}:`, error);
            throw error;
        }
    }

    /**
     * Trigger appropriate workflow based on contract type
     */
    async triggerContractWorkflow(contractId, contractType) {
        switch (contractType) {
            case 'EQUITY_AGREEMENT':
                await this.triggerFounderWorkflow(contractId);
                break;
            case 'EMPLOYMENT_CONTRACT':
                await this.triggerContributorWorkflow(contractId);
                break;
            case 'INTELLECTUAL_PROPERTY':
                await this.triggerIPAssignmentWorkflow(contractId);
                break;
            case 'CONFIDENTIALITY_AGREEMENT':
                await this.triggerNDAWorkflow(contractId);
                break;
            case 'VESTING_SCHEDULE':
                await this.triggerEquitySplitWorkflow(contractId);
                break;
            default:
                console.log(`⚠️ No specific workflow for contract type: ${contractType}`);
        }
    }

    /**
     * Trigger founder agreement workflow
     */
    async triggerFounderWorkflow(contractId) {
        console.log(`🎯 Triggering founder workflow for contract: ${contractId}`);
        // TODO: Implement founder-specific workflow
        // - Send signature request to founder
        // - Set up equity framework
        // - Provision IT pack
    }

    /**
     * Trigger contributor agreement workflow
     */
    async triggerContributorWorkflow(contractId) {
        console.log(`🎯 Triggering contributor workflow for contract: ${contractId}`);
        // TODO: Implement contributor-specific workflow
        // - Send signature request to contributor
        // - Assign role and permissions
        // - Set up BUZ earning
    }

    /**
     * Trigger IP assignment workflow
     */
    async triggerIPAssignmentWorkflow(contractId) {
        console.log(`🎯 Triggering IP assignment workflow for contract: ${contractId}`);
        // TODO: Implement IP assignment workflow
        // - Track IP contributions
        // - Update equity ledger
        // - Monitor compliance
    }

    /**
     * Trigger NDA workflow
     */
    async triggerNDAWorkflow(contractId) {
        console.log(`🎯 Triggering NDA workflow for contract: ${contractId}`);
        // TODO: Implement NDA workflow
        // - Set confidentiality levels
        // - Monitor data access
        // - Track violations
    }

    /**
     * Trigger equity split workflow
     */
    async triggerEquitySplitWorkflow(contractId) {
        console.log(`🎯 Triggering equity split workflow for contract: ${contractId}`);
        // TODO: Implement equity split workflow
        // - Calculate cap table
        // - Set vesting schedules
        // - Monitor equity changes
    }

    /**
     * Get all available contract types
     */
    async getAvailableContractTypes() {
        return await prisma.legalDocument.findMany({
            where: {
                entityId: null,
                projectId: null,
                status: 'APPROVED'
            },
            select: {
                type: true,
                title: true,
                version: true
            },
            orderBy: { type: 'asc' }
        });
    }

    /**
     * Validate contract template
     */
    async validateTemplate(templateId) {
        const template = await prisma.legalDocument.findUnique({
            where: { id: templateId },
            include: {
                signatures: true,
                complianceRecords: true
            }
        });

        if (!template) {
            throw new Error('Template not found');
        }

        const validation = {
            isValid: true,
            errors: [],
            warnings: []
        };

        // Check if template is approved
        if (template.status !== 'APPROVED') {
            validation.isValid = false;
            validation.errors.push('Template is not approved');
        }

        // Check if template has required fields
        if (!template.content || template.content.trim().length === 0) {
            validation.isValid = false;
            validation.errors.push('Template content is empty');
        }

        // Check for required variables
        const requiredVariables = ['{{VENTURE_NAME}}', '{{OWNER_NAME}}'];
        for (const variable of requiredVariables) {
            if (!template.content.includes(variable)) {
                validation.warnings.push(`Missing required variable: ${variable}`);
            }
        }

        return validation;
    }
}

module.exports = ContractTemplateEngine;