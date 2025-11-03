import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Rocket, Target, CheckCircle, Eye, TrendingUp, Calendar } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import { useSidebar } from '@/contexts/SidebarContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import StructuredData from '@/components/StructuredData';

const SmartStartVentureBuilding: React.FC = () => {
  const { isCollapsed } = useSidebar();
  const pageUrl = 'https://alicesolutionsgroup.com/smartstart-venture-building';
  const pageTitle = 'Venture Building - Co-Build Your Startup | SmartStart Toronto';
  const pageDescription = 'SmartStart Venture Building: Hands-on co-building program for Toronto startups. We partner with founders through equity participation to build secure, audit-ready SaaS ventures. ISO 27001 compliant from day one.';
  const ventures = [
    {
      name: "MovedIn",
      description: "End-to-end moving automation platform simplifying relocation logistics and customer management.",
      role: "SmartStart Technical Co-Founder"
    },
    {
      name: "Delta",
      description: "SOAR marketing and analytics platform enhancing customer engagement and data-driven automation.",
      role: "Partnered with Arty (Co-Build Partner)"
    },
    {
      name: "Syncary",
      description: "Enterprise operations and collaboration system — a \"better Monday.com\" — designed for full workflow visibility.",
      role: "SmartStart Technical Co-Founder"
    },
    {
      name: "Clinic-e",
      description: "Healthcare CRM and operations suite for clinics and practitioners.",
      role: "SmartStart Co-Build Partner"
    },
    {
      name: "C&D (Command and Direct)",
      description: "Moving CRM platform streamlining customer relationship management for moving and relocation companies.",
      role: "SmartStart Co-Build Partner"
    },
    {
      name: "C&C (Command and Control)",
      description: "HR system designed for comprehensive human resources management and employee operations.",
      role: "SmartStart Co-Build Partner"
    },
    {
      name: "SecondBrain",
      description: "Executive personal assistant tool for knowledge management, task organization, and productivity enhancement.",
      role: "SmartStart Co-Build Partner"
    }
  ];

  const coBuildModel = [
    {
      title: "Equity Partnership",
      description: "Founders partner with us through equity participation — so success is shared. This covers full technical and compliance infrastructure until launch."
    },
    {
      title: "Architecture & Development",
      description: "We handle end-to-end product architecture, backend design, and front-end implementation — ensuring scalability, maintainability, and ISO readiness."
    },
    {
      title: "ISO Compliance & Security",
      description: "Every venture is developed under security-first principles, following ISO 27001/27799 frameworks. Audit-ready documentation and compliance automation are built in from day one."
    },
    {
      title: "Strategic Guidance",
      description: "Founders receive continuous mentorship and roadmap alignment directly from Udi and the SmartStart leadership team — ensuring business, tech, and compliance stay aligned."
    }
  ];

  const benefits = [
    "Access to a proven technical architecture used across all SmartStart ventures",
    "Built-in security and ISO compliance from the first sprint",
    "Strategic mentorship from active founders and cybersecurity professionals",
    "Complete technical coverage until launch — no outsourcing, no guesswork",
    "Equity-based partnership that aligns everyone's success",
    "Continuous access to SmartStart tools, DevOps pipelines, and compliance templates",
    "Ongoing mentorship through the SmartStart Membership network"
  ];

  const process = [
    {
      step: "01",
      title: "Initial Assessment",
      description: "We review the venture idea, assess its market and technical potential, and outline the initial architecture and compliance requirements."
    },
    {
      step: "02",
      title: "Partnership Agreement",
      description: "We define the equity structure, responsibilities, and milestones that guide the co-build relationship. Transparency is absolute from day one."
    },
    {
      step: "03",
      title: "Technical Architecture",
      description: "We design a secure, scalable architecture using the SmartStart Platform, including all foundational modules: authentication, billing, AI, and compliance."
    },
    {
      step: "04",
      title: "Development & Launch",
      description: "Our team builds alongside yours — delivering production-ready systems with full audit trails, documentation, and deployment support. When the venture is ready, it transitions to independent operation."
    }
  ];

  // Venture Building Service Schema
  const ventureBuildingSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Venture Building & Co-Building",
    "name": "SmartStart Venture Building",
    "description": "Hands-on co-building program for Toronto startups with equity participation",
    "provider": {
      "@type": "Organization",
      "name": "AliceSolutionsGroup",
      "alternateName": "AliceSolutionsGroup Toronto"
    },
    "areaServed": {
      "@type": "City",
      "name": "Toronto"
    },
    "offers": {
      "@type": "Offer",
      "description": "Equity-based partnership for venture building"
    }
  };

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content="venture building Toronto, startup co-building GTA, equity partnership Ontario, startup incubator Toronto, venture building program, startup co-founder Toronto, SaaS venture building" />
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
          {JSON.stringify(ventureBuildingSchema)}
        </script>
      </Helmet>
      <StructuredData 
        type="page"
        title={pageTitle}
        description={pageDescription}
        url={pageUrl}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "SmartStart", url: "/smartstart" },
          { name: "Venture Building", url: "/smartstart-venture-building" }
        ]}
      />
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
              <Rocket className="w-4 h-4 mr-2" />
              Venture Building
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
              Hands-On Co-Building for Real Ventures
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-4">
              We don't invest passively — we build actively.
            </p>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-4">
              SmartStart Venture Building is a selective co-building program led by <strong>Udi Shkolnik</strong> and the SmartStart leadership team. We partner with founders to transform ideas into secure, operational ventures — handling architecture, ISO compliance, and technology until launch.
            </p>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8">
              Built on experience from ventures like <strong>MovedIn, Delta, Syncary, Clinic-e, C&D, C&C, and SecondBrain</strong>.
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
              Where Ideas Become Operating Companies
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-4">
              SmartStart Venture Building was designed for founders who want more than advice.
            </p>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-4">
              It's a partnership that combines technical execution, cybersecurity leadership, and long-term strategy — under one umbrella.
            </p>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-4">
              Each venture receives hands-on involvement from our architecture, compliance, and product teams until it's independently operational. We work shoulder-to-shoulder with founders — not as consultants, but as co-founders who share accountability.
            </p>
            <p className="text-lg text-slate-600 dark:text-slate-300 mt-6 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg border-l-4 border-cyan-600">
              <strong>IP Ownership:</strong> All intellectual property for ventures built through SmartStart Venture Building is owned by SmartStart / AliceSolutionsGroup, ensuring unified protection and strategic alignment across the ecosystem.
            </p>
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
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Real Ventures Built Through SmartStart
            </h2>
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
                      <TrendingUp className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                      {venture.name}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 mb-4">
                      {venture.description}
                    </p>
                    <div className="text-sm text-cyan-600 dark:text-cyan-400 font-medium italic">
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
              How We Partner With Founders
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Our co-build model is based on mutual ownership, aligned incentives, and complete transparency. Instead of paying for development or consulting hours, founders partner with us through equity participation — so success is shared.
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
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              A Structured 4-Step Approach
            </h2>
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
                Experience That Translates Into Real Results
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-4">
                SmartStart's co-building approach was shaped through building multiple ventures internally. We know what founders need — focus, speed, clarity, and trust.
              </p>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
                With us, you gain:
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
                  <h3 className="text-2xl font-bold mb-2">Real Ventures, Real Execution</h3>
                </div>
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">5+</div>
                    <div className="text-cyan-100">Active Ventures</div>
                    <div className="text-sm text-cyan-200 mt-1">co-built and operating under the SmartStart ecosystem</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">100%</div>
                    <div className="text-cyan-100">Security-First Development</div>
                    <div className="text-sm text-cyan-200 mt-1">every product meets ISO-grade security standards</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">Compliant</div>
                    <div className="text-cyan-100">by Design</div>
                    <div className="text-sm text-cyan-200 mt-1">audit-ready evidence integrated from day one</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">Co-Build</div>
                    <div className="text-cyan-100">Proven Model</div>
                    <div className="text-sm text-cyan-200 mt-1">validated across multiple industries and verticals</div>
                  </div>
                </div>
                <p className="text-center mt-8 text-cyan-100 italic">
                  This is not an accelerator. It's a co-building partnership where expertise, time, and infrastructure are invested in your success.
                </p>
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
              If your vision needs a hands-on partner who brings architecture, compliance, and execution discipline — we're ready. Join the co-building program and build your venture with a team that measures success by delivered outcomes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700 text-white">
                <Rocket className="w-5 h-5 mr-2" />
                Apply for Venture Building
              </Button>
              <Button size="lg" variant="outline" className="border-cyan-600 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950">
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
    </>
  );
};

export default SmartStartVentureBuilding;
