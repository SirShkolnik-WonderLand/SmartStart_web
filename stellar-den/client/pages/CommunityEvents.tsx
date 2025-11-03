import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Calendar, Users, BookOpen, Beer, CheckCircle, ArrowRight, Phone, Eye, MapPin, Clock, Target, Shield, Rocket, GraduationCap } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import { useSidebar } from '@/contexts/SidebarContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import StructuredData from '@/components/StructuredData';

const CommunityEvents: React.FC = () => {
  const { isCollapsed } = useSidebar();
  const pageUrl = 'https://alicesolutionsgroup.com/community-events';
  const pageTitle = 'Community Events | Launch & Learn, Beer + Security | SmartStart Toronto';
  const pageDescription = 'Join SmartStart community events in Toronto: Launch & Learn Sessions, Beer + Security Nights, and technical workshops. Hybrid format (GTA + online). Monthly events for entrepreneurs.';
  const eventTypes = [
    {
      icon: Rocket,
      title: "Launch & Learn Sessions",
      description: "Builders demo what they've shipped that month. Live product demonstrations and technical deep dives.",
      features: [
        "Live product demonstrations",
        "Technical deep dives",
        "Q&A sessions with builders",
        "Networking opportunities"
      ],
      frequency: "Bi-weekly",
      location: "Virtual & In-person"
    },
    {
      icon: Beer,
      title: "Beer + Security Nights",
      description: "Founded by Udi, a former commando and CISO. Technical security discussions without the hype in Toronto's tech pubs.",
      features: [
        "Monthly sessions across Toronto tech pubs",
        "Invite-only for real practitioners",
        "Casual & technical discussions",
        "CSP, Zero-Trust, and ISO compliance topics"
      ],
      frequency: "Monthly",
      location: "Toronto Pubs + Online"
    },
    {
      icon: Target,
      title: "Workshops",
      description: "Technical deep dives covering topics like Mapbox APIs, ISO preparation, and security best practices.",
      features: [
        "Hands-on technical training",
        "Expert-led sessions",
        "Practical implementation guides",
        "Interactive learning experiences"
      ],
      frequency: "Monthly",
      location: "Toronto + Online"
    }
  ];

  const eventDetails = [
    {
      title: "Hybrid Format",
      description: "All events are available both in-person in the GTA and online for remote participation."
    },
    {
      title: "Community Hosted",
      description: "Events are hosted by SmartStart members and partners, ensuring authentic, peer-to-peer learning."
    },
    {
      title: "Regular Schedule",
      description: "Consistent monthly events with varying formats to accommodate different learning styles and schedules."
    }
  ];

  const upcomingEvents = [
    {
      title: "Launch & Learn: Clinic-e Beta Demo",
      date: "November 15, 2024",
      time: "7:00 PM EST",
      location: "Toronto + Online",
      description: "Presentation of the Clinic-e beta and insights from building a healthcare CRM."
    },
    {
      title: "Workshop: Mapbox Integration",
      date: "November 22, 2024",
      time: "6:00 PM EST",
      location: "Toronto + Online",
      description: "Technical deep dive into Mapbox APIs and geolocation services for web applications."
    },
    {
      title: "Beer + Security: Zero Trust Architecture",
      date: "November 29, 2024",
      time: "7:30 PM EST",
      location: "Toronto Pub + Online",
      description: "Informal discussion on implementing zero-trust security in small teams and startups."
    }
  ];

  const benefits = [
    "Access to exclusive technical workshops and training sessions",
    "Networking opportunities with like-minded builders and entrepreneurs",
    "Live product demonstrations and technical deep dives",
    "Informal learning and discussion opportunities",
    "Hybrid format for flexible participation",
    "Community-hosted events with authentic peer-to-peer learning",
    "Regular schedule with diverse event formats",
    "Integration with SmartStart ecosystem and tools"
  ];

  // Community Events Schema
  const communityEventsSchema = {
    "@context": "https://schema.org",
    "@type": "EventSeries",
    "name": "SmartStart Community Events",
    "description": "Regular community events for Toronto entrepreneurs including Launch & Learn Sessions, Beer + Security Nights, and workshops",
    "organizer": {
      "@type": "Organization",
      "name": "AliceSolutionsGroup",
      "alternateName": "SmartStart Toronto"
    },
    "location": {
      "@type": "Place",
      "name": "Toronto, Ontario",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Toronto",
        "addressRegion": "ON",
        "addressCountry": "CA"
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content="startup events Toronto, entrepreneur events GTA, Launch & Learn Toronto, Beer + Security Toronto, startup workshops Ontario, entrepreneur meetups Toronto, startup networking Toronto" />
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
          {JSON.stringify(communityEventsSchema)}
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
          { name: "Events", url: "/community-events" }
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
              <Calendar className="w-4 h-4 mr-2" />
              Community Events
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
              Learn, Build, and
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600"> Connect</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8">
              Join our community events including Launch & Learn Sessions, technical workshops, 
              and Beer + Security Nights. All events are hybrid (GTA + online) and hosted by SmartStart members.
              Built on the principle of freedom through structure and rules that create space for creativity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700 text-white">
                <Calendar className="w-5 h-5 mr-2" />
                See Upcoming Events
              </Button>
              <Button size="lg" variant="outline" className="border-cyan-600 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950">
                <Phone className="w-5 h-5 mr-2" />
                Request Event Info
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Event Types Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Event Types
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Diverse learning and networking opportunities for the SmartStart community
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {eventTypes.map((eventType, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900 rounded-lg flex items-center justify-center mb-4">
                      <eventType.icon className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                      {eventType.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 mb-4">
                      {eventType.description}
                    </p>
                    <div className="flex items-center gap-4 mb-4 text-sm text-slate-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{eventType.frequency}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{eventType.location}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {eventType.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-cyan-600 dark:text-cyan-400 flex-shrink-0" />
                          <span className="text-sm text-slate-600 dark:text-slate-300">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Event Details Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                Event Details
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
                Our community events are designed to provide maximum value and flexibility 
                for all participants, regardless of location or schedule.
              </p>
              <div className="space-y-6">
                {eventDetails.map((detail, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="flex items-start gap-4"
                  >
                    <div className="w-8 h-8 bg-cyan-100 dark:bg-cyan-900 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                        {detail.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300">
                        {detail.description}
                      </p>
                    </div>
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
                  <h3 className="text-2xl font-bold mb-2">Community Hosted</h3>
                  <p className="text-cyan-100">Authentic peer-to-peer learning</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1">GTA</div>
                    <div className="text-cyan-100 text-sm">In-Person</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1">Online</div>
                    <div className="text-cyan-100 text-sm">Remote</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1">Monthly</div>
                    <div className="text-cyan-100 text-sm">Regular</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1">Community</div>
                    <div className="text-cyan-100 text-sm">Hosted</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Upcoming Events
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Join our upcoming community events and workshops
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {upcomingEvents.map((event, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Upcoming
                      </Badge>
                      <Calendar className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                      {event.title}
                    </h3>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-500" />
                        <span className="text-sm text-slate-600 dark:text-slate-300">{event.date} at {event.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-500" />
                        <span className="text-sm text-slate-600 dark:text-slate-300">{event.location}</span>
                      </div>
                    </div>
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

      {/* Benefits Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Why Attend Community Events?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Join our community events for learning, networking, and collaboration opportunities
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
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
              Ready to Join Our Community Events?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
              Connect with builders, learn new skills, and participate in our vibrant community events. 
              All events are hybrid format for maximum accessibility.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700 text-white">
                <Calendar className="w-5 h-5 mr-2" />
                See Upcoming Events
              </Button>
              <Button size="lg" variant="outline" className="border-slate-300 dark:border-slate-600">
                <Phone className="w-5 h-5 mr-2" />
                Request Event Info
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

export default CommunityEvents;
