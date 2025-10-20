import { useState } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeaturedInitiatives from "@/components/FeaturedInitiatives";
import EcosystemGrid from "@/components/EcosystemGrid";
import UpcomingEvents from "@/components/UpcomingEvents";
import Testimonials from "@/components/Testimonials";
import PhilosophySection from "@/components/PhilosophySection";
import PartnersSection from "@/components/PartnersSection";
import VisionSection from "@/components/VisionSection";
import ComplianceSection from "@/components/ComplianceSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import ContactModal from "@/components/ContactModal";
import AliceModal from "@/components/AliceModal";

export default function Index() {
  const [showContactModal, setShowContactModal] = useState(false);
  const [showAliceModal, setShowAliceModal] = useState(false);

  const handleExplore = () => {
    const element = document.getElementById("ecosystem");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <Hero
        onWorkWithUs={() => setShowContactModal(true)}
        onExplore={handleExplore}
      />

      {/* Featured Initiatives */}
      <FeaturedInitiatives />

      {/* Ecosystem Grid */}
      <section id="ecosystem">
        <EcosystemGrid onDiscoverClick={() => setShowContactModal(true)} />
      </section>

      {/* Upcoming Events */}
      <UpcomingEvents />

      {/* Testimonials */}
      <Testimonials />

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
