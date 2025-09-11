export interface VentureCreationData {
  // Basic Information
  name: string
  industry: string
  description: string
  
  // Venture Details
  stage: string
  teamSize: number
  tier: string
  residency: string
  
  // Team & Skills
  lookingFor: string[]
  requiredSkills: string[]
  preferredSkills: string[]
  
  // Rewards & Compensation
  rewardType: string
  equityPercentage: number
  cashAmount: number
  additionalBenefits: string[]
  
  // Tags & Final Details
  tags: string[]
  website: string
  socialMedia: {
    linkedin?: string
    twitter?: string
    github?: string
  }
  timeline: string
  budget: number
  additionalNotes: string
}

export interface VentureCreationStep {
  id: string
  title: string
  description: string
  component: React.ComponentType<any>
  isComplete: boolean
  isOptional: boolean
}

export interface VentureCreationContextType {
  data: VentureCreationData
  currentStep: number
  steps: VentureCreationStep[]
  updateData: (updates: Partial<VentureCreationData>) => void
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: number) => void
  isStepComplete: (step: number) => boolean
  canProceed: boolean
  isSubmitting: boolean
  submitVenture: () => Promise<void>
}
