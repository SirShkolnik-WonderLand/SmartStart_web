// Dynamic Sitemap Generator
// Generates sitemap.xml with accurate lastmod dates from file system
// Based on Google's 2025 SEO Manual recommendations

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

const WEBSITE_DIR = path.join(__dirname, 'website');
const OUTPUT_FILE = path.join(WEBSITE_DIR, 'sitemap.xml');
const BASE_URL = 'https://alicesolutionsgroup.com';

// Pages with priority and change frequency
const PAGE_CONFIG = {
    '/': { priority: 1.0, changefreq: 'weekly' },
    '/about.html': { priority: 0.9, changefreq: 'monthly' },
    '/services.html': { priority: 0.9, changefreq: 'monthly' },
    '/smartstart.html': { priority: 0.8, changefreq: 'monthly' },
    '/contact.html': { priority: 0.7, changefreq: 'monthly' },
    '/booking.html': { priority: 0.8, changefreq: 'monthly' },
    '/customer-portal.html': { priority: 0.6, changefreq: 'monthly' },

    // Services
    '/services/cybersecurity-compliance.html': { priority: 0.8, changefreq: 'monthly' },
    '/services/automation-ai.html': { priority: 0.8, changefreq: 'monthly' },
    '/services/advisory-audits.html': { priority: 0.8, changefreq: 'monthly' },
    '/services/teaching-training.html': { priority: 0.8, changefreq: 'monthly' },

    // Community
    '/community/community.html': { priority: 0.7, changefreq: 'weekly' },
    '/community/impact-metrics.html': { priority: 0.6, changefreq: 'monthly' },
    '/community/innovation.html': { priority: 0.6, changefreq: 'monthly' },
    '/community/news.html': { priority: 0.5, changefreq: 'weekly' },

    // Locations (High priority for local SEO)
    '/locations/toronto.html': { priority: 0.9, changefreq: 'weekly' },
    '/locations/mississauga.html': { priority: 0.9, changefreq: 'weekly' },
    '/locations/vaughan.html': { priority: 0.9, changefreq: 'weekly' },
    '/locations/north-york.html': { priority: 0.9, changefreq: 'weekly' },
    '/locations/brampton.html': { priority: 0.8, changefreq: 'weekly' },
    '/locations/markham.html': { priority: 0.8, changefreq: 'weekly' },
    '/locations/richmond-hill.html': { priority: 0.8, changefreq: 'weekly' },
    '/locations/scarborough.html': { priority: 0.8, changefreq: 'weekly' },
    '/locations/oakville.html': { priority: 0.8, changefreq: 'weekly' },
    '/locations/burlington.html': { priority: 0.8, changefreq: 'weekly' },
    '/locations/milton.html': { priority: 0.8, changefreq: 'weekly' },
    '/locations/ajax.html': { priority: 0.8, changefreq: 'weekly' },
    '/locations/pickering.html': { priority: 0.8, changefreq: 'weekly' },
    '/locations/whitby.html': { priority: 0.8, changefreq: 'weekly' },
    '/locations/oshawa.html': { priority: 0.8, changefreq: 'weekly' },
    '/locations/newmarket.html': { priority: 0.8, changefreq: 'weekly' },
    '/locations/georgina.html': { priority: 0.8, changefreq: 'weekly' },
    '/locations/caledon.html': { priority: 0.8, changefreq: 'weekly' },

    // Events
    '/toronto-events.html': { priority: 0.8, changefreq: 'weekly' },

    // Resources
    '/resources.html': { priority: 0.6, changefreq: 'monthly' },

    // Legal
    '/legal/privacy.html': { priority: 0.3, changefreq: 'yearly' },
    '/legal/terms.html': { priority: 0.3, changefreq: 'yearly' },
    '/legal/disclaimer.html': { priority: 0.3, changefreq: 'yearly' },

    // Brand disambiguation (Important for SEO)
    '/about/disambiguation.html': { priority: 0.7, changefreq: 'monthly' },

    // Quiestioneer (Free Cyber Health Check)
    '/Quiestioneer/': { priority: 0.7, changefreq: 'monthly' }
};

async function getFileModTime(filePath) {
    try {
        const stats = await stat(filePath);
        return stats.mtime.toISOString().split('T')[0]; // YYYY-MM-DD format
    } catch (error) {
        console.warn(`Warning: Could not get mod time for ${filePath}`);
        return new Date().toISOString().split('T')[0];
    }
}

async function generateSitemap() {
    console.log('🗺️  Generating sitemap.xml with dynamic lastmod dates...\n');

    const urls = [];

    // Process each configured page
    for (const [url, config] of Object.entries(PAGE_CONFIG)) {
        let filePath;

        if (url === '/') {
            filePath = path.join(WEBSITE_DIR, 'index.html');
        } else {
            filePath = path.join(WEBSITE_DIR, url);
        }

        const lastmod = await getFileModTime(filePath);

        urls.push({
            loc: BASE_URL + url,
            lastmod,
            changefreq: config.changefreq,
            priority: config.priority
        });

        console.log(`✓ ${url.padEnd(50)} ${lastmod}`);
    }

    // Generate XML
    const xml = generateXML(urls);

    // Write to file
    fs.writeFileSync(OUTPUT_FILE, xml, 'utf8');

    console.log(`\n✅ Sitemap generated successfully!`);
    console.log(`📁 Location: ${OUTPUT_FILE}`);
    console.log(`📊 Total URLs: ${urls.length}`);
    console.log(`\n🔍 Validate at: https://www.xml-sitemaps.com/validate-xml-sitemap.html`);
}

function generateXML(urls) {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
    xml += '        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n';
    xml += '        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9\n';
    xml += '        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n\n';

    urls.forEach(url => {
        xml += '    <url>\n';
        xml += `        <loc>${url.loc}</loc>\n`;
        xml += `        <lastmod>${url.lastmod}</lastmod>\n`;
        xml += `        <changefreq>${url.changefreq}</changefreq>\n`;
        xml += `        <priority>${url.priority}</priority>\n`;
        xml += '    </url>\n\n';
    });

    xml += '</urlset>';
    return xml;
}

// Run the generator
generateSitemap().catch(error => {
    console.error('❌ Error generating sitemap:', error);
    process.exit(1);
});