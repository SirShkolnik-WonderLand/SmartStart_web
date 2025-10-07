// SEO Performance Monitoring Script
// Based on Google's 2025 SEO Manual recommendations
// Run this nightly via cron to monitor Core Web Vitals and SEO health

const https = require('https');
const fs = require('fs');
const path = require('path');

const PSI_API = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";
const CRUX_API = "https://chromeuxreport.googleapis.com/v1/records:queryRecord";

// Add your Google API key here or via environment variable
const API_KEY = process.env.GOOGLE_API_KEY || "";

// URLs to monitor
const urls = [
    "https://alicesolutionsgroup.com/",
    "https://alicesolutionsgroup.com/about.html",
    "https://alicesolutionsgroup.com/services.html",
    "https://alicesolutionsgroup.com/smartstart.html",
    "https://alicesolutionsgroup.com/locations/toronto.html"
];

// Performance targets from SEO manual
const TARGETS = {
    INP: 200,  // milliseconds
    LCP: 2500, // milliseconds
    CLS: 0.1   // score
};

function httpsRequest(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

async function checkPageSpeed(url, strategy = 'mobile') {
    const psiUrl = `${PSI_API}?url=${encodeURIComponent(url)}&strategy=${strategy}${API_KEY ? `&key=${API_KEY}` : ''}`;
    
    try {
        const response = await httpsRequest(psiUrl);
        const audits = response.lighthouseResult?.audits || {};
        
        return {
            url,
            strategy,
            lcp: audits['largest-contentful-paint']?.numericValue || null,
            inp: audits['interaction-to-next-paint']?.numericValue || 
                 audits['experimental-interaction-to-next-paint']?.numericValue || null,
            cls: audits['cumulative-layout-shift']?.numericValue || null,
            fcp: audits['first-contentful-paint']?.numericValue || null,
            tti: audits['interactive']?.numericValue || null,
            tbt: audits['total-blocking-time']?.numericValue || null,
            speedIndex: audits['speed-index']?.numericValue || null,
            performanceScore: response.lighthouseResult?.categories?.performance?.score * 100 || null,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error(`Error checking PageSpeed for ${url}:`, error.message);
        return { url, strategy, error: error.message, timestamp: new Date().toISOString() };
    }
}

async function checkCrUX(url) {
    if (!API_KEY) {
        console.log('CrUX API requires API key. Skipping...');
        return null;
    }

    const options = {
        hostname: 'chromeuxreport.googleapis.com',
        path: `/v1/records:queryRecord?key=${API_KEY}`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    const metrics = json.record?.metrics || {};
                    
                    resolve({
                        url,
                        source: 'CrUX (Real User Data)',
                        lcp_p75: metrics.largest_contentful_paint?.percentiles?.p75 || null,
                        inp_p75: metrics.interaction_to_next_paint?.percentiles?.p75 || null,
                        fid_p75: metrics.first_input_delay?.percentiles?.p75 || null,
                        cls_p75: metrics.cumulative_layout_shift?.percentiles?.p75 || null,
                        fcp_p75: metrics.first_contentful_paint?.percentiles?.p75 || null,
                        timestamp: new Date().toISOString()
                    });
                } catch (e) {
                    reject(e);
                }
            });
        });

        req.on('error', reject);
        req.write(JSON.stringify({ url }));
        req.end();
    }).catch(error => {
        console.error(`Error checking CrUX for ${url}:`, error.message);
        return { url, error: error.message };
    });
}

function assessPerformance(metrics) {
    const issues = [];
    const warnings = [];
    const passed = [];

    if (metrics.inp !== null) {
        if (metrics.inp > TARGETS.INP) {
            issues.push(`⚠️  INP: ${Math.round(metrics.inp)}ms (target: <${TARGETS.INP}ms)`);
        } else {
            passed.push(`✅ INP: ${Math.round(metrics.inp)}ms`);
        }
    }

    if (metrics.lcp !== null) {
        if (metrics.lcp > TARGETS.LCP) {
            issues.push(`⚠️  LCP: ${Math.round(metrics.lcp)}ms (target: <${TARGETS.LCP}ms)`);
        } else {
            passed.push(`✅ LCP: ${Math.round(metrics.lcp)}ms`);
        }
    }

    if (metrics.cls !== null) {
        if (metrics.cls > TARGETS.CLS) {
            issues.push(`⚠️  CLS: ${metrics.cls.toFixed(3)} (target: <${TARGETS.CLS})`);
        } else {
            passed.push(`✅ CLS: ${metrics.cls.toFixed(3)}`);
        }
    }

    return { issues, warnings, passed };
}

function saveReport(results, cruxResults) {
    const report = {
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleString(),
        summary: {
            totalUrls: urls.length,
            tested: results.length,
            targets: TARGETS
        },
        pageSpeed: results,
        crux: cruxResults.filter(r => r !== null)
    };

    const reportDir = path.join(__dirname, 'seo-reports');
    if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
    }

    const filename = `seo-report-${new Date().toISOString().split('T')[0]}.json`;
    const filepath = path.join(reportDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
    console.log(`\n📊 Report saved: ${filepath}`);
    
    return report;
}

async function main() {
    console.log('🔍 SEO Performance Monitor - Starting...\n');
    console.log(`Monitoring ${urls.length} URLs for Core Web Vitals compliance`);
    console.log(`Targets: INP <${TARGETS.INP}ms, LCP <${TARGETS.LCP}ms, CLS <${TARGETS.CLS}\n`);

    const results = [];
    const cruxResults = [];

    for (const url of urls) {
        console.log(`\n📍 Checking: ${url}`);
        
        // Check PageSpeed Insights (Lab Data)
        const psiMobile = await checkPageSpeed(url, 'mobile');
        results.push(psiMobile);
        
        // Assess performance
        const assessment = assessPerformance(psiMobile);
        
        if (assessment.issues.length > 0) {
            console.log('  Issues found:');
            assessment.issues.forEach(issue => console.log(`    ${issue}`));
        }
        
        if (assessment.passed.length > 0) {
            console.log('  Passed:');
            assessment.passed.forEach(pass => console.log(`    ${pass}`));
        }

        if (psiMobile.performanceScore !== null) {
            console.log(`  Performance Score: ${Math.round(psiMobile.performanceScore)}/100`);
        }
        
        // Check CrUX (Real User Data) if API key available
        if (API_KEY) {
            const crux = await checkCrUX(url);
            if (crux) {
                cruxResults.push(crux);
                console.log(`  CrUX Data: INP ${crux.inp_p75 || 'N/A'}ms, LCP ${crux.lcp_p75 || 'N/A'}ms`);
            }
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Save report
    const report = saveReport(results, cruxResults);

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    
    const allIssues = results.map(r => assessPerformance(r).issues).flat();
    if (allIssues.length > 0) {
        console.log('\n⚠️  Issues requiring attention:');
        allIssues.forEach(issue => console.log(`  ${issue}`));
    } else {
        console.log('\n✅ All pages meet Core Web Vitals targets!');
    }

    console.log('\n✅ Monitoring complete!');
    console.log(`📁 Full report: seo-reports/seo-report-${new Date().toISOString().split('T')[0]}.json`);
}

// Run the monitor
main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});

