'use client'

import { useState, useEffect, useCallback } from 'react'
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
  Zap,
  X
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

  // Form states - Initialize with user data from registration
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

  const [showLegalPopup, setShowLegalPopup] = useState<{
    isOpen: boolean
    type: 'confidentiality' | 'equity' | 'partnership' | null
  }>({
    isOpen: false,
    type: null
  })

  const loadInitialData = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // Load user data from localStorage to pre-fill profile
      try {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          const userData = JSON.parse(storedUser)
          setProfileData(prev => ({
            ...prev,
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            // Keep other fields empty for user to fill
          }))
        }
      } catch (userError) {
        console.warn('Failed to load user data from localStorage:', userError)
      }

      // Try to recover onboarding data from backup
      try {
        const backupData = localStorage.getItem(`onboarding_backup_${userId}`)
        if (backupData) {
          const parsedBackup = JSON.parse(backupData)
          console.log('Recovering onboarding data from backup:', parsedBackup)
          
          if (parsedBackup.profileData) {
            setProfileData(prev => ({ ...prev, ...parsedBackup.profileData }))
          }
          if (parsedBackup.legalAgreements) {
            setLegalAgreements(parsedBackup.legalAgreements)
          }
          if (parsedBackup.selectedPlan) {
            setSelectedPlan(parsedBackup.selectedPlan)
          }
          if (parsedBackup.paymentData) {
            setPaymentData(parsedBackup.paymentData)
          }
          if (parsedBackup.currentStep !== undefined) {
            setCurrentStep(parsedBackup.currentStep)
          }
        }
      } catch (backupError) {
        console.warn('Failed to recover backup data:', backupError)
      }
      
      // Try to load journey status (but don't fail if it doesn't work)
      try {
        const journeyResponse = await apiService.getJourneyStatus(userId)
        if (journeyResponse.success && journeyResponse.data) {
          setJourneyStatus(journeyResponse.data)
        }
      } catch (journeyError) {
        console.warn('Failed to load journey status, continuing with onboarding:', journeyError)
        // Set default journey status
        setJourneyStatus({
          userId,
          currentStage: null,
          nextStage: null,
          isComplete: false,
          userStates: [],
          stages: [],
          recommendations: [],
          progress: { completedStages: 0, totalStages: 4, percentage: 0, stages: [] },
          timestamp: new Date().toISOString()
        })
      }

      // Load subscription plans
      try {
        const plansResponse = await apiService.getSubscriptionPlans()
        if (plansResponse.success && plansResponse.data) {
          setSubscriptionPlans(plansResponse.data)
          // Auto-select the first plan (All Features Pack)
          if (plansResponse.data.length > 0) {
            setSelectedPlan(plansResponse.data[0].id)
          }
        }
      } catch (plansError) {
        console.warn('Failed to load subscription plans:', plansError)
        // Set default plans
        setSubscriptionPlans([
          {
            id: 'all-features',
            name: 'All Features Pack',
            description: 'Complete access to all SmartStart features',
            price: 29,
            currency: 'USD',
            interval: 'MONTHLY',
            features: [
              'Unlimited ventures',
              'Team collaboration',
              'Advanced analytics',
              'Priority support'
            ],
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ])
        setSelectedPlan('all-features')
      }
    } catch (err) {
      setError('Failed to load onboarding data')
      console.error('Error loading onboarding data:', err)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    loadInitialData()
  }, [loadInitialData])

  const updateJourneyProgress = async (action: string, data: Record<string, unknown> = {}) => {
    try {
      const response = await apiService.updateJourneyProgress(userId, action, data)
      if (response.success) {
        // Reload journey status
        try {
          const journeyResponse = await apiService.getJourneyStatus(userId)
          if (journeyResponse.success && journeyResponse.data) {
            setJourneyStatus(journeyResponse.data)
          }
        } catch (journeyError) {
          console.warn('Failed to reload journey status after update:', journeyError)
        }
      }
    } catch (err) {
      console.warn('Error updating journey progress (continuing anyway):', err)
      // Don't fail the onboarding flow if journey updates fail
    }
  }

  // Auto-save form data every 30 seconds
  const autoSaveData = useCallback(async () => {
    try {
      const currentStepData = getCurrentStepData()
      if (currentStepData && Object.keys(currentStepData).length > 0) {
        await updateJourneyProgress('AUTO_SAVE', {
          step: currentStep,
          data: currentStepData,
          timestamp: new Date().toISOString()
        })
        
        // Also save to localStorage as backup
        localStorage.setItem(`onboarding_backup_${userId}`, JSON.stringify({
          currentStep,
          profileData,
          legalAgreements,
          selectedPlan,
          paymentData,
          lastSaved: new Date().toISOString()
        }))
      }
    } catch (error) {
      console.warn('Auto-save failed:', error)
    }
  }, [currentStep, profileData, legalAgreements, selectedPlan, paymentData, userId])

  // Get current step data for auto-save
  const getCurrentStepData = () => {
    switch (currentStep) {
      case 0: // Profile
        return { profileData }
      case 1: // Legal
        return { legalAgreements }
      case 2: // Subscription
        return { selectedPlan }
      case 3: // Payment
        return { paymentData }
      default:
        return {}
    }
  }

  // Set up auto-save interval
  useEffect(() => {
    const interval = setInterval(autoSaveData, 30000) // Auto-save every 30 seconds
    return () => clearInterval(interval)
  }, [autoSaveData])

  // Save data when user navigates between steps
  const handleStepChange = async (newStep: number) => {
    // Save current step data before changing
    await autoSaveData()
    setCurrentStep(newStep)
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
      
      await handleStepChange(currentStep + 1)
    } else {
      // Complete onboarding
      await updateJourneyProgress('ONBOARDING_COMPLETE', {
        completedAt: new Date().toISOString(),
        allData: {
          profileData,
          legalAgreements,
          selectedPlan,
          paymentData
        }
      })
      
      // Clear backup data on completion
      localStorage.removeItem(`onboarding_backup_${userId}`)
      onComplete()
    }
  }

  const handlePrevious = async () => {
    if (currentStep > 0) {
      await handleStepChange(currentStep - 1)
    }
  }

  const openLegalPopup = (type: 'confidentiality' | 'equity' | 'partnership') => {
    setShowLegalPopup({ isOpen: true, type })
  }

  const closeLegalPopup = () => {
    setShowLegalPopup({ isOpen: false, type: null })
  }

  const signLegalAgreement = async (type: 'confidentiality' | 'equity' | 'partnership') => {
    try {
      // Generate digital signature
      const signatureData = {
        userId,
        documentType: type,
        content: legalAgreementContent[type].content,
        timestamp: new Date().toISOString(),
        ipAddress: 'client-side', // Will be updated by backend
        userAgent: navigator.userAgent
      }
      
      // Create signature hash (simplified for frontend)
      const signatureString = JSON.stringify(signatureData)
      const signatureHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(signatureString))
      const signatureHashHex = Array.from(new Uint8Array(signatureHash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
      
      // Update legal agreements with signature data
      setLegalAgreements(prev => ({ 
        ...prev, 
        [type]: {
          signed: true,
          signedAt: new Date().toISOString(),
          signatureHash: signatureHashHex,
          documentVersion: 'v1.0'
        }
      }))
      
      // Save signature to backend
      await updateJourneyProgress('LEGAL_DOCUMENT_SIGNED', {
        documentType: type,
        signatureData: {
          signatureHash: signatureHashHex,
          signedAt: new Date().toISOString(),
          documentVersion: 'v1.0',
          content: legalAgreementContent[type].content
        }
      })
      
      closeLegalPopup()
    } catch (error) {
      console.error('Error signing legal agreement:', error)
      // Still mark as signed for UX, but log the error
      setLegalAgreements(prev => ({ ...prev, [type]: true }))
      closeLegalPopup()
    }
  }

  const legalAgreementContent = {
    confidentiality: {
      title: "Confidentiality Agreement",
      content: `
        CONFIDENTIALITY AND NON-DISCLOSURE AGREEMENT
        
        This Confidentiality Agreement ("Agreement") is entered into between SmartStart Platform ("Company") and the user ("Participant") for the purpose of protecting confidential and proprietary information shared during collaboration on the SmartStart platform.
        
        DEFINITIONS:
        "Confidential Information" means all non-public, proprietary, or confidential information disclosed by Company or other participants, including but not limited to business plans, technical data, customer lists, financial information, and any other information marked as confidential.
        
        OBLIGATIONS:
        1. Participant agrees to hold all Confidential Information in strict confidence
        2. Participant will not disclose Confidential Information to any third party without written consent
        3. Participant will use Confidential Information solely for the purpose of collaboration on the SmartStart platform
        4. Participant will take reasonable precautions to protect Confidential Information
        
        TERM: This Agreement shall remain in effect for a period of 5 years from the date of execution.
        
        By signing this agreement, you acknowledge that you have read, understood, and agree to be bound by these terms.
      `
    },
    equity: {
      title: "Equity Agreement",
      content: `
        EQUITY DISTRIBUTION AND OWNERSHIP AGREEMENT
        
        This Equity Agreement ("Agreement") governs the distribution and ownership of equity in ventures created through the SmartStart platform.
        
        EQUITY PRINCIPLES:
        1. Equity distribution shall be based on contribution, effort, and value added to the venture
        2. All equity allocations must be documented and agreed upon by all participants
        3. Equity vesting schedules may apply as determined by venture participants
        4. Intellectual property contributions shall be considered in equity calculations
        
        OWNERSHIP RIGHTS:
        - Participants retain ownership of their individual contributions
        - Joint intellectual property shall be owned according to contribution percentages
        - Exit strategies and buyout provisions shall be established upfront
        
        DISPUTE RESOLUTION:
        Any disputes regarding equity distribution shall be resolved through the SmartStart dispute resolution process.
        
        By signing this agreement, you agree to these equity distribution principles and commit to fair and transparent equity allocation.
      `
    },
    partnership: {
      title: "Partnership Agreement",
      content: `
        COLLABORATIVE PARTNERSHIP AGREEMENT
        
        This Partnership Agreement ("Agreement") establishes the terms for collaborative partnerships formed through the SmartStart platform.
        
        PARTNERSHIP STRUCTURE:
        1. Partnerships are formed voluntarily between participants
        2. Each partnership shall define roles, responsibilities, and decision-making processes
        3. Communication protocols and meeting schedules shall be established
        4. Conflict resolution procedures shall be agreed upon
        
        RESPONSIBILITIES:
        - All partners commit to active participation and contribution
        - Regular progress updates and transparent communication
        - Respect for diverse perspectives and collaborative decision-making
        - Adherence to platform guidelines and legal requirements
        
        TERMINATION:
        Partnerships may be dissolved by mutual agreement or through the platform's dispute resolution process.
        
        By signing this agreement, you commit to collaborative partnership principles and agree to work constructively with your partners.
      `
    }
  }

  const steps: OnboardingStep[] = [
    {
      id: 'profile',
      title: 'Complete Your Profile',
      description: 'Tell us about yourself and your expertise',
      icon: <User className="w-6 h-6" />,
      isCompleted: (journeyStatus?.progress?.completedStages ?? 0) >= 2,
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
                className="w-full px-3 py-2 border border-glass-border rounded-md bg-glass-surface text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Last Name</label>
              <input
                type="text"
                value={profileData.lastName}
                onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                className="w-full px-3 py-2 border border-glass-border rounded-md bg-glass-surface text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary"
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
                className="w-full px-3 py-2 border border-glass-border rounded-md bg-glass-surface text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="San Francisco, CA"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Website (optional)</label>
              <input
                type="url"
                value={profileData.website}
                onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                className="w-full px-3 py-2 border border-glass-border rounded-md bg-glass-surface text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary"
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
      isCompleted: (journeyStatus?.progress?.completedStages ?? 0) >= 3,
      isRequired: true,
      component: (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Legal Protection & Compliance</h3>
            <p className="text-muted-foreground">These agreements protect you and ensure safe collaboration</p>
          </div>

          <div className="space-y-4">
            <div className="border border-glass-border rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="confidentiality"
                  checked={legalAgreements.confidentiality?.signed || legalAgreements.confidentiality === true}
                  onChange={(e) => {
                    if (e.target.checked) {
                      signLegalAgreement('confidentiality')
                    } else {
                      setLegalAgreements({...legalAgreements, confidentiality: false})
                    }
                  }}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <label htmlFor="confidentiality" className="font-medium cursor-pointer">
                      Confidentiality Agreement
                    </label>
                    <button
                      onClick={() => openLegalPopup('confidentiality')}
                      className="text-primary hover:underline text-sm"
                    >
                      Read Full Agreement
                    </button>
                  </div>
                  <p className="text-sm text-foreground-muted mt-1">
                    Protects sensitive information shared during collaboration
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-glass-border rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="equity"
                  checked={legalAgreements.equity?.signed || legalAgreements.equity === true}
                  onChange={(e) => {
                    if (e.target.checked) {
                      signLegalAgreement('equity')
                    } else {
                      setLegalAgreements({...legalAgreements, equity: false})
                    }
                  }}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <label htmlFor="equity" className="font-medium cursor-pointer">
                      Equity Agreement
                    </label>
                    <button
                      onClick={() => openLegalPopup('equity')}
                      className="text-primary hover:underline text-sm"
                    >
                      Read Full Agreement
                    </button>
                  </div>
                  <p className="text-sm text-foreground-muted mt-1">
                    Defines ownership and equity distribution in ventures
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-glass-border rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="partnership"
                  checked={legalAgreements.partnership?.signed || legalAgreements.partnership === true}
                  onChange={(e) => {
                    if (e.target.checked) {
                      signLegalAgreement('partnership')
                    } else {
                      setLegalAgreements({...legalAgreements, partnership: false})
                    }
                  }}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <label htmlFor="partnership" className="font-medium cursor-pointer">
                      Partnership Agreement
                    </label>
                    <button
                      onClick={() => openLegalPopup('partnership')}
                      className="text-primary hover:underline text-sm"
                    >
                      Read Full Agreement
                    </button>
                  </div>
                  <p className="text-sm text-foreground-muted mt-1">
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
      isCompleted: (journeyStatus?.progress?.completedStages ?? 0) >= 4,
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
                    className="w-full px-3 py-2 border border-glass-border rounded-md bg-glass-surface text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="1234 5678 9012 3456"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Expiry Date</label>
                  <input
                    type="text"
                    value={paymentData.expiryDate}
                    onChange={(e) => setPaymentData({...paymentData, expiryDate: e.target.value})}
                    className="w-full px-3 py-2 border border-glass-border rounded-md bg-glass-surface text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="MM/YY"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">CVV</label>
                  <input
                    type="text"
                    value={paymentData.cvv}
                    onChange={(e) => setPaymentData({...paymentData, cvv: e.target.value})}
                    className="w-full px-3 py-2 border border-glass-border rounded-md bg-glass-surface text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="123"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Name on Card</label>
                  <input
                    type="text"
                    value={paymentData.name}
                    onChange={(e) => setPaymentData({...paymentData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-glass-border rounded-md bg-glass-surface text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary"
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
      isCompleted: (journeyStatus?.progress?.completedStages ?? 0) >= 5,
      isRequired: false,
      component: (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <Zap className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Welcome to SmartStart!</h3>
            <p className="text-muted-foreground">Let&apos;s explore what you can do on the platform</p>
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
              You&apos;re all set! Click &quot;Complete Setup&quot; to access your dashboard and start building amazing ventures.
            </p>
          </div>
        </div>
      )
    }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen wonderland-bg flex items-center justify-center">
        <div className="glass rounded-xl p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-foreground-muted">Loading your onboarding journey...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen wonderland-bg flex items-center justify-center">
        <div className="glass rounded-xl p-8 text-center">
          <AlertCircle className="w-8 h-8 text-error mx-auto mb-4" />
          <p className="text-error">{error}</p>
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
    <div className="min-h-screen wonderland-bg">
      <div className="max-w-4xl mx-auto p-6">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-foreground">Welcome to SmartStart</h1>
            <span className="text-sm text-foreground-muted">
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
                    : 'bg-glass-surface'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="glass-lg rounded-2xl p-8">
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
              className="wonder-button-secondary flex items-center space-x-2 px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="wonder-button flex items-center space-x-2 px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{currentStep === steps.length - 1 ? 'Complete Setup' : 'Next'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Legal Agreement Popup Modal */}
      {showLegalPopup.isOpen && showLegalPopup.type && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-lg rounded-2xl p-8 max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-foreground">
                {legalAgreementContent[showLegalPopup.type].title}
              </h3>
              <button
                onClick={closeLegalPopup}
                className="text-foreground-muted hover:text-foreground transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="prose prose-sm max-w-none mb-6">
              <pre className="whitespace-pre-wrap text-foreground-body font-mono text-sm leading-relaxed">
                {legalAgreementContent[showLegalPopup.type].content}
              </pre>
            </div>
            
            <div className="flex items-center justify-between">
              <button
                onClick={closeLegalPopup}
                className="wonder-button-secondary px-6 py-2"
              >
                Close
              </button>
              <button
                onClick={() => signLegalAgreement(showLegalPopup.type!)}
                className="wonder-button px-6 py-2"
              >
                I Agree & Sign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
