#!/usr/bin/env python3
"""Final batch update for remaining pages to use Sidebar"""

import re
from pathlib import Path

pages_dir = Path("client/pages")
files = [
    "Resources.tsx", "ISOStudio.tsx",
    "SmartStartVentureBuilding.tsx", "SmartStartArchetypes.tsx",
    "CommunityHub.tsx", "CommunityEvents.tsx", "BeerSecurity.tsx",
    "LaunchLearn.tsx", "Mentorship.tsx",
    "BIAnalytics.tsx", "AutomationAI.tsx", "PrivacyCompliance.tsx",
    "AdvisoryAudits.tsx", "Index2030.tsx", "Unsubscribe.tsx"
]

def update_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if 'import Sidebar' in content or 'import Header' not in content:
            return False, "already updated"
        
        original = content
        
        # 1. Replace Header import
        content = re.sub(
            r'import Header from ["\']@/components/Header["\'];?\n?',
            "import Sidebar from '@/components/Sidebar';\nimport { useSidebar } from '@/contexts/SidebarContext';\n",
            content
        )
        
        # 2. Add useSidebar hook
        if 'const { isCollapsed } = useSidebar()' not in content:
            # Find function declaration
            func_patterns = [
                r'(export default function \w+\([^)]*\) \{)\s*\n',
                r'(const \w+: React\.FC = \(\) => \{)\s*\n',
                r'(export default function \w+\(\) \{)\s*\n',
            ]
            for pattern in func_patterns:
                match = re.search(pattern, content)
                if match:
                    pos = match.end()
                    # Find first meaningful line after function declaration
                    lines = content[pos:pos+300].split('\n')
                    for i, line in enumerate(lines[:15]):
                        stripped = line.strip()
                        if stripped and not stripped.startswith('//') and not stripped.startswith('/*') and not stripped.startswith('*'):
                            insert_pos = pos + sum(len(l) + 1 for l in lines[:i])
                            content = content[:insert_pos] + "  const { isCollapsed } = useSidebar();\n" + content[insert_pos:]
                            break
                    break
        
        # 3. Replace <Header />
        content = content.replace('<Header />', '<Sidebar />')
        
        # 4. Add wrapper div after Sidebar
        if '<Sidebar />' in content and 'md:ml-72' not in content:
            content = re.sub(
                r'(<Sidebar />)\s*\n\s*',
                r'<Sidebar />\n      <div className={`transition-all duration-300 ${isCollapsed ? \'md:ml-20\' : \'md:ml-72\'} md:pt-0 pt-20`}>\n      ',
                content, count=1
            )
        
        # 5. Adjust padding
        content = re.sub(r'\bpt-24\b', 'pt-8', content)
        content = re.sub(r'\bpt-32\b', 'pt-8', content)
        content = re.sub(r'\bpt-20\b', 'pt-8', content)
        
        # 6. Close wrapper before Footer
        if '<Footer />' in content:
            content = re.sub(
                r'(</section>|</div>)\s*\n\s*<Footer />',
                r'\1\n      <Footer />\n      </div>',
                content
            )
        
        if content != original:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True, "updated"
        return False, "no changes"
    except Exception as e:
        return False, f"error: {e}"

updated = 0
for file in files:
    filepath = pages_dir / file
    if filepath.exists():
        success, msg = update_file(filepath)
        if success:
            print(f"✅ {file}")
            updated += 1
        else:
            print(f"⏭️  {file} ({msg})")
    else:
        print(f"❌ {file} (not found)")

print(f"\n✅ Updated {updated} files")

