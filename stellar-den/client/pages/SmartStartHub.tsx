import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Users,
  Zap,
  Shield,
  Rocket,
  DollarSign,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Calendar,
  BookOpen,
  Briefcase,
  Globe,
  Lock,
  TrendingUp,
  Heart,
  Gift,
  Target,
  Award,
  MessageSquare,
  Coffee,
  GraduationCap,
  Network,
  Star,
  Timer,
  BarChart3,
  Lightbulb,
  Code,
  Database,
  Cloud,
  Server,
  Smartphone,
  Laptop,
  Monitor,
  Activity,
  Search,
  Building2,
  FileText
} from "lucide-react";

export default function SmartStartHub() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<"discovery" | "full">("full");
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  const coreValues = [
    {
      title: "Community First",
      description: "People connect, share knowledge, and grow together",
      icon: Users,
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Different by Design",
      description: "We welcome non-linear careers and unconventional paths",
      icon: Lightbulb,
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Shared Growth",
      description: "From casual events to structured sprints, we help each other win",
      icon: TrendingUp,
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Tools as Enablers",
      description: "Collaboration & automation are provided; the value is the people",
      icon: Zap,
      color: "from-orange-500 to-red-500"
    }
  ];

  const ecosystemLayers = [
    {
      title: "WonderLand",
      subtitle: "The Free Community",
      icon: Heart,
      color: "from-pink-500 to-rose-500",
      description: "Open, public community and events hub",
      features: [
        "Free events, workshops, and talks",
        "Network with entrepreneurs, developers, and mentors",
        "Discover new tools, ideas, and opportunities",
        "Explore paths toward building or joining SmartStart projects"
      ]
    },
    {
      title: "SmartStart",
      subtitle: "The Paid Platform",
      icon: Briefcase,
      color: "from-blue-500 to-cyan-500",
      description: "$98.80/month private workspace for execution",
      features: [
        "Access to SmartStart Hub platform (Zoho suite, Acronis backup)",
        "Business, tech, and cybersecurity mentorship",
        "Structured frameworks for funding, ISO compliance, and automation",
        "Private, secure data handling (GDPR + PIPEDA aligned)"
      ]
    }
  ];

  const includedFeatures = [
    {
      title: "Community Access & Events",
      icon: Calendar,
      color: "from-blue-500 to-cyan-500",
      features: [
        "Beer + Security (GTA)",
        "Launch & Learn (AI, cybersecurity, automation)",
        "Automation & Innovation Clinics for Ontario SMEs",
        "Mentorship with Udi + industry peers",
        "Pro-bono / NGO support (capacity-based)"
      ]
    },
    {
      title: "Collaboration Tools",
      icon: Network,
      color: "from-purple-500 to-pink-500",
      features: [
        "Zoho Cliq — channels, integrations, automations",
        "SmartStart Hub (today: enterprise tool stack; in dev: our own app suite)",
        "Global builder network — collaborate beyond the GTA"
      ]
    },
    {
      title: "Enterprise Tools (Included)",
      icon: Zap,
      color: "from-orange-500 to-red-500",
      features: [
        "Zoho Mail, Cliq, Projects, Vault, CRM/Books/Subscriptions",
        "Zoho publishes ISO 27001 and GDPR commitments",
        "HIPAA support through BAA for qualifying editions/workloads",
        "Configured and operated with security-first baselines"
      ]
    },
    {
      title: "Security & Backup (Included)",
      icon: Shield,
      color: "from-green-500 to-emerald-500",
      features: [
        "Acronis endpoint protection & secure backups",
        "Baseline security policies — MFA, device posture, hardening templates",
        "Security framework — practical guardrails for small teams",
        "We do not claim certifications on your behalf — we implement guardrails"
      ]
    },
    {
      title: "Venture Building Track",
      icon: Rocket,
      color: "from-pink-500 to-rose-500",
      features: [
        "30-day structured sprints for SaaS products",
        "Security and transparency at the core",
        "Clear equity/IP terms",
        "Transparent incubation process",
        "Ideas that gain traction can enter the venture path"
      ]
    },
    {
      title: "Second Brain Platform",
      icon: BookOpen,
      color: "from-indigo-500 to-purple-500",
      features: [
        "Organization memory: per-user spaces",
        "Search/embeddings for knowledge retrieval",
        "Audit trails and API access",
        "Built for teams that need to capture and organize institutional knowledge"
      ]
    }
  ];

  const pricingOptions = [
    {
      name: "SmartStart Community",
      price: "$98.80",
      period: "month",
      description: "Full membership with enterprise tools and community access",
      features: [
        "Community access & events",
        "Zoho enterprise suite",
        "Acronis security & backup",
        "Mentorship & support"
      ],
      cta: "Join SmartStart",
      popular: true,
      billingUrl: "https://billing.zohosecure.ca/subscribe/80acd4f75fc11ade8382abc9ca5c205ef35c7564ff13c9670befed3afeaa53b9/Plan010"
    }
  ];

  const stats = [
    { value: 100, suffix: "+", label: "Community Members", icon: Users },
    { value: 50, suffix: "+", label: "Events Hosted", icon: Calendar },
    { value: 30, suffix: "+", label: "Startups Supported", icon: Rocket },
    { value: 15, suffix: "+", label: "Pro-Bono Projects", icon: Heart }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section with Parallax */}
      <motion.section 
        style={{ opacity, scale }}
        className="relative pt-24 pb-16 px-4 sm:px-6 md:px-8 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6 cursor-default"
            >
              <Rocket className="w-4 h-4" />
              <span>SmartStart Ecosystem</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6"
            >
              <span className="block text-foreground">Where People and Businesses</span>
              <span className="block bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                Grow Differently
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8"
            >
              WonderLand is the playground. SmartStart is the lab.
            </motion.p>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-lg text-muted-foreground max-w-3xl mx-auto mb-4"
            >
              <strong className="text-primary">WonderLand</strong> is the free community where ideas are born and connections happen. <strong className="text-primary">SmartStart</strong> is the $98.80/month execution platform where those ideas become real — with enterprise tools, mentorship, and security.
            </motion.p>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-sm text-muted-foreground italic mb-8"
            >
              ⚡ WonderLand connects the minds. SmartStart empowers the builders. Together, they form a living ecosystem that helps people and companies grow differently.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex justify-center"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow-teal dark:shadow-glow-cyan"
                  onClick={() => window.open('https://billing.zohosecure.ca/subscribe/80acd4f75fc11ade8382abc9ca5c205ef35c7564ff13c9670befed3afeaa53b9/Plan010', '_blank')}
                >
                  Join SmartStart — $98.80/month
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Animated Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-12"
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-glow-teal dark:hover:shadow-glow-cyan transition-all duration-300">
                    <CardContent className="p-6 text-center">
                      <Icon className="w-10 h-10 mx-auto mb-3 text-primary" />
                      <div className="text-3xl font-bold text-foreground mb-1">
                        {stat.value}{stat.suffix}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {stat.label}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </motion.section>

      {/* What SmartStart Is */}
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
              What SmartStart Is
            </h2>
            <p className="text-lg text-muted-foreground">
              A community-first hub for collaboration, learning, and mentorship
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {coreValues.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  onHoverStart={() => setHoveredCard(index)}
                  onHoverEnd={() => setHoveredCard(null)}
                  className="cursor-pointer"
                >
                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm h-full text-center transition-all duration-300 hover:shadow-glow-teal dark:hover:shadow-glow-cyan">
                    <CardContent className="p-6">
                      <motion.div
                        animate={{ 
                          scale: hoveredCard === index ? 1.1 : 1,
                          rotate: hoveredCard === index ? 5 : 0
                        }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${value.color} flex items-center justify-center`}
                      >
                        <Icon className="w-8 h-8 text-white" />
                      </motion.div>
                      <h3 className="text-lg font-bold text-primary mb-3">
                        {value.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {value.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Card className="border-primary/20 bg-primary/5 backdrop-blur-sm inline-block hover:shadow-glow-teal dark:hover:shadow-glow-cyan transition-all duration-300">
              <CardContent className="p-6">
                <p className="text-primary font-semibold">
                  Optional Venture Path: Ideas that gain traction can enter a transparent incubation track with clear equity/IP terms
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Two-Layer Ecosystem */}
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
              WonderLand & SmartStart
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Two layers, one vision — community-powered growth
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {ecosystemLayers.map((layer, index) => {
              const Icon = layer.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="cursor-pointer"
                >
                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm h-full transition-all duration-300 hover:shadow-glow-teal dark:hover:shadow-glow-cyan">
                    <CardContent className="p-8">
                      <div className="flex items-center gap-3 mb-4">
                        <motion.div 
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                          className={`w-12 h-12 rounded-lg bg-gradient-to-r ${layer.color} flex items-center justify-center`}
                        >
                          <Icon className="w-6 h-6 text-white" />
                        </motion.div>
                        <div>
                          <h3 className="text-2xl font-bold text-foreground">
                            {layer.title}
                          </h3>
                          <p className="text-sm text-primary font-semibold">
                            {layer.subtitle}
                          </p>
                        </div>
                      </div>
                      <p className="text-muted-foreground mb-4 italic">
                        {layer.description}
                      </p>
                      <ul className="space-y-2">
                        {layer.features.map((feature, idx) => (
                          <motion.li 
                            key={idx} 
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex items-start gap-2 text-muted-foreground"
                          >
                            <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center mt-8"
          >
            <Card className="border-primary/20 bg-primary/5 backdrop-blur-sm inline-block hover:shadow-glow-teal dark:hover:shadow-glow-cyan transition-all duration-300">
              <CardContent className="p-6">
                <p className="text-primary font-semibold">
                  <strong>How They Work Together:</strong> People start in WonderLand, joining events or conversations. When they're ready to build or automate something serious, they upgrade to SmartStart. Both coexist under AliceSolutionsGroup, which provides the ecosystem, governance, and security backbone.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* What's Included */}
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
              What's Included
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {includedFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="cursor-pointer"
                >
                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm h-full transition-all duration-300 hover:shadow-glow-teal dark:hover:shadow-glow-cyan">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <motion.div 
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                          className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center`}
                        >
                          <Icon className="w-6 h-6 text-white" />
                        </motion.div>
                        <h3 className="text-lg font-bold text-foreground">
                          {index + 1}) {feature.title}
                        </h3>
                      </div>
                      <ul className="space-y-2">
                        {feature.features.map((item, idx) => (
                          <motion.li 
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.05 }}
                            className="flex items-start gap-2 text-sm text-muted-foreground"
                          >
                            <span className="text-primary mt-1">•</span>
                            <span>{item}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Interactive Pricing */}
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
              Simple Pricing
            </h2>
            <p className="text-lg text-muted-foreground">
              One price. All features. No surprises.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {pricingOptions.map((option, index) => {
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="cursor-pointer md:col-span-2 lg:col-span-1"
                >
                  <Card className="border-primary/50 bg-card/50 backdrop-blur-sm h-full relative transition-all duration-300 shadow-glow-teal dark:shadow-glow-cyan">
                    {option.popular && (
                      <motion.div 
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute -top-4 left-1/2 transform -translate-x-1/2"
                      >
                        <div className="px-4 py-1 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                          Most Popular
                        </div>
                      </motion.div>
                    )}
                    <CardContent className="p-8">
                      <h3 className="text-2xl font-bold text-foreground mb-4">
                        {option.name}
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        {option.description}
                      </p>
                      <div className="flex items-baseline gap-2 mb-6">
                        <span className="text-4xl font-bold text-foreground">
                          {option.price}
                        </span>
                        <span className="text-muted-foreground">
                          /{option.period}
                        </span>
                      </div>
                      <ul className="space-y-3 mb-8">
                        {option.features.map((feature, idx) => (
                          <motion.li 
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.05 }}
                            className="flex items-start gap-2"
                          >
                            <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground">{feature}</span>
                          </motion.li>
                        ))}
                      </ul>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          className="w-full bg-primary hover:bg-primary/90"
                          size="lg"
                          onClick={() => {
                            if (option.billingUrl.startsWith('http')) {
                              window.open(option.billingUrl, '_blank');
                            } else {
                              window.location.href = option.billingUrl;
                            }
                          }}
                        >
                          {option.cta}
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Success Stories */}
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
              Success Stories
            </h2>
            <p className="text-lg text-muted-foreground">
              Real-world results from collaborative projects
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Dispatch & Ops Automation",
                description: "AI scheduling, real-time tracking, reporting",
                result: "~40% cost reduction and higher CSAT",
                icon: Activity
              },
              {
                title: "Education Ops Platform",
                description: "Consistent ops across 40+ countries / 1,200+ locations",
                result: "Automation for scheduling/reporting/QA",
                icon: GraduationCap
              },
              {
                title: "Healthcare Compliance Platform",
                description: "Privacy-by-design patient data flows",
                result: "~50% admin reduction and improved protection",
                icon: Shield
              }
            ].map((story, index) => {
              const Icon = story.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="cursor-pointer"
                >
                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm h-full transition-all duration-300 hover:shadow-glow-teal dark:hover:shadow-glow-cyan">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground">
                          {story.title}
                        </h3>
                      </div>
                      <p className="text-muted-foreground mb-4">
                        {story.description}
                      </p>
                      <p className="text-primary font-semibold">
                        {story.result}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center mt-8"
          >
            <p className="text-muted-foreground italic">
              Client names available on request under NDA
            </p>
          </motion.div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 px-4 sm:px-6 md:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
              SmartStart vs Traditional Communities
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-primary/10">
                      <th className="px-6 py-4 text-left text-foreground font-semibold border-b border-border">
                        Feature
                      </th>
                      <th className="px-6 py-4 text-left text-muted-foreground font-semibold border-b border-border">
                        Traditional Communities
                      </th>
                      <th className="px-6 py-4 text-left text-primary font-semibold border-b border-border">
                        SmartStart
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        feature: "Focus",
                        traditional: "Networking → Pitching",
                        smartstart: "Community → Collaboration → Growth"
                      },
                      {
                        feature: "Timeline",
                        traditional: "Event-based",
                        smartstart: "Continuous support"
                      },
                      {
                        feature: "Support",
                        traditional: "Limited mentoring",
                        smartstart: "Mentorship + tools + security baselines"
                      },
                      {
                        feature: "Culture",
                        traditional: "Competitive",
                        smartstart: "Collaborative"
                      },
                      {
                        feature: "Tools",
                        traditional: "Basic",
                        smartstart: "Enterprise suite + guardrails"
                      }
                    ].map((row, index) => (
                      <motion.tr
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-6 py-4 text-foreground font-medium">
                          {row.feature}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {row.traditional}
                        </td>
                        <td className="px-6 py-4 text-foreground font-semibold">
                          {row.smartstart}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Founder's Edge */}
      <section className="py-16 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-white">
              Founder's Edge
            </h2>
            <p className="text-xl text-slate-200 mb-8">
              <strong>Udi Shkolnik</strong> — CISSP, CISM, ISO 27001 Lead Auditor, CTO/CISO, educator, builder
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[
                {
                  title: "Security leadership",
                  description: "Governance & compliance",
                  color: "from-blue-500 to-cyan-500"
                },
                {
                  title: "Execution at scale",
                  description: "Operational restructuring with real savings",
                  color: "from-teal-500 to-emerald-500"
                },
                {
                  title: "Education",
                  description: "Practical training for professionals",
                  color: "from-purple-500 to-pink-500"
                },
                {
                  title: "Builder",
                  description: "Multiple SaaS/platform deliveries",
                  color: "from-blue-500 to-indigo-500"
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-glow-teal dark:hover:shadow-glow-cyan transition-all duration-300">
                    <CardContent className="p-6">
                      <p className={`text-${item.color.split('-')[1]}-500 font-bold mb-2`}>
                        {item.title}
                      </p>
                      <p className="text-slate-300 text-sm">
                        {item.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <p className="text-slate-200 italic">
              SmartStart doesn't just dream big — it <strong className="text-white">executes securely</strong>.
            </p>
          </motion.div>
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
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 backdrop-blur-sm hover:shadow-glow-teal dark:hover:shadow-glow-cyan transition-all duration-300">
              <CardContent className="p-8 sm:p-12">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
                  Ready to Join SmartStart?
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Join the SmartStart community and get access to enterprise tools, mentorship, and resources for just $98.80/month.
                </p>

                <div className="flex justify-center">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      size="lg"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow-teal dark:shadow-glow-cyan"
                      onClick={() => window.open('https://billing.zohosecure.ca/subscribe/80acd4f75fc11ade8382abc9ca5c205ef35c7564ff13c9670befed3afeaa53b9/Plan010', '_blank')}
                    >
                      Join SmartStart — $98.80/month
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
