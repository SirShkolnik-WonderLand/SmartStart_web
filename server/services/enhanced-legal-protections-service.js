/**
 * Enhanced Legal Protections Service
 * Comprehensive legal protection system with worldwide enforcement
 */

const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

class EnhancedLegalProtectionsService {
    constructor() {
        this.liquidatedDamages = {
            IP_THEFT: 100000.00,
            NON_COMPETE_VIOLATION: 50000.00,
            PLATFORM_LOCK_IN_VIOLATION: 50000.00,
            REVENUE_SHARING_VIOLATION: 0.00, // 3x unpaid amount
            WORK_FOR_HIRE_VIOLATION: 100000.00
        };
        
        this.enforcementActions = {
            IMMEDIATE_SUSPENSION: 'SUSPEND_USER',
            TERMINATION: 'TERMINATE_USER',
            LEGAL_ACTION: 'INITIATE_LEGAL_ACTION',
            ASSET_SEIZURE: 'SEIZE_ASSETS',
            INJUNCTIVE_RELIEF: 'SEEK_INJUNCTION'
        };
    }

    // ============================================================================
    // LEGAL DOCUMENT TEMPLATE MANAGEMENT
    // ============================================================================

    async getLegalTemplates(filters = {}) {
        try {
            const whereClause = {
                isActive: true,
                ...(filters.type && { type: filters.type }),
                ...(filters.rbacLevel && { rbacLevel: filters.rbacLevel }),
                ...(filters.jurisdiction && { jurisdiction: filters.jurisdiction })
            };

            const templates = await prisma.legalDocumentTemplate.findMany({
                where: whereClause,
                orderBy: [
                    { type: 'asc' },
                    { version: 'desc' }
                ]
            });

            return {
                success: true,
                data: templates
            };
        } catch (error) {
            console.error('Error getting legal templates:', error);
            return {
                success: false,
                error: 'Failed to get legal templates'
            };
        }
    }

    async createLegalTemplate(templateData, userId) {
        try {
            const template = await prisma.legalDocumentTemplate.create({
                data: {
                    id: `template_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
                    name: templateData.name,
                    type: templateData.type,
                    version: templateData.version || '1.0',
                    content: templateData.content,
                    rbacLevel: templateData.rbacLevel,
                    isRequired: templateData.isRequired || false,
                    jurisdiction: templateData.jurisdiction || 'WORLDWIDE',
                    enforcementMechanisms: templateData.enforcementMechanisms || [],
                    liquidatedDamages: templateData.liquidatedDamages || 0.00,
                    survivalPeriod: templateData.survivalPeriod || 5,
                    createdBy: userId
                }
            });

            return {
                success: true,
                data: template
            };
        } catch (error) {
            console.error('Error creating legal template:', error);
            return {
                success: false,
                error: 'Failed to create legal template'
            };
        }
    }

    async updateLegalTemplate(templateId, updateData, userId) {
        try {
            const template = await prisma.legalDocumentTemplate.update({
                where: { id: templateId },
                data: {
                    ...updateData,
                    updatedAt: new Date()
                }
            });

            return {
                success: true,
                data: template
            };
        } catch (error) {
            console.error('Error updating legal template:', error);
            return {
                success: false,
                error: 'Failed to update legal template'
            };
        }
    }

    // ============================================================================
    // LEGAL DOCUMENT COMPLIANCE MANAGEMENT
    // ============================================================================

    async checkUserCompliance(userId, rbacLevel) {
        try {
            // Get required documents for RBAC level
            const requiredDocs = await prisma.legalDocumentTemplate.findMany({
                where: {
                    rbacLevel: rbacLevel,
                    isRequired: true,
                    isActive: true
                }
            });

            // Get user's compliance status
            const userCompliance = await prisma.legalDocumentCompliance.findMany({
                where: {
                    userId: userId,
                    rbacLevel: rbacLevel
                },
                include: {
                    document: true
                }
            });

            const complianceMap = {};
            userCompliance.forEach(compliance => {
                complianceMap[compliance.documentId] = compliance.complianceStatus;
            });

            const complianceStatus = {
                userId,
                rbacLevel,
                totalRequired: requiredDocs.length,
                completed: 0,
                pending: 0,
                violations: 0,
                isCompliant: false,
                missingDocuments: [],
                violationDetails: []
            };

            requiredDocs.forEach(doc => {
                const status = complianceMap[doc.id];
                if (status === 'COMPLETED') {
                    complianceStatus.completed++;
                } else if (status === 'VIOLATION') {
                    complianceStatus.violations++;
                    complianceStatus.violationDetails.push({
                        documentId: doc.id,
                        documentName: doc.name,
                        violationType: 'NON_COMPLIANCE'
                    });
                } else {
                    complianceStatus.pending++;
                    complianceStatus.missingDocuments.push({
                        documentId: doc.id,
                        documentName: doc.name,
                        documentType: doc.type
                    });
                }
            });

            complianceStatus.isCompliant = complianceStatus.completed === complianceStatus.totalRequired && complianceStatus.violations === 0;

            return {
                success: true,
                data: complianceStatus
            };
        } catch (error) {
            console.error('Error checking user compliance:', error);
            return {
                success: false,
                error: 'Failed to check user compliance'
            };
        }
    }

    async createComplianceRequirement(userId, documentId, rbacLevel, requiredBy) {
        try {
            const compliance = await prisma.legalDocumentCompliance.create({
                data: {
                    id: `compliance_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
                    userId,
                    documentId,
                    rbacLevel,
                    complianceStatus: 'PENDING',
                    requiredBy: new Date(requiredBy)
                }
            });

            return {
                success: true,
                data: compliance
            };
        } catch (error) {
            console.error('Error creating compliance requirement:', error);
            return {
                success: false,
                error: 'Failed to create compliance requirement'
            };
        }
    }

