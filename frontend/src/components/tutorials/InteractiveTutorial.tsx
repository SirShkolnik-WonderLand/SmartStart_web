'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  Play, 
  Pause,
  RotateCcw,
  SkipForward
} from 'lucide-react'

interface TutorialStep {
  id: string
  title: string
  description: string
  target?: string // CSS selector for element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center'
  action?: 'click' | 'hover' | 'type' | 'scroll'
  actionTarget?: string
  actionValue?: string
  image?: string
  video?: string
  duration?: number // Auto-advance after this many seconds
}

interface InteractiveTutorialProps {
  steps: TutorialStep[]
  isOpen: boolean
  onClose: () => void
  onComplete?: () => void
  title?: string
  className?: string
}

export default function InteractiveTutorial({
  steps,
  isOpen,
  onClose,
  onComplete,
  title = 'Interactive Tutorial',
  className = ''
}: InteractiveTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null)
  const [tutorialProgress, setTutorialProgress] = useState(0)
  const overlayRef = useRef<HTMLDivElement>(null)

  const currentStepData = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1
  const isFirstStep = currentStep === 0

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0)
      setCompletedSteps(new Set())
      setTutorialProgress(0)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && currentStepData?.target) {
      highlightElement(currentStepData.target)
    }
    return () => {
      removeHighlight()
    }
  }, [isOpen, currentStep, currentStepData])

  useEffect(() => {
    if (isPlaying && currentStepData?.duration) {
      const timer = setTimeout(() => {
        nextStep()
      }, currentStepData.duration * 1000)
      return () => clearTimeout(timer)
    }
  }, [isPlaying, currentStep, currentStepData])

  const highlightElement = (selector: string) => {
    const element = document.querySelector(selector) as HTMLElement
    if (element) {
      setHighlightedElement(element)
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  const removeHighlight = () => {
    setHighlightedElement(null)
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps(prev => new Set([...prev, currentStep]))
      setCurrentStep(prev => prev + 1)
      setTutorialProgress(((currentStep + 1) / steps.length) * 100)
    } else {
      completeTutorial()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
      setTutorialProgress((currentStep / steps.length) * 100)
    }
  }

  const completeTutorial = () => {
    setCompletedSteps(prev => new Set([...prev, currentStep]))
    setTutorialProgress(100)
    onComplete?.()
  }

  const skipTutorial = () => {
    onClose()
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const resetTutorial = () => {
    setCurrentStep(0)
    setCompletedSteps(new Set())
    setTutorialProgress(0)
    setIsPlaying(false)
  }

  const executeAction = (step: TutorialStep) => {
    if (!step.action || !step.actionTarget) return

    const targetElement = document.querySelector(step.actionTarget) as HTMLElement
    if (!targetElement) return

    switch (step.action) {
      case 'click':
        targetElement.click()
        break
      case 'hover':
        targetElement.dispatchEvent(new MouseEvent('mouseover'))
        break
      case 'type':
        if (step.actionValue) {
          targetElement.focus()
          ;(targetElement as HTMLInputElement).value = step.actionValue
          targetElement.dispatchEvent(new Event('input', { bubbles: true }))
        }
        break
      case 'scroll':
        targetElement.scrollIntoView({ behavior: 'smooth' })
        break
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay */}
      <motion.div
        ref={overlayRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Highlight Overlay */}
      {highlightedElement && (
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute border-2 border-purple-500 rounded-lg shadow-lg"
            style={{
              top: highlightedElement.offsetTop - 4,
              left: highlightedElement.offsetLeft - 4,
              width: highlightedElement.offsetWidth + 8,
              height: highlightedElement.offsetHeight + 8,
            }}
          />
        </div>
      )}

      {/* Tutorial Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className={`relative mx-auto mt-20 max-w-2xl ${className}`}
      >
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-purple-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">{title}</h2>
                <p className="text-purple-100 text-sm">
                  Step {currentStep + 1} of {steps.length}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="w-full bg-white/20 rounded-full h-2">
                <motion.div
                  className="bg-white h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${tutorialProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {currentStepData.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {currentStepData.description}
                </p>

                {/* Media */}
                {currentStepData.image && (
                  <div className="mb-4">
                    <img
                      src={currentStepData.image}
                      alt={currentStepData.title}
                      className="w-full rounded-lg border border-gray-200"
                    />
                  </div>
                )}

                {currentStepData.video && (
                  <div className="mb-4">
                    <video
                      src={currentStepData.video}
                      controls
                      className="w-full rounded-lg border border-gray-200"
                    />
                  </div>
                )}

                {/* Action Button */}
                {currentStepData.action && (
                  <div className="mb-4">
                    <button
                      onClick={() => executeAction(currentStepData)}
                      className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
                    >
                      {currentStepData.action === 'click' && 'Click the highlighted element'}
                      {currentStepData.action === 'hover' && 'Hover over the highlighted element'}
                      {currentStepData.action === 'type' && 'Type in the highlighted field'}
                      {currentStepData.action === 'scroll' && 'Scroll to the highlighted element'}
                    </button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <button
                  onClick={resetTutorial}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Reset Tutorial"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                
                <button
                  onClick={togglePlayPause}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={skipTutorial}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm font-medium"
                >
                  Skip Tutorial
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={prevStep}
                    disabled={isFirstStep}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <button
                    onClick={nextStep}
                    className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg flex items-center space-x-2"
                  >
                    <span>{isLastStep ? 'Complete' : 'Next'}</span>
                    {isLastStep ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Step Indicators */}
            <div className="flex justify-center space-x-2 mt-4">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep
                      ? 'bg-purple-500'
                      : completedSteps.has(index)
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// Predefined Tutorial Steps
export const tutorialSteps = {
  welcome: [
    {
      id: 'welcome',
      title: 'Welcome to SmartStart!',
      description: 'Let\'s take a quick tour of the platform to help you get started.',
      position: 'center' as const,
      duration: 3
    }
  ],
  
  dashboard: [
    {
      id: 'dashboard-overview',
      title: 'Dashboard Overview',
      description: 'This is your main dashboard where you can see all your activities, ventures, and progress.',
      target: '[data-tutorial="dashboard"]',
      position: 'bottom' as const
    },
    {
      id: 'quick-actions',
      title: 'Quick Actions',
      description: 'Use these quick action buttons to create new ventures, join teams, or access your wallet.',
      target: '[data-tutorial="quick-actions"]',
      position: 'top' as const
    },
    {
      id: 'stats-cards',
      title: 'Your Stats',
      description: 'Track your progress with these stat cards showing your XP, ventures, and achievements.',
      target: '[data-tutorial="stats-cards"]',
      position: 'top' as const
    }
  ],

  ventures: [
    {
      id: 'ventures-list',
      title: 'Ventures List',
      description: 'Browse and manage all your ventures from this central location.',
      target: '[data-tutorial="ventures-list"]',
      position: 'bottom' as const
    },
    {
      id: 'create-venture',
      title: 'Create New Venture',
      description: 'Click the "Create Venture" button to start a new project.',
      target: '[data-tutorial="create-venture"]',
      position: 'left' as const,
      action: 'click' as const,
      actionTarget: '[data-tutorial="create-venture"]'
    }
  ],

  wallet: [
    {
      id: 'wallet-overview',
      title: 'BUZ Token Wallet',
      description: 'Manage your BUZ tokens, view your balance, and track your staking rewards.',
      target: '[data-tutorial="wallet-overview"]',
      position: 'bottom' as const
    },
    {
      id: 'token-balance',
      title: 'Token Balance',
      description: 'Your current BUZ token balance is displayed here.',
      target: '[data-tutorial="token-balance"]',
      position: 'right' as const
    },
    {
      id: 'staking-rewards',
      title: 'Staking Rewards',
      description: 'View your staked tokens and earned rewards.',
      target: '[data-tutorial="staking-rewards"]',
      position: 'left' as const
    }
  ],

  search: [
    {
      id: 'search-bar',
      title: 'Global Search',
      description: 'Use the search bar to find ventures, users, documents, and more across the platform.',
      target: '[data-tutorial="search-bar"]',
      position: 'bottom' as const,
      action: 'click' as const,
      actionTarget: '[data-tutorial="search-bar"]'
    }
  ]
}
