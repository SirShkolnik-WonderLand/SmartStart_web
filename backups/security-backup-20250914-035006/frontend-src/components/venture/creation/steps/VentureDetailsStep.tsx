'use client'

import { useState } from 'react'
import { Target, Users, Star, MapPin } from 'lucide-react'
import { VentureCreationData } from '../types/venture-creation.types'
import { VENTURE_STAGES, VENTURE_TIERS, COUNTRIES } from '../constants/venture-options'

interface VentureDetailsStepProps {
  data: VentureCreationData
  updateData: (updates: Partial<VentureCreationData>) => void
  onNext: () => void
  onPrev: () => void
}

export default function VentureDetailsStep({ 
  data, 
  updateData, 
  onNext, 
  onPrev 
}: VentureDetailsStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateStep = () => {
    const newErrors: Record<string, string> = {}
    
    if (!data.stage) {
      newErrors.stage = 'Please select a stage'
    }
    
    if (!data.teamSize || data.teamSize < 1) {
      newErrors.teamSize = 'Team size must be at least 1'
    } else if (data.teamSize > 50) {
      newErrors.teamSize = 'Team size cannot exceed 50'
    }
    
    if (!data.tier) {
      newErrors.tier = 'Please select a tier'
    }
    
    if (!data.residency) {
      newErrors.residency = 'Please select a country/region'
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
          <Target className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Venture Details</h2>
        <p className="text-foreground-muted">Tell us more about your venture's current state</p>
      </div>

      <div className="space-y-6">
        {/* Stage */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Current Stage *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {VENTURE_STAGES.map((stage) => (
              <label
                key={stage.value}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  data.stage === stage.value
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="stage"
                  value={stage.value}
                  checked={data.stage === stage.value}
                  onChange={(e) => updateData({ stage: e.target.value })}
                  className="sr-only"
                />
                <div className="font-medium text-foreground">{stage.label}</div>
                <div className="text-sm text-foreground-muted mt-1">{stage.description}</div>
              </label>
            ))}
          </div>
          {errors.stage && (
            <p className="mt-2 text-sm text-red-600">{errors.stage}</p>
          )}
        </div>

        {/* Team Size */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            <Users className="w-4 h-4 inline mr-2" />
            Team Size *
          </label>
          <input
            type="number"
            min="1"
            max="50"
            value={data.teamSize}
            onChange={(e) => updateData({ teamSize: parseInt(e.target.value) || 0 })}
            className={`w-full px-4 py-3 rounded-lg border transition-colors ${
              errors.teamSize 
                ? 'border-red-500 bg-red-50' 
                : 'border-gray-300 bg-white focus:border-primary focus:ring-2 focus:ring-primary/20'
            }`}
          />
          {errors.teamSize && (
            <p className="mt-1 text-sm text-red-600">{errors.teamSize}</p>
          )}
          <p className="mt-1 text-sm text-foreground-muted">
            How many people are currently on your team?
          </p>
        </div>

        {/* Tier */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            <Star className="w-4 h-4 inline mr-2" />
            Priority Tier *
          </label>
          <div className="space-y-3">
            {VENTURE_TIERS.map((tier) => (
              <label
                key={tier.value}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  data.tier === tier.value
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="tier"
                  value={tier.value}
                  checked={data.tier === tier.value}
                  onChange={(e) => updateData({ tier: e.target.value })}
                  className="sr-only"
                />
                <div className="font-medium text-foreground">{tier.label}</div>
                <div className="text-sm text-foreground-muted mt-1">{tier.description}</div>
              </label>
            ))}
          </div>
          {errors.tier && (
            <p className="mt-2 text-sm text-red-600">{errors.tier}</p>
          )}
        </div>

        {/* Residency */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            <MapPin className="w-4 h-4 inline mr-2" />
            Country/Region *
          </label>
          <select
            value={data.residency}
            onChange={(e) => updateData({ residency: e.target.value })}
            className={`w-full px-4 py-3 rounded-lg border transition-colors ${
              errors.residency 
                ? 'border-red-500 bg-red-50' 
                : 'border-gray-300 bg-white focus:border-primary focus:ring-2 focus:ring-primary/20'
            }`}
          >
            <option value="">Select your country/region</option>
            {COUNTRIES.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
          {errors.residency && (
            <p className="mt-1 text-sm text-red-600">{errors.residency}</p>
          )}
          <p className="mt-1 text-sm text-foreground-muted">
            This helps us with legal compliance and regulations
          </p>
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
