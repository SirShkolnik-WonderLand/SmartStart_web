'use client'

import { useState } from 'react'
import { comprehensiveApiService as apiService, Company } from '@/lib/api-comprehensive'
import { Building, Globe, MapPin, Calendar, Tag, X, Check } from 'lucide-react'

interface CompanyFormProps {
  onSuccess?: (company: Company) => void
  onCancel?: () => void
  initialData?: Partial<Company>
}

export function CompanyForm({ onSuccess, onCancel, initialData }: CompanyFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    industry: initialData?.industry || '',
    size: initialData?.size || '',
    stage: initialData?.stage || '',
    website: initialData?.website || '',
    headquarters: initialData?.headquarters || '',
    foundedDate: initialData?.foundedDate || '',
    tags: initialData?.tags || [] as string[]
  })
  
  const [newTag, setNewTag] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing',
    'Retail', 'Real Estate', 'Transportation', 'Energy', 'Media',
    'Consulting', 'Non-profit', 'Government', 'Other'
  ]

  const sizes = [
    '1-10 employees', '11-50 employees', '51-200 employees',
    '201-500 employees', '501-1000 employees', '1000+ employees'
  ]

  const stages = [
    'Idea', 'MVP', 'Early Stage', 'Growth', 'Expansion', 'Mature', 'Exit'
  ]

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) newErrors.name = 'Company name is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.industry) newErrors.industry = 'Industry is required'
    if (!formData.size) newErrors.size = 'Company size is required'
    if (!formData.stage) newErrors.stage = 'Stage is required'
    if (!formData.foundedDate) newErrors.foundedDate = 'Founded date is required'
    
    if (formData.website && !isValidUrl(formData.website)) {
      newErrors.website = 'Please enter a valid website URL'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidUrl = (url: string) => {
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`)
      return true
    } catch {
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsSubmitting(true)
    
    try {
      const response = await apiService.createCompany(formData)
      
      if (response.success && response.data) {
        onSuccess?.(response.data)
      } else {
        setErrors({ submit: 'Failed to create company. Please try again.' })
      }
    } catch (error) {
      console.error('Error creating company:', error)
      setErrors({ submit: 'An error occurred while creating the company.' })
    } finally {
      setIsSubmitting(false)
    }
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

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  return (
    <div className="glass rounded-xl p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <Building className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {initialData ? 'Edit Company' : 'Create New Company'}
          </h2>
          <p className="text-foreground-muted">
            {initialData ? 'Update company information' : 'Add a new company to the ecosystem'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Building className="w-5 h-5 text-primary" />
            Basic Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Company Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={`w-full px-3 py-2 bg-glass-surface border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground ${
                  errors.name ? 'border-error' : 'border-border'
                }`}
                placeholder="Enter company name"
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
              rows={3}
              className={`w-full px-3 py-2 bg-glass-surface border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground ${
                errors.description ? 'border-error' : 'border-border'
              }`}
              placeholder="Describe what your company does..."
            />
            {errors.description && <p className="text-sm text-error mt-1">{errors.description}</p>}
          </div>
        </div>

        {/* Company Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Globe className="w-5 h-5 text-accent" />
            Company Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Company Size *
              </label>
              <select
                value={formData.size}
                onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
                className={`w-full px-3 py-2 bg-glass-surface border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground ${
                  errors.size ? 'border-error' : 'border-border'
                }`}
              >
                <option value="">Select size</option>
                {sizes.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
              {errors.size && <p className="text-sm text-error mt-1">{errors.size}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Stage *
              </label>
              <select
                value={formData.stage}
                onChange={(e) => setFormData(prev => ({ ...prev, stage: e.target.value }))}
                className={`w-full px-3 py-2 bg-glass-surface border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground ${
                  errors.stage ? 'border-error' : 'border-border'
                }`}
              >
                <option value="">Select stage</option>
                {stages.map(stage => (
                  <option key={stage} value={stage}>{stage}</option>
                ))}
              </select>
              {errors.stage && <p className="text-sm text-error mt-1">{errors.stage}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Website
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-foreground-muted absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  className={`w-full pl-10 pr-3 py-2 bg-glass-surface border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground ${
                    errors.website ? 'border-error' : 'border-border'
                  }`}
                  placeholder="https://example.com"
                />
              </div>
              {errors.website && <p className="text-sm text-error mt-1">{errors.website}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Founded Date *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-foreground-muted absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="date"
                  value={formData.foundedDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, foundedDate: e.target.value }))}
                  className={`w-full pl-10 pr-3 py-2 bg-glass-surface border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground ${
                    errors.foundedDate ? 'border-error' : 'border-border'
                  }`}
                />
              </div>
              {errors.foundedDate && <p className="text-sm text-error mt-1">{errors.foundedDate}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Headquarters
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-foreground-muted absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                value={formData.headquarters}
                onChange={(e) => setFormData(prev => ({ ...prev, headquarters: e.target.value }))}
                className="w-full pl-10 pr-3 py-2 bg-glass-surface border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                placeholder="City, Country"
              />
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Tag className="w-5 h-5 text-highlight" />
            Tags
          </h3>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={handleKeyPress}
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
                  className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-primary/70 transition-colors"
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
                {initialData ? 'Update Company' : 'Create Company'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
