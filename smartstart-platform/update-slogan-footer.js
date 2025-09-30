const fs = require('fs');
const path = require('path');

// List of HTML files to update
const htmlFiles = [
    'index.html',
    'about.html',
    'services.html',
    'cybersecurity-compliance.html',
    'automation-ai.html',
    'advisory-audits.html',
    'smartstart.html',
    'community.html',
    'resources.html',
    'contact.html',
    'privacy.html',
    'terms.html',
    'security.html',
    'innovation.html',
    'news.html'
];

// Slogan replacements
const sloganReplacements = [
    {
        old: 'Help people and businesses grow differently',
        new: 'Where People and Businesses Grow Differently'
    },
    {
        old: '"Help people and businesses grow differently."',
        new: '"Where People and Businesses Grow Differently."'
    },
    {
        old: 'help people and businesses grow differently',
        new: 'where people and businesses grow differently'
    }
];

// New footer design
const newFooterHTML = `
    <footer class="global-footer">
        <div class="footer-main">
            <div class="footer-brand">
                <div class="footer-logo">
                    <img src="assets/images/LOGO.png" alt="AliceSolutionsGroup" class="footer-logo-image">
                    <span class="brand-name">AliceSolutionsGroup</span>
                </div>
                <p class="brand-tagline">Where People and Businesses Grow Differently</p>
            </div>
            
            <div class="footer-links">
                <div class="footer-column">
                    <h4>Services</h4>
                    <div class="footer-link-grid">
                        <a href="cybersecurity-compliance.html">Cybersecurity</a>
                        <a href="automation-ai.html">Automation & AI</a>
                        <a href="advisory-audits.html">Advisory</a>
                        <a href="smartstart.html">SmartStart</a>
                    </div>
                </div>
                
                <div class="footer-column">
                    <h4>Company</h4>
                    <div class="footer-link-grid">
                        <a href="about.html">About</a>
                        <a href="community.html">Community</a>
                        <a href="innovation.html">Innovation</a>
                        <a href="news.html">News</a>
                    </div>
                </div>
                
                <div class="footer-column">
                    <h4>Resources</h4>
                    <div class="footer-link-grid">
                        <a href="resources.html">Knowledge Hub</a>
                        <a href="contact.html">Contact</a>
                        <a href="privacy.html">Privacy</a>
                        <a href="terms.html">Terms</a>
                    </div>
                </div>
            </div>
            
            <div class="footer-contact">
                <div class="contact-info">
                    <h4>Connect</h4>
                    <p><a href="mailto:udi.shkolnik@alicesolutionsgroup.com">udi.shkolnik@alicesolutionsgroup.com</a></p>
                    <p>Toronto, ON • Canada</p>
                </div>
                <div class="footer-credentials">
                    <div class="cred-badges">
                        <span class="cred-badge">CISSP</span>
                        <span class="cred-badge">CISM</span>
                        <span class="cred-badge">ISO 27001</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="footer-bottom">
            <div class="footer-bottom-content">
                <p>&copy; 2025 AliceSolutionsGroup. All rights reserved.</p>
                <div class="footer-links-bottom">
                    <a href="privacy.html">Privacy</a>
                    <a href="terms.html">Terms</a>
                    <a href="security.html">Security</a>
                </div>
            </div>
        </div>
    </footer>`;

// Function to update slogans in content
function updateSlogans(content) {
    let updatedContent = content;
    
    sloganReplacements.forEach(replacement => {
        const regex = new RegExp(replacement.old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        updatedContent = updatedContent.replace(regex, replacement.new);
    });
    
    return updatedContent;
}

// Function to update footer
function updateFooter(content) {
    // Find and replace the existing footer
    const footerRegex = /<footer class="global-footer">[\s\S]*?<\/footer>/;
    const updatedContent = content.replace(footerRegex, newFooterHTML);
    
    return updatedContent;
}

// Function to ensure header consistency
function ensureHeaderConsistency(content) {
    // Check if header has all required elements
    const headerRegex = /<header class="global-header" id="header">[\s\S]*?<\/header>/;
    const headerMatch = content.match(headerRegex);
    
    if (headerMatch) {
        const headerContent = headerMatch[0];
        
        // Check if all navigation items are present
        const requiredNavItems = ['Services', 'SmartStart', 'About', 'Community', 'Resources', 'Contact'];
        const missingItems = requiredNavItems.filter(item => !headerContent.includes(item));
        
        if (missingItems.length > 0) {
            console.log(`Missing nav items in header: ${missingItems.join(', ')}`);
        }
    }
    
    return content;
}

// Process each HTML file
htmlFiles.forEach(fileName => {
    const filePath = path.join(__dirname, 'website', fileName);
    
    if (fs.existsSync(filePath)) {
        console.log(`Processing ${fileName}...`);
        
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Update slogans
        content = updateSlogans(content);
        
        // Update footer
        content = updateFooter(content);
        
        // Ensure header consistency
        content = ensureHeaderConsistency(content);
        
        // Write back to file
        fs.writeFileSync(filePath, content, 'utf8');
        
        console.log(`✅ Updated ${fileName}`);
    } else {
        console.log(`⚠️ File not found: ${fileName}`);
    }
});

console.log('\n🎉 Slogan and footer update complete!');
