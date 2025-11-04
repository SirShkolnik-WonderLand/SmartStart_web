/**
 * TEST LEAD STORAGE
 * Test if leads can be stored and retrieved
 */

import { analyticsStorage } from '../server/services/analyticsStorage.js';

async function testStorage() {
  console.log('🧪 Testing Lead Storage...\n');

  // Test storing a lead
  console.log('1. Testing lead storage...');
  try {
    const testLead = await analyticsStorage.storeLead({
      name: 'Test User',
      email: 'test@example.com',
      company: 'Test Company',
      phone: '123-456-7890',
      service: 'ISO 27001',
      message: 'This is a test lead',
      mailingList: true,
      pageUrl: 'https://alicesolutionsgroup.com/services',
      referrer: 'Google',
      userAgent: 'Mozilla/5.0',
      timezone: 'America/Toronto',
    });
    console.log(`✅ Lead stored: ${testLead.id} at ${testLead.timestamp}`);
  } catch (error) {
    console.error('❌ Failed to store lead:', error);
    return;
  }

  // Test retrieving all leads
  console.log('\n2. Testing lead retrieval...');
  try {
    const allLeads = analyticsStorage.getAllLeads();
    console.log(`✅ Retrieved ${allLeads.length} total leads`);
    if (allLeads.length > 0) {
      console.log(`   Latest: ${allLeads[allLeads.length - 1].name} (${allLeads[allLeads.length - 1].email})`);
    }
  } catch (error) {
    console.error('❌ Failed to retrieve leads:', error);
    return;
  }

  // Test date range query
  console.log('\n3. Testing date range query...');
  try {
    const today = new Date();
    const startOfToday = new Date(today);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);
    
    const todayLeads = analyticsStorage.getLeads(startOfToday, endOfToday);
    console.log(`✅ Found ${todayLeads.length} leads for today`);
    console.log(`   Date range: ${startOfToday.toISOString()} to ${endOfToday.toISOString()}`);
  } catch (error) {
    console.error('❌ Failed to query leads by date:', error);
    return;
  }

  console.log('\n✅ All storage tests passed!');
}

testStorage()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });

