'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Play, 
  BookOpen, 
  HelpCircle, 
  X, 
  RotateCcw,
  CheckCircle,
  Star
} from 'lucide-react'
import InteractiveTutorial, { tutorialSteps } from './InteractiveTutorial'

interface TutorialLauncherProps {
  className?: string
}

export default function TutorialLauncher({ className = '' }: TutorialLauncherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedTutorial, setSelectedTutorial] = useState<string | null>(null)
  const [completedTutorials, setCompletedTutorials] = useState<Set<string>>(new Set())

  const tutorials = [
    {
      id: 'welcome',
      title: 'Welcome Tour',
      description: 'Get started with SmartStart',
      icon: Star,
      color: 'from-purple-500 to-pink-500',
      steps: tutorialSteps.welcome,
      duration: '2 min'
    },
    {
      id: 'dashboard',
      title: 'Dashboard Guide',
      description: 'Learn about your dashboard',
      icon: BookOpen,
      color: 'from-blue-500 to-cyan-500',
      steps: tutorialSteps.dashboard,
      duration: '3 min'
    },
    {
      id: 'ventures',
      title: 'Ventures Tutorial',
      description: 'How to create and manage ventures',
      icon: Play,
      color: 'from-green-500 to-emerald-500',
      steps: tutorialSteps.ventures,
      duration: '4 min'
    },
    {
      id: 'wallet',
      title: 'BUZ Wallet Guide',
      description: 'Understanding your token wallet',
      icon: HelpCircle,
      color: 'from-yellow-500 to-orange-500',
      steps: tutorialSteps.wallet,
      duration: '3 min'
    },
    {
      id: 'search',
      title: 'Search Tutorial',
      description: 'Master the global search feature',
      icon: HelpCircle,
      color: 'from-indigo-500 to-purple-500',
      steps: tutorialSteps.search,
      duration: '2 min'
    }
  ]

  const handleTutorialStart = (tutorialId: string) => {
    setSelectedTutorial(tutorialId)
    setIsOpen(true)
  }

  const handleTutorialComplete = () => {
    if (selectedTutorial) {
      setCompletedTutorials(prev => new Set([...prev, selectedTutorial]))
    }
    setIsOpen(false)
    setSelectedTutorial(null)
  }

  const handleTutorialClose = () => {
    setIsOpen(false)
    setSelectedTutorial(null)
  }

  const resetTutorials = () => {
    setCompletedTutorials(new Set())
  }

  const getSelectedTutorialData = () => {
    if (!selectedTutorial) return null
    return tutorials.find(t => t.id === selectedTutorial)
  }

  return (
    <>
      <div className={`space-y-4 ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Interactive Tutorials</h2>
            <p className="text-gray-600 text-sm">Learn how to use SmartStart with guided tutorials</p>
          </div>
          <button
            onClick={resetTutorials}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Reset all tutorials"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Tutorial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tutorials.map((tutorial) => {
            const IconComponent = tutorial.icon
            const isCompleted = completedTutorials.has(tutorial.id)
            
            return (
              <motion.button
                key={tutorial.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleTutorialStart(tutorial.id)}
                className={`relative p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                  isCompleted
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-lg'
                }`}
              >
                {/* Completion Badge */}
                {isCompleted && (
                  <div className="absolute top-3 right-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                )}

                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${tutorial.color} flex items-center justify-center flex-shrink-0`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {tutorial.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {tutorial.description}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>{tutorial.duration}</span>
                      <span>•</span>
                      <span>{tutorial.steps.length} steps</span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                {isCompleted && (
                  <div className="mt-4">
                    <div className="w-full bg-green-200 rounded-full h-1">
                      <div className="bg-green-500 h-1 rounded-full w-full"></div>
                    </div>
                    <p className="text-xs text-green-600 mt-1">Completed</p>
                  </div>
                )}
              </motion.button>
            )
          })}
        </div>

        {/* Quick Start */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Star className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900">Quick Start</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            New to SmartStart? Start with the Welcome Tour to get familiar with the platform.
          </p>
          <button
            onClick={() => handleTutorialStart('welcome')}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg text-sm font-medium"
          >
            Start Welcome Tour
          </button>
        </div>
      </div>

      {/* Tutorial Modal */}
      {isOpen && selectedTutorial && (
        <InteractiveTutorial
          steps={getSelectedTutorialData()?.steps || []}
          isOpen={isOpen}
          onClose={handleTutorialClose}
          onComplete={handleTutorialComplete}
          title={getSelectedTutorialData()?.title || 'Tutorial'}
        />
      )}
    </>
  )
}

// Floating Tutorial Button
export function FloatingTutorialButton({ className = '' }: { className?: string }) {
  const [isLauncherOpen, setIsLauncherOpen] = useState(false)

  return (
    <>
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsLauncherOpen(true)}
        className={`fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center ${className}`}
      >
        <HelpCircle className="w-6 h-6" />
      </motion.button>

      {isLauncherOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
              onClick={() => setIsLauncherOpen(false)}
            />
            <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Tutorials</h2>
                  <button
                    onClick={() => setIsLauncherOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <TutorialLauncher />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
