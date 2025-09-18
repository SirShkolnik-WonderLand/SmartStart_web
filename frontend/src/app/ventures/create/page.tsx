'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Building2, Briefcase, Users, DollarSign, Tag, CheckCircle, Upload, Image, FileText, Coins, Zap, Star, Trophy, Target } from 'lucide-react'
import { apiService } from '@/lib/api-unified'

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
  { value: 'exploring', label: '🤷‍♂️ I have no clue', description: 'Just exploring possibilities', icon: '🤷‍♂️' }
]

const tiers = [
  { value: 'T1', label: 'Tier 1 - High Priority', description: 'Premium support and resources', color: 'text-yellow-600', buzCost: 500, features: ['Priority Support', 'Advanced Analytics', 'Custom Themes', 'File Uploads'] },
  { value: 'T2', label: 'Tier 2 - Standard', description: 'Standard support and resources', color: 'text-blue-600', buzCost: 250, features: ['Standard Support', 'Basic Analytics', 'File Uploads'] },
  { value: 'T3', label: 'Tier 3 - Basic', description: 'Basic support and resources', color: 'text-green-600', buzCost: 100, features: ['Basic Support', 'File Uploads'] },
  { value: 'T0', label: '🤷‍♂️ Whatever works', description: 'I just want to get started', color: 'text-purple-600', buzCost: 100, features: ['Basic Support'] }
]

