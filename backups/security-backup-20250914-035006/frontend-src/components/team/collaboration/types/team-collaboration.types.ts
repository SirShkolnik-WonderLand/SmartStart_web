export interface TeamInvitation {
  id: string
  teamId: string
  ventureId?: string
  invitedUserId: string
  invitedByUserId: string
  role: TeamRole
  permissions: TeamPermission[]
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  message?: string
  expiresAt: string
  createdAt: string
  updatedAt: string
  // Related data
  team?: {
    id: string
    name: string
    description: string
  }
  venture?: {
    id: string
    name: string
    description: string
  }
  invitedUser?: {
    id: string
    name: string
    email: string
    avatar?: string
  }
  invitedBy?: {
    id: string
    name: string
    email: string
  }
}

export interface TeamRole {
  id: string
  name: string
  description: string
  level: number // 1-10, higher = more permissions
  permissions: TeamPermission[]
  isDefault: boolean
  color: string
  icon: string
}

export interface TeamPermission {
  id: string
  name: string
  resource: string
  action: string
  description: string
  category: 'team' | 'venture' | 'project' | 'communication' | 'admin'
}

export interface TeamContribution {
  id: string
  teamId: string
  userId: string
  ventureId?: string
  projectId?: string
  type: 'code' | 'design' | 'documentation' | 'meeting' | 'review' | 'other'
  title: string
  description: string
  value: number // Contribution value/points
  hours: number
  status: 'draft' | 'in_progress' | 'completed' | 'reviewed' | 'approved'
  createdAt: string
  updatedAt: string
  completedAt?: string
  reviewedAt?: string
  approvedAt?: string
  // Related data
  user?: {
    id: string
    name: string
    avatar?: string
  }
  team?: {
    id: string
    name: string
  }
  venture?: {
    id: string
    name: string
  }
}

export interface TeamGoal {
  id: string
  teamId: string
  title: string
  description: string
  target: number
  current: number
  unit: string
  deadline: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'draft' | 'active' | 'completed' | 'cancelled'
  createdBy: string
  assignedTo?: string[]
  createdAt: string
  updatedAt: string
  completedAt?: string
  // Related data
  team?: {
    id: string
    name: string
  }
  createdByUser?: {
    id: string
    name: string
    avatar?: string
  }
  assignedUsers?: Array<{
    id: string
    name: string
    avatar?: string
  }>
}

export interface TeamActivity {
  id: string
  teamId: string
  userId: string
  type: 'invitation' | 'join' | 'leave' | 'role_change' | 'goal_created' | 'goal_completed' | 'contribution' | 'meeting' | 'announcement'
  title: string
  description: string
  metadata?: Record<string, any>
  createdAt: string
  // Related data
  user?: {
    id: string
    name: string
    avatar?: string
  }
  team?: {
    id: string
    name: string
  }
}

export interface TeamCollaborationContextType {
  // Current team data
  currentTeam: Team | null
  teamMembers: TeamMember[]
  teamInvitations: TeamInvitation[]
  teamContributions: TeamContribution[]
  teamGoals: TeamGoal[]
  teamActivities: TeamActivity[]
  
  // Loading states
  isLoading: boolean
  isInviting: boolean
  isUpdatingRole: boolean
  isAddingContribution: boolean
  
  // Actions
  inviteMember: (invitation: Partial<TeamInvitation>) => Promise<void>
  acceptInvitation: (invitationId: string) => Promise<void>
  declineInvitation: (invitationId: string) => Promise<void>
  updateMemberRole: (memberId: string, role: TeamRole) => Promise<void>
  removeMember: (memberId: string) => Promise<void>
  addContribution: (contribution: Partial<TeamContribution>) => Promise<void>
  createGoal: (goal: Partial<TeamGoal>) => Promise<void>
  updateGoal: (goalId: string, goal: Partial<TeamGoal>) => Promise<void>
  completeGoal: (goalId: string) => Promise<void>
  
  // Refresh data
  refreshTeam: () => Promise<void>
  refreshInvitations: () => Promise<void>
  refreshContributions: () => Promise<void>
  refreshGoals: () => Promise<void>
  refreshActivities: () => Promise<void>
}
