const express = require('express');
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const router = express.Router();
const prisma = new PrismaClient();

// ===== ADVANCED CONTRACT AMENDMENTS SYSTEM =====

/**
 * POST /contracts/:id/amend - Create a contract amendment
 */
router.post('/:id/amend', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            amendmentType,
            reason,
            changes,
            proposedBy,
            requiresApproval = true,
            approvalDeadline,
            notificationRecipients = []
        } = req.body;

        if (!amendmentType || !reason || !changes || !proposedBy) {
            return res.status(400).json({
                error: 'Missing required fields',
                details: 'amendmentType, reason, changes, and proposedBy are required'
            });
        }

        // Check if contract exists and can be amended
        const originalContract = await prisma.legalDocument.findUnique({
            where: { id },
            include: { signatures: true }
        });

        if (!originalContract) {
            return res.status(404).json({
                error: 'Contract not found',
                details: 'The specified contract does not exist'
            });
        }

        if (originalContract.status === 'TERMINATED') {
            return res.status(400).json({
                error: 'Contract cannot be amended',
                details: 'Terminated contracts cannot be amended'
            });
        }

        // Create amendment record using raw SQL
        const amendmentId = `amendment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const version = `${originalContract.version}-A${Date.now()}`;
        
        await prisma.$executeRaw`
            INSERT INTO "ContractAmendment" (
                "id", "originalContractId", "amendmentType", "reason", "changes", 
                "version", "status", "requiresApproval", "approvalDeadline", 
                "notificationRecipients", "effectiveDate", "proposedBy", 
                "approvedBy", "approvedAt", "createdAt", "updatedAt"
            ) VALUES (
                ${amendmentId}, ${id}, ${amendmentType.toUpperCase()}, ${reason}, 
                ${JSON.stringify(changes)}, ${version}, 'PENDING', ${requiresApproval}, 
                ${approvalDeadline ? new Date(approvalDeadline) : null}, 
                ${JSON.stringify(notificationRecipients)}, null, ${proposedBy}, 
                null, null, NOW(), NOW()
            )
        `;

        const amendment = {
            id: amendmentId,
            originalContractId: id,
            amendmentType: amendmentType.toUpperCase(),
            reason,
            changes: JSON.stringify(changes),
            version,
            status: 'PENDING',
            requiresApproval,
            approvalDeadline: approvalDeadline ? new Date(approvalDeadline) : null,
            notificationRecipients: JSON.stringify(notificationRecipients),
            effectiveDate: null,
            proposedBy,
            approvedBy: null,
            approvedAt: null,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Create amendment signature requirements using raw SQL
        if (requiresApproval) {
            for (const recipient of notificationRecipients) {
                const signatureId = `amendment_sig_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                await prisma.$executeRaw`
                    INSERT INTO "AmendmentSignature" (
                        "id", "amendmentId", "signerId", "role", "required", 
                        "status", "deadline", "signedAt", "signatureHash", 
                        "createdAt", "updatedAt"
                    ) VALUES (
                        ${signatureId}, ${amendment.id}, ${recipient.signerId}, 
                        ${recipient.role || 'APPROVER'}, true, 'PENDING', 
                        ${approvalDeadline ? new Date(approvalDeadline) : null}, 
                        null, null, NOW(), NOW()
                    )
                `;
            }
        }

        res.json({
            success: true,
            message: 'Contract amendment created successfully',
            amendment: {
                id: amendment.id,
                originalContractId: amendment.originalContractId,
                amendmentType: amendment.amendmentType,
                reason: amendment.reason,
                changes: JSON.parse(amendment.changes),
                version: amendment.version,
                status: amendment.status,
                requiresApproval: amendment.requiresApproval,
                approvalDeadline: amendment.approvalDeadline,
                proposedBy: amendment.proposedBy,
                createdAt: amendment.createdAt
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Contract amendment creation error:', error);
        res.status(500).json({
            error: 'Failed to create contract amendment',
            details: error.message
        });
    }
});

