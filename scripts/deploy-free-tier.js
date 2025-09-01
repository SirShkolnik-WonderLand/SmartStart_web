#!/usr/bin/env node

/**
 * SmartStart Platform - Free Tier Deployment Helper
 * This script helps verify your setup before deploying to Render.com
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 SmartStart Platform - Free Tier Deployment Check\n');

// Check if render.yaml exists
const renderYamlPath = path.join(process.cwd(), 'render.yaml');
if (!fs.existsSync(renderYamlPath)) {
    console.error('❌ render.yaml not found! Please ensure you have the deployment configuration.');
    process.exit(1);
}

// Check if consolidated server exists
const consolidatedServerPath = path.join(process.cwd(), 'server', 'consolidated-server.js');
if (!fs.existsSync(consolidatedServerPath)) {
    console.error('❌ Consolidated server not found! Please ensure server/consolidated-server.js exists.');
    process.exit(1);
}

// Check package.json scripts
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (!fs.existsSync(packageJsonPath)) {
    console.error('❌ package.json not found!');
    process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Verify required scripts
const requiredScripts = ['start:api', 'build', 'start'];
const missingScripts = requiredScripts.filter(script => !packageJson.scripts[script]);

if (missingScripts.length > 0) {
    console.error(`❌ Missing required scripts: ${missingScripts.join(', ')}`);
    process.exit(1);
}

// Check dependencies
const requiredDeps = [
    'express', 'cors', 'helmet', 'compression', 'node-cron',
    '@prisma/client', 'jsonwebtoken', 'bcryptjs', 'multer',
    'aws-sdk', 'nodemailer', 'winston', 'bull', 'redis'
];

const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);

if (missingDeps.length > 0) {
    console.error(`❌ Missing required dependencies: ${missingDeps.join(', ')}`);
    console.log('💡 Run: npm install');
    process.exit(1);
}

console.log('✅ All required files and dependencies found!\n');

// Display deployment summary
console.log('📋 Free Tier Deployment Summary:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🗄️  Database Service: smartstart-db (Free)');
console.log('🔌 API Service: smartstart-api (Free)');
console.log('🌐 Web Service: smartstart-platform (Free)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('📝 Next Steps:');
console.log('1. Commit and push your changes to GitHub');
console.log('2. Go to render.com and create a new PostgreSQL database');
console.log('3. Create the API service (smartstart-api)');
console.log('4. Create the web service (smartstart-platform)');
console.log('5. Set environment variables in each service');
console.log('6. Deploy and test!\n');

console.log('📚 For detailed instructions, see: DEPLOYMENT_QUICK_START.md');
console.log('🔧 For troubleshooting, see the troubleshooting section in the guide\n');

// Check for common issues
console.log('🔍 Checking for common issues...\n');

// Check if .env.local exists for local development
const envLocalPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envLocalPath)) {
    console.log('⚠️  .env.local not found - create this for local development');
    console.log('   Copy env.example to .env.local and fill in your values\n');
}

// Check if .gitignore includes .env files
const gitignorePath = path.join(process.cwd(), '.gitignore');
if (fs.existsSync(gitignorePath)) {
    const gitignore = fs.readFileSync(gitignorePath, 'utf8');
    if (!gitignore.includes('.env')) {
        console.log('⚠️  .gitignore should include .env files for security');
        console.log('   Add ".env*" to your .gitignore file\n');
    }
}

// Check Prisma setup
const prismaPath = path.join(process.cwd(), 'prisma');
if (!fs.existsSync(prismaPath)) {
    console.log('⚠️  Prisma directory not found - ensure Prisma is properly configured');
} else {
    const schemaPath = path.join(prismaPath, 'schema.prisma');
    if (fs.existsSync(schemaPath)) {
        console.log('✅ Prisma schema found');
    } else {
        console.log('⚠️  Prisma schema not found');
    }
}

console.log('\n🎯 Your project is ready for free tier deployment!');
console.log('   Follow the steps above and you\'ll be live on Render.com in no time.\n');

console.log('💡 Pro Tips for Free Tier:');
console.log('   • Services will sleep after 15 minutes of inactivity');
console.log('   • First request after sleep will be slower (cold start)');
console.log('   • Monitor memory usage (stay under 512MB)');
console.log('   • Use health checks to monitor service status\n');

console.log('🚀 Happy deploying!');