import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { useSidebar } from "@/contexts/SidebarContext";
import ContactModal from "@/components/ContactModal";
import ConstellationHero2030 from "@/components/ConstellationHero2030";
import EcosystemBento from "@/components/EcosystemBento";
import TrustLayer2030 from "@/components/TrustLayer2030";
import SmartStart30Days from "@/components/SmartStart30Days";
import ISOStudioShowcase from "@/components/ISOStudioShowcase";
import FinalCTA2030 from "@/components/FinalCTA2030";
import StructuredData from "@/components/StructuredData";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";

/**
 * Index2030 - New 2030 Aesthetic Homepage
 * 
 * This is the redesigned homepage featuring:
 * - Constellation hero with animated nodes
 * - Ecosystem bento grid
 * - Trust layer with client logos
 * - Product deep-dives (SmartStart, ISO Studio)
 * - Clean, cosmic minimalism design
 * 
 * To use this page, update App.tsx to import Index2030 instead of Index
 */
export default function Index2030() {
  const { isCollapsed } = useSidebar();
  const [showContactModal, setShowContactModal] = useState(false);
  const navigate = useNavigate();

  const handleBookCall = () => {
    setShowContactModal(true);
  };

  const handleExploreSmartStart = () => {
    navigate("/smartstart-hub");
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>AliceSolutions — Cybersecurity, Automation & Venture Studio (Toronto)</title>
        <meta
          name="description"
          content="We build secure systems, automate work, and incubate startups. CISO-as-a-Service, ISO 27001, Zero-Trust, SmartStart venture sprints."
        />
        <meta property="og:title" content="AliceSolutions — Build Differently. Grow Intelligently." />
        <meta
          property="og:description"
          content="Cybersecurity & venture studio in Toronto. We design secure systems, automate work, and incubate startups that compound growth."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://alicesolutionsgroup.com" />
        <link rel="canonical" href="https://alicesolutionsgroup.com" />
      </Helmet>

      <StructuredData
        type="home"
        title="AliceSolutions — Cybersecurity, Automation & Venture Studio"
        description="We build secure systems, automate work, and incubate startups. CISO-as-a-Service, ISO 27001, Zero-Trust, SmartStart venture sprints."
        url="/"
      />

      <Sidebar />
      <div className={`transition-all duration-300 ${isCollapsed ? 'md:ml-20 ml-0 md:ml-72 ml-0'} md:pt-0 pt-20`}>

      {/* Hero Section - "The Constellation" */}
      <ConstellationHero2030
        onBookCall={handleBookCall}
        onExploreSmartStart={handleExploreSmartStart}
      />

      {/* Ecosystem Bento - "What We Operate" */}
      <EcosystemBento />

      {/* Trust Layer - "Proven Results" */}
      <TrustLayer2030 />

      {/* SmartStart in 30 Days */}
      <SmartStart30Days />

      {/* ISO Studio Showcase */}
      <ISOStudioShowcase />

      {/* TODO: Add remaining sections */}
      {/* S6) Insights (Knowledge Hub) - Needs MDX blog setup */}
      {/* S7) Community & Events - Can reuse existing UpcomingEvents component */}

      {/* Final CTA */}
      <FinalCTA2030 onBookCall={handleBookCall} />

      <Footer />

      {/* Modals */}
      <ContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
      />
    </div>
  );
}