/**
 * GET /contracts/:id/amendments - Get all amendments for a contract
 */
router.get('/:id/amendments', async (req, res) => {
    try {
        const { id } = req.params;

        const amendments = await prisma.$queryRaw`
            SELECT * FROM "ContractAmendment" 
            WHERE "originalContractId" = ${id} 
            ORDER BY "createdAt" DESC
        `;

        // Get amendment signatures for each amendment
        const amendmentsWithSignatures = await Promise.all(
            amendments.map(async (amendment) => {
                const signatures = await prisma.$queryRaw`
                    SELECT * FROM "AmendmentSignature" 
                    WHERE "amendmentId" = ${amendment.id}
                `;
                return { ...amendment, amendmentSignatures: signatures };
            })
        );

        res.json({
            success: true,
            message: 'Contract amendments retrieved successfully',
            amendments: amendmentsWithSignatures.map(a => ({
                id: a.id,
                amendmentType: a.amendmentType,
                reason: a.reason,
                changes: JSON.parse(a.changes),
                version: a.version,
                status: a.status,
                requiresApproval: a.requiresApproval,
                approvalDeadline: a.approvalDeadline,
                proposedBy: a.proposedBy,
                effectiveDate: a.effectiveDate,
                approvedBy: a.approvedBy,
                approvedAt: a.approvedAt,
                signatureCount: a.amendmentSignatures.length,
                requiredSignatures: a.amendmentSignatures.filter(s => s.required).length,
                pendingSignatures: a.amendmentSignatures.filter(s => s.status === 'PENDING').length,
                createdAt: a.createdAt
            })),
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Contract amendments retrieval error:', error);
        res.status(500).json({
            error: 'Failed to retrieve contract amendments',
            details: error.message
        });
    }
});

// ===== MULTI-PARTY SIGNATURE SYSTEM =====

/**
 * POST /contracts/:id/sign/multi-party - Multi-party contract signing
 */
router.post('/:id/sign/multi-party', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            signerId,
            role,
            termsAccepted = true,
            privacyAccepted = true,
            ipAddress,
            userAgent,
            signatureMethod = 'DIGITAL'
        } = req.body;

        if (!signerId || !role) {
            return res.status(400).json({
                error: 'Missing required fields',
                details: 'signerId and role are required'
            });
        }

        // Check if contract exists and requires multi-party signatures
        const contract = await prisma.legalDocument.findUnique({
            where: { id },
            include: {
                signatures: true,
                multiPartyRequirements: {
                    include: {
                        requiredSignatures: true
                    }
                }
            }
        });

        if (!contract) {
            return res.status(404).json({
                error: 'Contract not found',
                details: 'The specified contract does not exist'
            });
        }

        // Check if user has already signed
        const existingSignature = contract.signatures.find(s => s.signerId === signerId);
        if (existingSignature) {
            return res.status(400).json({
                error: 'Already signed',
                details: 'This user has already signed this contract'
            });
        }

        // Check if user is authorized to sign for this role
        const requiredSignature = contract.multiPartyRequirements?.requiredSignatures.find(
            rs => rs.role === role && rs.signerId === signerId
        );

        if (!requiredSignature) {
            return res.status(403).json({
                error: 'Unauthorized to sign',
                details: 'User is not authorized to sign for this role'
            });
        }

        // Generate advanced signature hash
        const signatureData = `${contract.id}-${signerId}-${role}-${contract.version}-${new Date().toISOString()}-${signatureMethod}`;
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
                identityVerified: true,
                role,
                signatureMethod,
                signedAt: new Date()
            }
        });

        // Check if all required signatures are complete
        const allSignatures = await prisma.legalDocumentSignature.findMany({
            where: { documentId: id }
        });

        const requiredSignatures = contract.multiPartyRequirements?.requiredSignatures || [];
        const allRequiredSigned = requiredSignatures.every(rs => 
            allSignatures.some(s => s.signerId === rs.signerId && s.role === rs.role)
        );

        // Update contract status if all signatures are complete
        if (allRequiredSigned) {
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
            message: 'Multi-party signature added successfully',
            signature: {
                id: signature.id,
                documentId: signature.documentId,
                signerId: signature.signerId,
                role: signature.role,
                signatureHash: signature.signatureHash,
                signatureMethod: signature.signatureMethod,
                signedAt: signature.signedAt,
                termsAccepted: signature.termsAccepted,
                privacyAccepted: signature.privacyAccepted,
                identityVerified: signature.identityVerified
            },
            contractStatus: allRequiredSigned ? 'EFFECTIVE' : 'PENDING_SIGNATURES',
            remainingSignatures: requiredSignatures.length - allSignatures.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Multi-party signature error:', error);
        res.status(500).json({
            error: 'Failed to add multi-party signature',
            details: error.message
        });
    }
});

