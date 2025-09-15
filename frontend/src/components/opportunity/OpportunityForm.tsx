'use client'

import { useState, useEffect } from 'react'
import { apiService, Role, Venture } from '@/lib/api-unified'
import { Target, Users, DollarSign, CheckCircle, X, Check, Briefcase } from 'lucide-react'

interface OpportunityFormProps {
  onSuccess?: (role: Role) => void
  onCancel?: () => void
  initialData?: Partial<Role>
}

export function OpportunityForm({ onSuccess, onCancel, initialData }: OpportunityFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    ventureId: initialData?.ventureId || '',
    skills: initialData?.skills || [] as string[],
    commitment: initialData?.commitment || '',
    openings: initialData?.openings || 1,
    visibility: initialData?.visibility ?? true,
    ndaRequired: initialData?.ndaRequired ?? false,
    compensation: initialData?.compensation || { type: 'equity', amount: '' }
  })
  
  const [ventures, setVentures] = useState<Venture[]>([])
  const [newSkill, setNewSkill] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const commitments = [
    { value: 'part-time', label: 'Part-time (10-20 hours/week)' },
    { value: 'full-time', label: 'Full-time (40+ hours/week)' },
    { value: 'contract', label: 'Contract (Project-based)' },
    { value: 'consulting', label: 'Consulting (Ad-hoc)' }
  ]

  const compensationTypes = [
    { value: 'equity', label: 'Equity Only' },
    { value: 'cash', label: 'Cash/Salary Only' },
    { value: 'hybrid', label: 'Equity + Cash' }
  ]

  useEffect(() => {
    const loadVentures = async () => {
      try {
        const response = await apiService.getVentures()
        if (response.success && response.data) {
          setVentures(response.data)
        }
      } catch (error) {
        console.error('Error loading ventures:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadVentures()
  }, [])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.title.trim()) newErrors.title = 'Role title is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.ventureId) newErrors.ventureId = 'Venture selection is required'
    if (!formData.commitment) newErrors.commitment = 'Commitment level is required'
    if (formData.openings < 1) newErrors.openings = 'At least 1 opening is required'
    if (!formData.compensation.amount) newErrors.compensation = 'Compensation amount is required'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsSubmitting(true)
    
    try {
      const response = await apiService.createRole(formData)
      
      if (response.success && response.data) {
        onSuccess?.(response.data)
      } else {
        setErrors({ submit: 'Failed to create opportunity. Please try again.' })
      }
    } catch (error) {
      console.error('Error creating opportunity:', error)
      setErrors({ submit: 'An error occurred while creating the opportunity.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }))
      setNewSkill('')
    }
  }

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addSkill()
    }
  }

  if (isLoading) {
    return (
      <div className="glass rounded-xl p-8 max-w-2xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-foreground-muted">Loading ventures...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="glass rounded-xl p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <Target className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {initialData ? 'Edit Opportunity' : 'Create New Opportunity'}
          </h2>
          <p className="text-foreground-muted">
            {initialData ? 'Update opportunity details' : 'Post a new role and find amazing talent'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            Role Information
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Role Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className={`w-full px-3 py-2 bg-glass-surface border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground ${
                errors.title ? 'border-error' : 'border-border'
              }`}
              placeholder="e.g., Senior Frontend Developer, Marketing Manager..."
            />
            {errors.title && <p className="text-sm text-error mt-1">{errors.title}</p>}
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
              placeholder="Describe the role, responsibilities, and what you're looking for..."
            />
            {errors.description && <p className="text-sm text-error mt-1">{errors.description}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Venture *
            </label>
            <select
              value={formData.ventureId}
              onChange={(e) => setFormData(prev => ({ ...prev, ventureId: e.target.value }))}
              className={`w-full px-3 py-2 bg-glass-surface border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground ${
                errors.ventureId ? 'border-error' : 'border-border'
              }`}
            >
              <option value="">Select a venture</option>
              {ventures.map(venture => (
                <option key={venture.id} value={venture.id}>
                  {venture.name} - {venture.industry}
                </option>
              ))}
            </select>
            {errors.ventureId && <p className="text-sm text-error mt-1">{errors.ventureId}</p>}
          </div>
        </div>

        {/* Role Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-accent" />
            Role Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Commitment Level *
              </label>
              <select
                value={formData.commitment}
                onChange={(e) => setFormData(prev => ({ ...prev, commitment: e.target.value }))}
                className={`w-full px-3 py-2 bg-glass-surface border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground ${
                  errors.commitment ? 'border-error' : 'border-border'
                }`}
              >
                <option value="">Select commitment</option>
                {commitments.map(commitment => (
                  <option key={commitment.value} value={commitment.value}>
                    {commitment.label}
                  </option>
                ))}
              </select>
              {errors.commitment && <p className="text-sm text-error mt-1">{errors.commitment}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Number of Openings *
              </label>
              <input
                type="number"
                min="1"
                value={formData.openings}
                onChange={(e) => setFormData(prev => ({ ...prev, openings: parseInt(e.target.value) || 1 }))}
                className={`w-full px-3 py-2 bg-glass-surface border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground ${
                  errors.openings ? 'border-error' : 'border-border'
                }`}
              />
              {errors.openings && <p className="text-sm text-error mt-1">{errors.openings}</p>}
            </div>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.visibility}
                onChange={(e) => setFormData(prev => ({ ...prev, visibility: e.target.checked }))}
                className="w-4 h-4 text-primary bg-glass-surface border-border rounded focus:ring-primary/20"
              />
              <span className="text-sm text-foreground">Make this role visible to all users</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.ndaRequired}
                onChange={(e) => setFormData(prev => ({ ...prev, ndaRequired: e.target.checked }))}
                className="w-4 h-4 text-primary bg-glass-surface border-border rounded focus:ring-primary/20"
              />
              <span className="text-sm text-foreground">NDA required</span>
            </label>
          </div>
        </div>

        {/* Skills Required */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-highlight" />
            Required Skills
          </h3>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 px-3 py-2 bg-glass-surface border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
              placeholder="e.g., React, Python, Marketing, Design..."
            />
            <button
              type="button"
              onClick={addSkill}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Add
            </button>
          </div>
          
          {formData.skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-highlight/10 text-highlight rounded-full text-sm"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="hover:text-highlight/70 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Compensation */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-success" />
            Compensation
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Compensation Type
              </label>
              <select
                value={formData.compensation.type}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  compensation: { ...prev.compensation, type: e.target.value as 'equity' | 'cash' | 'hybrid' }
                }))}
                className="w-full px-3 py-2 bg-glass-surface border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
              >
                {compensationTypes.map(type => (
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
                value={formData.compensation.amount}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  compensation: { ...prev.compensation, amount: e.target.value }
                }))}
                className={`w-full px-3 py-2 bg-glass-surface border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground ${
                  errors.compensation ? 'border-error' : 'border-border'
                }`}
                placeholder={formData.compensation.type === 'equity' ? 'e.g., 2%' : 'e.g., $75,000'}
              />
              {errors.compensation && <p className="text-sm text-error mt-1">{errors.compensation}</p>}
            </div>
          </div>
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
                {initialData ? 'Update Opportunity' : 'Create Opportunity'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
