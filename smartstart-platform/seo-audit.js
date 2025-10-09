// Comprehensive SEO Audit Script
// Based on Google's 2025 SEO Manual recommendations
// Provides detailed SEO analysis without requiring API keys

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);

async function getAllHtmlFiles(dir = WEBSITE_DIR, basePath = '') {
    const files = [];
    const items = await readdir(dir);

    for (const item of items) {
        const fullPath = path.join(dir, item);
        const relativePath = path.join(basePath, item);
        const stats = await stat(fullPath);

        if (stats.isDirectory()) {
            const subFiles = await getAllHtmlFiles(fullPath, relativePath);
            files.push(...subFiles);
        } else if (item.endsWith('.html')) {
            files.push('/' + relativePath.replace(/\\/g, '/'));
        }
    }

    return files;
}

const WEBSITE_DIR = path.join(__dirname, 'website');

// SEO Checklist based on 2025 best practices
const SEO_CHECKLIST = {
    technical: {
        title: { required: true, maxLength: 60, description: "Unique, descriptive page titles" },
        description: { required: true, maxLength: 160, description: "Meta descriptions for all pages" },
        h1: { required: true, count: 1, description: "Single H1 tag per page" },
        canonical: { required: true, description: "Canonical URLs to prevent duplicate content" },
        robots: { required: true, description: "Robots meta tag" },
        viewport: { required: true, description: "Mobile viewport meta tag" },
        charset: { required: true, description: "UTF-8 charset declaration" },
        favicon: { required: true, description: "Favicon present" },
        sitemap: { required: true, description: "Sitemap.xml accessible" },
        robots_txt: { required: true, description: "Robots.txt accessible" }
    },
    content: {
        wordCount: { min: 300, description: "Minimum 300 words per page" },
        images: { alt: true, description: "Alt text for all images" },
        headings: { hierarchy: true, description: "Proper heading hierarchy (H1 > H2 > H3)" },
        links: { internal: true, description: "Internal linking present" },
        keywords: { density: 1.5, description: "Keyword density 1-3%" }
    },
    performance: {
        pageSize: { max: 2000000, description: "Page size under 2MB" },
        images: { optimized: true, description: "Images optimized" },
        css: { minified: true, description: "CSS minified" },
        js: { minified: true, description: "JavaScript minified" }
    },
    accessibility: {
        altText: { required: true, description: "Alt text for images" },
        contrast: { required: true, description: "Sufficient color contrast" },
        focus: { required: true, description: "Keyboard navigation support" },
        semantic: { required: true, description: "Semantic HTML elements" }
    }
};

async function auditPage(filePath, relativePath) {
    const results = {
        file: relativePath,
        url: `https://alicesolutionsgroup.com${relativePath}`,
        issues: [],
        warnings: [],
        passed: [],
        score: 0
    };

    try {
        const content = await readFile(filePath, 'utf8');

        // Technical SEO Checks
        await checkTechnicalSEO(content, results);

        // Content SEO Checks
        await checkContentSEO(content, results);

        // Performance Checks
        await checkPerformance(content, results);

        // Accessibility Checks
        await checkAccessibility(content, results);

        // Calculate score
        const totalChecks = results.passed.length + results.issues.length + results.warnings.length;
        const passedChecks = results.passed.length;
        results.score = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0;

    } catch (error) {
        results.issues.push(`❌ Error reading file: ${error.message}`);
    }

    return results;
}

