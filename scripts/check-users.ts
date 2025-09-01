import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
  console.log('🔍 Checking users in database...');

  try {
    const users = await prisma.user.findMany({
      include: {
        account: true
      }
    });

    console.log('📊 Found users:');
    users.forEach(user => {
      console.log(`   - ID: ${user.id}`);
      console.log(`   - Email: ${user.email}`);
      console.log(`   - Name: ${user.name}`);
      console.log(`   - Role: ${user.account?.role || 'No account'}`);
      console.log(`   - Level: ${user.level}`);
      console.log('   ---');
    });

    const projects = await prisma.project.findMany({
      include: {
        owner: true
      }
    });

    console.log('📊 Found projects:');
    projects.forEach(project => {
      console.log(`   - ID: ${project.id}`);
      console.log(`   - Name: ${project.name}`);
      console.log(`   - Owner: ${project.owner.email} (${project.ownerId})`);
      console.log('   ---');
    });

  } catch (error) {
    console.error('❌ Error checking users:', error);
  }
}

checkUsers()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