// ===== LEGAL BINDING AND ENFORCEMENT SYSTEM =====

/**
 * POST /contracts/:id/enforce - Enforce contract terms and legal binding
 */
router.post('/:id/enforce', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            enforcementAction,
            reason,
            initiatedBy,
            evidence = [],
            legalBasis,
            jurisdiction
        } = req.body;

        if (!enforcementAction || !reason || !initiatedBy || !legalBasis) {
            return res.status(400).json({
                error: 'Missing required fields',
                details: 'enforcementAction, reason, initiatedBy, and legalBasis are required'
            });
        }

        // Check if contract exists and is enforceable
        const contract = await prisma.legalDocument.findUnique({
            where: { id },
            include: { signatures: true }
        });

        if (!contract) {
            return res.status(404).json({
                error: 'Contract not found',
                details: 'The specified contract does not exist'
            });
        }

        if (contract.status !== 'EFFECTIVE') {
            return res.status(400).json({
                error: 'Contract not enforceable',
                details: 'Only effective contracts can be enforced'
            });
        }

        // Create enforcement record
        const enforcement = await prisma.contractEnforcement.create({
            data: {
                contractId: id,
                enforcementAction: enforcementAction.toUpperCase(),
                reason,
                initiatedBy,
                evidence: JSON.stringify(evidence),
                legalBasis,
                jurisdiction: jurisdiction || 'CA',
                status: 'ACTIVE',
                initiatedAt: new Date(),
                resolutionDate: null,
                outcome: null
            }
        });

        // Update contract status to ENFORCEMENT
        await prisma.legalDocument.update({
            where: { id },
            data: {
                status: 'ENFORCEMENT',
                updatedAt: new Date()
            }
        });

        // Create audit trail
        await prisma.auditEvent.create({
            data: {
                entityType: 'CONTRACT',
                entityId: id,
                action: 'ENFORCEMENT_INITIATED',
                performedBy: initiatedBy,
                details: JSON.stringify({
                    enforcementAction,
                    reason,
                    legalBasis,
                    enforcementId: enforcement.id
                }),
                timestamp: new Date()
            }
        });

        res.json({
            success: true,
            message: 'Contract enforcement initiated successfully',
            enforcement: {
                id: enforcement.id,
                contractId: enforcement.contractId,
                enforcementAction: enforcement.enforcementAction,
                reason: enforcement.reason,
                legalBasis: enforcement.legalBasis,
                jurisdiction: enforcement.jurisdiction,
                status: enforcement.status,
                initiatedAt: enforcement.initiatedAt
            },
            contractStatus: 'ENFORCEMENT',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Contract enforcement error:', error);
        res.status(500).json({
            error: 'Failed to initiate contract enforcement',
            details: error.message
        });
    }
});

/**
 * GET /contracts/:id/enforcement - Get enforcement history for a contract
 */
