const { PrismaClient } = require('@prisma/client');

async function checkDatabaseConnection() {
  console.log('🔍 Checking database connection...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
  
  const prisma = new PrismaClient();
  
  try {
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Check if KYC table exists
    const kycTables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%Kyc%'
    `;
    console.log('📊 KYC tables found:', kycTables);
    
    // Check if MFA table exists
    const mfaTables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%Mfa%'
    `;
    console.log('📊 MFA tables found:', mfaTables);
    
    // Check all tables
    const allTables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    console.log('📊 All tables:', allTables.map(t => t.table_name));
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseConnection();
