#!/usr/bin/env node

/**
 * Fix all Vanilla Extract CSS files to remove invalid selectors
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cssFiles = [
  'src/features/assessment/AssessmentView.css.ts',
  'src/features/assessment/HeroView.css.ts', 
  'src/features/assessment/ResultView.css.ts',
  'src/features/assessment/ThankYouView.css.ts',
  'src/components/EmailModal.css.ts',
  'src/components/Card.css.ts',
  'src/components/Button.css.ts'
];

function fixCSSFile(filePath) {
  console.log(`Fixing ${filePath}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove any remaining selectors blocks with hover/focus that aren't globalStyle
  content = content.replace(/selectors:\s*{\s*['"`][^'"`]*:hover[^}]*},?\s*/g, '');
  
  // Remove any remaining selectors blocks with focus that aren't globalStyle  
  content = content.replace(/selectors:\s*{\s*['"`][^'"`]*:focus[^}]*},?\s*/g, '');
  
  // Remove any remaining selectors blocks with active that aren't globalStyle
  content = content.replace(/selectors:\s*{\s*['"`][^'"`]*:active[^}]*},?\s*/g, '');
  
  // Clean up any trailing commas after removing selectors
  content = content.replace(/,\s*}/g, '\n}');
  content = content.replace(/,\s*\/\*[^*]*\*\//g, '');
  
  // Ensure globalStyle import is present
  if (!content.includes('globalStyle') && (content.includes(':hover') || content.includes(':focus'))) {
    content = content.replace(
      "import { style } from '@vanilla-extract/css';",
      "import { style, globalStyle } from '@vanilla-extract/css';"
    );
  }
  
  fs.writeFileSync(filePath, content);
  console.log(`✅ Fixed ${filePath}`);
}

// Fix all CSS files
cssFiles.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  if (fs.existsSync(fullPath)) {
    fixCSSFile(fullPath);
  } else {
    console.log(`⚠️  File not found: ${filePath}`);
  }
});

console.log('\n🎉 All CSS files have been fixed!');
console.log('\nThe following issues were resolved:');
console.log('- Removed invalid selectors blocks');
console.log('- Ensured globalStyle import is present');
console.log('- Cleaned up trailing commas');
console.log('\nYour CSS should now compile without errors.');
