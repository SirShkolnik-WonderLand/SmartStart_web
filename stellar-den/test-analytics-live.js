// Test analytics tracking on live site
console.log('=== Testing Analytics Tracking ===');

// Check cookies
const cookies = document.cookie.split(';').map(c => c.trim());
console.log('\nCookies:', cookies.filter(c => c.includes('consent')));

// Check if analytics consent is given
function hasAnalyticsConsent() {
  try {
    const cookie = document.cookie.split(';').find(c => c.trim().startsWith('asg_consent_preferences='));
    if (!cookie) {
      console.log('No consent cookie found');
      return false;
    }
    const value = cookie.split('=')[1];
    const parsed = JSON.parse(decodeURIComponent(value));
    console.log('Consent preferences:', parsed);
    return parsed.analytics === true;
  } catch (e) {
    console.log('Error parsing consent:', e);
    return false;
  }
}

const hasConsent = hasAnalyticsConsent();
console.log('\nHas analytics consent:', hasConsent);

// Check if tracker is loaded
console.log('\nAnalytics Hub available:', typeof window.analyticsHub);
if (window.analyticsHub) {
  console.log('Tracking pageview...');
  window.analyticsHub.trackPageView();
}
