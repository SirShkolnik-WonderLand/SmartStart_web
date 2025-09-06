const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Venture Management Service for AliceSolutions Hub
 * Handles venture creation, legal entity setup, equity framework, and IT pack provisioning
 */
class VentureManagementService {
    constructor() {
        this.defaultEquityStructure = {
            ownerPercent: 35,      // Minimum owner equity
            alicePercent: 20,      // Maximum AliceSolutions equity
            cepPercent: 45,        // Contributor Equity Pool
            vestingPolicy: '4-year vest, 1-year cliff'
        };
    }

    /**
     * Create a new venture with complete setup
     */
    async createVenture(ventureData) {
        try {
            console.log(`🚀 Creating new venture: ${ventureData.name}`);

            // Validate venture data
            const validation = this.validateVentureData(ventureData);
            if (!validation.isValid) {
                throw new Error(`Venture validation failed: ${validation.errors.join(', ')}`);
            }

            // Create venture record
            const venture = await prisma.venture.create({
                data: {
                    name: ventureData.name,
                    purpose: ventureData.purpose,
                    region: ventureData.region || 'US',
                    status: 'DRAFT',
                    ownerUserId: ventureData.ownerUserId,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            });

            console.log(`✅ Venture created: ${venture.id}`);

            // Create legal entity (optional)
            const legalEntity = await this.createLegalEntity(venture.id, ventureData.legalEntity || {});

            // Create equity framework (optional for now)
            let equityFramework = null;
            try {
                equityFramework = await this.createEquityFramework(venture.id, ventureData.ownerUserId);
            } catch (equityError) {
                console.log('⚠️ Equity framework creation skipped:', equityError.message);
            }

            // Create venture profile (optional for now)
            let ventureProfile = null;
            try {
                ventureProfile = await this.createVentureProfile(venture.id, ventureData);
            } catch (profileError) {
                console.log('⚠️ Venture profile creation skipped:', profileError.message);
            }

            // Update venture with entity references
            const updateData = {
                ventureLegalEntityId: legalEntity.ventureLegalEntity.id,
                status: 'PENDING_CONTRACTS'
            };
            
            if (equityFramework) {
                updateData.equityFrameworkId = equityFramework.id;
            }
            
            const updatedVenture = await prisma.venture.update({
                where: { id: venture.id },
                data: updateData
            });

            console.log(`✅ Venture setup completed: ${venture.id}`);

            return {
                venture: updatedVenture,
                legalEntity: legalEntity.baseLegalEntity,
                ventureLegalEntity: legalEntity.ventureLegalEntity,
                equityFramework,
                ventureProfile
            };

        } catch (error) {
            console.error('❌ Failed to create venture:', error);
            throw error;
        }
    }

    /**
     * Create legal entity for venture
     */
    async createLegalEntity(ventureId, legalEntityData = {}) {
        try {
            // First create the base legal entity
            const baseLegalEntity = await prisma.legalEntity.create({
                data: {
                    name: legalEntityData.name || 'New Venture LLC',
                    type: 'LLC', // Default type for ventures
                    jurisdiction: legalEntityData.jurisdiction || 'US',
                    taxId: legalEntityData.taxId || null,
                    incorporationDate: legalEntityData.incorporationDate || new Date(),
                    legalForm: 'LLC',
                    ownershipStructure: 'Single Member',
                    governanceModel: 'Member-Managed',
                    complianceStatus: 'PENDING',
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            });

            // Then create the venture-specific legal entity link
            const ventureLegalEntity = await prisma.ventureLegalEntity.create({
                data: {
                    ventureId: ventureId,
                    legalEntityId: baseLegalEntity.id,
                    status: 'PENDING',
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            });

            console.log(`✅ Legal entity created: ${baseLegalEntity.id} with venture link: ${ventureLegalEntity.id}`);
            return { baseLegalEntity, ventureLegalEntity };

        } catch (error) {
            console.error('❌ Failed to create legal entity:', error);
            throw error;
        }
    }

    /**
     * Create equity framework for venture
     */
    async createEquityFramework(ventureId, ownerUserId) {
        try {
            const equityFramework = await prisma.equityFramework.create({
                data: {
                    ventureId: ventureId,
                    ownerPercent: this.defaultEquityStructure.ownerPercent,
                    alicePercent: this.defaultEquityStructure.alicePercent,
                    cepPercent: this.defaultEquityStructure.cepPercent,
                    vestingPolicy: this.defaultEquityStructure.vestingPolicy,
                    status: 'ACTIVE',
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            });

            // Create initial equity ledger entries
            await this.createInitialEquityLedger(ventureId, ownerUserId, equityFramework);

            console.log(`✅ Equity framework created: ${equityFramework.id}`);
            return equityFramework;

        } catch (error) {
            console.error('❌ Failed to create equity framework:', error);
            throw error;
        }
    }

    /**
     * Create initial equity ledger entries
     */
    async createInitialEquityLedger(ventureId, ownerUserId, equityFramework) {
        try {
            // Owner equity
            await prisma.equityLedger.create({
                data: {
                    ventureId: ventureId,
                    holderType: 'USER',
                    holderId: ownerUserId,
                    percent: equityFramework.ownerPercent,
                    vestingPolicyId: null, // Owner equity is fully vested
                    effectiveFrom: new Date(),
                    effectiveTo: null,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            });

            // AliceSolutions equity
            await prisma.equityLedger.create({
                data: {
                    ventureId: ventureId,
                    holderType: 'ALICE',
                    holderId: null, // AliceSolutions entity
                    percent: equityFramework.alicePercent,
                    vestingPolicyId: null, // Immediate vesting
                    effectiveFrom: new Date(),
                    effectiveTo: null,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            });

            console.log(`✅ Initial equity ledger created for venture: ${ventureId}`);

        } catch (error) {
            console.error('❌ Failed to create equity ledger:', error);
            throw error;
        }
    }

    /**
     * Create venture profile
     */
    async createVentureProfile(ventureId, ventureData) {
        try {
            const ventureProfile = await prisma.ventureProfile.create({
                data: {
                    ventureId: ventureId,
                    description: ventureData.description || '',
                    industry: ventureData.industry || 'Technology',
                    stage: ventureData.stage || 'STARTUP',
                    fundingRound: ventureData.fundingRound || 'PRE_SEED',
                    teamSize: ventureData.teamSize || 1,
                    website: ventureData.website || null,
                    socialMedia: ventureData.socialMedia ? JSON.stringify(ventureData.socialMedia) : null,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            });

            console.log(`✅ Venture profile created: ${ventureProfile.id}`);
            return ventureProfile;

        } catch (error) {
            console.error('❌ Failed to create venture profile:', error);
            throw error;
        }
    }

    /**
     * Provision IT pack for venture
     */
    async provisionITPack(ventureId) {
        try {
            console.log(`🔧 Provisioning IT pack for venture: ${ventureId}`);

            const itPack = await prisma.ventureITPack.create({
                data: {
                    ventureId: ventureId,
                    m365TenantId: this.generateTenantId(),
                    emailAddress: this.generateEmailAddress(ventureId),
                    githubOrg: this.generateGitHubOrg(ventureId),
                    renderServiceId: this.generateRenderServiceId(ventureId),
                    backupPolicyId: this.generateBackupPolicyId(),
                    status: 'PROVISIONING',
                    provisionedAt: new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            });

            // Simulate provisioning process
            setTimeout(async () => {
                await this.updateITPackStatus(ventureId, 'ACTIVE');
            }, 5000); // 5 seconds simulation

            console.log(`✅ IT pack provisioning initiated: ${itPack.id}`);
            return itPack;

        } catch (error) {
            console.error('❌ Failed to provision IT pack:', error);
            throw error;
        }
    }

    /**
     * Update IT pack status
     */
    async updateITPackStatus(ventureId, status) {
        try {
            await prisma.ventureITPack.update({
                where: { ventureId: ventureId },
                data: {
                    status: status,
                    updatedAt: new Date()
                }
            });

            console.log(`✅ IT pack status updated to: ${status}`);

        } catch (error) {
            console.error('❌ Failed to update IT pack status:', error);
            throw error;
        }
    }

    /**
     * Get venture with complete details
     */
    async getVentureWithDetails(ventureId) {
        try {
            const venture = await prisma.venture.findUnique({
                where: { id: ventureId },
                include: {
                    owner: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            level: true,
                            xp: true,
                            reputation: true
                        }
                    },
                    ventureLegalEntity: {
                        include: {
                            legalEntity: true
                        }
                    },
                    equityFramework: true
                }
            });

            if (!venture) {
                throw new Error('Venture not found');
            }

            return venture;

        } catch (error) {
            console.error('❌ Failed to get venture details:', error);
            throw error;
        }
    }

    /**
     * Update venture status
     */
    async updateVentureStatus(ventureId, status) {
        try {
            const venture = await prisma.venture.update({
                where: { id: ventureId },
                data: {
                    status: status,
                    updatedAt: new Date()
                }
            });

            console.log(`✅ Venture status updated to: ${status}`);
            return venture;

        } catch (error) {
            console.error('❌ Failed to update venture status:', error);
            throw error;
        }
    }

    /**
     * Validate venture data
     */
    validateVentureData(ventureData) {
        const validation = {
            isValid: true,
            errors: []
        };

        // Required fields
        if (!ventureData.name || ventureData.name.trim().length === 0) {
            validation.isValid = false;
            validation.errors.push('Venture name is required');
        }

        if (!ventureData.purpose || ventureData.purpose.trim().length === 0) {
            validation.isValid = false;
            validation.errors.push('Venture purpose is required');
        }

        if (!ventureData.ownerUserId) {
            validation.isValid = false;
            validation.errors.push('Owner user ID is required');
        }

        // Business rules
        if (ventureData.name && ventureData.name.length > 100) {
            validation.isValid = false;
            validation.errors.push('Venture name must be less than 100 characters');
        }

        if (ventureData.purpose && ventureData.purpose.length > 500) {
            validation.isValid = false;
            validation.errors.push('Venture purpose must be less than 500 characters');
        }

        return validation;
    }

    /**
     * Generate unique identifiers for IT pack
     */
    generateTenantId() {
        return `tenant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    generateEmailAddress(ventureId) {
        return `venture_${ventureId}@smartstart.alicesolutions.com`;
    }

    generateGitHubOrg(ventureId) {
        return `smartstart-venture-${ventureId}`;
    }

    generateRenderServiceId(ventureId) {
        return `srv-${Date.now()}_${ventureId}`;
    }

    generateBackupPolicyId() {
        return `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get venture statistics
     */
    async getVentureStatistics() {
        try {
            const [
                totalVentures,
                activeVentures,
                pendingContracts,
                activeContracts
            ] = await Promise.all([
                prisma.venture.count(),
                prisma.venture.count({ where: { status: 'ACTIVE' } }),
                prisma.venture.count({ where: { status: 'PENDING_CONTRACTS' } }),
                prisma.legalDocument.count({ where: { status: 'EFFECTIVE' } })
            ]);

            return {
                totalVentures,
                activeVentures,
                pendingContracts,
                activeContracts,
                completionRate: totalVentures > 0 ? 
                    ((activeVentures / totalVentures) * 100).toFixed(2) + '%' : '0%'
            };

        } catch (error) {
            console.error('❌ Failed to get venture statistics:', error);
            return {
                totalVentures: 0,
                activeVentures: 0,
                pendingContracts: 0,
                activeContracts: 0,
                completionRate: '0%'
            };
        }
    }
}

module.exports = VentureManagementService;
