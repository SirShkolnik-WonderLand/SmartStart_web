import React from 'react';
import { motion } from 'framer-motion';
import { Target, FileCheck, Users, TrendingUp, CheckCircle, ArrowRight, Phone, Download, Eye, Search, Award } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const AdvisoryAudits: React.FC = () => {
  const services = [
    {
      icon: FileCheck,
      title: "Security Program Reviews",
      description: "Comprehensive evaluation of your security program maturity, policies, and procedures with actionable recommendations."
    },
    {
      icon: Target,
      title: "Technology Due Diligence",
      description: "Technical due diligence for M&A transactions, investment decisions, and strategic partnerships."
    },
    {
      icon: Users,
      title: "Executive Briefings",
      description: "Board-level presentations and executive briefings on security posture, risks, and strategic recommendations."
    },
    {
      icon: Award,
      title: "Compliance Audits",
      description: "SOC 2 readiness reviews, ISO 27001 gap analysis, and NIST CSF 2.0 posture assessments."
    }
  ];

  const benefits = [
    "Objective assessment of your security posture and maturity",
    "Actionable recommendations for improvement and compliance",
    "Expert guidance on security strategy and implementation",
    "Risk identification and mitigation strategies",
    "Board-level reporting and executive communication",
    "Technology evaluation and due diligence support",
    "Compliance gap analysis and remediation planning",
    "Strategic security roadmap development"
  ];

  const auditTypes = [
    {
      title: "SOC 2 Readiness Review",
      description: "Comprehensive assessment of SOC 2 Type I and Type II readiness with gap analysis and remediation planning."
    },
    {
      title: "ISO 27001 Gap Analysis",
      description: "Detailed evaluation against ISO 27001:2022 requirements with implementation roadmap and recommendations."
    },
    {
      title: "NIST CSF 2.0 Assessment",
      description: "Current state assessment against NIST Cybersecurity Framework 2.0 with maturity scoring and improvement plan."
    },
    {
      title: "Technology Due Diligence",
      description: "Technical evaluation for M&A transactions, investment decisions, and strategic technology assessments."
    },
    {
      title: "Security Program Maturity",
      description: "Comprehensive evaluation of security program maturity with benchmarking and improvement recommendations."
    },
    {
      title: "Executive Security Briefings",
      description: "Board-level presentations on security posture, risks, and strategic recommendations for leadership teams."
    }
  ];

  const process = [
    {
      step: "01",
      title: "Assessment Planning",
      description: "Define scope, objectives, and methodology for the security assessment or advisory engagement."
    },
    {
      step: "02",
      title: "Data Collection",
      description: "Gather information through interviews, documentation review, and technical assessments."
    },
    {
      step: "03",
      title: "Analysis & Evaluation",
      description: "Analyze findings, evaluate against standards, and identify gaps and risks."
    },
    {
      step: "04",
      title: "Reporting & Recommendations",
      description: "Develop comprehensive report with findings, recommendations, and actionable next steps."
    },
    {
      step: "05",
      title: "Presentation & Briefing",
      description: "Present findings to stakeholders and provide executive briefings on key recommendations."
    },
    {
      step: "06",
      title: "Implementation Support",
      description: "Provide ongoing support for implementing recommendations and achieving compliance objectives."
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
              <Target className="w-4 h-4 mr-2" />
              Advisory & Audits
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
              Advisory &
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600"> Audits</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8">
              Expert security advisory services and comprehensive audits to assess your security posture, 
              identify risks, and provide actionable recommendations for improvement.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700 text-white">
                <Phone className="w-5 h-5 mr-2" />
                Schedule Assessment
              </Button>
              <Button size="lg" variant="outline" className="border-cyan-600 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950">
                <Eye className="w-5 h-5 mr-2" />
                View Audit Types
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
              Our Advisory & Audit Services
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Comprehensive security assessments and expert advisory services
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
                Why Choose Our Advisory Services?
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
                Our advisory services provide objective assessment and expert guidance to help you 
                improve your security posture, achieve compliance, and make informed technology decisions.
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
                  <h3 className="text-2xl font-bold mb-2">Expert Assessment</h3>
                  <p className="text-cyan-100">Comprehensive security evaluation</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1">15+</div>
                    <div className="text-cyan-100 text-sm">Years Experience</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1">50+</div>
                    <div className="text-cyan-100 text-sm">Assessments</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1">100%</div>
                    <div className="text-cyan-100 text-sm">Client Satisfaction</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1">11</div>
                    <div className="text-cyan-100 text-sm">Certifications</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Audit Types */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Audit & Assessment Types
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Comprehensive security assessments tailored to your specific needs
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {auditTypes.map((audit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Search className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {audit.title}
                      </h3>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-sm">
                      {audit.description}
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
              Assessment Process
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Our proven 6-step approach to security assessments and advisory services
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
              Ready for a Security Assessment?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
              Get expert assessment of your security posture with actionable recommendations 
              for improvement and compliance. Schedule your assessment today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700 text-white">
                <Phone className="w-5 h-5 mr-2" />
                Schedule Free Consultation
              </Button>
              <Button size="lg" variant="outline" className="border-slate-300 dark:border-slate-600">
                Download Assessment Guide
                <Download className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AdvisoryAudits;
