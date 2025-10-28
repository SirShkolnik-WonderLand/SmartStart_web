import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import ISOStudio from "./pages/ISOStudio";
import About from "./pages/About";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import Vision from "./pages/Vision";
import SmartStartHub from "./pages/SmartStartHub";
import SmartStart from "./pages/SmartStart";
import SmartStartPlatform from "./pages/SmartStartPlatform";
import SmartStartMembership from "./pages/SmartStartMembership";
import SmartStartEnterpriseTools from "./pages/SmartStartEnterpriseTools";
import SmartStartVentureBuilding from "./pages/SmartStartVentureBuilding";
import SmartStartArchetypes from "./pages/SmartStartArchetypes";
import Community from "./pages/Community";
import CommunityHub from "./pages/CommunityHub";
import CommunityEvents from "./pages/CommunityEvents";
import BeerSecurity from "./pages/BeerSecurity";
import LaunchLearn from "./pages/LaunchLearn";
import Mentorship from "./pages/Mentorship";
import Builder from "./pages/community/Builder";
import Connector from "./pages/community/Connector";
import Architect from "./pages/community/Architect";
import Dreamer from "./pages/community/Dreamer";
import Resources from "./pages/Resources";
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
import NotFound from "./pages/NotFound";
import SimpleTest from "./pages/SimpleTest";

const queryClient = new QueryClient();

const App = () => {
  // Initialize Analytics Hub tracking
  useEffect(() => {
    const analyticsConfig = {
      apiUrl: import.meta.env.VITE_ANALYTICS_API_URL || 'https://analytics-hub-server.onrender.com',
      autoTrack: true,
      trackOutbound: true,
      trackScroll: true,
    };

    (window as any).analyticsHubConfig = analyticsConfig;

    const script = document.createElement('script');
    // Add cache busting parameter to force reload
    const cacheBuster = Date.now();
    script.src = `${analyticsConfig.apiUrl}/tracker.js?v=${cacheBuster}`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    console.log('✅ Analytics Hub initialized');
  }, []);

  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/vision" element={<Vision />} />
          <Route path="/smartstart-hub" element={<SmartStartHub />} />
          <Route path="/smartstart" element={<SmartStart />} />
          <Route path="/smartstart-platform" element={<SmartStartPlatform />} />
          <Route path="/smartstart-membership" element={<SmartStartMembership />} />
          <Route path="/smartstart-enterprise-tools" element={<SmartStartEnterpriseTools />} />
          <Route path="/smartstart-venture-building" element={<SmartStartVentureBuilding />} />
          <Route path="/smartstart/archetypes" element={<SmartStartArchetypes />} />
          <Route path="/community" element={<Community />} />
          <Route path="/community-hub" element={<CommunityHub />} />
          <Route path="/community-events" element={<CommunityEvents />} />
          <Route path="/beer-security" element={<BeerSecurity />} />
          <Route path="/launch-learn" element={<LaunchLearn />} />
          <Route path="/mentorship" element={<Mentorship />} />
          <Route path="/community/builder" element={<Builder />} />
          <Route path="/community/connector" element={<Connector />} />
          <Route path="/community/architect" element={<Architect />} />
          <Route path="/community/dreamer" element={<Dreamer />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/iso-studio" element={<ISOStudio />} />
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
          <Route path="/simple-test" element={<SimpleTest />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

createRoot(document.getElementById("root")!).render(<App />);
