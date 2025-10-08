const fs = require('fs');
const path = require('path');

// List of all location pages
const locationFiles = [
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
    'website/locations/whitby.html'
];

let fixed = 0;

locationFiles.forEach(file => {
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

console.log(`\n✅ Fixed ${fixed} location pages`);
console.log(`Total processed: ${locationFiles.length} files`);

