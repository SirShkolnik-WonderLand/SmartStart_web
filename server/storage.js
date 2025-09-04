const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const { PDFDocument } = require('pdf-lib');
const QRCode = require('qrcode');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.STORAGE_PORT || 3002;

// Configure AWS S3
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ?
        ['https://smartstart-platform.onrender.com'] :
        ['http://localhost:3000'],
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // limit each IP to 50 requests per windowMs
    message: 'Too many file upload requests from this IP'
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Authentication middleware
const authenticateToken = async(req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            include: {
                account: {
                    include: {
                        role: {
                            include: {
                                rolePermissions: {
                                    include: {
                                        permission: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!user || !user.account || !user.account.isActive) {
            return res.status(401).json({ error: 'Invalid or inactive user' });
        }

        req.user = user;
        req.permissions = user.account.role.rolePermissions.map(rp => rp.permission.name);
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid token' });
    }
};

// Permission checking middleware
const requirePermission = (permission) => {
    return (req, res, next) => {
        if (!req.permissions.includes(permission)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        next();
    };
};

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Allow specific file types
        const allowedTypes = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'application/pdf', 'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain', 'text/csv'
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'), false);
        }
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        service: 'file-storage'
    });
});

// Upload file endpoint
app.post('/api/upload', authenticateToken, upload.single('file'), async(req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file provided' });
        }

        const { ventureId, fileType, description } = req.body;
        const file = req.file;

        // Generate unique filename
        const fileId = uuidv4();
        const fileExtension = file.originalname.split('.').pop();
        const fileName = `${fileType}/${ventureId}/${fileId}.${fileExtension}`;

        // Process file based on type
        let processedBuffer = file.buffer;
        let mimeType = file.mimetype;

        if (file.mimetype.startsWith('image/')) {
            // Optimize images
            processedBuffer = await sharp(file.buffer)
                .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
                .jpeg({ quality: 85 })
                .toBuffer();
            mimeType = 'image/jpeg';
        }

        // Upload to S3
        const uploadParams = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: fileName,
            Body: processedBuffer,
            ContentType: mimeType,
            Metadata: {
                originalName: file.originalname,
                uploadedBy: req.user.id,
                ventureId: ventureId || 'none',
                fileType: fileType || 'general'
            }
        };

        const uploadResult = await s3.upload(uploadParams).promise();

        // Save file record to database
        const fileRecord = await prisma.legalDocument.create({
            data: {
                title: file.originalname,
                type: fileType || 'GENERAL',
                content: uploadResult.Location,
                version: '1.0',
                status: 'DRAFT',
                createdBy: req.user.id,
                projectId: ventureId || null,
                entityId: ventureId || null
            }
        });

        res.json({
            success: true,
            file: {
                id: fileRecord.id,
                name: file.originalname,
                url: uploadResult.Location,
                size: file.size,
                type: fileType,
                uploadedAt: fileRecord.createdAt
            }
        });
    } catch (error) {
        console.error('File upload error:', error);
        res.status(500).json({ error: 'File upload failed' });
    }
});

// Download file endpoint
app.get('/api/download/:fileId', authenticateToken, async(req, res) => {
    try {
        const { fileId } = req.params;

        const fileRecord = await prisma.legalDocument.findUnique({
            where: { id: fileId }
        });

        if (!fileRecord) {
            return res.status(404).json({ error: 'File not found' });
        }

        // Check permissions
        if (fileRecord.projectId) {
            const membership = await prisma.projectMember.findFirst({
                where: {
                    projectId: fileRecord.projectId,
                    userId: req.user.id
                }
            });

            if (!membership && !req.permissions.includes('system:admin')) {
                return res.status(403).json({ error: 'Access denied' });
            }
        }

        // Get file from S3
        const key = fileRecord.content.split('/').pop();
        const downloadParams = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: key
        };

        const fileStream = s3.getObject(downloadParams).createReadStream();

        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${fileRecord.title}"`);

        fileStream.pipe(res);
    } catch (error) {
        console.error('File download error:', error);
        res.status(500).json({ error: 'File download failed' });
    }
});

// List files endpoint
app.get('/api/files', authenticateToken, async(req, res) => {
    try {
        const { ventureId, fileType } = req.query;

        const whereClause = {};
        if (ventureId) {
            whereClause.projectId = ventureId;
        }
        if (fileType) {
            whereClause.type = fileType;
        }

        const files = await prisma.legalDocument.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            success: true,
            files: files.map(file => ({
                id: file.id,
                title: file.title,
                type: file.type,
                status: file.status,
                createdAt: file.createdAt,
                url: file.content
            }))
        });
    } catch (error) {
        console.error('List files error:', error);
        res.status(500).json({ error: 'Failed to list files' });
    }
});

