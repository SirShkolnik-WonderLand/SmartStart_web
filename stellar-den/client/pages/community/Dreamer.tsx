import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Sidebar from '@/components/Sidebar';
import { useSidebar } from '@/contexts/SidebarContext';
import Footer from "@/components/Footer";
import {
  Sparkles,
  Lightbulb,
  ArrowRight,
  CheckCircle2,
  Star,
  Heart,
  Rocket,
  TrendingUp,
  Users,
  BookOpen,
  Target,
  Zap,
  Compass,
  Flower2
} from "lucide-react";

export default function Dreamer() {
  const [currentStep, setCurrentStep] = useState(0);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);

  const journey = [
    {
      stage: "WonderLand",
      title: "Dream & Explore",
      description: "Join events, meet mentors, explore possibilities",
      icon: Star,
      color: "from-pink-500/20 to-rose-500/20"
    },
    {
      stage: "SmartStart",
      title: "Plan & Structure",
      description: "Turn your vision into a structured plan with mentorship",
      icon: Compass,
      color: "from-pink-500/30 to-rose-500/30"
    },
    {
      stage: "Impact",
      title: "Launch & Grow",
      description: "Bring your idea to life and inspire others",
      icon: Rocket,
      color: "from-pink-500/40 to-rose-500/40"
    }
  ];

  const superpowers = [
    {
      name: "Vision Clarity",
      description: "Turn your big idea into a clear, actionable plan",
      icon: Lightbulb,
      benefit: "Know exactly what to build and why"
    },
    {
      name: "Mentorship",
      description: "Get guidance from experienced entrepreneurs",
      icon: Users,
      benefit: "Learn from those who've walked the path"
    },
    {
      name: "Structured Planning",
      description: "Use frameworks to organize your thoughts",
      icon: BookOpen,
      benefit: "Break down your vision into steps"
    },
    {
      name: "Community Support",
      description: "Connect with other dreamers and builders",
      icon: Heart,
      benefit: "You're not alone in your journey"
    }
  ];

  const examples = [
    {
      title: "Idea Validation",
      description: "Test your concept with real users and feedback",
      impact: "90% better ideas",
      icon: Target
    },
    {
      title: "Business Plan",
      description: "Create a structured plan for your vision",
      impact: "Clear roadmap",
      icon: Compass
    },
    {
      title: "First Launch",
      description: "Turn your dream into your first product",
      impact: "From idea to reality",
      icon: Rocket
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
      <Sidebar />

      {/* Hero Section */}
      <motion.section 
        style={{ opacity, scale }}
        className="relative pt-8 pb-16 px-4 sm:px-6 md:px-8 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-transparent to-rose-500/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(236,72,153,0.15),transparent_50%)]" />
        
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
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500/20 to-rose-500/20 border border-pink-500/30 text-pink-400 text-sm font-medium mb-6"
            >
              <Flower2 className="w-4 h-4" />
              <span>The Dreamer</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6"
            >
              <span className="block text-foreground">You Dream.</span>
              <span className="block bg-gradient-to-r from-pink-500 via-rose-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
                We Guide.
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8"
            >
              Early-stage creatives, idea-stage founders, and innovators who turn visions into reality.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                size="lg"
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg shadow-pink-500/30"
              >
                <Sparkles className="mr-2 w-5 h-5" />
                Start Dreaming
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-pink-500/30 text-pink-400 hover:bg-pink-500/10"
              >
                <Star className="mr-2 w-5 h-5" />
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
                  <Card className={`border-pink-500/20 bg-gradient-to-br ${step.color} backdrop-blur-sm h-full transition-all duration-300 ${
                    currentStep === index ? 'ring-2 ring-pink-500 shadow-lg shadow-pink-500/30' : ''
                  }`}>
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="text-xs font-semibold text-pink-400 mb-2">
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
              Your Journey as a Dreamer
            </h2>
            <p className="text-lg text-muted-foreground">
              From vision to reality - we help you structure your dreams
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[
              {
                title: "In WonderLand",
                subtitle: "Dream & Explore",
                items: [
                  "Attend Launch & Learn workshops",
                  "Meet mentors and other dreamers",
                  "Explore different ideas and paths",
                  "Get inspired by real success stories"
                ]
              },
              {
                title: "In SmartStart",
                subtitle: "Plan & Structure",
                items: [
                  "Turn your vision into a structured plan",
                  "Get mentorship from experienced entrepreneurs",
                  "Use frameworks to organize your thoughts",
                  "Connect with builders who can help"
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
                <Card className="border-pink-500/20 bg-card/50 backdrop-blur-sm h-full transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/20">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center">
                        <Target className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-foreground">
                          {section.title}
                        </h3>
                        <p className="text-sm text-pink-400 font-semibold">
                          {section.subtitle}
                        </p>
                      </div>
                    </div>
                    <ul className="space-y-3">
                      {section.items.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-pink-500 mt-0.5 flex-shrink-0" />
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

      {/* Dreamer Superpowers */}
      <section className="py-16 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-pink-500/5 to-rose-500/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
              Your Superpowers as a Dreamer
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to turn your vision into a reality
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
                  <Card className="border-pink-500/20 bg-card/50 backdrop-blur-sm h-full transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/20">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-2">
                        {power.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {power.description}
                      </p>
                      <p className="text-sm text-pink-400 font-semibold">
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

      {/* Dreamer Examples */}
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
              What Dreamers Achieve
            </h2>
            <p className="text-lg text-muted-foreground">
              Real examples of how dreamers turn visions into reality
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
                  <Card className="border-pink-500/20 bg-card/50 backdrop-blur-sm h-full transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/20">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-foreground">
                            {example.title}
                          </h3>
                          <p className="text-xs text-pink-400 font-semibold">
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
      <section className="py-16 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-pink-500/10 to-rose-500/10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Card className="border-pink-500/20 bg-gradient-to-br from-pink-500/5 to-rose-500/5 backdrop-blur-sm hover:shadow-lg hover:shadow-pink-500/30 transition-all duration-300">
              <CardContent className="p-12">
                <Star className="w-16 h-16 mx-auto mb-6 text-pink-500" />
                <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
                  Ready to Dream?
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Join WonderLand to explore ideas and meet mentors, or upgrade to SmartStart to get structured guidance and turn your vision into reality.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg shadow-pink-500/30"
                    onClick={() => {
                      const checkoutUrl = import.meta.env.VITE_STRIPE_CHECKOUT_URL;
                      if (checkoutUrl) {
                        window.open(checkoutUrl, '_blank');
                      } else {
                        console.error('Stripe checkout URL not configured. Please set VITE_STRIPE_CHECKOUT_URL environment variable.');
                      }
                    }}
                  >
                    <Sparkles className="mr-2 w-5 h-5" />
                    Join SmartStart
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-pink-500/30 text-pink-400 hover:bg-pink-500/10"
                  >
                    <Star className="mr-2 w-5 h-5" />
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

