/**
 * DEBUG STORAGE PATHS
 * Check where data files should be and if they exist
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check multiple possible paths
const possiblePaths = [
  path.join(__dirname, '../server/data/analytics'),
  path.join(__dirname, '../data/analytics'),
  path.join(process.cwd(), 'server/data/analytics'),
  path.join(process.cwd(), 'data/analytics'),
  path.join(__dirname, '../../server/data/analytics'),
  path.join(__dirname, '../../data/analytics'),
];

console.log('🔍 Checking Storage Paths...\n');
console.log(`Current working directory: ${process.cwd()}`);
console.log(`Script location: ${__dirname}\n`);

possiblePaths.forEach((dataPath, idx) => {
  const leadsFile = path.join(dataPath, 'leads.json');
  const summariesFile = path.join(dataPath, 'daily-summaries.json');
  
  console.log(`Path ${idx + 1}: ${dataPath}`);
  console.log(`  Exists: ${fs.existsSync(dataPath) ? '✅' : '❌'}`);
  console.log(`  Leads file: ${fs.existsSync(leadsFile) ? '✅' : '❌'}`);
  if (fs.existsSync(leadsFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(leadsFile, 'utf-8'));
      console.log(`    Contains: ${Array.isArray(data) ? data.length : 'N/A'} leads`);
    } catch (e) {
      console.log(`    Error reading: ${e}`);
    }
  }
  console.log(`  Summaries file: ${fs.existsSync(summariesFile) ? '✅' : '❌'}`);
  if (fs.existsSync(summariesFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(summariesFile, 'utf-8'));
      console.log(`    Contains: ${Array.isArray(data) ? data.length : 'N/A'} summaries`);
    } catch (e) {
      console.log(`    Error reading: ${e}`);
    }
  }
  console.log('');
});

// Also check what the actual storage service thinks
console.log('\n📂 Checking actual storage service paths...');
try {
  const storagePath = path.join(__dirname, '../server/services/analyticsStorage.ts');
  const storageCode = fs.readFileSync(storagePath, 'utf-8');
  const match = storageCode.match(/path\.join\(__dirname, ['"]([^'"]+)['"]\)/);
  if (match) {
    const relativePath = match[1];
    const resolvedPath = path.resolve(path.dirname(storagePath), relativePath);
    console.log(`Service expects: ${resolvedPath}`);
    console.log(`  Exists: ${fs.existsSync(resolvedPath) ? '✅' : '❌'}`);
  }
} catch (e) {
  console.log(`Error: ${e}`);
}

