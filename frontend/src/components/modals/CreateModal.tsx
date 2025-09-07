'use client'

import React from 'react'
import { 
  Building2, 
  Users, 
  Target, 
  X, 
  Plus,
  Briefcase
} from 'lucide-react'

interface CreateModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateModal({ isOpen, onClose }: CreateModalProps) {

  if (!isOpen) return null

  const createOptions = [
    {
      id: 'venture',
      title: 'New Venture',
      description: 'Create a new venture project',
      icon: Building2,
      href: '/ventures/create',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      id: 'company',
      title: 'New Company',
      description: 'Register a new company',
      icon: Briefcase,
      href: '/companies/create',
      color: 'text-accent',
      bgColor: 'bg-accent/10'
    },
    {
      id: 'team',
      title: 'New Team',
      description: 'Create a collaborative team',
      icon: Users,
      href: '/teams/create',
      color: 'text-highlight',
      bgColor: 'bg-highlight/10'
    },
    {
      id: 'opportunity',
      title: 'New Opportunity',
      description: 'Post a new role or opportunity',
      icon: Target,
      href: '/opportunities/create',
      color: 'text-success',
      bgColor: 'bg-success/10'
    }
  ]

  const handleCreate = (option: typeof createOptions[0]) => {
    // For now, just navigate to the page
    // In the future, we can open a modal or redirect
    window.location.href = option.href
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl glass rounded-xl border border-border shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Plus className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Create New</h2>
              <p className="text-foreground-muted">Choose what you&apos;d like to create</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-glass-surface rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-foreground-muted" />
          </button>
        </div>

        {/* Options Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {createOptions.map((option) => {
              const Icon = option.icon
              return (
                <button
                  key={option.id}
                  onClick={() => handleCreate(option)}
                  className="p-6 glass rounded-xl border border-border hover:glass-lg transition-all duration-200 text-left group"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 ${option.bgColor} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-6 h-6 ${option.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">
                        {option.title}
                      </h3>
                      <p className="text-sm text-foreground-muted">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">
              Need help? Check out our guides and documentation.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-border rounded-lg hover:bg-glass-surface transition-colors text-foreground"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
