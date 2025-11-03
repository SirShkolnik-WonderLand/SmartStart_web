import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { SidebarProvider } from "@/contexts/SidebarContext";
import Index from "./pages/Index";
import ISOStudio from "./pages/ISOStudio";
import Resources from "./pages/Resources";
import About from "./pages/About";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import Vision from "./pages/Vision";
import SmartStart from "./pages/SmartStart";
import SmartStartVentureBuilding from "./pages/SmartStartVentureBuilding";
import SmartStartArchetypes from "./pages/SmartStartArchetypes";
import CommunityHub from "./pages/CommunityHub";
import CommunityEvents from "./pages/CommunityEvents";
import CISOasService from "./pages/CISOasService";
import ISO27001 from "./pages/ISO27001";
import SOC2 from "./pages/SOC2";
import BIAnalytics from "./pages/BIAnalytics";
import AutomationAI from "./pages/AutomationAI";
import PrivacyCompliance from "./pages/PrivacyCompliance";
import AdvisoryAudits from "./pages/AdvisoryAudits";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import TermsOfService from "./pages/legal/TermsOfService";
import CookiePolicy from "./pages/legal/CookiePolicy";
import Accessibility from "./pages/legal/Accessibility";
import Unsubscribe from "./pages/Unsubscribe";
import DataDeletionRequest from "./pages/DataDeletionRequest";
import NotFound from "./pages/NotFound";
import SimpleTest from "./pages/SimpleTest";
import ZohoCallback from "./pages/ZohoCallback";
import CookieConsentBanner from "./components/CookieConsentBanner";
import { consentManager } from "./lib/consentManager";

const queryClient = new QueryClient();

const App = () => {
  // NOTE: Analytics tracking is handled by the inline tracker in index.html
  // This tracker checks cookie consent directly and polls for consent changes
  // No need to load external tracker.js or reload page - HTML template handles everything
  useEffect(() => {
    // Just ensure analyticsHubConfig is set for compatibility (if needed by other components)
    if (typeof window !== 'undefined' && !(window as any).analyticsHubConfig) {
      const hasAnalyticsConsent = consentManager.hasConsent('analytics');
      (window as any).analyticsHubConfig = {
        apiUrl: import.meta.env.VITE_ANALYTICS_API_URL || 'https://analytics-hub-server.onrender.com',
        autoTrack: hasAnalyticsConsent,
      };
    }
  }, []);

  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <SidebarProvider>
        <BrowserRouter>
        <CookieConsentBanner />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/vision" element={<Vision />} />
          <Route path="/smartstart-hub" element={<Navigate to="/smartstart" replace />} />
          <Route path="/smartstart" element={<SmartStart />} />
          <Route path="/smartstart-membership" element={<Navigate to="/smartstart" replace />} />
          <Route path="/smartstart-venture-building" element={<SmartStartVentureBuilding />} />
          <Route path="/smartstart/archetypes" element={<SmartStartArchetypes />} />
          <Route path="/community-hub" element={<CommunityHub />} />
          <Route path="/community-events" element={<CommunityEvents />} />
          {/* Redirect old community routes to consolidated pages */}
          <Route path="/community" element={<Navigate to="/community-hub" replace />} />
          <Route path="/beer-security" element={<Navigate to="/community-events" replace />} />
          <Route path="/launch-learn" element={<Navigate to="/community-events" replace />} />
          <Route path="/mentorship" element={<Navigate to="/community-hub" replace />} />
          <Route path="/community/builder" element={<Navigate to="/community-hub" replace />} />
          <Route path="/community/connector" element={<Navigate to="/community-hub" replace />} />
          <Route path="/community/architect" element={<Navigate to="/community-hub" replace />} />
          <Route path="/community/dreamer" element={<Navigate to="/community-hub" replace />} />
          <Route path="/iso-studio" element={<ISOStudio />} />
          <Route path="/resources" element={<Resources />} />
          {/* Service Pages */}
          <Route path="/ciso-as-service" element={<CISOasService />} />
          <Route path="/iso-27001" element={<ISO27001 />} />
          <Route path="/soc-2" element={<SOC2 />} />
          <Route path="/bi-analytics" element={<BIAnalytics />} />
          <Route path="/automation-ai" element={<AutomationAI />} />
          <Route path="/privacy-compliance" element={<PrivacyCompliance />} />
          <Route path="/advisory-audits" element={<AdvisoryAudits />} />
          {/* Legal Pages */}
          <Route path="/legal/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/legal/terms-of-service" element={<TermsOfService />} />
          <Route path="/legal/cookie-policy" element={<CookiePolicy />} />
          <Route path="/legal/accessibility" element={<Accessibility />} />
          {/* Privacy Requests */}
          <Route path="/unsubscribe" element={<Unsubscribe />} />
          <Route path="/data-deletion" element={<DataDeletionRequest />} />
          <Route path="/simple-test" element={<SimpleTest />} />
          <Route path="/callback" element={<ZohoCallback />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </BrowserRouter>
      </SidebarProvider>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

createRoot(document.getElementById("root")!).render(<App />);
