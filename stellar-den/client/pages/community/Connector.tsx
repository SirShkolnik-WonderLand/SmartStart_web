import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Network,
  Users,
  Link2,
  ArrowRight,
  CheckCircle2,
  Globe,
  MessageSquare,
  Handshake,
  Sparkles,
  TrendingUp,
  Calendar,
  Share2,
  Heart,
  Zap
} from "lucide-react";

export default function Connector() {
  const [currentStep, setCurrentStep] = useState(0);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);

  const journey = [
    {
      stage: "WonderLand",
      title: "Connect & Share",
      description: "Join events, meet people, build relationships",
      icon: Users,
      color: "from-teal-500/20 to-green-500/20"
    },
    {
      stage: "SmartStart",
      title: "Amplify & Grow",
      description: "Use tools to connect people and resources",
      icon: Network,
      color: "from-teal-500/30 to-green-500/30"
    },
    {
      stage: "Impact",
      title: "Lead & Inspire",
      description: "Host events, moderate sessions, grow the community",
      icon: Sparkles,
      color: "from-teal-500/40 to-green-500/40"
    }
  ];

  const superpowers = [
    {
      name: "Event Hosting",
      description: "Organize and moderate community events",
      icon: Calendar,
      benefit: "Build your reputation as a community leader"
    },
    {
      name: "Network Building",
      description: "Connect people with opportunities and resources",
      icon: Network,
      benefit: "Create value for everyone in the ecosystem"
    },
    {
      name: "Content Sharing",
      description: "Spread ideas, tools, and knowledge",
      icon: Share2,
      benefit: "Help others discover what they need"
    },
    {
      name: "Community Growth",
      description: "Onboard new members and support their journey",
      icon: TrendingUp,
      benefit: "Watch the community thrive because of you"
    }
  ];

  const examples = [
    {
      title: "Beer + Security Host",
      description: "Organize monthly meetups, connect security professionals",
      impact: "50+ connections",
      icon: Handshake
    },
    {
      title: "Launch & Learn Moderator",
      description: "Lead workshops, facilitate discussions, share knowledge",
      impact: "100+ people helped",
      icon: MessageSquare
    },
    {
      title: "Community Ambassador",
      description: "Onboard new members, answer questions, spread the word",
      impact: "Growing the tribe",
      icon: Heart
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
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-green-500/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,184,166,0.15),transparent_50%)]" />
        
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
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-teal-500/20 to-green-500/20 border border-teal-500/30 text-teal-400 text-sm font-medium mb-6"
            >
              <Network className="w-4 h-4" />
              <span>The Connector</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6"
            >
              <span className="block text-foreground">You Connect.</span>
              <span className="block bg-gradient-to-r from-teal-500 via-green-500 to-teal-500 bg-clip-text text-transparent animate-pulse">
                We Amplify.
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8"
            >
              Community managers, networkers, and operations leads who bring people together.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                size="lg"
                className="bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600 text-white shadow-lg shadow-teal-500/30"
              >
                <Network className="mr-2 w-5 h-5" />
                Start Connecting
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-teal-500/30 text-teal-400 hover:bg-teal-500/10"
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
                  <Card className={`border-teal-500/20 bg-gradient-to-br ${step.color} backdrop-blur-sm h-full transition-all duration-300 ${
                    currentStep === index ? 'ring-2 ring-teal-500 shadow-lg shadow-teal-500/30' : ''
                  }`}>
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-teal-500 to-green-500 flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="text-xs font-semibold text-teal-400 mb-2">
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

      {/* Your Superpowers */}
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
              Your Superpowers as a Connector
            </h2>
            <p className="text-lg text-muted-foreground">
              The skills and opportunities that make you invaluable to the community
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[
              {
                title: "In WonderLand",
                subtitle: "Connect & Share",
                items: [
                  "Host Beer + Security meetups",
                  "Moderate Launch & Learn workshops",
                  "Share resources and opportunities",
                  "Introduce people who should know each other"
                ]
              },
              {
                title: "In SmartStart",
                subtitle: "Amplify & Grow",
                items: [
                  "Use Zoho Cliq to organize events",
                  "Access tools to manage community",
                  "Get support for event planning",
                  "Grow your network and influence"
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
                <Card className="border-teal-500/20 bg-card/50 backdrop-blur-sm h-full transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/20">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-teal-500 to-green-500 flex items-center justify-center">
                        <Link2 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-foreground">
                          {section.title}
                        </h3>
                        <p className="text-sm text-teal-400 font-semibold">
                          {section.subtitle}
                        </p>
                      </div>
                    </div>
                    <ul className="space-y-3">
                      {section.items.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-teal-500 mt-0.5 flex-shrink-0" />
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

      {/* Connector Tools */}
      <section className="py-16 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-teal-500/5 to-green-500/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
              Tools That Amplify Your Impact
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to connect people and grow the community
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {superpowers.map((power, index) => {
              const Icon = power.icon;
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
                  <Card className="border-teal-500/20 bg-card/50 backdrop-blur-sm h-full transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/20">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-teal-500 to-green-500 flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-2">
                        {power.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {power.description}
                      </p>
                      <p className="text-sm text-teal-400 font-semibold">
                        {power.benefit}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Connector Examples */}
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
              How Connectors Make an Impact
            </h2>
            <p className="text-lg text-muted-foreground">
              Real examples of how connectors grow the community
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
                  <Card className="border-teal-500/20 bg-card/50 backdrop-blur-sm h-full transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/20">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-teal-500 to-green-500 flex items-center justify-center">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-foreground">
                            {example.title}
                          </h3>
                          <p className="text-xs text-teal-400 font-semibold">
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
      <section className="py-16 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-teal-500/10 to-green-500/10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Card className="border-teal-500/20 bg-gradient-to-br from-teal-500/5 to-green-500/5 backdrop-blur-sm hover:shadow-lg hover:shadow-teal-500/30 transition-all duration-300">
              <CardContent className="p-12">
                <Globe className="w-16 h-16 mx-auto mb-6 text-teal-500" />
                <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
                  Ready to Connect?
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Join WonderLand to connect with the community, or upgrade to SmartStart to access tools that help you amplify your impact.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600 text-white shadow-lg shadow-teal-500/30"
                  >
                    <Network className="mr-2 w-5 h-5" />
                    Join SmartStart
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-teal-500/30 text-teal-400 hover:bg-teal-500/10"
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

