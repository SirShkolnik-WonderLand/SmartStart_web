#!/usr/bin/env node

/**
 * Comprehensive fix for ALL headers and footers
 * - Replace hardcoded headers with <div id="header"></div>
 * - Replace hardcoded footers with <div id="footer"></div>
 * - Remove old manual fetch() scripts
 * - Ensure loadNavbar() and loadFooter() are called
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

async function fixHtmlFile(filePath, relativePath) {
    let content = await fs.readFile(filePath, 'utf8');
    let modified = false;
    const changes = [];
    
    // Fix 1: Replace hardcoded header with dynamic div
    const headerPattern = /<header class="global-header"[^>]*>[\s\S]*?<\/header>/;
    if (headerPattern.test(content)) {
        content = content.replace(headerPattern, '<!-- Header -->\n    <div id="header"></div>');
        modified = true;
        changes.push('✅ Replaced hardcoded header with dynamic loading');
    }
    
    // Fix 2: Replace hardcoded footer with dynamic div
    const footerPattern = /<footer class="global-footer"[^>]*>[\s\S]*?<\/footer>/;
    if (footerPattern.test(content)) {
        content = content.replace(footerPattern, '<!-- Footer -->\n    <div id="footer"></div>');
        modified = true;
        changes.push('✅ Replaced hardcoded footer with dynamic loading');
    }
    
    // Fix 3: Replace old footer-container divs
    if (content.includes('id="footer-container"')) {
        content = content.replace(/<!-- Include shared footer -->\s*<div id="footer-container"><\/div>/g, '<!-- Footer -->\n    <div id="footer"></div>');
        content = content.replace(/<div id="footer-container"><\/div>/g, '<div id="footer"></div>');
        modified = true;
        changes.push('✅ Updated footer-container to footer');
    }
    
    // Fix 4: Replace old navbar-container divs (but keep inside header if present)
    if (content.includes('id="navbar-container"') && !content.includes('id="header"')) {
        content = content.replace(/<div id="navbar-container"><\/div>/g, '');
        modified = true;
        changes.push('✅ Removed old navbar-container');
    }
    
    // Fix 5: Remove old manual fetch scripts for navbar
    const navbarFetchPattern = /<!-- Load shared navigation -->[\s\S]*?<script>[\s\S]*?fetch\('includes\/navbar\.html'\)[\s\S]*?<\/script>/;
    if (navbarFetchPattern.test(content)) {
        content = content.replace(navbarFetchPattern, '');
        modified = true;
        changes.push('✅ Removed old navbar fetch script');
    }
    
    // Fix 6: Remove old manual fetch scripts for footer
    const footerFetchPattern = /<!-- Load shared footer -->[\s\S]*?<script>[\s\S]*?fetch\('includes\/footer\.html'\)[\s\S]*?<\/script>/;
    if (footerFetchPattern.test(content)) {
        content = content.replace(footerFetchPattern, '');
        modified = true;
        changes.push('✅ Removed old footer fetch script');
    }
    
    // Fix 7: Ensure loadNavbar() and loadFooter() are in DOMContentLoaded
    if (!content.includes('loadNavbar()') || !content.includes('loadFooter()')) {
        // Check if there's already a DOMContentLoaded listener
        const domLoadPattern = /document\.addEventListener\('DOMContentLoaded',\s*function\(\)\s*{/;
        
        if (domLoadPattern.test(content)) {
            // Add to existing listener
            if (!content.includes('loadNavbar()')) {
                content = content.replace(
                    domLoadPattern,
                    "document.addEventListener('DOMContentLoaded', function() {\n            loadNavbar();"
                );
                changes.push('✅ Added loadNavbar() to existing script');
            }
            if (!content.includes('loadFooter()')) {
                content = content.replace(
                    domLoadPattern,
                    "document.addEventListener('DOMContentLoaded', function() {\n            loadFooter();"
                );
                changes.push('✅ Added loadFooter() to existing script');
            }
            modified = true;
        } else {
            // Add new script block before </body>
            const bodyCloseIndex = content.lastIndexOf('</body>');
            if (bodyCloseIndex !== -1) {
                const scriptPath = '../'.repeat(relativePath.split(path.sep).length - 1) + 'assets/js/script.js';
                const newScript = `
    <script src="${scriptPath}"></script>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
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
    console.log('🔧 COMPREHENSIVE FIX: All Headers and Footers\n');
    console.log('This will:');
    console.log('  • Replace hardcoded headers with dynamic loading');
    console.log('  • Replace hardcoded footers with dynamic loading');
    console.log('  • Remove old manual fetch() scripts');
    console.log('  • Ensure loadNavbar() and loadFooter() are called\n');
    
    const htmlFiles = await findAllHtmlFiles(WEBSITE_DIR);
    console.log(`Found ${htmlFiles.length} HTML files to process\n`);
    
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
    console.log('📊 COMPREHENSIVE FIX SUMMARY');
    console.log('═══════════════════════════════════════════════════');
    console.log(`✅ Files fixed: ${fixedCount}`);
    console.log(`📁 Total files: ${htmlFiles.length}`);
    console.log(`📈 Fix rate: ${((fixedCount/htmlFiles.length)*100).toFixed(1)}%`);
    console.log('\n🎉 All HTML files now use consistent dynamic header/footer loading!');
}

main().catch(error => {
    console.error('Fix error:', error);
    process.exit(1);
});
