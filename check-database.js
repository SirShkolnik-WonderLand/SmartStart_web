const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('🔍 Checking database...\n');
    
    // Check if test user exists
    const user = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    });
    
    if (!user) {
      console.log('❌ Test user not found');
      return;
    }
    
    console.log('✅ Test user found:');
    console.log('   ID:', user.id);
    console.log('   Email:', user.email);
    console.log('   Name:', user.name);
    console.log('   Status:', user.status);
    console.log('   Level:', user.level);
    console.log('');
    
    // Check ventures for this user
    const ventures = await prisma.venture.findMany({
      where: { ownerUserId: user.id },
      include: { ventureProfile: true }
    });
    
    console.log('📊 Ventures for test user:', ventures.length);
    ventures.forEach(v => {
      console.log('   -', v.id, v.name, v.status);
    });
    console.log('');
    
    // Check all ventures
    const allVentures = await prisma.venture.findMany({
      include: { ventureProfile: true }
    });
    
    console.log('📊 Total ventures in database:', allVentures.length);
    allVentures.forEach(v => {
      console.log('   -', v.id, v.name, 'Owner:', v.ownerUserId, 'Status:', v.status);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
