import React from 'react';
import { motion } from 'framer-motion';
import { Code, Shield, Zap, Database, CheckCircle, ArrowRight, Phone, Eye, Lock, Cpu, Globe, CreditCard } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const SmartStartPlatform: React.FC = () => {
  const modules = [
    {
      icon: Shield,
      title: "Authentication & Authorization",
      description: "JWT, OAuth, RBAC - Enterprise-grade security from day one. Built with zero-trust principles and post-quantum security considerations.",
      features: ["JWT token management", "OAuth 2.0 integration", "Role-based access control", "Multi-factor authentication"]
    },
    {
      icon: CreditCard,
      title: "Billing & Payments",
      description: "Seamless integration with Stripe and Zoho for subscription management, invoicing, and payment processing.",
      features: ["Stripe integration", "Zoho CRM sync", "Subscription management", "Automated invoicing"]
    },
    {
      icon: Cpu,
      title: "AI Assistants",
      description: "LangChain, Ollama, and local embeddings for intelligent automation and natural language processing capabilities.",
      features: ["LangChain integration", "Ollama local AI", "Local embeddings", "Natural language processing"]
    },
    {
      icon: Shield,
      title: "Compliance Framework",
      description: "ISO 27001/27799 templates and automation tools for maintaining compliance without bureaucracy.",
      features: ["ISO 27001 templates", "ISO 27799 compliance", "Automated documentation", "Audit trail generation"]
    },
    {
      icon: Globe,
      title: "Geo & Mapbox Integration",
      description: "Advanced mapping capabilities built from Caribou Trail and Trakkit experience for location-based services.",
      features: ["Mapbox integration", "Geolocation services", "Route optimization", "Location analytics"]
    },
    {
      icon: Database,
      title: "Multi-Tenant Architecture",
      description: "Secure, scalable multi-tenant system with comprehensive audit logs and BUZ Ledger utility credit system.",
      features: ["Multi-tenant security", "Audit logging", "BUZ Ledger system", "Scalable architecture"]
    }
  ];

  const techStack = [
    "Node.js/Next.js - Modern JavaScript runtime and framework",
    "Prisma + PostgreSQL - Type-safe database access and management",
    "Mapbox - Advanced mapping and location services",
    "AI Integrations - LangChain, Ollama, local embeddings",
    "ISO-Grade Encryption - Enterprise-level security standards",
    "Zero-Trust Architecture - Security-first design principles"
  ];

  const benefits = [
    "Pre-built, battle-tested modules from real ventures",
    "Security-first architecture with compliance built-in",
    "Scalable multi-tenant system with audit trails",
    "AI-powered automation and intelligent features",
    "Geographic and location-based service capabilities",
    "Integrated billing and subscription management",
    "Zero-trust security with post-quantum considerations",
    "Comprehensive documentation and support"
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
              <Code className="w-4 h-4 mr-2" />
              SmartStart Platform
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
              Core Technology
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600"> Framework</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8">
              AliceSolutions' reusable codebase and API system built from Udi's proven stack. 
              Next.js 14/15, Node.js, Prisma + PostgreSQL, Mapbox, AI integrations, and ISO-grade encryption.
              Multi-tenant architecture with enterprise-grade security and compliance built-in.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700 text-white">
                <Eye className="w-5 h-5 mr-2" />
                Browse Platform Modules
              </Button>
              <Button size="lg" variant="outline" className="border-cyan-600 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950">
                <Phone className="w-5 h-5 mr-2" />
                Schedule Technical Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Modules Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Platform Modules
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Comprehensive, battle-tested modules built from real venture experience
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {modules.map((module, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900 rounded-lg flex items-center justify-center mb-4">
                      <module.icon className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                      {module.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 mb-4">
                      {module.description}
                    </p>
                    <div className="space-y-2">
                      {module.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-cyan-600 dark:text-cyan-400 flex-shrink-0" />
                          <span className="text-sm text-slate-600 dark:text-slate-300">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                Proven Technology Stack
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
                Built from years of experience developing secure, scalable applications. 
                Every technology choice is battle-tested in real production environments.
              </p>
              <div className="space-y-4">
                {techStack.map((tech, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-cyan-600 dark:text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300">{tech}</span>
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
                  <h3 className="text-2xl font-bold mb-2">Security First</h3>
                  <p className="text-cyan-100">Built with zero-trust principles</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1">ISO</div>
                    <div className="text-cyan-100 text-sm">Compliant</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1">Zero</div>
                    <div className="text-cyan-100 text-sm">Trust</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1">Post</div>
                    <div className="text-cyan-100 text-sm">Quantum</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1">Drift</div>
                    <div className="text-cyan-100 text-sm">Lock</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Why Choose SmartStart Platform?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Built from real experience, designed for real results
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="flex items-start gap-4"
              >
                <div className="w-8 h-8 bg-cyan-100 dark:bg-cyan-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <span className="text-slate-700 dark:text-slate-300">{benefit}</span>
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
              Ready to Build on SmartStart Platform?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
              Access our proven technology framework and start building secure, 
              scalable applications from day one.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700 text-white">
                <Eye className="w-5 h-5 mr-2" />
                Browse Platform Modules
              </Button>
              <Button size="lg" variant="outline" className="border-slate-300 dark:border-slate-600">
                <Phone className="w-5 h-5 mr-2" />
                Schedule Technical Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SmartStartPlatform;
