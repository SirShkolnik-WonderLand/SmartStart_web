import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Shield, CheckCircle, Eye, Users, Building2, Lock, FileText, TrendingUp, Layers, Code, Calendar, Download } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import { useSidebar } from '@/contexts/SidebarContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const SmartStartHub: React.FC = () => {
  const { isExpanded } = useSidebar();
  const coreFeatures = [
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

  const testimonials = [
    {
      quote: "Everything we build runs through this hub—every feature, sprint, and audit trace. It's how we keep speed and security aligned.",
      author: "Udi Shkolnik",
      role: "Founder / CISO / CTO, AliceSolutionsGroup"
    },
    {
      quote: "The security-first approach means we're never scrambling before audits or investor checks. The evidence is already part of the work.",
      author: "SmartStart Venture Team",
      role: "SmartStart Venture Team"
    }
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
              <Building2 className="w-4 h-4 mr-2" />
              SmartStart Hub
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
              The Command Center for Secure, Audit-Ready SaaS
            </h1>
            <p className="text-2xl md:text-3xl font-semibold text-slate-700 dark:text-slate-200 max-w-3xl mx-auto mb-6">
              Where People and Businesses Grow Differently
            </p>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-4">
              Turn ideas into shipped, secure products. SmartStart Hub unifies execution, metrics, and compliance in one place—so your team can move fast <em>and</em> stay ISO/NIST-ready from day zero.
            </p>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8">
              Built by <strong>Udi Shkolnik</strong> (CISO, CTO, ISO Lead Auditor) after decades of building and securing enterprise SaaS systems.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700 text-white">
                <Eye className="w-5 h-5 mr-2" />
                See the Hub in Action
              </Button>
              <Button size="lg" variant="outline" className="border-cyan-600 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950">
                <Calendar className="w-5 h-5 mr-2" />
                Schedule Demo
              </Button>
          </div>
          </motion.div>
        </div>
      </section>

      {/* Why SmartStart Hub Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Built by Security-Obsessed Builders, for Security-Obsessed Builders
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-4">
              SmartStart Hub was born from real experience operating and auditing SaaS ventures under tight security standards.
            </p>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-4">
              It's the same system powering products like <strong>Trakkit</strong>, <strong>Syncary</strong>, and <strong>C&C CRM</strong>—each managed, audited, and scaled through the Hub itself.
            </p>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              For founders, CTOs, CISOs, and studios building multiple ventures, SmartStart Hub serves as your <strong>operational backbone</strong>: a place where every sprint, decision, and document stays aligned with compliance.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              What You Get Out of the Box
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Comprehensive platform for entrepreneurs and growing businesses.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {coreFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                <Card className="h-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-8">
                    <div className="w-16 h-16 bg-cyan-100 dark:bg-cyan-900 rounded-lg flex items-center justify-center mb-6">
                      <feature.icon className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
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

      {/* Compliance & Security Advantage Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                Security-Ready from Day Zero
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-6">
                Most teams try to "bolt on" compliance right before an audit. SmartStart Hub does the opposite.
              </p>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-6">
                From the first sprint:
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-cyan-600 dark:text-cyan-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">Every task and event is automatically logged.</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-cyan-600 dark:text-cyan-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">Evidence is mapped to ISO/NIST controls.</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-cyan-600 dark:text-cyan-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">Audit reports are generated on demand.</span>
                </div>
              </div>
              <p className="text-lg text-slate-600 dark:text-slate-300 mt-6 font-semibold">
                You don't prepare for compliance—you operate within it.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-8 text-white">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">Proven in the Field</h3>
                </div>
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">5+</div>
                    <div className="text-cyan-100">Active Ventures</div>
                    <div className="text-sm text-cyan-200 mt-1">built and managed through SmartStart Hub</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">20+</div>
                    <div className="text-cyan-100">Years</div>
                    <div className="text-sm text-cyan-200 mt-1">of experience in cybersecurity and SaaS development</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">ISO 27001 / 27799</div>
                    <div className="text-cyan-100">Aligned</div>
                    <div className="text-sm text-cyan-200 mt-1">workflows built into daily operations</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">100%</div>
                    <div className="text-cyan-100">Security-First Culture</div>
                    <div className="text-sm text-cyan-200 mt-1">from design to deployment</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              What Our Teams Say
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900 rounded-full flex items-center justify-center flex-shrink-0">
                        <Users className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                      </div>
                      <div>
                        <blockquote className="text-lg text-slate-700 dark:text-slate-300 mb-4 italic">
                          "{testimonial.quote}"
                        </blockquote>
                        <div className="text-sm">
                          <div className="font-semibold text-slate-900 dark:text-white">
                            — {testimonial.author}
                          </div>
                          <div className="text-slate-600 dark:text-slate-400">
                            {testimonial.role}
                          </div>
                        </div>
                      </div>
                    </div>
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
              Ready to See SmartStart Hub in Action?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
              If you build products where security and compliance matter, SmartStart Hub is your command center. Launch faster, stay audit-ready, and scale with confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700 text-white">
                <Eye className="w-5 h-5 mr-2" />
                See the Hub in Action
              </Button>
              <Button size="lg" variant="outline" className="border-cyan-600 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950">
                <Calendar className="w-5 h-5 mr-2" />
                Schedule Demo
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

export default SmartStartHub;