import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, BookOpen, Beer, CheckCircle, ArrowRight, Phone, Eye, MapPin, Clock, Target } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const CommunityEvents: React.FC = () => {
  const eventTypes = [
    {
      icon: BookOpen,
      title: "Launch & Learn Sessions",
      description: "Product demos and live deconstructions where builders showcase what they've shipped that month.",
      features: [
        "Live product demonstrations",
        "Technical deep dives",
        "Q&A sessions with builders",
        "Networking opportunities"
      ]
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
      ]
    },
    {
      icon: Beer,
      title: "Beer + Security Nights",
      description: "Informal discussions on cybersecurity and startups in a relaxed, collaborative environment.",
      features: [
        "Casual networking",
        "Technical discussions",
        "Industry insights",
        "Community building"
      ]
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
      description: "Brian presents the Clinic-e beta and shares insights from building a healthcare CRM."
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
  );
};

export default CommunityEvents;