// Generate contract PDF endpoint
app.post('/api/contracts/generate', authenticateToken, requirePermission('contract:write'), async(req, res) => {
    try {
        const { ventureId, contractType, data } = req.body;

        // Create PDF document
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([595.28, 841.89]); // A4 size

        // Add contract content (simplified)
        const { width, height } = page.getSize();
        page.drawText(`Contract: ${contractType}`, {
            x: 50,
            y: height - 50,
            size: 20
        });

        page.drawText(`Venture ID: ${ventureId}`, {
            x: 50,
            y: height - 80,
            size: 12
        });

        page.drawText(`Generated on: ${new Date().toLocaleDateString()}`, {
            x: 50,
            y: height - 100,
            size: 12
        });

        // Serialize PDF
        const pdfBytes = await pdfDoc.save();

        // Upload to S3
        const fileName = `contracts/${ventureId}/${contractType}_${Date.now()}.pdf`;
        const uploadParams = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: fileName,
            Body: pdfBytes,
            ContentType: 'application/pdf',
            Metadata: {
                contractType,
                ventureId,
                generatedBy: req.user.id
            }
        };

        const uploadResult = await s3.upload(uploadParams).promise();

        // Save to database
        const contractRecord = await prisma.legalDocument.create({
            data: {
                title: `${contractType} Contract`,
                type: contractType,
                content: uploadResult.Location,
                version: '1.0',
                status: 'DRAFT',
                createdBy: req.user.id,
                projectId: ventureId
            }
        });

        res.json({
            success: true,
            contract: {
                id: contractRecord.id,
                title: contractRecord.title,
                url: uploadResult.Location,
                type: contractType,
                generatedAt: contractRecord.createdAt
            }
        });
    } catch (error) {
        console.error('Contract generation error:', error);
        res.status(500).json({ error: 'Contract generation failed' });
    }
});

// Generate QR code for document verification
app.post('/api/qr/:fileId', authenticateToken, async(req, res) => {
    try {
        const { fileId } = req.params;

        const fileRecord = await prisma.legalDocument.findUnique({
            where: { id: fileId }
        });

        if (!fileRecord) {
            return res.status(404).json({ error: 'File not found' });
        }

        // Generate QR code with file verification data
        const qrData = {
            fileId: fileRecord.id,
            hash: fileRecord.content.split('/').pop(),
            timestamp: fileRecord.createdAt,
            type: fileRecord.type
        };

        const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData));

        res.json({
            success: true,
            qrCode: qrCodeDataUrl,
            data: qrData
        });
    } catch (error) {
        console.error('QR code generation error:', error);
        res.status(500).json({ error: 'QR code generation failed' });
    }
});

// Delete file endpoint
app.delete('/api/files/:fileId', authenticateToken, requirePermission('system:admin'), async(req, res) => {
    try {
        const { fileId } = req.params;

        const fileRecord = await prisma.legalDocument.findUnique({
            where: { id: fileId }
        });

        if (!fileRecord) {
            return res.status(404).json({ error: 'File not found' });
        }

        // Delete from S3
        const key = fileRecord.content.split('/').pop();
        const deleteParams = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: key
        };

        await s3.deleteObject(deleteParams).promise();

        // Delete from database
        await prisma.legalDocument.delete({
            where: { id: fileId }
        });

        res.json({
            success: true,
            message: 'File deleted successfully'
        });
    } catch (error) {
        console.error('File deletion error:', error);
        res.status(500).json({ error: 'File deletion failed' });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Storage service error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
const startServer = async() => {
    try {
        // Test database connection
        await prisma.$connect();
        console.log('✅ Database connected successfully');

        app.listen(PORT, () => {
            console.log(`🚀 File Storage Service running on port ${PORT}`);
            console.log(`📊 Environment: ${process.env.NODE_ENV}`);
            console.log(`🔗 Health check: http://localhost:${PORT}/health`);
        });
    } catch (error) {
        console.error('❌ Failed to start storage service:', error);
        process.exit(1);
    }
};

// Graceful shutdown
process.on('SIGTERM', async() => {
    console.log('🛑 Shutting down storage service gracefully...');
    await prisma.$disconnect();
    process.exit(0);
});

startServer();