import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Shield, CheckCircle, FileCheck, Users, Target, Award, Clock, ArrowRight, Phone, Download, Eye } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import { useSidebar } from '@/contexts/SidebarContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import StructuredData from '@/components/StructuredData';

const ISO27001: React.FC = () => {
  const { isCollapsed } = useSidebar();
  const pageUrl = 'https://alicesolutionsgroup.com/iso-27001';
  const pageTitle = 'ISO 27001 Certification Services Toronto | AliceSolutionsGroup GTA';
  const pageDescription = 'ISO 27001:2022 certification services for Toronto businesses. End-to-end implementation, gap analysis, and certification support. Serving GTA and Ontario. CISSP CISM ISO Lead Auditor certified.';
  const services = [
    {
      icon: FileCheck,
      title: "Readiness Assessment",
      description: "Comprehensive gap analysis against ISO 27001:2022 requirements to identify what needs to be implemented."
    },
    {
      icon: Shield,
      title: "Implementation Support",
      description: "End-to-end implementation of ISMS including policies, procedures, and security controls."
    },
    {
      icon: Users,
      title: "Training & Awareness",
      description: "Staff training programs and security awareness initiatives to build a security-conscious culture."
    },
    {
      icon: Award,
      title: "Certification Support",
      description: "Preparation for external audit and ongoing support to maintain certification compliance."
    }
  ];

  const benefits = [
    "Enhanced information security posture and risk management",
    "Compliance with international security standards",
    "Improved customer trust and competitive advantage",
    "Reduced security incidents and associated costs",
    "Better governance and risk oversight",
    "Streamlined audit processes and documentation",
    "Increased business resilience and continuity",
    "Access to new markets requiring ISO 27001 certification"
  ];

  const domains = [
    {
      title: "A.5 Information Security Policies",
      description: "Establish and maintain information security policies and procedures."
    },
    {
      title: "A.6 Organization of Information Security",
      description: "Define roles, responsibilities, and governance structure for information security."
    },
    {
      title: "A.7 Human Resource Security",
      description: "Ensure security awareness and proper handling of personnel throughout employment lifecycle."
    },
    {
      title: "A.8 Asset Management",
      description: "Identify, classify, and protect information assets according to their value and sensitivity."
    },
    {
      title: "A.9 Access Control",
      description: "Control access to information and information processing facilities."
    },
    {
      title: "A.10 Cryptography",
      description: "Protect information through proper use of cryptographic controls."
    },
    {
      title: "A.11 Physical and Environmental Security",
      description: "Prevent unauthorized physical access, damage, and interference to information processing facilities."
    },
    {
      title: "A.12 Operations Security",
      description: "Ensure correct and secure operation of information processing facilities."
    }
  ];

  const process = [
    {
      step: "01",
      title: "Gap Analysis",
      description: "Assess current state against ISO 27001:2022 requirements and identify gaps."
    },
    {
      step: "02",
      title: "ISMS Design",
      description: "Design and document the Information Security Management System framework."
    },
    {
      step: "03",
      title: "Implementation",
      description: "Implement policies, procedures, and controls according to the ISMS design."
    },
    {
      step: "04",
      title: "Internal Audit",
      description: "Conduct internal audit to verify implementation and identify areas for improvement."
    },
    {
      step: "05",
      title: "Management Review",
      description: "Management review of the ISMS performance and effectiveness."
    },
    {
      step: "06",
      title: "Certification",
      description: "External audit and certification by accredited certification body."
    }
  ];

  // ISO 27001 Service Schema
  const iso27001ServiceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "ISO 27001 Certification",
    "name": "ISO 27001 Certification Services",
    "description": "End-to-end ISO 27001:2022 certification services for Toronto and GTA businesses",
    "provider": {
      "@type": "Organization",
      "name": "AliceSolutionsGroup",
      "alternateName": "AliceSolutionsGroup Toronto"
    },
    "areaServed": {
      "@type": "City",
      "name": "Toronto"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "ISO 27001 Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Readiness Assessment"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Implementation Support"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Training & Awareness"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Certification Support"
          }
        }
      ]
    }
  };

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content="ISO 27001 Toronto, ISO 27001 consultant GTA, ISO 27001 certification Ontario, ISO 27001 implementation Canada, ISO 27001:2022 Toronto, ISO Lead Auditor Toronto, information security management Toronto" />
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
          {JSON.stringify(iso27001ServiceSchema)}
        </script>
      </Helmet>
      <StructuredData 
        type="page"
        title={pageTitle}
        description={pageDescription}
        url={pageUrl}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Services", url: "/services" },
          { name: "ISO 27001", url: "/iso-27001" }
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
              <Shield className="w-4 h-4 mr-2" />
              ISO 27001:2022
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
              ISO 27001
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600"> Certification</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8">
              Achieve international information security certification with our comprehensive 
              ISO 27001:2022 implementation and certification support services.
              Built from real audit experience with Plasan Sasa, Helen Doron, and multiple enterprise clients.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700 text-white">
                <Phone className="w-5 h-5 mr-2" />
                Start Assessment
              </Button>
              <Button size="lg" variant="outline" className="border-cyan-600 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950">
                <Eye className="w-5 h-5 mr-2" />
                View ISO Studio
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Our ISO 27001 Services
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              End-to-end support for ISO 27001:2022 implementation and certification
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900 rounded-lg flex items-center justify-center mb-4">
                      <service.icon className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                      {service.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300">
                      {service.description}
                    </p>
                  </CardContent>
                </Card>
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
                Why ISO 27001 Certification?
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
                ISO 27001 is the international standard for information security management systems. 
                Certification demonstrates your commitment to protecting information assets and managing security risks.
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
                  <h3 className="text-2xl font-bold mb-2">12+ Certifications</h3>
                  <p className="text-cyan-100">Successfully delivered</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1">100%</div>
                    <div className="text-cyan-100 text-sm">Success Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1">6-12</div>
                    <div className="text-cyan-100 text-sm">Months Timeline</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Control Domains */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              ISO 27001:2022 Control Domains
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Comprehensive coverage of all 93 controls across 4 main domains
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {domains.map((domain, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                      {domain.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 text-sm">
                      {domain.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Implementation Process
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Our proven 6-step approach to ISO 27001 certification
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
              Ready to Get ISO 27001 Certified?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
              Start your journey to ISO 27001 certification with our comprehensive assessment tool 
              and expert implementation support.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700 text-white">
                <Eye className="w-5 h-5 mr-2" />
                Try ISO Studio Assessment
              </Button>
              <Button size="lg" variant="outline" className="border-slate-300 dark:border-slate-600">
                Download Implementation Guide
                <Download className="w-5 h-5 ml-2" />
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

export default ISO27001;
