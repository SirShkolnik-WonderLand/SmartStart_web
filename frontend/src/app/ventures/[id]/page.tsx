'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { comprehensiveApiService as apiService, Venture, User } from '@/lib/api-comprehensive'
import { ArrowLeft, Building2, Users, Calendar, TrendingUp, Briefcase, CheckCircle, Clock, AlertCircle, Edit3, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function VentureDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [venture, setVenture] = useState<Venture | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreatingMeeting, setIsCreatingMeeting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const ventureId = params.id as string

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        
        // Load venture and current user in parallel
        const [ventureResponse, userResponse] = await Promise.all([
          apiService.getVenture(ventureId),
          apiService.getCurrentUser()
        ])
        
        if (ventureResponse.success && ventureResponse.data) {
          setVenture(ventureResponse.data)
        } else {
          setError(ventureResponse.error || 'Failed to load venture')
        }
        
        if (userResponse.success && userResponse.data) {
          setCurrentUser(userResponse.data)
        }
      } catch (err) {
        setError('Failed to load data')
        console.error('Error loading data:', err)
      } finally {
        setIsLoading(false)
      }
    }

    if (ventureId) {
      loadData()
    }
  }, [ventureId])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING_CONTRACTS':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'ACTIVE':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'COMPLETED':
        return <CheckCircle className="w-5 h-5 text-blue-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING_CONTRACTS':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
      case 'ACTIVE':
        return 'bg-green-500/10 text-green-600 border-green-500/20'
      case 'COMPLETED':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20'
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20'
    }
  }

  const isOwner = currentUser && venture && currentUser.id === venture.owner?.id

  const handleScheduleMeeting = async () => {
    if (!venture || !currentUser) return

    try {
      setIsCreatingMeeting(true)
      
      // Create a default meeting for next week
      const nextWeek = new Date()
      nextWeek.setDate(nextWeek.getDate() + 7)
      nextWeek.setHours(14, 0, 0, 0) // 2 PM

      const meetingData = {
        title: `${venture.name} Team Meeting`,
        description: `Team meeting for ${venture.name}`,
        ventureId: venture.id,
        organizerId: currentUser.id,
        scheduledFor: nextWeek.toISOString(),
        duration: 60,
        location: 'Virtual',
        meetingType: 'TEAM_MEETING',
        agenda: 'Discuss venture progress and next steps',
        meetingLink: `https://meet.google.com/${Math.random().toString(36).substring(2, 15)}`
      }

      const response = await apiService.createMeeting(meetingData)
      
      if (response.success) {
        alert('Meeting scheduled successfully!')
      } else {
        alert('Failed to schedule meeting: ' + response.error)
      }
    } catch (error) {
      console.error('Error creating meeting:', error)
      alert('Failed to schedule meeting')
    } finally {
      setIsCreatingMeeting(false)
    }
  }

  const handleDeleteVenture = async () => {
    if (!venture) return

    setIsDeleting(true)
    try {
      const response = await apiService.deleteVenture(venture.id)
      
      if (response.success) {
        alert('Venture deleted successfully!')
        router.push('/ventures')
      } else {
        alert(`Failed to delete venture: ${response.error}`)
      }
    } catch (error) {
      console.error('Error deleting venture:', error)
      alert('Failed to delete venture')
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen wonderland-bg flex items-center justify-center">
        <div className="glass rounded-xl p-8 text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-foreground-muted">Loading venture...</p>
        </div>
      </div>
    )
  }

  if (error || !venture) {
    return (
      <div className="min-h-screen wonderland-bg flex items-center justify-center">
        <div className="glass rounded-xl p-8 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Venture Not Found</h2>
          <p className="text-foreground-muted mb-6">{error || 'The venture you\'re looking for doesn\'t exist.'}</p>
          <div className="flex gap-3 justify-center">
            <button 
              onClick={() => router.back()}
              className="wonder-button-secondary"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </button>
            <Link href="/ventures" className="wonder-button">
              <Briefcase className="w-4 h-4 mr-2" />
              All Ventures
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen wonderland-bg">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          {/* Back Button - Above everything */}
          <div className="mb-4">
            <button 
              onClick={() => router.back()}
              className="wonder-button-secondary flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>
          
          {/* Project Title and Status */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-4xl font-bold text-foreground">{venture.name}</h1>
              {true && (
                <div className="flex items-center gap-3">
                  <Link 
                    href={`/ventures/${venture.id}/edit`}
                    className="wonder-button-secondary flex items-center gap-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit Venture
                  </Link>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(venture.status)}`}>
                {getStatusIcon(venture.status)}
                <span className="ml-2">{venture.status.replace('_', ' ')}</span>
              </span>
              <span className="text-foreground-muted">Created {new Date(venture.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-xl p-6"
            >
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                About This Venture
              </h2>
              <p className="text-foreground-body leading-relaxed">
                {venture.ventureProfile?.description || venture.description || 'No description provided yet.'}
              </p>
            </motion.div>

            {/* Venture Details */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-xl p-6"
            >
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent" />
                Venture Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground-muted">Industry</label>
                  <p className="text-foreground-body">{venture.ventureProfile?.industry || venture.industry || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground-muted">Stage</label>
                  <p className="text-foreground-body capitalize">{venture.ventureProfile?.stage || venture.stage || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground-muted">Region</label>
                  <p className="text-foreground-body">{venture.residency || venture.region || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground-muted">Team Size</label>
                  <p className="text-foreground-body">{venture.ventureProfile?.teamSize || venture.teamSize || 'Not specified'}</p>
                </div>
              </div>
            </motion.div>

            {/* Team & Roles */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-xl p-6"
            >
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-highlight" />
                Team & Roles
              </h2>
              <div className="space-y-3">
                {venture.lookingFor && venture.lookingFor.length > 0 ? (
                  venture.lookingFor.map((role, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-glass-surface rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">{role}</p>
                        <p className="text-sm text-foreground-muted">Looking for this role</p>
                      </div>
                      <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                        Open
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-foreground-muted">No specific roles defined yet.</p>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Owner Info */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold text-foreground mb-4">Venture Owner</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {venture.owner?.name || 'Unknown Owner'}
                  </p>
                  <p className="text-sm text-foreground-muted">
                    {venture.owner?.email || 'No email provided'}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full wonder-button-secondary text-left">
                  <Users className="w-4 h-4 mr-2" />
                  Invite Team Members
                </button>
                <button 
                  onClick={handleScheduleMeeting}
                  disabled={isCreatingMeeting}
                  className="w-full wonder-button-secondary text-left"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  {isCreatingMeeting ? 'Scheduling...' : 'Schedule Meeting'}
                </button>
                <button className="w-full wonder-button-secondary text-left">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Analytics
                </button>
              </div>
            </motion.div>

            {/* Venture Stats */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold text-foreground mb-4">Venture Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-foreground-muted">Status</span>
                  <span className="text-foreground-body font-medium">{venture.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground-muted">Created</span>
                  <span className="text-foreground-body font-medium">
                    {new Date(venture.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground-muted">Last Updated</span>
                  <span className="text-foreground-body font-medium">
                    {new Date(venture.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-foreground mb-4">Delete Venture</h3>
            <p className="text-foreground-body mb-6">
              Are you sure you want to delete &ldquo;{venture?.name}&rdquo;? This action cannot be undone and will permanently remove all venture data.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-foreground-muted hover:text-foreground transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteVenture}
                disabled={isDeleting}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Venture
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
