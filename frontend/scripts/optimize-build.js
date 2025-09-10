#!/usr/bin/env node

/**
 * Build optimization script for Render deployment
 * This script optimizes the build process for faster deployments
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Optimizing build for Render deployment...');

// 1. Clean unnecessary files before build
const cleanFiles = [
  '.next/cache',
  'node_modules/.cache',
  '.eslintcache',
  'coverage',
  '.nyc_output'
];

cleanFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    fs.rmSync(filePath, { recursive: true, force: true });
    console.log(`✅ Cleaned ${file}`);
  }
});

// 2. Create optimized package.json for production
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Remove dev dependencies from production build
const productionDeps = { ...packageJson.dependencies };
const productionPackageJson = {
  ...packageJson,
  dependencies: productionDeps,
  devDependencies: {},
  scripts: {
    start: 'next start',
    build: 'next build'
  }
};

// Write optimized package.json
fs.writeFileSync(
  path.join(__dirname, '..', 'package.prod.json'),
  JSON.stringify(productionPackageJson, null, 2)
);

console.log('✅ Created optimized package.json for production');

// 3. Set environment variables for build optimization
process.env.NODE_ENV = 'production';
process.env.NEXT_TELEMETRY_DISABLED = '1';
process.env.NEXT_PRIVATE_STANDALONE = 'true';

console.log('✅ Set build optimization environment variables');

console.log('🎉 Build optimization complete!');
