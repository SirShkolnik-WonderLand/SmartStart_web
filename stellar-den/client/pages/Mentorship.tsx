import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Target, CheckCircle, ArrowRight, Phone, Eye, Calendar, Award, Shield, Zap, Building2, UserCircle } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import { useSidebar } from '@/contexts/SidebarContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Mentorship: React.FC = () => {
  const { isExpanded } = useSidebar();
  const mentors = [
    {
      name: "Udi Shkolnik",
      expertise: "Cybersecurity, ISO, AI ops",
      description: "CISSP, CISM, ISO Lead Auditor with 15+ years of experience in cybersecurity and compliance."
    }
  ];

  const tracks = [
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

  const benefits = [
    "Access to experienced mentors with proven track records",
    "Structured 6-week mentorship tracks with clear objectives",
    "Practical guidance on real business challenges",
    "Networking opportunities with industry experts",
    "Personalized mentorship tailored to your specific needs",
    "Ongoing support and guidance throughout your journey",
    "Community access to other mentees and entrepreneurs",
    "Practical tools and frameworks for business growth"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-cyan-950">
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
            <Badge className="mb-4 bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200">
              <GraduationCap className="w-4 h-4 mr-2" />
              Mentorship
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
              6-Week Mentor
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600"> Tracks</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8">
              SmartStart's structured mentorship program connecting you with experienced mentors 
              for focused, practical guidance on your business challenges.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700 text-white">
                <GraduationCap className="w-5 h-5 mr-2" />
                Find a Mentor
              </Button>
              <Button size="lg" variant="outline" className="border-cyan-600 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950">
                <Award className="w-5 h-5 mr-2" />
                Become a Mentor
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mentors Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Our Mentors
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Experienced professionals ready to guide your success
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {mentors.map((mentor, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-cyan-100 dark:bg-cyan-900 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <GraduationCap className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2 text-center">
                      {mentor.name}
                    </h3>
                    <div className="text-sm text-cyan-600 dark:text-cyan-400 font-medium mb-3 text-center">
                      {mentor.expertise}
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-sm text-center">
                      {mentor.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tracks Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Mentorship Tracks
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Structured 6-week programs with clear objectives and practical outcomes
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {tracks.map((track, index) => (
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
                      <Target className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
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
              Why Choose SmartStart Mentorship?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Structured guidance from experienced professionals
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
              Ready to Start Your Mentorship Journey?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
              Find a mentor to guide your success or become a mentor to help others grow. 
              Join our structured 6-week mentorship program.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700 text-white">
                <GraduationCap className="w-5 h-5 mr-2" />
                Find a Mentor
              </Button>
              <Button size="lg" variant="outline" className="border-slate-300 dark:border-slate-600">
                <Award className="w-5 h-5 mr-2" />
                Become a Mentor
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
      </div>
    </div>
  );
};

export default Mentorship;
