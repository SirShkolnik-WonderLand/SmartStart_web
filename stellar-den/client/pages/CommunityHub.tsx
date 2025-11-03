import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { UserCircle, MessageSquare, FileText, BarChart3, CheckCircle, ArrowRight, Phone, Eye, Shield, Zap, Target, Building2, Award, Rocket, Network, Lightbulb, BookOpen, Download, GraduationCap, Handshake, Users } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import { useSidebar } from '@/contexts/SidebarContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import StructuredData from '@/components/StructuredData';

const CommunityHub: React.FC = () => {
  const { isCollapsed } = useSidebar();
  const pageUrl = 'https://alicesolutionsgroup.com/community-hub';
  const pageTitle = 'SmartStart Community Hub | Toronto Startup Community | AliceSolutionsGroup';
  const pageDescription = 'Join SmartStart Community Hub: Toronto\'s premier startup community platform. Member profiles, shared resources, collaboration spaces, and mentorship. 100+ entrepreneurs building together.';
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

  const mentors = [
    {
      name: "Udi Shkolnik",
      expertise: "Cybersecurity, ISO, AI ops",
      description: "CISSP, CISM, ISO Lead Auditor with 15+ years of experience in cybersecurity and compliance."
    }
  ];

  const mentorshipTracks = [
    {
      title: "SaaS to PMF",
      description: "Guide your SaaS product from development to product-market fit with proven strategies and frameworks.",
      duration: "6 weeks"
    },
    {
      title: "Security Foundations",
      description: "Build solid security foundations for your organization with ISO compliance and cybersecurity best practices.",
      duration: "6 weeks"
    },
    {
      title: "DevOps Observability",
      description: "Implement comprehensive DevOps observability and monitoring systems for your applications.",
      duration: "6 weeks"
    },
    {
      title: "Product Strategy & Monetization",
      description: "Develop effective product strategies and monetization models for sustainable business growth.",
      duration: "6 weeks"
    }
  ];

  const archetypes = [
    {
      name: "Builder",
      icon: Rocket,
      description: "Engineers and developers who ship products. Focus on technical execution and rapid iteration.",
      color: "from-orange-500 to-red-500"
    },
    {
      name: "Connector",
      icon: Network,
      description: "Network builders who bring people together. Facilitate partnerships and community growth.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      name: "Architect",
      icon: Building2,
      description: "Strategic thinkers who design systems and processes. Focus on scalable infrastructure and compliance.",
      color: "from-purple-500 to-pink-500"
    },
    {
      name: "Dreamer",
      icon: Lightbulb,
      description: "Visionaries who imagine possibilities. Generate ideas and inspire innovation across the community.",
      color: "from-yellow-500 to-orange-500"
    }
  ];

  const keyResources = [
    {
      title: "ISO 27001 Policy Templates",
      description: "Comprehensive policy templates for ISO 27001:2022 compliance",
      icon: Shield,
      status: "Available"
    },
    {
      title: "Security Checklists",
      description: "Practical security checklists for development and deployment",
      icon: CheckCircle,
      status: "Available"
    },
    {
      title: "Business Templates",
      description: "Templates for business plans, pitch decks, and financial models",
      icon: FileText,
      status: "Available"
    },
    {
      title: "Technical Documentation",
      description: "Architecture guides, API documentation, and best practices",
      icon: BookOpen,
      status: "Available"
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

  // Community Hub Schema
  const communityHubSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "SmartStart Community Hub",
    "description": "Private online community space for Toronto entrepreneurs and startups",
    "url": pageUrl,
    "mainEntity": {
      "@type": "Organization",
      "name": "SmartStart Community",
      "alternateName": "SmartStart Toronto Community"
    }
  };

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content="startup community Toronto, entrepreneur community GTA, startup hub Ontario, SmartStart community, Toronto startup network, entrepreneur platform Toronto, startup collaboration Toronto" />
        <meta name="author" content="AliceSolutionsGroup" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={pageUrl} />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content="https://alicesolutionsgroup.com/logos/AliceSolutionsGroup-logo-compact.svg" />
        <meta property="og:site_name" content="AliceSolutionsGroup" />
        <meta property="og:locale" content="en_CA" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={pageUrl} />
        <meta property="twitter:title" content={pageTitle} />
        <meta property="twitter:description" content={pageDescription} />
        <meta property="twitter:image" content="https://alicesolutionsgroup.com/logos/AliceSolutionsGroup-logo-compact.svg" />
        
        {/* Geographic */}
        <meta name="geo.region" content="CA-ON" />
        <meta name="geo.placename" content="Toronto" />
        <meta name="geo.position" content="43.6532;-79.3832" />
        <meta name="ICBM" content="43.6532, -79.3832" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(communityHubSchema)}
        </script>
      </Helmet>
      <StructuredData 
        type="page"
        title={pageTitle}
        description={pageDescription}
        url={pageUrl}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Community", url: "/community-hub" },
          { name: "Community Hub", url: "/community-hub" }
        ]}
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-cyan-950">
      <Sidebar />
      <div className={`transition-all duration-300 ${isCollapsed ? 'md:ml-20 ml-0 md:ml-72 ml-0'} md:pt-0 pt-20`}>
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
              <UserCircle className="w-4 h-4 mr-2" />
              Community Hub
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
              Private Online
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600"> Community Space</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8">
              The Community Hub is a private online space integrated with SmartStart tools. 
              Access member profiles, shared documents, templates, and collaboration spaces.
              Built on the principle of community through contribution and value built in public.
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

      {/* Mentorship Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Mentorship Program
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8">
              Structured 6-week mentorship tracks with experienced mentors
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {mentorshipTracks.map((track, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Badge className="bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200">
                        {track.duration}
                      </Badge>
                      <Award className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                      {track.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300">
                      {track.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {mentors.map((mentor, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-cyan-100 dark:bg-cyan-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      <GraduationCap className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                      {mentor.name}
                    </h3>
                    <p className="text-sm text-cyan-600 dark:text-cyan-400 mb-2">
                      {mentor.expertise}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {mentor.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Archetypes Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Community Archetypes
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Understanding your role in the SmartStart community constellation
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {archetypes.map((archetype, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className={`w-16 h-16 bg-gradient-to-br ${archetype.color} rounded-lg flex items-center justify-center mb-4`}>
                      <archetype.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                      {archetype.name}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300">
                      {archetype.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Community Resources
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Templates, guides, and documentation shared across the SmartStart community
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {keyResources.map((resource, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900 rounded-lg flex items-center justify-center">
                        <resource.icon className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                      </div>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        {resource.status}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      {resource.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {resource.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
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
    </div>
    </>
  );
};

export default CommunityHub;
