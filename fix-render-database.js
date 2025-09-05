const { PrismaClient } = require('@prisma/client');

// This should use the DATABASE_URL from Render's environment
const prisma = new PrismaClient();

async function fixRenderDatabase() {
  try {
    console.log('🔧 Fixing Render production database...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    
    // Create enums first
    console.log('Creating VerificationStatus enum...');
    await prisma.$executeRaw`CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED')`;
    
    console.log('Creating DocumentType enum...');
    await prisma.$executeRaw`CREATE TYPE "DocumentType" AS ENUM ('GOVERNMENT_ID', 'PROOF_OF_ADDRESS')`;
    
    console.log('Creating MfaMethod enum...');
    await prisma.$executeRaw`CREATE TYPE "MfaMethod" AS ENUM ('AUTHENTICATOR', 'EMAIL', 'SMS')`;
    
    // Create KycVerification table
    console.log('Creating KycVerification table...');
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
    console.log('Creating KycDocument table...');
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
    console.log('Creating MfaSetup table...');
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
    console.log('Adding foreign key constraints...');
    await prisma.$executeRaw`ALTER TABLE "KycVerification" ADD CONSTRAINT "KycVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE`;
    await prisma.$executeRaw`ALTER TABLE "KycDocument" ADD CONSTRAINT "KycDocument_kycId_fkey" FOREIGN KEY ("kycId") REFERENCES "KycVerification"("id") ON DELETE CASCADE ON UPDATE CASCADE`;
    await prisma.$executeRaw`ALTER TABLE "MfaSetup" ADD CONSTRAINT "MfaSetup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE`;
    
    // Create indexes
    console.log('Creating indexes...');
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "KycVerification_userId_idx" ON "KycVerification"("userId")`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "KycDocument_kycId_idx" ON "KycDocument"("kycId")`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "MfaSetup_userId_idx" ON "MfaSetup"("userId")`;
    
    console.log('✅ Render production database fixed successfully!');
    
    // Test the tables exist
    const kycCount = await prisma.$queryRaw`SELECT COUNT(*) FROM "KycVerification"`;
    const mfaCount = await prisma.$queryRaw`SELECT COUNT(*) FROM "MfaSetup"`;
    
    console.log(`📊 KYC table: ${kycCount[0].count} records`);
    console.log(`📊 MFA table: ${mfaCount[0].count} records`);
    
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('⚠️ Some objects already exist, continuing...');
    } else {
      console.error('❌ Error fixing Render database:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

fixRenderDatabase();
