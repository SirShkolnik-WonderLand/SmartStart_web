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
import SmartStartArchetypes from "./pages/SmartStartArchetypes";
import Community from "./pages/Community";
import Builder from "./pages/community/Builder";
import Connector from "./pages/community/Connector";
import Architect from "./pages/community/Architect";
import Dreamer from "./pages/community/Dreamer";
import Resources from "./pages/Resources";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import TermsOfService from "./pages/legal/TermsOfService";
import CookiePolicy from "./pages/legal/CookiePolicy";
import Accessibility from "./pages/legal/Accessibility";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // Initialize Analytics Hub tracking
  useEffect(() => {
    const analyticsConfig = {
      apiUrl: import.meta.env.VITE_ANALYTICS_API_URL || 'http://localhost:4000',
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
          <Route path="/smartstart/archetypes" element={<SmartStartArchetypes />} />
          <Route path="/community" element={<Community />} />
          <Route path="/community/builder" element={<Builder />} />
          <Route path="/community/connector" element={<Connector />} />
          <Route path="/community/architect" element={<Architect />} />
          <Route path="/community/dreamer" element={<Dreamer />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/iso-studio" element={<ISOStudio />} />
          {/* Legal Pages */}
          <Route path="/legal/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/legal/terms-of-service" element={<TermsOfService />} />
          <Route path="/legal/cookie-policy" element={<CookiePolicy />} />
          <Route path="/legal/accessibility" element={<Accessibility />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

createRoot(document.getElementById("root")!).render(<App />);
