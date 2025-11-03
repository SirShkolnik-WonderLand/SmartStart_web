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
  Award,
  TrendingUp,
  UserCircle,
  Briefcase,
  GraduationCap,
  Target,
  CheckCircle2,
  ExternalLink,
  Mail,
  MapPin,
  Linkedin,
  Github,
  Twitter,
  Rocket,
  BookOpen,
} from "lucide-react";

export default function About() {
  const { isCollapsed } = useSidebar();
  const pageUrl = 'https://alicesolutionsgroup.com/about';
  const pageTitle = 'About Us - Udi Shkolnik CISSP CISM | AliceSolutionsGroup Toronto';
  const pageDescription = 'Meet Udi Shkolnik, CISSP CISM ISO 27001 Lead Auditor, founder of AliceSolutionsGroup Toronto. 15+ years cybersecurity experience serving GTA businesses with ISO compliance, automation, and venture building.';
  const certifications = [
    {
      id: "cissp",
      name: "CISSP",
      fullName: "Certified Information Systems Security Professional",
      issuer: "ISC²",
      year: "2024",
      image: "/certificates/CISSP.png",
      category: "Core Security"
    },
    {
      id: "cism",
      name: "CISM",
      fullName: "Certified Information Security Manager",
      issuer: "ISACA",
      year: "2024",
      image: "/certificates/CISM.png",
      category: "Security Management"
    },
    {
      id: "iso27001",
      name: "ISO 27001 Lead Auditor",
      fullName: "ISO/IEC 27001 Lead Auditor",
      issuer: "ISO",
      year: "2024",
      image: "/certificates/iso27001-lead-auditor.png",
      category: "Compliance"
    },
    {
      id: "isc2-cloud",
      name: "ISC2 Cloud Security",
      fullName: "Working in the Cloud - ISC2 Cloud Security",
      issuer: "ISC²",
      year: "2024",
      image: "/certificates/isc2-cloud-security.png",
      category: "Cloud Security"
    },
    {
      id: "isc2-breach",
      name: "ISC2 Breach Response",
      fullName: "Responding to a Breach - ISC2 Security",
      issuer: "ISC²",
      year: "2024",
      image: "/certificates/isc2-breach-response.png",
      category: "Incident Response"
    },
    {
      id: "isc2-nist",
      name: "ISC2 NIST Framework",
      fullName: "Introduction to NIST Cybersecurity Framework",
      issuer: "ISC²",
      year: "2024",
      image: "/certificates/isc2-nist-framework.png",
      category: "Framework"
    },
    {
      id: "risk-methods",
      name: "Practical Risk Methods",
      fullName: "Practical Risk Methods Certificate Program",
      issuer: "ISC²",
      year: "2024",
      image: "/certificates/practical-risk-methods.png",
      category: "Risk Management"
    },
    {
      id: "risk-analysis",
      name: "Practical Risk Analysis",
      fullName: "Conducting Practical Risk Analysis",
      issuer: "ISC²",
      year: "2024",
      image: "/certificates/practical-risk-analysis.png",
      category: "Risk Analysis"
    },
    {
      id: "risk-standards",
      name: "Risk Standards",
      fullName: "Risk Standards Certification",
      issuer: "Industry",
      year: "2024",
      image: "/certificates/risk-standards.png",
      category: "Standards"
    },
    {
      id: "healthcare-privacy",
      name: "Healthcare Privacy & Security",
      fullName: "Healthcare Privacy & Security Certification",
      issuer: "Healthcare",
      year: "2024",
      image: "/certificates/healthcare-privacy-security.png",
      category: "Healthcare"
    },
    {
      id: "healthcare-risk",
      name: "Healthcare Risk Management",
      fullName: "Healthcare Risk Management Certification",
      issuer: "Healthcare",
      year: "2024",
      image: "/certificates/healthcare-risk-management.png",
      category: "Healthcare"
    }
  ];

  const skills = [
    { name: "Cybersecurity Strategy", level: 95 },
    { name: "ISO 27001 Implementation", level: 98 },
    { name: "Risk Assessment", level: 95 },
    { name: "Compliance Management", level: 97 },
    { name: "Security Architecture", level: 92 },
    { name: "Incident Response", level: 90 },
    { name: "Cloud Security", level: 88 },
    { name: "Security Auditing", level: 96 }
  ];

  const timeline = [
    {
      year: "2024-Present",
      title: "CTO at Let's Get Moving Group",
      description: "Leading enterprise-level digital transformation across multiple subsidiaries in moving, storage, logistics, marketing, and franchise operations. Driving automation, systems integration, and scalable infrastructure.",
      icon: Briefcase
    },
    {
      year: "2023-Present",
      title: "Co-Founder & CTO at MovedIn",
      description: "Leading the technology and automation engine behind MovedIn—a fast-scaling moving platform operating across Canada and the USA. Building AI-powered tools that optimize operations and drive revenue.",
      icon: Briefcase
    },
    {
      year: "2018-Present",
      title: "Founder of AliceSolutions",
      description: "Leading a boutique cybersecurity consultancy delivering CISO-level strategy, compliance leadership, and risk management across healthcare, defense, and tech sectors. Helping organizations achieve regulatory alignment and scale securely.",
      icon: Shield
    },
    {
      year: "2019-2023",
      title: "DPO & Head of InfoSec at Plasan",
      description: "Championed data security and compliance initiatives for a $150M+ defense organization. Successfully attained ISO 27001 certification and reduced organizational risk by 35%.",
      icon: Shield
    },
    {
      year: "2024",
      title: "Achieved CISSP & CISM",
      description: "Earned industry-leading certifications demonstrating expertise in information security management and systems security.",
      icon: Award
    },
    {
      year: "2024",
      title: "ISO 27001 Lead Auditor",
      description: "Certified as ISO 27001 Lead Auditor, enabling comprehensive compliance consulting and audit services.",
      icon: Shield
    },
    {
      year: "2018-2022",
      title: "Founded Cyber-School",
      description: "Conceptualized and established a pioneering cyber-school in Israel, dedicated to providing in-depth study programs in information security and coding for learners of all ages.",
      icon: GraduationCap
    }
  ];

  const stats = [
    { label: "Years of Experience", value: "15+", icon: TrendingUp },
    { label: "Certifications", value: "11", icon: Award },
    { label: "Clients Helped", value: "500+", icon: UserCircle },
    { label: "Projects Completed", value: "1000+", icon: CheckCircle2 },
    { label: "Startups Built", value: "2+", icon: Rocket }
  ];

  // Person Schema for Udi Shkolnik
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Sagi Ehud Shkolnik",
    "alternateName": "Udi Shkolnik",
    "jobTitle": "Founder & CISO & CTO",
    "worksFor": {
      "@type": "Organization",
      "name": "AliceSolutionsGroup",
      "alternateName": "AliceSolutionsGroup Toronto"
    },
    "hasCredential": [
      {
        "@type": "EducationalOccupationalCredential",
        "name": "CISSP",
        "recognizedBy": {
          "@type": "Organization",
          "name": "(ISC)²"
        }
      },
      {
        "@type": "EducationalOccupationalCredential",
        "name": "CISM",
        "recognizedBy": {
          "@type": "Organization",
          "name": "ISACA"
        }
      },
      {
        "@type": "EducationalOccupationalCredential",
        "name": "ISO 27001 Lead Auditor"
      }
    ],
    "knowsAbout": ["Cybersecurity", "ISO 27001", "SOC 2", "HIPAA", "PHIPA", "CISO", "Automation", "AI"],
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Toronto",
      "addressRegion": "ON",
      "addressCountry": "CA"
    },
    "sameAs": [
      "https://www.credly.com/users/udi-shkolnik",
      "https://www.linkedin.com/in/udishkolnik"
    ]
  };

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content="Udi Shkolnik, CISSP, CISM, ISO 27001 Lead Auditor, cybersecurity consultant Toronto, CISO Toronto, AliceSolutionsGroup founder, cybersecurity expert GTA, ISO compliance consultant Ontario" />
        <meta name="author" content="AliceSolutionsGroup" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={pageUrl} />
        
        {/* Open Graph */}
        <meta property="og:type" content="profile" />
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
          {JSON.stringify(personSchema)}
        </script>
      </Helmet>
      <StructuredData 
        type="page"
        title={pageTitle}
        description={pageDescription}
        url={pageUrl}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "About", url: "/about" }
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
              <Shield className="w-4 h-4" />
              <span>Cybersecurity & Compliance Leader</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
              <span className="block text-foreground">Help people and businesses</span>
              <span className="block bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                grow differently
              </span>
            </h1>

            <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Execution, structure, and truth. Build systems that serve people, not noise.
            </p>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              I'm Sagi Ehud (Udi) Shkolnik — CISSP, CISM, ISO 27001 Lead Auditor, and Founder of AliceSolutionsGroup. I combine cybersecurity expertise, automation, and human growth to help organizations achieve security-first innovation. My philosophy: security by design, compliance as an enabler, and execution over theory.
            </p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <Icon className="w-8 h-8 mx-auto mb-3 text-primary" />
                    <div className="text-3xl font-bold text-foreground mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Timeline Section */}
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
              Professional Journey
            </h2>
            <p className="text-lg text-muted-foreground">
              A track record of excellence in cybersecurity and innovation
            </p>
          </motion.div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-primary/20 transform md:-translate-x-1/2" />

            <div className="space-y-8">
              {timeline.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className={`relative flex flex-col md:flex-row items-start md:items-center gap-4 ${
                      index % 2 === 0 ? "md:flex-row-reverse" : ""
                    }`}
                  >
                    {/* Timeline Dot */}
                    <div className="absolute left-4 md:left-1/2 w-8 h-8 rounded-full bg-background border-4 border-primary flex items-center justify-center transform md:-translate-x-1/2 z-10">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>

                    {/* Content Card */}
                    <div className={`flex-1 ml-12 md:ml-0 ${index % 2 === 0 ? "md:mr-auto md:pr-8" : "md:ml-auto md:pl-8"}`}>
                      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-sm font-semibold text-primary">
                              {item.year}
                            </span>
                            <span className="text-sm text-muted-foreground">•</span>
                            <h3 className="text-xl font-bold text-foreground">
                              {item.title}
                            </h3>
                          </div>
                          <p className="text-muted-foreground leading-relaxed">
                            {item.description}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Origin Story Section */}
      <section className="py-16 px-4 sm:px-6 md:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
              How I got here
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-8">
                <p className="text-muted-foreground leading-relaxed mb-4">
                  I started as a hands-on IT specialist and grew into a CISO-level operator across Canada and Israel. Along the way I learned that most security problems are execution problems: unclear owners, no baselines, and too much theory. I built my practice to fix that—practical roadmaps, measured sprints, and calm delivery.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Today I lead <strong className="text-foreground">AliceSolutionsGroup</strong>, where security, compliance, and automation work together. My approach is simple: align with business goals, ship the smallest valuable change, harden the surface, and keep improving based on data.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  With over 15 years of experience spanning defense, healthcare, and technology sectors, I've designed and audited ISMS frameworks (ISO 27001, SOC 2, NIST CSF, PHIPA, PIPEDA) and served as CTO and CISO across multiple organizations. I founded <strong className="text-foreground">SmartStart</strong>, a platform and incubator designed to help people and businesses grow differently through cybersecurity excellence, intelligent automation, and community-driven mentorship.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Results Section */}
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
              Results I'm proud of
            </h2>
            <p className="text-lg text-muted-foreground">
              Measurable impact across organizations and industries
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "$150K/month operating costs eliminated",
                description: "Reduced operational costs by 40% through AI-powered automation and accountability at an enterprise services organization. Smart automation and operational restructuring delivered immediate, measurable savings."
              },
              {
                title: "ISO 27001 readiness delivered",
                description: "Led 12+ successful ISO 27001 certifications across multiple teams and countries with clean evidence and faster audits. Organizations include Plasan Sasa (defense), Helen Doron Education, and Egged Transportation."
              },
              {
                title: "Security baselines enforced",
                description: "Implemented MFA, DMARC, WAF, and other controls with measurable drops in incidents and fraud. Secured 500-doctor hospital network serving 2,500+ staff and 50,000+ patients with comprehensive cybersecurity programs."
              },
              {
                title: "Founder tooling that ships",
                description: "Built and deployed SmartStart Hub, Second Brain platform, and repeatable automation kits. Real applications solving real business problems: SmartP&L Manager (20% profit margin increase), LeadFlow Redirector, DataGuard Minimizer (85% exposure risk reduction)."
              },
              {
                title: "Cross-border expertise",
                description: "Multi-million-dollar projects across Israel, Canada, and United States. Ministry of Health incident response, national hospital cybersecurity programs, and enterprise security training initiatives."
              },
              {
                title: "Community impact",
                description: "Founded SmartStart community providing mentorship, training, and resources to Ontario entrepreneurs, students, and small businesses. Beer + Security events, pro-bono consulting for nonprofits, and hands-on mentorship programs."
              }
            ].map((result, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm h-full">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-foreground mb-3">
                      {result.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {result.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why I Do This Section */}
      <section className="py-16 px-4 sm:px-6 md:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
              Why I do this
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Building capability, not dependency
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground leading-relaxed mb-6">
                  I believe security should make teams faster, not slower. I teach what I implement—workshops, office hours, and founder roundtables through the SmartStart community. We build capability inside your team so the wins stick.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  My philosophy goes beyond business. My vision for AliceSolutionsGroup is about community, transparency, and shared growth. Through SmartStart, I bring together cybersecurity, automation, AI, and venture building into a single mission:
                </p>
                <blockquote className="text-2xl sm:text-3xl font-bold text-primary mb-0 border-l-4 border-primary pl-6">
                  "Help people and businesses grow differently — with security, structure, and transparency."
                </blockquote>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold text-primary mb-6 text-center">
                  Why work with me
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    "Enterprise-grade security for SMB budgets",
                    "Practical execution over theoretical frameworks",
                    "Multi-country expertise (Canada, Israel, USA)",
                    "15+ years of hands-on experience",
                    "Proven track record of measurable results",
                    "Community-focused mentorship approach"
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Skills Section */}
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
              Core Expertise
            </h2>
            <p className="text-lg text-muted-foreground">
              Specialized skills across cybersecurity and compliance domains
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {skills.map((skill, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="mb-2 flex justify-between items-center">
                  <span className="text-sm font-medium text-foreground">
                    {skill.name}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {skill.level}%
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${skill.level}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications Section */}
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
              Professional Certifications
            </h2>
            <p className="text-lg text-muted-foreground">
              11 industry-leading certifications demonstrating comprehensive expertise
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {certifications.map((cert, index) => (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
              >
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 hover:shadow-glow-teal dark:hover:shadow-glow-cyan transition-all duration-300 h-full group">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="w-24 h-24 mb-4 rounded-lg bg-muted/50 flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform duration-300">
                      <img
                        src={cert.image}
                        alt={cert.name}
                        className="w-full h-full object-contain"
                        loading="lazy"
                      />
                    </div>
                    <div className="text-xs font-semibold text-primary mb-1">
                      {cert.category}
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">
                      {cert.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {cert.fullName}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{cert.issuer}</span>
                      <span>•</span>
                      <span>{cert.year}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Education & Languages Section */}
      <section className="py-16 px-4 sm:px-6 md:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
              Education & Languages
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Continuous learning and global communication
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Education */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm h-full">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <GraduationCap className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">Education</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-semibold text-foreground mb-2">
                        Bachelor of Science - Computer/Information Technology
                      </h4>
                      <p className="text-primary font-medium mb-1">
                        Western Governors University
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Focused on mastering cybersecurity and IT principles, including risk management, network security, cryptography, ethical hacking, and compliance. Courses aligned with industry standards and prepared for certifications such as CompTIA, ISACA, ISC2, and AWS.
                      </p>
                    </div>
                    
                    <div className="pt-4 border-t border-border/50">
                      <h5 className="text-sm font-semibold text-foreground mb-2">Key Areas of Study:</h5>
                      <div className="flex flex-wrap gap-2">
                        {["Governance, Risk Management, and Compliance (GRC)", "Enterprise Risk Management", "Network Security", "Cryptography", "Ethical Hacking", "Compliance Frameworks"].map((topic, index) => (
                          <span key={index} className="px-3 py-1 rounded-full text-xs bg-primary/10 text-primary border border-primary/20">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Languages */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm h-full">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <UserCircle className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">Languages</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-foreground">English</span>
                        <span className="text-sm text-primary font-medium">Full Professional Proficiency</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: '95%' }}></div>
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-foreground">Hebrew</span>
                        <span className="text-sm text-primary font-medium">Native / Bilingual</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: '100%' }}></div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground pt-4">
                      Fluent communication in both English and Hebrew enables seamless collaboration with international teams and clients across North America, Europe, and the Middle East.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 md:px-8">
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
                  Let's Work Together
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Ready to strengthen your security posture? Let's discuss how AliceSolutionsGroup can help your business grow differently.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button
                    size="lg"
                    onClick={() => window.location.href = '/contact'}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow-teal dark:shadow-glow-cyan"
                  >
                    <Mail className="mr-2 w-5 h-5" />
                    Get in Touch
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => window.location.href = '/services'}
                    className="border-primary text-primary hover:bg-primary/10"
                  >
                    <BookOpen className="mr-2 w-5 h-5" />
                    View Services
                  </Button>
                </div>

                <div className="mt-8 pt-8 border-t border-border/50">
                  <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>Toronto, Ontario, Canada</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>udi.shkolnik@alicesolutionsgroup.com</span>
                    </div>
                  </div>

                  <div className="flex justify-center gap-4 mt-6">
                    <a
                      href="https://linkedin.com/in/udishkolnik"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-lg border border-border/50 hover:border-primary hover:bg-primary/10 transition-all duration-300 text-muted-foreground hover:text-primary"
                      aria-label="LinkedIn"
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                    <a
                      href="https://github.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-lg border border-border/50 hover:border-primary hover:bg-primary/10 transition-all duration-300 text-muted-foreground hover:text-primary"
                      aria-label="GitHub"
                    >
                      <Github className="w-5 h-5" />
                    </a>
                    <a
                      href="https://twitter.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-lg border border-border/50 hover:border-primary hover:bg-primary/10 transition-all duration-300 text-muted-foreground hover:text-primary"
                      aria-label="Twitter/X"
                    >
                      <Twitter className="w-5 h-5" />
                    </a>
                  </div>
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
}