router.get('/:id/enforcement', async (req, res) => {
    try {
        const { id } = req.params;

        const enforcements = await prisma.contractEnforcement.findMany({
            where: { contractId: id },
            orderBy: { initiatedAt: 'desc' }
        });

        res.json({
            success: true,
            message: 'Contract enforcement history retrieved successfully',
            enforcements: enforcements.map(e => ({
                id: e.id,
                enforcementAction: e.enforcementAction,
                reason: e.reason,
                initiatedBy: e.initiatedBy,
                evidence: JSON.parse(e.evidence),
                legalBasis: e.legalBasis,
                jurisdiction: e.jurisdiction,
                status: e.status,
                initiatedAt: e.initiatedAt,
                resolutionDate: e.resolutionDate,
                outcome: e.outcome
            })),
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Contract enforcement retrieval error:', error);
        res.status(500).json({
            error: 'Failed to retrieve contract enforcement history',
            details: error.message
        });
    }
});

// ===== ADVANCED SIGNATURE VERIFICATION SYSTEM =====

/**
 * POST /contracts/:id/verify-signature - Advanced signature verification
 */
router.post('/:id/verify-signature', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            signatureId,
            verificationMethod = 'CRYPTOGRAPHIC',
            additionalChecks = []
        } = req.body;

        if (!signatureId) {
            return res.status(400).json({
                error: 'Missing required fields',
                details: 'signatureId is required'
            });
        }

        // Get signature details
        const signature = await prisma.legalDocumentSignature.findUnique({
            where: { id: signatureId },
            include: {
                document: true,
                signer: {
                    select: { id: true, name: true, email: true, kycStatus: true }
                }
            }
        });

        if (!signature) {
            return res.status(404).json({
                error: 'Signature not found',
                details: 'The specified signature does not exist'
            });
        }

        // Perform verification checks
        const verificationResults = {
            signatureId: signature.id,
            documentId: signature.documentId,
            signerId: signature.signerId,
            verificationMethod,
            checks: [],
            overallVerification: 'PENDING'
        };

        // Cryptographic verification
        if (verificationMethod === 'CRYPTOGRAPHIC') {
            const expectedData = `${signature.document.id}-${signature.signerId}-${signature.document.version}-${signature.signedAt.toISOString()}`;
            const expectedHash = crypto.createHash('sha256').update(expectedData).digest('hex');
            
            const cryptographicValid = signature.signatureHash === expectedHash;
            verificationResults.checks.push({
                type: 'CRYPTOGRAPHIC_HASH',
                status: cryptographicValid ? 'PASSED' : 'FAILED',
                details: cryptographicValid ? 'Signature hash matches expected value' : 'Signature hash mismatch'
            });
        }

        // KYC verification
        if (signature.signer.kycStatus === 'VERIFIED') {
            verificationResults.checks.push({
                type: 'KYC_VERIFICATION',
                status: 'PASSED',
                details: 'Signer identity verified through KYC process'
            });
        } else {
            verificationResults.checks.push({
                type: 'KYC_VERIFICATION',
                status: 'FAILED',
                details: 'Signer identity not verified through KYC'
            });
        }

        // IP address verification
        if (signature.ipAddress) {
            verificationResults.checks.push({
                type: 'IP_ADDRESS',
                status: 'RECORDED',
                details: `IP address recorded: ${signature.ipAddress}`
            });
        }

        // User agent verification
        if (signature.userAgent) {
            verificationResults.checks.push({
                type: 'USER_AGENT',
                status: 'RECORDED',
                details: `User agent recorded: ${signature.userAgent}`
            });
        }

        // Additional custom checks
        for (const check of additionalChecks) {
            verificationResults.checks.push({
                type: check.type,
                status: check.status || 'PENDING',
                details: check.details || 'Custom verification check'
            });
        }

        // Determine overall verification status
        const failedChecks = verificationResults.checks.filter(c => c.status === 'FAILED');
        const passedChecks = verificationResults.checks.filter(c => c.status === 'PASSED');
        
        if (failedChecks.length > 0) {
            verificationResults.overallVerification = 'FAILED';
        } else if (passedChecks.length > 0) {
            verificationResults.overallVerification = 'PASSED';
        }

        // Create verification record
        await prisma.signatureVerification.create({
            data: {
                signatureId: signature.id,
                verificationMethod,
                results: JSON.stringify(verificationResults),
                verifiedBy: 'system',
                verifiedAt: new Date()
            }
        });

        res.json({
            success: true,
            message: 'Signature verification completed',
            verification: verificationResults,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Signature verification error:', error);
        res.status(500).json({
            error: 'Failed to verify signature',
            details: error.message
        });
    }
});

// ===== CONTRACT TEMPLATE VERSIONING SYSTEM =====

/**
 * POST /contracts/templates/:id/version - Create new version of contract template
 */
router.post('/templates/:id/version', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            newVersion,
            changes,
            reason,
            createdBy,
            requiresApproval = true
        } = req.body;

        if (!newVersion || !changes || !reason || !createdBy) {
            return res.status(400).json({
                error: 'Missing required fields',
                details: 'newVersion, changes, reason, and createdBy are required'
            });
        }

        // Get original template
        const originalTemplate = await prisma.legalDocument.findUnique({
            where: { id }
        });

        if (!originalTemplate) {
            return res.status(404).json({
                error: 'Template not found',
                details: 'The specified template does not exist'
            });
        }

        // Create new version
        const newTemplate = await prisma.legalDocument.create({
            data: {
                title: originalTemplate.title,
                type: originalTemplate.type,
                content: originalTemplate.content,
                version: newVersion,
                status: requiresApproval ? 'DRAFT' : 'APPROVED',
                requiresSignature: originalTemplate.requiresSignature,
                complianceRequired: originalTemplate.complianceRequired,
                effectiveDate: requiresApproval ? null : new Date(),
                createdBy,
                isVersionOf: id
            }
        });

        // Create version history record
        await prisma.templateVersionHistory.create({
            data: {
                originalTemplateId: id,
                newVersionId: newTemplate.id,
                versionNumber: newVersion,
                changes: JSON.stringify(changes),
                reason,
                createdBy,
                requiresApproval,
                status: requiresApproval ? 'PENDING_APPROVAL' : 'APPROVED'
            }
        });

        res.json({
            success: true,
            message: 'Contract template version created successfully',
            template: {
                id: newTemplate.id,
                title: newTemplate.title,
                type: newTemplate.type,
                version: newTemplate.version,
                status: newTemplate.status,
                requiresApproval,
                createdAt: newTemplate.createdAt
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Template versioning error:', error);
        res.status(500).json({
            error: 'Failed to create template version',
            details: error.message
        });
    }
});

// ===== LEGAL COMPLIANCE MONITORING SYSTEM =====

/**
 * GET /contracts/compliance/advanced - Advanced compliance monitoring
 */
router.get('/compliance/advanced', async (req, res) => {
    try {
        const {
            jurisdiction,
            complianceType,
            riskLevel,
            dateRange
        } = req.query;

        let whereClause = {};
        
        if (jurisdiction) whereClause.jurisdiction = jurisdiction;
        if (complianceType) whereClause.complianceType = complianceType;
        if (riskLevel) whereClause.riskLevel = riskLevel;

        const contracts = await prisma.legalDocument.findMany({
            where: whereClause,
            include: {
                signatures: true,
                enforcements: true,
                amendments: true,
                complianceRecords: true
            }
        });

        // Advanced compliance analysis
        const complianceAnalysis = contracts.map(contract => {
            const riskFactors = [];
            let riskScore = 0;

            // Signature compliance
            if (contract.requiresSignature && contract.signatures.length === 0) {
                riskFactors.push('MISSING_SIGNATURES');
                riskScore += 30;
            }

            // Expiration risk
            if (contract.expiryDate && new Date() > new Date(contract.expiryDate)) {
                riskFactors.push('EXPIRED_CONTRACT');
                riskScore += 25;
            }

            // Enforcement risk
            if (contract.enforcements && contract.enforcements.length > 0) {
                riskFactors.push('ACTIVE_ENFORCEMENT');
                riskScore += 20;
            }

            // Amendment risk
            if (contract.amendments && contract.amendments.length > 0) {
                riskFactors.push('PENDING_AMENDMENTS');
                riskScore += 15;
            }

            // Compliance record risk
            if (contract.complianceRecords && contract.complianceRecords.length > 0) {
                const failedCompliance = contract.complianceRecords.filter(cr => cr.status === 'FAILED');
                if (failedCompliance.length > 0) {
                    riskFactors.push('COMPLIANCE_VIOLATIONS');
                    riskScore += 25;
                }
            }

            // Determine risk level
            let riskLevel = 'LOW';
            if (riskScore >= 50) riskLevel = 'HIGH';
            else if (riskScore >= 25) riskLevel = 'MEDIUM';

            return {
                id: contract.id,
                title: contract.title,
                type: contract.type,
                status: contract.status,
                riskScore,
                riskLevel,
                riskFactors,
                signatureCount: contract.signatures.length,
                enforcementCount: contract.enforcements.length,
                amendmentCount: contract.amendments.length,
                complianceStatus: contract.complianceRecords ? 
                    contract.complianceRecords.every(cr => cr.status === 'PASSED') : true
            };
        });

        // Risk summary
        const riskSummary = {
            total: complianceAnalysis.length,
            lowRisk: complianceAnalysis.filter(c => c.riskLevel === 'LOW').length,
            mediumRisk: complianceAnalysis.filter(c => c.riskLevel === 'MEDIUM').length,
            highRisk: complianceAnalysis.filter(c => c.riskLevel === 'HIGH').length,
            averageRiskScore: complianceAnalysis.reduce((sum, c) => sum + c.riskScore, 0) / complianceAnalysis.length
        };

        res.json({
            success: true,
            message: 'Advanced compliance analysis completed',
            complianceAnalysis,
            riskSummary,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Advanced compliance analysis error:', error);
        res.status(500).json({
            error: 'Failed to complete compliance analysis',
            details: error.message
        });
    }
});

// ===== HEALTH CHECK =====

/**
 * GET /advanced/health - Advanced contracts system health check
 */
router.get('/health', async (req, res) => {
    try {
        const [
            totalContracts,
            totalTemplates,
            totalSignatures,
            totalAmendments,
            totalEnforcements,
            totalVerifications
        ] = await Promise.all([
            prisma.legalDocument.count(),
            prisma.legalDocument.count({ where: { status: 'APPROVED' } }),
            prisma.legalDocumentSignature.count(),
            prisma.$queryRaw`SELECT COUNT(*) as count FROM "ContractAmendment"`.then(r => parseInt(r[0].count)),
            prisma.$queryRaw`SELECT COUNT(*) as count FROM "ContractEnforcement"`.then(r => parseInt(r[0].count)),
            prisma.$queryRaw`SELECT COUNT(*) as count FROM "SignatureVerification"`.then(r => parseInt(r[0].count))
        ]);

        res.json({
            success: true,
            message: 'Advanced contracts system is healthy',
            status: 'healthy',
            metrics: {
                totalContracts,
                totalTemplates,
                totalSignatures,
                totalAmendments,
                totalEnforcements,
                totalVerifications,
                averageSignaturesPerContract: totalContracts > 0 ? (totalSignatures / totalContracts).toFixed(2) : 0,
                amendmentRate: totalContracts > 0 ? (totalAmendments / totalContracts).toFixed(2) : 0,
                enforcementRate: totalContracts > 0 ? (totalEnforcements / totalContracts).toFixed(2) : 0
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Advanced contracts health check error:', error);
        res.status(500).json({
            success: false,
            message: 'Advanced contracts system health check failed',
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;
