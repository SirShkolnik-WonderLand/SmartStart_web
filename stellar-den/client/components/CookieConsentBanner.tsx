/**
 * COOKIE CONSENT BANNER
 * GDPR/PIPEDA/CCPA compliant cookie consent banner
 */

import { useState, useEffect } from 'react';
import { X, Cookie, Settings, Shield, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { consentManager, ConsentPreferences } from '@/lib/consentManager';

export default function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferenceCenter, setShowPreferenceCenter] = useState(false);
  const [preferences, setPreferences] = useState<ConsentPreferences | null>(null);

  useEffect(() => {
    // Check if user has already given consent
    const hasConsent = consentManager.hasAnyConsent();
    if (!hasConsent) {
      // Small delay to avoid flashing banner
      setTimeout(() => setShowBanner(true), 500);
    }

    // Load current preferences
    const currentPreferences = consentManager.getConsentPreferences();
    setPreferences(currentPreferences);

    // Listen for consent updates
    const handleConsentUpdate = (event: CustomEvent) => {
      setPreferences(event.detail);
      if (event.detail) {
        setShowBanner(false);
      }
    };

    // Listen for open preferences request (from footer)
    const handleOpenPreferences = () => {
      setShowPreferenceCenter(true);
    };

    window.addEventListener('consentUpdated', handleConsentUpdate as EventListener);
    window.addEventListener('openCookiePreferences', handleOpenPreferences);

    return () => {
      window.removeEventListener('consentUpdated', handleConsentUpdate as EventListener);
      window.removeEventListener('openCookiePreferences', handleOpenPreferences);
    };
  }, []);

  const handleAcceptAll = () => {
    consentManager.acceptAll();
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    consentManager.rejectAll();
    setShowBanner(false);
  };

  const handleManagePreferences = () => {
    setShowPreferenceCenter(true);
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Blur Overlay - Covers entire page until consent is given */}
      <div 
        className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
        aria-hidden="true"
      />
      
      {/* Cookie Consent Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-start gap-3">
                <Cookie className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-foreground mb-1">
                    We Use Cookies
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    We use cookies to enhance your browsing experience, serve personalized content, 
                    and analyze our traffic. By clicking "Accept All", you consent to our use of cookies. 
                    You can manage your preferences or learn more in our{' '}
                    <a 
                      href="/legal/cookie-policy" 
                      className="text-primary hover:underline font-medium"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Cookie Policy
                    </a>
                    {' '}and{' '}
                    <a 
                      href="/legal/privacy-policy" 
                      className="text-primary hover:underline font-medium"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Privacy Policy
                    </a>
                    .
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <Button
                onClick={handleManagePreferences}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                <Settings className="w-3 h-3 mr-1" />
                Manage Preferences
              </Button>
              <Button
                onClick={handleRejectAll}
                variant="ghost"
                size="sm"
                className="text-xs"
              >
                Reject All
              </Button>
              <Button
                onClick={handleAcceptAll}
                size="sm"
                className="text-xs bg-primary hover:bg-primary/90"
              >
                Accept All
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Preference Center Modal */}
      {showPreferenceCenter && (
        <CookiePreferenceCenter
          isOpen={showPreferenceCenter}
          onClose={() => setShowPreferenceCenter(false)}
          preferences={preferences}
          onSave={(prefs) => {
            consentManager.saveConsentPreferences(prefs);
            setShowPreferenceCenter(false);
            setShowBanner(false);
          }}
        />
      )}
    </>
  );
}

interface CookiePreferenceCenterProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: ConsentPreferences | null;
  onSave: (preferences: Partial<ConsentPreferences>) => void;
}

function CookiePreferenceCenter({ isOpen, onClose, preferences, onSave }: CookiePreferenceCenterProps) {
  const [localPreferences, setLocalPreferences] = useState({
    analytics: preferences?.analytics ?? false,
    marketing: preferences?.marketing ?? false,
  });

  useEffect(() => {
    if (preferences) {
      setLocalPreferences({
        analytics: preferences.analytics,
        marketing: preferences.marketing,
      });
    }
  }, [preferences]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-background border border-border rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">
                Cookie Preferences
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Description */}
          <p className="text-muted-foreground mb-6">
            Manage your cookie preferences. Essential cookies are required for the website to function 
            and cannot be disabled. You can enable or disable other cookie categories below.
          </p>

          {/* Essential Cookies */}
          <div className="border border-border rounded-lg p-4 mb-4 bg-muted/30">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-foreground">Essential Cookies</h3>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Required</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  These cookies are necessary for the website to function properly. They enable core 
                  functionality such as security, network management, and accessibility.
                </p>
                <p className="text-xs text-muted-foreground">
                  <strong>Examples:</strong> Authentication, security, load balancing, cookie consent preferences
                </p>
              </div>
              <div className="ml-4">
                <input
                  type="checkbox"
                  checked={true}
                  disabled={true}
                  className="w-5 h-5 rounded border-input"
                />
              </div>
            </div>
          </div>

          {/* Analytics Cookies */}
          <div className="border border-border rounded-lg p-4 mb-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-foreground">Analytics Cookies</h3>
                  <span className="text-xs bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded">Optional</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  These cookies help us understand how visitors interact with our website by collecting 
                  and reporting information anonymously. We use this information to improve our website and services.
                </p>
                <p className="text-xs text-muted-foreground">
                  <strong>Examples:</strong> Page views, user behavior, session duration, traffic sources
                </p>
              </div>
              <div className="ml-4">
                <input
                  type="checkbox"
                  checked={localPreferences.analytics}
                  onChange={(e) => setLocalPreferences({ ...localPreferences, analytics: e.target.checked })}
                  className="w-5 h-5 rounded border-input text-primary focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Marketing Cookies */}
          <div className="border border-border rounded-lg p-4 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-foreground">Marketing Cookies</h3>
                  <span className="text-xs bg-purple-500/10 text-purple-500 px-2 py-0.5 rounded">Optional</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  These cookies may be used to deliver relevant advertisements and track campaign performance. 
                  They may be set by our advertising partners.
                </p>
                <p className="text-xs text-muted-foreground">
                  <strong>Examples:</strong> Social media tracking, retargeting, campaign measurement
                </p>
              </div>
              <div className="ml-4">
                <input
                  type="checkbox"
                  checked={localPreferences.marketing}
                  onChange={(e) => setLocalPreferences({ ...localPreferences, marketing: e.target.checked })}
                  className="w-5 h-5 rounded border-input text-primary focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Your Rights:</strong> You have the right to withdraw your consent 
                  at any time. You can also manage cookies through your browser settings. For more information, 
                  see our{' '}
                  <a href="/legal/privacy-policy" className="text-primary hover:underline">
                    Privacy Policy
                  </a>{' '}
                  and{' '}
                  <a href="/legal/cookie-policy" className="text-primary hover:underline">
                    Cookie Policy
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
            <Button
              onClick={() => {
                setLocalPreferences({ analytics: false, marketing: false });
                consentManager.rejectAll();
                onClose();
              }}
              variant="outline"
              className="sm:w-auto"
            >
              Reject All
            </Button>
            <Button
              onClick={() => {
                consentManager.acceptAll();
                onClose();
              }}
              variant="outline"
              className="sm:w-auto"
            >
              Accept All
            </Button>
            <Button
              onClick={() => onSave(localPreferences)}
              className="sm:w-auto bg-primary hover:bg-primary/90"
            >
              Save Preferences
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

