import { useState } from "react";
import { Helmet } from "react-helmet";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeaturedInitiatives from "@/components/FeaturedInitiatives";
import ValueProposition from "@/components/ValueProposition";
import EcosystemGrid from "@/components/EcosystemGrid";
import UpcomingEvents from "@/components/UpcomingEvents";
import Testimonials from "@/components/Testimonials";
import TrustBadges from "@/components/TrustBadges";
import FAQSection from "@/components/FAQSection";
import PhilosophySection from "@/components/PhilosophySection";
import PartnersSection from "@/components/PartnersSection";
import VisionSection from "@/components/VisionSection";
import ComplianceSection from "@/components/ComplianceSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import ContactModal from "@/components/ContactModal";
import AliceModal from "@/components/AliceModal";
import StructuredData from "@/components/StructuredData";

export default function Index() {
  const [showContactModal, setShowContactModal] = useState(false);
  const [showAliceModal, setShowAliceModal] = useState(false);

  const handleExplore = () => {
    const element = document.getElementById("ecosystem");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <Helmet>
        <title>AliceSolutions Group - Cybersecurity & Compliance Solutions</title>
        <meta name="description" content="Leading cybersecurity and compliance solutions for Canadian businesses. ISO 27001, CISO-as-a-Service, automation, and SmartStart programs. Trusted by 50+ companies." />
        <meta name="keywords" content="cybersecurity, compliance, ISO 27001, CISO, automation, SmartStart, Toronto, Canada" />
        <meta name="author" content="AliceSolutions Group" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://alicesolutionsgroup.com" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://alicesolutionsgroup.com" />
        <meta property="og:title" content="AliceSolutions Group - Cybersecurity & Compliance Solutions" />
        <meta property="og:description" content="Leading cybersecurity and compliance solutions for Canadian businesses. ISO 27001, CISO-as-a-Service, automation, and SmartStart programs." />
        <meta property="og:image" content="https://alicesolutionsgroup.com/logos/AliceSolutionsGroup-logo-compact.svg" />
        <meta property="og:site_name" content="AliceSolutions Group" />
        <meta property="og:locale" content="en_CA" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://alicesolutionsgroup.com" />
        <meta property="twitter:title" content="AliceSolutions Group - Cybersecurity & Compliance Solutions" />
        <meta property="twitter:description" content="Leading cybersecurity and compliance solutions for Canadian businesses. ISO 27001, CISO-as-a-Service, automation, and SmartStart programs." />
        <meta property="twitter:image" content="https://alicesolutionsgroup.com/logos/AliceSolutionsGroup-logo-compact.svg" />
        
        {/* Additional SEO */}
        <meta name="geo.region" content="CA-ON" />
        <meta name="geo.placename" content="Toronto" />
        <meta name="geo.position" content="43.6532;-79.3832" />
        <meta name="ICBM" content="43.6532, -79.3832" />
      </Helmet>
      <StructuredData 
        type="home"
        title="AliceSolutions Group - Cybersecurity & Compliance Solutions"
        description="Leading cybersecurity and compliance solutions for Canadian businesses. ISO 27001, CISO-as-a-Service, automation, and SmartStart programs."
        url="https://alicesolutionsgroup.com"
      />
      <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <Hero
        onWorkWithUs={() => setShowContactModal(true)}
        onExplore={handleExplore}
      />

      {/* Featured Initiatives */}
      <FeaturedInitiatives />

      {/* Value Proposition */}
      <ValueProposition />

      {/* Ecosystem Grid */}
      <section id="ecosystem">
        <EcosystemGrid onDiscoverClick={() => setShowContactModal(true)} />
      </section>

      {/* Upcoming Events */}
      <UpcomingEvents />

      {/* Testimonials */}
      <Testimonials />

      {/* Trust Badges */}
      <TrustBadges />

      {/* FAQ Section */}
      <FAQSection />

      {/* Philosophy Section */}
      <PhilosophySection />

      {/* Partners Section */}
      <PartnersSection />

      {/* Vision Section */}
      <VisionSection />

      {/* Compliance Section */}
      <ComplianceSection />

      {/* CTA Section */}
      <CTASection
        onTalkToAlice={() => setShowAliceModal(true)}
        onJoinHub={() => setShowContactModal(true)}
      />

      {/* Footer */}
      <Footer />

      {/* Modals */}
      <ContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
      />
      <AliceModal
        isOpen={showAliceModal}
        onClose={() => setShowAliceModal(false)}
      />
    </div>
  );
}
