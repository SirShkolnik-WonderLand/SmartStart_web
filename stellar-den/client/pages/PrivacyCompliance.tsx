import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Shield, Lock, FileCheck, Users, CheckCircle, ArrowRight, Phone, Download, Eye, Scale, Globe } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import { useSidebar } from '@/contexts/SidebarContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import StructuredData from '@/components/StructuredData';

const PrivacyCompliance: React.FC = () => {
  const { isCollapsed } = useSidebar();
  const pageUrl = 'https://alicesolutionsgroup.com/privacy-compliance';
  const pageTitle = 'Privacy Compliance Services Toronto | PHIPA PIPEDA Compliance | AliceSolutionsGroup';
  const pageDescription = 'Privacy compliance services for Toronto businesses. PHIPA, PIPEDA, GDPR, and CCPA compliance. Privacy impact assessments and training. Serving GTA and Ontario.';
  const services = [
    {
      icon: Shield,
      title: "PHIPA Compliance",
      description: "Personal Health Information Protection Act compliance for Ontario healthcare organizations and service providers."
    },
    {
      icon: Lock,
      title: "PIPEDA Compliance",
      description: "Personal Information Protection and Electronic Documents Act compliance for Canadian businesses and organizations."
    },
    {
      icon: FileCheck,
      title: "Privacy Impact Assessments",
      description: "Comprehensive privacy impact assessments to identify and mitigate privacy risks in your operations."
    },
    {
      icon: Users,
      title: "Privacy Training & Awareness",
      description: "Staff training programs and privacy awareness initiatives to build a privacy-conscious culture."
    }
  ];

  const benefits = [
    "Compliance with Canadian privacy laws and regulations",
    "Enhanced customer trust and data protection",
    "Reduced privacy risks and potential penalties",
    "Improved data governance and management practices",
    "Better understanding of privacy obligations and responsibilities",
    "Streamlined privacy processes and documentation",
    "Increased business resilience and legal compliance",
    "Access to markets requiring privacy compliance"
  ];

  const complianceAreas = [
    {
      title: "PHIPA (Ontario)",
      description: "Personal Health Information Protection Act compliance for healthcare organizations."
    },
    {
      title: "PIPEDA (Federal)",
      description: "Personal Information Protection and Electronic Documents Act for Canadian businesses."
    },
    {
      title: "GDPR (EU)",
      description: "General Data Protection Regulation compliance for EU operations."
    },
    {
      title: "CCPA (California)",
      description: "California Consumer Privacy Act compliance for California operations."
    },
    {
      title: "Industry Standards",
      description: "Compliance with industry-specific privacy standards and best practices."
    },
    {
      title: "Data Governance",
      description: "Comprehensive data governance framework for privacy and security."
    }
  ];

  const process = [
    {
      step: "01",
      title: "Privacy Assessment",
      description: "Assess current privacy practices and identify compliance gaps and risks."
    },
    {
      step: "02",
      title: "Compliance Strategy",
      description: "Develop comprehensive privacy compliance strategy and implementation plan."
    },
    {
      step: "03",
      title: "Implementation",
      description: "Implement privacy policies, procedures, and controls according to compliance requirements."
    },
    {
      step: "04",
      title: "Training & Awareness",
      description: "Train staff on privacy requirements and establish ongoing awareness programs."
    },
    {
      step: "05",
      title: "Monitoring & Auditing",
      description: "Monitor compliance and conduct regular privacy audits and assessments."
    },
    {
      step: "06",
      title: "Ongoing Support",
      description: "Provide ongoing support and updates to maintain compliance as regulations evolve."
    }
  ];

  // Privacy Compliance Service Schema
  const privacyComplianceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Privacy Compliance",
    "name": "Privacy Compliance Services",
    "description": "PHIPA, PIPEDA, GDPR, and CCPA compliance services for Toronto businesses",
    "provider": {
      "@type": "Organization",
      "name": "AliceSolutionsGroup",
      "alternateName": "AliceSolutionsGroup Toronto"
    },
    "areaServed": {
      "@type": "City",
      "name": "Toronto"
    }
  };

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content="PHIPA compliance Toronto, PIPEDA compliance Ontario, privacy compliance GTA, GDPR compliance Canada, privacy impact assessment Toronto, privacy training Toronto" />
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
          {JSON.stringify(privacyComplianceSchema)}
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
          { name: "Privacy Compliance", url: "/privacy-compliance" }
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
              Privacy & Compliance
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
              Privacy &
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600"> Compliance</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8">
              Ensure compliance with Canadian privacy laws including PHIPA and PIPEDA. 
              Protect personal information while building trust with your customers and stakeholders.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700 text-white">
                <Phone className="w-5 h-5 mr-2" />
                Get Started
              </Button>
              <Button size="lg" variant="outline" className="border-cyan-600 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950">
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
              Our Privacy & Compliance Services
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Comprehensive privacy compliance solutions for Canadian businesses
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
                Why Privacy Compliance Matters
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
                Privacy compliance is not just a legal requirement—it's a business imperative. 
                Protect your customers' data while building trust and avoiding costly penalties.
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
                  <h3 className="text-2xl font-bold mb-2">Compliance Areas</h3>
                  <p className="text-cyan-100">Canadian privacy expertise</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1">PHIPA</div>
                    <div className="text-cyan-100 text-sm">Ontario Health</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1">PIPEDA</div>
                    <div className="text-cyan-100 text-sm">Federal Privacy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1">GDPR</div>
                    <div className="text-cyan-100 text-sm">EU Compliance</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1">CCPA</div>
                    <div className="text-cyan-100 text-sm">California</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Compliance Areas */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Compliance Areas
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Comprehensive privacy compliance across multiple jurisdictions and standards
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {complianceAreas.map((area, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Scale className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {area.title}
                      </h3>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-sm">
                      {area.description}
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
              Our proven 6-step approach to privacy compliance implementation
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
              Ready to Ensure Privacy Compliance?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
              Start your privacy compliance journey with our comprehensive assessment 
              and expert implementation support for Canadian privacy laws.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700 text-white">
                <Phone className="w-5 h-5 mr-2" />
                Schedule Free Consultation
              </Button>
              <Button size="lg" variant="outline" className="border-slate-300 dark:border-slate-600">
                Download Privacy Guide
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

export default PrivacyCompliance;
