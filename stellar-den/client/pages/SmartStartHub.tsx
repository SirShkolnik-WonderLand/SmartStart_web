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
  Activity
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
      title: "SmartStart Platform",
      subtitle: "For-Profit Membership",
      icon: Briefcase,
      color: "from-blue-500 to-cyan-500",
      features: [
        "$98.80 CAD/month + tax sustains shared infrastructure & ops",
        "Enterprise tools (Zoho suite) + security & backup (Acronis)",
        "Venture building track with structured incubation",
        "Clear equity terms (typically 5–25% for incubated ventures)"
      ]
    },
    {
      title: "SmartStart Community",
      subtitle: "Non-Profit Programs",
      icon: Heart,
      color: "from-pink-500 to-rose-500",
      features: [
        "Free events — Beer + Security, Launch & Learn",
        "Pro-bono cybersecurity reviews (capacity-based)",
        "Mentorship — connects experts with entrepreneurs",
        "Measured impact across Ontario"
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
      name: "Discovery",
      price: "$1",
      period: "one-time",
      description: "Try SmartStart for 1 week",
      features: [
        "Full platform access for 7 days",
        "Attend one community event",
        "Access to collaboration tools",
        "Meet the community"
      ],
      cta: "Try Discovery — $1",
      popular: false,
      icon: Sparkles
    },
    {
      name: "Full Program",
      price: "$98.80",
      period: "month",
      description: "Full SmartStart membership",
      features: [
        "All community events & mentorship",
        "Enterprise tools (Zoho suite)",
        "Security & backup (Acronis)",
        "Venture building track access",
        "Second Brain Platform",
        "Ongoing support"
      ],
      cta: "Join SmartStart",
      popular: true,
      icon: Rocket
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
              Community First. Collaboration Over Competition. Real Growth.
            </motion.p>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-lg text-muted-foreground max-w-3xl mx-auto mb-4"
            >
              SmartStart combines a <strong className="text-primary">sustainable membership platform</strong> with <strong className="text-primary">community programs</strong> that support Ontario entrepreneurs, students, and small businesses through mentorship, training, and shared resources.
            </motion.p>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-sm text-muted-foreground italic mb-8"
            >
              ⚡ Runs on proven enterprise tools today (Zoho + Acronis). Our own application suite is in development.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow-teal dark:shadow-glow-cyan w-full sm:w-auto"
                >
                  <Rocket className="mr-2 w-5 h-5" />
                  Join SmartStart — $98.80/month
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/10 w-full sm:w-auto"
                >
                  <Sparkles className="mr-2 w-5 h-5" />
                  Try Discovery — $1
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
              Two-Layer Ecosystem
            </h2>
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
            <p className="text-muted-foreground italic">
              🔄 Membership revenue partially funds community programs to ensure sustainability and measurable social impact.
            </p>
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
              Choose Your Path
            </h2>
            <p className="text-lg text-muted-foreground">
              Flexible options to start your journey
            </p>
          </motion.div>

          <div className="flex justify-center gap-4 mb-8">
            <Button
              onClick={() => setSelectedPlan("discovery")}
              variant={selectedPlan === "discovery" ? "default" : "outline"}
              className={selectedPlan === "discovery" ? "bg-primary" : ""}
            >
              <Sparkles className="mr-2 w-4 h-4" />
              Discovery
            </Button>
            <Button
              onClick={() => setSelectedPlan("full")}
              variant={selectedPlan === "full" ? "default" : "outline"}
              className={selectedPlan === "full" ? "bg-primary" : ""}
            >
              <Rocket className="mr-2 w-4 h-4" />
              Full Program
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {pricingOptions.map((option, index) => {
              const Icon = option.icon;
              const isSelected = (option.name === "Discovery" && selectedPlan === "discovery") || 
                                 (option.name === "Full Program" && selectedPlan === "full");
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  animate={isSelected ? { scale: 1.05 } : { scale: 1 }}
                  className="cursor-pointer"
                >
                  <Card className={`border-border/50 bg-card/50 backdrop-blur-sm h-full relative transition-all duration-300 ${
                    option.popular ? 'border-primary/50 shadow-glow-teal dark:shadow-glow-cyan' : ''
                  } ${isSelected ? 'ring-2 ring-primary' : ''}`}>
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
                      <div className="flex items-center gap-3 mb-4">
                        <motion.div
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                          className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center"
                        >
                          <Icon className="w-6 h-6 text-primary" />
                        </motion.div>
                        <h3 className="text-2xl font-bold text-foreground">
                          {option.name}
                        </h3>
                      </div>
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
                          className={`w-full ${option.popular ? 'bg-primary hover:bg-primary/90' : 'bg-muted hover:bg-muted/80'}`}
                          size="lg"
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
                  Start your journey with our Discovery program for just $1, or jump straight into the full membership. Either way, you'll be part of a community that grows differently.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      size="lg"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow-teal dark:shadow-glow-cyan"
                    >
                      <Rocket className="mr-2 w-5 h-5" />
                      Join Full Program
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-primary text-primary hover:bg-primary/10"
                    >
                      <Sparkles className="mr-2 w-5 h-5" />
                      Try Discovery — $1
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
