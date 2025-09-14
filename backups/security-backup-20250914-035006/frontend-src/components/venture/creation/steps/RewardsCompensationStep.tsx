'use client'

import { useState } from 'react'
import { DollarSign, Percent, Gift, Plus, X, CheckCircle } from 'lucide-react'
import { VentureCreationData } from '../types/venture-creation.types'
import { REWARD_TYPES, BENEFITS } from '../constants/venture-options'

interface RewardsCompensationStepProps {
  data: VentureCreationData
  updateData: (updates: Partial<VentureCreationData>) => void
  onNext: () => void
  onPrev: () => void
}

export default function RewardsCompensationStep({ 
  data, 
  updateData, 
  onNext, 
  onPrev 
}: RewardsCompensationStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showBenefits, setShowBenefits] = useState(false)

  const validateStep = () => {
    const newErrors: Record<string, string> = {}
    
    if (!data.rewardType) {
      newErrors.rewardType = 'Please select a reward type'
    }
    
    if (data.rewardType === 'equity' || data.rewardType === 'hybrid') {
      if (!data.equityPercentage || data.equityPercentage <= 0) {
        newErrors.equityPercentage = 'Equity percentage is required'
      } else if (data.equityPercentage > 100) {
        newErrors.equityPercentage = 'Equity percentage cannot exceed 100%'
      }
    }
    
    if (data.rewardType === 'cash' || data.rewardType === 'hybrid') {
      if (!data.cashAmount || data.cashAmount <= 0) {
        newErrors.cashAmount = 'Cash amount is required'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep()) {
      onNext()
    }
  }

  const addBenefit = (benefit: string) => {
    if (!data.additionalBenefits.includes(benefit)) {
      updateData({ 
        additionalBenefits: [...data.additionalBenefits, benefit] 
      })
    }
    setShowBenefits(false)
  }

  const removeBenefit = (benefit: string) => {
    updateData({ 
      additionalBenefits: data.additionalBenefits.filter(b => b !== benefit) 
    })
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <DollarSign className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Rewards & Compensation</h2>
        <p className="text-foreground-muted">How will you reward your team members?</p>
      </div>

      <div className="space-y-8">
        {/* Reward Type */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Reward Type *
          </label>
          <div className="space-y-3">
            {REWARD_TYPES.map((type) => (
              <label
                key={type.value}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  data.rewardType === type.value
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="rewardType"
                  value={type.value}
                  checked={data.rewardType === type.value}
                  onChange={(e) => updateData({ rewardType: e.target.value })}
                  className="sr-only"
                />
                <div className="font-medium text-foreground">{type.label}</div>
                <div className="text-sm text-foreground-muted mt-1">{type.description}</div>
              </label>
            ))}
          </div>
          {errors.rewardType && (
            <p className="mt-2 text-sm text-red-600">{errors.rewardType}</p>
          )}
        </div>

        {/* Equity Percentage */}
        {(data.rewardType === 'equity' || data.rewardType === 'hybrid') && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <Percent className="w-4 h-4 inline mr-2" />
              Equity Percentage *
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={data.equityPercentage}
                onChange={(e) => updateData({ equityPercentage: parseFloat(e.target.value) || 0 })}
                className={`w-32 px-4 py-3 rounded-lg border transition-colors ${
                  errors.equityPercentage 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-300 bg-white focus:border-primary focus:ring-2 focus:ring-primary/20'
                }`}
              />
              <span className="text-foreground-muted">%</span>
            </div>
            {errors.equityPercentage && (
              <p className="mt-1 text-sm text-red-600">{errors.equityPercentage}</p>
            )}
            <p className="mt-1 text-sm text-foreground-muted">
              What percentage of equity are you offering to team members?
            </p>
          </div>
        )}

        {/* Cash Amount */}
        {(data.rewardType === 'cash' || data.rewardType === 'hybrid') && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <DollarSign className="w-4 h-4 inline mr-2" />
              Cash Amount *
            </label>
            <div className="flex items-center gap-2">
              <span className="text-foreground-muted">$</span>
              <input
                type="number"
                min="0"
                step="100"
                value={data.cashAmount}
                onChange={(e) => updateData({ cashAmount: parseFloat(e.target.value) || 0 })}
                className={`w-40 px-4 py-3 rounded-lg border transition-colors ${
                  errors.cashAmount 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-300 bg-white focus:border-primary focus:ring-2 focus:ring-primary/20'
                }`}
              />
              <span className="text-foreground-muted">per month</span>
            </div>
            {errors.cashAmount && (
              <p className="mt-1 text-sm text-red-600">{errors.cashAmount}</p>
            )}
            <p className="mt-1 text-sm text-foreground-muted">
              What's the monthly cash compensation?
            </p>
          </div>
        )}

        {/* Additional Benefits */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            <Gift className="w-4 h-4 inline mr-2" />
            Additional Benefits
          </label>
          
          {/* Selected Benefits */}
          <div className="flex flex-wrap gap-2 mb-3">
            {data.additionalBenefits.map((benefit) => (
              <span
                key={benefit}
                className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
              >
                {benefit}
                <button
                  onClick={() => removeBenefit(benefit)}
                  className="hover:text-green-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          {/* Add Benefit */}
          <div className="relative">
            <button
              onClick={() => setShowBenefits(!showBenefits)}
              className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Benefits
            </button>

            {/* Benefits Dropdown */}
            {showBenefits && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                {BENEFITS.map((benefit) => (
                  <button
                    key={benefit}
                    onClick={() => addBenefit(benefit)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
                  >
                    <span>{benefit}</span>
                    {data.additionalBenefits.includes(benefit) && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </button>
                ))}
              </div>
            )}
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