async function checkTechnicalSEO(content, results) {
    // Title tag
    const titleMatch = content.match(/<title[^>]*>(.*?)<\/title>/i);
    if (titleMatch) {
        const title = titleMatch[1].trim();
        if (title.length > 0 && title.length <= 60) {
            results.passed.push("✅ Title tag present and optimal length");
        } else if (title.length > 60) {
            results.warnings.push(`⚠️ Title too long (${title.length}/60 chars)`);
        } else {
            results.issues.push("❌ Empty title tag");
        }
    } else {
        results.issues.push("❌ No title tag found");
    }

    // Meta description
    const descMatch = content.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
    if (descMatch) {
        const description = descMatch[1].trim();
        if (description.length > 0 && description.length <= 160) {
            results.passed.push("✅ Meta description present and optimal length");
        } else if (description.length > 160) {
            results.warnings.push(`⚠️ Meta description too long (${description.length}/160 chars)`);
        } else {
            results.issues.push("❌ Empty meta description");
        }
    } else {
        results.issues.push("❌ No meta description found");
    }

    // H1 tags
    const h1Matches = content.match(/<h1[^>]*>[\s\S]*?<\/h1>/gi);
    if (h1Matches && h1Matches.length === 1) {
        results.passed.push("✅ Single H1 tag present");
    } else if (h1Matches && h1Matches.length > 1) {
        results.issues.push(`❌ Multiple H1 tags found (${h1Matches.length})`);
    } else {
        results.issues.push("❌ No H1 tag found");
    }

    // Canonical URL
    if (content.includes('rel="canonical"') || content.includes("rel='canonical'")) {
        results.passed.push("✅ Canonical URL present");
    } else {
        results.issues.push("❌ No canonical URL found");
    }

    // Robots meta tag
    if (content.includes('name="robots"') || content.includes("name='robots'")) {
        results.passed.push("✅ Robots meta tag present");
    } else {
        results.warnings.push("⚠️ No robots meta tag found");
    }

    // Viewport meta tag
    if (content.includes('name="viewport"') || content.includes("name='viewport'")) {
        results.passed.push("✅ Viewport meta tag present");
    } else {
        results.issues.push("❌ No viewport meta tag found");
    }

    // Charset
    if (content.includes('charset="UTF-8"') || content.includes("charset='UTF-8'")) {
        results.passed.push("✅ UTF-8 charset declared");
    } else {
        results.issues.push("❌ No UTF-8 charset found");
    }

    // Favicon
    if (content.includes('rel="icon"') || content.includes("rel='icon'") || content.includes('rel="shortcut icon"')) {
        results.passed.push("✅ Favicon present");
    } else {
        results.warnings.push("⚠️ No favicon found");
    }
}

async function checkContentSEO(content, results) {
    // Word count (rough estimate)
    const textContent = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const wordCount = textContent.split(' ').length;

    if (wordCount >= 300) {
        results.passed.push(`✅ Sufficient content (${wordCount} words)`);
    } else {
        results.warnings.push(`⚠️ Low content (${wordCount}/300 words)`);
    }

    // Images with alt text
    const imgMatches = content.match(/<img[^>]*>/gi) || [];
    const imgWithAlt = imgMatches.filter(img => img.includes('alt='));

    if (imgMatches.length > 0) {
        if (imgWithAlt.length === imgMatches.length) {
            results.passed.push(`✅ All images have alt text (${imgMatches.length})`);
        } else {
            results.issues.push(`❌ ${imgMatches.length - imgWithAlt.length} images missing alt text`);
        }
    }

    // Heading hierarchy
    const h1Count = (content.match(/<h1[^>]*>/gi) || []).length;
    const h2Count = (content.match(/<h2[^>]*>/gi) || []).length;
    const h3Count = (content.match(/<h3[^>]*>/gi) || []).length;

    if (h1Count === 1 && h2Count > 0) {
        results.passed.push("✅ Proper heading hierarchy");
    } else if (h1Count === 0) {
        results.issues.push("❌ No H1 tag found");
    } else if (h1Count > 1) {
        results.issues.push(`❌ Multiple H1 tags (${h1Count})`);
    }

    // Internal links
    const internalLinks = content.match(/href=["'][^"']*\.html["']/gi) || [];
    if (internalLinks.length > 0) {
        results.passed.push(`✅ Internal linking present (${internalLinks.length} links)`);
    } else {
        results.warnings.push("⚠️ No internal links found");
    }
}

async function checkPerformance(content, results) {
    // Page size
    const pageSize = Buffer.byteLength(content, 'utf8');
    if (pageSize < 2000000) {
        results.passed.push(`✅ Page size optimal (${Math.round(pageSize / 1024)}KB)`);
    } else {
        results.warnings.push(`⚠️ Large page size (${Math.round(pageSize / 1024)}KB)`);
    }

    // CSS optimization
    const cssLinks = content.match(/<link[^>]*rel=["']stylesheet["'][^>]*>/gi) || [];
    const minifiedCSS = cssLinks.filter(link => link.includes('.min.css'));
    if (minifiedCSS.length > 0) {
        results.passed.push("✅ Some CSS files minified");
    } else {
        results.warnings.push("⚠️ No minified CSS files found");
    }

    // JavaScript optimization
    const jsScripts = content.match(/<script[^>]*src=["'][^"']*\.js["'][^>]*>/gi) || [];
    const minifiedJS = jsScripts.filter(script => script.includes('.min.js'));
    if (minifiedJS.length > 0) {
        results.passed.push("✅ Some JavaScript files minified");
    } else {
        results.warnings.push("⚠️ No minified JavaScript files found");
    }
}

async function checkAccessibility(content, results) {
    // Alt text (already checked in content)
    // Semantic HTML
    const semanticElements = ['<header', '<nav', '<main', '<section', '<article', '<aside', '<footer'];
    const foundSemantic = semanticElements.filter(element => content.includes(element));

    if (foundSemantic.length > 0) {
        results.passed.push(`✅ Semantic HTML elements used (${foundSemantic.length})`);
    } else {
        results.warnings.push("⚠️ No semantic HTML elements found");
    }

    // Form labels
    const inputs = content.match(/<input[^>]*>/gi) || [];
    const labeledInputs = inputs.filter(input =>
        content.includes(`for="`) || content.includes(`for='`) ||
        input.includes('aria-label=') || input.includes("aria-label='")
    );

    if (inputs.length > 0) {
        if (labeledInputs.length === inputs.length) {
            results.passed.push("✅ All form inputs properly labeled");
        } else {
            results.warnings.push(`⚠️ ${inputs.length - labeledInputs.length} form inputs missing labels`);
        }
    }
}

async function generateSEOReport() {
    console.log('🔍 SEO Audit - Starting comprehensive analysis...\n');

    // Get all HTML files
    const allFiles = await getAllHtmlFiles();
    const pages = allFiles.filter(file =>
        !file.includes('/includes/') &&
        !file.includes('/admin.html') &&
        file !== '/favicon.ico'
    ).sort();

    const results = [];
    let totalScore = 0;

    for (const page of pages) {
        const filePath = path.join(WEBSITE_DIR, page);
        console.log(`📍 Auditing: ${page}`);

        const pageResults = await auditPage(filePath, page);
        results.push(pageResults);
        totalScore += pageResults.score;

        console.log(`   Score: ${pageResults.score}/100`);
        if (pageResults.issues.length > 0) {
            console.log(`   Issues: ${pageResults.issues.length}`);
        }
        if (pageResults.warnings.length > 0) {
            console.log(`   Warnings: ${pageResults.warnings.length}`);
        }
    }

    const averageScore = Math.round(totalScore / results.length);

    // Generate report
    const report = {
        timestamp: new Date().toISOString(),
        summary: {
            totalPages: results.length,
            averageScore: averageScore,
            totalIssues: results.reduce((sum, r) => sum + r.issues.length, 0),
            totalWarnings: results.reduce((sum, r) => sum + r.warnings.length, 0)
        },
        pages: results,
        recommendations: generateRecommendations(results)
    };

    // Save report
    const reportDir = path.join(__dirname, 'seo-reports');
    if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
    }

    const filename = `seo-audit-${new Date().toISOString().split('T')[0]}.json`;
    const filepath = path.join(reportDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(report, null, 2));

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SEO AUDIT SUMMARY');
    console.log('='.repeat(60));
    console.log(`Average Score: ${averageScore}/100`);
    console.log(`Total Issues: ${report.summary.totalIssues}`);
    console.log(`Total Warnings: ${report.summary.totalWarnings}`);
    console.log(`\n📁 Full report: ${filepath}`);

    // Top issues
    const allIssues = results.flatMap(r => r.issues);
    const issueCounts = {};
    allIssues.forEach(issue => {
        const key = issue.split(':')[0];
        issueCounts[key] = (issueCounts[key] || 0) + 1;
    });

    if (Object.keys(issueCounts).length > 0) {
        console.log('\n🚨 Top Issues:');
        Object.entries(issueCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .forEach(([issue, count]) => {
                console.log(`  ${issue} (${count} pages)`);
            });
    }

    return report;
}

function generateRecommendations(results) {
    const recommendations = [];
    const allIssues = results.flatMap(r => r.issues);

    if (allIssues.some(issue => issue.includes('No title tag'))) {
        recommendations.push("Add unique, descriptive title tags to all pages");
    }

    if (allIssues.some(issue => issue.includes('No meta description'))) {
        recommendations.push("Add meta descriptions to all pages");
    }

    if (allIssues.some(issue => issue.includes('No H1 tag'))) {
        recommendations.push("Add H1 tags to pages missing them");
    }

    if (allIssues.some(issue => issue.includes('No canonical URL'))) {
        recommendations.push("Add canonical URLs to prevent duplicate content");
    }

    if (allIssues.some(issue => issue.includes('No viewport meta tag'))) {
        recommendations.push("Add viewport meta tags for mobile optimization");
    }

    if (allIssues.some(issue => issue.includes('images missing alt text'))) {
        recommendations.push("Add alt text to all images for accessibility");
    }

    return recommendations;
}

// Run the audit
generateSEOReport().catch(error => {
    console.error('❌ Audit failed:', error);
    process.exit(1);
});