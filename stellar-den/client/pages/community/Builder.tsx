import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Rocket,
  Code,
  Zap,
  Hammer,
  ArrowRight,
  CheckCircle2,
  Flame,
  Target,
  Gauge,
  Layers,
  Sparkles,
  TrendingUp,
  Users,
  Shield,
  Lightbulb
} from "lucide-react";

export default function Builder() {
  const [currentStep, setCurrentStep] = useState(0);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);

  const journey = [
    {
      stage: "WonderLand",
      title: "Connect & Learn",
      description: "Join events, meet other builders, share ideas",
      icon: Users,
      color: "from-orange-500/20 to-red-500/20"
    },
    {
      stage: "SmartStart",
      title: "Build & Launch",
      description: "Access tools, automation, and infrastructure to build fast",
      icon: Rocket,
      color: "from-orange-500/30 to-red-500/30"
    },
    {
      stage: "Impact",
      title: "Scale & Mentor",
      description: "Launch your project and help other builders",
      icon: TrendingUp,
      color: "from-orange-500/40 to-red-500/40"
    }
  ];

  const tools = [
    {
      name: "Zoho Suite",
      description: "CRM, Projects, Books, Mail, Cliq",
      icon: Layers,
      benefit: "Build your MVP in days, not months"
    },
    {
      name: "Automation Templates",
      description: "Pre-built workflows and integrations",
      icon: Zap,
      benefit: "Reduce manual work by 70%"
    },
    {
      name: "Acronis Backup",
      description: "Enterprise-grade security & backup",
      icon: Shield,
      benefit: "Sleep well knowing your work is safe"
    },
    {
      name: "Mentorship",
      description: "Direct access to Udi & industry experts",
      icon: Lightbulb,
      benefit: "Learn from builders who've been there"
    }
  ];

  const examples = [
    {
      title: "SaaS MVP",
      description: "Launch your SaaS product with built-in CRM, automation, and security",
      time: "2-4 weeks",
      icon: Code
    },
    {
      title: "Automation Platform",
      description: "Build workflow automation tools using Zoho integrations",
      time: "3-6 weeks",
      icon: Zap
    },
    {
      title: "API Integration",
      description: "Connect multiple services with pre-built connectors",
      time: "1-2 weeks",
      icon: Gauge
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
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-red-500/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,146,60,0.15),transparent_50%)]" />
        
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
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 text-orange-400 text-sm font-medium mb-6"
            >
              <Flame className="w-4 h-4" />
              <span>The Builder</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6"
            >
              <span className="block text-foreground">You Build.</span>
              <span className="block bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 bg-clip-text text-transparent animate-pulse">
                We Empower.
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8"
            >
              Solo founders, developers, and technical freelancers who turn ideas into reality.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg shadow-orange-500/30"
              >
                <Rocket className="mr-2 w-5 h-5" />
                Start Building
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
              >
                <Users className="mr-2 w-5 h-5" />
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
                  <Card className={`border-orange-500/20 bg-gradient-to-br ${step.color} backdrop-blur-sm h-full transition-all duration-300 ${
                    currentStep === index ? 'ring-2 ring-orange-500 shadow-lg shadow-orange-500/30' : ''
                  }`}>
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="text-xs font-semibold text-orange-400 mb-2">
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
              Your Journey as a Builder
            </h2>
            <p className="text-lg text-muted-foreground">
              From idea to launch, we provide the tools and support you need
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[
              {
                title: "In WonderLand",
                subtitle: "Connect & Learn",
                items: [
                  "Attend Beer + Security meetups",
                  "Join Launch & Learn workshops",
                  "Network with other builders",
                  "Share your projects and get feedback"
                ]
              },
              {
                title: "In SmartStart",
                subtitle: "Build & Launch",
                items: [
                  "Access Zoho suite and automation tools",
                  "Get mentorship from experienced builders",
                  "Use pre-built templates and workflows",
                  "Launch your MVP with enterprise security"
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
                <Card className="border-orange-500/20 bg-card/50 backdrop-blur-sm h-full transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                        <Target className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-foreground">
                          {section.title}
                        </h3>
                        <p className="text-sm text-orange-400 font-semibold">
                          {section.subtitle}
                        </p>
                      </div>
                    </div>
                    <ul className="space-y-3">
                      {section.items.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
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

      {/* Tools for Builders */}
      <section className="py-16 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-orange-500/5 to-red-500/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
              Tools That Accelerate Your Build
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to build faster, smarter, and more securely
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tools.map((tool, index) => {
              const Icon = tool.icon;
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
                  <Card className="border-orange-500/20 bg-card/50 backdrop-blur-sm h-full transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-2">
                        {tool.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {tool.description}
                      </p>
                      <p className="text-sm text-orange-400 font-semibold">
                        {tool.benefit}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Build Examples */}
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
              What You Can Build
            </h2>
            <p className="text-lg text-muted-foreground">
              Real examples of what builders create with SmartStart
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
                  <Card className="border-orange-500/20 bg-card/50 backdrop-blur-sm h-full transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-foreground">
                            {example.title}
                          </h3>
                          <p className="text-xs text-orange-400 font-semibold">
                            {example.time}
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
      <section className="py-16 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-orange-500/10 to-red-500/10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Card className="border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-red-500/5 backdrop-blur-sm hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300">
              <CardContent className="p-12">
                <Sparkles className="w-16 h-16 mx-auto mb-6 text-orange-500" />
                <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
                  Ready to Build?
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Join WonderLand to connect with builders, or upgrade to SmartStart to access the tools and infrastructure you need to build faster.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg shadow-orange-500/30"
                  >
                    <Rocket className="mr-2 w-5 h-5" />
                    Join SmartStart
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                  >
                    <Users className="mr-2 w-5 h-5" />
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

