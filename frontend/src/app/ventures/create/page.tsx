'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Building2, Briefcase, Users, DollarSign, Tag, CheckCircle } from 'lucide-react'
import { comprehensiveApiService as apiService } from '@/lib/api-comprehensive'

const industries = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'E-commerce', 'Manufacturing',
  'Real Estate', 'Entertainment', 'Food & Beverage', 'Transportation', 'Energy',
  'Agriculture', 'Retail', 'Consulting', 'Marketing', 'Other', '🤷‍♂️ I have no idea yet', '💡 Just a wild idea'
]

const stages = [
  { value: 'idea', label: 'Idea Stage', description: 'Concept and validation', icon: '💡' },
  { value: 'mvp', label: 'MVP Stage', description: 'Minimum viable product', icon: '🚀' },
  { value: 'growth', label: 'Growth Stage', description: 'Scaling and expansion', icon: '📈' },
  { value: 'scale', label: 'Scale Stage', description: 'Market leadership', icon: '🏆' },
  { value: 'idea', label: '🤷‍♂️ I have no clue', description: 'Just exploring possibilities', icon: '🤷‍♂️' }
]

const tiers = [
  { value: 'T1', label: 'Tier 1 - High Priority', description: 'Premium support and resources', color: 'text-yellow-600' },
  { value: 'T2', label: 'Tier 2 - Standard', description: 'Standard support and resources', color: 'text-blue-600' },
  { value: 'T3', label: 'Tier 3 - Basic', description: 'Basic support and resources', color: 'text-green-600' },
  { value: 'T1', label: '🤷‍♂️ Whatever works', description: 'I just want to get started', color: 'text-purple-600' }
]

const rewardTypes = [
  { value: 'equity', label: 'Equity Only', description: 'Company ownership shares', icon: '📊' },
  { value: 'cash', label: 'Cash/Salary Only', description: 'Monetary compensation', icon: '💰' },
  { value: 'hybrid', label: 'Equity + Cash', description: 'Combination of both', icon: '🎯' },
  { value: 'equity', label: '🤷‍♂️ I have no idea', description: 'We\'ll figure it out later', icon: '🤷‍♂️' }
]

const professions = [
  'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Mobile Developer',
  'UI/UX Designer', 'Product Manager', 'Marketing Manager', 'Sales Manager',
  'Business Analyst', 'Data Scientist', 'DevOps Engineer', 'QA Engineer',
  'Content Writer', 'Graphic Designer', 'Project Manager', 'CEO/Founder',
  'CTO', 'CFO', 'COO', 'Legal Counsel', 'HR Manager', 'Other', '🤷‍♂️ I need help figuring this out', '💡 Anyone who wants to join'
]

