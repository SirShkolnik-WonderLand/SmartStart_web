'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  CheckCircle, 
  Crown, 
  Zap, 
  Shield, 
  Users, 
  Building,
  Code,
  FileText,
  ArrowRight,
  Star,
  Sparkles,
  Lock,
  Globe,
  DollarSign
} from 'lucide-react'

interface BillingPlan {
  id: string
  name: string
  description: string
  price: number
  currency: string
  interval: string
  features: string[]
  isActive: boolean
}

export default function SubscriptionPage() {
  const [plans, setPlans] = useState<BillingPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState('')
  const [isSubscribing, setIsSubscribing] = useState(false)

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const response = await fetch('https://smartstart-python-brain.onrender.com/api/v1/subscriptions/plans')
      const data = await response.json()
      
      if (data.success) {
        setPlans(data.data)
      }
    } catch (error) {
      console.error('Error fetching plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async (planId: string) => {
    if (!userEmail) {
      alert('Please enter your email address')
      return
    }

    setIsSubscribing(true)
    try {
      // First, try to get or create user
      const userResponse = await fetch('https://smartstart-python-brain.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          password: 'temp_password_123' // This will fail, but we'll handle it
        })
      })

      let userId = null
      if (userResponse.ok) {
        const userData = await userResponse.json()
        userId = userData.data.user.id
      } else {
        // User doesn't exist, redirect to registration
        window.location.href = `https://smartstart-frontend.onrender.com/auth/register?email=${encodeURIComponent(userEmail)}&plan=${planId}`
        return
      }

      // Create subscription
      const subResponse = await fetch('https://smartstart-python-brain.onrender.com/api/v1/subscriptions/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          planId: planId
        })
      })

      if (subResponse.ok) {
        alert('Subscription created successfully! Redirecting to the platform...')
        window.location.href = 'https://smartstart-frontend.onrender.com/dashboard'
      } else {
        const errorData = await subResponse.json()
        alert(`Error: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Subscription error:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setIsSubscribing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
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
            <Crown className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            SmartStart
          </span>
        </div>
        
        <a 
          href="/"
          className="text-gray-300 hover:text-white transition-colors"
        >
          ← Back to Home
        </a>
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
            <DollarSign className="w-10 h-10 text-white" />
          </div>
        </motion.div>

        <motion.h1 
          className="text-5xl md:text-7xl font-bold mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-orange-400 bg-clip-text text-transparent">
            Choose Your
          </span>
          <br />
          <span className="bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">
            SmartStart Plan
          </span>
        </motion.h1>

        <motion.p 
          className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          Unlock the full potential of venture creation with our comprehensive platform. 
          <span className="text-blue-400 font-semibold"> Legal protection, token rewards, and global collaboration</span> - all in one place.
        </motion.p>

        {/* Email Input */}
        <motion.div 
          className="max-w-md mx-auto mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <input
            type="email"
            placeholder="Enter your email address"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </motion.div>
      </motion.section>

      {/* Pricing Plans */}
      <motion.section 
        className="relative z-10 py-20 px-6"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                className={`relative bg-white/5 backdrop-blur-sm border rounded-2xl p-8 ${
                  plan.name.includes('All Features') || plan.name.includes('PRO')
                    ? 'border-blue-500/50 bg-blue-500/10 scale-105' 
                    : 'border-white/10'
                }`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02, y: -10 }}
              >
                {(plan.name.includes('All Features') || plan.name.includes('PRO')) && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2 rounded-full text-sm font-semibold flex items-center space-x-2">
                      <Star className="w-4 h-4" />
                      <span>Most Popular</span>
                    </div>
                  </div>
                )}

                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    {plan.name.includes('All Features') || plan.name.includes('PRO') ? (
                      <Crown className="w-8 h-8 text-white" />
                    ) : (
                      <Zap className="w-8 h-8 text-white" />
                    )}
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="text-4xl font-bold mb-2">
                    <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      ${plan.price}
                    </span>
                    <span className="text-gray-400 text-lg">/{plan.interval.toLowerCase()}</span>
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
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isSubscribing}
                  className={`w-full py-4 px-6 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 ${
                    plan.name.includes('All Features') || plan.name.includes('PRO')
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
                      : 'border-2 border-white/20 hover:border-white/40 hover:bg-white/5'
                  } ${isSubscribing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  whileHover={{ scale: isSubscribing ? 1 : 1.02 }}
                  whileTap={{ scale: isSubscribing ? 1 : 0.98 }}
                >
                  {isSubscribing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>Subscribe Now</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
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
                What You Get
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Complete access to all SmartStart platform features and integrations.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Legal Protection",
                description: "Complete legal framework with NDAs, contracts, and compliance tools",
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: Users,
                title: "Team Collaboration",
                description: "Unlimited team members with advanced collaboration tools",
                color: "from-purple-500 to-pink-500"
              },
              {
                icon: Building,
                title: "Venture Management",
                description: "Unlimited ventures with complete project management",
                color: "from-orange-500 to-red-500"
              },
              {
                icon: Code,
                title: "Developer Tools",
                description: "Full API access with comprehensive documentation",
                color: "from-green-500 to-emerald-500"
              },
              {
                icon: FileText,
                title: "Document Management",
                description: "All legal documents with digital signatures",
                color: "from-indigo-500 to-blue-500"
              },
              {
                icon: Globe,
                title: "Global Network",
                description: "Connect with professionals worldwide",
                color: "from-pink-500 to-rose-500"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, y: -10 }}
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        className="relative z-10 py-20 px-6"
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
              Ready to Start?
            </span>
          </motion.h2>

          <motion.p 
            className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Join thousands of entrepreneurs who are already building the future of venture creation.
          </motion.p>

          <motion.div 
            className="text-sm text-gray-400"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <p>30-day money-back guarantee • Cancel anytime • HIPAA Compliant</p>
          </motion.div>
        </div>
      </motion.section>
    </div>
  )
}
