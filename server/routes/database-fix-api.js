const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// Database fix API - manually create missing tables
router.post('/fix-missing-tables', async (req, res) => {
    try {
        console.log('🔧 Starting database fix - creating missing tables...');
        
        // Create PlatformLegalPack table
        await prisma.$executeRaw`
            CREATE TABLE IF NOT EXISTS "PlatformLegalPack" (
                "id" TEXT NOT NULL,
                "userId" TEXT NOT NULL,
                "status" TEXT NOT NULL DEFAULT 'PENDING',
                "signedAt" TIMESTAMP(3),
                "expiresAt" TIMESTAMP(3),
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL,
                CONSTRAINT "PlatformLegalPack_pkey" PRIMARY KEY ("id")
            )
        `;
        
        // Create PlatformNDA table
        await prisma.$executeRaw`
            CREATE TABLE IF NOT EXISTS "PlatformNDA" (
                "id" TEXT NOT NULL,
                "userId" TEXT NOT NULL,
                "status" TEXT NOT NULL DEFAULT 'PENDING',
                "signedAt" TIMESTAMP(3),
                "expiresAt" TIMESTAMP(3),
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL,
                CONSTRAINT "PlatformNDA_pkey" PRIMARY KEY ("id")
            )
        `;
        
        // Create ESignatureConsent table
        await prisma.$executeRaw`
            CREATE TABLE IF NOT EXISTS "ESignatureConsent" (
                "id" TEXT NOT NULL,
                "userId" TEXT NOT NULL,
                "consentType" TEXT NOT NULL,
                "status" TEXT NOT NULL DEFAULT 'PENDING',
                "signedAt" TIMESTAMP(3),
                "ipAddress" TEXT,
                "userAgent" TEXT,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL,
                CONSTRAINT "ESignatureConsent_pkey" PRIMARY KEY ("id")
            )
        `;
        
        // Create indexes
        await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "PlatformLegalPack_userId_idx" ON "PlatformLegalPack"("userId")`;
        await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "PlatformLegalPack_status_idx" ON "PlatformLegalPack"("status")`;
        await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "PlatformNDA_userId_idx" ON "PlatformNDA"("userId")`;
        await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "PlatformNDA_status_idx" ON "PlatformNDA"("status")`;
        await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "ESignatureConsent_userId_idx" ON "ESignatureConsent"("userId")`;
        await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "ESignatureConsent_consentType_idx" ON "ESignatureConsent"("consentType")`;
        await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "ESignatureConsent_status_idx" ON "ESignatureConsent"("status")`;
        
        console.log('✅ Database fix completed successfully!');
        
        res.json({
            success: true,
            message: 'Database fix completed successfully',
            tablesCreated: ['PlatformLegalPack', 'PlatformNDA', 'ESignatureConsent'],
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Database fix failed:', error);
        res.status(500).json({
            success: false,
            message: 'Database fix failed',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Test if tables exist
router.get('/test-tables', async (req, res) => {
    try {
        const tables = await prisma.$queryRaw`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('PlatformLegalPack', 'PlatformNDA', 'ESignatureConsent')
        `;
        
        res.json({
            success: true,
            tables: tables,
            count: tables.length,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Table test failed:', error);
        res.status(500).json({
            success: false,
            message: 'Table test failed',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;
