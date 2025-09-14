'use client'

import { useState, useEffect, useCallback } from 'react'
import { comprehensiveApiService as apiService, JourneyStatus, SubscriptionPlan } from '@/lib/api-comprehensive'
import { legalDocumentsApiService } from '@/lib/legal-documents-api'
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
  X,
  Coins,
  Wallet,
  TrendingUp
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
  initialStep?: number | null
}

export default function OnboardingFlow({ userId, onComplete, initialStep }: OnboardingFlowProps) {
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

  const [passwordData, setPasswordData] = useState({
    password: '',
    confirmPassword: ''
  })

  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: ''
  })

  const [legalAgreements, setLegalAgreements] = useState<{
    confidentiality: boolean | { signed: boolean; signedAt: string; signatureHash: string; documentVersion: string }
    equity: boolean | { signed: boolean; signedAt: string; signatureHash: string; documentVersion: string }
    partnership: boolean | { signed: boolean; signedAt: string; signatureHash: string; documentVersion: string }
  }>({
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
      
      // Check authentication token
      const token = localStorage.getItem('auth-token')
      if (!token) {
        console.error('❌ No authentication token found!')
        setError('Authentication required. Please log in again.')
        return
      }
      console.log('✅ Authentication token found')
      
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

      // Load legal documents
      try {
        const legalDocsResponse = await legalDocumentsApiService.getAvailableDocuments()
        if (legalDocsResponse.success && legalDocsResponse.data.length > 0) {
          // Set legal agreements as available (not signed yet)
          setLegalAgreements({
            confidentiality: false,
            equity: false,
            partnership: false
          })
        }
      } catch (legalError) {
        console.warn('Failed to load legal documents:', legalError)
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
          
          // Determine the correct starting step based on journey progress or initialStep prop
          const completedStages = journeyResponse.data.stages.filter(stage => stage.completed === true)
          const completedStageNames = completedStages.map(stage => stage.name)
          
          // Use initialStep from URL if provided, otherwise determine from journey progress
          let startingStep = 0
          if (initialStep !== null && initialStep !== undefined) {
            startingStep = initialStep
            console.log(`Starting onboarding at step ${startingStep} from URL parameter`)
          } else {
            // Map journey stages to onboarding steps
            if (completedStageNames.includes('Account Creation') && 
                completedStageNames.includes('Profile Setup') && 
                completedStageNames.includes('Platform Legal Pack') && 
                completedStageNames.includes('Subscription Selection') && 
                completedStageNames.includes('Platform Orientation')) {
              startingStep = 3 // All steps completed, should be on final step
            } else if (completedStageNames.includes('Account Creation') && 
                       completedStageNames.includes('Profile Setup') && 
                       completedStageNames.includes('Platform Legal Pack') && 
                       completedStageNames.includes('Subscription Selection')) {
              startingStep = 3 // Start at Platform Orientation step
            } else if (completedStageNames.includes('Account Creation') && 
                       completedStageNames.includes('Profile Setup') && 
                       completedStageNames.includes('Platform Legal Pack')) {
              startingStep = 2 // Start at Subscription step
            } else if (completedStageNames.includes('Account Creation') && 
                       completedStageNames.includes('Profile Setup')) {
              startingStep = 1 // Start at Legal step
            } else if (completedStageNames.includes('Account Creation')) {
              startingStep = 0 // Start at Profile step
            }
            console.log(`Starting onboarding at step ${startingStep} based on completed stages:`, completedStageNames)
          }
          
          setCurrentStep(startingStep)
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
          completedStages: [],
          journeyScore: 0,
          milestonesAchieved: 0,
          totalMilestones: 4,
          estimatedCompletion: null,
          timestamp: new Date().toISOString()
        })
        
        // Use initialStep if provided, even if journey status failed
        if (initialStep !== null && initialStep !== undefined) {
          setCurrentStep(initialStep)
          console.log(`Starting onboarding at step ${initialStep} from URL parameter (journey status failed)`)
        }
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
  }, [userId, initialStep])

  useEffect(() => {
    loadInitialData()
  }, [loadInitialData])

  const updateJourneyProgress = useCallback(async (action: string, data: Record<string, unknown> = {}) => {
    try {
      console.log(`🔄 updateJourneyProgress called - action: ${action}, userId: ${userId}`, data)
      const response = await apiService.updateJourneyProgress(userId, action, data)
      console.log(`📝 updateJourneyProgress response:`, response)
      
      if (response.success) {
        // Reload journey status
        try {
          const journeyResponse = await apiService.getJourneyStatus(userId)
          if (journeyResponse.success && journeyResponse.data) {
            setJourneyStatus(journeyResponse.data)
            console.log('📝 Journey status reloaded successfully')
          }
        } catch (journeyError) {
          console.warn('⚠️ Failed to reload journey status after update:', journeyError)
        }
        return response
      } else {
        console.error('❌ updateJourneyProgress failed:', response.error)
        return response
      }
    } catch (err) {
      console.error('❌ Error updating journey progress:', err)
      // Don't fail the onboarding flow if journey updates fail
      return { success: false, error: err.message }
    }
  }, [userId])

  // Get current step data for auto-save
  const getCurrentStepData = useCallback(() => {
    switch (currentStep) {
      case 0: // Profile
        return { profileData }
      case 1: // Legal
        return { legalAgreements }
      case 2: // Subscription
        return { selectedPlan, trial: true }
      case 3: // Payment
        return { paymentData }
      default:
        return {}
    }
  }, [currentStep, profileData, legalAgreements, selectedPlan, paymentData])

  // Auto-save form data every 30 seconds
  const autoSaveData = useCallback(async () => {
    try {
      const currentStepData = getCurrentStepData()
      console.log('Auto-saving data for step', currentStep, ':', currentStepData)
      
      // Always save to localStorage as backup (even if API fails)
      localStorage.setItem(`onboarding_backup_${userId}`, JSON.stringify({
        currentStep,
        profileData,
        legalAgreements,
        selectedPlan,
        paymentData,
        lastSaved: new Date().toISOString()
      }))
      
      // Try to save to API if we have meaningful data
      if (currentStepData && Object.keys(currentStepData).length > 0) {
        await updateJourneyProgress('AUTO_SAVE', {
          step: currentStep,
          data: currentStepData,
          timestamp: new Date().toISOString()
        })
        console.log('Auto-save successful for step', currentStep)
      }
    } catch (error) {
      console.warn('Auto-save failed (but localStorage backup saved):', error)
    }
  }, [currentStep, profileData, legalAgreements, selectedPlan, paymentData, userId, getCurrentStepData, updateJourneyProgress])


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
    try {
      console.log(`🔄 handleNext called - currentStep: ${currentStep}, steps.length: ${steps.length}`)
      
      // Save current step data first
      await autoSaveData()
      
      if (currentStep < steps.length - 1) {
        // Update journey progress for current step
        const stepActions = [
          'PASSWORD_SET',
          'PROFILE_COMPLETED',
          'LEGAL_PACK_SIGNED',
          'SUBSCRIPTION_ACTIVATED',
          'ORIENTATION_COMPLETED',
          'BUZ_TOKENS_INTRODUCED'
        ]
        
        if (stepActions[currentStep]) {
          console.log(`📝 Updating journey progress for step ${currentStep}: ${stepActions[currentStep]}`)
          
          // Handle password setup step
          if (currentStep === 0 && stepActions[currentStep] === 'PASSWORD_SET') {
            console.log('🔐 Setting user password...')
            const passwordResult = await apiService.setUserPassword(passwordData.password)
            if (!passwordResult.success) {
              console.error('❌ Failed to set password:', passwordResult.error)
              setError('Failed to set password. Please try again.')
              return
            }
            console.log('✅ Password set successfully')
          }
          
          const progressResult = await updateJourneyProgress(stepActions[currentStep], {
            step: currentStep,
            completedAt: new Date().toISOString(),
            data: getCurrentStepData()
          })
          console.log('📝 Journey progress update result:', progressResult)
        }
        
        await handleStepChange(currentStep + 1)
      } else {
        // Complete onboarding
        console.log('🎉 Completing onboarding flow - this is the final step!')
        
        // Mark orientation completed explicitly before finalizing
        console.log('📝 Marking ORIENTATION_COMPLETED...')
        const orientationResult = await updateJourneyProgress('ORIENTATION_COMPLETED', {
          completedAt: new Date().toISOString()
        })
        console.log('📝 ORIENTATION_COMPLETED result:', orientationResult)
        
        console.log('📝 Marking ONBOARDING_COMPLETE...')
        const completeResult = await updateJourneyProgress('ONBOARDING_COMPLETE', {
          completedAt: new Date().toISOString(),
          allData: {
            profileData,
            legalAgreements,
            selectedPlan,
            paymentData
          }
        })
        console.log('📝 ONBOARDING_COMPLETE result:', completeResult)
        
        // Clear backup data on completion
        localStorage.removeItem(`onboarding_backup_${userId}`)
        console.log('🎉 Calling onComplete() to redirect to dashboard...')
        onComplete()
      }
    } catch (error) {
      console.error('❌ Error in handleNext:', error)
      // Still proceed to next step even if journey update fails
      if (currentStep < steps.length - 1) {
        console.log('⚠️ Continuing to next step despite error...')
        await handleStepChange(currentStep + 1)
      } else {
        console.log('⚠️ Completing onboarding despite error...')
        onComplete()
      }
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
          documentVersion: '2.0'
        }
      }))
      
      // Call legal-signing API: fetch docs, start session, and sign
      const docs = await legalDocumentsApiService.getAvailableDocuments()
      const matching = docs.success ? docs.data.find(d => d.title?.toLowerCase().includes(type) || d.name?.toLowerCase().includes(type)) : undefined
      if (matching) {
        const session = await legalDocumentsApiService.startSigningSession([matching.id])
        if (session.success && session.data?.sessionId) {
          await legalDocumentsApiService.signInSession(session.data.sessionId, matching.id, {
            signatureHash: signatureHashHex,
            signedAt: new Date().toISOString(),
            documentVersion: 'v1.0',
            content: legalAgreementContent[type].content
          })
        }
      }

      // Also notify journey orchestrator
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
      id: 'password',
      title: 'Set Your Password',
      description: 'Create a secure password for your account',
      icon: <Shield className="w-6 h-6" />,
      isCompleted: false, // Will be completed when password is set
      isRequired: true,
      component: (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Secure Your Account</h3>
            <p className="text-muted-foreground">Create a strong password to protect your SmartStart account</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={passwordData.password}
                onChange={(e) => setPasswordData({...passwordData, password: e.target.value})}
                className="w-full px-3 py-2 border border-glass-border rounded-md bg-glass-surface text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter a strong password"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Confirm Password</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                className="w-full px-3 py-2 border border-glass-border rounded-md bg-glass-surface text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Confirm your password"
              />
            </div>
          </div>

          <div className="bg-blue-900/10 text-blue-300 border border-blue-700/40 rounded-md p-3 text-sm">
            <strong>Password Requirements:</strong>
            <ul className="mt-2 space-y-1">
              <li>• At least 8 characters long</li>
              <li>• Contains uppercase and lowercase letters</li>
              <li>• Contains at least one number</li>
              <li>• Contains at least one special character</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'profile',
      title: 'Complete Your Profile',
      description: 'Tell us about yourself and your expertise',
      icon: <User className="w-6 h-6" />,
      isCompleted: journeyStatus?.progress?.stages?.some(stage => stage.name === 'Profile Setup' && stage.status === 'COMPLETED') ?? false,
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
      isCompleted: journeyStatus?.progress?.stages?.some(stage => stage.name === 'Platform Legal Pack' && stage.status === 'COMPLETED') ?? false,
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
                  checked={typeof legalAgreements.confidentiality === 'object' ? legalAgreements.confidentiality.signed : legalAgreements.confidentiality === true}
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
                  checked={typeof legalAgreements.equity === 'object' ? legalAgreements.equity.signed : legalAgreements.equity === true}
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
                  checked={typeof legalAgreements.partnership === 'object' ? legalAgreements.partnership.signed : legalAgreements.partnership === true}
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
      isCompleted: journeyStatus?.progress?.stages?.some(stage => stage.name === 'Subscription Selection' && stage.status === 'COMPLETED') ?? false,
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
                  ? 'border-primary bg-primary/10 shadow-[0_0_0_3px_rgba(139,92,246,0.25)]'
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
              <div className="mt-4 bg-green-900/10 text-green-300 border border-green-700/40 rounded-md p-3 text-sm">
                30-day free trial active. No charge today; payment will be requested after the trial.
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
      isCompleted: journeyStatus?.progress?.stages?.some(stage => stage.name === 'Platform Orientation' && stage.status === 'COMPLETED') ?? false,
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
    },
    {
      id: 'buz-tokens',
      title: 'BUZ Token Setup',
      description: 'Learn about BUZ tokens and set up your wallet',
      icon: <Coins className="w-6 h-6" />,
      isCompleted: false, // We'll check this based on user's BUZ balance
      isRequired: false,
      component: (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <Coins className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Welcome to BUZ Tokens!</h3>
            <p className="text-muted-foreground">BUZ tokens are the utility currency of SmartStart platform</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-blue-600" />
                Personal Wallet
              </h4>
              <p className="text-sm text-muted-foreground">
                Store, send, and receive BUZ tokens securely
              </p>
            </div>
            
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Earn Rewards
              </h4>
              <p className="text-sm text-muted-foreground">
                Earn BUZ tokens by contributing to ventures and completing tasks
              </p>
            </div>
            
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-600" />
                Staking Program
              </h4>
              <p className="text-sm text-muted-foreground">
                Stake your BUZ tokens to earn additional rewards and APY
              </p>
            </div>
            
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-600" />
                Platform Services
              </h4>
              <p className="text-sm text-muted-foreground">
                Use BUZ tokens to access premium features and services
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold mb-2 text-yellow-800">🎉 You'll receive 100 BUZ tokens as a welcome bonus!</h4>
            <p className="text-sm text-yellow-700">
              These tokens will be automatically added to your wallet after completing setup.
            </p>
          </div>

          <div className="bg-primary/10 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Ready to explore BUZ tokens?</h4>
            <p className="text-sm text-muted-foreground">
              You can access your wallet and BUZ token dashboard anytime from the main navigation.
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
      case 0: // Password
        return passwordData.password && 
               passwordData.confirmPassword && 
               passwordData.password === passwordData.confirmPassword &&
               passwordData.password.length >= 8 &&
               /[A-Z]/.test(passwordData.password) &&
               /[a-z]/.test(passwordData.password) &&
               /\d/.test(passwordData.password) &&
               /[!@#$%^&*(),.?":{}|<>]/.test(passwordData.password)
      case 1: // Profile
        return profileData.firstName && profileData.lastName && profileData.bio
      case 2: // Legal
        return legalAgreements.confidentiality && legalAgreements.equity && legalAgreements.partnership
      case 3: // Subscription
        return selectedPlan && paymentData.cardNumber && paymentData.expiryDate && paymentData.cvv && paymentData.name
      case 4: // Orientation
        return true // Optional step
      case 5: // BUZ Tokens
        return true // Optional step - just informational
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
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="wonder-button-secondary flex items-center space-x-2 px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="flex items-center space-x-3">
              <button
                onClick={autoSaveData}
                className="text-sm text-foreground-muted hover:text-foreground transition-colors px-3 py-1 border border-glass-border rounded-md hover:bg-glass-surface"
              >
                Save Progress
              </button>
              
              <button
                onClick={handleNext}
                disabled={!isStepValid()}
                className="wonder-button flex items-center space-x-2 px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{currentStep === steps.length - 1 ? 'Complete Initial Setup' : 'Next'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              
              {/* Emergency completion button for debugging */}
              {currentStep === steps.length - 1 && (
                <button
                  onClick={() => {
                    console.log('🚨 Emergency completion button clicked!')
                    onComplete()
                  }}
                  className="wonder-button-secondary flex items-center space-x-2 px-4 py-2 ml-2 text-sm"
                >
                  <span>Force Complete</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Legal Agreement Popup Modal */}
      {showLegalPopup.isOpen && showLegalPopup.type && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4">
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
