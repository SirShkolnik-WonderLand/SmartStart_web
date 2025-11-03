import React from 'react';
import { motion } from 'framer-motion';
import { Users, Target, Shield, CheckCircle, Calendar, Award, Building2, Zap } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import { useSidebar } from '@/contexts/SidebarContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const SmartStartMembership: React.FC = () => {
  const { isCollapsed } = useSidebar();
  const membershipBenefits = [
    {
      icon: Users,
      title: "Monthly Strategy Reviews",
      description: "Private sessions with Udi and the SmartStart leadership team. Work through roadmaps, product direction, and growth bottlenecks together."
    },
    {
      icon: Shield,
      title: "ISO & Compliance Frameworks",
      description: "Access to real, field-tested templates and automation tools used inside SmartStart ventures. Save months of setup time and learn how to build compliance by design."
    },
    {
      icon: Building2,
      title: "Private Community",
      description: "Join a small, trusted circle of builders — founders, CTOs, designers, and advisors who share resources and experience."
    },
    {
      icon: Zap,
      title: "Early Access to Tools",
      description: "Get first access to new SmartStart Platform features and internal tools before public release."
    }
  ];

  const idealFor = [
    {
      title: "SaaS Founders",
      description: "Building automation tools, secure platforms, or scalable ecosystems and looking for strategic alignment and clarity."
    },
    {
      title: "ISO & Security Professionals",
      description: "Developing compliance frameworks or client dashboards and seeking mentorship from a practicing CISO and ISO lead auditor."
    },
    {
      title: "Developers & Builders",
      description: "Looking to level up execution, structure their projects properly, and connect with a team that builds real products — not theory."
    }
  ];

  const membershipTiers = [
    {
      name: "Builder",
      price: "Monthly",
      description: "For individuals and small teams beginning their growth journey",
      features: [
        "Monthly strategy reviews",
        "Access to ISO templates",
        "Private community access",
        "Early tool access"
      ],
      cta: "Start Building"
    },
    {
      name: "Venture",
      price: "Custom",
      description: "For established ventures or teams seeking deeper alignment",
      features: [
        "Weekly strategy sessions",
        "Custom ISO frameworks",
        "Priority community engagement",
        "Advanced tool access",
        "Direct mentorship with leadership"
      ],
      cta: "Contact Us"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-cyan-950">
      <Sidebar />
      <div className={`transition-all duration-300 ${isCollapsed ? 'md:ml-20' : 'md:ml-72'} md:pt-0 pt-20`}>
      {/* Hero Section */}
      <section className="relative pt-8 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200">
              <Users className="w-4 h-4 mr-2" />
              SmartStart Membership
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
              A Selective Builder Program for Visionaries Who Execute
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-4">
              Join a focused circle of founders, builders, and innovators who turn ideas into measurable progress.
            </p>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8">
              SmartStart Membership connects you directly with <strong>Udi Shkolnik</strong> and the SmartStart leadership team — for strategic guidance, honest feedback, and shared growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-cyan-600 hover:bg-cyan-700 text-white"
                onClick={() => {
                  const checkoutUrl = import.meta.env.VITE_STRIPE_CHECKOUT_URL;
                  if (checkoutUrl) {
                    window.open(checkoutUrl, '_blank');
                  } else {
                    console.error('Stripe checkout URL not configured. Please set VITE_STRIPE_CHECKOUT_URL environment variable.');
                  }
                }}
              >
                <Users className="w-5 h-5 mr-2" />
                Join the Membership
              </Button>
              <Button size="lg" variant="outline" className="border-cyan-600 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950">
                <Calendar className="w-5 h-5 mr-2" />
                Schedule Discovery Call
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About the Program Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
              Not Another Program — A Shared Way of Building
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-4">
              SmartStart Membership is a collaborative space where strategy meets execution.
            </p>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-4">
              It's built for people who believe that success comes from clarity, discipline, and constant iteration — not hype.
            </p>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Members work directly with the leadership team to refine direction, strengthen business foundations, and align technology, compliance, and execution under one vision.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Exclusive Access to Knowledge, Tools, and Mentorship
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {membershipBenefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900 rounded-lg flex items-center justify-center mb-4">
                      <benefit.icon className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                      {benefit.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Ideal For Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Who This Is For
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {idealFor.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 bg-cyan-100 dark:bg-cyan-900 rounded-lg flex items-center justify-center mb-6">
                      <Target className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
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

      {/* Membership Tiers */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Choose the Level That Fits Your Journey
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {membershipTiers.map((tier, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className={`h-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 ${index === 1 ? 'border-cyan-500 dark:border-cyan-400' : ''}`}>
                  <CardContent className="p-8">
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        {tier.name}
                      </h3>
                      <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-400 mb-2">
                        {tier.price}
                      </div>
                      <p className="text-slate-600 dark:text-slate-300">
                        {tier.description}
                      </p>
                    </div>
                    <div className="space-y-4 mb-8">
                      {tier.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-cyan-600 dark:text-cyan-400 flex-shrink-0" />
                          <span className="text-slate-700 dark:text-slate-300">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <Button 
                      className={`w-full ${index === 1 ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-slate-600 hover:bg-slate-700'}`}
                    >
                      {tier.cta}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-8">
              Our Way of Building
            </h2>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 mb-8">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900 rounded-full flex items-center justify-center flex-shrink-0">
                      <Award className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <div>
                      <blockquote className="text-xl text-slate-700 dark:text-slate-300 mb-4 italic">
                        "We don't talk about building — we build, measure, and improve."
                      </blockquote>
                      <div className="text-sm">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          — Udi Shkolnik
                        </div>
                        <div className="text-slate-600 dark:text-slate-400">
                          Founder & CISO, SmartStart
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center"
            >
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-4">
                SmartStart Membership is grounded in a single idea: <strong>clarity creates momentum</strong>.
              </p>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-4">
                Every plan, product, and venture improves through truth, iteration, and discipline.
              </p>
              <p className="text-lg text-slate-600 dark:text-slate-300">
                We move forward together — one version better each time.
              </p>
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
              Ready to Join SmartStart Membership?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
              If you want to build with purpose, think strategically, and execute with accountability, you belong here. Join a selective circle of people who believe that excellence is built — not spoken.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-cyan-600 hover:bg-cyan-700 text-white"
                onClick={() => {
                  const checkoutUrl = import.meta.env.VITE_STRIPE_CHECKOUT_URL;
                  if (checkoutUrl) {
                    window.open(checkoutUrl, '_blank');
                  } else {
                    console.error('Stripe checkout URL not configured. Please set VITE_STRIPE_CHECKOUT_URL environment variable.');
                  }
                }}
              >
                <Users className="w-5 h-5 mr-2" />
                Join the Membership
              </Button>
              <Button size="lg" variant="outline" className="border-slate-300 dark:border-slate-600">
                <Calendar className="w-5 h-5 mr-2" />
                Schedule Discovery Call
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
      </div>
    </div>
  );
};

export default SmartStartMembership;