    async updateComplianceStatus(complianceId, status, violations = []) {
        try {
            const compliance = await prisma.legalDocumentCompliance.update({
                where: { id: complianceId },
                data: {
                    complianceStatus: status,
                    violations: violations,
                    completedAt: status === 'COMPLETED' ? new Date() : null,
                    updatedAt: new Date()
                }
            });

            return {
                success: true,
                data: compliance
            };
        } catch (error) {
            console.error('Error updating compliance status:', error);
            return {
                success: false,
                error: 'Failed to update compliance status'
            };
        }
    }

    // ============================================================================
    // IP THEFT DETECTION AND ENFORCEMENT
    // ============================================================================

    async detectIPTheft(userId, detectionData) {
        try {
            const {
                ventureId,
                projectId,
                detectionType,
                evidence,
                severity = 'MEDIUM'
            } = detectionData;

            const theftDetection = await prisma.iPTheftDetection.create({
                data: {
                    id: `theft_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
                    userId,
                    ventureId,
                    projectId,
                    detectionType,
                    evidence: JSON.stringify(evidence),
                    severity,
                    status: 'DETECTED',
                    damages: this.liquidatedDamages.IP_THEFT
                }
            });

            // Automatically initiate enforcement actions for critical violations
            if (severity === 'CRITICAL') {
                await this.initiateEnforcementActions(theftDetection.id, 'IP_THEFT');
            }

            return {
                success: true,
                data: theftDetection
            };
        } catch (error) {
            console.error('Error detecting IP theft:', error);
            return {
                success: false,
                error: 'Failed to detect IP theft'
            };
        }
    }

    async getIPTheftDetections(filters = {}) {
        try {
            const whereClause = {
                ...(filters.userId && { userId: filters.userId }),
                ...(filters.ventureId && { ventureId: filters.ventureId }),
                ...(filters.projectId && { projectId: filters.projectId }),
                ...(filters.severity && { severity: filters.severity }),
                ...(filters.status && { status: filters.status })
            };

            const detections = await prisma.iPTheftDetection.findMany({
                where: whereClause,
                orderBy: { detectedAt: 'desc' },
                include: {
                    user: {
                        select: { id: true, name: true, email: true }
                    },
                    venture: {
                        select: { id: true, name: true }
                    },
                    project: {
                        select: { id: true, name: true }
                    }
                }
            });

            return {
                success: true,
                data: detections
            };
        } catch (error) {
            console.error('Error getting IP theft detections:', error);
            return {
                success: false,
                error: 'Failed to get IP theft detections'
            };
        }
    }

    // ============================================================================
    // REVENUE SHARING VIOLATION DETECTION
    // ============================================================================

    async detectRevenueSharingViolation(violationData) {
        try {
            const {
                userId,
                ventureId,
                projectId,
                violationType,
                amount,
                evidence
            } = violationData;

            const liquidatedDamages = amount * 3; // 3x unpaid amount

            const violation = await prisma.revenueSharingViolation.create({
                data: {
                    id: `revenue_violation_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
                    userId,
                    ventureId,
                    projectId,
                    violationType,
                    amount,
                    liquidatedDamages,
                    evidence: JSON.stringify(evidence),
                    status: 'DETECTED'
                }
            });

            // Automatically initiate enforcement actions
            await this.initiateEnforcementActions(violation.id, 'REVENUE_SHARING_VIOLATION');

            return {
                success: true,
                data: violation
            };
        } catch (error) {
            console.error('Error detecting revenue sharing violation:', error);
            return {
                success: false,
                error: 'Failed to detect revenue sharing violation'
            };
        }
    }

