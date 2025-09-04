const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const prisma = new PrismaClient();

// ===== KYC/IDENTITY VERIFICATION API SYSTEM =====

// Configure multer for KYC document uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/kyc');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `kyc-${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit for KYC documents
    },
    fileFilter: (req, file, cb) => {
        // Allow common document types for KYC
        const allowedTypes = [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'image/gif'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('File type not allowed for KYC documents'), false);
        }
    }
});

// Health check
router.get('/health', async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'KYC API is healthy',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'KYC API health check failed',
            error: error.message
        });
    }
});

// ===== KYC VERIFICATION ENDPOINTS =====

/**
 * POST /api/kyc/submit - Submit KYC information
 */
router.post('/submit', async (req, res) => {
    try {
        const {
            userId,
            fullName,
            dateOfBirth,
            country,
            phoneNumber
        } = req.body;

        if (!userId || !fullName || !dateOfBirth || !country || !phoneNumber) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: userId, fullName, dateOfBirth, country, phoneNumber'
            });
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if KYC already exists
        const existingKyc = await prisma.$queryRaw`
            SELECT * FROM "KycVerification" WHERE "userId" = ${userId}
        `;

        if (existingKyc && existingKyc.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'KYC verification already exists for this user'
            });
        }

        // Create KYC verification record
        const kycId = `kyc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        await prisma.$executeRaw`
            INSERT INTO "KycVerification" (
                "id", "userId", "fullName", "dateOfBirth", "country", "phoneNumber",
                "governmentIdStatus", "proofOfAddressStatus", "overallStatus",
                "createdAt", "updatedAt"
            ) VALUES (
                ${kycId}, ${userId}, ${fullName}, ${dateOfBirth}, ${country}, ${phoneNumber},
                'PENDING', 'PENDING', 'PENDING', NOW(), NOW()
            )
        `;

        // Update user profile with KYC information
        await prisma.$executeRaw`
            UPDATE "User" 
            SET "firstName" = ${fullName.split(' ')[0]}, 
                "lastName" = ${fullName.split(' ').slice(1).join(' ')},
                "updatedAt" = NOW()
            WHERE "id" = ${userId}
        `;

        res.json({
            success: true,
            message: 'KYC information submitted successfully',
            kyc: {
                id: kycId,
                userId,
                fullName,
                dateOfBirth,
                country,
                phoneNumber,
                status: 'PENDING'
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('KYC submission error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit KYC information',
            error: error.message
        });
    }
});

/**
 * POST /api/kyc/upload-document - Upload KYC document
 */
router.post('/upload-document', upload.single('document'), async (req, res) => {
    try {
        const {
            userId,
            documentType // GOVERNMENT_ID or PROOF_OF_ADDRESS
        } = req.body;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No document uploaded'
            });
        }

        if (!userId || !documentType) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: userId, documentType'
            });
        }

        // Check if KYC verification exists
        const kyc = await prisma.$queryRaw`
            SELECT * FROM "KycVerification" WHERE "userId" = ${userId}
        `;

        if (!kyc || kyc.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'KYC verification not found. Please submit KYC information first.'
            });
        }

        // Calculate file hash
        const fileBuffer = fs.readFileSync(req.file.path);
        const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

        // Create KYC document record
        const documentId = `kyc_doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        await prisma.$executeRaw`
            INSERT INTO "KycDocument" (
                "id", "kycId", "documentType", "fileName", "filePath", "fileHash",
                "status", "createdAt"
            ) VALUES (
                ${documentId}, ${kyc[0].id}, ${documentType}, ${req.file.filename}, 
                ${req.file.path}, ${fileHash}, 'PENDING', NOW()
            )
        `;

        // Update KYC verification status based on document type
        if (documentType === 'GOVERNMENT_ID') {
            await prisma.$executeRaw`
                UPDATE "KycVerification" 
                SET "governmentIdStatus" = 'PENDING', "updatedAt" = NOW()
                WHERE "id" = ${kyc[0].id}
            `;
        } else if (documentType === 'PROOF_OF_ADDRESS') {
            await prisma.$executeRaw`
                UPDATE "KycVerification" 
                SET "proofOfAddressStatus" = 'PENDING', "updatedAt" = NOW()
                WHERE "id" = ${kyc[0].id}
            `;
        }

        res.json({
            success: true,
            message: 'KYC document uploaded successfully',
            document: {
                id: documentId,
                kycId: kyc[0].id,
                documentType,
                fileName: req.file.filename,
                fileSize: req.file.size,
                mimeType: req.file.mimetype,
                status: 'PENDING'
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('KYC document upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload KYC document',
            error: error.message
        });
    }
});

