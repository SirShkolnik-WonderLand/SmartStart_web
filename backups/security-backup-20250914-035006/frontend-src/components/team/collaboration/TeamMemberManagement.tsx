'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, 
  UserPlus, 
  Crown, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Mail, 
  CheckCircle,
  AlertCircle,
  Clock,
  Star,
  Target,
  TrendingUp
} from 'lucide-react'
import { comprehensiveApiService as apiService, TeamMember, User, Team } from '@/lib/api-comprehensive'
import { TeamInvitation, TeamRole, TeamContribution, TeamGoal } from './types/team-collaboration.types'
import { TEAM_ROLES, CONTRIBUTION_TYPES, GOAL_PRIORITIES, GOAL_STATUSES } from './constants/team-constants'
import TeamInvitationModal from './invitations/TeamInvitationModal'

interface TeamMemberManagementProps {
  teamId: string
  ventureId?: string
  onMemberUpdate?: (member: TeamMember) => void
  onMemberRemove?: (memberId: string) => void
}

export default function TeamMemberManagement({ 
  teamId, 
  ventureId, 
  onMemberUpdate, 
  onMemberRemove 
}: TeamMemberManagementProps) {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [invitations, setInvitations] = useState<TeamInvitation[]>([])
  const [contributions, setContributions] = useState<TeamContribution[]>([])
  const [goals, setGoals] = useState<TeamGoal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [activeTab, setActiveTab] = useState<'members' | 'invitations' | 'contributions' | 'goals'>('members')

  useEffect(() => {
    loadTeamData()
  }, [teamId])

  const loadTeamData = async () => {
    try {
      setIsLoading(true)
      
      // Load team members with real API integration
      const teamResponse = await apiService.getTeam(teamId)
      if (teamResponse.success && teamResponse.data) {
        setMembers(teamResponse.data.members || [])
      }

      // Load team goals with real API integration
      const goalsResponse = await apiService.getTeamGoals(teamId)
      if (goalsResponse.success && goalsResponse.data) {
        setGoals(goalsResponse.data.goals || [])
      }

      // Load team analytics for contributions
      const analyticsResponse = await apiService.getTeamAnalytics(teamId)
      if (analyticsResponse.success && analyticsResponse.data) {
        // Transform analytics data into contributions format
        const contributionsData = analyticsResponse.data.performanceMetrics?.map((metric: any, index: number) => ({
          id: `contrib_${index}`,
          teamId,
          userId: 'system',
          ventureId,
          type: 'metric',
          title: metric.name,
          description: `Performance metric: ${metric.description || 'No description'}`,
          value: metric.value,
          hours: 0,
          status: 'completed',
          createdAt: metric.effectiveDate || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          completedAt: metric.effectiveDate || new Date().toISOString(),
          user: {
            id: 'system',
            name: 'System',
            avatar: undefined
          }
        })) || []
        setContributions(contributionsData)
      }

      // Load invitations from API (if available) or use mock data
      try {
        const invitationsResponse = await apiService.getTeamInvitations(teamId)
        if (invitationsResponse.success && invitationsResponse.data) {
          setInvitations(invitationsResponse.data.invitations || [])
        } else {
          // Fallback to mock data
          setInvitations([
            {
              id: 'inv_1',
              teamId,
              ventureId,
              invitedUserId: 'user_1',
              invitedByUserId: 'current_user',
              role: TEAM_ROLES[3], // Senior Member
              permissions: [],
              status: 'pending',
              message: 'Would love to have you join our team!',
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              invitedUser: {
                id: 'user_1',
                name: 'Sarah Johnson',
                email: 'sarah@example.com',
                avatar: undefined
              }
            }
          ])
        }
      } catch (invitationError) {
        console.warn('Invitations API not available, using mock data:', invitationError)
        // Use mock data as fallback
        setInvitations([
          {
            id: 'inv_1',
            teamId,
            ventureId,
            invitedUserId: 'user_1',
            invitedByUserId: 'current_user',
            role: TEAM_ROLES[3], // Senior Member
            permissions: [],
            status: 'pending',
            message: 'Would love to have you join our team!',
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            invitedUser: {
              id: 'user_1',
              name: 'Sarah Johnson',
              email: 'sarah@example.com',
              avatar: undefined
            }
          }
        ])
      }

    } catch (error) {
      console.error('Error loading team data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInviteSuccess = (invitation: TeamInvitation) => {
    setInvitations(prev => [invitation, ...prev])
    setShowInviteModal(false)
  }

  const handleAcceptInvitation = async (invitationId: string) => {
    try {
      // Try to accept invitation via API
      const response = await apiService.acceptTeamInvitation(invitationId)
      if (response.success) {
        setInvitations(prev => 
          prev.map(inv => 
            inv.id === invitationId 
              ? { ...inv, status: 'accepted' as const }
              : inv
          )
        )
        // Reload team data to get updated member list
        loadTeamData()
      } else {
        console.error('Failed to accept invitation:', response.message)
      }
    } catch (error) {
      console.error('Error accepting invitation:', error)
      // Fallback to local state update
      setInvitations(prev => 
        prev.map(inv => 
          inv.id === invitationId 
            ? { ...inv, status: 'accepted' as const }
            : inv
        )
      )
    }
  }

  const handleDeclineInvitation = async (invitationId: string) => {
    try {
      // Try to decline invitation via API
      const response = await apiService.declineTeamInvitation(invitationId)
      if (response.success) {
        setInvitations(prev => 
          prev.map(inv => 
            inv.id === invitationId 
              ? { ...inv, status: 'declined' as const }
              : inv
          )
        )
      } else {
        console.error('Failed to decline invitation:', response.message)
      }
    } catch (error) {
      console.error('Error declining invitation:', error)
      // Fallback to local state update
      setInvitations(prev => 
        prev.map(inv => 
          inv.id === invitationId 
            ? { ...inv, status: 'declined' as const }
            : inv
        )
      )
    }
  }

  const getRoleInfo = (roleId: string) => {
    return TEAM_ROLES.find(role => role.id === roleId) || TEAM_ROLES[4] // Default to member
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'in_progress': return <Clock className="w-4 h-4 text-blue-500" />
      case 'pending': return <AlertCircle className="w-4 h-4 text-yellow-500" />
      default: return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    const priorityInfo = GOAL_PRIORITIES.find(p => p.value === priority)
    return priorityInfo?.color || 'bg-gray-100 text-gray-800'
  }

  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      const response = await apiService.updateTeamMemberRole(teamId, memberId, newRole)
      if (response.success) {
        setMembers(prev => 
          prev.map(member => 
            member.id === memberId 
              ? { ...member, role: newRole }
              : member
          )
        )
        onMemberUpdate?.(members.find(m => m.id === memberId)!)
      } else {
        console.error('Failed to update member role:', response.message)
      }
    } catch (error) {
      console.error('Error updating member role:', error)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    try {
      const response = await apiService.removeTeamMember(teamId, memberId)
      if (response.success) {
        setMembers(prev => prev.filter(member => member.id !== memberId))
        onMemberRemove?.(memberId)
      } else {
        console.error('Failed to remove member:', response.message)
      }
    } catch (error) {
      console.error('Error removing member:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Team Management</h2>
          <p className="text-foreground-muted">Manage team members, roles, and contributions</p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Invite Member
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'members', label: 'Members', icon: Users, count: members.length },
            { id: 'invitations', label: 'Invitations', icon: Mail, count: invitations.filter(i => i.status === 'pending').length },
            { id: 'contributions', label: 'Contributions', icon: TrendingUp, count: contributions.length },
            { id: 'goals', label: 'Goals', icon: Target, count: goals.length }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-foreground-muted hover:text-foreground hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'members' && (
          <motion.div
            key="members"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {members.map((member) => {
              const roleInfo = getRoleInfo(member.role)
              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{member.user?.name || 'Unknown User'}</h3>
                      <p className="text-sm text-foreground-muted">{member.user?.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs ${roleInfo.color}`}>
                          {roleInfo.icon} {roleInfo.name}
                        </span>
                        <span className="text-xs text-foreground-muted">
                          {member.totalContributions} contributions
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <select
                      value={member.role}
                      onChange={(e) => handleRoleChange(member.id, e.target.value)}
                      className="px-2 py-1 text-xs border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      {TEAM_ROLES.map(role => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                    <button 
                      onClick={() => handleRemoveMember(member.id)}
                      className="p-2 text-foreground-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-foreground-muted hover:text-foreground hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </motion.div>
        )}

        {activeTab === 'invitations' && (
          <motion.div
            key="invitations"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{invitation.invitedUser?.name}</h3>
                    <p className="text-sm text-foreground-muted">{invitation.invitedUser?.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs ${invitation.role.color}`}>
                        {invitation.role.icon} {invitation.role.name}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        invitation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        invitation.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {invitation.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {invitation.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleAcceptInvitation(invitation.id)}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors text-sm"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleDeclineInvitation(invitation.id)}
                        className="px-3 py-1 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors text-sm"
                      >
                        Decline
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'contributions' && (
          <motion.div
            key="contributions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {contributions.map((contribution) => {
              const typeInfo = CONTRIBUTION_TYPES.find(t => t.value === contribution.type)
              return (
                <div
                  key={contribution.id}
                  className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-xl">{typeInfo?.icon}</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{contribution.title}</h3>
                      <p className="text-sm text-foreground-muted">{contribution.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-foreground-muted">
                          {contribution.hours}h • {contribution.value} points
                        </span>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(contribution.status)}
                          <span className="text-xs text-foreground-muted capitalize">
                            {contribution.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-foreground">
                      {contribution.user?.name}
                    </div>
                    <div className="text-xs text-foreground-muted">
                      {new Date(contribution.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              )
            })}
          </motion.div>
        )}

        {activeTab === 'goals' && (
          <motion.div
            key="goals"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {goals.map((goal) => {
              const priorityInfo = GOAL_PRIORITIES.find(p => p.value === goal.priority)
              const statusInfo = GOAL_STATUSES.find(s => s.value === goal.status)
              const progress = (goal.current / goal.target) * 100
              
              return (
                <div
                  key={goal.id}
                  className="p-4 bg-white border border-gray-200 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-foreground">{goal.title}</h3>
                      <p className="text-sm text-foreground-muted">{goal.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${priorityInfo?.color}`}>
                        {priorityInfo?.label}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${statusInfo?.color}`}>
                        {statusInfo?.label}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground-muted">Progress</span>
                      <span className="text-foreground">{goal.current}/{goal.target} {goal.unit}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-foreground-muted">
                      <span>Due: {new Date(goal.deadline).toLocaleDateString()}</span>
                      <span>{Math.round(progress)}% complete</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invitation Modal */}
      <TeamInvitationModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSuccess={handleInviteSuccess}
        teamId={teamId}
        ventureId={ventureId}
      />
    </div>
  )
}
