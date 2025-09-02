const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();

// ===== DIGITAL DOCUMENTS & SIGNING API SYSTEM =====

// Health check
router.get('/health', async (req, res) => {
    try {
        const stats = await prisma.$queryRaw`
            SELECT 
                (SELECT COUNT(*) FROM "DocumentTemplate") as totalTemplates,
                (SELECT COUNT(*) FROM "DigitalSignature") as totalSignatures,
                (SELECT COUNT(*) FROM "DigitalSignature" WHERE "isVerified" = true) as verifiedSignatures,
                (SELECT COUNT(*) FROM "FileDocument" WHERE "documentType" IN ('CONTRACT', 'AGREEMENT', 'LEGAL_DOCUMENT')) as legalDocuments
        `;
        
        res.json({
            success: true,
            message: 'Digital Documents & Signing System is healthy',
            stats: {
                totalTemplates: Number(stats[0].totaltemplates),
                totalSignatures: Number(stats[0].totalsignatures),
                verifiedSignatures: Number(stats[0].verifiedsignatures),
                legalDocuments: Number(stats[0].legaldocuments)
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.json({
            success: true,
            message: 'Digital Documents & Signing System is healthy (tables may not exist yet)',
            stats: {
                totalTemplates: 0,
                totalSignatures: 0,
                verifiedSignatures: 0,
                legalDocuments: 0
            },
            timestamp: new Date().toISOString()
        });
    }
});

// Create document template
router.post('/templates/create', async (req, res) => {
    try {
        const {
            templateName,
            templateType,
            description,
            content,
            variables = {},
            companyId
        } = req.body;

        if (!templateName || !templateType || !content) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: templateName, templateType, content'
            });
        }

        const createdBy = req.body.createdBy || 'system'; // In real app, get from JWT token

        const templateId = `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        await prisma.$executeRaw`
            INSERT INTO "DocumentTemplate" (
                "id", "templateName", "templateType", "description", "content", 
                "variables", "createdBy", "companyId"
            ) VALUES (
                ${templateId}, ${templateName}, ${templateType}, ${description}, ${content},
                ${JSON.stringify(variables)}::jsonb, ${createdBy}, ${companyId}
            )
        `;

        res.json({
            success: true,
            message: 'Document template created successfully',
            template: {
                id: templateId,
                templateName,
                templateType,
                description,
                variables
            }
        });
    } catch (error) {
        console.error('Create template error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create template',
            error: error.message
        });
    }
});

// Get document templates
router.get('/templates', async (req, res) => {
    try {
        const { templateType, companyId, isActive = true } = req.query;

        let whereClause = `WHERE "isActive" = ${isActive}`;
        if (templateType) whereClause += ` AND "templateType" = '${templateType}'`;
        if (companyId) whereClause += ` AND "companyId" = '${companyId}'`;

        const templates = await prisma.$queryRaw`
            SELECT * FROM "DocumentTemplate" 
            ${whereClause}
            ORDER BY "createdAt" DESC
        `;

        res.json({
            success: true,
            templates: templates.map(t => ({
                id: t.id,
                templateName: t.templatename,
                templateType: t.templatetype,
                description: t.description,
                variables: t.variables,
                createdBy: t.createdby,
                companyId: t.companyid,
                isActive: t.isactive,
                createdAt: t.createdat,
                updatedAt: t.updatedat
            }))
        });
    } catch (error) {
        console.error('Get templates error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get templates',
            error: error.message
        });
    }
});

// Generate document from template
router.post('/generate', async (req, res) => {
    try {
        const {
            templateId,
            variables = {},
            fileName,
            companyId,
            teamId,
            projectId,
            documentType = 'LEGAL_DOCUMENT'
        } = req.body;

        if (!templateId || !fileName) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: templateId, fileName'
            });
        }

        // Get template
        const template = await prisma.$queryRaw`
            SELECT * FROM "DocumentTemplate" WHERE id = ${templateId} AND "isActive" = true
        `;

        if (!template || template.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Template not found'
            });
        }

        // Generate content by replacing variables
        let generatedContent = template[0].content;
        Object.keys(variables).forEach(key => {
            const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
            generatedContent = generatedContent.replace(regex, variables[key]);
        });

        // Create a temporary file with generated content
        const tempFileName = `generated_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.txt`;
        const tempFilePath = `/tmp/${tempFileName}`;
        
        // In a real implementation, you'd write the file to storage
        // For now, we'll create a document record with the generated content

        const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        await prisma.$executeRaw`
            INSERT INTO "FileDocument" (
                "id", "fileName", "originalName", "filePath", "fileSize", "mimeType", 
                "fileHash", "uploadedBy", "companyId", "teamId", "projectId", 
                "documentType", "metadata"
            ) VALUES (
                ${documentId}, ${tempFileName}, ${fileName}, ${tempFilePath}, 
                ${generatedContent.length}, 'text/plain', 
                ${crypto.createHash('sha256').update(generatedContent).digest('hex')}, 
                'system', ${companyId}, ${teamId}, ${projectId}, ${documentType},
                ${JSON.stringify({ templateId, variables, generatedContent })}::jsonb
            )
        `;

        res.json({
            success: true,
            message: 'Document generated successfully',
            document: {
                id: documentId,
                fileName: tempFileName,
                originalName: fileName,
                documentType,
                companyId,
                teamId,
                projectId,
                content: generatedContent,
                variables
            }
        });
    } catch (error) {
        console.error('Generate document error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate document',
            error: error.message
        });
    }
});

// Create digital signature
router.post('/:documentId/sign', async (req, res) => {
    try {
        const { documentId } = req.params;
        const {
            signedBy,
            signatureType = 'DIGITAL_SIGNATURE',
            signatureData = {},
            ipAddress,
            deviceInfo = {}
        } = req.body;

        if (!signedBy) {
            return res.status(400).json({
                success: false,
                message: 'Missing required field: signedBy'
            });
        }

        // Check if document exists
        const document = await prisma.$queryRaw`
            SELECT * FROM "FileDocument" WHERE id = ${documentId} AND status = 'ACTIVE'
        `;

        if (!document || document.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        // Check if already signed by this user
        const existingSignature = await prisma.$queryRaw`
            SELECT * FROM "DigitalSignature" 
            WHERE "fileId" = ${documentId} AND "signedBy" = ${signedBy}
        `;

        if (existingSignature && existingSignature.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Document already signed by this user'
            });
        }

        // Create signature hash
        const signatureHash = crypto.createHash('sha256')
            .update(`${documentId}${signedBy}${Date.now()}`)
            .digest('hex');

        const signatureId = `signature_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        await prisma.$executeRaw`
            INSERT INTO "DigitalSignature" (
                "id", "fileId", "signedBy", "signatureType", "signatureData", 
                "signatureHash", "ipAddress", "deviceInfo"
            ) VALUES (
                ${signatureId}, ${documentId}, ${signedBy}, ${signatureType},
                ${JSON.stringify(signatureData)}::jsonb, ${signatureHash}, ${ipAddress},
                ${JSON.stringify(deviceInfo)}::jsonb
            )
        `;

        res.json({
            success: true,
            message: 'Document signed successfully',
            signature: {
                id: signatureId,
                documentId,
                signedBy,
                signatureType,
                signatureHash,
                signedAt: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Sign document error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to sign document',
            error: error.message
        });
    }
});

// Verify digital signature
router.post('/:documentId/verify/:signatureId', async (req, res) => {
    try {
        const { documentId, signatureId } = req.params;

        // Get signature
        const signature = await prisma.$queryRaw`
            SELECT * FROM "DigitalSignature" WHERE id = ${signatureId} AND "fileId" = ${documentId}
        `;

        if (!signature || signature.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Signature not found'
            });
        }

        // Get document
        const document = await prisma.$queryRaw`
            SELECT * FROM "FileDocument" WHERE id = ${documentId}
        `;

        if (!document || document.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        // Verify signature hash
        const expectedHash = crypto.createHash('sha256')
            .update(`${documentId}${signature[0].signedby}${signature[0].signedat.getTime()}`)
            .digest('hex');

        const isValid = signature[0].signaturehash === expectedHash;

        // Update verification status
        if (isValid) {
            await prisma.$executeRaw`
                UPDATE "DigitalSignature" 
                SET "isVerified" = true, "verifiedAt" = NOW() 
                WHERE id = ${signatureId}
            `;
        }

        res.json({
            success: true,
            signature: {
                id: signatureId,
                documentId,
                signedBy: signature[0].signedby,
                signatureType: signature[0].signaturetype,
                signatureHash: signature[0].signaturehash,
                signedAt: signature[0].signedat,
                isVerified: isValid,
                verifiedAt: isValid ? new Date().toISOString() : null,
                verificationResult: isValid ? 'VALID' : 'INVALID'
            }
        });
    } catch (error) {
        console.error('Verify signature error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify signature',
            error: error.message
        });
    }
});

