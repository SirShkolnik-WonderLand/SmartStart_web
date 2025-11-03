import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Download, 
  Clock, 
  Users, 
  Shield, 
  Zap, 
  BookOpen,
  Briefcase,
  TrendingUp,
  BarChart3,
  Video,
  PlayCircle,
  CheckCircle2,
  ArrowRight,
  Search
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type ResourceCategory = "professional" | "community";

type ResourceStatus = "available" | "coming-soon" | "premium";

interface Resource {
  id: string;
  title: string;
  description: string;
  category: ResourceCategory;
  status: ResourceStatus;
  icon: React.ReactNode;
  downloadUrl?: string;
}

const resources: Resource[] = [
  // Professional Resources
  {
    id: "iso-policy-templates",
    title: "ISO 27001 Policy Templates",
    description: "Comprehensive policy templates for ISO 27001:2022 compliance, including information security, access control, and incident management policies.",
    category: "professional",
    status: "coming-soon",
    icon: <Shield className="w-5 h-5" />
  },
  {
    id: "soc2-checklist",
    title: "SOC 2 Audit Checklist",
    description: "Detailed checklist for SOC 2 Type I and Type II readiness, covering trust service criteria and common controls.",
    category: "professional",
    status: "coming-soon",
    icon: <CheckCircle2 className="w-5 h-5" />
  },
  {
    id: "pipeda-guide",
    title: "PIPEDA Compliance Guide",
    description: "Step-by-step guide for PIPEDA compliance in Ontario, including privacy impact assessments and consent management.",
    category: "professional",
    status: "coming-soon",
    icon: <FileText className="w-5 h-5" />
  },
  {
    id: "risk-assessment-templates",
    title: "Risk Assessment Templates",
    description: "Risk assessment frameworks and templates for cybersecurity, business continuity, and vendor management.",
    category: "professional",
    status: "coming-soon",
    icon: <BarChart3 className="w-5 h-5" />
  },
  {
    id: "automation-roi-calculator",
    title: "Automation ROI Calculator",
    description: "Excel-based calculator to estimate return on investment for business process automation projects.",
    category: "professional",
    status: "available",
    icon: <TrendingUp className="w-5 h-5" />,
    downloadUrl: "/resources/automation-roi-calculator.xlsx"
  },
  {
    id: "zero-trust-guide",
    title: "Zero Trust Implementation Guide",
    description: "Comprehensive guide to implementing Zero Trust architecture in your organization, with practical examples and best practices.",
    category: "professional",
    status: "coming-soon",
    icon: <Shield className="w-5 h-5" />
  },
  {
    id: "m365-security-baselines",
    title: "Microsoft 365 Security Baselines",
    description: "Security configuration baselines for Microsoft 365 E5, including conditional access, data loss prevention, and threat protection.",
    category: "professional",
    status: "coming-soon",
    icon: <Shield className="w-5 h-5" />
  },
  {
    id: "healthcare-compliance-case-study",
    title: "Healthcare Compliance Success Story",
    description: "Case study detailing how we helped a healthcare organization achieve ISO 27001 and PHIPA compliance in 6 months.",
    category: "professional",
    status: "coming-soon",
    icon: <Briefcase className="w-5 h-5" />
  },
  {
    id: "automation-cost-reduction",
    title: "Automation Cost Reduction Case Study",
    description: "Real-world case study showing 40% cost reduction through intelligent workflow automation and RPA implementation.",
    category: "professional",
    status: "coming-soon",
    icon: <TrendingUp className="w-5 h-5" />
  },
  {
    id: "ontario-privacy-whitepaper",
    title: "Ontario Privacy Law Compliance Whitepaper",
    description: "In-depth analysis of PIPEDA and PHIPA requirements, with practical implementation strategies for Ontario businesses.",
    category: "professional",
    status: "coming-soon",
    icon: <BookOpen className="w-5 h-5" />
  },
  {
    id: "ai-security-best-practices",
    title: "AI Security Best Practices Guide",
    description: "Comprehensive guide to securing AI and machine learning systems, including privacy-preserving ML and AI governance.",
    category: "professional",
    status: "coming-soon",
    icon: <Zap className="w-5 h-5" />
  },
  
  // Community Resources
  {
    id: "smartstart-getting-started",
    title: "SmartStart Getting Started Guide",
    description: "Complete guide to getting started with SmartStart Hub, including platform features, tools, and community guidelines.",
    category: "community",
    status: "available",
    icon: <Users className="w-5 h-5" />,
    downloadUrl: "/resources/smartstart-getting-started.pdf"
  },
  {
    id: "beer-security-session-1",
    title: "Beer + Security Session #1: ISO 27001 Basics",
    description: "Recording of our first Beer + Security meetup covering ISO 27001 fundamentals and getting started with compliance.",
    category: "community",
    status: "coming-soon",
    icon: <Video className="w-5 h-5" />
  },
  {
    id: "launch-learn-automation",
    title: "Launch & Learn: Business Automation 101",
    description: "Workshop recording on business process automation, RPA, and workflow optimization for small businesses.",
    category: "community",
    status: "coming-soon",
    icon: <PlayCircle className="w-5 h-5" />
  },
  {
    id: "venture-building-playbook",
    title: "Venture Building Playbook",
    description: "Step-by-step playbook for building and launching ventures, including ideation, validation, and go-to-market strategies.",
    category: "community",
    status: "coming-soon",
    icon: <Briefcase className="w-5 h-5" />
  },
  {
    id: "founder-mentorship-guide",
    title: "Founder Mentorship Guide",
    description: "Guide to effective founder mentorship, including structured mentorship programs and best practices.",
    category: "community",
    status: "coming-soon",
    icon: <Users className="w-5 h-5" />
  },
  {
    id: "business-model-canvas",
    title: "Business Model Canvas Template",
    description: "Editable Business Model Canvas template for planning and validating your business model.",
    category: "community",
    status: "available",
    icon: <FileText className="w-5 h-5" />,
    downloadUrl: "/resources/business-model-canvas.pdf"
  },
  {
    id: "pitch-deck-template",
    title: "Pitch Deck Template",
    description: "Professional pitch deck template optimized for investor presentations and fundraising.",
    category: "community",
    status: "available",
    icon: <FileText className="w-5 h-5" />,
    downloadUrl: "/resources/pitch-deck-template.pptx"
  },
  {
    id: "legal-checklist-startup",
    title: "Legal Checklist for Startups",
    description: "Comprehensive legal checklist for startups in Ontario, covering incorporation, IP, contracts, and compliance.",
    category: "community",
    status: "coming-soon",
    icon: <CheckCircle2 className="w-5 h-5" />
  },
  {
    id: "funding-resources-ontario",
    title: "Funding Resources for Ontario Startups",
    description: "Curated list of funding opportunities, grants, and investors for Ontario-based startups and SMEs.",
    category: "community",
    status: "coming-soon",
    icon: <TrendingUp className="w-5 h-5" />
  },
  {
    id: "community-engagement-playbook",
    title: "Community Engagement Playbook",
    description: "Best practices for building and engaging with startup communities, including event planning and networking.",
    category: "community",
    status: "coming-soon",
    icon: <Users className="w-5 h-5" />
  }
];

