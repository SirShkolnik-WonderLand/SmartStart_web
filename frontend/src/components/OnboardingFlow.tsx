'use client'

import { useState, useEffect } from 'react'
import { comprehensiveApiService as apiService, JourneyStatus, SubscriptionPlan } from '@/lib/api-comprehensive'
import { 
  CheckCircle, 
  User, 
  FileText, 
  CreditCard, 
  GraduationCap, 
  ArrowRight, 
  ArrowLeft,
  Loader2,
  AlertCircle,
  Star,
  Shield,
  Zap
} from 'lucide-react'

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  component: React.ReactNode
  isCompleted: boolean
  isRequired: boolean
}

interface OnboardingFlowProps {
  userId: string
  onComplete: () => void
}

export default function OnboardingFlow({ userId, onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [journeyStatus, setJourneyStatus] = useState<JourneyStatus | null>(null)
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Form states
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    skills: [] as string[],
    experience: '',
    location: '',
    website: ''
  })

  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: ''
  })

  const [legalAgreements, setLegalAgreements] = useState({
    confidentiality: false,
    equity: false,
    partnership: false
  })

  useEffect(() => {
    loadInitialData()
  }, [userId])

  const loadInitialData = async () => {
    try {
      setIsLoading(true)
      
      // Load journey status
      const journeyResponse = await apiService.getJourneyStatus(userId)
      if (journeyResponse.success && journeyResponse.data) {
        setJourneyStatus(journeyResponse.data)
      }

      // Load subscription plans
      const plansResponse = await apiService.getSubscriptionPlans()
      if (plansResponse.success && plansResponse.data) {
        setSubscriptionPlans(plansResponse.data)
        // Auto-select the first plan (All Features Pack)
        if (plansResponse.data.length > 0) {
          setSelectedPlan(plansResponse.data[0].id)
        }
      }
    } catch (err) {
      setError('Failed to load onboarding data')
      console.error('Error loading onboarding data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const updateJourneyProgress = async (action: string, data: any = {}) => {
    try {
      const response = await apiService.updateJourneyProgress(userId, action, data)
      if (response.success) {
        // Reload journey status
        const journeyResponse = await apiService.getJourneyStatus(userId)
        if (journeyResponse.success && journeyResponse.data) {
          setJourneyStatus(journeyResponse.data)
        }
      }
    } catch (err) {
      console.error('Error updating journey progress:', err)
    }
  }

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      // Update journey progress for current step
      const stepActions = [
        'ACCOUNT_CREATED',
        'PROFILE_COMPLETED', 
        'LEGAL_PACK_SIGNED',
        'SUBSCRIPTION_ACTIVATED',
        'ORIENTATION_COMPLETED'
      ]
      
      if (stepActions[currentStep]) {
        await updateJourneyProgress(stepActions[currentStep], {
          step: currentStep,
          completedAt: new Date().toISOString()
        })
      }
      
      setCurrentStep(currentStep + 1)
    } else {
      // Complete onboarding
      await updateJourneyProgress('ONBOARDING_COMPLETE', {
        completedAt: new Date().toISOString()
      })
      onComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const steps: OnboardingStep[] = [
    {
      id: 'profile',
      title: 'Complete Your Profile',
      description: 'Tell us about yourself and your expertise',
      icon: <User className="w-6 h-6" />,
      isCompleted: journeyStatus?.progress.completedStages >= 2,
      isRequired: true,
      component: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">First Name</label>
              <input
                type="text"
                value={profileData.firstName}
                onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Last Name</label>
              <input
                type="text"
                value={profileData.lastName}
                onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                placeholder="Doe"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Bio</label>
            <textarea
              value={profileData.bio}
              onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
              className="w-full px-3 py-2 border border-input rounded-md bg-background h-24"
              placeholder="Tell us about yourself, your background, and what you're passionate about..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Skills (comma-separated)</label>
            <input
              type="text"
              value={profileData.skills.join(', ')}
              onChange={(e) => setProfileData({...profileData, skills: e.target.value.split(',').map(s => s.trim()).filter(s => s)})}
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
              placeholder="React, Node.js, Product Management, Marketing..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Experience</label>
            <textarea
              value={profileData.experience}
              onChange={(e) => setProfileData({...profileData, experience: e.target.value})}
              className="w-full px-3 py-2 border border-input rounded-md bg-background h-20"
              placeholder="Describe your professional experience and achievements..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <input
                type="text"
                value={profileData.location}
                onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                placeholder="San Francisco, CA"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Website (optional)</label>
              <input
                type="url"
                value={profileData.website}
                onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                placeholder="https://yourwebsite.com"
              />
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'legal',
      title: 'Legal Agreements',
      description: 'Review and sign required legal documents',
      icon: <FileText className="w-6 h-6" />,
      isCompleted: journeyStatus?.progress.completedStages >= 3,
      isRequired: true,
      component: (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Legal Protection & Compliance</h3>
            <p className="text-muted-foreground">These agreements protect you and ensure safe collaboration</p>
          </div>

          <div className="space-y-4">
            <div className="border border-border rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="confidentiality"
                  checked={legalAgreements.confidentiality}
                  onChange={(e) => setLegalAgreements({...legalAgreements, confidentiality: e.target.checked})}
                  className="mt-1"
                />
                <div className="flex-1">
                  <label htmlFor="confidentiality" className="font-medium cursor-pointer">
                    Confidentiality Agreement
                  </label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Protects sensitive information shared during collaboration
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-border rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="equity"
                  checked={legalAgreements.equity}
                  onChange={(e) => setLegalAgreements({...legalAgreements, equity: e.target.checked})}
                  className="mt-1"
                />
                <div className="flex-1">
                  <label htmlFor="equity" className="font-medium cursor-pointer">
                    Equity Agreement
                  </label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Defines ownership and equity distribution in ventures
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-border rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="partnership"
                  checked={legalAgreements.partnership}
                  onChange={(e) => setLegalAgreements({...legalAgreements, partnership: e.target.checked})}
                  className="mt-1"
                />
                <div className="flex-1">
                  <label htmlFor="partnership" className="font-medium cursor-pointer">
                    Partnership Agreement
                  </label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Establishes terms for collaborative partnerships
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium">Important</p>
                <p className="text-sm text-muted-foreground">
                  These agreements are legally binding. Please review them carefully before signing.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'subscription',
      title: 'Choose Your Plan',
      description: 'Select a subscription plan to unlock all features',
      icon: <CreditCard className="w-6 h-6" />,
      isCompleted: journeyStatus?.progress.completedStages >= 4,
      isRequired: true,
      component: (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <Star className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Unlock Your Potential</h3>
            <p className="text-muted-foreground">Choose the plan that fits your needs</p>
          </div>

          {subscriptionPlans.map((plan) => (
            <div
              key={plan.id}
              className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                selectedPlan === plan.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-xl font-semibold">{plan.name}</h4>
                  <p className="text-muted-foreground">{plan.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">${plan.price}</div>
                  <div className="text-sm text-muted-foreground">/{plan.interval.toLowerCase()}</div>
                </div>
              </div>
              
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {selectedPlan && (
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-medium mb-3">Payment Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Card Number</label>
                  <input
                    type="text"
                    value={paymentData.cardNumber}
                    onChange={(e) => setPaymentData({...paymentData, cardNumber: e.target.value})}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    placeholder="1234 5678 9012 3456"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Expiry Date</label>
                  <input
                    type="text"
                    value={paymentData.expiryDate}
                    onChange={(e) => setPaymentData({...paymentData, expiryDate: e.target.value})}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    placeholder="MM/YY"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">CVV</label>
                  <input
                    type="text"
                    value={paymentData.cvv}
                    onChange={(e) => setPaymentData({...paymentData, cvv: e.target.value})}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    placeholder="123"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Name on Card</label>
                  <input
                    type="text"
                    value={paymentData.name}
                    onChange={(e) => setPaymentData({...paymentData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'orientation',
      title: 'Platform Orientation',
      description: 'Learn about SmartStart features and capabilities',
      icon: <GraduationCap className="w-6 h-6" />,
      isCompleted: journeyStatus?.progress.completedStages >= 5,
      isRequired: false,
      component: (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <Zap className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Welcome to SmartStart!</h3>
            <p className="text-muted-foreground">Let's explore what you can do on the platform</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-semibold mb-2">🚀 Create Ventures</h4>
              <p className="text-sm text-muted-foreground">
                Start new ventures, invite team members, and manage your projects
              </p>
            </div>
            
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-semibold mb-2">👥 Find Collaborators</h4>
              <p className="text-sm text-muted-foreground">
                Connect with entrepreneurs, developers, and business experts
              </p>
            </div>
            
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-semibold mb-2">📊 Track Progress</h4>
              <p className="text-sm text-muted-foreground">
                Monitor your ventures with analytics and milestone tracking
              </p>
            </div>
            
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-semibold mb-2">🎮 Gamification</h4>
              <p className="text-sm text-muted-foreground">
                Earn XP, unlock achievements, and climb the leaderboard
              </p>
            </div>
          </div>

          <div className="bg-primary/10 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Ready to get started?</h4>
            <p className="text-sm text-muted-foreground">
              You're all set! Click "Complete Setup" to access your dashboard and start building amazing ventures.
            </p>
          </div>
        </div>
      )
    }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your onboarding journey...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-4" />
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    )
  }

  const currentStepData = steps[currentStep]
  const isStepValid = () => {
    switch (currentStep) {
      case 0: // Profile
        return profileData.firstName && profileData.lastName && profileData.bio
      case 1: // Legal
        return legalAgreements.confidentiality && legalAgreements.equity && legalAgreements.partnership
      case 2: // Subscription
        return selectedPlan && paymentData.cardNumber && paymentData.expiryDate && paymentData.cvv && paymentData.name
      case 3: // Orientation
        return true // Optional step
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Welcome to SmartStart</h1>
            <span className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          
          <div className="flex space-x-2">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex-1 h-2 rounded-full ${
                  index <= currentStep
                    ? 'bg-primary'
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="glass-card p-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-primary/10 rounded-lg">
              {currentStepData.icon}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{currentStepData.title}</h2>
              <p className="text-muted-foreground">{currentStepData.description}</p>
            </div>
          </div>

          {currentStepData.component}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center space-x-2 px-4 py-2 border border-input rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="flex items-center space-x-2 px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{currentStep === steps.length - 1 ? 'Complete Setup' : 'Next'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
