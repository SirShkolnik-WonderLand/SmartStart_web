import React from 'react';
import { motion } from 'framer-motion';
import { Users, MessageSquare, FileText, BarChart3, CheckCircle, ArrowRight, Phone, Eye, Shield, Zap, Target, Building2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const CommunityHub: React.FC = () => {
  const features = [
    {
      icon: Users,
      title: "Member Profiles",
      description: "Comprehensive member profiles showcasing skills, startups, and current status within the SmartStart ecosystem."
    },
    {
      icon: FileText,
      title: "Shared Documents",
      description: "Access to templates, dashboards, and collaborative documents shared across the SmartStart community."
    },
    {
      icon: MessageSquare,
      title: "Collaboration Spaces",
      description: "Integrated Slack + Zoho Projects collaboration spaces for seamless communication and project management."
    },
    {
      icon: BarChart3,
      title: "Community Analytics",
      description: "Real-time insights into community engagement, project progress, and collaboration metrics."
    }
  ];

  const hubCapabilities = [
    "Member skill mapping and project matching",
    "Shared knowledge base and documentation",
    "Real-time collaboration and communication",
    "Project tracking and milestone management",
    "Community event coordination and management",
    "Mentorship program integration",
    "Resource sharing and access control",
    "Analytics and community insights"
  ];

  const communityStructure = [
    {
      title: "Moderated by Robert",
      description: "Community Director overseeing the SmartStart constellation framework and member engagement."
    },
    {
      title: "Integrated Tools",
      description: "Seamless integration with SmartStart platform tools and enterprise security features."
    },
    {
      title: "Security-First",
      description: "Built with enterprise-grade security and compliance standards from day one."
    }
  ];

  const benefits = [
    "Access to a curated community of builders and entrepreneurs",
    "Integrated collaboration tools and project management",
    "Shared resources and knowledge base",
    "Real-time communication and networking opportunities",
    "Mentorship program integration and matching",
    "Community events and workshop coordination",
    "Skill mapping and project collaboration",
    "Analytics and insights into community engagement"
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
              Community Hub
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
              Private Online
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600"> Community Space</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8">
              The Community Hub is a private online space integrated with SmartStart tools. 
              Access member profiles, shared documents, templates, and collaboration spaces.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700 text-white">
                <Eye className="w-5 h-5 mr-2" />
                Access the Hub
              </Button>
              <Button size="lg" variant="outline" className="border-cyan-600 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950">
                <Phone className="w-5 h-5 mr-2" />
                Request Access
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
              Hub Features
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Comprehensive community management and collaboration tools
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900 rounded-lg flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
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
                Hub Capabilities
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
                The Community Hub provides comprehensive tools for community management, 
                collaboration, and knowledge sharing within the SmartStart ecosystem.
              </p>
              <div className="space-y-4">
                {hubCapabilities.map((capability, index) => (
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
                  <h3 className="text-2xl font-bold mb-2">Community Structure</h3>
                  <p className="text-cyan-100">Organized and moderated</p>
                </div>
                <div className="space-y-4">
                  {communityStructure.map((item, index) => (
                    <div key={index} className="text-center">
                      <div className="text-lg font-bold mb-1">{item.title}</div>
                      <div className="text-cyan-100 text-sm">{item.description}</div>
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
              Why Join the Community Hub?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Access to a curated community of builders, entrepreneurs, and technical experts
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
              Ready to Access the Community Hub?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
              Join our private community space and connect with builders, entrepreneurs, 
              and technical experts in the SmartStart ecosystem.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700 text-white">
                <Eye className="w-5 h-5 mr-2" />
                Access the Hub
              </Button>
              <Button size="lg" variant="outline" className="border-slate-300 dark:border-slate-600">
                <Phone className="w-5 h-5 mr-2" />
                Request Access
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CommunityHub;