    async getRevenueSharingViolations(filters = {}) {
        try {
            const whereClause = {
                ...(filters.userId && { userId: filters.userId }),
                ...(filters.ventureId && { ventureId: filters.ventureId }),
                ...(filters.projectId && { projectId: filters.projectId }),
                ...(filters.status && { status: filters.status })
            };

            const violations = await prisma.revenueSharingViolation.findMany({
                where: whereClause,
                orderBy: { detectedAt: 'desc' },
                include: {
                    user: {
                        select: { id: true, name: true, email: true }
                    },
                    venture: {
                        select: { id: true, name: true }
                    },
                    project: {
                        select: { id: true, name: true }
                    }
                }
            });

            return {
                success: true,
                data: violations
            };
        } catch (error) {
            console.error('Error getting revenue sharing violations:', error);
            return {
                success: false,
                error: 'Failed to get revenue sharing violations'
            };
        }
    }

    // ============================================================================
    // ENFORCEMENT ACTIONS
    // ============================================================================

    async initiateEnforcementActions(violationId, violationType) {
        try {
            const enforcementActions = [];

            // Determine appropriate enforcement actions based on violation type
            let actions = [];
            switch (violationType) {
                case 'IP_THEFT':
                    actions = ['IMMEDIATE_SUSPENSION', 'LEGAL_ACTION', 'ASSET_SEIZURE'];
                    break;
                case 'NON_COMPETE_VIOLATION':
                    actions = ['INJUNCTIVE_RELIEF', 'LEGAL_ACTION'];
                    break;
                case 'PLATFORM_LOCK_IN_VIOLATION':
                    actions = ['IMMEDIATE_SUSPENSION', 'TERMINATION'];
                    break;
                case 'REVENUE_SHARING_VIOLATION':
                    actions = ['IMMEDIATE_SUSPENSION', 'ASSET_SEIZURE'];
                    break;
                default:
                    actions = ['IMMEDIATE_SUSPENSION'];
            }

            // Create enforcement action records
            for (const actionType of actions) {
                const enforcementAction = await prisma.enforcementAction.create({
                    data: {
                        id: `enforcement_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
                        violationId,
                        actionType,
                        jurisdiction: 'WORLDWIDE',
                        status: 'PENDING'
                    }
                });
                enforcementActions.push(enforcementAction);
            }

            return {
                success: true,
                data: enforcementActions
            };
        } catch (error) {
            console.error('Error initiating enforcement actions:', error);
            return {
                success: false,
                error: 'Failed to initiate enforcement actions'
            };
        }
    }

    async executeEnforcementAction(actionId, executionData) {
        try {
            const { result, executedAt } = executionData;

            const enforcementAction = await prisma.enforcementAction.update({
                where: { id: actionId },
                data: {
                    status: 'EXECUTED',
                    result: result,
                    executedAt: executedAt ? new Date(executedAt) : new Date()
                }
            });

            // If asset seizure is involved, create asset seizure record
            if (enforcementAction.actionType === 'ASSET_SEIZURE') {
                await this.createAssetSeizureRecord(actionId, executionData);
            }

            return {
                success: true,
                data: enforcementAction
            };
        } catch (error) {
            console.error('Error executing enforcement action:', error);
            return {
                success: false,
                error: 'Failed to execute enforcement action'
            };
        }
    }

    async createAssetSeizureRecord(actionId, seizureData) {
        try {
            const { assetType, assetValue, seizureOrder, jurisdiction } = seizureData;

            const assetSeizure = await prisma.assetSeizure.create({
                data: {
                    id: `seizure_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
                    violationId: actionId,
                    assetType,
                    assetValue: assetValue || 0.00,
                    seizureOrder,
                    jurisdiction: jurisdiction || 'WORLDWIDE',
                    status: 'PENDING'
                }
            });

            return {
                success: true,
                data: assetSeizure
            };
        } catch (error) {
            console.error('Error creating asset seizure record:', error);
            return {
                success: false,
                error: 'Failed to create asset seizure record'
            };
        }
    }

    // ============================================================================
    // DIGITAL EVIDENCE MANAGEMENT
    // ============================================================================

    async createDigitalEvidence(caseId, evidenceData) {
        try {
            const {
                evidenceType,
                evidenceData: data,
                blockchainTx
            } = evidenceData;

            // Create hash for evidence integrity
            const hash = crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');

            const evidence = await prisma.digitalEvidence.create({
                data: {
                    id: `evidence_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
                    caseId,
                    evidenceType,
                    evidenceData: JSON.stringify(data),
                    hash,
                    blockchainTx,
                    isAdmissible: true,
                    chainOfCustody: [{
                        timestamp: new Date().toISOString(),
                        action: 'CREATED',
                        actor: 'SYSTEM'
                    }]
                }
            });

            return {
                success: true,
                data: evidence
            };
        } catch (error) {
            console.error('Error creating digital evidence:', error);
            return {
                success: false,
                error: 'Failed to create digital evidence'
            };
        }
    }

    async getDigitalEvidence(caseId) {
        try {
            const evidence = await prisma.digitalEvidence.findMany({
                where: { caseId },
                orderBy: { createdAt: 'desc' }
            });

            return {
                success: true,
                data: evidence
            };
        } catch (error) {
            console.error('Error getting digital evidence:', error);
            return {
                success: false,
                error: 'Failed to get digital evidence'
            };
        }
    }

    // ============================================================================
    // LEGAL DOCUMENT VERSIONING
    // ============================================================================

    async createDocumentVersion(documentId, versionData, userId) {
        try {
            const { version, content, changeLog } = versionData;

            // Deactivate current active version
            await prisma.legalDocumentVersion.updateMany({
                where: { documentId, isActive: true },
                data: { isActive: false }
            });

            // Create new version
            const documentVersion = await prisma.legalDocumentVersion.create({
                data: {
                    id: `version_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
                    documentId,
                    version,
                    content,
                    changeLog,
                    isActive: true,
                    effectiveDate: new Date(),
                    createdBy: userId
                }
            });

            return {
                success: true,
                data: documentVersion
            };
        } catch (error) {
            console.error('Error creating document version:', error);
            return {
                success: false,
                error: 'Failed to create document version'
            };
        }
    }

    async getDocumentVersions(documentId) {
        try {
            const versions = await prisma.legalDocumentVersion.findMany({
                where: { documentId },
                orderBy: { version: 'desc' }
            });

            return {
                success: true,
                data: versions
            };
        } catch (error) {
            console.error('Error getting document versions:', error);
            return {
                success: false,
                error: 'Failed to get document versions'
            };
        }
    }

    // ============================================================================
    // COMPREHENSIVE LEGAL STATUS
    // ============================================================================

    async getComprehensiveLegalStatus(userId) {
        try {
            const [
                complianceStatus,
                ipTheftDetections,
                revenueViolations,
                enforcementActions
            ] = await Promise.all([
                this.checkUserCompliance(userId, 'MEMBER'),
                this.getIPTheftDetections({ userId }),
                this.getRevenueSharingViolations({ userId }),
                prisma.enforcementAction.findMany({
                    where: { violationId: { contains: userId } },
                    orderBy: { createdAt: 'desc' }
                })
            ]);

            const legalStatus = {
                userId,
                compliance: complianceStatus.data,
                ipTheft: {
                    totalDetections: ipTheftDetections.data.length,
                    criticalDetections: ipTheftDetections.data.filter(d => d.severity === 'CRITICAL').length,
                    totalDamages: ipTheftDetections.data.reduce((sum, d) => sum + (d.damages || 0), 0)
                },
                revenueViolations: {
                    totalViolations: revenueViolations.data.length,
                    totalAmount: revenueViolations.data.reduce((sum, v) => sum + (v.amount || 0), 0),
                    totalDamages: revenueViolations.data.reduce((sum, v) => sum + (v.liquidatedDamages || 0), 0)
                },
                enforcement: {
                    totalActions: enforcementActions.length,
                    pendingActions: enforcementActions.filter(a => a.status === 'PENDING').length,
                    executedActions: enforcementActions.filter(a => a.status === 'EXECUTED').length
                },
                riskLevel: this.calculateRiskLevel(complianceStatus.data, ipTheftDetections.data, revenueViolations.data)
            };

            return {
                success: true,
                data: legalStatus
            };
        } catch (error) {
            console.error('Error getting comprehensive legal status:', error);
            return {
                success: false,
                error: 'Failed to get comprehensive legal status'
            };
        }
    }

    calculateRiskLevel(compliance, ipTheft, revenueViolations) {
        let riskScore = 0;

        // Compliance risk
        if (!compliance.isCompliant) riskScore += 30;
        if (compliance.violations > 0) riskScore += 20;

        // IP theft risk
        if (ipTheft.length > 0) riskScore += 25;
        if (ipTheft.some(d => d.severity === 'CRITICAL')) riskScore += 25;

        // Revenue violation risk
        if (revenueViolations.length > 0) riskScore += 20;

        if (riskScore >= 80) return 'CRITICAL';
        if (riskScore >= 60) return 'HIGH';
        if (riskScore >= 40) return 'MEDIUM';
        if (riskScore >= 20) return 'LOW';
        return 'MINIMAL';
    }
}

module.exports = EnhancedLegalProtectionsService;
