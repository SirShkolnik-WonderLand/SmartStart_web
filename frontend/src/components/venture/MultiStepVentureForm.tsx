'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, X, Plus, Trash2, Users, Briefcase, DollarSign, Tag, Building2 } from 'lucide-react'
import { comprehensiveApiService as apiService, Venture } from '@/lib/api-comprehensive'
import UserInvitationSystem from './UserInvitationSystem'

interface MultiStepVentureFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (venture: Venture) => void
  initialData?: Partial<Venture>
}

const industries = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'E-commerce', 'Manufacturing',
  'Real Estate', 'Entertainment', 'Food & Beverage', 'Transportation', 'Energy',
  'Agriculture', 'Retail', 'Consulting', 'Marketing', 'Other', '🤷‍♂️ I have no idea yet', '💡 Just a wild idea'
]

const stages = [
  { value: 'idea', label: 'Idea Stage', description: 'Concept and validation' },
  { value: 'mvp', label: 'MVP Stage', description: 'Minimum viable product' },
  { value: 'growth', label: 'Growth Stage', description: 'Scaling and expansion' },
  { value: 'scale', label: 'Scale Stage', description: 'Market leadership' },
  { value: 'idea', label: '🤷‍♂️ I have no clue', description: 'Just exploring possibilities' }
]

const tiers = [
  { value: 'T1', label: 'Tier 1 - High Priority', description: 'Premium support and resources' },
  { value: 'T2', label: 'Tier 2 - Standard', description: 'Standard support and resources' },
  { value: 'T3', label: 'Tier 3 - Basic', description: 'Basic support and resources' },
  { value: 'T1', label: '🤷‍♂️ Whatever works', description: 'I just want to get started' }
]

const rewardTypes = [
  { value: 'equity', label: 'Equity Only', description: 'Company ownership shares' },
  { value: 'cash', label: 'Cash/Salary Only', description: 'Monetary compensation' },
  { value: 'hybrid', label: 'Equity + Cash', description: 'Combination of both' },
  { value: 'equity', label: '🤷‍♂️ I have no idea', description: 'We\'ll figure it out later' }
]

const professions = [
  'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Mobile Developer',
  'UI/UX Designer', 'Product Manager', 'Marketing Manager', 'Sales Manager',
  'Business Analyst', 'Data Scientist', 'DevOps Engineer', 'QA Engineer',
  'Content Writer', 'Graphic Designer', 'Project Manager', 'CEO/Founder',
  'CTO', 'CFO', 'COO', 'Legal Counsel', 'HR Manager', 'Other', '🤷‍♂️ I need help figuring this out', '💡 Anyone who wants to join'
]

