const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

// Use production database URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://smartstart_user:smartstart_password@dpg-d0j8v8m3t39s73f8p8hg-a.oregon-postgres.render.com:5432/smartstart_db'
    }
  }
});

async function fixProductionDatabase() {
  try {
    console.log('🔧 Fixing production database...');
    
    // Read the SQL file
    const sql = fs.readFileSync('./fix-production-database.sql', 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        await prisma.$executeRawUnsafe(statement);
      }
    }
    
    console.log('✅ Production database fixed successfully!');
    
    // Test the tables exist
    const kycCount = await prisma.$queryRaw`SELECT COUNT(*) FROM "KycVerification"`;
    const mfaCount = await prisma.$queryRaw`SELECT COUNT(*) FROM "MfaSetup"`;
    
    console.log(`📊 KYC table: ${kycCount[0].count} records`);
    console.log(`📊 MFA table: ${mfaCount[0].count} records`);
    
  } catch (error) {
    console.error('❌ Error fixing production database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixProductionDatabase();