const rewardTypes = [
  { value: 'equity', label: 'Equity Only', description: 'Company ownership shares', icon: '📊' },
  { value: 'cash', label: 'Cash/Salary Only', description: 'Monetary compensation', icon: '💰' },
  { value: 'hybrid', label: 'Equity + Cash', description: 'Combination of both', icon: '🎯' },
  { value: 'unknown', label: '🤷‍♂️ I have no idea', description: 'We\'ll figure it out later', icon: '🤷‍♂️' }
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
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [userBuzBalance, setUserBuzBalance] = useState(1000) // Mock BUZ balance
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    name: '',
    industry: '',
    description: '',
    
    // Step 2: Venture Details
    stage: 'idea' as 'idea' | 'mvp' | 'growth' | 'scale' | 'exploring',
    teamSize: 1,
    tier: 'T1' as 'T1' | 'T2' | 'T3' | 'T0',
    residency: 'US',
    
    // Step 3: Team & Skills
    lookingFor: [] as string[],
    requiredSkills: [] as string[],
    newSkill: '',
    
    // Step 4: Rewards & Compensation
    rewardType: 'equity' as 'equity' | 'cash' | 'hybrid' | 'unknown',
    equityPercentage: 0,
    cashAmount: 0,
    paymentSchedule: 'monthly' as 'monthly' | 'quarterly' | 'annually' | 'milestone',
    
    // Step 5: Tags & Final Details
    tags: [] as string[],
    newTag: '',
    website: '',
    socialMedia: {},
    timeline: {},
    budget: 0,
    additionalNotes: '',
    
    // New fields for enhanced features
    isPublic: true,
    allowApplications: true,
    maxTeamSize: 10,
    equityVestingMonths: 48,
    cliffMonths: 12
  })

  const totalSteps = 6 // Added file upload step

  // Calculate total BUZ cost
  const calculateBuzCost = () => {
    const selectedTier = tiers.find(t => t.value === formData.tier)
    const baseCost = selectedTier?.buzCost || 100
    const fileCost = uploadedFiles.length * 10 // 10 BUZ per file
    const teamCost = formData.maxTeamSize * 5 // 5 BUZ per team member slot
    return baseCost + fileCost + teamCost
  }

  const totalBuzCost = calculateBuzCost()
  const canAfford = userBuzBalance >= totalBuzCost

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type.includes('pdf') || file.type.includes('document')
      const isValidSize = file.size <= 10 * 1024 * 1024 // 10MB limit
      return isValidType && isValidSize
    })
    setUploadedFiles(prev => [...prev, ...validFiles])
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
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
        return !!formData.stage && formData.teamSize > 0 && !!formData.tier && canAfford
      case 3:
        return true // Optional step
      case 4:
        return !!formData.rewardType && (formData.equityPercentage > 0 || formData.cashAmount > 0)
      case 5:
        return true // Optional step
      case 6:
        return true // File upload is optional
      default:
        return false
    }
  }

  const getStepIcon = (step: number) => {
    switch (step) {
      case 1: return <Building2 className="w-5 h-5" />
      case 2: return <Coins className="w-5 h-5" />
      case 3: return <Users className="w-5 h-5" />
      case 4: return <DollarSign className="w-5 h-5" />
      case 5: return <Tag className="w-5 h-5" />
      case 6: return <Upload className="w-5 h-5" />
      default: return null
    }
  }

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return 'Basic Information'
      case 2: return 'BUZ Costs & Tier Selection'
      case 3: return 'Team & Skills'
      case 4: return 'Rewards & Compensation'
      case 5: return 'Tags & Final Details'
      case 6: return 'Upload Files & Media'
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

          {/* Step 2: BUZ Costs & Tier Selection */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">BUZ Costs & Tier Selection</h2>
                <p className="text-muted-foreground">Choose your venture tier and see the BUZ token costs</p>
              </div>

              {/* BUZ Balance Display */}
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coins className="w-6 h-6 text-primary" />
                    <span className="font-semibold">Your BUZ Balance:</span>
                    <span className="text-2xl font-bold text-primary">{userBuzBalance.toLocaleString()}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Total Cost:</div>
                    <div className={`text-2xl font-bold ${canAfford ? 'text-green-600' : 'text-red-600'}`}>
                      {totalBuzCost.toLocaleString()} BUZ
                    </div>
                  </div>
                </div>
                {!canAfford && (
                  <div className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <Zap className="w-4 h-4" />
                    Insufficient BUZ balance. You need {totalBuzCost - userBuzBalance} more BUZ tokens.
                  </div>
                )}
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
                          onChange={(e) => handleInputChange('stage', e.target.value as 'idea' | 'mvp' | 'growth' | 'scale' | 'exploring')}
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
                    Venture Tier *
                  </label>
                  <div className="space-y-3">
                    {tiers.map(tier => (
                      <label key={tier.value} className={`flex items-start p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${formData.tier === tier.value ? 'border-primary bg-primary/5' : ''}`}>
                        <input
                          type="radio"
                          name="tier"
                          value={tier.value}
                          checked={formData.tier === tier.value}
                          onChange={(e) => handleInputChange('tier', e.target.value as 'T1' | 'T2' | 'T3' | 'T0')}
                          className="mt-1 mr-3"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className={`font-medium text-lg ${tier.color}`}>{tier.label}</div>
                            <div className="flex items-center gap-2">
                              <Coins className="w-5 h-5 text-primary" />
                              <span className="font-bold text-primary">{tier.buzCost} BUZ</span>
                            </div>
                          </div>
                          <div className="text-muted-foreground mt-1">{tier.description}</div>
                          <div className="mt-2">
                            <div className="text-sm font-medium mb-1">Features included:</div>
                            <div className="flex flex-wrap gap-1">
                              {tier.features.map((feature, index) => (
                                <span key={index} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                                  {feature}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Team Size Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Maximum Team Size
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={formData.maxTeamSize}
                      onChange={(e) => handleInputChange('maxTeamSize', parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <div className="flex items-center gap-2 min-w-[120px]">
                      <Users className="w-5 h-5 text-primary" />
                      <span className="font-bold">{formData.maxTeamSize} members</span>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Team slots cost 5 BUZ each (Total: {formData.maxTeamSize * 5} BUZ)
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
                          onChange={(e) => handleInputChange('rewardType', e.target.value as 'equity' | 'cash' | 'hybrid' | 'unknown')}
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

          {/* Step 6: Upload Files & Media */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Upload Files & Media</h2>
                <p className="text-muted-foreground">Add images, documents, and pitch materials to showcase your venture</p>
              </div>

              <div className="space-y-6">
                {/* File Upload Area */}
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.ppt,.pptx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="space-y-4">
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                      <Upload className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Upload Files</h3>
                      <p className="text-muted-foreground mb-4">
                        Drag and drop files here, or click to browse
                      </p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-lg"
                      >
                        Choose Files
                      </button>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Supported formats: Images (JPG, PNG, GIF), Documents (PDF, DOC, PPT)
                      <br />
                      Max file size: 10MB per file
                    </div>
                  </div>
                </div>

                {/* Uploaded Files Display */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Uploaded Files ({uploadedFiles.length})</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                              {file.type.startsWith('image/') ? (
                                <Image className="w-5 h-5 text-primary" />
                              ) : (
                                <FileText className="w-5 h-5 text-primary" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="text-destructive hover:bg-destructive/10 p-1 rounded transition-colors"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      File upload cost: {uploadedFiles.length * 10} BUZ tokens
                    </div>
                  </div>
                )}

                {/* Collaboration Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Collaboration Settings</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.isPublic}
                        onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                        className="w-5 h-5"
                      />
                      <div>
                        <div className="font-medium">Make venture public</div>
                        <div className="text-sm text-muted-foreground">
                          Allow other users to discover and view your venture
                        </div>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.allowApplications}
                        onChange={(e) => handleInputChange('allowApplications', e.target.checked)}
                        className="w-5 h-5"
                      />
                      <div>
                        <div className="font-medium">Allow team applications</div>
                        <div className="text-sm text-muted-foreground">
                          Let other users apply to join your venture team
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Final Review */}
                <div className="p-6 bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-primary" />
                    Venture Summary
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-muted-foreground">Venture Name</p>
                      <p className="text-lg font-semibold">{formData.name}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">Tier</p>
                      <p className="text-lg font-semibold">{tiers.find(t => t.value === formData.tier)?.label}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">Team Size</p>
                      <p className="text-lg font-semibold">{formData.maxTeamSize} members</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">Files Uploaded</p>
                      <p className="text-lg font-semibold">{uploadedFiles.length} files</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="font-medium text-muted-foreground">Total BUZ Cost</p>
                      <p className="text-2xl font-bold text-primary">{totalBuzCost.toLocaleString()} BUZ</p>
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
