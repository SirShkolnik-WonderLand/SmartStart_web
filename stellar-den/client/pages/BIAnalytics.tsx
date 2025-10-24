import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Eye, Target, CheckCircle, ArrowRight, Phone, Download, Zap, Users, Database, Shield } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const BIAnalytics: React.FC = () => {
  const services = [
    {
      icon: BarChart3,
      title: "Real-time Dashboards",
      description: "Interactive dashboards with real-time data visualization and customizable KPIs for informed decision making."
    },
    {
      icon: Database,
      title: "Data Integration",
      description: "Seamless integration of data from multiple sources including CRM, ERP, and external APIs with automated processing."
    },
    {
      icon: Target,
      title: "Predictive Analytics",
      description: "Advanced analytics and machine learning models to predict trends, identify opportunities, and optimize performance."
    },
    {
      icon: Shield,
      title: "Privacy-Compliant Analytics",
      description: "Analytics solutions designed with Canadian privacy law compliance including PHIPA/PIPEDA requirements."
    }
  ];

  const benefits = [
    "Data-driven decision making with real-time insights",
    "Improved operational efficiency and cost optimization",
    "Enhanced customer understanding and segmentation",
    "Predictive analytics for proactive business strategies",
    "Automated reporting and KPI monitoring",
    "Privacy-compliant data processing and storage",
    "Scalable analytics infrastructure for growth",
    "Integration with existing business systems"
  ];

  const features = [
    {
      title: "Interactive Dashboards",
      description: "Customizable dashboards with drag-and-drop functionality, real-time updates, and mobile-responsive design."
    },
    {
      title: "Data Visualization",
      description: "Advanced charts, graphs, and visualizations to make complex data easily understandable and actionable."
    },
    {
      title: "Automated Reporting",
      description: "Scheduled reports and automated insights delivery to stakeholders via email or dashboard notifications."
    },
    {
      title: "Performance Monitoring",
      description: "Real-time monitoring of key performance indicators with alerts and notifications for critical metrics."
    },
    {
      title: "Data Governance",
      description: "Comprehensive data governance framework ensuring data quality, security, and compliance with privacy regulations."
    },
    {
      title: "Machine Learning Integration",
      description: "Advanced analytics with machine learning models for predictive insights and automated decision support."
    }
  ];

  const process = [
    {
      step: "01",
      title: "Data Assessment",
      description: "Evaluate existing data sources, quality, and integration requirements for your analytics needs."
    },
    {
      step: "02",
      title: "Strategy Design",
      description: "Design analytics strategy and architecture aligned with business objectives and privacy requirements."
    },
    {
      step: "03",
      title: "Implementation",
      description: "Build and deploy analytics solutions including dashboards, data pipelines, and reporting systems."
    },
    {
      step: "04",
      title: "Training & Adoption",
      description: "Train your team on using analytics tools and establish best practices for data-driven decision making."
    },
    {
      step: "05",
      title: "Optimization",
      description: "Continuous optimization of analytics performance, accuracy, and user experience."
    },
    {
      step: "06",
      title: "Ongoing Support",
      description: "Provide ongoing support, maintenance, and enhancement of your analytics infrastructure."
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
              <BarChart3 className="w-4 h-4 mr-2" />
              BI & Analytics
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
              Business Intelligence &
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600"> Analytics</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8">
              Transform your data into actionable insights with our comprehensive BI and analytics solutions. 
              Make data-driven decisions with real-time dashboards and predictive analytics.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700 text-white">
                <Phone className="w-5 h-5 mr-2" />
                Get Started
              </Button>
              <Button size="lg" variant="outline" className="border-cyan-600 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950">
                <Eye className="w-5 h-5 mr-2" />
                View Demo
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
              Our BI & Analytics Services
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Comprehensive analytics solutions for data-driven business growth
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
                Why Choose Our BI & Analytics?
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
                Our analytics solutions are designed with privacy compliance and business growth in mind. 
                Get actionable insights while maintaining the highest standards of data protection.
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
                  <h3 className="text-2xl font-bold mb-2">Analytics Impact</h3>
                  <p className="text-cyan-100">Real results for businesses</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1">40%</div>
                    <div className="text-cyan-100 text-sm">Cost Reduction</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1">60%</div>
                    <div className="text-cyan-100 text-sm">Faster Decisions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1">25%</div>
                    <div className="text-cyan-100 text-sm">Revenue Growth</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1">100%</div>
                    <div className="text-cyan-100 text-sm">Privacy Compliant</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Analytics Features
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Comprehensive analytics capabilities for modern businesses
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 text-sm">
                      {feature.description}
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
              Our proven 6-step approach to analytics implementation
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
              Ready to Transform Your Data?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
              Start making data-driven decisions with our comprehensive BI and analytics solutions. 
              Get insights that drive growth while maintaining privacy compliance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700 text-white">
                <Phone className="w-5 h-5 mr-2" />
                Schedule Consultation
              </Button>
              <Button size="lg" variant="outline" className="border-slate-300 dark:border-slate-600">
                Download Analytics Guide
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

export default BIAnalytics;
