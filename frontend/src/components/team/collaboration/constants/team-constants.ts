export const TEAM_ROLES: TeamRole[] = [
  {
    id: 'owner',
    name: 'Owner',
    description: 'Full control over team and all resources',
    level: 10,
    permissions: ['team:admin', 'venture:admin', 'project:admin', 'user:admin'],
    isDefault: false,
    color: 'bg-purple-100 text-purple-800',
    icon: '👑'
  },
  {
    id: 'admin',
    name: 'Admin',
    description: 'Manage team members and settings',
    level: 8,
    permissions: ['team:write', 'team:invite', 'team:remove', 'venture:write'],
    isDefault: false,
    color: 'bg-red-100 text-red-800',
    icon: '⚡'
  },
  {
    id: 'lead',
    name: 'Team Lead',
    description: 'Lead projects and coordinate team activities',
    level: 7,
    permissions: ['team:write', 'project:admin', 'venture:write'],
    isDefault: false,
    color: 'bg-blue-100 text-blue-800',
    icon: '🎯'
  },
  {
    id: 'senior',
    name: 'Senior Member',
    description: 'Experienced contributor with mentoring responsibilities',
    level: 6,
    permissions: ['team:read', 'project:write', 'venture:write'],
    isDefault: false,
    color: 'bg-green-100 text-green-800',
    icon: '⭐'
  },
  {
    id: 'member',
    name: 'Member',
    description: 'Active team contributor',
    level: 4,
    permissions: ['team:read', 'project:write'],
    isDefault: true,
    color: 'bg-gray-100 text-gray-800',
    icon: '👤'
  },
  {
    id: 'contributor',
    name: 'Contributor',
    description: 'Part-time or project-based contributor',
    level: 3,
    permissions: ['team:read', 'project:read'],
    isDefault: false,
    color: 'bg-yellow-100 text-yellow-800',
    icon: '🤝'
  },
  {
    id: 'observer',
    name: 'Observer',
    description: 'View-only access to team activities',
    level: 1,
    permissions: ['team:read'],
    isDefault: false,
    color: 'bg-gray-100 text-gray-600',
    icon: '👁️'
  }
]

export const TEAM_PERMISSIONS: TeamPermission[] = [
  // Team permissions
  { id: 'team:read', name: 'View Team', resource: 'team', action: 'read', description: 'View team information and members', category: 'team' },
  { id: 'team:write', name: 'Edit Team', resource: 'team', action: 'write', description: 'Modify team settings and information', category: 'team' },
  { id: 'team:invite', name: 'Invite Members', resource: 'team', action: 'invite', description: 'Invite new members to the team', category: 'team' },
  { id: 'team:remove', name: 'Remove Members', resource: 'team', action: 'remove', description: 'Remove members from the team', category: 'team' },
  { id: 'team:admin', name: 'Admin Team', resource: 'team', action: 'admin', description: 'Full team administration', category: 'team' },
  
  // Venture permissions
  { id: 'venture:read', name: 'View Venture', resource: 'venture', action: 'read', description: 'View venture information', category: 'venture' },
  { id: 'venture:write', name: 'Edit Venture', resource: 'venture', action: 'write', description: 'Modify venture details', category: 'venture' },
  { id: 'venture:funding', name: 'Manage Funding', resource: 'venture', action: 'funding', description: 'Manage venture funding', category: 'venture' },
  { id: 'venture:legal', name: 'Legal Access', resource: 'venture', action: 'legal', description: 'Access legal documents', category: 'venture' },
  
  // Project permissions
  { id: 'project:read', name: 'View Projects', resource: 'project', action: 'read', description: 'View project information', category: 'project' },
  { id: 'project:write', name: 'Edit Projects', resource: 'project', action: 'write', description: 'Modify project details', category: 'project' },
  { id: 'project:admin', name: 'Admin Projects', resource: 'project', action: 'admin', description: 'Full project administration', category: 'project' },
  
  // Communication permissions
  { id: 'communication:read', name: 'View Messages', resource: 'communication', action: 'read', description: 'View team communications', category: 'communication' },
  { id: 'communication:write', name: 'Send Messages', resource: 'communication', action: 'write', description: 'Send team messages', category: 'communication' },
  { id: 'communication:admin', name: 'Admin Channels', resource: 'communication', action: 'admin', description: 'Manage communication channels', category: 'communication' },
  
  // Admin permissions
  { id: 'user:admin', name: 'User Admin', resource: 'user', action: 'admin', description: 'Full user administration', category: 'admin' },
  { id: 'system:admin', name: 'System Admin', resource: 'system', action: 'admin', description: 'System administration', category: 'admin' }
]

export const CONTRIBUTION_TYPES = [
  { value: 'code', label: 'Code', icon: '💻', description: 'Programming and development work' },
  { value: 'design', label: 'Design', icon: '🎨', description: 'UI/UX design and visual work' },
  { value: 'documentation', label: 'Documentation', icon: '📝', description: 'Writing and documentation' },
  { value: 'meeting', label: 'Meeting', icon: '🤝', description: 'Team meetings and discussions' },
  { value: 'review', label: 'Review', icon: '👀', description: 'Code review and feedback' },
  { value: 'other', label: 'Other', icon: '🔧', description: 'Other contributions' }
] as const

export const GOAL_PRIORITIES = [
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800', description: 'Nice to have' },
  { value: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-800', description: 'Important' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800', description: 'Very important' },
  { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800', description: 'Must have' }
] as const

export const GOAL_STATUSES = [
  { value: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-800', description: 'Being planned' },
  { value: 'active', label: 'Active', color: 'bg-blue-100 text-blue-800', description: 'In progress' },
  { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800', description: 'Finished' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800', description: 'Cancelled' }
] as const

export const ACTIVITY_TYPES = [
  { value: 'invitation', label: 'Invitation', icon: '📨', description: 'Team invitation sent' },
  { value: 'join', label: 'Join', icon: '✅', description: 'Member joined team' },
  { value: 'leave', label: 'Leave', icon: '👋', description: 'Member left team' },
  { value: 'role_change', label: 'Role Change', icon: '🔄', description: 'Member role changed' },
  { value: 'goal_created', label: 'Goal Created', icon: '🎯', description: 'New goal created' },
  { value: 'goal_completed', label: 'Goal Completed', icon: '🏆', description: 'Goal completed' },
  { value: 'contribution', label: 'Contribution', icon: '💪', description: 'New contribution added' },
  { value: 'meeting', label: 'Meeting', icon: '🤝', description: 'Team meeting held' },
  { value: 'announcement', label: 'Announcement', icon: '📢', description: 'Team announcement' }
] as const

export const INVITATION_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800', description: 'Waiting for response' },
  { value: 'accepted', label: 'Accepted', color: 'bg-green-100 text-green-800', description: 'Invitation accepted' },
  { value: 'declined', label: 'Declined', color: 'bg-red-100 text-red-800', description: 'Invitation declined' },
  { value: 'expired', label: 'Expired', color: 'bg-gray-100 text-gray-800', description: 'Invitation expired' }
] as const

// Import the TeamRole type
import { TeamRole } from '../types/team-collaboration.types'