// Get document signatures
router.get('/:documentId/signatures', async (req, res) => {
    try {
        const { documentId } = req.params;

        const signatures = await prisma.$queryRaw`
            SELECT ds.*, u."firstName", u."lastName"
            FROM "DigitalSignature" ds
            LEFT JOIN "User" u ON ds."signedBy" = u.id
            WHERE ds."fileId" = ${documentId}
            ORDER BY ds."signedAt" DESC
        `;

        res.json({
            success: true,
            signatures: signatures.map(s => ({
                id: s.id,
                signedBy: s.signedby,
                signerName: s.firstname && s.lastname ? `${s.firstname} ${s.lastname}` : 'Unknown User',
                signatureType: s.signaturetype,
                signatureHash: s.signaturehash,
                signedAt: s.signedat,
                isVerified: s.isverified,
                verifiedAt: s.verifiedat,
                ipAddress: s.ipaddress,
                deviceInfo: s.deviceinfo
            }))
        });
    } catch (error) {
        console.error('Get signatures error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get signatures',
            error: error.message
        });
    }
});

// Create signing workflow
router.post('/workflow/create', async (req, res) => {
    try {
        const {
            documentId,
            workflowName,
            description,
            signers = [],
            companyId,
            teamId,
            expiresAt
        } = req.body;

        if (!documentId || !workflowName || !signers || signers.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: documentId, workflowName, signers'
            });
        }

        // Create workflow record (you might want to create a separate Workflow table)
        const workflowId = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // For now, we'll create a metadata record in the document
        await prisma.$executeRaw`
            UPDATE "FileDocument" 
            SET "metadata" = "metadata" || ${JSON.stringify({
                workflowId,
                workflowName,
                description,
                signers,
                status: 'PENDING_SIGNATURES',
                createdAt: new Date().toISOString(),
                expiresAt
            })}::jsonb
            WHERE id = ${documentId}
        `;

        res.json({
            success: true,
            message: 'Signing workflow created successfully',
            workflow: {
                id: workflowId,
                documentId,
                workflowName,
                description,
                signers,
                status: 'PENDING_SIGNATURES',
                expiresAt
            }
        });
    } catch (error) {
        console.error('Create workflow error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create workflow',
            error: error.message
        });
    }
});

