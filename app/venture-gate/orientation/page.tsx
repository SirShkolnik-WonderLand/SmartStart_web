'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiService } from '../services/api'

const PlatformOrientation = () => {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await apiService.getCurrentUser()
        setUser(userData)
      } catch (error) {
        console.error('Failed to load user:', error)
        router.push('/')
      }
    }
    loadUser()
  }, [router])

  const orientationSteps = [
    {
      title: "Welcome to SmartStart",
      icon: "🎉",
      content: "SmartStart is your complete venture operating system. We help you build, manage, and scale your startup from idea to success.",
      features: [
        "Create and manage ventures",
        "Build and lead teams", 
        "Track projects and progress",
        "Handle legal and compliance",
        "Manage equity and investments"
      ]
    },
    {
      title: "Your Dashboard",
      icon: "📊",
      content: "Your central hub where you can manage everything. Access all your ventures, teams, projects, and analytics in one place.",
      features: [
        "Overview of all your ventures",
        "Quick access to key features",
        "Real-time progress tracking",
        "Team collaboration tools",
        "Performance analytics"
      ]
    },
    {
      title: "Venture Management",
      icon: "🚀",
      content: "Create and manage your ventures with our comprehensive tools. From initial idea to full-scale operations.",
      features: [
        "Create new ventures",
        "Set up legal entities",
        "Manage equity distribution",
        "Track venture progress",
        "Collaborate with team members"
      ]
    },
    {
      title: "Team Building",
      icon: "👥",
      content: "Find and manage talented team members. Build the perfect team for your venture's success.",
      features: [
        "Discover skilled professionals",
        "Invite team members",
        "Assign roles and responsibilities",
        "Track team performance",
        "Facilitate collaboration"
      ]
    },
    {
      title: "Project Management",
      icon: "📋",
      content: "Organize and track your projects with our powerful project management tools.",
      features: [
        "Create and manage projects",
        "Assign tasks and deadlines",
        "Track progress and milestones",
        "Generate reports and analytics",
        "Integrate with team workflows"
      ]
    },
    {
      title: "Legal & Compliance",
      icon: "⚖️",
      content: "Handle all legal matters with our integrated legal system. From contracts to equity management.",
      features: [
        "Digital contract signing",
        "Legal document templates",
        "Equity management tools",
        "Compliance tracking",
        "Automated legal workflows"
      ]
    }
  ]

  const handleNext = () => {
    if (currentStep < orientationSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Complete orientation and move to welcome
      router.push('/venture-gate/welcome')
    }
  }

  const handleSkip = () => {
    router.push('/venture-gate/welcome')
  }

  if (!user) {
    return (
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div className="text-center">
          <div className="loading-spinner"></div>
          <p className="text-muted mt-4">Loading...</p>
        </div>
      </div>
    )
  }

  const currentStepData = orientationSteps[currentStep]
  const progress = ((currentStep + 1) / orientationSteps.length) * 100

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">{currentStepData.icon}</div>
        <h1 className="text-4xl font-bold mb-4" style={{ color: '#00ff88' }}>
          {currentStepData.title}
        </h1>
        <p className="text-xl text-muted mb-6">
          Step {currentStep + 1} of {orientationSteps.length}
        </p>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-2 mb-6" style={{ maxWidth: '400px', margin: '0 auto' }}>
          <div 
            className="bg-green-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="p-8">
          <div className="text-center mb-8">
            <p className="text-lg text-muted mb-6">{currentStepData.content}</p>
          </div>

          {/* Features List */}
          <div className="grid grid-2 gap-4 mb-8">
            {currentStepData.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-800 rounded">
                <div className="text-green-400">✓</div>
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>

          {/* Step Navigation */}
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {orientationSteps.map((_, index) => (
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
                {currentStep === orientationSteps.length - 1 ? 'Get Started' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="card mt-8" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="card-header">
          <h3 className="text-xl font-bold">💡 Quick Tips</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-2 gap-6">
            <div>
              <h4 className="font-bold mb-2">Getting Started</h4>
              <ul className="text-sm text-muted space-y-1">
                <li>• Start by creating your first venture</li>
                <li>• Invite team members to collaborate</li>
                <li>• Set up your first project</li>
                <li>• Explore the platform features</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-2">Need Help?</h4>
              <ul className="text-sm text-muted space-y-1">
                <li>• Check the documentation</li>
                <li>• Contact support if needed</li>
                <li>• Join our community</li>
                <li>• Watch tutorial videos</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlatformOrientation
