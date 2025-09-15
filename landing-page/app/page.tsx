'use client'

import { useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { 
  Rocket, 
  Shield, 
  Users, 
  Zap, 
  Globe, 
  Lock, 
  CheckCircle, 
  ArrowRight,
  Star,
  TrendingUp,
  Building,
  Code,
  FileText,
  DollarSign,
  Slack,
  Microsoft,
  Crown,
  Sparkles
} from 'lucide-react'

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false)
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], [0, -50])

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-orange-900 opacity-80" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" />
        
        {/* Floating Elements */}
        <motion.div 
          className="absolute top-20 left-20 w-32 h-32 bg-blue-500/20 rounded-full blur-xl"
          animate={{ 
            y: [0, -20, 0],
            x: [0, 10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
        <motion.div 
          className="absolute top-40 right-32 w-24 h-24 bg-purple-500/20 rounded-full blur-xl"
          animate={{ 
            y: [0, 20, 0],
            x: [0, -15, 0],
            scale: [1, 0.9, 1]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
        <motion.div 
          className="absolute bottom-32 left-1/3 w-40 h-40 bg-orange-500/20 rounded-full blur-xl"
          animate={{ 
            y: [0, -30, 0],
            x: [0, 20, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
      </div>

      {/* Navigation */}
      <motion.nav 
        className="relative z-10 flex justify-between items-center p-6"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
            <Rocket className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            SmartStart
          </span>
        </div>
        
        <div className="hidden md:flex space-x-8">
          <a href="#features" className="hover:text-blue-400 transition-colors">Features</a>
          <a href="#pricing" className="hover:text-blue-400 transition-colors">Pricing</a>
          <a href="#ecosystem" className="hover:text-blue-400 transition-colors">Ecosystem</a>
          <a href="#contact" className="hover:text-blue-400 transition-colors">Contact</a>
        </div>

        <motion.button
          className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-2 rounded-full font-semibold hover:scale-105 transition-transform"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Get Started
        </motion.button>
      </motion.nav>

      {/* Hero Section */}
      <motion.section 
        className="relative z-10 text-center px-6 py-20"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
      >
        <motion.div
          className="inline-block mb-6"
          animate={{ 
            scale: [1, 1.05, 1],
            rotate: [0, 1, -1, 0]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Crown className="w-10 h-10 text-white" />
          </div>
        </motion.div>

        <motion.h1 
          className="text-6xl md:text-8xl font-bold mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-orange-400 bg-clip-text text-transparent">
            The Future of
          </span>
          <br />
          <span className="bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">
            Venture Creation
          </span>
        </motion.h1>

        <motion.p 
          className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          Join the revolutionary platform where entrepreneurs, developers, and investors 
          collaborate to build the next generation of successful startups. 
          <span className="text-blue-400 font-semibold"> Legal protection, token rewards, and global collaboration</span> - all in one place.
        </motion.p>

        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <motion.button
            className="bg-gradient-to-r from-blue-500 to-purple-500 px-8 py-4 rounded-full text-lg font-semibold flex items-center space-x-2 hover:scale-105 transition-transform"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>Launch Your Venture</span>
            <ArrowRight className="w-5 h-5" />
          </motion.button>
          
          <motion.button
            className="border-2 border-blue-500 px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-500/10 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Watch Demo
          </motion.button>
        </motion.div>

        {/* Stats */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
        >
          {[
            { number: "150+", label: "API Endpoints" },
            { number: "97+", label: "Database Tables" },
            { number: "24/7", label: "Platform Uptime" },
            { number: "∞", label: "Possibilities" }
          ].map((stat, index) => (
            <motion.div 
              key={index}
              className="text-center"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="text-3xl md:text-4xl font-bold text-blue-400 mb-2">
                {stat.number}
              </div>
              <div className="text-gray-400 text-sm">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <FeaturesSection />

      {/* Ecosystem Section */}
      <EcosystemSection />

      {/* Pricing Section */}
      <PricingSection />

      {/* CTA Section */}
      <CTASection />
    </div>
  )
}

function FeaturesSection() {
  const features = [
    {
      icon: Shield,
      title: "Legal Protection",
      description: "Complete legal framework with NDAs, contracts, and compliance tools for safe collaboration.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Users,
      title: "Global Collaboration",
      description: "Connect with entrepreneurs, developers, and investors worldwide in our secure ecosystem.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Zap,
      title: "Token Economy",
      description: "Earn BUZ tokens for contributions, stake for rewards, and participate in the platform economy.",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Building,
      title: "Venture Management",
      description: "Complete CRUD operations for startup ventures, teams, and project management.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Code,
      title: "Developer Tools",
      description: "150+ API endpoints, comprehensive documentation, and developer-friendly tools.",
      color: "from-indigo-500 to-blue-500"
    },
    {
      icon: FileText,
      title: "Document Management",
      description: "Digital signatures, contract management, and compliance tracking for all legal documents.",
      color: "from-pink-500 to-rose-500"
    }
  ]

  return (
    <motion.section 
      id="features"
      className="relative z-10 py-20 px-6"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 1 }}
      viewport={{ once: true }}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Platform Features
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Everything you need to build, launch, and scale your startup venture in one comprehensive platform.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ 
                scale: 1.05,
                y: -10,
                boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
              }}
            >
              <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
              <p className="text-gray-300 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}

function EcosystemSection() {
  const ecosystemItems = [
    {
      title: "Microsoft Integration",
      description: "Seamless integration with Microsoft 365, Teams, and Azure services for enterprise collaboration.",
      icon: Microsoft,
      color: "from-blue-600 to-blue-400"
    },
    {
      title: "Slack Workspaces",
      description: "Automatic Slack workspace creation with project-specific channels and team management.",
      icon: Slack,
      color: "from-purple-600 to-purple-400"
    },
    {
      title: "Professional Networks",
      description: "Connect with verified professionals, investors, and industry experts worldwide.",
      icon: Globe,
      color: "from-green-600 to-green-400"
    },
    {
      title: "Token Rewards",
      description: "Earn BUZ tokens for contributions, stake for higher rewards, and participate in governance.",
      icon: DollarSign,
      color: "from-orange-600 to-orange-400"
    }
  ]

  return (
    <motion.section 
      id="ecosystem"
      className="relative z-10 py-20 px-6 bg-gradient-to-r from-blue-900/20 to-purple-900/20"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 1 }}
      viewport={{ once: true }}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Complete Ecosystem
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Integrated with the tools and platforms you already use, plus exclusive SmartStart features.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {ecosystemItems.map((item, index) => (
            <motion.div
              key={index}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8"
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-start space-x-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${item.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{item.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}

function PricingSection() {
  const plans = [
    {
      name: "Starter",
      price: "Free",
      description: "Perfect for individual entrepreneurs",
      features: [
        "Basic venture creation",
        "Limited legal documents",
        "Community access",
        "Basic support"
      ],
      color: "from-gray-500 to-gray-400",
      popular: false
    },
    {
      name: "Professional",
      price: "$29",
      period: "/month",
      description: "For growing teams and ventures",
      features: [
        "Unlimited ventures",
        "Complete legal framework",
        "Microsoft 365 integration",
        "Slack workspace creation",
        "Priority support",
        "Advanced analytics"
      ],
      color: "from-blue-500 to-purple-500",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For large organizations",
      features: [
        "Everything in Professional",
        "Custom integrations",
        "Dedicated support",
        "On-premise deployment",
        "Custom legal frameworks",
        "White-label options"
      ],
      color: "from-purple-500 to-pink-500",
      popular: false
    }
  ]

  return (
    <motion.section 
      id="pricing"
      className="relative z-10 py-20 px-6"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 1 }}
      viewport={{ once: true }}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              Choose Your Plan
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Start free and scale as you grow. All plans include access to our global community and platform features.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              className={`relative bg-white/5 backdrop-blur-sm border rounded-2xl p-8 ${
                plan.popular 
                  ? 'border-blue-500/50 bg-blue-500/10' 
                  : 'border-white/10'
              }`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, y: -10 }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="text-4xl font-bold mb-2">
                  <span className={`bg-gradient-to-r ${plan.color} bg-clip-text text-transparent`}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-gray-400 text-lg">{plan.period}</span>
                  )}
                </div>
                <p className="text-gray-300">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <motion.button
                className={`w-full py-3 px-6 rounded-xl font-semibold transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
                    : 'border-2 border-white/20 hover:border-white/40 hover:bg-white/5'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}

function CTASection() {
  return (
    <motion.section 
      className="relative z-10 py-20 px-6 bg-gradient-to-r from-blue-900/30 to-purple-900/30"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 1 }}
      viewport={{ once: true }}
    >
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          className="w-24 h-24 bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-8"
          animate={{ 
            rotate: [0, 5, -5, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          <Sparkles className="w-12 h-12 text-white" />
        </motion.div>

        <motion.h2 
          className="text-4xl md:text-6xl font-bold mb-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-orange-400 bg-clip-text text-transparent">
            Ready to Launch?
          </span>
        </motion.h2>

        <motion.p 
          className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          Join thousands of entrepreneurs, developers, and investors who are already building the future of venture creation.
        </motion.p>

        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <motion.button
            className="bg-gradient-to-r from-blue-500 to-purple-500 px-8 py-4 rounded-full text-lg font-semibold flex items-center space-x-2 hover:scale-105 transition-transform"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>Start Building Now</span>
            <ArrowRight className="w-5 h-5" />
          </motion.button>
          
          <motion.button
            className="border-2 border-white/20 px-8 py-4 rounded-full text-lg font-semibold hover:border-white/40 hover:bg-white/5 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Schedule Demo
          </motion.button>
        </motion.div>

        <motion.div 
          className="mt-12 text-sm text-gray-400"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <p>Trusted by 10,000+ professionals worldwide • HIPAA Compliant • SOC 2 Certified</p>
        </motion.div>
      </div>
    </motion.section>
  )
}
