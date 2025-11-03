#!/usr/bin/env tsx
/**
 * Script to update all pages from Header to Sidebar
 * This ensures all pages use the same sidebar menu and settings
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import path from 'path';

const pagesDir = path.join(__dirname, '../client/pages');
const pages = glob.sync('**/*.tsx', { cwd: pagesDir });

console.log(`Found ${pages.length} pages to update`);

pages.forEach((pageFile) => {
  const filePath = path.join(pagesDir, pageFile);
  let content = readFileSync(filePath, 'utf-8');
  let modified = false;

  // Skip if already updated
  if (content.includes('import Sidebar') || !content.includes('import Header')) {
    console.log(`⏭️  Skipping ${pageFile} (already updated or no Header)`);
    return;
  }

  // 1. Replace Header import with Sidebar
  if (content.includes("import Header from")) {
    content = content.replace(
      /import Header from ["']@\/components\/Header["'];?\n?/g,
      "import Sidebar from '@/components/Sidebar';\nimport { useSidebar } from '@/contexts/SidebarContext';\n"
    );
    modified = true;
  }

  // 2. Add useSidebar hook after function declaration
  const functionMatch = content.match(/(export default function \w+\([^)]*\) \{)/);
  if (functionMatch && !content.includes('const { isCollapsed } = useSidebar()')) {
    const insertPos = functionMatch.index! + functionMatch[0].length;
    const afterFunction = content.substring(insertPos);
    const firstLineBreak = afterFunction.indexOf('\n');
    const insertAfter = insertPos + firstLineBreak + 1;
    
    content = content.slice(0, insertAfter) + 
              "  const { isCollapsed } = useSidebar();\n" + 
              content.slice(insertAfter);
    modified = true;
  }

  // 3. Replace <Header /> with <Sidebar />
  if (content.includes('<Header />')) {
    content = content.replace(/<Header \/>/g, '<Sidebar />');
    modified = true;
  }

  // 4. Add wrapper div after Sidebar
  if (content.includes('<Sidebar />') && !content.includes('md:ml-72')) {
    content = content.replace(
      /(<Sidebar \/>)\s*\n\s*(<section|<div|<Hero)/g,
      '$1\n      <div className={`transition-all duration-300 ${isCollapsed ? \'md:ml-20\' : \'md:ml-72\'} md:pt-0 pt-20`}>\n      $2'
    );
    modified = true;
  }

  // 5. Adjust top padding (pt-24, pt-32, pt-20 -> pt-8)
  content = content.replace(/pt-24|pt-32|pt-20/g, (match) => {
    // Only replace if it's in a section/div that's not the wrapper
    return 'pt-8';
  });

  // 6. Close wrapper div before Footer
  if (content.includes('<Footer />') && !content.match(/<\/div>\s*<Footer/)) {
    content = content.replace(
      /(<\/section>|<\/div>)\s*\n\s*<Footer \/>/g,
      '$1\n      <Footer />\n      </div>'
    );
    modified = true;
  }

  if (modified) {
    writeFileSync(filePath, content, 'utf-8');
    console.log(`✅ Updated ${pageFile}`);
  } else {
    console.log(`⏭️  No changes needed for ${pageFile}`);
  }
});

console.log('\n✅ All pages updated!');

