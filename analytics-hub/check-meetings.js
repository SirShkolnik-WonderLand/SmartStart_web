/**
 * CHECK FOR MEETING REQUESTS
 * Query the database for any contact form submissions or meeting requests
 */

import { query } from './server/config/database.ts';

async function checkForMeetingRequests() {
  console.log('🔍 Checking for meeting requests and contact form submissions...\n');
  
  try {
    // Check for contact form submissions
    console.log('📧 Contact Form Submissions:');
    const contactForms = await query(`
      SELECT 
        created_at,
        event_name,
        page_url,
        page_title,
        custom_properties->>'name' as name,
        custom_properties->>'email' as email,
        custom_properties->>'phone' as phone,
        custom_properties->>'company' as company,
        custom_properties->>'message' as message,
        custom_properties->>'service' as service,
        country_name,
        city
      FROM analytics_events 
      WHERE event_type = 'form_submit' 
        AND (event_name LIKE '%contact%' OR event_name LIKE '%meeting%' OR event_name LIKE '%book%')
      ORDER BY created_at DESC 
      LIMIT 10
    `);
    
    if (contactForms.length === 0) {
      console.log('   No contact form submissions found.\n');
    } else {
      contactForms.forEach((form, index) => {
        console.log(`   ${index + 1}. ${form.created_at} - ${form.event_name}`);
        console.log(`      Name: ${form.name || 'N/A'}`);
        console.log(`      Email: ${form.email || 'N/A'}`);
        console.log(`      Phone: ${form.phone || 'N/A'}`);
        console.log(`      Company: ${form.company || 'N/A'}`);
        console.log(`      Service: ${form.service || 'N/A'}`);
        console.log(`      Location: ${form.city || 'N/A'}, ${form.country_name || 'N/A'}`);
        console.log(`      Message: ${form.message ? form.message.substring(0, 100) + '...' : 'N/A'}`);
        console.log(`      Page: ${form.page_url}`);
        console.log('');
      });
    }

    // Check for "Book a Call" events
    console.log('📞 Book a Call Events:');
    const bookCallEvents = await query(`
      SELECT 
        created_at,
        event_name,
        page_url,
        page_title,
        custom_properties->>'name' as name,
        custom_properties->>'email' as email,
        custom_properties->>'phone' as phone,
        country_name,
        city
      FROM analytics_events 
      WHERE event_type = 'click' 
        AND (event_name LIKE '%book%call%' OR event_name LIKE '%schedule%' OR event_name LIKE '%meeting%')
      ORDER BY created_at DESC 
      LIMIT 10
    `);
    
    if (bookCallEvents.length === 0) {
      console.log('   No "Book a Call" events found.\n');
    } else {
      bookCallEvents.forEach((event, index) => {
        console.log(`   ${index + 1}. ${event.created_at} - ${event.event_name}`);
        console.log(`      Name: ${event.name || 'N/A'}`);
        console.log(`      Email: ${event.email || 'N/A'}`);
        console.log(`      Phone: ${event.phone || 'N/A'}`);
        console.log(`      Location: ${event.city || 'N/A'}, ${event.country_name || 'N/A'}`);
        console.log(`      Page: ${event.page_url}`);
        console.log('');
      });
    }

    // Check for conversion goals
    console.log('🎯 Recent Conversions:');
    const conversions = await query(`
      SELECT 
        created_at,
        event_name,
        event_value,
        page_url,
        page_title,
        custom_properties->>'name' as name,
        custom_properties->>'email' as email,
        country_name,
        city
      FROM analytics_events 
      WHERE event_category = 'conversion'
      ORDER BY created_at DESC 
      LIMIT 10
    `);
    
    if (conversions.length === 0) {
      console.log('   No conversions found.\n');
    } else {
      conversions.forEach((conversion, index) => {
        console.log(`   ${index + 1}. ${conversion.created_at} - ${conversion.event_name}`);
        console.log(`      Value: $${conversion.event_value || '0'}`);
        console.log(`      Name: ${conversion.name || 'N/A'}`);
        console.log(`      Email: ${conversion.email || 'N/A'}`);
        console.log(`      Location: ${conversion.city || 'N/A'}, ${conversion.country_name || 'N/A'}`);
        console.log(`      Page: ${conversion.page_url}`);
        console.log('');
      });
    }

    // Check for any events with meeting-related keywords
    console.log('🔍 All Meeting-Related Events:');
    const meetingEvents = await query(`
      SELECT 
        created_at,
        event_type,
        event_name,
        page_url,
        page_title,
        custom_properties,
        country_name,
        city
      FROM analytics_events 
      WHERE (
        event_name ILIKE '%meeting%' OR 
        event_name ILIKE '%schedule%' OR 
        event_name ILIKE '%book%' OR 
        event_name ILIKE '%call%' OR
        event_name ILIKE '%appointment%' OR
        custom_properties::text ILIKE '%meeting%' OR
        custom_properties::text ILIKE '%schedule%' OR
        custom_properties::text ILIKE '%book%' OR
        custom_properties::text ILIKE '%call%'
      )
      ORDER BY created_at DESC 
      LIMIT 20
    `);
    
    if (meetingEvents.length === 0) {
      console.log('   No meeting-related events found.\n');
    } else {
      meetingEvents.forEach((event, index) => {
        console.log(`   ${index + 1}. ${event.created_at} - ${event.event_type}: ${event.event_name}`);
        console.log(`      Page: ${event.page_url}`);
        console.log(`      Location: ${event.city || 'N/A'}, ${event.country_name || 'N/A'}`);
        if (event.custom_properties) {
          console.log(`      Properties: ${JSON.stringify(event.custom_properties, null, 2)}`);
        }
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Error checking for meeting requests:', error);
  }
}

// Run the check
checkForMeetingRequests().then(() => {
  console.log('✅ Meeting request check completed!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Failed to check meeting requests:', error);
  process.exit(1);
});
