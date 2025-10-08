const fs = require('fs');
const path = require('path');

// List of all subdirectory pages that need fixing
const subdirectoryFiles = [
    'website/services/teaching-training.html',
    'website/services/cybersecurity-compliance.html',
    'website/services/automation-ai.html',
    'website/services/advisory-audits.html',
    'website/legal/terms.html',
    'website/legal/privacy.html',
    'website/legal/disclaimer.html',
    'website/community/news.html',
    'website/community/innovation.html',
    'website/community/impact-metrics.html',
    'website/community/community.html',
    'website/about/disambiguation.html'
];

let fixed = 0;

subdirectoryFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove the old manual fetch code that conflicts with loadNavbar/loadFooter
    const oldFetchCode = `        // Load navigation
        fetch('../includes/navbar.html')
            .then(response => response.text())
            .then(data => {
                document.getElementById('navbar-container').innerHTML = data;
            });

        // Load footer
        fetch('../includes/footer.html')
            .then(response => response.text())
            .then(data => {
                document.getElementById('footer').innerHTML = data;
            });

        // Initialize mobile menu toggle
        document.addEventListener('DOMContentLoaded', function() {
            loadNavbar();
            loadFooter();`;

    const newCode = `        // Initialize mobile menu toggle
        document.addEventListener('DOMContentLoaded', function() {
            loadNavbar();
            loadFooter();`;

    if (content.includes('fetch(\'../includes/navbar.html\')')) {
        content = content.replace(oldFetchCode, newCode);
        fs.writeFileSync(filePath, content);
        console.log(`✅ Fixed: ${file}`);
        fixed++;
    } else {
        console.log(`✓ Already clean: ${file}`);
    }
});

console.log(`\n✅ Fixed ${fixed} subdirectory pages`);
console.log(`Total processed: ${subdirectoryFiles.length} files`);

