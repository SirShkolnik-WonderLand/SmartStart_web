'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { VentureCreationData, VentureCreationContextType, VentureCreationStep } from './types/venture-creation.types'
import { comprehensiveApiService as apiService, Venture } from '@/lib/api-comprehensive'

// Import step components
import BasicInformationStep from './steps/BasicInformationStep'
import VentureDetailsStep from './steps/VentureDetailsStep'
import TeamSkillsStep from './steps/TeamSkillsStep'
import RewardsCompensationStep from './steps/RewardsCompensationStep'
import TagsFinalDetailsStep from './steps/TagsFinalDetailsStep'

const VentureCreationContext = createContext<VentureCreationContextType | undefined>(undefined)

const initialData: VentureCreationData = {
  // Basic Information
  name: '',
  industry: '',
  description: '',
  
  // Venture Details
  stage: '',
  teamSize: 1,
  tier: '',
  residency: '',
  
  // Team & Skills
  lookingFor: [],
  requiredSkills: [],
  preferredSkills: [],
  
  // Rewards & Compensation
  rewardType: '',
  equityPercentage: 0,
  cashAmount: 0,
  additionalBenefits: [],
  
  // Tags & Final Details
  tags: [],
  website: '',
  socialMedia: {
    linkedin: '',
    twitter: '',
    github: ''
  },
  timeline: '',
  budget: 0,
  additionalNotes: ''
}

const steps: VentureCreationStep[] = [
  {
    id: 'basic-info',
    title: 'Basic Information',
    description: 'Tell us about your venture idea',
    component: BasicInformationStep,
    isComplete: false,
    isOptional: false
  },
  {
    id: 'venture-details',
    title: 'Venture Details',
    description: 'Current stage and team size',
    component: VentureDetailsStep,
    isComplete: false,
    isOptional: false
  },
  {
    id: 'team-skills',
    title: 'Team & Skills',
    description: 'Roles and skills you need',
    component: TeamSkillsStep,
    isComplete: false,
    isOptional: false
  },
  {
    id: 'rewards-compensation',
    title: 'Rewards & Compensation',
    description: 'How you\'ll reward team members',
    component: RewardsCompensationStep,
    isComplete: false,
    isOptional: false
  },
  {
    id: 'tags-final',
    title: 'Tags & Final Details',
    description: 'Add finishing touches',
    component: TagsFinalDetailsStep,
    isComplete: false,
    isOptional: false
  }
]

interface VentureCreationProviderProps {
  children: ReactNode
  onSuccess?: (venture: Venture) => void
  onClose?: () => void
}

export function VentureCreationProvider({ 
  children, 
  onSuccess, 
  onClose 
}: VentureCreationProviderProps) {
  const [data, setData] = useState<VentureCreationData>(initialData)
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateData = (updates: Partial<VentureCreationData>) => {
    setData(prev => ({ ...prev, ...updates }))
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const goToStep = (step: number) => {
    if (step >= 0 && step < steps.length) {
      setCurrentStep(step)
    }
  }

  const isStepComplete = (step: number) => {
    // Basic validation for each step
    switch (step) {
      case 0: // Basic Information
        return !!(data.name && data.industry && data.description)
      case 1: // Venture Details
        return !!(data.stage && data.teamSize > 0 && data.tier && data.residency)
      case 2: // Team & Skills
        return true // Optional step
      case 3: // Rewards & Compensation
        return !!(data.rewardType)
      case 4: // Tags & Final Details
        return true // Optional step
      default:
        return false
    }
  }

  const canProceed = isStepComplete(currentStep)

  const submitVenture = async () => {
    setIsSubmitting(true)
    try {
      // Transform data to match API format
      const ventureData = {
        name: data.name,
        industry: data.industry,
        description: data.description,
        stage: data.stage,
        teamSize: data.teamSize,
        tier: data.tier,
        residency: data.residency,
        lookingFor: data.lookingFor,
        requiredSkills: data.requiredSkills,
        preferredSkills: data.preferredSkills,
        rewardType: data.rewardType,
        equityPercentage: data.equityPercentage,
        cashAmount: data.cashAmount,
        additionalBenefits: data.additionalBenefits,
        tags: data.tags,
        website: data.website,
        socialMedia: data.socialMedia,
        timeline: data.timeline,
        budget: data.budget,
        additionalNotes: data.additionalNotes
      }

      const response = await apiService.createVenture(ventureData)
      
      if (response.success && response.data) {
        onSuccess?.(response.data)
        onClose?.()
      } else {
        throw new Error(response.error || 'Failed to create venture')
      }
    } catch (error) {
      console.error('Error creating venture:', error)
      // Handle error - could show toast notification
    } finally {
      setIsSubmitting(false)
    }
  }

  const value: VentureCreationContextType = {
    data,
    currentStep,
    steps,
    updateData,
    nextStep,
    prevStep,
    goToStep,
    isStepComplete,
    canProceed,
    isSubmitting,
    submitVenture
  }

  return (
    <VentureCreationContext.Provider value={value}>
      {children}
    </VentureCreationContext.Provider>
  )
}

export function useVentureCreation() {
  const context = useContext(VentureCreationContext)
  if (context === undefined) {
    throw new Error('useVentureCreation must be used within a VentureCreationProvider')
  }
  return context
}
