import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import { useInView } from "@/hooks/useInView";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { useSidebar } from "@/contexts/SidebarContext";
import StructuredData from "@/components/StructuredData";
import { Sparkles, Users, Target, Rocket, Shield, Zap, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Vision() {
  const navigate = useNavigate();
  const { isCollapsed } = useSidebar();
  const pageUrl = 'https://alicesolutionsgroup.com/vision';
  const pageTitle = 'Our Vision - Building Ecosystems Not Companies | AliceSolutionsGroup Toronto';
  const pageDescription = 'AliceSolutionsGroup vision: Building ecosystems, not companies. Privacy-first cybersecurity, automation, and venture building. Serving Toronto and GTA with human-centric design.';
  const { ref: heroRef, isInView: heroInView } = useInView();
  const { ref: manifestoRef, isInView: manifestoInView } = useInView();
  const { ref: ecosystemRef, isInView: ecosystemInView } = useInView();

  const products = [
    {
      name: "AliceSolutions Core",
      description: "CISO-as-a-Service, ISO 27001, Zero-Trust, SOC 2",
      icon: Shield,
      color: "#1DE0C1",
      position: "center",
    },
    {
      name: "SmartStart",
      description: "30-day venture sprints for founders",
      icon: Rocket,
      color: "#10B981",
      position: "top-left",
    },
    {
      name: "ISO Studio",
      description: "Compliance advisor and 93-control assessment",
      icon: Shield,
      color: "#8B5CF6",
      position: "top-right",
    },
    {
      name: "Syncary",
      description: "Teams, tasks, and smart workflows",
      icon: Users,
      color: "#EC4899",
      position: "bottom-left",
    },
    {
      name: "DriftLock",
      description: "Post-quantum cryptography (R&D)",
      icon: Shield,
      color: "#EF4444",
      position: "bottom-right",
    },
    {
      name: "Delta",
      description: "Marketing SOAR platform (R&D)",
      icon: Zap,
      color: "#F59E0B",
      position: "bottom-center",
    },
  ];

  const principles = [
    {
      icon: Target,
      title: "Build Ecosystems, Not Companies",
      description:
        "We create interconnected products that amplify each other. Each venture strengthens the whole constellation.",
    },
    {
      icon: Sparkles,
      title: "Growth Over Greed",
      description:
        "Technology should serve human potential, not extraction. We build tools that help people and businesses grow differently.",
    },
    {
      icon: Users,
      title: "Community First",
      description:
        "Real innovation happens in collaboration. We incubate ideas, support founders, and share knowledge openly.",
    },
    {
      icon: Shield,
      title: "Security as Foundation",
      description:
        "Privacy, compliance, and security aren't afterthoughts. They're the bedrock of everything we build.",
    },
  ];

  // Vision Page Schema
  const visionPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "AliceSolutionsGroup Vision",
    "description": "Building ecosystems, not companies. Privacy-first cybersecurity and venture building.",
    "url": pageUrl,
    "mainEntity": {
      "@type": "Organization",
      "name": "AliceSolutionsGroup",
      "alternateName": "AliceSolutionsGroup Toronto"
    }
  };

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content="AliceSolutionsGroup vision, cybersecurity Toronto, venture building GTA, privacy-first design, ecosystem building Toronto, human-centric design Ontario" />
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
          {JSON.stringify(visionPageSchema)}
        </script>
      </Helmet>
      <StructuredData 
        type="page"
        title={pageTitle}
        description={pageDescription}
        url={pageUrl}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Vision", url: "/vision" }
        ]}
      />
      <div className="min-h-screen bg-background">
      <Sidebar />
      <div className={`transition-all duration-300 ${isCollapsed ? 'md:ml-20' : 'md:ml-72'} md:pt-0 pt-20`}>
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-[60vh] flex items-center justify-center px-4 py-24 overflow-hidden"
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-background pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={heroInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 max-w-5xl mx-auto text-center space-y-8"
        >
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent leading-tight">
            We Build Ecosystems,
            <br />
            Not Companies
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            AliceSolutions is a cybersecurity & venture studio. We design secure
            systems, automate work, and incubate startups that compound growth.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <span className="px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary font-medium">
              Help people and businesses grow differently
            </span>
          </div>
        </motion.div>
      </section>

      {/* Manifesto Section */}
      <section ref={manifestoRef} className="px-4 py-24 bg-card/50">
        <div className="max-w-4xl mx-auto space-y-16">
          <motion.div
            initial={{ opacity: 0 }}
            animate={manifestoInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-center">
              Our Philosophy
            </h2>

            <div className="prose prose-lg dark:prose-invert max-w-none space-y-6 text-muted-foreground leading-relaxed">
              <p>
                Most companies focus on building a single product and scaling it
                to infinity. We believe there's a better way.
              </p>

              <p>
                <strong className="text-foreground">
                  We build constellations of products
                </strong>{" "}
                — each designed to solve real problems, but also strengthening
                the ecosystem as a whole. SmartStart helps founders launch.
                ISO Studio helps companies get compliant. Syncary helps teams
                collaborate. DriftLock keeps data secure. Delta amplifies
                marketing.
              </p>

              <p>
                Each product stands alone, but together they create something
                greater: <strong className="text-foreground">a network of
                tools that compound value</strong>.
              </p>

              <p>
                This isn't just about software. It's about{" "}
                <strong className="text-foreground">
                  helping people and businesses grow differently
                </strong>
                . It's about security that enables speed. Automation that
                respects privacy. Community that lifts everyone.
              </p>

              <p className="text-xl text-foreground font-semibold">
                We're not building to exit. We're building to last.
              </p>
            </div>
          </motion.div>

          {/* Core Principles Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {principles.map((principle, idx) => {
              const Icon = principle.icon;
              return (
                <motion.div
                  key={principle.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={manifestoInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-glow-turquoise"
                >
                  <Icon className="w-8 h-8 text-primary mb-4" />
                  <h3 className="font-display text-xl font-bold mb-2">
                    {principle.title}
                  </h3>
                  <p className="text-muted-foreground">{principle.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Ecosystem Constellation */}
      <section ref={ecosystemRef} className="px-4 py-24">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={ecosystemInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center space-y-6 mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              Our Constellation
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Six stars, one sky. Each product serves a purpose, but together
              they form a complete ecosystem.
            </p>
          </motion.div>

          {/* Product Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, idx) => {
              const Icon = product.icon;
              const isCoreProduct = product.position === "center";

              return (
                <motion.div
                  key={product.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={ecosystemInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className={`p-6 rounded-xl border transition-all duration-300 hover:scale-105 ${
                    isCoreProduct
                      ? "md:col-span-2 lg:col-span-3 bg-gradient-to-br from-primary/20 to-secondary/20 border-primary"
                      : "bg-card border-border hover:border-primary/50"
                  }`}
                  style={{
                    boxShadow: ecosystemInView
                      ? `0 0 30px ${product.color}40`
                      : "none",
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="p-3 rounded-lg"
                      style={{ backgroundColor: `${product.color}20` }}
                    >
                      <Icon
                        className="w-6 h-6"
                        style={{ color: product.color }}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display text-xl font-bold mb-2">
                        {product.name}
                      </h3>
                      <p className="text-muted-foreground">
                        {product.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="px-4 py-24 bg-card/50">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="font-display text-3xl md:text-4xl font-bold">
            Built by Builders
          </h2>

          <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground">
            <p>
              Founded by{" "}
              <strong className="text-foreground">
                Sagi Ehud (Udi) Shkolnik
              </strong>
              , CISSP / CISM / ISO 27001 Lead Auditor.
            </p>

            <p>
              With 15+ years building and operating secure systems across
              healthcare, manufacturing, and education, Udi saw a pattern: great
              ideas failing not from lack of vision, but from lack of
              infrastructure.
            </p>

            <p>
              AliceSolutions exists to change that. We provide the security,
              automation, and support that lets founders focus on what matters:
              building products people love.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 justify-center pt-8">
            <span className="px-4 py-2 rounded-lg bg-primary/10 text-primary font-medium">
              Toronto, Ontario
            </span>
            <span className="px-4 py-2 rounded-lg bg-secondary/10 text-secondary font-medium">
              15+ Years Experience
            </span>
            <span className="px-4 py-2 rounded-lg bg-primary/10 text-primary font-medium">
              500+ Clients
            </span>
            <span className="px-4 py-2 rounded-lg bg-secondary/10 text-secondary font-medium">
              1000+ Projects
            </span>
            <span className="px-4 py-2 rounded-lg bg-accent/10 text-accent font-medium">
              2+ Startups
            </span>
          </div>

          <div className="mt-12">
            <Button
              onClick={() => navigate('/contact')}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Phone className="w-5 h-5 mr-2" />
              Get Started
            </Button>
          </div>
        </div>
      </section>

      <Footer />
      </div>
    </div>
    </>
  );
}

