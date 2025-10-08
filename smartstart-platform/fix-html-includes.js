#!/usr/bin/env node

/**
 * Automatically fix all HTML files to include correct footer and header
 */

const fs = require('fs').promises;
const path = require('path');

const WEBSITE_DIR = path.join(__dirname, 'website');

async function findAllHtmlFiles(dir, relativePath = '') {
    const files = [];
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relPath = path.join(relativePath, entry.name);

        if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== 'includes') {
            const subFiles = await findAllHtmlFiles(fullPath, relPath);
            files.push(...subFiles);
        } else if (entry.isFile() && entry.name.endsWith('.html') && entry.name !== 'footer.html' && entry.name !== 'navbar.html') {
            files.push({ path: fullPath, relativePath: relPath });
        }
    }

    return files;
}

function getCorrectFooterCssPath(relativePath) {
    const depth = relativePath.split(path.sep).length - 1;
    return '../'.repeat(depth) + 'assets/css/footer-lean.css';
}

function getCorrectScriptPath(relativePath, scriptName) {
    const depth = relativePath.split(path.sep).length - 1;
    return '../'.repeat(depth) + `assets/js/${scriptName}`;
}

async function fixHtmlFile(filePath, relativePath) {
    let content = await fs.readFile(filePath, 'utf8');
    let modified = false;
    const changes = [];

    const footerCssPath = getCorrectFooterCssPath(relativePath);
    const scriptPath = getCorrectScriptPath(relativePath, 'script.js');

    // Fix 1: Add footer-lean.css if missing
    if (!content.includes('footer-lean.css')) {
        // Find the </head> tag and add before it
        const headCloseIndex = content.lastIndexOf('</head>');
        if (headCloseIndex !== -1) {
            const footerCssLink = `    <link rel="stylesheet" href="${footerCssPath}">\n`;
            content = content.slice(0, headCloseIndex) + footerCssLink + content.slice(headCloseIndex);
            modified = true;
            changes.push('✅ Added footer-lean.css');
        }
    }

    // Fix 2: Ensure script.js is loaded
    if (!content.includes('script.js')) {
        // Add before </body>
        const bodyCloseIndex = content.lastIndexOf('</body>');
        if (bodyCloseIndex !== -1) {
            const scriptTag = `    <script src="${scriptPath}"></script>\n`;
            content = content.slice(0, bodyCloseIndex) + scriptTag + content.slice(bodyCloseIndex);
            modified = true;
            changes.push('✅ Added script.js');
        }
    }

    // Fix 3: Add loadNavbar() and loadFooter() calls if missing
    if (!content.includes('loadNavbar()') || !content.includes('loadFooter()')) {
        // Find existing script tag or add one
        const scriptMatch = content.match(/<script>[\s\S]*?document\.addEventListener\('DOMContentLoaded'[\s\S]*?<\/script>/);

        if (scriptMatch) {
            // Add to existing DOMContentLoaded
            let scriptContent = scriptMatch[0];
            if (!scriptContent.includes('loadNavbar()')) {
                scriptContent = scriptContent.replace(
                    /document\.addEventListener\('DOMContentLoaded',\s*\(\)\s*=>\s*{/,
                    "document.addEventListener('DOMContentLoaded', () => {\n        loadNavbar();"
                );
                changes.push('✅ Added loadNavbar() to existing script');
            }
            if (!scriptContent.includes('loadFooter()')) {
                scriptContent = scriptContent.replace(
                    /document\.addEventListener\('DOMContentLoaded',\s*\(\)\s*=>\s*{/,
                    "document.addEventListener('DOMContentLoaded', () => {\n        loadFooter();"
                );
                changes.push('✅ Added loadFooter() to existing script');
            }
            content = content.replace(scriptMatch[0], scriptContent);
            modified = true;
        } else {
            // Add new script block before </body>
            const bodyCloseIndex = content.lastIndexOf('</body>');
            if (bodyCloseIndex !== -1) {
                const newScript = `
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            loadNavbar();
            loadFooter();
        });
    </script>
`;
                content = content.slice(0, bodyCloseIndex) + newScript + content.slice(bodyCloseIndex);
                modified = true;
                changes.push('✅ Added loadNavbar() and loadFooter() script');
            }
        }
    }

    if (modified) {
        await fs.writeFile(filePath, content, 'utf8');
    }

    return {
        path: relativePath,
        modified,
        changes
    };
}

async function main() {
    console.log('🔧 Fixing all HTML files with correct footer and header includes...\n');

    const htmlFiles = await findAllHtmlFiles(WEBSITE_DIR);
    console.log(`Found ${htmlFiles.length} HTML files to fix\n`);

    let fixedCount = 0;
    const results = [];

    for (const file of htmlFiles) {
        const result = await fixHtmlFile(file.path, file.relativePath);
        results.push(result);

        if (result.modified) {
            fixedCount++;
            console.log(`📄 ${result.path}`);
            result.changes.forEach(change => console.log(`   ${change}`));
            console.log();
        }
    }

    console.log('═══════════════════════════════════════════════════');
    console.log('📊 FIX SUMMARY');
    console.log('═══════════════════════════════════════════════════');
    console.log(`✅ Files fixed: ${fixedCount}`);
    console.log(`📁 Total files: ${htmlFiles.length}`);
    console.log('\n🎉 All HTML files have been updated with correct footer and header includes!');
}

main().catch(error => {
    console.error('Fix error:', error);
    process.exit(1);
});