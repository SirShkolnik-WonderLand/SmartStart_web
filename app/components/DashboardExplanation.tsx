'use client'

import { useState, useEffect } from 'react'

interface DashboardExplanationProps {
  onClose: () => void
}

const DashboardExplanation = ({ onClose }: DashboardExplanationProps) => {
  const [currentStep, setCurrentStep] = useState(0)

  const explanationSteps = [
    {
      title: "Dashboard Overview",
      icon: "🎉",
      content: "This is your central hub where you can manage everything about your ventures, teams, and projects.",
      features: [
        "Overview of all your activities",
        "Quick access to key features", 
        "Real-time progress tracking",
        "Team collaboration tools"
      ]
    },
    {
      title: "Navigation Tabs",
      icon: "📊",
      content: "Use the tabs at the top to navigate between different sections of your dashboard.",
      features: [
        "Overview - Your main dashboard",
        "Ventures - Manage your ventures",
        "Explore - Discover opportunities",
        "Team - Build and manage teams",
        "Projects - Track your projects",
        "Legal - Handle legal matters",
        "Subscription - Manage your plan"
      ]
    },
    {
      title: "Quick Actions",
      icon: "⚡",
      content: "Use the quick action buttons to quickly create new ventures, teams, or projects.",
      features: [
        "Create new ventures instantly",
        "Build teams with one click",
        "Start new projects easily",
        "Access all features quickly"
      ]
    },
    {
      title: "You're All Set!",
      icon: "🚀",
      content: "You now know how to navigate your dashboard. You can always come back to explore more features!",
      features: [
        "Everything is organized and easy to find",
        "Your progress is tracked automatically",
        "Collaborate with your team seamlessly",
        "Scale your ventures effectively"
      ]
    }
  ]

  const handleNext = () => {
    if (currentStep < explanationSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Mark as seen and close
      localStorage.setItem('dashboard-explanation-seen', 'true')
      onClose()
    }
  }

  const handleSkip = () => {
    localStorage.setItem('dashboard-explanation-seen', 'true')
    onClose()
  }

  const currentStepData = explanationSteps[currentStep]
  const progress = ((currentStep + 1) / explanationSteps.length) * 100

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="card max-w-2xl w-full mx-4" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">{currentStepData.icon}</div>
            <h2 className="text-3xl font-bold mb-4" style={{ color: '#00ff88' }}>
              {currentStepData.title}
            </h2>
            <p className="text-lg text-muted mb-6">
              Step {currentStep + 1} of {explanationSteps.length}
            </p>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-2 mb-6" style={{ maxWidth: '400px', margin: '0 auto' }}>
              <div 
                className="bg-green-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Content */}
          <div className="mb-8">
            <p className="text-lg text-muted mb-6 text-center">{currentStepData.content}</p>
            
            {/* Features List */}
            <div className="grid grid-2 gap-4">
              {currentStepData.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-800 rounded">
                  <div className="text-green-400">✓</div>
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Step Navigation */}
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {explanationSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                    index <= currentStep ? 'bg-green-400' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
            
            <div className="flex gap-4">
              <button 
                className="btn btn-secondary"
                onClick={handleSkip}
              >
                Skip Tour
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleNext}
              >
                {currentStep === explanationSteps.length - 1 ? 'Get Started' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardExplanation
