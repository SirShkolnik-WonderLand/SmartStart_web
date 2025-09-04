const { execSync } = require('child_process');

console.log('🚀 Setting up SmartStart Database...');

try {
  // Generate Prisma client
  console.log('📦 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // Push database schema
  console.log('🗄️  Pushing database schema...');
  execSync('npx prisma db push', { stdio: 'inherit' });
  
  // Seed database
  console.log('🌱 Seeding database...');
  execSync('node prisma/seed.js', { stdio: 'inherit' });
  
  console.log('✅ Database setup completed successfully!');
  console.log('💡 You can now use Prisma Studio with: npx prisma studio');
  
} catch (error) {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
}
