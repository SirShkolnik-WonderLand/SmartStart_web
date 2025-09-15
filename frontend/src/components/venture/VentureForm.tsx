'use client'

import { useState } from 'react'
import { apiService, Venture } from '@/lib/api-unified'
import { Building2, Target, Users, DollarSign, Tag, X, Check, Sparkles } from 'lucide-react'

interface VentureFormProps {
  onSuccess?: (venture: Venture) => void
  onCancel?: () => void
  initialData?: Partial<Venture>
}

export function VentureForm({ onSuccess, onCancel, initialData }: VentureFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    stage: initialData?.stage || 'idea' as 'idea' | 'mvp' | 'growth' | 'scale',
    industry: initialData?.industry || '',
    teamSize: initialData?.teamSize || 1,
    lookingFor: initialData?.lookingFor || [] as string[],
    rewards: initialData?.rewards || { type: 'equity' as 'equity' | 'cash' | 'hybrid', amount: '' },
    tags: initialData?.tags || [] as string[],
    tier: initialData?.tier || 'T1' as 'T1' | 'T2' | 'T3',
    residency: initialData?.residency || ''
  })
  
  const [newLookingFor, setNewLookingFor] = useState('')
  const [newTag, setNewTag] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const stages = [
    { value: 'idea', label: 'Idea Stage' },
    { value: 'mvp', label: 'MVP Development' },
    { value: 'growth', label: 'Growth Stage' },
    { value: 'scale', label: 'Scale Stage' }
  ]

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing',
    'Retail', 'Real Estate', 'Transportation', 'Energy', 'Media',
    'Consulting', 'Non-profit', 'Government', 'Other'
  ]

  const tiers = [
    { value: 'T1', label: 'Tier 1 - High Priority' },
    { value: 'T2', label: 'Tier 2 - Standard' },
    { value: 'T3', label: 'Tier 3 - Basic' }
  ]

  const rewardTypes = [
    { value: 'equity', label: 'Equity' },
    { value: 'cash', label: 'Cash/Salary' },
    { value: 'hybrid', label: 'Equity + Cash' }
  ]

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) newErrors.name = 'Venture name is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.stage) newErrors.stage = 'Stage is required'
    if (!formData.industry) newErrors.industry = 'Industry is required'
    if (formData.teamSize < 1) newErrors.teamSize = 'Team size must be at least 1'
    if (!formData.rewards.amount) newErrors.rewards = 'Reward amount is required'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsSubmitting(true)
    
    try {
      const response = await apiService.createVenture(formData)
      
      if (response.success && response.data) {
        onSuccess?.(response.data)
      } else {
        setErrors({ submit: 'Failed to create venture. Please try again.' })
      }
    } catch (error) {
      console.error('Error creating venture:', error)
      setErrors({ submit: 'An error occurred while creating the venture.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const addLookingFor = () => {
    if (newLookingFor.trim() && !formData.lookingFor.includes(newLookingFor.trim())) {
      setFormData(prev => ({
        ...prev,
        lookingFor: [...prev.lookingFor, newLookingFor.trim()]
      }))
      setNewLookingFor('')
    }
  }

  const removeLookingFor = (item: string) => {
    setFormData(prev => ({
      ...prev,
      lookingFor: prev.lookingFor.filter(looking => looking !== item)
    }))
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      action()
    }
  }

  return (
    <div className="glass rounded-xl p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <Building2 className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {initialData ? 'Edit Venture' : 'Create New Venture'}
          </h2>
          <p className="text-foreground-muted">
            {initialData ? 'Update venture information' : 'Launch your next big idea'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Basic Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Venture Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={`w-full px-3 py-2 bg-glass-surface border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground ${
                  errors.name ? 'border-error' : 'border-border'
                }`}
                placeholder="Enter venture name"
              />
              {errors.name && <p className="text-sm text-error mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Industry *
              </label>
              <select
                value={formData.industry}
                onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                className={`w-full px-3 py-2 bg-glass-surface border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground ${
                  errors.industry ? 'border-error' : 'border-border'
                }`}
              >
                <option value="">Select industry</option>
                {industries.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
              {errors.industry && <p className="text-sm text-error mt-1">{errors.industry}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className={`w-full px-3 py-2 bg-glass-surface border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground ${
                errors.description ? 'border-error' : 'border-border'
              }`}
              placeholder="Describe your venture idea, vision, and goals..."
            />
            {errors.description && <p className="text-sm text-error mt-1">{errors.description}</p>}
          </div>
        </div>

        {/* Venture Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Target className="w-5 h-5 text-accent" />
            Venture Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Stage *
              </label>
              <select
                value={formData.stage}
                onChange={(e) => setFormData(prev => ({ ...prev, stage: e.target.value as 'idea' | 'mvp' | 'growth' | 'scale' }))}
                className={`w-full px-3 py-2 bg-glass-surface border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground ${
                  errors.stage ? 'border-error' : 'border-border'
                }`}
              >
                <option value="">Select stage</option>
                {stages.map(stage => (
                  <option key={stage.value} value={stage.value}>{stage.label}</option>
                ))}
              </select>
              {errors.stage && <p className="text-sm text-error mt-1">{errors.stage}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Team Size *
              </label>
              <input
                type="number"
                min="1"
                value={formData.teamSize}
                onChange={(e) => setFormData(prev => ({ ...prev, teamSize: parseInt(e.target.value) || 1 }))}
                className={`w-full px-3 py-2 bg-glass-surface border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground ${
                  errors.teamSize ? 'border-error' : 'border-border'
                }`}
              />
              {errors.teamSize && <p className="text-sm text-error mt-1">{errors.teamSize}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Tier
              </label>
              <select
                value={formData.tier}
                onChange={(e) => setFormData(prev => ({ ...prev, tier: e.target.value as 'T1' | 'T2' | 'T3' }))}
                className="w-full px-3 py-2 bg-glass-surface border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
              >
                {tiers.map(tier => (
                  <option key={tier.value} value={tier.value}>{tier.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Residency
            </label>
            <input
              type="text"
              value={formData.residency}
              onChange={(e) => setFormData(prev => ({ ...prev, residency: e.target.value }))}
              className="w-full px-3 py-2 bg-glass-surface border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
              placeholder="e.g., CA, NY, Remote"
            />
          </div>
        </div>

        {/* Looking For */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-highlight" />
            Looking For
          </h3>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={newLookingFor}
              onChange={(e) => setNewLookingFor(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, addLookingFor)}
              className="flex-1 px-3 py-2 bg-glass-surface border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
              placeholder="e.g., Frontend Developer, Marketing Manager..."
            />
            <button
              type="button"
              onClick={addLookingFor}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Add
            </button>
          </div>
          
          {formData.lookingFor.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.lookingFor.map((item, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-highlight/10 text-highlight rounded-full text-sm"
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => removeLookingFor(item)}
                    className="hover:text-highlight/70 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Rewards */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-success" />
            Rewards & Compensation
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Reward Type
              </label>
              <select
                value={formData.rewards.type}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  rewards: { ...prev.rewards, type: e.target.value as 'equity' | 'cash' | 'hybrid' }
                }))}
                className="w-full px-3 py-2 bg-glass-surface border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
              >
                {rewardTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Amount *
              </label>
              <input
                type="text"
                value={formData.rewards.amount}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  rewards: { ...prev.rewards, amount: e.target.value }
                }))}
                className={`w-full px-3 py-2 bg-glass-surface border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground ${
                  errors.rewards ? 'border-error' : 'border-border'
                }`}
                placeholder={formData.rewards.type === 'equity' ? 'e.g., 5%' : 'e.g., $50,000'}
              />
              {errors.rewards && <p className="text-sm text-error mt-1">{errors.rewards}</p>}
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Tag className="w-5 h-5 text-warning" />
            Tags
          </h3>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, addTag)}
              className="flex-1 px-3 py-2 bg-glass-surface border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
              placeholder="Add a tag..."
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Add
            </button>
          </div>
          
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-warning/10 text-warning rounded-full text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-warning/70 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="p-3 bg-error/10 border border-error/20 rounded-lg">
            <p className="text-sm text-error">{errors.submit}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-border rounded-lg hover:bg-glass-surface transition-colors text-foreground"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="wonder-button flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                {initialData ? 'Update Venture' : 'Create Venture'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
