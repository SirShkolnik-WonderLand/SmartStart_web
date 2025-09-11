'use client'

import { useState } from 'react'
import { Building2, Lightbulb, FileText } from 'lucide-react'
import { VentureCreationData } from '../types/venture-creation.types'
import { INDUSTRIES } from '../constants/venture-options'

interface BasicInformationStepProps {
  data: VentureCreationData
  updateData: (updates: Partial<VentureCreationData>) => void
  onNext: () => void
  onPrev: () => void
}

export default function BasicInformationStep({ 
  data, 
  updateData, 
  onNext, 
  onPrev 
}: BasicInformationStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateStep = () => {
    const newErrors: Record<string, string> = {}
    
    if (!data.name.trim()) {
      newErrors.name = 'Venture name is required'
    } else if (data.name.length < 3) {
      newErrors.name = 'Venture name must be at least 3 characters'
    }
    
    if (!data.industry) {
      newErrors.industry = 'Please select an industry'
    }
    
    if (!data.description.trim()) {
      newErrors.description = 'Description is required'
    } else if (data.description.length < 50) {
      newErrors.description = 'Description must be at least 50 characters'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep()) {
      onNext()
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Basic Information</h2>
        <p className="text-foreground-muted">Tell us about your venture idea</p>
      </div>

      <div className="space-y-6">
        {/* Venture Name */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Venture Name *
          </label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => updateData({ name: e.target.value })}
            placeholder="Enter your venture name"
            className={`w-full px-4 py-3 rounded-lg border transition-colors ${
              errors.name 
                ? 'border-red-500 bg-red-50' 
                : 'border-gray-300 bg-white focus:border-primary focus:ring-2 focus:ring-primary/20'
            }`}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Industry */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Industry *
          </label>
          <select
            value={data.industry}
            onChange={(e) => updateData({ industry: e.target.value })}
            className={`w-full px-4 py-3 rounded-lg border transition-colors ${
              errors.industry 
                ? 'border-red-500 bg-red-50' 
                : 'border-gray-300 bg-white focus:border-primary focus:ring-2 focus:ring-primary/20'
            }`}
          >
            <option value="">Select an industry</option>
            {INDUSTRIES.map((industry) => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </select>
          {errors.industry && (
            <p className="mt-1 text-sm text-red-600">{errors.industry}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Description *
          </label>
          <textarea
            value={data.description}
            onChange={(e) => updateData({ description: e.target.value })}
            placeholder="Describe your venture idea, what problem it solves, and your vision..."
            rows={4}
            className={`w-full px-4 py-3 rounded-lg border transition-colors resize-none ${
              errors.description 
                ? 'border-red-500 bg-red-50' 
                : 'border-gray-300 bg-white focus:border-primary focus:ring-2 focus:ring-primary/20'
            }`}
          />
          <div className="flex justify-between mt-1">
            {errors.description ? (
              <p className="text-sm text-red-600">{errors.description}</p>
            ) : (
              <p className="text-sm text-foreground-muted">
                Minimum 50 characters
              </p>
            )}
            <p className="text-sm text-foreground-muted">
              {data.description.length}/500
            </p>
          </div>
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
          onClick={handleNext}
          className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          Next Step
        </button>
      </div>
    </div>
  )
}
