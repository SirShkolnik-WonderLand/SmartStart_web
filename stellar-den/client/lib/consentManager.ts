/**
 * COOKIE CONSENT UTILITIES
 * Manages cookie consent preferences for GDPR/PIPEDA/CCPA compliance
 */

export type ConsentCategory = 'essential' | 'analytics' | 'marketing';

export interface ConsentPreferences {
  essential: boolean; // Always true, cannot be disabled
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
  version: string;
}

const CONSENT_COOKIE_NAME = 'asg_consent_preferences';
const CONSENT_VERSION = '1.0';
const CONSENT_EXPIRY_DAYS = 365;

class ConsentManager {
  /**
   * Get current consent preferences
   */
  getConsentPreferences(): ConsentPreferences | null {
    if (typeof window === 'undefined') return null;

    try {
      const cookie = this.getCookie(CONSENT_COOKIE_NAME);
      if (!cookie) return null;

      const preferences = JSON.parse(cookie) as ConsentPreferences;
      
      // Check if consent is expired or version mismatch
      if (preferences.version !== CONSENT_VERSION) {
        return null;
      }

      return preferences;
    } catch (error) {
      console.error('Error reading consent preferences:', error);
      return null;
    }
  }

  /**
   * Check if user has given consent for a specific category
   */
  hasConsent(category: ConsentCategory): boolean {
    const preferences = this.getConsentPreferences();
    if (!preferences) return false;

    // Essential cookies are always allowed
    if (category === 'essential') return true;

    return preferences[category] === true;
  }

  /**
   * Check if user has given any consent
   */
  hasAnyConsent(): boolean {
    const preferences = this.getConsentPreferences();
    return preferences !== null;
  }

  /**
   * Save consent preferences
   */
  saveConsentPreferences(preferences: Partial<ConsentPreferences>): void {
    if (typeof window === 'undefined') return;

    const fullPreferences: ConsentPreferences = {
      essential: true, // Always true
      analytics: preferences.analytics ?? false,
      marketing: preferences.marketing ?? false,
      timestamp: new Date().toISOString(),
      version: CONSENT_VERSION,
    };

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + CONSENT_EXPIRY_DAYS);

    const cookieValue = JSON.stringify(fullPreferences);
    this.setCookie(CONSENT_COOKIE_NAME, cookieValue, expiryDate);

    // Dispatch event for other components to listen
    window.dispatchEvent(new CustomEvent('consentUpdated', { detail: fullPreferences }));
  }

  /**
   * Accept all cookies
   */
  acceptAll(): void {
    this.saveConsentPreferences({
      analytics: true,
      marketing: true,
    });
  }

  /**
   * Reject all non-essential cookies
   */
  rejectAll(): void {
    this.saveConsentPreferences({
      analytics: false,
      marketing: false,
    });
  }

  /**
   * Reset consent (clear cookie)
   */
  resetConsent(): void {
    if (typeof window === 'undefined') return;
    this.deleteCookie(CONSENT_COOKIE_NAME);
    window.dispatchEvent(new CustomEvent('consentUpdated', { detail: null }));
  }

  /**
   * Get cookie value
   */
  private getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    
    return null;
  }

  /**
   * Set cookie
   */
  private setCookie(name: string, value: string, expiryDate: Date): void {
    if (typeof document === 'undefined') return;
    
    const expires = `expires=${expiryDate.toUTCString()}`;
    const sameSite = 'SameSite=Lax';
    const secure = window.location.protocol === 'https:' ? 'Secure' : '';
    
    document.cookie = `${name}=${value}; ${expires}; path=/; ${sameSite}; ${secure}`;
  }

  /**
   * Delete cookie
   */
  private deleteCookie(name: string): void {
    if (typeof document === 'undefined') return;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
}

export const consentManager = new ConsentManager();

