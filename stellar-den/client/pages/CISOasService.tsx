import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Shield, Users, Target, TrendingUp, CheckCircle, ArrowRight, Building2, Clock, Award, Phone } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import { useSidebar } from '@/contexts/SidebarContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import StructuredData from '@/components/StructuredData';

const CISOasService: React.FC = () => {
  const { isCollapsed } = useSidebar();
  const pageUrl = 'https://alicesolutionsgroup.com/ciso-as-service';
  const pageTitle = 'CISO as a Service Toronto | Fractional CISO Consulting | AliceSolutionsGroup';
  const pageDescription = 'Fractional CISO services for Toronto businesses. Strategic security leadership, program development, and team building. CISSP CISM ISO Lead Auditor certified. Serving GTA and Ontario.';
  const services = [
    {
      icon: Shield,
      title: "Strategic Security Leadership",
      description: "Act as your interim or fractional CISO, providing strategic direction and executive oversight for your security program."
    },
    {
      icon: Target,
      title: "Security Program Development",
      description: "Build comprehensive security frameworks, policies, and procedures tailored to your business needs and risk profile."
    },
    {
      icon: Users,
      title: "Team Building & Training",
      description: "Recruit, train, and manage security teams. Develop security awareness programs for your entire organization."
    },
    {
      icon: Building2,
      title: "Board & Executive Reporting",
      description: "Provide clear, actionable security metrics and risk assessments to leadership and board members."
    }
  ];

  const benefits = [
    "Fractional CISO expertise without full-time costs",
    "Strategic security roadmap aligned with business goals",
    "Executive-level security reporting and communication",
    "Team building and security culture development",
    "Incident response leadership and crisis management",
    "Vendor and technology evaluation and selection",
    "Compliance program oversight and management",
    "Risk assessment and mitigation strategies"
  ];

  const process = [
    {
      step: "01",
      title: "Discovery & Assessment",
      description: "Evaluate current security posture, identify gaps, and understand business objectives."
    },
    {
      step: "02", 
      title: "Strategic Planning",
      description: "Develop comprehensive security strategy and roadmap aligned with business goals."
    },
    {
      step: "03",
      title: "Implementation Support",
      description: "Guide implementation of security initiatives and build internal capabilities."
    },
    {
      step: "04",
      title: "Ongoing Leadership",
      description: "Provide ongoing strategic guidance, reporting, and program optimization."
    }
  ];

  // CISO Service Schema
  const cisoServiceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "CISO as a Service",
    "name": "Fractional CISO Services",
    "description": "Fractional CISO services for Toronto businesses providing strategic security leadership",
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
      "name": "CISO Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Strategic Security Leadership"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Security Program Development"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Team Building & Training"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Board & Executive Reporting"
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
        <meta name="keywords" content="CISO as a service Toronto, fractional CISO GTA, CISO consulting Ontario, virtual CISO Canada, CISO services Toronto, security leadership Toronto, CISSP CISO Toronto" />
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
          {JSON.stringify(cisoServiceSchema)}
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
          { name: "CISO as a Service", url: "/ciso-as-service" }
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
              CISO-as-a-Service
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
              Strategic Security
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600"> Leadership</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8">
              Get executive-level cybersecurity leadership without the full-time cost. 
              Strategic guidance, team building, and security program development tailored to your business.
              Built from real experience with Cannabis.co.il, Plasan Sasa, and Helen Doron.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700 text-white">
                <Phone className="w-5 h-5 mr-2" />
                Schedule Consultation
              </Button>
              <Button size="lg" variant="outline" className="border-cyan-600 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950">
                View Case Studies
                <ArrowRight className="w-5 h-5 ml-2" />
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
              What You Get
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Comprehensive CISO services designed to elevate your security program
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
                Why Choose CISO-as-a-Service?
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
                Get enterprise-level security leadership with the flexibility and cost-effectiveness 
                of fractional expertise. Perfect for growing companies that need strategic security guidance.
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
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">15+</div>
                    <div className="text-cyan-100">Years Experience</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">500+</div>
                    <div className="text-cyan-100">Clients Served</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">1000+</div>
                    <div className="text-cyan-100">Projects Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">2+</div>
                    <div className="text-cyan-100">Startups Built</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">11</div>
                    <div className="text-cyan-100">Certifications</div>
                  </div>
                </div>
              </div>
            </motion.div>
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
              Our Process
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              A proven approach to delivering strategic security leadership
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

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
              Ready to Elevate Your Security Program?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
              Get strategic security leadership that aligns with your business goals. 
              Let's discuss how CISO-as-a-Service can transform your security posture.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700 text-white">
                <Phone className="w-5 h-5 mr-2" />
                Schedule Free Consultation
              </Button>
              <Button size="lg" variant="outline" className="border-slate-300 dark:border-slate-600">
                Download Service Guide
                <ArrowRight className="w-5 h-5 ml-2" />
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

export default CISOasService;
