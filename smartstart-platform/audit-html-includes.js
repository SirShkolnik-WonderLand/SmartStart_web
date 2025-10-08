#!/usr/bin/env node

/**
 * Audit all HTML files for correct footer and header includes
 */

const fs = require('fs').promises;
const path = require('path');

const WEBSITE_DIR = path.join(__dirname, 'website');

// Expected patterns
const EXPECTED_FOOTER_LINK = '<link rel="stylesheet" href="';
const EXPECTED_FOOTER_CSS = 'footer-lean.css">';
const EXPECTED_NAVBAR_SCRIPT = 'loadNavbar()';
const EXPECTED_FOOTER_SCRIPT = 'loadFooter()';

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

function getCorrectIncludePath(relativePath, includeFile) {
    const depth = relativePath.split(path.sep).length - 1;
    return '../'.repeat(depth) + `includes/${includeFile}`;
}

async function auditHtmlFile(filePath, relativePath) {
    const content = await fs.readFile(filePath, 'utf8');
    const issues = [];
    const fixes = [];
    
    // Check for footer-lean.css
    const footerCssPath = getCorrectFooterCssPath(relativePath);
    if (!content.includes('footer-lean.css')) {
        issues.push('❌ Missing footer-lean.css');
        fixes.push(`Add: <link rel="stylesheet" href="${footerCssPath}">`);
    } else if (!content.includes(footerCssPath)) {
        issues.push('⚠️  Incorrect footer-lean.css path');
        fixes.push(`Should be: <link rel="stylesheet" href="${footerCssPath}">`);
    }
    
    // Check for loadFooter() call
    if (!content.includes('loadFooter()')) {
        issues.push('❌ Missing loadFooter() call');
        fixes.push('Add loadFooter() in script');
    }
    
    // Check for loadNavbar() call
    if (!content.includes('loadNavbar()')) {
        issues.push('❌ Missing loadNavbar() call');
        fixes.push('Add loadNavbar() in script');
    }
    
    return {
        path: relativePath,
        hasIssues: issues.length > 0,
        issues,
        fixes,
        footerCssPath
    };
}

async function main() {
    console.log('🔍 Auditing all HTML files for correct footer and header includes...\n');
    
    const htmlFiles = await findAllHtmlFiles(WEBSITE_DIR);
    console.log(`Found ${htmlFiles.length} HTML files to audit\n`);
    
    const results = [];
    for (const file of htmlFiles) {
        const result = await auditHtmlFile(file.path, file.relativePath);
        results.push(result);
    }
    
    // Separate files with and without issues
    const filesWithIssues = results.filter(r => r.hasIssues);
    const filesOk = results.filter(r => !r.hasIssues);
    
    // Report files with issues
    if (filesWithIssues.length > 0) {
        console.log('❌ FILES WITH ISSUES:\n');
        filesWithIssues.forEach(result => {
            console.log(`📄 ${result.path}`);
            result.issues.forEach(issue => console.log(`   ${issue}`));
            result.fixes.forEach(fix => console.log(`   💡 ${fix}`));
            console.log();
        });
    }
    
    // Summary
    console.log('═══════════════════════════════════════════════════');
    console.log('📊 AUDIT SUMMARY');
    console.log('═══════════════════════════════════════════════════');
    console.log(`✅ Files OK: ${filesOk.length}`);
    console.log(`❌ Files with issues: ${filesWithIssues.length}`);
    console.log(`📁 Total files: ${results.length}`);
    
    if (filesOk.length > 0) {
        console.log('\n✅ FILES OK:');
        filesOk.forEach(r => console.log(`   ${r.path}`));
    }
    
    return filesWithIssues.length === 0;
}

main().then(success => {
    process.exit(success ? 0 : 1);
}).catch(error => {
    console.error('Audit error:', error);
    process.exit(1);
});