// Get legal documents
router.get('/legal', async (req, res) => {
    try {
        const { companyId, teamId, status = 'ACTIVE', limit = 50, offset = 0 } = req.query;

        let whereClause = `WHERE f."documentType" IN ('CONTRACT', 'AGREEMENT', 'LEGAL_DOCUMENT') AND f.status = '${status}'`;
        if (companyId) whereClause += ` AND f."companyId" = '${companyId}'`;
        if (teamId) whereClause += ` AND f."teamId" = '${teamId}'`;

        const documents = await prisma.$queryRaw`
            SELECT f.*, 
                   COUNT(ds.id) as signatureCount,
                   COUNT(CASE WHEN ds."isVerified" = true THEN 1 END) as verifiedSignatures
            FROM "FileDocument" f
            LEFT JOIN "DigitalSignature" ds ON f.id = ds."fileId"
            ${whereClause}
            GROUP BY f.id
            ORDER BY f."createdAt" DESC
            LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
        `;

        res.json({
            success: true,
            legalDocuments: documents.map(d => ({
                id: d.id,
                fileName: d.filename,
                originalName: d.originalname,
                documentType: d.documenttype,
                companyId: d.companyid,
                teamId: d.teamid,
                signatureCount: Number(d.signaturecount),
                verifiedSignatures: Number(d.verifiedsignatures),
                metadata: d.metadata,
                createdAt: d.createdat,
                updatedAt: d.updatedat
            })),
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset),
                total: documents.length
            }
        });
    } catch (error) {
        console.error('Get legal documents error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get legal documents',
            error: error.message
        });
    }
});

// Get document signing status
router.get('/:documentId/status', async (req, res) => {
    try {
        const { documentId } = req.params;

        // Get document
        const document = await prisma.$queryRaw`
            SELECT * FROM "FileDocument" WHERE id = ${documentId}
        `;

        if (!document || document.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        // Get signatures
        const signatures = await prisma.$queryRaw`
            SELECT * FROM "DigitalSignature" WHERE "fileId" = ${documentId}
        `;

        // Get workflow info
        const workflow = document[0].metadata?.workflowId ? {
            id: document[0].metadata.workflowId,
            name: document[0].metadata.workflowName,
            description: document[0].metadata.description,
            signers: document[0].metadata.signers || [],
            status: document[0].metadata.status || 'PENDING_SIGNATURES',
            expiresAt: document[0].metadata.expiresAt
        } : null;

        // Calculate signing progress
        const totalSigners = workflow ? workflow.signers.length : 0;
        const signedCount = signatures.length;
        const verifiedCount = signatures.filter(s => s.isverified).length;
        const progress = totalSigners > 0 ? Math.round((signedCount / totalSigners) * 100) : 0;

        res.json({
            success: true,
            document: {
                id: documentId,
                fileName: document[0].filename,
                documentType: document[0].documenttype,
                status: document[0].status
            },
            workflow,
            signingProgress: {
                totalSigners,
                signedCount,
                verifiedCount,
                progress: `${progress}%`,
                isComplete: signedCount >= totalSigners && totalSigners > 0
            },
            signatures: signatures.map(s => ({
                id: s.id,
                signedBy: s.signedby,
                signatureType: s.signaturetype,
                signedAt: s.signedat,
                isVerified: s.isverified,
                verifiedAt: s.verifiedat
            }))
        });
    } catch (error) {
        console.error('Get document status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get document status',
            error: error.message
        });
    }
});

module.exports = router;
