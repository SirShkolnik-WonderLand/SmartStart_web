#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Location data with accurate coordinates and postal codes
const locations = {
    'toronto': {
        name: 'Toronto',
        coordinates: '43.6532;-79.3832',
        postalCode: 'M5H 2N2',
        description: 'Let\'s discuss how we can help protect your business in Toronto\'s dynamic environment, whether you\'re in the Financial District, near the CN Tower, or anywhere in the city.',
        businessAreas: [
            { icon: '🏢', title: 'Financial District', desc: 'Banks, investment firms, and professional services in Toronto\'s core business district.' },
            { icon: '🏭', title: 'Industrial Areas', desc: 'Manufacturing and logistics companies requiring robust cybersecurity infrastructure.' },
            { icon: '🏪', title: 'Retail & Services', desc: 'Local businesses and service providers needing compliance and data protection.' }
        ]
    },
    'mississauga': {
        name: 'Mississauga',
        coordinates: '43.5890;-79.6441',
        postalCode: 'L5B 3C1',
        description: 'Let\'s discuss how we can help protect your business in Mississauga\'s thriving environment, whether you\'re in the downtown core, near Square One, or anywhere in the city.',
        businessAreas: [
            { icon: '🏢', title: 'Downtown Mississauga', desc: 'Professional services, retail, and growing tech companies in Mississauga\'s core business district.' },
            { icon: '🏭', title: 'Industrial Areas', desc: 'Manufacturing and distribution companies requiring robust cybersecurity infrastructure.' },
            { icon: '🏪', title: 'Retail & Services', desc: 'Local businesses and service providers needing compliance and data protection.' }
        ]
    },
    'vaughan': {
        name: 'Vaughan',
        coordinates: '43.8361;-79.4983',
        postalCode: 'L4J 8A1',
        description: 'Let\'s discuss how we can help protect your business in Vaughan\'s growing community, whether you\'re in the downtown area, near Vaughan Mills, or anywhere in the city.',
        businessAreas: [
            { icon: '🏢', title: 'Downtown Vaughan', desc: 'Professional services, retail, and growing tech companies in Vaughan\'s core business district.' },
            { icon: '🏭', title: 'Industrial Areas', desc: 'Manufacturing and distribution companies requiring robust cybersecurity infrastructure.' },
            { icon: '🏪', title: 'Retail & Services', desc: 'Local businesses and service providers needing compliance and data protection.' }
        ]
    },
    'markham': {
        name: 'Markham',
        coordinates: '43.8668;-79.2663',
        postalCode: 'L3R 0Y7',
        description: 'Let\'s discuss how we can help protect your business in Markham\'s innovative environment, whether you\'re in the downtown core, near the tech hub, or anywhere in the city.',
        businessAreas: [
            { icon: '🏢', title: 'Downtown Markham', desc: 'Professional services, retail, and growing tech companies in Markham\'s core business district.' },
            { icon: '🏭', title: 'Industrial Areas', desc: 'Manufacturing and distribution companies requiring robust cybersecurity infrastructure.' },
            { icon: '🏪', title: 'Retail & Services', desc: 'Local businesses and service providers needing compliance and data protection.' }
        ]
    },
    'brampton': {
        name: 'Brampton',
        coordinates: '43.6834;-79.7667',
        postalCode: 'L6T 4B3',
        description: 'Let\'s discuss how we can help protect your business in Brampton\'s diverse environment, whether you\'re in the downtown core, near the industrial areas, or anywhere in the city.',
        businessAreas: [
            { icon: '🏢', title: 'Downtown Brampton', desc: 'Professional services, retail, and growing tech companies in Brampton\'s core business district.' },
            { icon: '🏭', title: 'Industrial Areas', desc: 'Manufacturing and distribution companies requiring robust cybersecurity infrastructure.' },
            { icon: '🏪', title: 'Retail & Services', desc: 'Local businesses and service providers needing compliance and data protection.' }
        ]
    },
    'richmond-hill': {
        name: 'Richmond Hill',
        coordinates: '43.8828;-79.4403',
        postalCode: 'L4C 3C7',
        description: 'Let\'s discuss how we can help protect your business in Richmond Hill\'s thriving environment, whether you\'re in the downtown area, near the business district, or anywhere in the city.',
        businessAreas: [
            { icon: '🏢', title: 'Downtown Richmond Hill', desc: 'Professional services, retail, and growing tech companies in Richmond Hill\'s core business district.' },
            { icon: '🏭', title: 'Industrial Areas', desc: 'Manufacturing and distribution companies requiring robust cybersecurity infrastructure.' },
            { icon: '🏪', title: 'Retail & Services', desc: 'Local businesses and service providers needing compliance and data protection.' }
        ]
    },
    'oakville': {
        name: 'Oakville',
        coordinates: '43.4675;-79.6877',
        postalCode: 'L6H 6Y5',
        description: 'Let\'s discuss how we can help protect your business in Oakville\'s prosperous environment, whether you\'re in the downtown core, near the waterfront, or anywhere in the city.',
        businessAreas: [
            { icon: '🏢', title: 'Downtown Oakville', desc: 'Professional services, retail, and growing tech companies in Oakville\'s core business district.' },
            { icon: '🏭', title: 'Industrial Areas', desc: 'Manufacturing and distribution companies requiring robust cybersecurity infrastructure.' },
            { icon: '🏪', title: 'Retail & Services', desc: 'Local businesses and service providers needing compliance and data protection.' }
        ]
    },
    'north-york': {
        name: 'North York',
        coordinates: '43.7615;-79.4111',
        postalCode: 'M2N 5V9',
        description: 'Let\'s discuss how we can help protect your business in North York\'s dynamic environment, whether you\'re in the North York City Centre, near Yorkdale, or anywhere in the district.',
        businessAreas: [
            { icon: '🏢', title: 'North York City Centre', desc: 'Professional services, retail, and growing tech companies in North York\'s core business district.' },
            { icon: '🏭', title: 'Industrial Areas', desc: 'Manufacturing and distribution companies requiring robust cybersecurity infrastructure.' },
            { icon: '🏪', title: 'Retail & Services', desc: 'Local businesses and service providers needing compliance and data protection.' }
        ]
    },
    'scarborough': {
        name: 'Scarborough',
        coordinates: '43.7731;-79.2578',
        postalCode: 'M1B 5M5',
        description: 'Let\'s discuss how we can help protect your business in Scarborough\'s diverse environment, whether you\'re in the downtown core, near the Scarborough Town Centre, or anywhere in the district.',
        businessAreas: [
            { icon: '🏢', title: 'Downtown Scarborough', desc: 'Professional services, retail, and growing tech companies in Scarborough\'s core business district.' },
            { icon: '🏭', title: 'Industrial Areas', desc: 'Manufacturing and distribution companies requiring robust cybersecurity infrastructure.' },
            { icon: '🏪', title: 'Retail & Services', desc: 'Local businesses and service providers needing compliance and data protection.' }
        ]
    },
    'burlington': {
        name: 'Burlington',
        coordinates: '43.3255;-79.7990',
        postalCode: 'L7R 3Y2',
        description: 'Let\'s discuss how we can help protect your business in Burlington\'s unique environment, whether you\'re in the downtown core, near the lakefront, or anywhere in the city.',
        businessAreas: [
            { icon: '🏢', title: 'Downtown Burlington', desc: 'Professional services, retail, and growing tech companies in Burlington\'s core business district.' },
            { icon: '🏭', title: 'Industrial Areas', desc: 'Manufacturing and distribution companies requiring robust cybersecurity infrastructure.' },
            { icon: '🏪', title: 'Retail & Services', desc: 'Local businesses and service providers needing compliance and data protection.' }
        ]
    },
    'ajax': {
        name: 'Ajax',
        coordinates: '43.8501;-79.0329',
        postalCode: 'L1S 3H2',
        description: 'Let\'s discuss how we can help protect your business in Ajax\'s growing community, whether you\'re in the downtown area, near the waterfront, or anywhere in the city.',
        businessAreas: [
            { icon: '🏢', title: 'Downtown Ajax', desc: 'Professional services, retail, and growing tech companies in Ajax\'s core business district.' },
            { icon: '🏭', title: 'Industrial Areas', desc: 'Manufacturing and distribution companies requiring robust cybersecurity infrastructure.' },
            { icon: '🏪', title: 'Retail & Services', desc: 'Local businesses and service providers needing compliance and data protection.' }
        ]
    },
    'pickering': {
        name: 'Pickering',
        coordinates: '43.8361;-79.0863',
        postalCode: 'L1W 2X9',
        description: 'Let\'s discuss how we can help protect your business in Pickering\'s dynamic environment, whether you\'re in the downtown core, near the waterfront, or anywhere in the city.',
        businessAreas: [
            { icon: '🏢', title: 'Downtown Pickering', desc: 'Professional services, retail, and growing tech companies in Pickering\'s core business district.' },
            { icon: '🏭', title: 'Industrial Areas', desc: 'Manufacturing and distribution companies requiring robust cybersecurity infrastructure.' },
            { icon: '🏪', title: 'Retail & Services', desc: 'Local businesses and service providers needing compliance and data protection.' }
        ]
    },
    'whitby': {
        name: 'Whitby',
        coordinates: '43.8975;-78.9428',
        postalCode: 'L1N 2M1',
        description: 'Let\'s discuss how we can help protect your business in Whitby\'s thriving community, whether you\'re in the downtown area, near the waterfront, or anywhere in the city.',
        businessAreas: [
            { icon: '🏢', title: 'Downtown Whitby', desc: 'Professional services, retail, and growing tech companies in Whitby\'s core business district.' },
            { icon: '🏭', title: 'Industrial Areas', desc: 'Manufacturing and distribution companies requiring robust cybersecurity infrastructure.' },
            { icon: '🏪', title: 'Retail & Services', desc: 'Local businesses and service providers needing compliance and data protection.' }
        ]
    },
    'oshawa': {
        name: 'Oshawa',
        coordinates: '43.8971;-78.8658',
        postalCode: 'L1H 7K4',
        description: 'Let\'s discuss how we can help protect your business in Oshawa\'s dynamic environment, whether you\'re in the downtown core, near the university, or anywhere in the city.',
        businessAreas: [
            { icon: '🏢', title: 'Downtown Oshawa', desc: 'Professional services, retail, and growing tech companies in Oshawa\'s core business district.' },
            { icon: '🏭', title: 'Industrial Areas', desc: 'Manufacturing and distribution companies requiring robust cybersecurity infrastructure.' },
            { icon: '🏪', title: 'Retail & Services', desc: 'Local businesses and service providers needing compliance and data protection.' }
        ]
    },
    'newmarket': {
        name: 'Newmarket',
        coordinates: '44.0501;-79.4594',
        postalCode: 'L3Y 4W7',
        description: 'Let\'s discuss how we can help protect your business in Newmarket\'s thriving community, whether you\'re in the downtown area, near the Upper Canada Mall, or anywhere in the city.',
        businessAreas: [
            { icon: '🏢', title: 'Downtown Newmarket', desc: 'Professional services, retail, and growing tech companies in Newmarket\'s core business district.' },
            { icon: '🏭', title: 'Industrial Areas', desc: 'Manufacturing and distribution companies requiring robust cybersecurity infrastructure.' },
            { icon: '🏪', title: 'Retail & Services', desc: 'Local businesses and service providers needing compliance and data protection.' }
        ]
    },
    'milton': {
        name: 'Milton',
        coordinates: '43.5183;-79.8774',
        postalCode: 'L9T 2N4',
        description: 'Let\'s discuss how we can help protect your business in Milton\'s growing community, whether you\'re in the downtown area, near the industrial zones, or anywhere in the city.',
        businessAreas: [
            { icon: '🏢', title: 'Downtown Milton', desc: 'Professional services, retail, and growing tech companies in Milton\'s core business district.' },
            { icon: '🏭', title: 'Industrial Areas', desc: 'Manufacturing and distribution companies requiring robust cybersecurity infrastructure.' },
            { icon: '🏪', title: 'Retail & Services', desc: 'Local businesses and service providers needing compliance and data protection.' }
        ]
    },
    'caledon': {
        name: 'Caledon',
        coordinates: '43.8668;-79.8579',
        postalCode: 'L7C 1A1',
        description: 'Let\'s discuss how we can help protect your business in Caledon\'s diverse environment, whether you\'re in the urban areas, near the industrial zones, or anywhere in the municipality.',
        businessAreas: [
            { icon: '🏢', title: 'Urban Areas', desc: 'Professional services, retail, and growing tech companies in Caledon\'s urban centers.' },
            { icon: '🏭', title: 'Industrial Areas', desc: 'Manufacturing and distribution companies requiring robust cybersecurity infrastructure.' },
            { icon: '🏪', title: 'Retail & Services', desc: 'Local businesses and service providers needing compliance and data protection.' }
        ]
    },
    'georgina': {
        name: 'Georgina',
        coordinates: '44.3001;-79.4333',
        postalCode: 'L4P 1A1',
        description: 'Let\'s discuss how we can help protect your business in Georgina\'s lakeside community, whether you\'re in the downtown area, near the waterfront, or anywhere in the municipality.',
        businessAreas: [
            { icon: '🏢', title: 'Downtown Georgina', desc: 'Professional services, retail, and growing tech companies in Georgina\'s core business district.' },
            { icon: '🏭', title: 'Industrial Areas', desc: 'Manufacturing and distribution companies requiring robust cybersecurity infrastructure.' },
            { icon: '🏪', title: 'Retail & Services', desc: 'Local businesses and service providers needing compliance and data protection.' }
        ]
    }
};

