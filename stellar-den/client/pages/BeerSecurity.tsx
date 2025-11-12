import React from 'react';
import { motion } from 'framer-motion';
import { Beer, Shield, Users, CheckCircle, ArrowRight, Phone, Eye, MapPin, Calendar, Target } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import { useSidebar } from '@/contexts/SidebarContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const BeerSecurity: React.FC = () => {
  const { isExpanded } = useSidebar();
  const topics = [
    {
      icon: Shield,
      title: "CSP and Zero-Trust in Real Products",
      description: "Practical implementation of Content Security Policy and zero-trust architecture in production environments."
    },
    {
      icon: Target,
      title: "Security Automation for Small Teams",
      description: "How to implement effective security automation without overwhelming small development teams."
    },
    {
      icon: Users,
      title: "ISO Compliance Without Bureaucracy",
      description: "Streamlining ISO compliance processes to focus on real security improvements rather than paperwork."
    }
  ];

  const sessionDetails = [
    {
      title: "Monthly Sessions",
      description: "Regular monthly meetups across Toronto's tech pubs and venues"
    },
    {
      title: "Invite-Only",
      description: "Exclusive access for real practitioners and security professionals"
    },
    {
      title: "Casual & Technical",
      description: "Blend of technical discussions with relaxed, community atmosphere"
    }
  ];

  const benefits = [
    "Access to authentic technical security discussions",
    "Networking with real security practitioners",
    "Practical insights from hands-on experience",
    "Casual learning environment without corporate pressure",
    "Monthly meetups in Toronto tech pubs",
    "Invite-only community of security professionals",
    "Technical deep dives in relaxed settings",
    "Community building through shared expertise"
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
              <Beer className="w-4 h-4 mr-2" />
              Beer + Security
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
              Technical Security
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600"> Without the Hype</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8">
              Founded by Udi, a former commando and CISO, Beer + Security blends technical security 
              with community energy. Monthly sessions across Toronto's tech pubs for real practitioners.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700 text-white">
                <Phone className="w-5 h-5 mr-2" />
                Request Invite
              </Button>
              <Button size="lg" variant="outline" className="border-cyan-600 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950">
                <Calendar className="w-5 h-5 mr-2" />
                View Schedule
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Topics Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Discussion Topics
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Authentic technical discussions on real-world security challenges
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {topics.map((topic, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900 rounded-lg flex items-center justify-center mb-4">
                      <topic.icon className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                      {topic.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300">
                      {topic.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Session Details Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                Session Details
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
                Beer + Security sessions happen monthly across Toronto's tech pubs. 
                Founded by Udi, blending technical security expertise with community energy.
              </p>
              <div className="space-y-6">
                {sessionDetails.map((detail, index) => (
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
                  <h3 className="text-2xl font-bold mb-2">Toronto Tech Pubs</h3>
                  <p className="text-cyan-100">Monthly meetups</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1">Monthly</div>
                    <div className="text-cyan-100 text-sm">Sessions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1">Invite</div>
                    <div className="text-cyan-100 text-sm">Only</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1">Real</div>
                    <div className="text-cyan-100 text-sm">Practitioners</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1">Casual</div>
                    <div className="text-cyan-100 text-sm">Technical</div>
                  </div>
                </div>
              </div>
            </motion.div>
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
              Why Join Beer + Security?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Authentic technical discussions in a relaxed, community-focused environment
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
              Ready to Join Beer + Security?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
              Request an invite to join our monthly technical security discussions. 
              Casual atmosphere, serious technical content, real practitioners only.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700 text-white">
                <Phone className="w-5 h-5 mr-2" />
                Request Invite
              </Button>
              <Button size="lg" variant="outline" className="border-slate-300 dark:border-slate-600">
                <Calendar className="w-5 h-5 mr-2" />
                View Schedule
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

export default BeerSecurity;
