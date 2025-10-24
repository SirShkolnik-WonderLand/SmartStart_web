import React from 'react';
import { motion } from 'framer-motion';
import { Shield, FileText, Zap, CheckCircle, ArrowRight, Phone, Eye, Lock, Target, Building2, Users, Award } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const SmartStartEnterpriseTools: React.FC = () => {
  const tools = [
    {
      icon: FileText,
      title: "ISO Studio",
      description: "Complete evidence automation toolkit for ISO 27001, 27799, and 9001 compliance. Built from years of auditing experience with Plasan Sasa, Helen Doron, and Cannabis.co.il.",
      features: [
        "Automated evidence collection",
        "Compliance gap analysis",
        "Audit trail generation",
        "Policy template library"
      ]
    },
    {
      icon: Shield,
      title: "Policy Pack",
      description: "Pre-audited templates for InfoSec, privacy, and incident response. Ready-to-use policies that have been tested in real enterprise environments.",
      features: [
        "InfoSec policy templates",
        "Privacy compliance frameworks",
        "Incident response procedures",
        "Risk assessment tools"
      ]
    },
    {
      icon: Zap,
      title: "Compliance Automation",
      description: "Automated vendor risk management, key rotation, backups, and SOC/NIST cross-mapping. Reduce manual compliance overhead while maintaining security standards.",
      features: [
        "Vendor risk assessment",
        "Automated key rotation",
        "Backup compliance monitoring",
        "SOC/NIST cross-mapping"
      ]
    }
  ];

  const securityFeatures = [
    "Zero-trust architecture implementation",
    "Post-quantum security considerations",
    "DriftLock encryption (Udi's R&D project)",
    "Multi-layered security controls",
    "Continuous compliance monitoring",
    "Automated threat detection and response",
    "Identity and access management",
    "Data loss prevention systems"
  ];

  const experience = [
    {
      company: "Plasan Sasa",
      description: "ISO 27001 compliance audit and implementation"
    },
    {
      company: "Helen Doron",
      description: "ISO 27001 and 27799 compliance framework development"
    },
    {
      company: "Cannabis.co.il",
      description: "ISO 27001, 27799, and 9001 comprehensive compliance program"
    }
  ];

  const benefits = [
    "Built from real enterprise auditing experience",
    "Pre-audited templates and frameworks",
    "Automated compliance monitoring and reporting",
    "Zero-trust security architecture",
    "Post-quantum security considerations",
    "DriftLock encryption integration",
    "Continuous compliance automation",
    "Enterprise-grade security controls"
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
              <Shield className="w-4 h-4 mr-2" />
              Enterprise Tools
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
              ISO & Cybersecurity
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600"> Suite</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8">
              SmartStart's enterprise-grade security and compliance tools, built from Udi's professional experience 
              auditing Plasan Sasa, Helen Doron, and Cannabis.co.il under ISO 27001, 27799, and 9001.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700 text-white">
                <Eye className="w-5 h-5 mr-2" />
                See Enterprise Tools
              </Button>
              <Button size="lg" variant="outline" className="border-cyan-600 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950">
                <Phone className="w-5 h-5 mr-2" />
                Schedule Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Enterprise Security Tools
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Comprehensive security and compliance solutions built from real enterprise experience
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {tools.map((tool, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900 rounded-lg flex items-center justify-center mb-4">
                      <tool.icon className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                      {tool.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 mb-4">
                      {tool.description}
                    </p>
                    <div className="space-y-2">
                      {tool.features.map((feature, featureIndex) => (
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

      {/* Security Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                Advanced Security Features
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
                SmartStart's enterprise tools are built with cutting-edge security features, 
                including zero-trust architecture, post-quantum security, and DriftLock encryption.
              </p>
              <div className="grid grid-cols-1 gap-4">
                {securityFeatures.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-cyan-600 dark:text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300">{feature}</span>
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
                  <h3 className="text-2xl font-bold mb-2">Proven Experience</h3>
                  <p className="text-cyan-100">Real enterprise auditing background</p>
                </div>
                <div className="space-y-4">
                  {experience.map((exp, index) => (
                    <div key={index} className="text-center">
                      <div className="text-lg font-bold mb-1">{exp.company}</div>
                      <div className="text-cyan-100 text-sm">{exp.description}</div>
                    </div>
                  ))}
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
              Why Choose SmartStart Enterprise Tools?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Built from real enterprise experience, designed for real security challenges
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
              Ready to Secure Your Enterprise?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
              Access our enterprise-grade security and compliance tools, built from years 
              of real-world auditing experience and cutting-edge security research.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700 text-white">
                <Eye className="w-5 h-5 mr-2" />
                See Enterprise Tools
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

export default SmartStartEnterpriseTools;