function generateLocationPage(cityKey, locationData) {
    const cityName = locationData.name;
    const cityLower = cityKey;
    const coordinates = locationData.coordinates;
    const postalCode = locationData.postalCode;
    const description = locationData.description;
    const businessAreas = locationData.businessAreas;

    return `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cybersecurity & AI Services for ${cityName} | AliceSolutionsGroup - GTA Expansion</title>
    <meta name="description" content="Cybersecurity and AI automation services for ${cityName} businesses. Expert consulting and training for startups and enterprises in the Greater Toronto Area.">
    <meta name="keywords" content="cybersecurity ${cityName}, AI automation GTA, compliance consulting Ontario, tech consulting ${cityName}, startup services GTA, cybersecurity training ${cityName}, ISO 27001 ${cityName}, CISSP training Ontario">

    <!-- Local SEO Meta Tags -->
    <meta name="geo.region" content="CA-ON">
    <meta name="geo.placename" content="${cityName}">
    <meta name="geo.position" content="${coordinates}">
    <meta name="ICBM" content="${coordinates}">

    <!-- Open Graph for Social Media -->
    <meta property="og:title" content="Cybersecurity & AI Services in ${cityName} | AliceSolutionsGroup">
    <meta property="og:description" content="Expert cybersecurity, AI automation, and compliance services for ${cityName} businesses. Trusted by startups and enterprises across the GTA.">
    <meta property="og:image" content="https://alicesolutionsgroup.com/assets/images/AliceSolutionsGroup-logo-owl-rabbit-fox.png">
    <meta property="og:url" content="https://alicesolutionsgroup.com/locations/${cityLower}.html">
    <meta property="og:type" content="website">
    <meta property="og:locale" content="en_CA">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Cybersecurity & AI Services in ${cityName} | AliceSolutionsGroup">
    <meta name="twitter:description" content="Expert cybersecurity, AI automation, and compliance services for ${cityName} businesses.">
    <meta name="twitter:image" content="https://alicesolutionsgroup.com/assets/images/AliceSolutionsGroup-logo-owl-rabbit-fox.png">

    <!-- Canonical URL -->
    <link rel="canonical" href="https://alicesolutionsgroup.com/locations/${cityLower}.html">

    <!-- Local Business Schema -->
    <script type="application/ld+json">
        {
            "@context": "https://schema.org",
            "@type": "ProfessionalService",
            "name": "AliceSolutionsGroup",
            "description": "Cybersecurity, AI automation, and compliance consulting services for ${cityName} and GTA businesses",
            "url": "https://alicesolutionsgroup.com",
            "logo": "https://alicesolutionsgroup.com/assets/images/AliceSolutionsGroup-logo-owl-rabbit-fox.png",
            "image": "https://alicesolutionsgroup.com/assets/images/AliceSolutionsGroup-logo-owl-rabbit-fox.png",
            "telephone": "+1-416-XXX-XXXX",
            "email": "info@alicesolutionsgroup.com",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "${cityName} Business District",
                "addressLocality": "${cityName}",
                "addressRegion": "ON",
                "postalCode": "${postalCode}",
                "addressCountry": "CA"
            },
            "areaServed": {
                "@type": "City",
                "name": "${cityName}"
            },
            "serviceType": ["Cybersecurity", "AI Automation", "Compliance Consulting", "Training"]
        }
    </script>

    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="../favicon.ico">
    <link rel="icon" type="image/svg+xml" href="../favicon.svg">

    <!-- CSS -->
    <link rel="stylesheet" href="../assets/css/styles.css">
    <link rel="stylesheet" href="../assets/css/city-pages.css">

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Roboto+Mono:wght@300;400;500&display=swap" rel="stylesheet">
</head>

<body>
    <!-- Header -->
    <header class="global-header" id="header">
        <div class="header-content">
            <a href="../index.html" class="logo">
                <img src="../assets/images/AliceSolutionsGroup-logo-owl-rabbit-fox.png" alt="AliceSolutionsGroup" class="logo-image">
                <span>AliceSolutionsGroup</span>
            </a>
            <!-- Include shared navigation -->
            <div id="navbar-container"></div>
            <button class="mobile-menu-toggle" aria-label="Toggle menu">☰</button>
        </div>
    </header>

    <!-- Hero Section -->
    <section class="hero-section" style="padding-top: 100px; min-height: 80vh; display: flex; align-items: center;">
        <div class="hero-content" style="max-width: 900px; margin: 0 auto; padding: 0 2rem; text-align: center;">
            <h1 class="hero-title" style="font-size: clamp(2.5rem, 6vw, 4rem); font-weight: 700; line-height: 1.1; margin-bottom: 1.5rem; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Ready to Secure Your <span class="gradient-text">${cityName} Business</span>?</h1>
            <p class="hero-description" style="font-size: clamp(1.2rem, 3vw, 1.8rem); font-weight: 500; color: #cbd5e1; margin-bottom: 2rem; line-height: 1.4;">${description}</p>
            <div class="hero-actions" style="display: flex; gap: 1.5rem; justify-content: center; flex-wrap: wrap; margin-bottom: 2rem;">
                <a href="#consultation" class="btn btn-primary" style="padding: 1rem 2rem; background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; transition: all 0.3s ease;">Get ${cityName} Consultation</a>
                <a href="../services/cybersecurity-compliance.html" class="btn btn-secondary" style="padding: 1rem 2rem; background: transparent; color: #3b82f6; text-decoration: none; border: 2px solid #3b82f6; border-radius: 8px; font-weight: 600; transition: all 0.3s ease;">View Security Services</a>
            </div>
        </div>
    </section>

    <!-- Local Business Section -->
    <section class="local-business-section" style="padding: 4rem 0;">
        <div class="container" style="max-width: 1200px; margin: 0 auto; padding: 0 2rem;">
            <div class="section-header">
                <h2>Serving ${cityName}'s Business Community</h2>
                <p>From the ${cityName} business district to the surrounding areas, we understand the unique cybersecurity needs of ${cityName} businesses.</p>
            </div>

            <div class="business-grid">
                ${businessAreas.map(area => `
                <div class="business-card">
                    <div class="business-icon">${area.icon}</div>
                    <h3>${area.title}</h3>
                    <p>${area.desc}</p>
                </div>
                `).join('')}
            </div>
        </div>
    </section>

    <!-- Services Section -->
    <section class="services-section" style="padding: 4rem 0;">
        <div class="container" style="max-width: 1200px; margin: 0 auto; padding: 0 2rem;">
            <div class="section-header">
                <h2>Cybersecurity Services for ${cityName}</h2>
                <p>Comprehensive security solutions tailored to ${cityName}'s business landscape.</p>
            </div>

            <div class="services-grid">
                <div class="service-card">
                    <div class="service-icon">🛡️</div>
                    <h3>Cybersecurity Assessment</h3>
                    <p>Comprehensive security audits for ${cityName} businesses of all sizes.</p>
                    <ul class="service-features">
                        <li>Vulnerability assessments</li>
                        <li>Compliance reviews</li>
                        <li>Risk analysis</li>
                    </ul>
                </div>
                <div class="service-card">
                    <div class="service-icon">⚙️</div>
                    <h3>Process Automation</h3>
                    <p>Streamline operations with intelligent automation solutions.</p>
                    <ul class="service-features">
                        <li>Process automation</li>
                        <li>Data analytics</li>
                        <li>Workflow optimization</li>
                    </ul>
                </div>
                <div class="service-card">
                    <div class="service-icon">📋</div>
                    <h3>Compliance Consulting</h3>
                    <p>Navigate complex regulatory requirements with expert guidance.</p>
                    <ul class="service-features">
                        <li>ISO 27001 certification</li>
                        <li>PIPEDA compliance</li>
                        <li>Industry standards</li>
                    </ul>
                </div>
            </div>
        </div>
    </section>

    <!-- Local Expertise Section -->
    <section class="expertise-section" style="padding: 4rem 0;">
        <div class="container" style="max-width: 1200px; margin: 0 auto; padding: 0 2rem;">
            <div class="expertise-content">
                <div class="expertise-text">
                    <h2>Why Choose AliceSolutionsGroup for ${cityName}?</h2>
                    <div class="expertise-points">
                        <div class="expertise-point">
                            <div class="point-icon">📍</div>
                            <div class="point-content">
                                <h4>Local Knowledge</h4>
                                <p>Deep understanding of ${cityName}'s business environment and regulatory landscape.</p>
                            </div>
                        </div>
                        <div class="expertise-point">
                            <div class="point-icon">🚀</div>
                            <div class="point-content">
                                <h4>Proven Results</h4>
                                <p>Successfully helped ${cityName} businesses improve their security posture and compliance.</p>
                            </div>
                        </div>
                        <div class="expertise-point">
                            <div class="point-icon">🤝</div>
                            <div class="point-content">
                                <h4>Partnership Approach</h4>
                                <p>We work as your trusted technology partner, not just a service provider.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="expertise-visual">
                    <div class="certification-badges">
                        <div class="cert-badge">
                            <img src="../assets/icons/CISSP.png" alt="CISSP Certified" class="cert-image">
                            <span class="cert-text">CISSP</span>
                        </div>
                        <div class="cert-badge">
                            <img src="../assets/icons/ISO27001LA_round.webp" alt="ISO 27001 Lead Auditor" class="cert-image">
                            <span class="cert-text">ISO 27001 LA</span>
                        </div>
                        <div class="cert-badge">
                            <img src="../assets/icons/CISM.png" alt="CISM Certified" class="cert-image">
                            <span class="cert-text">CISM</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- CTA Section -->
    <section id="consultation" class="cta-section" style="padding: 4rem 0;">
        <div class="container" style="max-width: 1200px; margin: 0 auto; padding: 0 2rem;">
            <div class="cta-content">
                <h2>Ready to Secure Your ${cityName} Business?</h2>
                <p>Contact us today for a free consultation and discover how we can help protect your business.</p>
                <div class="cta-actions">
                    <a href="../contact.html" class="btn btn-primary">Get Free Consultation</a>
                    <a href="tel:+1-416-XXX-XXXX" class="btn btn-secondary">Call Now</a>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <div id="footer-container"></div>

    <!-- Scripts -->
    <script src="../assets/js/script.js"></script>
    <script>
        // Load navigation
        fetch('../includes/navbar.html')
            .then(response => response.text())
            .then(data => {
                document.getElementById('navbar-container').innerHTML = data;
            });

        // Load footer
        fetch('../includes/footer.html')
            .then(response => response.text())
            .then(data => {
                document.getElementById('footer-container').innerHTML = data;
            });

        // Initialize mobile menu toggle
        document.addEventListener('DOMContentLoaded', function() {
            const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
            const navbarContainer = document.getElementById('navbar-container');
            
            if (mobileMenuToggle && navbarContainer) {
                mobileMenuToggle.addEventListener('click', function() {
                    navbarContainer.classList.toggle('mobile-menu-open');
                    mobileMenuToggle.classList.toggle('active');
                });
            }
        });
    </script>
</body>

</html>`;
}

// Generate all location pages
const locationsDir = path.join(__dirname, 'website', 'locations');

// Ensure directory exists
if (!fs.existsSync(locationsDir)) {
    fs.mkdirSync(locationsDir, { recursive: true });
}

console.log('Generating location pages...');

Object.entries(locations).forEach(([cityKey, locationData]) => {
    const htmlContent = generateLocationPage(cityKey, locationData);
    const filePath = path.join(locationsDir, `${cityKey}.html`);
    
    fs.writeFileSync(filePath, htmlContent, 'utf8');
    console.log(`✅ Generated: ${cityKey}.html`);
});

console.log('\\n🎉 All location pages generated successfully!');
console.log('\\n📋 Generated pages:');
Object.keys(locations).forEach(cityKey => {
    console.log(`   - ${cityKey}.html`);
});