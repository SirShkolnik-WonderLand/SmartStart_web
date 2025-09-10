#!/usr/bin/env node

/**
 * Script to fix process.env usage in components
 */

const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'src/components/legal/StateMachineVisualization.tsx',
  'src/components/state-machines/StateMachineDashboard.tsx',
  'src/components/umbrella/UmbrellaDashboard.tsx',
  'src/lib/api-comprehensive.ts',
  'src/lib/api.ts',
  'src/lib/legal-documents-api.ts',
  'src/lib/legal-framework.ts'
];

const processEnvPattern = /process\.env\.NODE_ENV === 'production'\s*\?\s*process\.env\.NEXT_PUBLIC_API_URL\s*\|\|\s*'[^']*'\s*:\s*'[^']*'/g;
const replacement = 'getApiBaseUrl()';

filesToUpdate.forEach(filePath => {
  const fullPath = path.join(__dirname, '..', filePath);
  
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Check if file already has the import
    if (!content.includes("import { getApiBaseUrl }")) {
      // Add import at the top
      content = content.replace(
        /import.*from.*['"]react['"];?\n/,
        (match) => match + "import { getApiBaseUrl } from '@/lib/env';\n"
      );
      
      // If no react import, add it after the first import
      if (!content.includes("import { getApiBaseUrl }")) {
        const firstImportMatch = content.match(/import.*from.*['"][^'"]*['"];?\n/);
        if (firstImportMatch) {
          content = content.replace(
            firstImportMatch[0],
            firstImportMatch[0] + "import { getApiBaseUrl } from '@/lib/env';\n"
          );
        }
      }
    }
    
    // Replace process.env usage
    content = content.replace(processEnvPattern, replacement);
    
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Updated ${filePath}`);
  } else {
    console.log(`⚠️ File not found: ${filePath}`);
  }
});

console.log('🎉 Process.env fixes complete!');
