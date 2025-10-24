import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Shield, Target, CheckCircle, ArrowRight, Phone, Eye, Users, Zap, Building2, Lock } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const SmartStartHub: React.FC = () => {
  const features = [
    {
      icon: BarChart3,
      title: "Dashboard of Execution",
      description: "One centralized place for goals, sprints, KPIs, and metrics. Built from years of managing secure SaaS products like Trakkit, Syncary, and C&C CRM."
    },
    {
      icon: Shield,
      title: "Security-Ready from Day One",
      description: "All actions logged and evidence-ready for ISO/NIST compliance. Every feature, sprint, and audit trace is automatically documented."
    },
    {
      icon: Target,
      title: "Built for Real Builders",
      description: "Used internally by SmartStart ventures. Not just a tool—it's the operational backbone of our entire ecosystem."
    }
  ];

  const capabilities = [
    "Real-time project tracking and sprint management",
    "Automated compliance documentation and audit trails",
    "Integrated security monitoring and incident response",
    "Cross-venture collaboration and resource sharing",
    "Performance analytics and optimization insights",
    "ISO 27001/27799 compliance automation",
    "Multi-tenant architecture with role-based access",
    "API-first design for seamless integrations"
  ];

  const testimonials = [
    {
      quote: "Everything we build runs through this hub — every feature, sprint, and audit trace.",
      author: "Udi Shkolnik",
      role: "Founder & CISO, SmartStart"
    },
    {
      quote: "The security-first approach means we never have to worry about compliance gaps.",
      author: "SmartStart Venture Team",
      role: "Internal Users"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-cyan-950">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200">
              <Building2 className="w-4 h-4 mr-2" />
              SmartStart Hub
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
              Command Center for
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600"> Idea → Build → Traction</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8">
              The SmartStart Hub is the operational backbone of our venture ecosystem. 
              Built by Udi Shkolnik (CISO, CTO, ISO auditor) after years of developing secure SaaS products.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700 text-white">
                <Eye className="w-5 h-5 mr-2" />
                See the Hub in Action
              </Button>
              <Button size="lg" variant="outline" className="border-cyan-600 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950">
                <Phone className="w-5 h-5 mr-2" />
                Schedule Demo
              </Button>
          </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Built by Experts, for Builders
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Developed from real-world experience building and securing enterprise-grade applications
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                <Card className="h-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-8">
                    <div className="w-16 h-16 bg-cyan-100 dark:bg-cyan-900 rounded-lg flex items-center justify-center mb-6">
                      <feature.icon className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
                      {feature.title}
                          </h3>
                    <p className="text-slate-600 dark:text-slate-300">
                      {feature.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                Enterprise-Grade Capabilities
            </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
                The SmartStart Hub provides comprehensive project management and compliance 
                capabilities, built from years of experience in cybersecurity and SaaS development.
              </p>
              <div className="grid grid-cols-1 gap-4">
                {capabilities.map((capability, index) => (
                <motion.div
                  key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-cyan-600 dark:text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300">{capability}</span>
                  </motion.div>
                ))}
                        </div>
                      </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-8 text-white">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">Proven Track Record</h3>
                  <p className="text-cyan-100">Built from real experience</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1">5+</div>
                    <div className="text-cyan-100 text-sm">Ventures Built</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1">ISO</div>
                    <div className="text-cyan-100 text-sm">Compliant</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1">20+</div>
                    <div className="text-cyan-100 text-sm">Years Experience</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1">100%</div>
                    <div className="text-cyan-100 text-sm">Security First</div>
                  </div>
                </div>
              </div>
                </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Trusted by Builders
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Real feedback from the people who use the Hub daily
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900 rounded-full flex items-center justify-center flex-shrink-0">
                        <Users className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                      </div>
                      <div>
                        <blockquote className="text-lg text-slate-700 dark:text-slate-300 mb-4 italic">
                          "{testimonial.quote}"
                        </blockquote>
                        <div className="text-sm">
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {testimonial.author}
                          </div>
                          <div className="text-slate-600 dark:text-slate-400">
                            {testimonial.role}
                          </div>
                        </div>
                      </div>
                    </div>
                    </CardContent>
                  </Card>
                </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
              Ready to Experience the SmartStart Hub?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
              See how our command center can transform your venture building process. 
              Built by experts, designed for builders.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700 text-white">
                <Eye className="w-5 h-5 mr-2" />
                See the Hub in Action
              </Button>
              <Button size="lg" variant="outline" className="border-slate-300 dark:border-slate-600">
                <Phone className="w-5 h-5 mr-2" />
                Schedule Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SmartStartHub;