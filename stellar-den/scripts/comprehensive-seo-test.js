#!/usr/bin/env node
/**
 * Comprehensive SEO Testing Script
 * Tests: Meta tags, Keywords, Google Business signals, Performance, Structured Data
 */

const https = require('https');
const http = require('http');
const { performance } = require('perf_hooks');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const PAGES_TO_TEST = [
  { path: '/', name: 'Homepage' },
  { path: '/smartstart', name: 'SmartStart' },
  { path: '/smartstart-venture-building', name: 'Venture Building' },
  { path: '/about', name: 'About' },
  { path: '/services', name: 'Services' },
  { path: '/contact', name: 'Contact' },
];

const results = {
  pages: {},
  summary: {
    passed: 0,
    failed: 0,
    warnings: 0,
  },
};

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const startTime = performance.now();
    const client = url.startsWith('https') ? https : http;
    
    client.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        const endTime = performance.now();
        resolve({
          statusCode: res.statusCode,
          body: data,
          headers: res.headers,
          loadTime: endTime - startTime,
        });
      });
    }).on('error', reject);
  });
}

function extractSEOData(html, url) {
  const data = {
    url,
    loadTime: null,
    title: null,
    titleLength: 0,
    description: null,
    descriptionLength: 0,
    keywords: null,
    canonical: null,
    ogTags: {},
    twitterTags: {},
    h1: null,
    h2: [],
    h3: [],
    structuredData: [],
    images: [],
    links: [],
    wordCount: 0,
    geoTags: {},
    googleBusinessKeywords: [],
    issues: [],
    warnings: [],
    performance: {},
  };

  // Title tag
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) {
    data.title = titleMatch[1].trim();
    data.titleLength = data.title.length;
  }

  // Meta description
  const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
  if (descMatch) {
    data.description = descMatch[1].trim();
    data.descriptionLength = data.description.length;
  }

  // Meta keywords
  const keywordsMatch = html.match(/<meta\s+name=["']keywords["']\s+content=["']([^"']+)["']/i);
  if (keywordsMatch) {
    data.keywords = keywordsMatch[1].trim();
    data.googleBusinessKeywords = data.keywords.split(',').map(k => k.trim());
  }

  // Canonical URL
  const canonicalMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
  if (canonicalMatch) {
    data.canonical = canonicalMatch[1].trim();
  }

  // Open Graph tags
  const ogTags = {
    type: html.match(/<meta\s+property=["']og:type["']\s+content=["']([^"']+)["']/i)?.[1],
    url: html.match(/<meta\s+property=["']og:url["']\s+content=["']([^"']+)["']/i)?.[1],
    title: html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i)?.[1],
    description: html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i)?.[1],
    image: html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i)?.[1],
    site_name: html.match(/<meta\s+property=["']og:site_name["']\s+content=["']([^"']+)["']/i)?.[1],
    locale: html.match(/<meta\s+property=["']og:locale["']\s+content=["']([^"']+)["']/i)?.[1],
  };
  data.ogTags = ogTags;

  // Twitter Card tags
  const twitterTags = {
    card: html.match(/<meta\s+property=["']twitter:card["']\s+content=["']([^"']+)["']/i)?.[1],
    url: html.match(/<meta\s+property=["']twitter:url["']\s+content=["']([^"']+)["']/i)?.[1],
    title: html.match(/<meta\s+property=["']twitter:title["']\s+content=["']([^"']+)["']/i)?.[1],
    description: html.match(/<meta\s+property=["']twitter:description["']\s+content=["']([^"']+)["']/i)?.[1],
    image: html.match(/<meta\s+property=["']twitter:image["']\s+content=["']([^"']+)["']/i)?.[1],
  };
  data.twitterTags = twitterTags;

  // Geographic meta tags (Google Business signals)
  data.geoTags = {
    region: html.match(/<meta\s+name=["']geo\.region["']\s+content=["']([^"']+)["']/i)?.[1],
    placename: html.match(/<meta\s+name=["']geo\.placename["']\s+content=["']([^"']+)["']/i)?.[1],
    position: html.match(/<meta\s+name=["']geo\.position["']\s+content=["']([^"']+)["']/i)?.[1],
    ICBM: html.match(/<meta\s+name=["']ICBM["']\s+content=["']([^"']+)["']/i)?.[1],
  };

  // Heading tags
  const h1Matches = html.match(/<h1[^>]*>([^<]+)<\/h1>/gi);
  if (h1Matches) {
    data.h1 = h1Matches[0].replace(/<[^>]+>/g, '').trim();
  }

  const h2Matches = html.match(/<h2[^>]*>([^<]+)<\/h2>/gi);
  if (h2Matches) {
    data.h2 = h2Matches.map(h => h.replace(/<[^>]+>/g, '').trim());
  }

  const h3Matches = html.match(/<h3[^>]*>([^<]+)<\/h3>/gi);
  if (h3Matches) {
    data.h3 = h3Matches.map(h => h.replace(/<[^>]+>/g, '').trim());
  }

  // Structured Data (JSON-LD)
  const jsonLdMatches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  if (jsonLdMatches) {
    jsonLdMatches.forEach(match => {
      try {
        const jsonStr = match.replace(/<script[^>]*>|<\/script>/gi, '').trim();
        const jsonData = JSON.parse(jsonStr);
        data.structuredData.push(jsonData);
      } catch (e) {
        // Invalid JSON
      }
    });
  }

  // Images with alt text
  const imageMatches = html.match(/<img[^>]*>/gi);
  if (imageMatches) {
    data.images = imageMatches.map(img => {
      const srcMatch = img.match(/src=["']([^"']+)["']/i);
      const altMatch = img.match(/alt=["']([^"']*)["']/i);
      return {
        src: srcMatch ? srcMatch[1] : null,
        alt: altMatch ? altMatch[1] : null,
        hasAlt: !!altMatch,
      };
    });
  }

  // Word count (approximate, from visible text)
  const textContent = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  data.wordCount = textContent.split(/\s+/).filter(w => w.length > 0).length;

  return data;
}

function validateSEO(data) {
  const issues = [];
  const warnings = [];

  // Title validation
  if (!data.title) {
    issues.push('❌ Missing title tag');
  } else {
    if (data.titleLength < 30) {
      warnings.push(`⚠️  Title too short (${data.titleLength} chars, recommend 50-60)`);
    } else if (data.titleLength > 60) {
      warnings.push(`⚠️  Title too long (${data.titleLength} chars, recommend 50-60)`);
    }
    // Check for Google Business keywords
    const titleLower = data.title.toLowerCase();
    if (!titleLower.includes('toronto') && !titleLower.includes('gta') && !titleLower.includes('alicesolutionsgroup')) {
      warnings.push('⚠️  Title missing location or brand keywords');
    }
  }

  // Meta description validation
  if (!data.description) {
    issues.push('❌ Missing meta description');
  } else {
    if (data.descriptionLength < 120) {
      warnings.push(`⚠️  Description too short (${data.descriptionLength} chars, recommend 150-160)`);
    } else if (data.descriptionLength > 160) {
      warnings.push(`⚠️  Description too long (${data.descriptionLength} chars, recommend 150-160)`);
    }
  }

  // Keywords validation
  if (!data.keywords) {
    warnings.push('⚠️  Missing meta keywords tag');
  } else {
    const keywords = data.keywords.toLowerCase();
    const importantKeywords = ['toronto', 'gta', 'ontario', 'canada', 'cybersecurity', 'iso 27001'];
    const foundKeywords = importantKeywords.filter(kw => keywords.includes(kw));
    if (foundKeywords.length === 0) {
      warnings.push('⚠️  Missing important Google Business keywords');
    }
  }

  // Canonical URL validation
  if (!data.canonical) {
    issues.push('❌ Missing canonical URL');
  }

  // Open Graph validation
  if (!data.ogTags.title) {
    issues.push('❌ Missing Open Graph title');
  }
  if (!data.ogTags.description) {
    issues.push('❌ Missing Open Graph description');
  }
  if (!data.ogTags.image) {
    warnings.push('⚠️  Missing Open Graph image');
  }

  // Twitter Card validation
  if (!data.twitterTags.card) {
    warnings.push('⚠️  Missing Twitter Card');
  }

  // H1 validation
  if (!data.h1) {
    issues.push('❌ Missing H1 tag');
  }

  // Structured Data validation
  if (data.structuredData.length === 0) {
    warnings.push('⚠️  No structured data (JSON-LD) found');
  } else {
    const hasOrganization = data.structuredData.some(sd => 
      sd['@type'] === 'Organization' || sd['@type'] === 'LocalBusiness'
    );
    if (!hasOrganization) {
      warnings.push('⚠️  Missing Organization or LocalBusiness schema');
    }
  }

  // Google Business signals
  if (!data.geoTags.region || !data.geoTags.placename) {
    warnings.push('⚠️  Missing geographic meta tags (Google Business signals)');
  }

  // Images without alt text
  const imagesWithoutAlt = data.images.filter(img => !img.hasAlt);
  if (imagesWithoutAlt.length > 0) {
    warnings.push(`⚠️  ${imagesWithoutAlt.length} image(s) missing alt text`);
  }

  // Performance
  if (data.loadTime > 3000) {
    warnings.push(`⚠️  Page load time slow (${Math.round(data.loadTime)}ms, recommend < 3s)`);
  }

  // Content quality
  if (data.wordCount < 300) {
    warnings.push(`⚠️  Low word count (${data.wordCount} words, recommend > 300)`);
  }

  return { issues, warnings };
}

async function testPage(pageInfo) {
  const url = `${BASE_URL}${pageInfo.path}`;
  log(`\n${'='.repeat(80)}`, 'cyan');
  log(`📄 Testing: ${pageInfo.name}`, 'cyan');
  log(`📍 URL: ${url}`, 'blue');
  log('='.repeat(80), 'cyan');

  try {
    const response = await fetchPage(url);
    const seoData = extractSEOData(response.body, url);
    seoData.loadTime = response.loadTime;

    const validation = validateSEO(seoData);

    // Display results
    log(`\n📊 SEO METADATA:`, 'magenta');
    log(`  Title: ${seoData.title || 'NOT FOUND'}`, seoData.title ? 'green' : 'red');
    log(`  Title Length: ${seoData.titleLength} chars`, seoData.titleLength >= 50 && seoData.titleLength <= 60 ? 'green' : 'yellow');
    log(`  Description: ${seoData.description ? seoData.description.substring(0, 80) + '...' : 'NOT FOUND'}`, seoData.description ? 'green' : 'red');
    log(`  Description Length: ${seoData.descriptionLength} chars`, seoData.descriptionLength >= 150 && seoData.descriptionLength <= 160 ? 'green' : 'yellow');
    log(`  Keywords: ${seoData.keywords || 'NOT FOUND'}`, seoData.keywords ? 'green' : 'yellow');
    log(`  Canonical: ${seoData.canonical || 'NOT FOUND'}`, seoData.canonical ? 'green' : 'red');
    log(`  H1: ${seoData.h1 || 'NOT FOUND'}`, seoData.h1 ? 'green' : 'red');
    log(`  Word Count: ${seoData.wordCount} words`, seoData.wordCount >= 300 ? 'green' : 'yellow');

    log(`\n🌐 OPEN GRAPH TAGS:`, 'magenta');
    Object.entries(seoData.ogTags).forEach(([key, value]) => {
      log(`  og:${key}: ${value || 'NOT FOUND'}`, value ? 'green' : 'yellow');
    });

    log(`\n🐦 TWITTER CARDS:`, 'magenta');
    Object.entries(seoData.twitterTags).forEach(([key, value]) => {
      log(`  twitter:${key}: ${value || 'NOT FOUND'}`, value ? 'green' : 'yellow');
    });

    log(`\n📍 GOOGLE BUSINESS SIGNALS:`, 'magenta');
    log(`  geo.region: ${seoData.geoTags.region || 'NOT FOUND'}`, seoData.geoTags.region ? 'green' : 'yellow');
    log(`  geo.placename: ${seoData.geoTags.placename || 'NOT FOUND'}`, seoData.geoTags.placename ? 'green' : 'yellow');
    log(`  geo.position: ${seoData.geoTags.position || 'NOT FOUND'}`, seoData.geoTags.position ? 'green' : 'yellow');
    log(`  Google Business Keywords Found: ${seoData.googleBusinessKeywords.length > 0 ? seoData.googleBusinessKeywords.join(', ') : 'NONE'}`, seoData.googleBusinessKeywords.length > 0 ? 'green' : 'yellow');

    log(`\n📋 STRUCTURED DATA:`, 'magenta');
    if (seoData.structuredData.length > 0) {
      seoData.structuredData.forEach((sd, idx) => {
        log(`  Schema ${idx + 1}: ${sd['@type'] || 'Unknown'}`, 'green');
        if (sd['@type'] === 'Service') {
          log(`    Name: ${sd.name || 'N/A'}`, 'cyan');
          log(`    Price: ${sd.offers?.price || 'N/A'} ${sd.offers?.priceCurrency || ''}`, 'cyan');
        }
      });
    } else {
      log(`  No structured data found`, 'yellow');
    }

    log(`\n⚡ PERFORMANCE:`, 'magenta');
    log(`  Load Time: ${Math.round(seoData.loadTime)}ms`, seoData.loadTime < 3000 ? 'green' : 'yellow');
    log(`  Images: ${seoData.images.length} total, ${seoData.images.filter(i => !i.hasAlt).length} missing alt text`, seoData.images.filter(i => !i.hasAlt).length === 0 ? 'green' : 'yellow');

    log(`\n📝 HEADINGS:`, 'magenta');
    log(`  H1: ${seoData.h1 || 'NOT FOUND'}`, seoData.h1 ? 'green' : 'red');
    log(`  H2 Count: ${seoData.h2.length}`, seoData.h2.length > 0 ? 'green' : 'yellow');
    log(`  H3 Count: ${seoData.h3.length}`, 'blue');

    // Validation results
    if (validation.issues.length > 0) {
      log(`\n❌ ISSUES:`, 'red');
      validation.issues.forEach(issue => log(`  ${issue}`, 'red'));
      results.summary.failed++;
    } else {
      results.summary.passed++;
    }

    if (validation.warnings.length > 0) {
      log(`\n⚠️  WARNINGS:`, 'yellow');
      validation.warnings.forEach(warning => log(`  ${warning}`, 'yellow'));
      results.summary.warnings += validation.warnings.length;
    }

    results.pages[pageInfo.path] = {
      ...seoData,
      validation,
    };

  } catch (error) {
    log(`\n❌ ERROR: ${error.message}`, 'red');
    results.summary.failed++;
    results.pages[pageInfo.path] = { error: error.message };
  }
}

async function runTests() {
  log('\n🚀 COMPREHENSIVE SEO TESTING', 'cyan');
  log('='.repeat(80), 'cyan');
  log(`📍 Testing Base URL: ${BASE_URL}`, 'blue');
  log(`📊 Pages to Test: ${PAGES_TO_TEST.length}`, 'blue');
  log('='.repeat(80), 'cyan');

  for (const pageInfo of PAGES_TO_TEST) {
    await testPage(pageInfo);
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Summary
  log('\n' + '='.repeat(80), 'cyan');
  log('📊 COMPREHENSIVE SEO TEST SUMMARY', 'cyan');
  log('='.repeat(80), 'cyan');
  log(`✅ Passed: ${results.summary.passed}`, 'green');
  log(`❌ Failed: ${results.summary.failed}`, 'red');
  log(`⚠️  Warnings: ${results.summary.warnings}`, 'yellow');

  // Detailed summary by page
  log(`\n📋 PAGE-BY-PAGE SUMMARY:`, 'magenta');
  Object.entries(results.pages).forEach(([path, data]) => {
    if (data.error) {
      log(`  ${path}: ❌ ERROR - ${data.error}`, 'red');
    } else {
      const status = data.validation.issues.length === 0 ? '✅' : '❌';
      log(`  ${path}: ${status} ${data.validation.issues.length} issues, ${data.validation.warnings.length} warnings`, 
        data.validation.issues.length === 0 ? 'green' : 'red');
    }
  });

  log('\n✅ Testing complete!', 'green');
  process.exit(results.summary.failed > 0 ? 1 : 0);
}

runTests().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  process.exit(1);
});
