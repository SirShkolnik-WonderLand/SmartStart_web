import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { useSidebar } from "@/contexts/SidebarContext";
import StructuredData from "@/components/StructuredData";
import { useNavigate } from "react-router-dom";
import {
  Hammer,
  Users,
  Building2,
  Lightbulb,
  ArrowRight,
  CheckCircle2,
  Zap,
  Shield,
  Handshake,
  Target,
  Globe,
  Layers,
  Rocket,
  Infinity,
  TrendingUp,
  Star,
  Gem
} from "lucide-react";

const SmartStartArchetypes: React.FC = () => {
  const { isCollapsed } = useSidebar();
  const navigate = useNavigate();
  const pageUrl = 'https://alicesolutionsgroup.com/smartstart/archetypes';
  const pageTitle = 'SmartStart Archetypes | Builder, Connector, Architect, Dreamer | Toronto';
  const pageDescription = 'Discover your SmartStart archetype: Builder, Connector, Architect, or Dreamer. Join Toronto\'s premier startup community and find your perfect co-founder match.';

  const archetypes = [
    {
      name: "The Builder",
      icon: Hammer,
      color: "from-orange-500 via-red-500 to-pink-500",
      bgColor: "from-orange-500/20 via-red-500/20 to-pink-500/20",
      glowColor: "rgba(251, 146, 60, 0.5)",
      shadowColor: "rgba(239, 68, 68, 0.4)",
      description: "Solo founders, developers, technical freelancers",
      superpower: "Creation & execution",
      href: "/community-hub",
      traits: ["Coding", "Building", "Debugging", "Shipping"],
      energy: "High-energy, hands-on creator"
    },
    {
      name: "The Connector",
      icon: Users,
      color: "from-teal-500 via-cyan-500 to-blue-500",
      bgColor: "from-teal-500/20 via-cyan-500/20 to-blue-500/20",
      glowColor: "rgba(20, 184, 166, 0.5)",
      shadowColor: "rgba(14, 165, 233, 0.4)",
      description: "Community managers, networkers, operations leads",
      superpower: "People & collaboration",
      href: "/community-hub",
      traits: ["Networking", "Communication", "Community Building", "Relationships"],
      energy: "Social, relationship-focused connector"
    },
    {
      name: "The Architect",
      icon: Building2,
      color: "from-purple-500 via-indigo-500 to-blue-600",
      bgColor: "from-purple-500/20 via-indigo-500/20 to-blue-600/20",
      glowColor: "rgba(168, 85, 247, 0.5)",
      shadowColor: "rgba(99, 102, 241, 0.4)",
      description: "CISOs, CTOs, strategists, compliance experts",
      superpower: "Systems & structure",
      href: "/community-hub",
      traits: ["Strategy", "Security", "Architecture", "Compliance"],
      energy: "Analytical, structure-focused planner"
    },
    {
      name: "The Dreamer",
      icon: Lightbulb,
      color: "from-pink-500 via-rose-500 to-fuchsia-500",
      bgColor: "from-pink-500/20 via-rose-500/20 to-fuchsia-500/20",
      glowColor: "rgba(236, 72, 153, 0.5)",
      shadowColor: "rgba(244, 63, 94, 0.4)",
      description: "Early-stage creatives, idea-stage founders",
      superpower: "Vision & transformation",
      href: "/community-hub",
      traits: ["Vision", "Innovation", "Ideation", "Transformation"],
      energy: "Creative, vision-driven innovator"
    }
  ];

  const synergies = [
    {
      title: "Builder + Architect",
      subtitle: "Execution Meets Structure",
      description: "Builders create fast, Architects ensure it's secure and scalable",
      result: "Rapid, secure product launches",
      icon: Zap,
      archetypes: [0, 2],
      example: "A Builder launches a SaaS MVP while an Architect designs the ISO 27001 compliance framework. Together, they create a secure, scalable product in weeks."
    },
    {
      title: "Dreamer + Connector",
      subtitle: "Vision Meets Network",
      description: "Dreamers have the vision, Connectors bring the people",
      result: "Ideas that reach the right audience",
      icon: Globe,
      archetypes: [3, 1],
      example: "A Dreamer has a brilliant idea, a Connector introduces them to the right mentors, investors, and early users. The idea spreads fast."
    },
    {
      title: "Connector + Architect",
      subtitle: "Network Meets Framework",
      description: "Connectors bring people together, Architects create the structure",
      result: "Organized, scalable communities",
      icon: Layers,
      archetypes: [1, 2],
      example: "A Connector organizes events while an Architect creates templates and frameworks. The community grows systematically."
    },
    {
      title: "Dreamer + Builder",
      subtitle: "Vision Meets Execution",
      description: "Dreamers see the future, Builders make it real",
      result: "Ideas that become products",
      icon: Rocket,
      archetypes: [3, 0],
      example: "A Dreamer has a vision, a Builder turns it into code. Together, they launch products that change the game."
    }
  ];

  const ultimateSynergy = {
    title: "All Four Together",
    subtitle: "1 + 1 + 1 + 1 = ∞",
    description: "When all four archetypes work together, magic happens",
    results: [
      "Dreamers bring the vision",
      "Builders turn it into reality",
      "Architects ensure it's secure and scalable",
      "Connectors spread it to the world"
    ],
    finalResult: "Complete ecosystems that grow and thrive"
  };

  const handleSubscription = () => {
    const checkoutUrl = import.meta.env.VITE_STRIPE_CHECKOUT_URL;
    if (checkoutUrl) {
      window.open(checkoutUrl, '_blank');
    } else {
      console.error('Stripe checkout URL not configured. Please set VITE_STRIPE_CHECKOUT_URL environment variable.');
    }
  };

  // Archetypes Page Schema
  const archetypesPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "SmartStart Archetypes",
    "description": "Discover your SmartStart archetype and find your perfect co-founder match",
    "url": pageUrl,
    "mainEntity": {
      "@type": "Organization",
      "name": "SmartStart",
      "alternateName": "SmartStart Toronto"
    }
  };

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content="SmartStart archetypes, startup founder types Toronto, co-founder matching GTA, entrepreneur archetypes Ontario, startup community Toronto, founder archetypes Canada" />
        <meta name="author" content="AliceSolutionsGroup" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={pageUrl} />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content="https://alicesolutionsgroup.com/logos/AliceSolutionsGroup-logo-compact.svg" />
        <meta property="og:site_name" content="AliceSolutionsGroup" />
        <meta property="og:locale" content="en_CA" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={pageUrl} />
        <meta property="twitter:title" content={pageTitle} />
        <meta property="twitter:description" content={pageDescription} />
        <meta property="twitter:image" content="https://alicesolutionsgroup.com/logos/AliceSolutionsGroup-logo-compact.svg" />
        
        {/* Geographic */}
        <meta name="geo.region" content="CA-ON" />
        <meta name="geo.placename" content="Toronto" />
        <meta name="geo.position" content="43.6532;-79.3832" />
        <meta name="ICBM" content="43.6532, -79.3832" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(archetypesPageSchema)}
        </script>
      </Helmet>
      <StructuredData 
        type="page"
        title={pageTitle}
        description={pageDescription}
        url={pageUrl}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "SmartStart", url: "/smartstart" },
          { name: "Archetypes", url: "/smartstart/archetypes" }
        ]}
      />
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className={`transition-all duration-300 ${isCollapsed ? 'md:ml-20 ml-0' : 'md:ml-72 ml-0'} md:pt-0 pt-20`}>
          {/* Hero Section */}
          <section className="relative pt-12 pb-20 px-4 sm:px-6 md:px-8 overflow-hidden">
            {/* Background gradients */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,146,60,0.15),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.15),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(14,165,233,0.1),transparent_50%)]" style={{ zIndex: 0 }} />
            
            <div className="max-w-7xl mx-auto relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
              >
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 border-2 border-primary/30 text-primary text-sm font-bold mb-6 backdrop-blur-sm shadow-lg"
                  style={{
                    boxShadow: `0 0 20px rgba(59, 130, 246, 0.3)`
                  }}
                >
                  <Infinity className="w-5 h-5" />
                  <span>The Four Archetypes</span>
                </motion.div>

                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6"
                >
                  <span className="block text-foreground">1 + 1 + 1 + 1 =</span>
                  <span className="block bg-gradient-to-r from-orange-500 via-pink-500 via-purple-500 via-blue-500 to-teal-500 bg-clip-text text-transparent">
                    ∞ (Infinity)
                  </span>
                </motion.h1>

                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8"
                >
                  The magic happens when Builders, Connectors, Architects, and Dreamers work together.
                </motion.p>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/30"
                    onClick={handleSubscription}
                  >
                    <Zap className="mr-2 w-5 h-5" />
                    Join SmartStart
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-primary/30 text-primary hover:bg-primary/10"
                  >
                    <Handshake className="mr-2 w-5 h-5" />
                    Join WonderLand
                  </Button>
                </motion.div>
              </motion.div>

              {/* The Four Archetypes */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto mb-16"
              >
                {archetypes.map((archetype, index) => {
                  const Icon = archetype.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      whileHover={{ y: -12, scale: 1.05 }}
                      className="cursor-pointer group"
                      onClick={() => navigate(archetype.href)}
                    >
                      <Card className={`relative border-2 border-transparent bg-gradient-to-br ${archetype.bgColor} backdrop-blur-sm h-full transition-all duration-500 overflow-hidden group-hover:border-primary/30`}
                        style={{
                          boxShadow: `0 10px 40px -10px ${archetype.shadowColor}, 0 0 0 1px ${archetype.glowColor} inset`
                        }}
                      >
                        <CardContent className="relative p-8 text-center">
                          {/* Large Icon with Glow */}
                          <motion.div 
                            className={`relative w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${archetype.color} flex items-center justify-center shadow-2xl`}
                            style={{
                              boxShadow: `0 0 30px ${archetype.glowColor}, 0 10px 40px -10px ${archetype.shadowColor}`
                            }}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <Icon className="w-12 h-12 text-white drop-shadow-lg" />
                          </motion.div>
                          
                          <h3 className="text-2xl font-bold mb-3"
                            style={{
                              background: index === 0 
                                ? 'linear-gradient(to right, #f97316, #ef4444, #ec4899)'
                                : index === 1
                                ? 'linear-gradient(to right, #14b8a6, #06b6d4, #3b82f6)'
                                : index === 2
                                ? 'linear-gradient(to right, #a855f7, #6366f1, #2563eb)'
                                : 'linear-gradient(to right, #ec4899, #f43f5e, #d946ef)',
                              WebkitBackgroundClip: 'text',
                              backgroundClip: 'text',
                              color: 'transparent'
                            }}
                          >
                            {archetype.name}
                          </h3>
                          
                          <p className="text-sm text-muted-foreground mb-3 font-medium">
                            {archetype.description}
                          </p>
                          
                          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${archetype.color} bg-opacity-20 border border-opacity-30 mb-4`}
                            style={{
                              borderColor: archetype.glowColor
                            }}
                          >
                            <Star className="w-4 h-4" style={{ color: archetype.glowColor }} />
                            <p className="text-sm font-bold text-foreground">
                              {archetype.superpower}
                            </p>
                          </div>
                          
                          {/* Traits */}
                          <div className="flex flex-wrap justify-center gap-2 mt-4">
                            {archetype.traits.map((trait, traitIndex) => (
                              <span 
                                key={traitIndex}
                                className="text-xs px-2 py-1 rounded-md bg-background/50 border border-border/50 text-muted-foreground"
                              >
                                {trait}
                              </span>
                            ))}
                          </div>
                          
                          {/* Energy indicator */}
                          <div className="mt-4 pt-4 border-t border-border/30">
                            <p className="text-xs text-muted-foreground italic">
                              {archetype.energy}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          </section>

          {/* Synergy Examples */}
          <section className="py-16 px-4 sm:px-6 md:px-8">
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
                  The Power of Synergy
                </h2>
                <p className="text-lg text-muted-foreground">
                  When archetypes combine, the result is greater than the sum of parts
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-8">
                {synergies.map((synergy, index) => {
                  const Icon = synergy.icon;
                  const archetype1 = archetypes[synergy.archetypes[0]];
                  const archetype2 = archetypes[synergy.archetypes[1]];
                  const Icon1 = archetype1.icon;
                  const Icon2 = archetype2.icon;
                  
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      whileHover={{ y: -10, scale: 1.02 }}
                      className="cursor-pointer group"
                    >
                      <Card className="relative border-2 border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm h-full transition-all duration-500 overflow-hidden group-hover:border-primary/50 group-hover:shadow-2xl"
                        style={{
                          boxShadow: `0 10px 40px -10px ${archetype1.shadowColor}, 0 0 0 1px ${archetype1.glowColor}20 inset`
                        }}
                      >
                        <CardContent className="relative p-8">
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                              <motion.div 
                                className={`w-16 h-16 rounded-xl bg-gradient-to-r ${archetype1.color} flex items-center justify-center shadow-lg`}
                                style={{
                                  boxShadow: `0 0 20px ${archetype1.glowColor}`
                                }}
                                whileHover={{ scale: 1.1, rotate: -5 }}
                              >
                                <Icon1 className="w-8 h-8 text-white" />
                              </motion.div>
                              <span className="text-3xl font-bold text-muted-foreground">+</span>
                              <motion.div 
                                className={`w-16 h-16 rounded-xl bg-gradient-to-r ${archetype2.color} flex items-center justify-center shadow-lg`}
                                style={{
                                  boxShadow: `0 0 20px ${archetype2.glowColor}`
                                }}
                                whileHover={{ scale: 1.1, rotate: 5 }}
                              >
                                <Icon2 className="w-8 h-8 text-white" />
                              </motion.div>
                            </div>
                            <motion.div 
                              className={`w-16 h-16 rounded-xl bg-gradient-to-r from-primary to-accent flex items-center justify-center shadow-xl`}
                              style={{
                                boxShadow: `0 0 30px rgba(59, 130, 246, 0.5)`
                              }}
                              whileHover={{ scale: 1.1, rotate: 5 }}
                            >
                              <Icon className="w-8 h-8 text-white" />
                            </motion.div>
                          </div>
                          
                          <h3 className="text-2xl font-bold text-foreground mb-2">
                            {synergy.title}
                          </h3>
                          <p className="text-sm text-primary font-semibold mb-4 flex items-center gap-2">
                            <Gem className="w-4 h-4" />
                            {synergy.subtitle}
                          </p>
                          <p className="text-muted-foreground mb-4 leading-relaxed">
                            {synergy.description}
                          </p>
                          <div className="bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 border-2 border-primary/30 rounded-xl p-4 mb-4 backdrop-blur-sm"
                            style={{
                              boxShadow: `inset 0 0 20px ${archetype1.glowColor}20`
                            }}
                          >
                            <p className="text-sm font-bold text-primary mb-2 flex items-center gap-2">
                              <Target className="w-4 h-4" />
                              Result:
                            </p>
                            <p className="text-sm font-semibold text-foreground">
                              {synergy.result}
                            </p>
                          </div>
                          <div className="bg-muted/30 border border-border/50 rounded-lg p-4">
                            <p className="text-sm text-muted-foreground italic leading-relaxed">
                              "{synergy.example}"
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Ultimate Synergy */}
          <section className="py-16 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-primary/5 to-accent/5">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center"
              >
                <Card className="relative border-2 border-primary/30 bg-gradient-to-br from-card/90 via-card/50 to-card/90 backdrop-blur-md hover:shadow-2xl hover:shadow-primary/40 transition-all duration-500 overflow-hidden"
                  style={{
                    boxShadow: `0 20px 60px -20px rgba(59, 130, 246, 0.4), inset 0 0 40px rgba(59, 130, 246, 0.1)`
                  }}
                >
                  <CardContent className="relative p-12">
                    <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-gradient-to-r from-primary via-accent to-primary flex items-center justify-center shadow-2xl"
                      style={{
                        boxShadow: `0 0 40px rgba(59, 130, 246, 0.6)`
                      }}
                    >
                      <Infinity className="w-10 h-10 text-white" />
                    </div>
                    
                    <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-foreground">
                      {ultimateSynergy.title}
                    </h2>
                    <p className="text-xl text-primary font-bold mb-6 flex items-center justify-center gap-2">
                      <Gem className="w-6 h-6" />
                      {ultimateSynergy.subtitle}
                    </p>
                    <p className="text-muted-foreground mb-8 text-lg">
                      {ultimateSynergy.description}
                    </p>

                    <div className="grid md:grid-cols-2 gap-4 mb-8">
                      {ultimateSynergy.results.map((result, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-3 bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary/20 rounded-xl p-5 backdrop-blur-sm hover:scale-105 transition-transform"
                          style={{
                            boxShadow: `0 4px 20px rgba(59, 130, 246, 0.2)`
                          }}
                        >
                          <CheckCircle2 className="w-6 h-6 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm font-semibold text-foreground">{result}</span>
                        </motion.div>
                      ))}
                    </div>

                    <div className="bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 border-2 border-primary/30 rounded-xl p-8 backdrop-blur-sm"
                      style={{
                        boxShadow: `inset 0 0 30px rgba(59, 130, 246, 0.2), 0 10px 40px -10px rgba(59, 130, 246, 0.3)`
                      }}
                    >
                      <p className="text-xl font-bold text-foreground flex items-center justify-center gap-2">
                        <Star className="w-6 h-6 text-primary" />
                        {ultimateSynergy.finalResult}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </section>

          {/* How It Works */}
          <section className="py-16 px-4 sm:px-6 md:px-8">
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
                  How It Works in SmartStart
                </h2>
                <p className="text-lg text-muted-foreground">
                  The ecosystem where all four archetypes thrive together
                </p>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    title: "WonderLand",
                    description: "Where all four archetypes meet freely",
                    icon: Globe,
                    color: "from-primary/20 to-accent/20",
                    glowColor: "rgba(29, 224, 193, 0.3)"
                  },
                  {
                    title: "SmartStart Hub",
                    description: "Where Builders and Architects execute, supported by Connectors and inspired by Dreamers",
                    icon: Zap,
                    color: "from-primary/30 to-accent/30",
                    glowColor: "rgba(29, 224, 193, 0.4)"
                  },
                  {
                    title: "AliceSolutions Group",
                    description: "Provides the secure, automated infrastructure and governance layer",
                    icon: Shield,
                    color: "from-primary/40 to-accent/40",
                    glowColor: "rgba(29, 224, 193, 0.5)"
                  }
                ].map((layer, index) => {
                  const Icon = layer.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      whileHover={{ y: -10, scale: 1.02 }}
                      className="cursor-pointer group"
                    >
                      <Card className={`relative border-2 border-border/50 bg-gradient-to-br ${layer.color} backdrop-blur-sm h-full transition-all duration-500 overflow-hidden group-hover:border-primary/50 group-hover:shadow-2xl`}
                        style={{
                          boxShadow: `0 10px 40px -10px ${layer.glowColor}`
                        }}
                      >
                        <CardContent className="relative p-8 text-center">
                          <motion.div 
                            className="w-16 h-16 rounded-xl bg-gradient-to-r from-primary to-accent flex items-center justify-center mx-auto mb-4 shadow-xl"
                            style={{
                              boxShadow: `0 0 30px ${layer.glowColor}`
                            }}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                          >
                            <Icon className="w-8 h-8 text-white" />
                          </motion.div>
                          <h3 className="text-xl font-bold text-foreground mb-2">
                            {layer.title}
                          </h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {layer.description}
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-16 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-primary/10 via-accent/10 to-primary/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(29,224,193,0.1),transparent_50%)]" />
            
            <div className="max-w-4xl mx-auto relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center"
              >
                <Card className="relative border-2 border-primary/30 bg-gradient-to-br from-card/90 via-card/50 to-card/90 backdrop-blur-md hover:shadow-2xl hover:shadow-primary/40 transition-all duration-500 overflow-hidden"
                  style={{
                    boxShadow: `0 20px 60px -20px rgba(29, 224, 193, 0.4), inset 0 0 40px rgba(29, 224, 193, 0.1)`
                  }}
                >
                  <CardContent className="relative p-12">
                    <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-gradient-to-r from-primary via-accent to-primary flex items-center justify-center shadow-2xl"
                      style={{
                        boxShadow: `0 0 40px rgba(29, 224, 193, 0.6)`
                      }}
                    >
                      <TrendingUp className="w-10 h-10 text-white" />
                    </div>
                    
                    <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-foreground">
                      Ready to Find Your Archetype?
                    </h2>
                    <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                      Join WonderLand to connect with all four archetypes, or upgrade to SmartStart to access tools that help you thrive in your role.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button
                        size="lg"
                        className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-xl transition-all duration-300 hover:scale-105"
                        style={{
                          boxShadow: `0 10px 40px -10px rgba(29, 224, 193, 0.5)`
                        }}
                        onClick={handleSubscription}
                      >
                        <Zap className="mr-2 w-5 h-5" />
                        Join SmartStart
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        className="border-2 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 hover:scale-105"
                        style={{
                          boxShadow: `0 4px 20px rgba(29, 224, 193, 0.2)`
                        }}
                      >
                        <Handshake className="mr-2 w-5 h-5" />
                        Join WonderLand
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </section>

          <Footer />
        </div>
      </div>
    </>
  );
};

export default SmartStartArchetypes;

