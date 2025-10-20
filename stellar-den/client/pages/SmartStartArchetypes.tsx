import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import {
  Rocket,
  Network,
  Building2,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Zap,
  Users,
  Target,
  Lightbulb,
  Link2,
  Layers,
  Compass,
  Flame,
  Globe,
  Heart,
  Flower2,
  Infinity,
  TrendingUp
} from "lucide-react";

export default function SmartStartArchetypes() {
  const navigate = useNavigate();
  const [activeSynergy, setActiveSynergy] = useState(0);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);

  const archetypes = [
    {
      name: "The Builder",
      icon: Rocket,
      color: "from-orange-500 to-red-500",
      bgColor: "from-orange-500/20 to-red-500/20",
      description: "Solo founders, developers, technical freelancers",
      superpower: "Creation & execution",
      href: "/community/builder"
    },
    {
      name: "The Connector",
      icon: Network,
      color: "from-teal-500 to-green-500",
      bgColor: "from-teal-500/20 to-green-500/20",
      description: "Community managers, networkers, operations leads",
      superpower: "People & collaboration",
      href: "/community/connector"
    },
    {
      name: "The Architect",
      icon: Building2,
      color: "from-purple-500 to-indigo-500",
      bgColor: "from-purple-500/20 to-indigo-500/20",
      description: "CISOs, CTOs, strategists, compliance experts",
      superpower: "Systems & structure",
      href: "/community/architect"
    },
    {
      name: "The Dreamer",
      icon: Sparkles,
      color: "from-pink-500 to-rose-500",
      bgColor: "from-pink-500/20 to-rose-500/20",
      description: "Early-stage creatives, idea-stage founders",
      superpower: "Vision & transformation",
      href: "/community/dreamer"
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

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSynergy((prev) => (prev + 1) % synergies.length);
    }, 5000);
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
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
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
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6"
            >
              <Infinity className="w-4 h-4" />
              <span>The Four Archetypes</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6"
            >
              <span className="block text-foreground">1 + 1 + 1 + 1 =</span>
              <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-pulse">
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
                <Users className="mr-2 w-5 h-5" />
                Join WonderLand
              </Button>
            </motion.div>
          </motion.div>

          {/* The Four Archetypes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-16"
          >
            {archetypes.map((archetype, index) => {
              const Icon = archetype.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="cursor-pointer"
                  onClick={() => navigate(archetype.href)}
                >
                  <Card className={`border-border/50 bg-gradient-to-br ${archetype.bgColor} backdrop-blur-sm h-full transition-all duration-300 hover:shadow-lg`}>
                    <CardContent className="p-6 text-center">
                      <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${archetype.color} flex items-center justify-center mx-auto mb-4`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-2">
                        {archetype.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-2">
                        {archetype.description}
                      </p>
                      <p className="text-xs font-semibold text-primary">
                        {archetype.superpower}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </motion.section>

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
                  className="cursor-pointer"
                >
                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm h-full transition-all duration-300 hover:shadow-lg">
                    <CardContent className="p-8">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${archetype1.color} flex items-center justify-center`}>
                            <Icon1 className="w-6 h-6 text-white" />
                          </div>
                          <span className="text-2xl font-bold text-muted-foreground">+</span>
                          <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${archetype2.color} flex items-center justify-center`}>
                            <Icon2 className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${archetype1.color} flex items-center justify-center`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      
                      <h3 className="text-2xl font-bold text-foreground mb-2">
                        {synergy.title}
                      </h3>
                      <p className="text-sm text-primary font-semibold mb-4">
                        {synergy.subtitle}
                      </p>
                      <p className="text-muted-foreground mb-4">
                        {synergy.description}
                      </p>
                      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-4">
                        <p className="text-sm font-semibold text-primary mb-2">
                          Result:
                        </p>
                        <p className="text-sm text-foreground">
                          {synergy.result}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground italic">
                        {synergy.example}
                      </p>
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
            <Card className="border-primary/20 bg-card/50 backdrop-blur-sm hover:shadow-lg hover:shadow-primary/30 transition-all duration-300">
              <CardContent className="p-12">
                <Infinity className="w-16 h-16 mx-auto mb-6 text-primary" />
                <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
                  {ultimateSynergy.title}
                </h2>
                <p className="text-lg text-primary font-semibold mb-6">
                  {ultimateSynergy.subtitle}
                </p>
                <p className="text-muted-foreground mb-8">
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
                      className="flex items-start gap-3 bg-primary/5 border border-primary/10 rounded-lg p-4"
                    >
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-foreground">{result}</span>
                    </motion.div>
                  ))}
                </div>

                <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-lg p-6">
                  <p className="text-lg font-semibold text-foreground">
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
                icon: Users,
                color: "from-primary/20 to-accent/20"
              },
              {
                title: "SmartStart Hub",
                description: "Where Builders and Architects execute, supported by Connectors and inspired by Dreamers",
                icon: Zap,
                color: "from-primary/30 to-accent/30"
              },
              {
                title: "AliceSolutions Group",
                description: "Provides the secure, automated infrastructure and governance layer",
                icon: Shield,
                color: "from-primary/40 to-accent/40"
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
                  className="cursor-pointer"
                >
                  <Card className={`border-border/50 bg-gradient-to-br ${layer.color} backdrop-blur-sm h-full transition-all duration-300 hover:shadow-lg`}>
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-2">
                        {layer.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
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
      <section className="py-16 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Card className="border-primary/20 bg-card/50 backdrop-blur-sm hover:shadow-lg hover:shadow-primary/30 transition-all duration-300">
              <CardContent className="p-12">
                <TrendingUp className="w-16 h-16 mx-auto mb-6 text-primary" />
                <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
                  Ready to Find Your Archetype?
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Join WonderLand to connect with all four archetypes, or upgrade to SmartStart to access tools that help you thrive in your role.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/30"
                  >
                    <Zap className="mr-2 w-5 h-5" />
                    Join SmartStart
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-primary/30 text-primary hover:bg-primary/10"
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

