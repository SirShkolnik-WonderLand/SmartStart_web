const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, '../client/pages');

const files = [
  'AdvisoryAudits.tsx',
  'AutomationAI.tsx',
  'BIAnalytics.tsx',
  'BeerSecurity.tsx',
  'CISOasService.tsx',
  'Community.tsx',
  'CommunityEvents.tsx',
  'CommunityHub.tsx',
  'DataDeletionRequest.tsx',
  'ISO27001.tsx',
  'ISOStudio.tsx',
  'Index2030.tsx',
  'LaunchLearn.tsx',
  'Mentorship.tsx',
  'PrivacyCompliance.tsx',
  'Resources.tsx',
  'SmartStartArchetypes.tsx',
  'SmartStartEnterpriseTools.tsx',
  'SmartStartHub.tsx',
  'SmartStartMembership.tsx',
  'SmartStartPlatform.tsx',
  'SmartStartVentureBuilding.tsx',
  'Unsubscribe.tsx',
  'community/Architect.tsx',
  'community/Builder.tsx',
  'community/Connector.tsx',
  'community/Dreamer.tsx',
  'legal/PrivacyPolicy.tsx',
  'legal/TermsOfService.tsx',
  'legal/CookiePolicy.tsx',
  'legal/Accessibility.tsx',
];

function updateFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⏭️  Skipping ${filePath} (not found)`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Skip if already updated
  if (content.includes('import Sidebar') || !content.includes('import Header')) {
    console.log(`⏭️  Skipping ${filePath} (already updated or no Header)`);
    return false;
  }

  const original = content;

  // 1. Replace Header import
  content = content.replace(
    /import Header from ["']@\/components\/Header["'];?\n?/g,
    "import Sidebar from '@/components/Sidebar';\nimport { useSidebar } from '@/contexts/SidebarContext';\n"
  );

  // 2. Add useSidebar hook after function declaration
  const functionMatch = content.match(/(export default function \w+|const \w+: React\.FC = \(\)|export default function \w+\([^)]*\))/);
  if (functionMatch && !content.includes('const { isCollapsed } = useSidebar()')) {
    const insertPos = functionMatch.index + functionMatch[0].length;
    const afterFunction = content.substring(insertPos);
    const firstBrace = afterFunction.indexOf('{');
    const firstLineBreak = afterFunction.indexOf('\n', firstBrace);
    const insertAfter = insertPos + firstLineBreak + 1;
    
    content = content.slice(0, insertAfter) + 
              "  const { isCollapsed } = useSidebar();\n" + 
              content.slice(insertAfter);
  }

  // 3. Replace <Header />
  content = content.replace(/<Header \/>/g, '<Sidebar />');

  // 4. Add wrapper div after Sidebar
  if (content.includes('<Sidebar />') && !content.includes('md:ml-72')) {
    content = content.replace(
      /(<Sidebar \/>)\s*\n\s*(<section|{?\/\*|<!--|<\/)/m,
      (match, p1, p2) => {
        return `${p1}\n      <div className={\`transition-all duration-300 \${isCollapsed ? 'md:ml-20' : 'md:ml-72'} md:pt-0 pt-20\`}>\n      ${p2}`;
      }
    );
  }

  // 5. Adjust padding
  content = content.replace(/\bpt-24\b/g, 'pt-8');
  content = content.replace(/\bpt-32\b/g, 'pt-8');
  content = content.replace(/\bpt-20\b/g, 'pt-8');

  // 6. Close wrapper div before Footer
  if (content.includes('<Footer />') && !content.match(/<\/div>\s*\n\s*<Footer/)) {
    content = content.replace(
      /(<\/section>|<\/div>)\s*\n\s*<Footer \/>/,
      '$1\n      <Footer />\n      </div>'
    );
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated ${filePath}`);
    return true;
  }

  return false;
}

let updated = 0;
let skipped = 0;

files.forEach(file => {
  const filePath = path.join(pagesDir, file);
  if (updateFile(filePath)) {
    updated++;
  } else {
    skipped++;
  }
});

console.log(`\n✅ Updated: ${updated} files`);
console.log(`⏭️  Skipped: ${skipped} files`);

