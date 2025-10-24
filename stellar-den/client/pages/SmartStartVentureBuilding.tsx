import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, Users, Target, CheckCircle, ArrowRight, Phone, Eye, Building2, Zap, Shield, Award, TrendingUp } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const SmartStartVentureBuilding: React.FC = () => {
  const ventures = [
    {
      name: "Table Go",
      description: "Restaurant and table management application revolutionizing dining experiences",
      role: "35% Co-Founder",
      status: "Active Development"
    },
    {
      name: "MovedIn",
      description: "Moving automation platform streamlining relocation processes",
      role: "10% Co-Founder",
      status: "Active Development"
    },
    {
      name: "Delta",
      description: "SOAR marketing platform for enhanced customer engagement",
      role: "Partnered with Arty",
      status: "Active Development"
    },
    {
      name: "Syncary",
      description: "Monday.com-class operations platform for team collaboration",
      role: "Technical Co-Founder",
      status: "Active Development"
    },
    {
      name: "Clinic-e",
      description: "Comprehensive clinic CRM built with Brian for healthcare management",
      role: "Co-Built with Brian",
      status: "Active Development"
    }
  ];

  const coBuildModel = [
    {
      title: "Equity Partnership",
      description: "SmartStart takes 10-20% equity in exchange for comprehensive technical and strategic support."
    },
    {
      title: "Architecture & Development",
      description: "Handles technical architecture, development roadmap, and implementation until launch."
    },
    {
      title: "ISO Compliance",
      description: "Ensures security-first development with built-in compliance and audit-ready documentation."
    },
    {
      title: "Strategic Guidance",
      description: "Provides ongoing strategic guidance and mentorship throughout the development process."
    }
  ];

  const benefits = [
    "Access to proven technical architecture and development frameworks",
    "Built-in security and compliance from day one",
    "Strategic guidance from experienced entrepreneurs and CISO",
    "Comprehensive technical support until launch",
    "Equity partnership model aligned with success",
    "ISO-compliant development processes",
    "Access to SmartStart platform and tools",
    "Ongoing mentorship and strategic guidance"
  ];

  const process = [
    {
      step: "01",
      title: "Initial Assessment",
      description: "Evaluate the venture idea, market potential, and technical requirements."
    },
    {
      step: "02",
      title: "Partnership Agreement",
      description: "Define equity structure, roles, and responsibilities for the co-build partnership."
    },
    {
      step: "03",
      title: "Technical Architecture",
      description: "Design secure, scalable architecture with compliance built-in from the start."
    },
    {
      step: "04",
      title: "Development & Launch",
      description: "Execute development roadmap with ongoing strategic guidance and support."
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
              <Rocket className="w-4 h-4 mr-2" />
              Venture Building
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
              Hands-On Co-Building
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600"> Program</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8">
              SmartStart Venture Building is where Udi and his team co-build startups alongside founders. 
              We take 10-20% equity, handle architecture, ISO compliance, and tech roadmap until launch.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700 text-white">
                <Rocket className="w-5 h-5 mr-2" />
                Apply for Venture Building
              </Button>
              <Button size="lg" variant="outline" className="border-cyan-600 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950">
                <Eye className="w-5 h-5 mr-2" />
                View Portfolio
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Ventures Portfolio */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            Vetures Portfolio
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Real ventures built through our co-building program
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {ventures.map((venture, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        {venture.status}
                      </Badge>
                      <TrendingUp className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                      {venture.name}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 mb-4">
                      {venture.description}
                    </p>
                    <div className="text-sm text-cyan-600 dark:text-cyan-400 font-medium">
                      {venture.role}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Co-Build Model */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Co-Build Model
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              How we partner with founders to build successful ventures
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {coBuildModel.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900 rounded-lg flex items-center justify-center mb-4">
                      <Target className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                      {item.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate- Ç0 dark:text-white mb-4">
              Co-Build Process
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Our proven 4-step approach to venture co-building
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {process.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-cyan-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                Why Choose Co-Building?
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
                Our co-building approach provides comprehensive support while maintaining 
                alignment through equity partnership. Built from real experience with successful ventures.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-cyan-600 dark:text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300">{benefit}</span>
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
                  <h3 className="text-2xl font-bold mb-2">Proven Results</h3>
                  <p className="text-cyan-100">Real ventures, real success</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1">5+</div>
                    <div className="text-cyan-100 text-sm">Active Ventures</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1">100%</div>
                    <div className="text-cyan-100 text-sm">Security First</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1">ISO</div>
                    <div className="text-cyan-100 text-sm">Compliant</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1">Co-Build</div>
                    <div className="text-cyan-100 text-sm">Model</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
              Ready to Co-Build Your Venture?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
              Join our co-building program and get comprehensive technical and strategic support 
              from experienced entrepreneurs and cybersecurity experts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700 text-white">
                <Rocket className="w-5 h-5 mr-2" />
                Apply for Venture Building
              </Button>
              <Button size="lg" variant="outline" className="border-slate-300 dark:border-slate-600">
                <Phone className="w-5 h-5 mr-2" />
                Schedule Discovery Call
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SmartStartVentureBuilding;
