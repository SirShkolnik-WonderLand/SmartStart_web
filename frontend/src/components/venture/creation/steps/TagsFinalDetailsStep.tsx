'use client'

import { useState } from 'react'
import { Tag, Globe, Link, Calendar, DollarSign, FileText, Plus, X } from 'lucide-react'
import { VentureCreationData } from '../types/venture-creation.types'

interface TagsFinalDetailsStepProps {
  data: VentureCreationData
  updateData: (updates: Partial<VentureCreationData>) => void
  onNext: () => void
  onPrev: () => void
  onSubmit: () => void
  isSubmitting: boolean
}

export default function TagsFinalDetailsStep({ 
  data, 
  updateData, 
  onNext, 
  onPrev,
  onSubmit,
  isSubmitting
}: TagsFinalDetailsStepProps) {
  const [newTag, setNewTag] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const addTag = () => {
    if (newTag.trim() && !data.tags.includes(newTag.trim())) {
      updateData({ tags: [...data.tags, newTag.trim()] })
      setNewTag('')
    }
  }

  const removeTag = (tag: string) => {
    updateData({ tags: data.tags.filter(t => t !== tag) })
  }

  const validateStep = () => {
    const newErrors: Record<string, string> = {}
    
    if (data.website && !isValidUrl(data.website)) {
      newErrors.website = 'Please enter a valid URL'
    }
    
    if (data.socialMedia.linkedin && !isValidUrl(data.socialMedia.linkedin)) {
      newErrors.linkedin = 'Please enter a valid LinkedIn URL'
    }
    
    if (data.socialMedia.twitter && !isValidUrl(data.socialMedia.twitter)) {
      newErrors.twitter = 'Please enter a valid Twitter URL'
    }
    
    if (data.socialMedia.github && !isValidUrl(data.socialMedia.github)) {
      newErrors.github = 'Please enter a valid GitHub URL'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleSubmit = () => {
    if (validateStep()) {
      onSubmit()
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Tag className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Tags & Final Details</h2>
        <p className="text-foreground-muted">Add the finishing touches to your venture</p>
      </div>

      <div className="space-y-8">
        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            <Tag className="w-4 h-4 inline mr-2" />
            Tags
          </label>
          
          {/* Selected Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            {data.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
              >
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="hover:text-primary/70"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          {/* Add Tag */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add a tag..."
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTag()}
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <button
              onClick={addTag}
              className="px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <p className="mt-1 text-sm text-foreground-muted">
            Add tags to help others find your venture
          </p>
        </div>

        {/* Website */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            <Globe className="w-4 h-4 inline mr-2" />
            Website
          </label>
          <input
            type="url"
            value={data.website}
            onChange={(e) => updateData({ website: e.target.value })}
            placeholder="https://yourventure.com"
            className={`w-full px-4 py-3 rounded-lg border transition-colors ${
              errors.website 
                ? 'border-red-500 bg-red-50' 
                : 'border-gray-300 bg-white focus:border-primary focus:ring-2 focus:ring-primary/20'
            }`}
          />
          {errors.website && (
            <p className="mt-1 text-sm text-red-600">{errors.website}</p>
          )}
        </div>

        {/* Social Media */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            <Link className="w-4 h-4 inline mr-2" />
            Social Media Links
          </label>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-foreground-muted mb-1">LinkedIn</label>
              <input
                type="url"
                value={data.socialMedia.linkedin || ''}
                onChange={(e) => updateData({ 
                  socialMedia: { ...data.socialMedia, linkedin: e.target.value }
                })}
                placeholder="https://linkedin.com/company/yourventure"
                className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                  errors.linkedin 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-300 bg-white focus:border-primary focus:ring-2 focus:ring-primary/20'
                }`}
              />
              {errors.linkedin && (
                <p className="mt-1 text-sm text-red-600">{errors.linkedin}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm text-foreground-muted mb-1">Twitter</label>
              <input
                type="url"
                value={data.socialMedia.twitter || ''}
                onChange={(e) => updateData({ 
                  socialMedia: { ...data.socialMedia, twitter: e.target.value }
                })}
                placeholder="https://twitter.com/yourventure"
                className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                  errors.twitter 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-300 bg-white focus:border-primary focus:ring-2 focus:ring-primary/20'
                }`}
              />
              {errors.twitter && (
                <p className="mt-1 text-sm text-red-600">{errors.twitter}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm text-foreground-muted mb-1">GitHub</label>
              <input
                type="url"
                value={data.socialMedia.github || ''}
                onChange={(e) => updateData({ 
                  socialMedia: { ...data.socialMedia, github: e.target.value }
                })}
                placeholder="https://github.com/yourventure"
                className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                  errors.github 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-300 bg-white focus:border-primary focus:ring-2 focus:ring-primary/20'
                }`}
              />
              {errors.github && (
                <p className="mt-1 text-sm text-red-600">{errors.github}</p>
              )}
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            <Calendar className="w-4 h-4 inline mr-2" />
            Project Timeline
          </label>
          <select
            value={data.timeline}
            onChange={(e) => updateData({ timeline: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Select timeline</option>
            <option value="1-3 months">1-3 months</option>
            <option value="3-6 months">3-6 months</option>
            <option value="6-12 months">6-12 months</option>
            <option value="1-2 years">1-2 years</option>
            <option value="2+ years">2+ years</option>
            <option value="ongoing">Ongoing project</option>
          </select>
        </div>

        {/* Budget */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            <DollarSign className="w-4 h-4 inline mr-2" />
            Project Budget
          </label>
          <select
            value={data.budget}
            onChange={(e) => updateData({ budget: parseFloat(e.target.value) || 0 })}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="0">No budget</option>
            <option value="1000">Under $1,000</option>
            <option value="5000">$1,000 - $5,000</option>
            <option value="10000">$5,000 - $10,000</option>
            <option value="25000">$10,000 - $25,000</option>
            <option value="50000">$25,000 - $50,000</option>
            <option value="100000">$50,000 - $100,000</option>
            <option value="250000">$100,000+</option>
          </select>
        </div>

        {/* Additional Notes */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            <FileText className="w-4 h-4 inline mr-2" />
            Additional Notes
          </label>
          <textarea
            value={data.additionalNotes}
            onChange={(e) => updateData({ additionalNotes: e.target.value })}
            placeholder="Any additional information about your venture..."
            rows={4}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <button
          onClick={onPrev}
          className="px-6 py-3 text-foreground-muted hover:text-foreground transition-colors"
        >
          Previous
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Creating Venture...' : 'Create Venture'}
        </button>
      </div>
    </div>
  )
}
