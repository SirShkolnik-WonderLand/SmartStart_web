import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { useSidebar } from "@/contexts/SidebarContext";
import StructuredData from "@/components/StructuredData";
import {
  Shield,
  Zap,
  Target,
  UserCircle,
  CheckCircle2,
  ArrowRight,
  Lock,
  Cloud,
  FileCheck,
  Bot,
  TrendingUp,
  Award,
  Briefcase,
  BarChart3,
  Settings,
  Code,
  Database,
  Network,
  Eye,
  FileText,
  AlertTriangle,
  Clock,
  DollarSign,
  Star
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import ContactModal from "@/components/ContactModal";

export default function Services() {
  const navigate = useNavigate();
  const { isCollapsed } = useSidebar();
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedService, setSelectedService] = useState<string>("");
  const pageUrl = 'https://alicesolutionsgroup.com/services';
  const pageTitle = 'Services - Cybersecurity, Automation & AI | AliceSolutionsGroup Toronto';
  const pageDescription = 'Comprehensive cybersecurity, automation, and AI services for Toronto businesses. ISO 27001, SOC 2, CISO-as-a-Service, business process automation, and SmartStart platform. Serving GTA and Ontario.';
  const services = [
    {
      id: "cybersecurity",
      title: "Cybersecurity & Compliance",
      subtitle: "ISO 27001, SOC 2, HIPAA, PHIPA",
      description: "Comprehensive security programs that protect your business while enabling growth. From risk assessment to full compliance certification.",
      icon: Shield,
      color: "from-blue-500 to-cyan-500",
      features: [
        "CISO-as-a-Service for strategic leadership",
        "ISO 27001:2022 readiness & certification",
        "SOC 2 Type I & Type II preparation",
        "PHIPA/PIPEDA privacy programs for Ontario",
        "Microsoft 365 E5 baselines (DLP, Defender, Intune)",
        "Zero Trust architectures & multi-tenant security",
        "Board KPIs, incident playbooks, tabletop exercises",
        "NIST CSF 2.0 posture assessment"
      ],
      deliverables: [
        "Security Policies & Procedures",
        "Risk Assessment Reports",
        "Compliance Roadmaps",
        "Security Training Programs",
        "Ongoing Security Monitoring"
      ],
      duration: "3-12 months",
      pricing: "Custom",
      useCases: [
        "Startups needing SOC 2 for enterprise clients",
        "Healthcare organizations requiring HIPAA compliance",
        "Companies pursuing ISO 27001 certification",
        "Businesses needing ongoing security leadership"
      ]
    },
    {
      id: "automation",
      title: "Automation & AI",
      subtitle: "Business Process Automation",
      description: "Intelligent workflows and smart systems that eliminate manual work, reduce errors, and accelerate your business operations.",
      icon: Zap,
      color: "from-purple-500 to-pink-500",
      features: [
        "RPA & intelligent workflow automation",
        "Privacy-preserving machine learning",
        "Decision support copilots with guardrails",
        "BI & real-time dashboards aligned with Canadian privacy law",
        "AI security & governance frameworks",
        "Data minimization & privacy controls",
        "Microsoft 365 security automation",
        "Custom automation kits for founders"
      ],
      deliverables: [
        "Automated Workflows",
        "Integration Solutions",
        "Custom Applications",
        "Process Documentation",
        "Training & Support"
      ],
      duration: "2-6 months",
      pricing: "Project-based",
      useCases: [
        "Repetitive task automation",
        "Data migration and integration",
        "Customer onboarding automation",
        "Report generation and distribution"
      ]
    },
    {
      id: "advisory",
      title: "Advisory & Audits",
      subtitle: "Strategic Security Consulting",
      description: "Expert guidance on security strategy, technology decisions, and organizational maturity. Make informed decisions with confidence.",
      icon: Target,
      color: "from-green-500 to-emerald-500",
      features: [
        "SOC 2 Readiness Review & gap analysis",
        "ISO 27001 Gap & Surveillance Readiness",
        "NIST CSF 2.0 posture assessment",
        "Technology due diligence for M&A",
        "Security program maturity evaluation",
        "Executive security briefings",
        "Board-level presentations & reporting",
        "Security awareness training programs"
      ],
      deliverables: [
        "Strategic Roadmaps",
        "Assessment Reports",
        "Technology Recommendations",
        "Training Materials",
        "Executive Summaries"
      ],
      duration: "1-3 months",
      pricing: "Retainer or Project",
      useCases: [
        "M&A security due diligence",
        "Security program evaluation",
        "Technology vendor selection",
        "Executive security education"
      ]
    },
    {
      id: "smartstart",
      title: "SmartStart Ecosystem",
      subtitle: "Venture Hub & Community",
      description: "Join a collaborative ecosystem of innovators, access premium tools, and accelerate your startup journey with expert support.",
      icon: UserCircle,
      color: "from-orange-500 to-amber-500",
      features: [
        "Second Brain Platform for organization memory",
        "Access to Premium Tools (Zoho, Acronis, Slack)",
        "Beer & Security community meetups",
        "Launch & Learn educational sessions",
        "Founder mentorship & advisory",
        "Venture building in 30-day sprints",
        "SmartStart Hub collaboration platform",
        "Startup showcase & funding opportunities"
      ],
      deliverables: [
        "Community Access",
        "Tool Discounts",
        "Event Invitations",
        "Networking Opportunities",
        "Educational Resources"
      ],
      duration: "Ongoing",
      pricing: "Membership",
      useCases: [
        "Startups seeking community",
        "Founders needing mentorship",
        "Companies wanting tool access",
        "Professionals seeking networking"
      ]
    }
  ];

  const process = [
    {
      step: 1,
      title: "Discovery",
      description: "Understanding your business, goals, and current state",
      icon: Eye
    },
    {
      step: 2,
      title: "Assessment",
      description: "Evaluating your needs, risks, and opportunities",
      icon: FileCheck
    },
    {
      step: 3,
      title: "Strategy",
      description: "Developing a customized roadmap and plan",
      icon: Target
    },
    {
      step: 4,
      title: "Implementation",
      description: "Executing the plan with ongoing support",
      icon: Settings
    },
    {
      step: 5,
      title: "Optimization",
      description: "Continuous improvement and refinement",
      icon: TrendingUp
    }
  ];

  const benefits = [
    {
      title: "Expert-Led",
      description: "15+ years of cybersecurity and automation experience",
      icon: Award
    },
    {
      title: "Industry Certifications",
      description: "CISSP, CISM, ISO 27001 Lead Auditor",
      icon: Shield
    },
    {
      title: "Practical Approach",
      description: "Real-world solutions that work for your business",
      icon: Briefcase
    },
    {
      title: "Proven Results",
      description: "500+ clients, 1000+ successful projects, 2+ startups",
      icon: CheckCircle2
    }
  ];

  // Service Catalog Schema
  const serviceCatalogSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Professional Services",
    "name": "AliceSolutionsGroup Services",
    "description": "Cybersecurity, automation, and AI services for Toronto and GTA businesses",
    "provider": {
      "@type": "Organization",
      "name": "AliceSolutionsGroup",
      "alternateName": "AliceSolutionsGroup Toronto"
    },
    "areaServed": {
      "@type": "City",
      "name": "Toronto"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Professional Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Cybersecurity & Compliance"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Automation & AI"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Advisory & Audits"
          }
        }
      ]
    }
  };

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content="cybersecurity services Toronto, ISO 27001 consultant GTA, CISO as a service Ontario, automation services Toronto, AI consulting GTA, SOC 2 compliance Ontario, business automation Canada" />
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
          {JSON.stringify(serviceCatalogSchema)}
        </script>
      </Helmet>
      <StructuredData 
        type="page"
        title={pageTitle}
        description={pageDescription}
        url={pageUrl}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Services", url: "/services" }
        ]}
      />
      <div className="min-h-screen bg-background">
      <Sidebar />
      <div className={`transition-all duration-300 ${isCollapsed ? 'md:ml-20 ml-0' : 'md:ml-72 ml-0'} md:pt-0 pt-20`}>
      {/* Hero Section */}
      <section className="relative pt-8 pb-16 px-4 sm:px-6 md:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              <span>Comprehensive Solutions</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
              <span className="block text-foreground">We</span>
              <span className="block bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                build and implement
              </span>
              <span className="block text-foreground">security & automation that move your business forward</span>
            </h1>

            <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Toronto & GTA • ISO 27001 readiness • PHIPA/PIPEDA privacy • AI automation with guardrails
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow-teal dark:shadow-glow-cyan"
              >
                <Briefcase className="mr-2 w-5 h-5" />
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary text-primary hover:bg-primary/10"
              >
                <FileText className="mr-2 w-5 h-5" />
                View Case Studies
              </Button>
            </div>
            <p className="mt-8 text-sm text-muted-foreground">
              Supporting GTA organizations? Explore our{" "}
              <a href="/toronto-cybersecurity-consulting" className="text-primary font-semibold underline-offset-4 hover:underline">
                Toronto Cybersecurity Consulting program
              </a>{" "}
              for incident response, ISO 27001, and PHIPA/PIPEDA-ready playbooks designed for local teams.
            </p>
          </motion.div>

          {/* Udi Credentials Strip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-6xl mx-auto"
          >
            <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-center mb-6 text-foreground">
                  About the Lead — Udi Shkolnik
                </h3>
                <div className="flex flex-wrap justify-center gap-3">
                  <div className="px-4 py-2 rounded-lg bg-primary/10 text-primary font-semibold text-sm">
                    CISSP, CISM, ISO/IEC 27001 Lead Auditor, ISO 27799, DPO
                  </div>
                  <div className="px-4 py-2 rounded-lg bg-cyan-500/10 text-cyan-500 font-semibold text-sm">
                    15+ years building & operating secure systems
                  </div>
                  <div className="px-4 py-2 rounded-lg bg-purple-500/10 text-purple-500 font-semibold text-sm">
                    Ontario PHIPA/PIPEDA privacy expertise
                  </div>
                  <div className="px-4 py-2 rounded-lg bg-green-500/10 text-green-500 font-semibold text-sm">
                    Execution-first: we ship baselines, dashboards, and guardrails
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 px-4 sm:px-6 md:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
              Our Services
            </h2>
            <p className="text-lg text-muted-foreground">
              Comprehensive solutions tailored to your business needs
            </p>
          </motion.div>

          <div className="space-y-12">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
                    <CardContent className="p-0">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                        {/* Left Column - Icon & Info */}
                        <div className="lg:col-span-1 p-8 bg-gradient-to-br from-primary/5 to-primary/10">
                          <div className={`w-16 h-16 rounded-lg bg-gradient-to-r ${service.color} flex items-center justify-center mb-6`}>
                            <Icon className="w-8 h-8 text-white" />
                          </div>
                          <h3 className="text-2xl font-bold text-foreground mb-2">
                            {service.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-6">
                            {service.subtitle}
                          </p>
                          <p className="text-muted-foreground mb-6">
                            {service.description}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              <span>{service.duration}</span>
                            </div>
                            <span className="text-muted-foreground">•</span>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <DollarSign className="w-4 h-4" />
                              <span>{service.pricing}</span>
                            </div>
                          </div>
                        </div>

                        {/* Right Column - Features & Details */}
                        <div className="lg:col-span-2 p-8">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Features */}
                            <div>
                              <h4 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-primary" />
                                Key Features
                              </h4>
                              <ul className="space-y-2">
                                {service.features.map((feature, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <span className="text-primary mt-1">•</span>
                                    <span>{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Deliverables */}
                            <div>
                              <h4 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-primary" />
                                Deliverables
                              </h4>
                              <ul className="space-y-2">
                                {service.deliverables.map((deliverable, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <span className="text-primary mt-1">•</span>
                                    <span>{deliverable}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Use Cases */}
                          <div className="mt-8 pt-8 border-t border-border/50">
                            <h4 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                              <Target className="w-5 h-5 text-primary" />
                              Ideal For
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {service.useCases.map((useCase, idx) => (
                                <div key={idx} className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                                  <Star className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                  <span className="text-sm text-muted-foreground">{useCase}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* CTA */}
                          <div className="mt-8">
                            <Button
                              onClick={() => {
                                setSelectedService(service.title);
                                setShowContactModal(true);
                              }}
                              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
                            >
                              Learn More
                              <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process Section */}
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
              Our Process
            </h2>
            <p className="text-lg text-muted-foreground">
              A proven methodology that delivers results
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-6">
            {process.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="relative"
                >
                  {/* Connector Line */}
                  {index < process.length - 1 && (
                    <div className="hidden sm:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-primary/20 transform -translate-y-1/2 z-0" />
                  )}

                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm h-full relative z-10">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="text-2xl font-bold text-primary mb-2">
                        {item.step}
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-2">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
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
      <section className="py-16 px-4 sm:px-6 md:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 backdrop-blur-sm">
              <CardContent className="p-8 sm:p-12">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
                  Ready to Get Started?
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Let's discuss how AliceSolutionsGroup can help your business achieve its security and automation goals.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    onClick={() => navigate('/contact')}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow-teal dark:shadow-glow-cyan"
                  >
                    <Briefcase className="mr-2 w-5 h-5" />
                    Schedule a Consultation
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => window.open('/resources', '_blank')}
                    className="border-primary text-primary hover:bg-primary/10"
                  >
                    <FileText className="mr-2 w-5 h-5" />
                    View Resources
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <Footer />

      {/* Contact Modal */}
      <ContactModal
        isOpen={showContactModal}
        onClose={() => {
          setShowContactModal(false);
          setSelectedService("");
        }}
        prefillService={selectedService || undefined}
        prefillMessage={selectedService ? `I'm interested in learning more about ${selectedService}. Please send me more information and next steps.` : undefined}
      />
      </div>
    </div>
    </>
  );
}

