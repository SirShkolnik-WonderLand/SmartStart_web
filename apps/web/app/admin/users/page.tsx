'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from '../../components/AppLayout'
import { apiCallWithAuth } from '../../utils/api'
import '../../styles/admin.css'

interface User {
  id: string
  email: string
  role: string
  name?: string
}

interface CommunityUser {
  id: string
  name: string
  email: string
  role: string
  avatar: string
  status: 'active' | 'inactive' | 'pending' | 'suspended'
  joinDate: string
  lastActive: string
  totalContributions: number
  portfolioValue: number
  projects: Array<{
    id: string
    name: string
    role: string
    ownership: number
  }>
  skills: string[]
  reputation: number
  level: 'Owlet' | 'Night Watcher' | 'Wise Owl' | 'Sky Master'
  xp: number
  badges: string[]
}

export default function UserManagementPage() {
  const [user, setUser] = useState<User | null>(null)
  const [users, setUsers] = useState<CommunityUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<CommunityUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedUser, setSelectedUser] = useState<CommunityUser | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingUser, setEditingUser] = useState<Partial<CommunityUser>>({})
  const [authToken, setAuthToken] = useState<string>('')
  const router = useRouter()

  useEffect(() => {
    // Get user data from cookies
    const getUserFromCookies = () => {
      const cookies = document.cookie.split(';')
      const userCookie = cookies.find(cookie => cookie.trim().startsWith('user='))
      const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('authToken='))
      
      if (!userCookie || !tokenCookie) {
        router.push('/login')
        return
      }

      try {
        const userData = JSON.parse(userCookie.split('=')[1])
        setUser(userData)
        
        // Check if user is admin
        if (userData.role !== 'ADMIN' && userData.role !== 'SUPER_ADMIN') {
          router.push('/portfolio')
          return
        }
        
        const token = tokenCookie.split('=')[1]
        setAuthToken(token)
        
        // Fetch users data
        fetchUsersData(token)
      } catch (error) {
        console.error('Error parsing user data:', error)
        router.push('/login')
      }
    }

    getUserFromCookies()
  }, [router])

  const fetchUsersData = async (token: string) => {
    try {
      
      // Fetch users from API
      const data = await apiCallWithAuth('/admin/users', token)
      
      // Transform API data to match our interface
      const transformedUsers: CommunityUser[] = (data.users || []).map((apiUser: any) => ({
        id: apiUser.id,
        name: apiUser.name || apiUser.email.split('@')[0],
        email: apiUser.email,
        role: apiUser.role,
        avatar: apiUser.name ? apiUser.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'U',
        status: apiUser.status?.toLowerCase() || 'active',
        joinDate: apiUser.createdAt || '2023-01-01',
        lastActive: apiUser.lastActive || new Date().toISOString(),
        totalContributions: apiUser.totalContributions || 0,
        portfolioValue: apiUser.portfolioValue || 0,
        projects: apiUser.projects || [],
        skills: apiUser.skills || [],
        reputation: apiUser.reputation || 0,
        level: apiUser.level || 'Owlet',
        xp: apiUser.xp || 0,
        badges: apiUser.badges || []
      }))
      
      setUsers(transformedUsers)
      setFilteredUsers(transformedUsers)
    } catch (error) {
      console.error('Error fetching users:', error)
      // Fallback to mock data
      const mockUsers: CommunityUser[] = [
        {
          id: '1',
          name: 'Alice Johnson',
          email: 'alice@smartstart.com',
          role: 'SUPER_ADMIN',
          avatar: 'AJ',
          status: 'active',
          joinDate: '2023-01-01',
          lastActive: '2024-01-30T14:30:00Z',
          totalContributions: 45,
          portfolioValue: 125000,
          projects: [
            { id: '1', name: 'SmartStart Platform', role: 'OWNER', ownership: 40 },
            { id: '2', name: 'AI Marketing Tool', role: 'ADMIN', ownership: 25 }
          ],
          skills: ['Full-Stack Development', 'Product Management', 'Team Leadership'],
          reputation: 95,
          level: 'Sky Master',
          xp: 8500,
          badges: ['Founder', 'Security Expert', 'Community Leader']
        },
        {
          id: '2',
          name: 'Bob Chen',
          email: 'bob@demo.local',
          role: 'ADMIN',
          avatar: 'BC',
          status: 'active',
          joinDate: '2023-03-15',
          lastActive: '2024-01-30T13:15:00Z',
          totalContributions: 32,
          portfolioValue: 85000,
          projects: [
            { id: '1', name: 'SmartStart Platform', role: 'ADMIN', ownership: 20 },
            { id: '3', name: 'E-commerce Platform', role: 'OWNER', ownership: 35 }
          ],
          skills: ['Backend Development', 'DevOps', 'System Architecture'],
          reputation: 87,
          level: 'Wise Owl',
          xp: 7200,
          badges: ['Backend Guru', 'DevOps Master', 'Architect']
        },
        {
          id: '3',
          name: 'Carol Rodriguez',
          email: 'carol@demo.local',
          role: 'OWNER',
          avatar: 'CR',
          status: 'active',
          joinDate: '2023-05-20',
          lastActive: '2024-01-30T12:00:00Z',
          totalContributions: 28,
          portfolioValue: 65000,
          projects: [
            { id: '2', name: 'AI Marketing Tool', role: 'OWNER', ownership: 30 },
            { id: '4', name: 'Mobile App Framework', role: 'CONTRIBUTOR', ownership: 15 }
          ],
          skills: ['Frontend Development', 'UI/UX Design', 'Mobile Development'],
          reputation: 82,
          level: 'Wise Owl',
          xp: 6800,
          badges: ['Design Expert', 'Frontend Master', 'Mobile Developer']
        },
        {
          id: '4',
          name: 'David Kim',
          email: 'david@demo.local',
          role: 'CONTRIBUTOR',
          avatar: 'DK',
          status: 'active',
          joinDate: '2023-07-10',
          lastActive: '2024-01-30T11:45:00Z',
          totalContributions: 18,
          portfolioValue: 45000,
          projects: [
            { id: '2', name: 'AI Marketing Tool', role: 'CONTRIBUTOR', ownership: 10 },
            { id: '5', name: 'Data Analytics Platform', role: 'OWNER', ownership: 40 }
          ],
          skills: ['Data Science', 'Machine Learning', 'Python Development'],
          reputation: 75,
          level: 'Night Watcher',
          xp: 5200,
          badges: ['Data Scientist', 'ML Engineer', 'Python Expert']
        },
        {
          id: '5',
          name: 'Emma Wilson',
          email: 'emma@demo.local',
          role: 'MEMBER',
          avatar: 'EW',
          status: 'active',
          joinDate: '2023-09-01',
          lastActive: '2024-01-30T10:30:00Z',
          totalContributions: 12,
          portfolioValue: 30000,
          projects: [
            { id: '1', name: 'SmartStart Platform', role: 'CONTRIBUTOR', ownership: 5 },
            { id: '6', name: 'Content Hub', role: 'OWNER', ownership: 50 }
          ],
          skills: ['Marketing', 'Content Creation', 'Community Management'],
          reputation: 68,
          level: 'Night Watcher',
          xp: 3800,
          badges: ['Marketing Expert', 'Content Creator', 'Community Builder']
        },
        {
          id: '6',
          name: 'Frank Miller',
          email: 'frank@demo.local',
          role: 'VIEWER',
          avatar: 'FM',
          status: 'pending',
          joinDate: '2023-11-15',
          lastActive: '2024-01-29T15:30:00Z',
          totalContributions: 0,
          portfolioValue: 0,
          projects: [
            { id: '1', name: 'SmartStart Platform', role: 'VIEWER', ownership: 0 }
          ],
          skills: ['Business Development', 'Sales', 'Partnerships'],
          reputation: 25,
          level: 'Owlet',
          xp: 500,
          badges: ['New Member']
        }
      ]
      
      setUsers(mockUsers)
      setFilteredUsers(mockUsers)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Filter users based on search and filters
    let filtered = users

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter)
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter)
    }

    setFilteredUsers(filtered)
  }, [users, searchTerm, roleFilter, statusFilter])

  const handleEditUser = (user: CommunityUser) => {
    setSelectedUser(user)
    setEditingUser({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    })
    setShowEditModal(true)
  }

  const handleSaveUser = async () => {
    if (!editingUser.id) return
    
    // Mock update - real implementation will call API
    setUsers(prev => 
      prev.map(user => 
        user.id === editingUser.id 
          ? { ...user, ...editingUser }
          : user
      )
    )
    
    setShowEditModal(false)
    setEditingUser({})
    setSelectedUser(null)
  }

  const handleSuspendUser = async (userId: string) => {
    // Mock suspend - real implementation will call API
    setUsers(prev => 
      prev.map(user => 
        user.id === userId 
          ? { ...user, status: 'suspended' as const }
          : user
      )
    )
  }

  const handleActivateUser = async (userId: string) => {
    // Mock activate - real implementation will call API
    setUsers(prev => 
      prev.map(user => 
        user.id === userId 
          ? { ...user, status: 'active' as const }
          : user
      )
    )
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'role-super-admin'
      case 'ADMIN': return 'role-admin'
      case 'OWNER': return 'role-owner'
      case 'CONTRIBUTOR': return 'role-contributor'
      case 'MEMBER': return 'role-member'
      case 'VIEWER': return 'role-viewer'
      default: return 'role-default'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'status-active'
      case 'inactive': return 'status-inactive'
      case 'pending': return 'status-pending'
      case 'suspended': return 'status-suspended'
      default: return 'status-default'
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Sky Master': return 'level-sky-master'
      case 'Wise Owl': return 'level-wise-owl'
      case 'Night Watcher': return 'level-night-watcher'
      case 'Owlet': return 'level-owlet'
      default: return 'level-default'
    }
  }

  if (loading) {
    return (
      <AppLayout currentPage="/admin">
        <div className="loading">
          <div className="loading-spinner"></div>
          <span>Loading User Management...</span>
        </div>
      </AppLayout>
    )
  }

  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return (
      <AppLayout currentPage="/admin">
        <div className="error-container">
          <h3>Access Denied</h3>
          <p>Admin access required to manage users.</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout currentPage="/admin">
      <div className="page-header">
        <h1 className="page-title">User Management</h1>
        <p className="page-subtitle">Manage community members, roles, and permissions</p>
      </div>

      {/* Search and Filters */}
      <div className="search-filters-section">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search users by name, email, or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filters-container">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Roles</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="ADMIN">Admin</option>
            <option value="OWNER">Owner</option>
            <option value="CONTRIBUTOR">Contributor</option>
            <option value="MEMBER">Member</option>
            <option value="VIEWER">Viewer</option>
          </select>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Level</th>
              <th>Contributions</th>
              <th>Portfolio Value</th>
              <th>Last Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className="user-info">
                    <div className="user-avatar">{user.avatar}</div>
                    <div className="user-details">
                      <div className="user-name">{user.name}</div>
                      <div className="user-email">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`role-badge ${getRoleColor(user.role)}`}>
                    {user.role.replace('_', ' ')}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${getStatusColor(user.status)}`}>
                    {user.status}
                  </span>
                </td>
                <td>
                  <span className={`level-badge ${getLevelColor(user.level)}`}>
                    {user.level}
                  </span>
                </td>
                <td>
                  <div className="contribution-info">
                    <span className="contribution-count">{user.totalContributions}</span>
                    <span className="contribution-label">contributions</span>
                  </div>
                </td>
                <td>
                  <div className="portfolio-info">
                    <span className="portfolio-value">${user.portfolioValue.toLocaleString()}</span>
                  </div>
                </td>
                <td>
                  <span className="last-active">
                    {new Date(user.lastActive).toLocaleDateString()}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="btn btn-sm btn-primary"
                    >
                      Edit
                    </button>
                    {user.status === 'active' ? (
                      <button
                        onClick={() => handleSuspendUser(user.id)}
                        className="btn btn-sm btn-warning"
                      >
                        Suspend
                      </button>
                    ) : (
                      <button
                        onClick={() => handleActivateUser(user.id)}
                        className="btn btn-sm btn-success"
                      >
                        Activate
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3 className="empty-title">No users found</h3>
          <p className="empty-description">
            Try adjusting your search terms or filters.
          </p>
        </div>
      )}

      {/* Results Summary */}
      <div className="results-summary">
        <p>Showing {filteredUsers.length} of {users.length} users</p>
      </div>

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Edit User: {selectedUser.name}</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="edit-name" className="form-label">Name</label>
                <input
                  type="text"
                  id="edit-name"
                  value={editingUser.name || ''}
                  onChange={(e) => setEditingUser(prev => ({ ...prev, name: e.target.value }))}
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-email" className="form-label">Email</label>
                <input
                  type="email"
                  id="edit-email"
                  value={editingUser.email || ''}
                  onChange={(e) => setEditingUser(prev => ({ ...prev, email: e.target.value }))}
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-role" className="form-label">Role</label>
                <select
                  id="edit-role"
                  value={editingUser.role || ''}
                  onChange={(e) => setEditingUser(prev => ({ ...prev, role: e.target.value }))}
                  className="form-select"
                >
                  <option value="SUPER_ADMIN">Super Admin</option>
                  <option value="ADMIN">Admin</option>
                  <option value="OWNER">Owner</option>
                  <option value="CONTRIBUTOR">Contributor</option>
                  <option value="MEMBER">Member</option>
                  <option value="VIEWER">Viewer</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-status" className="form-label">Status</label>
                <select
                  id="edit-status"
                  value={editingUser.status || ''}
                  onChange={(e) => setEditingUser(prev => ({ ...prev, status: e.target.value as any }))}
                  className="form-select"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                onClick={() => setShowEditModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUser}
                className="btn btn-primary"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
