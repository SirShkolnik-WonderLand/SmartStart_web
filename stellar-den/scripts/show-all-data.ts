/**
 * SHOW ALL DATA
 * Display ALL leads and analytics data regardless of date
 */

import { analyticsStorage } from '../server/services/analyticsStorage.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function showAllData() {
  console.log('📊 ALL DATA REPORT\n');
  console.log('='.repeat(60));

  // Show ALL leads
  const allLeads = analyticsStorage.getAllLeads();
  console.log(`\n📋 TOTAL LEADS IN STORAGE: ${allLeads.length}\n`);

  if (allLeads.length > 0) {
    console.log('All Leads (sorted by date):');
    allLeads
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .forEach((lead, idx) => {
        const date = new Date(lead.timestamp);
        console.log(`\n${idx + 1}. ${lead.name} (${lead.email})`);
        console.log(`   Date: ${date.toLocaleString()} (${date.toISOString()})`);
        console.log(`   Service: ${lead.service || 'N/A'}`);
        console.log(`   Source: ${lead.referrer || 'Direct'}`);
        console.log(`   Page: ${lead.pageUrl || 'N/A'}`);
        console.log(`   Company: ${lead.company || 'N/A'}`);
      });
  } else {
    console.log('⚠️  NO LEADS FOUND IN STORAGE!');
    console.log('\nThis means either:');
    console.log('1. No contact forms have been submitted');
    console.log('2. Contact forms are not calling storeLead()');
    console.log('3. Data is stored in a different location');
    console.log('4. File permissions issue');
  }

  // Check file directly
  const dataDir = path.join(__dirname, '../server/data/analytics');
  const leadsFile = path.join(dataDir, 'leads.json');
  
  console.log(`\n📁 Storage File Info:`);
  console.log(`   Path: ${leadsFile}`);
  console.log(`   Exists: ${fs.existsSync(leadsFile) ? '✅' : '❌'}`);
  
  if (fs.existsSync(leadsFile)) {
    const stats = fs.statSync(leadsFile);
    console.log(`   Size: ${stats.size} bytes`);
    console.log(`   Modified: ${stats.mtime.toLocaleString()}`);
    
    try {
      const fileContent = fs.readFileSync(leadsFile, 'utf-8');
      const parsed = JSON.parse(fileContent);
      console.log(`   Leads in file: ${Array.isArray(parsed) ? parsed.length : 'Invalid format'}`);
    } catch (e) {
      console.log(`   Error reading file: ${e}`);
    }
  }

  // Check daily summaries
  const summaries = analyticsStorage.getDailySummaries(
    new Date('2020-01-01'),
    new Date('2030-12-31')
  );
  console.log(`\n📈 Daily Summaries: ${summaries.length}`);
  if (summaries.length > 0) {
    summaries.slice(-10).forEach(summary => {
      console.log(`   ${summary.date}: ${summary.totalVisitors} visitors, ${summary.totalPageViews} pageviews, ${summary.totalLeads} leads`);
    });
  }

  console.log('\n' + '='.repeat(60));
}

showAllData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });

