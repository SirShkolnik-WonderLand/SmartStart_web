import React from 'react';
import { motion } from 'framer-motion';
import { Users, Target, Shield, CheckCircle, ArrowRight, Phone, Calendar, Award, Building2, Zap, Lock, FileText } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const SmartStartMembership: React.FC = () => {
  const membershipBenefits = [
    {
      icon: Users,
      title: "Monthly Strategy Reviews",
      description: "Direct access to Udi and the SmartStart leadership team for strategic guidance and mentorship."
    },
    {
      icon: Shield,
      title: "ISO Templates & Modules",
      description: "Access to pre-audited templates, compliance modules, and DevOps pipelines for faster development."
    },
    {
      icon: Building2,
      title: "Private Community Access",
      description: "Exclusive access to the SmartStart builder community and early access to venture tools."
    },
    {
      icon: Zap,
      title: "Early Tool Access",
      description: "Be the first to test and provide feedback on new SmartStart platform features and tools."
    }
  ];

  const idealFor = [
    {
      title: "SaaS Founders",
      description: "Launching automation tools or software-as-a-service platforms with security-first architecture."
    },
    {
      title: "ISO Consultants",
      description: "Building client dashboards and compliance tools with proven templates and frameworks."
    },
    {
      title: "Developers",
      description: "Seeking structured mentorship and access to enterprise-grade development tools and practices."
    }
  ];

  const membershipTiers = [
    {
      name: "Builder",
      price: "Monthly",
      description: "Perfect for individual developers and small teams",
      features: [
        "Monthly strategy reviews",
        "Access to ISO templates",
        "Community access",
        "Early tool access"
      ],
      cta: "Start Building"
    },
    {
      name: "Venture",
      price: "Custom",
      description: "For established teams and growing ventures",
      features: [
        "Weekly strategy sessions",
        "Custom ISO templates",
        "Priority community access",
        "Advanced tool access",
        "Direct mentorship"
      ],
      cta: "Contact Us"
    }
  ];

  const testimonials = [
    {
      quote: "We don't talk about building — we build, measure, and improve.",
      author: "Udi Shkolnik",
      role: "Founder & CISO, SmartStart"
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
              <Users className="w-4 h-4 mr-2" />
              SmartStart Membership
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
              Selective Builder
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600"> Program</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8">
              Join a selective community of builders, founders, and developers. 
              Get direct access to Udi Shkolnik and the SmartStart leadership team for strategic guidance and mentorship.
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
              Membership Benefits
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Exclusive access to expertise, tools, and community
            </p>
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
              Ideal For
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              SmartStart Membership is designed for specific types of builders and entrepreneurs
            </p>
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
              Membership Tiers
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Choose the membership level that fits your needs and goals
            </p>
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

      {/* Testimonials Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Philosophy
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Our approach to building and mentorship
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900 rounded-full flex items-center justify-center flex-shrink-0">
                        <Award className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
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
              Become part of a selective community of builders and get direct access 
              to expertise, tools, and mentorship that will accelerate your success.
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
  );
};

export default SmartStartMembership;