/**
 * GET /api/kyc/status/:userId - Get KYC status for user
 */
router.get('/status/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // Get KYC verification
        const kyc = await prisma.$queryRaw`
            SELECT * FROM "KycVerification" WHERE "userId" = ${userId}
        `;

        if (!kyc || kyc.length === 0) {
            return res.json({
                success: true,
                message: 'No KYC verification found',
                kyc: null
            });
        }

        // Get KYC documents
        const documents = await prisma.$queryRaw`
            SELECT * FROM "KycDocument" WHERE "kycId" = ${kyc[0].id}
        `;

        res.json({
            success: true,
            kyc: {
                id: kyc[0].id,
                userId: kyc[0].userId,
                fullName: kyc[0].fullName,
                dateOfBirth: kyc[0].dateOfBirth,
                country: kyc[0].country,
                phoneNumber: kyc[0].phoneNumber,
                governmentIdStatus: kyc[0].governmentIdStatus,
                proofOfAddressStatus: kyc[0].proofOfAddressStatus,
                overallStatus: kyc[0].overallStatus,
                verifiedBy: kyc[0].verifiedBy,
                verifiedAt: kyc[0].verifiedAt,
                rejectionReason: kyc[0].rejectionReason,
                createdAt: kyc[0].createdAt,
                updatedAt: kyc[0].updatedAt
            },
            documents: documents.map(doc => ({
                id: doc.id,
                documentType: doc.documentType,
                fileName: doc.fileName,
                status: doc.status,
                reviewedBy: doc.reviewedBy,
                reviewedAt: doc.reviewedAt,
                rejectionReason: doc.rejectionReason,
                createdAt: doc.createdAt
            }))
        });

    } catch (error) {
        console.error('KYC status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get KYC status',
            error: error.message
        });
    }
});

/**
 * POST /api/kyc/verify - Process KYC verification (admin function)
 */
router.post('/verify', async (req, res) => {
    try {
        const {
            kycId,
            action, // APPROVE or REJECT
            rejectionReason,
            verifiedBy
        } = req.body;

        if (!kycId || !action || !verifiedBy) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: kycId, action, verifiedBy'
            });
        }

        // Get KYC verification
        const kyc = await prisma.$queryRaw`
            SELECT * FROM "KycVerification" WHERE "id" = ${kycId}
        `;

        if (!kyc || kyc.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'KYC verification not found'
            });
        }

        // Update KYC verification status
        const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
        
        await prisma.$executeRaw`
            UPDATE "KycVerification" 
            SET "overallStatus" = ${newStatus}, 
                "verifiedBy" = ${verifiedBy}, 
                "verifiedAt" = NOW(),
                "rejectionReason" = ${rejectionReason || null},
                "updatedAt" = NOW()
            WHERE "id" = ${kycId}
        `;

        // Update user's KYC status
        await prisma.$executeRaw`
            UPDATE "User" 
            SET "kycStatus" = ${newStatus}, "updatedAt" = NOW()
            WHERE "id" = ${kyc[0].userId}
        `;

        res.json({
            success: true,
            message: `KYC verification ${action.toLowerCase()}d successfully`,
            kyc: {
                id: kycId,
                status: newStatus,
                verifiedBy,
                verifiedAt: new Date().toISOString(),
                rejectionReason: action === 'REJECT' ? rejectionReason : null
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('KYC verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process KYC verification',
            error: error.message
        });
    }
});

/**
 * GET /api/kyc/documents/:userId - List KYC documents for user
 */
router.get('/documents/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // Get KYC verification
        const kyc = await prisma.$queryRaw`
            SELECT * FROM "KycVerification" WHERE "userId" = ${userId}
        `;

        if (!kyc || kyc.length === 0) {
            return res.json({
                success: true,
                message: 'No KYC verification found',
                documents: []
            });
        }

        // Get KYC documents
        const documents = await prisma.$queryRaw`
            SELECT * FROM "KycDocument" WHERE "kycId" = ${kyc[0].id}
        `;

        res.json({
            success: true,
            documents: documents.map(doc => ({
                id: doc.id,
                documentType: doc.documentType,
                fileName: doc.fileName,
                status: doc.status,
                reviewedBy: doc.reviewedBy,
                reviewedAt: doc.reviewedAt,
                rejectionReason: doc.rejectionReason,
                createdAt: doc.createdAt
            }))
        });

    } catch (error) {
        console.error('KYC documents error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get KYC documents',
            error: error.message
        });
    }
});

module.exports = router;
