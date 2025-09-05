const express = require('express');
const router = express.Router();

// Debug endpoint to check database connection
router.get('/database-info', async(req, res) => {
    try {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();

        // Check if KYC table exists
        const kycTables = await prisma.$queryRaw `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%Kyc%'
    `;

        // Check if MFA table exists
        const mfaTables = await prisma.$queryRaw `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%Mfa%'
    `;

        res.json({
            success: true,
            databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
            kycTables: kycTables,
            mfaTables: mfaTables,
            timestamp: new Date().toISOString()
        });

        await prisma.$disconnect();
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set'
        });
    }
});

// Database setup endpoint
router.post('/setup-database', async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    console.log('🔧 Setting up production database tables...');
    
    // Create enums first
    await prisma.$executeRaw`CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED')`;
    await prisma.$executeRaw`CREATE TYPE "DocumentType" AS ENUM ('GOVERNMENT_ID', 'PROOF_OF_ADDRESS')`;
    await prisma.$executeRaw`CREATE TYPE "MfaMethod" AS ENUM ('AUTHENTICATOR', 'EMAIL', 'SMS')`;
    
    // Create KycVerification table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "KycVerification" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "fullName" TEXT NOT NULL,
        "dateOfBirth" TIMESTAMP(3) NOT NULL,
        "country" TEXT NOT NULL,
        "phoneNumber" TEXT NOT NULL,
        "governmentIdStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
        "proofOfAddressStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
        "overallStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
        "verifiedBy" TEXT,
        "verifiedAt" TIMESTAMP(3),
        "rejectionReason" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "KycVerification_pkey" PRIMARY KEY ("id")
      )
    `;
    
    // Create KycDocument table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "KycDocument" (
        "id" TEXT NOT NULL,
        "kycId" TEXT NOT NULL,
        "documentType" "DocumentType" NOT NULL,
        "fileName" TEXT NOT NULL,
        "filePath" TEXT NOT NULL,
        "fileHash" TEXT NOT NULL,
        "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
        "reviewedBy" TEXT,
        "reviewedAt" TIMESTAMP(3),
        "rejectionReason" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "KycDocument_pkey" PRIMARY KEY ("id")
      )
    `;
    
    // Create MfaSetup table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "MfaSetup" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "method" "MfaMethod" NOT NULL,
        "secret" TEXT,
        "backupCodes" TEXT[],
        "isActive" BOOLEAN NOT NULL DEFAULT false,
        "lastUsed" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "MfaSetup_pkey" PRIMARY KEY ("id")
      )
    `;
    
    // Add foreign key constraints
    await prisma.$executeRaw`ALTER TABLE "KycVerification" ADD CONSTRAINT "KycVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE`;
    await prisma.$executeRaw`ALTER TABLE "KycDocument" ADD CONSTRAINT "KycDocument_kycId_fkey" FOREIGN KEY ("kycId") REFERENCES "KycVerification"("id") ON DELETE CASCADE ON UPDATE CASCADE`;
    await prisma.$executeRaw`ALTER TABLE "MfaSetup" ADD CONSTRAINT "MfaSetup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE`;
    
    // Create indexes
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "KycVerification_userId_idx" ON "KycVerification"("userId")`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "KycDocument_kycId_idx" ON "KycDocument"("kycId")`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "MfaSetup_userId_idx" ON "MfaSetup"("userId")`;
    
    // Test the tables exist
    const kycCount = await prisma.$queryRaw`SELECT COUNT(*) FROM "KycVerification"`;
    const mfaCount = await prisma.$queryRaw`SELECT COUNT(*) FROM "MfaSetup"`;
    
    res.json({
      success: true,
      message: 'Database tables created successfully',
      kycTable: Number(kycCount[0].count),
      mfaTable: Number(mfaCount[0].count),
      timestamp: new Date().toISOString()
    });
    
    await prisma.$disconnect();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;