export default function MultiStepVentureForm({ isOpen, onClose, onSuccess, initialData }: MultiStepVentureFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [createdVenture, setCreatedVenture] = useState<Venture | null>(null)
  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    name: initialData?.name || '',
    industry: initialData?.industry || '',
    description: initialData?.description || '',
    
    // Step 2: Venture Details
    stage: initialData?.stage || 'idea' as 'idea' | 'mvp' | 'growth' | 'scale',
    teamSize: initialData?.teamSize || 1,
    tier: initialData?.tier || 'T1' as 'T1' | 'T2' | 'T3',
    residency: initialData?.residency || '',
    
    // Step 3: Team & Skills
    lookingFor: initialData?.lookingFor || [] as string[],
    newSkill: '',
    
    // Step 4: Rewards & Compensation
    rewards: initialData?.rewards || { type: 'equity' as 'equity' | 'cash' | 'hybrid', amount: '' },
    
    // Step 5: Tags & Final Details
    tags: initialData?.tags || [] as string[],
    newTag: ''
  })

  const totalSteps = 5

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNestedChange = (parent: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...(prev[parent as keyof typeof prev] as Record<string, string>), [field]: value }
    }))
  }

  const addToList = (listField: string, valueField: string) => {
    const value = formData[valueField as keyof typeof formData] as string
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [listField]: [...(prev[listField as keyof typeof prev] as string[]), value.trim()],
        [valueField]: ''
      }))
    }
  }

  const removeFromList = (listField: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [listField]: (prev[listField as keyof typeof prev] as string[]).filter((_, i) => i !== index)
    }))
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      const response = await apiService.createVenture(formData)
      if (response.success && response.data) {
        setCreatedVenture(response.data)
        if (formData.lookingFor.length > 0) {
          setShowInviteModal(true)
        } else {
          onSuccess(response.data)
          onClose()
        }
      } else {
        console.error('Failed to create venture:', response.error)
        // TODO: Show error message to user
      }
    } catch (error) {
      console.error('Error creating venture:', error)
      // TODO: Show error message to user
    } finally {
      setIsLoading(false)
    }
  }

  const handleInviteUsers = (userId: string, role: string) => {
    console.log(`Inviting user ${userId} for role ${role}`)
    // TODO: Implement actual invitation logic
  }

  const handleInviteComplete = () => {
    if (createdVenture) {
      onSuccess(createdVenture)
      onClose()
    }
  }

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return formData.name.trim() !== '' && formData.industry !== '' && formData.description.trim() !== ''
      case 2:
        return !!formData.stage && formData.teamSize > 0 && !!formData.tier
      case 3:
        return true // Optional step
      case 4:
        return !!formData.rewards.type && formData.rewards.amount.trim() !== ''
      case 5:
        return true // Optional step
      default:
        return false
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-4xl max-h-[90vh] mx-4 bg-card border rounded-lg shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-muted/50">
          <div>
            <h2 className="text-2xl font-bold">Launch Your Next Big Idea</h2>
            <p className="text-muted-foreground">Step {currentStep} of {totalSteps}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-muted/30">
          <div className="flex items-center space-x-2">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div key={i} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    i + 1 <= currentStep
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {i + 1}
                </div>
                {i < totalSteps - 1 && (
                  <div
                    className={`w-12 h-1 mx-2 ${
                      i + 1 < currentStep ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                      <Building2 className="w-5 h-5 mr-2" />
                      Basic Information
                    </h3>
                    <p className="text-muted-foreground mb-6">Tell us about your venture idea</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Venture Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Enter venture name"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Industry *
                      </label>
                      <select
                        value={formData.industry}
                        onChange={(e) => handleInputChange('industry', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="">Select industry</option>
                        {industries.map(industry => (
                          <option key={industry} value={industry}>{industry}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Description *
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Describe your venture idea, vision, and goals..."
                        rows={4}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Venture Details */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                      <Briefcase className="w-5 h-5 mr-2" />
                      Venture Details
                    </h3>
                    <p className="text-muted-foreground mb-6">Define your venture&apos;s current stage and structure</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Stage *
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {stages.map(stage => (
                          <label key={stage.value} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                            <input
                              type="radio"
                              name="stage"
                              value={stage.value}
                              checked={formData.stage === stage.value}
                              onChange={(e) => handleInputChange('stage', e.target.value as 'idea' | 'mvp' | 'growth' | 'scale')}
                              className="mr-3"
                            />
                            <div>
                              <div className="font-medium">{stage.label}</div>
                              <div className="text-sm text-muted-foreground">{stage.description}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Team Size *
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={formData.teamSize}
                          onChange={(e) => handleInputChange('teamSize', parseInt(e.target.value) || 1)}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Residency
                        </label>
                        <input
                          type="text"
                          value={formData.residency}
                          onChange={(e) => handleInputChange('residency', e.target.value)}
                          placeholder="e.g., CA, NY, Remote"
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Tier *
                      </label>
                      <div className="space-y-2">
                        {tiers.map(tier => (
                          <label key={tier.value} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                            <input
                              type="radio"
                              name="tier"
                              value={tier.value}
                              checked={formData.tier === tier.value}
                              onChange={(e) => handleInputChange('tier', e.target.value as 'T1' | 'T2' | 'T3')}
                              className="mr-3"
                            />
                            <div>
                              <div className="font-medium">{tier.label}</div>
                              <div className="text-sm text-muted-foreground">{tier.description}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Team & Skills */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      Team & Skills
                    </h3>
                    <p className="text-muted-foreground mb-6">What roles are you looking to fill?</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Looking For
                      </label>
                      <div className="flex gap-2 mb-3">
                        <select
                          value={formData.newSkill}
                          onChange={(e) => handleInputChange('newSkill', e.target.value)}
                          className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="">Select a profession</option>
                          {professions.map(profession => (
                            <option key={profession} value={profession}>{profession}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => addToList('lookingFor', 'newSkill')}
                          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add
                        </button>
                      </div>
                      
                      {formData.lookingFor.length > 0 && (
                        <div className="space-y-2">
                          {formData.lookingFor.map((skill, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                              <span className="text-sm">{skill}</span>
                              <button
                                type="button"
                                onClick={() => removeFromList('lookingFor', index)}
                                className="p-1 hover:bg-destructive/20 rounded"
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Rewards & Compensation */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                      <DollarSign className="w-5 h-5 mr-2" />
                      Rewards & Compensation
                    </h3>
                    <p className="text-muted-foreground mb-6">Define how you&apos;ll reward your team</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Reward Type *
                      </label>
                      <div className="space-y-2">
                        {rewardTypes.map(reward => (
                          <label key={reward.value} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                            <input
                              type="radio"
                              name="rewardType"
                              value={reward.value}
                              checked={formData.rewards.type === reward.value}
                              onChange={(e) => handleNestedChange('rewards', 'type', e.target.value as 'equity' | 'cash' | 'hybrid')}
                              className="mr-3"
                            />
                            <div>
                              <div className="font-medium">{reward.label}</div>
                              <div className="text-sm text-muted-foreground">{reward.description}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Amount *
                      </label>
                      <input
                        type="text"
                        value={formData.rewards.amount}
                        onChange={(e) => handleNestedChange('rewards', 'amount', e.target.value)}
                        placeholder="e.g., 5%, $50k, 2% + $30k"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Tags & Final Details */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                      <Tag className="w-5 h-5 mr-2" />
                      Tags & Final Details
                    </h3>
                    <p className="text-muted-foreground mb-6">Add tags to help others discover your venture</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Tags
                      </label>
                      <div className="flex gap-2 mb-3">
                        <input
                          type="text"
                          value={formData.newTag}
                          onChange={(e) => handleInputChange('newTag', e.target.value)}
                          placeholder="Add a tag..."
                          className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              addToList('tags', 'newTag')
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => addToList('tags', 'newTag')}
                          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add
                        </button>
                      </div>
                      
                      {formData.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {formData.tags.map((tag, index) => (
                            <div key={index} className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full">
                              <span className="text-sm">{tag}</span>
                              <button
                                type="button"
                                onClick={() => removeFromList('tags', index)}
                                className="hover:bg-primary/20 rounded-full p-0.5"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-medium mb-2">Review Your Venture</h4>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p><strong>Name:</strong> {formData.name}</p>
                        <p><strong>Industry:</strong> {formData.industry}</p>
                        <p><strong>Stage:</strong> {stages.find(s => s.value === formData.stage)?.label}</p>
                        <p><strong>Team Size:</strong> {formData.teamSize}</p>
                        <p><strong>Reward Type:</strong> {rewardTypes.find(r => r.value === formData.rewards.type)?.label}</p>
                        <p><strong>Amount:</strong> {formData.rewards.amount}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-muted/30">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center px-4 py-2 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </button>

          <div className="flex items-center gap-3">
            {currentStep < totalSteps ? (
              <button
                onClick={nextStep}
                disabled={!isStepValid(currentStep)}
                className="flex items-center px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!isStepValid(currentStep) || isLoading}
                className="flex items-center px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating...' : 'Create Venture'}
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* User Invitation System */}
      {showInviteModal && createdVenture && (
        <UserInvitationSystem
          ventureId={createdVenture.id}
          ventureName={createdVenture.name}
          requiredRoles={formData.lookingFor}
          onInvite={handleInviteUsers}
          onClose={() => {
            setShowInviteModal(false)
            handleInviteComplete()
          }}
        />
      )}
    </div>
  )
}