export default function CreateVenturePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    name: '',
    industry: '',
    description: '',
    
    // Step 2: Venture Details
    stage: 'idea' as 'idea' | 'mvp' | 'growth' | 'scale',
    teamSize: 1,
    tier: 'T1' as 'T1' | 'T2' | 'T3',
    residency: 'US',
    
    // Step 3: Team & Skills
    lookingFor: [] as string[],
    requiredSkills: [] as string[],
    newSkill: '',
    
    // Step 4: Rewards & Compensation
    rewardType: 'equity' as 'equity' | 'cash' | 'hybrid',
    equityPercentage: 0,
    cashAmount: 0,
    
    // Step 5: Tags & Final Details
    tags: [] as string[],
    newTag: '',
    website: '',
    socialMedia: {},
    timeline: {},
    budget: 0,
    additionalNotes: ''
  })

  const totalSteps = 5

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNestedChange = (parent: string, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...(prev[parent as keyof typeof prev] as Record<string, any>), [field]: value }
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
        console.log('✅ Venture created successfully:', response.data)
        
        // Show success message with BUZ token reward
        if (response.data.buzTokens) {
          console.log(`💰 BUZ Token Reward: ${response.data.buzTokens.awarded} tokens for ${response.data.buzTokens.reason}`)
        }
        
        // Redirect to venture page
        router.push(`/ventures/${response.data.id}`)
      } else {
        console.error('Failed to create venture:', response.error)
        alert(`Failed to create venture: ${response.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error creating venture:', error)
      alert(`Error creating venture: ${error.message || 'Unknown error'}`)
    } finally {
      setIsLoading(false)
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
        return !!formData.rewardType && (formData.equityPercentage > 0 || formData.cashAmount > 0)
      case 5:
        return true // Optional step
      default:
        return false
    }
  }

  const getStepIcon = (step: number) => {
    switch (step) {
      case 1: return <Building2 className="w-5 h-5" />
      case 2: return <Briefcase className="w-5 h-5" />
      case 3: return <Users className="w-5 h-5" />
      case 4: return <DollarSign className="w-5 h-5" />
      case 5: return <Tag className="w-5 h-5" />
      default: return null
    }
  }

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return 'Basic Information'
      case 2: return 'Venture Details'
      case 3: return 'Team & Skills'
      case 4: return 'Rewards & Compensation'
      case 5: return 'Tags & Final Details'
      default: return ''
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold">Create New Venture</h1>
              <p className="text-muted-foreground">Step {currentStep} of {totalSteps}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div key={i} className="flex items-center">
                <div className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                      i + 1 <= currentStep
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {i + 1 < currentStep ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      getStepIcon(i + 1)
                    )}
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <div className="text-sm font-medium">{getStepTitle(i + 1)}</div>
                  </div>
                </div>
                {i < totalSteps - 1 && (
                  <div
                    className={`w-16 h-1 mx-4 ${
                      i + 1 < currentStep ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* BUZ Token Cost Info */}
        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="text-2xl">🪙</div>
            <div>
              <h3 className="font-semibold text-blue-400">BUZ Token Cost</h3>
                      <p className="text-sm text-gray-300">
                        Creating a venture costs <span className="font-mono text-green-400">50 BUZ</span> tokens, 
                        and you'll earn <span className="font-mono text-yellow-400">25 BUZ</span> tokens as a reward!
                      </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-card border rounded-lg p-8"
        >
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Basic Information</h2>
                <p className="text-muted-foreground">Tell us about your venture idea</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Venture Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter venture name"
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Industry *
                  </label>
                  <select
                    value={formData.industry}
                    onChange={(e) => handleInputChange('industry', e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-lg"
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
                    rows={6}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Venture Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Venture Details</h2>
                <p className="text-muted-foreground">Define your venture&apos;s current stage and structure</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-3">
                    Stage *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {stages.map(stage => (
                      <label key={stage.value} className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                        <input
                          type="radio"
                          name="stage"
                          value={stage.value}
                          checked={formData.stage === stage.value}
                          onChange={(e) => handleInputChange('stage', e.target.value as 'idea' | 'mvp' | 'growth' | 'scale')}
                          className="mt-1 mr-3"
                        />
                        <div>
                          <div className="flex items-center gap-2 font-medium text-lg">
                            <span className="text-2xl">{stage.icon}</span>
                            {stage.label}
                          </div>
                          <div className="text-muted-foreground mt-1">{stage.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Team Size *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.teamSize}
                      onChange={(e) => handleInputChange('teamSize', parseInt(e.target.value) || 1)}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-lg"
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
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3">
                    Tier *
                  </label>
                  <div className="space-y-3">
                    {tiers.map(tier => (
                      <label key={tier.value} className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                        <input
                          type="radio"
                          name="tier"
                          value={tier.value}
                          checked={formData.tier === tier.value}
                          onChange={(e) => handleInputChange('tier', e.target.value as 'T1' | 'T2' | 'T3')}
                          className="mt-1 mr-3"
                        />
                        <div>
                          <div className={`font-medium text-lg ${tier.color}`}>{tier.label}</div>
                          <div className="text-muted-foreground mt-1">{tier.description}</div>
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
                <h2 className="text-2xl font-bold mb-2">Team & Skills</h2>
                <p className="text-muted-foreground">What roles are you looking to fill?</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Looking For
                  </label>
                  <div className="flex gap-3 mb-4">
                    <select
                      value={formData.newSkill}
                      onChange={(e) => handleInputChange('newSkill', e.target.value)}
                      className="flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-lg"
                    >
                      <option value="">Select a profession</option>
                      {professions.map(profession => (
                        <option key={profession} value={profession}>{profession}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => addToList('lookingFor', 'newSkill')}
                      className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center text-lg"
                    >
                      Add Role
                    </button>
                  </div>
                  
                  {formData.lookingFor.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {formData.lookingFor.map((skill, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <span className="font-medium">{skill}</span>
                          <button
                            type="button"
                            onClick={() => removeFromList('lookingFor', index)}
                            className="p-2 hover:bg-destructive/20 rounded-lg transition-colors"
                          >
                            Remove
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
                <h2 className="text-2xl font-bold mb-2">Rewards & Compensation</h2>
                <p className="text-muted-foreground">Define how you&apos;ll reward your team</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-3">
                    Reward Type *
                  </label>
                  <div className="space-y-3">
                    {rewardTypes.map(reward => (
                      <label key={reward.value} className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                        <input
                          type="radio"
                          name="rewardType"
                          value={reward.value}
                          checked={formData.rewardType === reward.value}
                          onChange={(e) => handleInputChange('rewardType', e.target.value as 'equity' | 'cash' | 'hybrid')}
                          className="mt-1 mr-3"
                        />
                        <div>
                          <div className="flex items-center gap-2 font-medium text-lg">
                            <span className="text-2xl">{reward.icon}</span>
                            {reward.label}
                          </div>
                          <div className="text-muted-foreground mt-1">{reward.description}</div>
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
                    value={formData.rewardType === 'equity' ? formData.equityPercentage : formData.cashAmount}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0
                      if (formData.rewardType === 'equity') {
                        handleInputChange('equityPercentage', value)
                      } else {
                        handleInputChange('cashAmount', value)
                      }
                    }}
                    placeholder="e.g., 5%, $50k, 2% + $30k"
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Tags & Final Details */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Tags & Final Details</h2>
                <p className="text-muted-foreground">Add tags to help others discover your venture</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Tags
                  </label>
                  <div className="flex gap-3 mb-4">
                    <input
                      type="text"
                      value={formData.newTag}
                      onChange={(e) => handleInputChange('newTag', e.target.value)}
                      placeholder="Add a tag..."
                      className="flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-lg"
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
                      className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-lg"
                    >
                      Add Tag
                    </button>
                  </div>
                  
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <div key={index} className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full">
                          <span className="font-medium">{tag}</span>
                          <button
                            type="button"
                            onClick={() => removeFromList('tags', index)}
                            className="hover:bg-primary/20 rounded-full p-1 transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-6 bg-muted/50 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Review Your Venture</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-muted-foreground">Name</p>
                      <p className="text-lg">{formData.name}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">Industry</p>
                      <p className="text-lg">{formData.industry}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">Stage</p>
                      <p className="text-lg">{stages.find(s => s.value === formData.stage)?.label}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">Team Size</p>
                      <p className="text-lg">{formData.teamSize}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">Reward Type</p>
                      <p className="text-lg">{rewardTypes.find(r => r.value === formData.rewardType)?.label}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">Amount</p>
                      <p className="text-lg">{formData.rewardType === 'equity' ? `${formData.equityPercentage}%` : `$${formData.cashAmount}`}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center px-6 py-3 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            ← Previous
          </button>

          <div className="flex items-center gap-4">
            {currentStep < totalSteps ? (
              <button
                onClick={nextStep}
                disabled={!isStepValid(currentStep)}
                className="flex items-center px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                Next Step →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!isStepValid(currentStep) || isLoading}
                className="flex items-center px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                {isLoading ? 'Creating Venture...' : 'Create Venture'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
