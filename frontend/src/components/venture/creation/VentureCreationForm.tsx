'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react'
import { useVentureCreation } from './VentureCreationContext'
import { Venture } from '@/lib/api-comprehensive'

interface VentureCreationFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (venture: Venture) => void
}

export default function VentureCreationForm({ 
  isOpen, 
  onClose, 
  onSuccess 
}: VentureCreationFormProps) {
  const {
    data,
    currentStep,
    steps,
    nextStep,
    prevStep,
    goToStep,
    isStepComplete,
    canProceed,
    isSubmitting,
    submitVenture
  } = useVentureCreation()

  if (!isOpen) return null

  const CurrentStepComponent = steps[currentStep].component

  const handleSuccess = (venture: Venture) => {
    onSuccess(venture)
  }

  const handleSubmit = async () => {
    await submitVenture()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Create New Venture</h2>
              <p className="text-white/80 mt-1">
                Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center ${
                    index <= currentStep ? 'text-white' : 'text-white/50'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      index < currentStep
                        ? 'bg-white text-primary'
                        : index === currentStep
                        ? 'bg-white/20 text-white'
                        : 'bg-white/10 text-white/50'
                    }`}
                  >
                    {index < currentStep ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-12 h-0.5 mx-2 ${
                        index < currentStep ? 'bg-white' : 'bg-white/30'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 max-h-[60vh] overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <CurrentStepComponent
                data={data}
                updateData={(updates) => {
                  // This will be handled by the context
                }}
                onNext={nextStep}
                onPrev={prevStep}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
            </div>

            <div className="flex items-center gap-4">
              {/* Step Navigation Dots */}
              <div className="flex items-center gap-2">
                {steps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToStep(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentStep
                        ? 'bg-primary'
                        : index < currentStep
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              {currentStep < steps.length - 1 ? (
                <button
                  onClick={nextStep}
                  disabled={!canProceed}
                  className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!canProceed || isSubmitting}
                  className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isSubmitting ? 'Creating...' : 'Create Venture'}
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
