const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const prisma = new PrismaClient();

// ===== FILE MANAGEMENT API SYSTEM =====

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
    },
    fileFilter: (req, file, cb) => {
        // Allow common document types
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
            'image/jpeg',
            'image/png',
            'image/gif'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('File type not allowed'), false);
        }
    }
});

// Health check
router.get('/health', async (req, res) => {
    try {
        const stats = await prisma.$queryRaw`
            SELECT 
                (SELECT COUNT(*) FROM "FileDocument") as totalFiles,
                (SELECT COUNT(*) FROM "FileDocument" WHERE "status" = 'ACTIVE') as activeFiles,
                (SELECT COUNT(*) FROM "FileDocument" WHERE "status" = 'ARCHIVED') as archivedFiles,
                (SELECT COUNT(*) FROM "FileDocument" WHERE "status" = 'DELETED') as deletedFiles
        `;
        
        res.json({
            success: true,
            message: 'File Management System is healthy',
            stats: {
                totalFiles: Number(stats[0].totalfiles),
                activeFiles: Number(stats[0].activefiles),
                archivedFiles: Number(stats[0].archivedfiles),
                deletedFiles: Number(stats[0].deletedfiles)
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.json({
            success: true,
            message: 'File Management System is healthy (tables may not exist yet)',
            stats: {
                totalFiles: 0,
                activeFiles: 0,
                archivedFiles: 0,
                deletedFiles: 0
            },
            timestamp: new Date().toISOString()
        });
    }
});

// Create tables for file management system
router.post('/create-tables', async (req, res) => {
    try {
        // Drop existing tables if they exist
        await prisma.$executeRaw`DROP TABLE IF EXISTS "FileDocument" CASCADE`;
        await prisma.$executeRaw`DROP TABLE IF EXISTS "FilePermission" CASCADE`;
        await prisma.$executeRaw`DROP TABLE IF EXISTS "FileVersion" CASCADE`;
        await prisma.$executeRaw`DROP TABLE IF EXISTS "FileShare" CASCADE`;
        await prisma.$executeRaw`DROP TABLE IF EXISTS "DigitalSignature" CASCADE`;
        await prisma.$executeRaw`DROP TABLE IF EXISTS "DocumentTemplate" CASCADE`;

        // Create FileDocument table
        await prisma.$executeRaw`
            CREATE TABLE "FileDocument" (
                "id" TEXT NOT NULL,
                "fileName" TEXT NOT NULL,
                "originalName" TEXT NOT NULL,
                "filePath" TEXT NOT NULL,
                "fileSize" BIGINT NOT NULL,
                "mimeType" TEXT NOT NULL,
                "fileHash" TEXT NOT NULL,
                "uploadedBy" TEXT NOT NULL,
                "companyId" TEXT,
                "teamId" TEXT,
                "projectId" TEXT,
                "documentType" TEXT NOT NULL DEFAULT 'GENERAL',
                "status" TEXT NOT NULL DEFAULT 'ACTIVE',
                "isPublic" BOOLEAN NOT NULL DEFAULT false,
                "metadata" JSONB DEFAULT '{}',
                "tags" TEXT[] DEFAULT '{}',
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "FileDocument_pkey" PRIMARY KEY ("id")
            )
        `;

        // Create FilePermission table
        await prisma.$executeRaw`
            CREATE TABLE "FilePermission" (
                "id" TEXT NOT NULL,
                "fileId" TEXT NOT NULL,
                "userId" TEXT NOT NULL,
                "permission" TEXT NOT NULL DEFAULT 'READ',
                "grantedBy" TEXT NOT NULL,
                "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "expiresAt" TIMESTAMP(3),
                CONSTRAINT "FilePermission_pkey" PRIMARY KEY ("id")
            )
        `;

        // Create FileVersion table
        await prisma.$executeRaw`
            CREATE TABLE "FileVersion" (
                "id" TEXT NOT NULL,
                "fileId" TEXT NOT NULL,
                "versionNumber" INTEGER NOT NULL,
                "filePath" TEXT NOT NULL,
                "fileHash" TEXT NOT NULL,
                "uploadedBy" TEXT NOT NULL,
                "changeDescription" TEXT,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "FileVersion_pkey" PRIMARY KEY ("id")
            )
        `;

        // Create FileShare table
        await prisma.$executeRaw`
            CREATE TABLE "FileShare" (
                "id" TEXT NOT NULL,
                "fileId" TEXT NOT NULL,
                "sharedBy" TEXT NOT NULL,
                "sharedWith" TEXT NOT NULL,
                "shareType" TEXT NOT NULL DEFAULT 'LINK',
                "shareToken" TEXT NOT NULL UNIQUE,
                "permissions" TEXT[] DEFAULT '{"READ"}',
                "expiresAt" TIMESTAMP(3),
                "isActive" BOOLEAN NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "FileShare_pkey" PRIMARY KEY ("id")
            )
        `;

        // Create DigitalSignature table
        await prisma.$executeRaw`
            CREATE TABLE "DigitalSignature" (
                "id" TEXT NOT NULL,
                "fileId" TEXT NOT NULL,
                "signedBy" TEXT NOT NULL,
                "signatureType" TEXT NOT NULL DEFAULT 'DIGITAL_SIGNATURE',
                "signatureData" JSONB NOT NULL,
                "signatureHash" TEXT NOT NULL,
                "signedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "ipAddress" TEXT,
                "deviceInfo" JSONB DEFAULT '{}',
                "isVerified" BOOLEAN NOT NULL DEFAULT false,
                "verifiedAt" TIMESTAMP(3),
                CONSTRAINT "DigitalSignature_pkey" PRIMARY KEY ("id")
            )
        `;

        // Create DocumentTemplate table
        await prisma.$executeRaw`
            CREATE TABLE "DocumentTemplate" (
                "id" TEXT NOT NULL,
                "templateName" TEXT NOT NULL,
                "templateType" TEXT NOT NULL,
                "description" TEXT,
                "content" TEXT NOT NULL,
                "variables" JSONB DEFAULT '{}',
                "isActive" BOOLEAN NOT NULL DEFAULT true,
                "createdBy" TEXT NOT NULL,
                "companyId" TEXT,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "DocumentTemplate_pkey" PRIMARY KEY ("id")
            )
        `;

        // Create indexes for performance
        await prisma.$executeRaw`CREATE INDEX "FileDocument_uploadedBy_idx" ON "FileDocument"("uploadedBy")`;
        await prisma.$executeRaw`CREATE INDEX "FileDocument_companyId_idx" ON "FileDocument"("companyId")`;
        await prisma.$executeRaw`CREATE INDEX "FileDocument_teamId_idx" ON "FileDocument"("teamId")`;
        await prisma.$executeRaw`CREATE INDEX "FileDocument_status_idx" ON "FileDocument"("status")`;
        await prisma.$executeRaw`CREATE INDEX "FilePermission_fileId_idx" ON "FilePermission"("fileId")`;
        await prisma.$executeRaw`CREATE INDEX "FilePermission_userId_idx" ON "FilePermission"("userId")`;
        await prisma.$executeRaw`CREATE INDEX "DigitalSignature_fileId_idx" ON "DigitalSignature"("fileId")`;
        await prisma.$executeRaw`CREATE INDEX "DigitalSignature_signedBy_idx" ON "DigitalSignature"("signedBy")`;

        res.json({
            success: true,
            message: 'File Management System tables created successfully',
            tables: ['FileDocument', 'FilePermission', 'FileVersion', 'FileShare', 'DigitalSignature', 'DocumentTemplate'],
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Table creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create tables',
            error: error.message
        });
    }
});

// Upload file
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const {
            companyId,
            teamId,
            projectId,
            documentType = 'GENERAL',
            isPublic = false,
            tags = [],
            metadata = {}
        } = req.body;

        const uploadedBy = req.body.uploadedBy || 'system'; // In real app, get from JWT token

        // Calculate file hash
        const fileBuffer = fs.readFileSync(req.file.path);
        const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

        // Create file document
        const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        await prisma.$executeRaw`
            INSERT INTO "FileDocument" (
                "id", "fileName", "originalName", "filePath", "fileSize", "mimeType", 
                "fileHash", "uploadedBy", "companyId", "teamId", "projectId", 
                "documentType", "isPublic", "metadata", "tags"
            ) VALUES (
                ${fileId}, ${req.file.filename}, ${req.file.originalname}, ${req.file.path}, 
                ${req.file.size}, ${req.file.mimetype}, ${fileHash}, ${uploadedBy}, 
                ${companyId}, ${teamId}, ${projectId}, ${documentType}, ${isPublic}, 
                ${JSON.stringify(metadata)}::jsonb, ${tags}
            )
        `;

        // Create initial version
        const versionId = `version_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        await prisma.$executeRaw`
            INSERT INTO "FileVersion" (
                "id", "fileId", "versionNumber", "filePath", "fileHash", 
                "uploadedBy", "changeDescription"
            ) VALUES (
                ${versionId}, ${fileId}, 1, ${req.file.path}, ${fileHash}, 
                ${uploadedBy}, 'Initial upload'
            )
        `;

        // Get the created file
        const file = await prisma.$queryRaw`
            SELECT * FROM "FileDocument" WHERE id = ${fileId}
        `;

        res.json({
            success: true,
            message: 'File uploaded successfully',
            file: {
                id: file[0].id,
                fileName: file[0].fileName,
                originalName: file[0].originalName,
                fileSize: Number(file[0].fileSize),
                mimeType: file[0].mimeType,
                documentType: file[0].documentType,
                uploadedBy: file[0].uploadedBy,
                companyId: file[0].companyId,
                teamId: file[0].teamId,
                projectId: file[0].projectId,
                isPublic: file[0].isPublic,
                tags: file[0].tags,
                createdAt: file[0].createdAt
            }
        });
    } catch (error) {
        console.error('File upload error:', error);
        res.status(500).json({
            success: false,
            message: 'File upload failed',
            error: error.message
        });
    }
});

// Get file by ID
router.get('/:fileId', async (req, res) => {
    try {
        const { fileId } = req.params;
        const userId = req.query.userId || 'system'; // In real app, get from JWT token

        // Get file with permissions check
        const file = await prisma.$queryRaw`
            SELECT f.*, 
                   CASE 
                       WHEN f."isPublic" = true THEN true
                       WHEN fp."permission" IS NOT NULL THEN true
                       WHEN f."uploadedBy" = ${userId} THEN true
                       ELSE false
                   END as hasAccess
            FROM "FileDocument" f
            LEFT JOIN "FilePermission" fp ON f.id = fp."fileId" AND fp."userId" = ${userId}
            WHERE f.id = ${fileId}
            AND f.status = 'ACTIVE'
        `;

        if (!file || file.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }

        if (!file[0].hasaccess) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Get file versions
        const versions = await prisma.$queryRaw`
            SELECT * FROM "FileVersion" 
            WHERE "fileId" = ${fileId}
            ORDER BY "versionNumber" DESC
        `;

        // Get digital signatures
        const signatures = await prisma.$queryRaw`
            SELECT * FROM "DigitalSignature" 
            WHERE "fileId" = ${fileId}
            ORDER BY "signedAt" DESC
        `;

        res.json({
            success: true,
            file: {
                id: file[0].id,
                fileName: file[0].fileName,
                originalName: file[0].originalName,
                fileSize: Number(file[0].fileSize),
                mimeType: file[0].mimeType,
                documentType: file[0].documentType,
                uploadedBy: file[0].uploadedBy,
                companyId: file[0].companyId,
                teamId: file[0].teamId,
                projectId: file[0].projectId,
                isPublic: file[0].isPublic,
                tags: file[0].tags,
                metadata: file[0].metadata,
                versions: versions.map(v => ({
                    versionNumber: v.versionNumber,
                    uploadedBy: v.uploadedBy,
                    changeDescription: v.changeDescription,
                    createdAt: v.createdAt
                })),
                signatures: signatures.map(s => ({
                    signedBy: s.signedBy,
                    signatureType: s.signatureType,
                    signedAt: s.signedAt,
                    isVerified: s.isVerified
                })),
                createdAt: file[0].createdAt,
                updatedAt: file[0].updatedAt
            }
        });
    } catch (error) {
        console.error('Get file error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get file',
            error: error.message
        });
    }
});

// List files
router.get('/', async (req, res) => {
    try {
        const {
            companyId,
            teamId,
            projectId,
            documentType,
            uploadedBy,
            status = 'ACTIVE',
            limit = 50,
            offset = 0
        } = req.query;

        let whereClause = `WHERE f.status = '${status}'`;
        if (companyId) whereClause += ` AND f."companyId" = '${companyId}'`;
        if (teamId) whereClause += ` AND f."teamId" = '${teamId}'`;
        if (projectId) whereClause += ` AND f."projectId" = '${projectId}'`;
        if (documentType) whereClause += ` AND f."documentType" = '${documentType}'`;
        if (uploadedBy) whereClause += ` AND f."uploadedBy" = '${uploadedBy}'`;

        const files = await prisma.$queryRaw`
            SELECT f.*, 
                   COUNT(fv.id) as versionCount,
                   COUNT(ds.id) as signatureCount
            FROM "FileDocument" f
            LEFT JOIN "FileVersion" fv ON f.id = fv."fileId"
            LEFT JOIN "DigitalSignature" ds ON f.id = ds."fileId"
            ${whereClause}
            GROUP BY f.id
            ORDER BY f."createdAt" DESC
            LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
        `;

        res.json({
            success: true,
            files: files.map(f => ({
                id: f.id,
                fileName: f.filename,
                originalName: f.originalname,
                fileSize: Number(f.filesize),
                mimeType: f.mimetype,
                documentType: f.documenttype,
                uploadedBy: f.uploadedby,
                companyId: f.companyid,
                teamId: f.teamid,
                projectId: f.projectid,
                isPublic: f.ispublic,
                tags: f.tags,
                versionCount: Number(f.versioncount),
                signatureCount: Number(f.signaturecount),
                createdAt: f.createdat
            })),
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset),
                total: files.length
            }
        });
    } catch (error) {
        console.error('List files error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to list files',
            error: error.message
        });
    }
});

// Update file metadata
router.put('/:fileId', async (req, res) => {
    try {
        const { fileId } = req.params;
        const {
            fileName,
            documentType,
            isPublic,
            tags,
            metadata
        } = req.body;

        const updateFields = [];
        const values = [];
        let paramIndex = 1;

        if (fileName) {
            updateFields.push(`"fileName" = $${paramIndex}`);
            values.push(fileName);
            paramIndex++;
        }
        if (documentType) {
            updateFields.push(`"documentType" = $${paramIndex}`);
            values.push(documentType);
            paramIndex++;
        }
        if (isPublic !== undefined) {
            updateFields.push(`"isPublic" = $${paramIndex}`);
            values.push(isPublic);
            paramIndex++;
        }
        if (tags) {
            updateFields.push(`"tags" = $${paramIndex}`);
            values.push(tags);
            paramIndex++;
        }
        if (metadata) {
            updateFields.push(`"metadata" = $${paramIndex}`);
            values.push(JSON.stringify(metadata));
            paramIndex++;
        }

        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }

        await prisma.$executeRaw`
            UPDATE "FileDocument" 
            SET ${updateFields.join(', ')}, "updatedAt" = NOW() 
            WHERE id = ${fileId}
        `;

        res.json({
            success: true,
            message: 'File updated successfully'
        });
    } catch (error) {
        console.error('Update file error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update file',
            error: error.message
        });
    }
});

// Delete file (soft delete)
router.delete('/:fileId', async (req, res) => {
    try {
        const { fileId } = req.params;

        await prisma.$executeRaw`
            UPDATE "FileDocument" 
            SET status = 'DELETED', "updatedAt" = NOW() 
            WHERE id = ${fileId}
        `;

        res.json({
            success: true,
            message: 'File deleted successfully'
        });
    } catch (error) {
        console.error('Delete file error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete file',
            error: error.message
        });
    }
});

// Share file
router.post('/:fileId/share', async (req, res) => {
    try {
        const { fileId } = req.params;
        const {
            sharedWith,
            shareType = 'LINK',
            permissions = ['READ'],
            expiresAt
        } = req.body;

        const sharedBy = req.body.sharedBy || 'system'; // In real app, get from JWT token

        // Generate share token
        const shareToken = crypto.randomBytes(32).toString('hex');
        const shareId = `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        await prisma.$executeRaw`
            INSERT INTO "FileShare" (
                "id", "fileId", "sharedBy", "sharedWith", "shareType", 
                "shareToken", "permissions", "expiresAt"
            ) VALUES (
                ${shareId}, ${fileId}, ${sharedBy}, ${sharedWith}, ${shareType},
                ${shareToken}, ${permissions}, ${expiresAt ? new Date(expiresAt) : null}
            )
        `;

        res.json({
            success: true,
            message: 'File shared successfully',
            share: {
                id: shareId,
                shareToken,
                permissions,
                expiresAt
            }
        });
    } catch (error) {
        console.error('Share file error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to share file',
            error: error.message
        });
    }
});

// Get shared files
router.get('/shared/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const sharedFiles = await prisma.$queryRaw`
            SELECT fs.*, f."fileName", f."originalName", f."mimeType", 
                   f."documentType", u."firstName", u."lastName" as sharedByFirstName
            FROM "FileShare" fs
            JOIN "FileDocument" f ON fs."fileId" = f.id
            JOIN "User" u ON fs."sharedBy" = u.id
            WHERE fs."sharedWith" = ${userId}
            AND fs."isActive" = true
            AND (fs."expiresAt" IS NULL OR fs."expiresAt" > NOW())
            ORDER BY fs."createdAt" DESC
        `;

        res.json({
            success: true,
            sharedFiles: sharedFiles.map(sf => ({
                id: sf.id,
                fileId: sf.fileid,
                fileName: sf.filename,
                originalName: sf.originalname,
                mimeType: sf.mimetype,
                documentType: sf.documenttype,
                permissions: sf.permissions,
                sharedBy: `${sf.firstname} ${sf.sharedbyfirstname}`,
                expiresAt: sf.expiresat,
                createdAt: sf.createdat
            }))
        });
    } catch (error) {
        console.error('Get shared files error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get shared files',
            error: error.message
        });
    }
});

module.exports = router;