export default function Resources() {
  const [activeTab, setActiveTab] = useState<ResourceCategory>("professional");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredResources = resources.filter(resource => {
    const matchesCategory = resource.category === activeTab;
    const matchesSearch = searchQuery === "" || 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getStatusBadge = (status: ResourceStatus) => {
    switch (status) {
      case "available":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
            <Download className="w-3 h-3" />
            Available
          </span>
        );
      case "coming-soon":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3" />
            Coming Soon
          </span>
        );
      case "premium":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Star className="w-3 h-3" />
            Premium
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <BookOpen className="w-4 h-4 text-primary" />
              <span className="text-primary text-sm font-medium">Knowledge Hub</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-primary/80 bg-clip-text text-transparent">
              Resources & Knowledge Hub
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Tools, templates, and insights to accelerate your business growth. Access professional resources, community guides, and expert knowledge.
            </p>

            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>20+ Resources</span>
              </div>
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                <span>Free Downloads</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Community Access</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Tabs */}
          <div className="mb-8">
            <div className="flex gap-4 mb-8">
              <button
                onClick={() => setActiveTab("professional")}
                className={`flex-1 md:flex-none px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === "professional"
                    ? "bg-primary/20 text-primary border-2 border-primary/50"
                    : "bg-card/50 text-muted-foreground border-2 border-transparent hover:border-border"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  <span>Professional Resources</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab("community")}
                className={`flex-1 md:flex-none px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === "community"
                    ? "bg-primary/20 text-primary border-2 border-primary/50"
                    : "bg-card/50 text-muted-foreground border-2 border-transparent hover:border-border"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>Community Resources</span>
                </div>
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder={`Search ${activeTab === "professional" ? "professional" : "community"} resources...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-card/50 border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* Resources Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredResources.map((resource) => (
                <motion.div
                  key={resource.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="bg-card/50 backdrop-blur-xl rounded-xl border border-border/50 p-6 hover:border-primary/50 transition-all group"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                      {resource.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {resource.title}
                      </h3>
                      {getStatusBadge(resource.status)}
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                    {resource.description}
                  </p>

                  <div className="flex gap-2">
                    {resource.status === "available" && resource.downloadUrl && (
                      <a
                        href={resource.downloadUrl}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-sm font-medium transition-colors border border-primary/20"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </a>
                    )}
                    {resource.status === "coming-soon" && (
                      <button
                        disabled
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-muted/50 text-muted-foreground rounded-lg text-sm font-medium cursor-not-allowed"
                      >
                        <Clock className="w-4 h-4" />
                        Coming Soon
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {filteredResources.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No resources found matching your search.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-xl rounded-2xl border border-primary/20 p-8 md:p-12 text-center"
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Need More Resources?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join our community to access exclusive resources, templates, and expert guidance.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <button
                onClick={() => {
                  const checkoutUrl = import.meta.env.VITE_STRIPE_CHECKOUT_URL;
                  if (checkoutUrl) {
                    window.open(checkoutUrl, '_blank');
                  } else {
                    console.error('Stripe checkout URL not configured. Please set VITE_STRIPE_CHECKOUT_URL environment variable.');
                  }
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors"
              >
                Join SmartStart Hub
                <ArrowRight className="w-5 h-5" />
              </button>
              <a
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-card/50 hover:bg-card text-foreground rounded-lg font-medium transition-colors border border-border"
              >
                Contact Us
              </a>
            </div>
          </motion.div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}

// Add Star icon import
const Star = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);
