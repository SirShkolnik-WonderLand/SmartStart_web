import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { UserCircle, Rocket, Zap, Target, CheckCircle, ArrowRight, Phone, Calendar, Award, Building2, Heart, BarChart3, Shield, Eye, FileText, TrendingUp, Layers, Lock, Code, Download, Handshake } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSidebar } from '@/contexts/SidebarContext';
import StructuredData from '@/components/StructuredData';

const SmartStart: React.FC = () => {
  const { isExpanded } = useSidebar();
  const pageUrl = 'https://alicesolutionsgroup.com/smartstart';
  const pageTitle = 'SmartStart Platform - Hub, Membership & Community | AliceSolutionsGroup Toronto';
  const pageDescription = 'Join SmartStart: Toronto\'s premier platform combining Hub (secure SaaS command center), Membership (selective builder program), and Community (100+ entrepreneurs). Access enterprise tools, mentorship, and venture building. $99.80/month.';

  const handleSubscription = () => {
    const checkoutUrl = import.meta.env.VITE_STRIPE_CHECKOUT_URL;
    if (checkoutUrl) {
      window.open(checkoutUrl, '_blank');
    } else {
      console.error('Stripe checkout URL not configured. Please set VITE_STRIPE_CHECKOUT_URL environment variable.');
    }
  };

  const hubFeatures = [
    {
      icon: BarChart3,
      title: "Real-Time Execution Dashboard",
      description: "Plan, assign, and track sprints across teams with precision and transparency."
    },
    {
      icon: FileText,
      title: "Automatic Compliance Documentation",
      description: "Every action, change, and approval becomes part of your ISO 27001 / 27799 or NIST evidence library—no manual effort."
    },
    {
      icon: Shield,
      title: "Integrated Security Workflows",
      description: "Log incidents, manage risks, and tie remediation tasks directly to compliance controls."
    },
    {
      icon: Layers,
      title: "Cross-Venture Portfolio View",
      description: "Run multiple ventures in parallel while sharing resources and insights safely."
    },
    {
      icon: TrendingUp,
      title: "Performance & Risk Analytics",
      description: "Visualize progress, detect execution bottlenecks, and identify unmitigated risks before they escalate."
    },
    {
      icon: Download,
      title: "Audit-Ready Exports",
      description: "Generate complete audit packs for internal reviews, clients, or investors in seconds."
    },
    {
      icon: Lock,
      title: "Secure Multi-Tenant Architecture",
      description: "Fine-grained roles and access for each venture, client, and partner."
    },
    {
      icon: Code,
      title: "API-First Integrations",
      description: "Connect effortlessly with CI/CD pipelines, project tools, or analytics systems."
    }
  ];

  const membershipBenefits = [
    {
      icon: UserCircle,
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

  const communityFeatures = [
    {
      icon: Handshake,
      title: "Community Access & Events",
      description: "Join 100+ entrepreneurs in our vibrant community with monthly Beer + Security meetups, Launch & Learn sessions, and founder roundtables."
    },
    {
      icon: Building2,
      title: "Enterprise Tools Access",
      description: "Full access to Zoho suite, Acronis backup, and Slack collaboration tools to power your business operations."
    },
    {
      icon: Rocket,
      title: "Venture Building Track",
      description: "Build ventures in 30-day sprints with clear equity terms (5-25%) and mentorship from experienced founders."
    },
    {
      icon: Target,
      title: "Second Brain Platform",
      description: "Organizational memory system to capture, organize, and leverage knowledge across your business operations."
    }
  ];

  const benefits = [
    "Access to premium enterprise tools and software",
    "Monthly networking events and educational sessions",
    "Direct mentorship from experienced entrepreneurs",
    "Venture building opportunities with clear equity terms",
    "Second Brain platform for organizational memory",
    "Pro-bono cybersecurity reviews for qualifying members",
    "Collaboration tools and shared resources",
    "Community-driven growth and learning opportunities"
  ];

  const events = [
    {
      title: "Beer + Security",
      frequency: "Monthly",
      location: "Toronto & GTA",
      description: "Casual networking meetups combining cybersecurity discussions with community building."
    },
    {
      title: "Launch & Learn",
      frequency: "Bi-weekly",
      location: "Virtual & In-person",
      description: "Educational sessions covering AI, cybersecurity, automation, and business growth strategies."
    },
    {
      title: "Automation & Innovation Clinics",
      frequency: "Monthly",
      location: "Ontario-wide",
      description: "Practical solutions and automation strategies for small and medium enterprises."
    },
    {
      title: "Founder Roundtables",
      frequency: "Monthly",
      location: "Toronto",
      description: "Intimate discussions and direct mentorship opportunities with successful entrepreneurs."
    }
  ];

  const pricing = [
    {
      name: "Discovery",
      price: "$1",
      period: "one-time",
      description: "7-day trial access to explore the community and tools",
      features: [
        "7-day community access",
        "Attend one event",
        "Basic tool preview",
        "Community introduction"
      ],
      buttonText: "Start Trial",
      popular: false,
      checkoutUrl: import.meta.env.VITE_STRIPE_CHECKOUT_URL
    },
    {
      name: "Full Program",
      price: "$99.80",
      period: "per month",
      description: "Complete access to all SmartStart platform features and community benefits",
      features: [
        "Full community access",
        "All events and meetups",
        "Enterprise tools (Zoho, Acronis, Slack)",
        "SmartStart Hub platform access",
        "Venture building track",
        "Second Brain platform",
        "Direct mentorship",
        "Monthly strategy reviews",
        "ISO & compliance frameworks",
        "Pro-bono cybersecurity reviews"
      ],
      buttonText: "Subscribe Now",
      popular: true,
      checkoutUrl: import.meta.env.VITE_STRIPE_CHECKOUT_URL
    }
  ];

  // SmartStart Service Schema
  const smartStartSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Business Platform & Community",
    "name": "SmartStart Platform",
    "description": "Combined Hub, Membership, and Community platform for entrepreneurs and growing businesses in Toronto and GTA",
    "provider": {
      "@type": "Organization",
      "name": "AliceSolutionsGroup",
      "alternateName": "AliceSolutionsGroup Toronto",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Toronto",
        "addressRegion": "ON",
        "addressCountry": "CA"
      }
    },
    "areaServed": {
      "@type": "City",
      "name": "Toronto"
    },
    "offers": {
      "@type": "Offer",
      "price": "99.80",
      "priceCurrency": "CAD",
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "price": "99.80",
        "priceCurrency": "CAD",
        "billingIncrement": "P1M"
      }
    },
    "category": "Business Platform",
    "audience": {
      "@type": "Audience",
      "audienceType": "Entrepreneurs, Founders, Startups"
    }
  };

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content="SmartStart, startup platform Toronto, venture building GTA, business community Toronto, startup incubator Ontario, entrepreneur membership, ISO 27001 platform, cybersecurity community, startup mentorship Toronto" />
        <meta name="author" content="AliceSolutionsGroup" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={pageUrl} />
        
        {/* Open Graph / Facebook */}
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
        
        {/* Additional SEO */}
        <meta name="geo.region" content="CA-ON" />
        <meta name="geo.placename" content="Toronto" />
        <meta name="geo.position" content="43.6532;-79.3832" />
        <meta name="ICBM" content="43.6532, -79.3832" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(smartStartSchema)}
        </script>
      </Helmet>
      <StructuredData 
        type="page"
        title={pageTitle}
        description={pageDescription}
        url={pageUrl}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "SmartStart", url: "/smartstart" }
        ]}
      />
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary/5 dark:from-slate-950 dark:via-slate-900 dark:to-primary/10">
      <Sidebar />
      <div className={`transition-all duration-300 ${isExpanded ? 'md:ml-72 ml-0' : 'md:ml-20 ml-0'} md:pt-0 pt-20`}>
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
              <UserCircle className="w-4 h-4 mr-2" />
              SmartStart Ecosystem
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
              Where People and Businesses
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary"> Grow Differently</span>
            </h1>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-4">
              Join our community-first ecosystem where collaboration beats competition. 
              Access premium tools, build ventures, and grow with like-minded entrepreneurs.
            </p>
              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8">
                SmartStart combines <strong>Hub</strong> (command center for secure SaaS), <strong>Membership</strong> (selective builder program), and <strong>Community</strong> (100+ entrepreneurs) into one powerful platform.
              </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6"
                  onClick={handleSubscription}
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Subscribe to SmartStart
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-primary text-primary hover:bg-primary/10 dark:hover:bg-primary/20 text-lg px-8 py-6"
                  onClick={handleSubscription}
                >
                  <Eye className="w-5 h-5 mr-2" />
                  Schedule Demo
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* SmartStart Hub Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <Badge className="mb-4 bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200">
                <Building2 className="w-4 h-4 mr-2" />
                SmartStart Hub
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                The Command Center for Secure, Audit-Ready SaaS
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8">
                Turn ideas into shipped, secure products. SmartStart Hub unifies execution, metrics, and compliance in one place—so your team can move fast <em>and</em> stay ISO/NIST-ready from day zero.
              </p>
              <Button 
                size="lg" 
                className="bg-cyan-600 hover:bg-cyan-700 text-white mb-8"
                onClick={handleSubscription}
              >
                <Rocket className="w-5 h-5 mr-2" />
                Subscribe to Access Hub
              </Button>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {hubFeatures.map((feature, index) => (
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

            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-8 text-white text-center">
              <p className="text-lg mb-4 font-semibold">
                Built by Security-Obsessed Builders, for Security-Obsessed Builders
              </p>
              <p className="mb-6">
                The same system powering products like <strong>Trakkit</strong>, <strong>Syncary</strong>, and <strong>C&C CRM</strong>—each managed, audited, and scaled through the Hub itself.
              </p>
              <Button 
                size="lg" 
                className="bg-white text-cyan-600 hover:bg-cyan-50"
                onClick={handleSubscription}
              >
                Get Hub Access Now
              </Button>
            </div>
          </div>
        </section>

        {/* Membership Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <Badge className="mb-4 bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200">
                <Award className="w-4 h-4 mr-2" />
                SmartStart Membership
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                A Selective Builder Program for Visionaries Who Execute
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8">
                Join a focused circle of founders, builders, and innovators who turn ideas into measurable progress. 
                Work directly with <strong>Udi Shkolnik</strong> and the SmartStart leadership team for strategic guidance, honest feedback, and shared growth.
              </p>
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={handleSubscription}
              >
                <Handshake className="w-5 h-5 mr-2" />
                Join Membership Today
              </Button>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {membershipBenefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="h-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                        <benefit.icon className="w-6 h-6 text-primary dark:text-primary" />
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

            <div className="bg-gradient-to-br from-primary to-secondary rounded-2xl p-8 text-primary-foreground text-center">
              <p className="text-xl font-semibold mb-4">
                "We don't talk about building — we build, measure, and improve."
              </p>
              <p className="mb-6">— Udi Shkolnik, Founder & CISO, SmartStart</p>
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-primary/10"
                onClick={handleSubscription}
              >
                Become a Member
              </Button>
            </div>
        </div>
      </section>

        {/* Community Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                Complete Platform Access
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                Everything you need to build, grow, and succeed
            </p>
          </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {communityFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-primary dark:text-primary" />
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

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                Why Join SmartStart?
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
                Community First. Collaboration Over Competition. Real Growth. 
                Join 100+ entrepreneurs who believe in growing differently through shared knowledge and resources.
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
                <Button 
                  size="lg" 
                  className="mt-8 bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={handleSubscription}
                >
                  <Rocket className="w-5 h-5 mr-2" />
                  Subscribe Now
                </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-primary to-secondary rounded-2xl p-8 text-primary-foreground">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">100+</div>
                    <div className="text-primary-foreground/80">Community Members</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">50+</div>
                    <div className="text-primary-foreground/80">Events Hosted</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">30+</div>
                    <div className="text-primary-foreground/80">Startups Supported</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">15+</div>
                    <div className="text-primary-foreground/80">Pro-Bono Projects</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Events Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Community Events
            </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8">
              Regular events and meetups to connect, learn, and grow together
            </p>
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={handleSubscription}
              >
                <Calendar className="w-5 h-5 mr-2" />
                Subscribe to Access Events
              </Button>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {events.map((event, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {event.title}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {event.frequency}
                      </Badge>
                    </div>
                    <p className="text-primary dark:text-primary text-sm mb-3">
                      {event.location}
                    </p>
                    <p className="text-slate-600 dark:text-slate-300 text-sm">
                      {event.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                Choose Your Subscription Plan
            </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-4">
                Start with a trial or dive into the full SmartStart experience with Hub, Membership, and Community access
              </p>
              <p className="text-base text-slate-500 dark:text-slate-400">
                All plans include access to SmartStart Hub, Membership benefits, and Community events
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {pricing.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative"
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                  <Card className={`h-full bg-card/80 dark:bg-card/80 backdrop-blur-sm border-border dark:border-border ${plan.popular ? 'border-primary dark:border-primary ring-2 ring-primary/20' : ''}`}>
                  <CardContent className="p-8">
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        {plan.name}
                      </h3>
                      <div className="text-4xl font-bold text-slate-900 dark:text-white mb-1">
                        {plan.price}
                        <span className="text-lg text-slate-600 dark:text-slate-300 font-normal">
                          /{plan.period}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300">
                        {plan.description}
                      </p>
                    </div>
                    <div className="space-y-3 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-primary dark:text-primary flex-shrink-0" />
                          <span className="text-slate-700 dark:text-slate-300">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <Button 
                        className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-6' : 'bg-slate-900 hover:bg-slate-800 text-white text-lg py-6'}`}
                      size="lg"
                        onClick={handleSubscription}
                    >
                      {plan.buttonText}
                        <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

        {/* Final CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary to-secondary">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Grow Differently?
            </h2>
              <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              Join our community-first ecosystem where collaboration beats competition. 
                Get access to SmartStart Hub, Membership benefits, and Community events—all in one powerful subscription.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                  className="bg-white text-primary hover:bg-primary/10 text-lg px-8 py-6"
                  onClick={handleSubscription}
              >
                <Calendar className="w-5 h-5 mr-2" />
                  Subscribe to SmartStart Today
              </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white/10 text-lg px-8 py-6"
                  onClick={handleSubscription}
                >
                <Heart className="w-5 h-5 mr-2" />
                  Start Free Trial
              </Button>
            </div>
              <p className="mt-6 text-primary-foreground/80">
                Join 100+ entrepreneurs who are already growing differently
              </p>
          </motion.div>
        </div>
      </section>

      <Footer />
      </div>
    </div>
    </>
  );
};

export default SmartStart;
