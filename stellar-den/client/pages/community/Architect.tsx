import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Building2,
  Layers,
  ArrowRight,
  CheckCircle2,
  Compass,
  Shield,
  FileText,
  Sparkles,
  TrendingUp,
  Settings,
  Lock,
  Gauge,
  Target,
  Zap
} from "lucide-react";

export default function Architect() {
  const [currentStep, setCurrentStep] = useState(0);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);

  const journey = [
    {
      stage: "WonderLand",
      title: "Learn & Share",
      description: "Attend events, share frameworks, learn from peers",
      icon: FileText,
      color: "from-purple-500/20 to-indigo-500/20"
    },
    {
      stage: "SmartStart",
      title: "Design & Structure",
      description: "Create frameworks, SOPs, and ISO/security systems",
      icon: Building2,
      color: "from-purple-500/30 to-indigo-500/30"
    },
    {
      stage: "Impact",
      title: "Scale & Guide",
      description: "Share your frameworks, guide others, build systems",
      icon: TrendingUp,
      color: "from-purple-500/40 to-indigo-500/40"
    }
  ];

  const frameworks = [
    {
      name: "ISO 27001 Compliance",
      description: "Design and implement security frameworks",
      icon: Shield,
      benefit: "Build trust with enterprise-grade security"
    },
    {
      name: "Process Documentation",
      description: "Create SOPs and operational frameworks",
      icon: FileText,
      benefit: "Scale your operations systematically"
    },
    {
      name: "Automation Architecture",
      description: "Design system integrations and workflows",
      icon: Settings,
      benefit: "Reduce manual work and errors"
    },
    {
      name: "Security Baselines",
      description: "Establish security guardrails and policies",
      icon: Lock,
      benefit: "Protect your business from day one"
    }
  ];

  const examples = [
    {
      title: "Security Framework",
      description: "Design ISO 27001 compliance framework for startups",
      impact: "100+ companies secured",
      icon: Shield
    },
    {
      title: "Process Automation",
      description: "Create automation templates and workflows",
      impact: "70% time saved",
      icon: Zap
    },
    {
      title: "Knowledge Base",
      description: "Build comprehensive documentation and SOPs",
      impact: "Team efficiency 3x",
      icon: FileText
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % journey.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <motion.section 
        style={{ opacity, scale }}
        className="relative pt-24 pb-16 px-4 sm:px-6 md:px-8 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-indigo-500/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.15),transparent_50%)]" />
        
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
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/30 text-purple-400 text-sm font-medium mb-6"
            >
              <Compass className="w-4 h-4" />
              <span>The Architect</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6"
            >
              <span className="block text-foreground">You Design.</span>
              <span className="block bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent animate-pulse">
                We Structure.
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8"
            >
              CISOs, CTOs, strategists, and compliance experts who build systems and frameworks.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-lg shadow-purple-500/30"
              >
                <Building2 className="mr-2 w-5 h-5" />
                Start Designing
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
              >
                <FileText className="mr-2 w-5 h-5" />
                Join WonderLand
              </Button>
            </motion.div>
          </motion.div>

          {/* Journey Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto"
          >
            {journey.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="cursor-pointer"
                >
                  <Card className={`border-purple-500/20 bg-gradient-to-br ${step.color} backdrop-blur-sm h-full transition-all duration-300 ${
                    currentStep === index ? 'ring-2 ring-purple-500 shadow-lg shadow-purple-500/30' : ''
                  }`}>
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="text-xs font-semibold text-purple-400 mb-2">
                        {step.stage}
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-2">
                        {step.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {step.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </motion.section>

      {/* Your Journey */}
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
              Your Journey as an Architect
            </h2>
            <p className="text-lg text-muted-foreground">
              From learning to designing to scaling systems and frameworks
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[
              {
                title: "In WonderLand",
                subtitle: "Learn & Share",
                items: [
                  "Attend security and compliance workshops",
                  "Share frameworks and best practices",
                  "Learn from other architects",
                  "Contribute to knowledge base"
                ]
              },
              {
                title: "In SmartStart",
                subtitle: "Design & Structure",
                items: [
                  "Create ISO 27001 compliance frameworks",
                  "Design automation and process templates",
                  "Build security baselines and SOPs",
                  "Share your frameworks with the community"
                ]
              }
            ].map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="border-purple-500/20 bg-card/50 backdrop-blur-sm h-full transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center">
                        <Target className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-foreground">
                          {section.title}
                        </h3>
                        <p className="text-sm text-purple-400 font-semibold">
                          {section.subtitle}
                        </p>
                      </div>
                    </div>
                    <ul className="space-y-3">
                      {section.items.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Architect Tools */}
      <section className="py-16 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-purple-500/5 to-indigo-500/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
              Frameworks You Can Build
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to design systems and create structure
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {frameworks.map((framework, index) => {
              const Icon = framework.icon;
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
                  <Card className="border-purple-500/20 bg-card/50 backdrop-blur-sm h-full transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-2">
                        {framework.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {framework.description}
                      </p>
                      <p className="text-sm text-purple-400 font-semibold">
                        {framework.benefit}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Architect Examples */}
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
              What Architects Create
            </h2>
            <p className="text-lg text-muted-foreground">
              Real examples of frameworks and systems architects build
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {examples.map((example, index) => {
              const Icon = example.icon;
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
                  <Card className="border-purple-500/20 bg-card/50 backdrop-blur-sm h-full transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-foreground">
                            {example.title}
                          </h3>
                          <p className="text-xs text-purple-400 font-semibold">
                            {example.impact}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {example.description}
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
      <section className="py-16 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-purple-500/10 to-indigo-500/10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 backdrop-blur-sm hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300">
              <CardContent className="p-12">
                <Compass className="w-16 h-16 mx-auto mb-6 text-purple-500" />
                <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
                  Ready to Design?
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Join WonderLand to learn and share frameworks, or upgrade to SmartStart to access tools that help you design and implement systems.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-lg shadow-purple-500/30"
                  >
                    <Building2 className="mr-2 w-5 h-5" />
                    Join SmartStart
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                  >
                    <FileText className="mr-2 w-5 h-5" />
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
  );
}

