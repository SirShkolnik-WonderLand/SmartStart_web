const fs = require('fs');
const path = require('path');

// List of all HTML files that need load-components.js
const files = [
    'website/about.html',
    'website/admin.html',
    'website/booking.html',
    'website/contact.html',
    'website/customer-portal.html',
    'website/resources.html',
    'website/services.html',
    'website/toronto-events.html',
    'website/about/disambiguation.html',
    'website/community/community.html',
    'website/community/impact-metrics.html',
    'website/community/innovation.html',
    'website/community/news.html',
    'website/legal/disclaimer.html',
    'website/legal/privacy.html',
    'website/legal/terms.html',
    'website/locations/ajax.html',
    'website/locations/brampton.html',
    'website/locations/burlington.html',
    'website/locations/caledon.html',
    'website/locations/georgina.html',
    'website/locations/markham.html',
    'website/locations/milton.html',
    'website/locations/mississauga.html',
    'website/locations/newmarket.html',
    'website/locations/north-york.html',
    'website/locations/oakville.html',
    'website/locations/oshawa.html',
    'website/locations/pickering.html',
    'website/locations/richmond-hill.html',
    'website/locations/scarborough.html',
    'website/locations/toronto.html',
    'website/locations/vaughan.html',
    'website/locations/whitby.html',
    'website/services/advisory-audits.html',
    'website/services/automation-ai.html',
    'website/services/cybersecurity-compliance.html',
    'website/services/teaching-training.html'
];

let fixed = 0;
let alreadyFixed = 0;

files.forEach(file => {
    const filePath = path.join(__dirname, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if load-components.js is already included
    if (content.includes('load-components.js')) {
        console.log(`✓ Already has load-components.js: ${file}`);
        alreadyFixed++;
        return;
    }
    
    // Determine the correct path prefix based on directory depth
    const depth = file.split('/').length - 2; // Subtract 2 for 'website/' and filename
    const prefix = depth > 0 ? '../'.repeat(depth) : '';
    
    // Find the first <script src= tag and add load-components.js before it
    const scriptRegex = /(<script src=["'])/;
    
    if (scriptRegex.test(content)) {
        content = content.replace(scriptRegex, `<script src="${prefix}assets/js/load-components.js"></script>\n    $1`);
        fs.writeFileSync(filePath, content);
        console.log(`✅ Fixed: ${file} (prefix: ${prefix || 'none'})`);
        fixed++;
    } else {
        console.log(`⚠️  No script tags found in: ${file}`);
    }
});

console.log(`\n✅ Fixed ${fixed} files`);
console.log(`✓ Already fixed: ${alreadyFixed} files`);
console.log(`Total processed: ${fixed + alreadyFixed} files`);

