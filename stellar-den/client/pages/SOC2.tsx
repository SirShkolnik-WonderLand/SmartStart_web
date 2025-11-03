import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Shield, CheckCircle, FileCheck, Users, Target, Award, Clock, ArrowRight, Phone, Download, Eye, Lock } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import { useSidebar } from '@/contexts/SidebarContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import StructuredData from '@/components/StructuredData';

const SOC2: React.FC = () => {
  const { isCollapsed } = useSidebar();
  const pageUrl = 'https://alicesolutionsgroup.com/soc-2';
  const pageTitle = 'SOC 2 Compliance Services Toronto | SOC 2 Type I & II | AliceSolutionsGroup';
  const pageDescription = 'SOC 2 compliance services for Toronto businesses. Type I and Type II readiness, implementation support, and audit preparation. Serving GTA and Ontario. CISSP CISM certified consultants.';
  const services = [
    {
      icon: FileCheck,
      title: "Readiness Assessment",
      description: "Comprehensive gap analysis against SOC 2 Type I and Type II requirements to identify compliance gaps."
    },
    {
      icon: Shield,
      title: "Implementation Support",
      description: "End-to-end implementation of SOC 2 controls including policies, procedures, and monitoring systems."
    },
    {
      icon: Users,
      title: "Training & Awareness",
      description: "Staff training programs on SOC 2 requirements and security best practices for ongoing compliance."
    },
    {
      icon: Award,
      title: "Audit Support",
      description: "Preparation for external audit and ongoing support to maintain SOC 2 certification compliance."
    }
  ];

  const benefits = [
    "Enhanced customer trust and competitive advantage",
    "Compliance with industry security standards",
    "Improved security posture and risk management",
    "Reduced security incidents and associated costs",
    "Better governance and operational controls",
    "Streamlined audit processes and documentation",
    "Increased business resilience and continuity",
    "Access to enterprise clients requiring SOC 2 compliance"
  ];

  const trustPrinciples = [
    {
      title: "Security",
      description: "Protection against unauthorized access to systems and data through access controls, firewalls, and encryption."
    },
    {
      title: "Availability",
      description: "System availability for operation and use as committed or agreed through monitoring and incident response."
    },
    {
      title: "Processing Integrity",
      description: "System processing is complete, valid, accurate, timely, and authorized through data validation and controls."
    },
    {
      title: "Confidentiality",
      description: "Information designated as confidential is protected as committed or agreed through access controls and encryption."
    },
    {
      title: "Privacy",
      description: "Personal information is collected, used, retained, disclosed, and disposed of in conformity with commitments."
    }
  ];

  const process = [
    {
      step: "01",
      title: "Gap Analysis",
      description: "Assess current state against SOC 2 requirements and identify gaps across all trust principles."
    },
    {
      step: "02",
      title: "Control Design",
      description: "Design and document SOC 2 controls including policies, procedures, and monitoring systems."
    },
    {
      step: "03",
      title: "Implementation",
      description: "Implement controls, train staff, and establish monitoring processes for ongoing compliance."
    },
    {
      step: "04",
      title: "Internal Audit",
      description: "Conduct internal audit to verify implementation and identify areas for improvement."
    },
    {
      step: "05",
      title: "External Audit",
      description: "External audit by licensed CPA firm to achieve SOC 2 Type I or Type II certification."
    },
    {
      step: "06",
      title: "Ongoing Compliance",
      description: "Maintain compliance through continuous monitoring and annual audit cycles."
    }
  ];

  // SOC 2 Service Schema
  const soc2ServiceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "SOC 2 Compliance",
    "name": "SOC 2 Compliance Services",
    "description": "SOC 2 Type I and Type II compliance services for Toronto businesses",
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
      "name": "SOC 2 Services",
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
            "name": "Audit Support"
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
        <meta name="keywords" content="SOC 2 Toronto, SOC 2 Type I Toronto, SOC 2 Type II Toronto, SOC 2 compliance GTA, SOC 2 certification Ontario, SOC 2 audit Toronto, SOC 2 readiness Toronto" />
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
          {JSON.stringify(soc2ServiceSchema)}
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
          { name: "SOC 2", url: "/soc-2" }
        ]}
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary/5 dark:from-slate-950 dark:via-slate-900 dark:to-primary/10">
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
            <Badge className="mb-4 bg-primary/10 text-primary-foreground dark:bg-primary/20 dark:text-primary">
              <Shield className="w-4 h-4 mr-2" />
              SOC 2 Compliance
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
              SOC 2
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary"> Certification</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8">
              Achieve SOC 2 Type I and Type II certification with our comprehensive implementation 
              and audit support services. Build trust with enterprise clients.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Phone className="w-5 h-5 mr-2" />
                Start Assessment
              </Button>
              <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10 dark:hover:bg-primary/20">
                <Eye className="w-5 h-5 mr-2" />
                View Requirements
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
              Our SOC 2 Services
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Complete support for SOC 2 Type I and Type II implementation and certification
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
                    <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                      <service.icon className="w-6 h-6 text-primary dark:text-primary" />
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
                Why SOC 2 Certification?
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
                SOC 2 is a widely recognized standard for service organizations that demonstrates 
                your commitment to security, availability, processing integrity, confidentiality, and privacy.
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
                    <CheckCircle className="w-5 h-5 text-primary dark:text-primary mt-0.5 flex-shrink-0" />
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
              <div className="bg-gradient-to-br from-primary to-secondary rounded-2xl p-8 text-primary-foreground">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">SOC 2 Types</h3>
                  <p className="text-primary-foreground/80">Choose the right certification</p>
                </div>
                <div className="space-y-4">
                  <div className="bg-white/20 rounded-lg p-4">
                    <h4 className="font-semibold mb-1">Type I</h4>
                    <p className="text-primary-foreground/80 text-sm">Design effectiveness at a point in time</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4">
                    <h4 className="font-semibold mb-1">Type II</h4>
                    <p className="text-primary-foreground/80 text-sm">Operating effectiveness over a period of time</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Principles */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              SOC 2 Trust Principles
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Comprehensive coverage of all five trust service principles
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trustPrinciples.map((principle, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Lock className="w-6 h-6 text-primary dark:text-primary" />
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {principle.title}
                      </h3>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-sm">
                      {principle.description}
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
              Our proven 6-step approach to SOC 2 certification
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
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
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
              Ready to Get SOC 2 Certified?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
              Start your journey to SOC 2 certification with our comprehensive assessment 
              and expert implementation support.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Phone className="w-5 h-5 mr-2" />
                Schedule Free Consultation
              </Button>
              <Button size="lg" variant="outline" className="border-slate-300 dark:border-slate-600">
                Download SOC 2 Guide
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

export default SOC2;
