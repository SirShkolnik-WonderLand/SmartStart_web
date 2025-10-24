import React from 'react';
import { motion } from 'framer-motion';
import { Users, Rocket, Zap, Target, CheckCircle, ArrowRight, Phone, Calendar, Award, Building2, Heart } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const SmartStart: React.FC = () => {
  const features = [
    {
      icon: Users,
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
      popular: false
    },
    {
      name: "Full Program",
      price: "$98.80",
      period: "per month",
      description: "Complete access to all SmartStart platform features and community benefits",
      features: [
        "Full community access",
        "All events and meetups",
        "Enterprise tools (Zoho, Acronis, Slack)",
        "Venture building track",
        "Second Brain platform",
        "Direct mentorship",
        "Pro-bono cybersecurity reviews"
      ],
      buttonText: "Join Now",
      popular: true
    }
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
              SmartStart Ecosystem
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
              Where People and Businesses
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600"> Grow Differently</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8">
              Join our community-first ecosystem where collaboration beats competition. 
              Access premium tools, build ventures, and grow with like-minded entrepreneurs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700 text-white">
                <Calendar className="w-5 h-5 mr-2" />
                Join SmartStart
              </Button>
              <Button size="lg" variant="outline" className="border-cyan-600 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950">
                View Events
                <ArrowRight className="w-5 h-5 ml-2" />
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
              What's Included
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Comprehensive platform for entrepreneurs and growing businesses
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
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">100+</div>
                    <div className="text-cyan-100">Community Members</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">50+</div>
                    <div className="text-cyan-100">Events Hosted</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">30+</div>
                    <div className="text-cyan-100">Startups Supported</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">15+</div>
                    <div className="text-cyan-100">Pro-Bono Projects</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
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
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Regular events and meetups to connect, learn, and grow together
            </p>
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
                    <p className="text-cyan-600 dark:text-cyan-400 text-sm mb-3">
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
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Choose Your Path
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Start with a trial or dive into the full SmartStart experience
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
                    <Badge className="bg-cyan-600 text-white px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <Card className={`h-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 ${plan.popular ? 'border-cyan-600 dark:border-cyan-400' : ''}`}>
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
                          <CheckCircle className="w-5 h-5 text-cyan-600 dark:text-cyan-400 flex-shrink-0" />
                          <span className="text-slate-700 dark:text-slate-300">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <Button 
                      className={`w-full ${plan.popular ? 'bg-cyan-600 hover:bg-cyan-700 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'}`}
                      size="lg"
                    >
                      {plan.buttonText}
                    </Button>
                  </CardContent>
                </Card>
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
              Ready to Grow Differently?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
              Join our community-first ecosystem where collaboration beats competition. 
              Start your journey with SmartStart today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700 text-white">
                <Calendar className="w-5 h-5 mr-2" />
                Join SmartStart Today
              </Button>
              <Button size="lg" variant="outline" className="border-slate-300 dark:border-slate-600">
                <Heart className="w-5 h-5 mr-2" />
                Learn About Our Values
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SmartStart;
