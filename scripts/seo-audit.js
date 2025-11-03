#!/usr/bin/env node
/**
 * SEO Audit Script for AliceSolutionsGroup & SmartStart
 * Tests all pages for SEO compliance based on 2025 standards
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

const BASE_URL = process.env.BASE_URL || 'https://alicesolutionsgroup.com';
const PAGES_TO_TEST = [
  '/',
  '/smartstart',
  '/smartstart-venture-building',
  '/about',
  '/services',
  '/contact',
];

const results = {
  passed: [],
  failed: [],
  warnings: [],
};

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, body: data, headers: res.headers });
      });
    }).on('error', reject);
  });
}

function extractMetaTags(html) {
  const metaTags = {};
  
  // Title tag
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  metaTags.title = titleMatch ? titleMatch[1].trim() : null;
  
  // Meta description
  const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
  metaTags.description = descMatch ? descMatch[1].trim() : null;
  
  // Canonical URL
  const canonicalMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
  metaTags.canonical = canonicalMatch ? canonicalMatch[1].trim() : null;
  
  // Open Graph tags
  const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
  metaTags.ogTitle = ogTitleMatch ? ogTitleMatch[1].trim() : null;
  
  const ogDescMatch = html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i);
  metaTags.ogDescription = ogDescMatch ? ogDescMatch[1].trim() : null;
  
  // Twitter Card
  const twitterCardMatch = html.match(/<meta\s+property=["']twitter:card["']\s+content=["']([^"']+)["']/i);
  metaTags.twitterCard = twitterCardMatch ? twitterCardMatch[1].trim() : null;
  
  // H1 tag
  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  metaTags.h1 = h1Match ? h1Match[1].trim() : null;
  
  // Structured Data (JSON-LD)
  const jsonLdMatches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  metaTags.structuredData = jsonLdMatches ? jsonLdMatches.length : 0;
  
  return metaTags;
}

function validateMetaTags(url, metaTags) {
  const issues = [];
  const warnings = [];
  
  // Title tag checks
  if (!metaTags.title) {
    issues.push('❌ Missing title tag');
  } else {
    if (metaTags.title.length < 30) {
      warnings.push('⚠️  Title tag too short (< 30 chars)');
    }
    if (metaTags.title.length > 60) {
      warnings.push('⚠️  Title tag too long (> 60 chars)');
    }
  }
  
  // Meta description checks
  if (!metaTags.description) {
    issues.push('❌ Missing meta description');
  } else {
    if (metaTags.description.length < 120) {
      warnings.push('⚠️  Meta description too short (< 120 chars)');
    }
    if (metaTags.description.length > 160) {
      warnings.push('⚠️  Meta description too long (> 160 chars)');
    }
  }
  
  // Canonical URL checks
  if (!metaTags.canonical) {
    issues.push('❌ Missing canonical URL');
  } else {
    const expectedCanonical = url.replace(/\/$/, '') || url;
    if (!metaTags.canonical.includes(expectedCanonical)) {
      warnings.push(`⚠️  Canonical URL may not match page URL`);
    }
  }
  
  // Open Graph checks
  if (!metaTags.ogTitle) {
    issues.push('❌ Missing Open Graph title');
  }
  if (!metaTags.ogDescription) {
    issues.push('❌ Missing Open Graph description');
  }
  
  // Twitter Card checks
  if (!metaTags.twitterCard) {
    warnings.push('⚠️  Missing Twitter Card');
  }
  
  // H1 tag checks
  if (!metaTags.h1) {
    issues.push('❌ Missing H1 tag');
  }
  
  // Structured Data checks
  if (metaTags.structuredData === 0) {
    warnings.push('⚠️  No structured data (JSON-LD) found');
  }
  
  return { issues, warnings };
}

async function testPage(path) {
  const url = `${BASE_URL}${path}`;
  log(`\n📄 Testing: ${url}`, 'blue');
  
  try {
    const response = await fetchPage(url);
    
    if (response.statusCode !== 200) {
      results.failed.push({
        url,
        error: `HTTP ${response.statusCode}`,
      });
      log(`  ❌ Failed: HTTP ${response.statusCode}`, 'red');
      return;
    }
    
    const metaTags = extractMetaTags(response.body);
    const validation = validateMetaTags(url, metaTags);
    
    // Log findings
    log(`  Title: ${metaTags.title || 'NOT FOUND'}`, metaTags.title ? 'green' : 'red');
    log(`  Description: ${metaTags.description ? metaTags.description.substring(0, 60) + '...' : 'NOT FOUND'}`, metaTags.description ? 'green' : 'red');
    log(`  Canonical: ${metaTags.canonical || 'NOT FOUND'}`, metaTags.canonical ? 'green' : 'red');
    log(`  H1: ${metaTags.h1 || 'NOT FOUND'}`, metaTags.h1 ? 'green' : 'red');
    log(`  Structured Data: ${metaTags.structuredData} found`, metaTags.structuredData > 0 ? 'green' : 'yellow');
    
    // Record results
    if (validation.issues.length === 0 && validation.warnings.length === 0) {
      results.passed.push({ url, metaTags });
      log(`  ✅ PASSED`, 'green');
    } else {
      if (validation.issues.length > 0) {
        results.failed.push({ url, issues: validation.issues });
        validation.issues.forEach(issue => log(`  ${issue}`, 'red'));
      }
      if (validation.warnings.length > 0) {
        results.warnings.push({ url, warnings: validation.warnings });
        validation.warnings.forEach(warning => log(`  ${warning}`, 'yellow'));
      }
    }
  } catch (error) {
    results.failed.push({
      url,
      error: error.message,
    });
    log(`  ❌ Error: ${error.message}`, 'red');
  }
}

async function testRobotsTxt() {
  log(`\n🤖 Testing robots.txt`, 'blue');
  try {
    const response = await fetchPage(`${BASE_URL}/robots.txt`);
    if (response.statusCode === 200) {
      log(`  ✅ robots.txt found`, 'green');
      
      // Check for sitemap reference
      if (response.body.includes('Sitemap:')) {
        log(`  ✅ Sitemap reference found`, 'green');
      } else {
        results.warnings.push({
          url: '/robots.txt',
          warning: 'No sitemap reference in robots.txt',
        });
        log(`  ⚠️  No sitemap reference`, 'yellow');
      }
      
      // Check if it's minimal (per 2025 standards)
      const lines = response.body.split('\n').filter(line => line.trim() && !line.startsWith('#'));
      if (lines.length <= 10) {
        log(`  ✅ robots.txt is minimal (${lines.length} lines)`, 'green');
      } else {
        results.warnings.push({
          url: '/robots.txt',
          warning: `robots.txt may be too complex (${lines.length} lines)`,
        });
        log(`  ⚠️  robots.txt may be too complex (${lines.length} lines)`, 'yellow');
      }
    } else {
      results.failed.push({
        url: '/robots.txt',
        error: `HTTP ${response.statusCode}`,
      });
      log(`  ❌ robots.txt not found (HTTP ${response.statusCode})`, 'red');
    }
  } catch (error) {
    results.failed.push({
      url: '/robots.txt',
      error: error.message,
    });
    log(`  ❌ Error: ${error.message}`, 'red');
  }
}

async function testSitemap() {
  log(`\n🗺️  Testing sitemap.xml`, 'blue');
  try {
    const response = await fetchPage(`${BASE_URL}/sitemap.xml`);
    if (response.statusCode === 200) {
      log(`  ✅ sitemap.xml found`, 'green');
      
      // Count URLs
      const urlMatches = response.body.match(/<url>/g);
      const urlCount = urlMatches ? urlMatches.length : 0;
      log(`  📊 Found ${urlCount} URLs`, 'blue');
      
      // Check for lastmod dates
      const lastmodMatches = response.body.match(/<lastmod>/g);
      if (lastmodMatches && lastmodMatches.length > 0) {
        log(`  ✅ lastmod dates present`, 'green');
      } else {
        results.warnings.push({
          url: '/sitemap.xml',
          warning: 'No lastmod dates found',
        });
        log(`  ⚠️  No lastmod dates found`, 'yellow');
      }
    } else {
      results.warnings.push({
        url: '/sitemap.xml',
        warning: `sitemap.xml not found (HTTP ${response.statusCode})`,
      });
      log(`  ⚠️  sitemap.xml not found (HTTP ${response.statusCode})`, 'yellow');
    }
  } catch (error) {
    results.warnings.push({
      url: '/sitemap.xml',
      warning: error.message,
    });
    log(`  ⚠️  Error: ${error.message}`, 'yellow');
  }
}

async function runTests() {
  log('🚀 Starting SEO Audit for AliceSolutionsGroup & SmartStart', 'blue');
  log(`📍 Base URL: ${BASE_URL}\n`, 'blue');
  
  // Test robots.txt
  await testRobotsTxt();
  
  // Test sitemap
  await testSitemap();
  
  // Test all pages
  for (const path of PAGES_TO_TEST) {
    await testPage(path);
    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Print summary
  log('\n' + '='.repeat(60), 'blue');
  log('📊 SEO AUDIT SUMMARY', 'blue');
  log('='.repeat(60), 'blue');
  log(`✅ Passed: ${results.passed.length}`, 'green');
  log(`❌ Failed: ${results.failed.length}`, 'red');
  log(`⚠️  Warnings: ${results.warnings.length}`, 'yellow');
  
  if (results.failed.length > 0) {
    log('\n❌ FAILED TESTS:', 'red');
    results.failed.forEach(item => {
      log(`  ${item.url}`, 'red');
      if (item.issues) {
        item.issues.forEach(issue => log(`    ${issue}`, 'red'));
      }
      if (item.error) {
        log(`    Error: ${item.error}`, 'red');
      }
    });
  }
  
  if (results.warnings.length > 0) {
    log('\n⚠️  WARNINGS:', 'yellow');
    results.warnings.forEach(item => {
      log(`  ${item.url}`, 'yellow');
      if (item.warnings) {
        item.warnings.forEach(warning => log(`    ${warning}`, 'yellow'));
      }
      if (item.warning) {
        log(`    ${item.warning}`, 'yellow');
      }
    });
  }
  
  log('\n✅ Audit complete!', 'green');
  
  // Exit code based on results
  process.exit(results.failed.length > 0 ? 1 : 0);
}

// Run the tests
runTests().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  process.exit(1);
});

