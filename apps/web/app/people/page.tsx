'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from '../components/AppLayout'
import { apiCallWithAuth } from '../utils/api'
import '../styles/people.css'

interface User {
  id: string
  email: string
  role: string
  name?: string
}

interface CommunityMember {
  id: string
  name: string
  email: string
  role: string
  avatar: string
  skills: string[]
  projects: Array<{
    id: string
    name: string
    role: string
    ownership: number
  }>
  portfolioValue: number
  totalContributions: number
  joinDate: string
  status: 'active' | 'inactive' | 'pending'
  bio: string
  location: string
  expertise: string[]
}

export default function PeoplePage() {
  const [user, setUser] = useState<User | null>(null)
  const [members, setMembers] = useState<CommunityMember[]>([])
  const [filteredMembers, setFilteredMembers] = useState<CommunityMember[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [authToken, setAuthToken] = useState<string>('')
  const router = useRouter()

  useEffect(() => {
    // Get user data from cookies
    const getUserFromCookies = async () => {
      const cookies = document.cookie.split(';')
      const userCookie = cookies.find(cookie => cookie.trim().startsWith('user='))
      const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('authToken='))
      
      if (!userCookie || !tokenCookie) {
        router.push('/login')
        return
      }

      try {
        const userData = JSON.parse(userCookie.split('=')[1])
        const token = tokenCookie.split('=')[1]
        setUser(userData)
        setAuthToken(token)
        
        // Fetch community members data
        await fetchMembersData(token)
      } catch (error) {
        console.error('Error parsing user data:', error)
        router.push('/login')
      }
    }

    getUserFromCookies()
  }, [router])

  const fetchMembersData = async (token: string) => {
    try {
      // Fetch real community members data from API
      const membersResponse = await apiCallWithAuth('/users', token)
      
      if (membersResponse && Array.isArray(membersResponse)) {
        // Transform API data to match our interface
        const realMembers: CommunityMember[] = membersResponse.map((member: any) => ({
          id: member.id,
          name: member.name || 'Unknown User',
          email: member.email,
          role: member.role || 'MEMBER',
          avatar: member.name ? member.name.substring(0, 2).toUpperCase() : 'U',
          skills: [], // Will be populated from user skills API if available
          projects: [], // Will be populated from project memberships API if available
          portfolioValue: 0, // Will be computed from portfolio data
          totalContributions: 0, // Will be computed from contributions data
          joinDate: member.createdAt || new Date().toISOString(),
          status: 'active', // Default to active for now
          bio: member.bio || 'No bio available',
          location: member.location || 'Location not specified',
          expertise: [] // Will be populated from user skills API if available
        }))
        
        setMembers(realMembers)
        setFilteredMembers(realMembers)
      } else {
        // Fallback to empty array if API fails
        setMembers([])
        setFilteredMembers([])
      }
    } catch (error) {
      console.error('Error fetching members data:', error)
      // Fallback to empty array if API fails
      setMembers([])
      setFilteredMembers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Filter members based on search and filters
    let filtered = members

    if (searchTerm) {
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(member => member.role === roleFilter)
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(member => member.status === statusFilter)
    }

    setFilteredMembers(filtered)
  }, [members, searchTerm, roleFilter, statusFilter])

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
      default: return 'status-default'
    }
  }

  if (loading) {
    return (
      <AppLayout currentPage="/people">
        <div className="loading">
          <div className="loading-spinner"></div>
          <span>Loading Community Members...</span>
        </div>
      </AppLayout>
    )
  }

  if (!user) {
    return (
      <AppLayout currentPage="/people">
        <div className="error-container">
          <h3>Access Denied</h3>
          <p>Please log in to view community members.</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout currentPage="/people">
      <div className="page-header">
        <h1 className="page-title">Community Members</h1>
        <p className="page-subtitle">Meet the amazing people building SmartStart together</p>
      </div>

      {/* Search and Filters */}
      <div className="search-filters-section">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search members by name, email, or skills..."
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
          </select>
        </div>
      </div>

      {/* Members Grid */}
      <div className="members-grid">
        {filteredMembers.map((member) => (
          <div key={member.id} className="member-card">
            <div className="member-header">
              <div className="member-avatar">
                {member.avatar}
              </div>
              <div className="member-info">
                <h3 className="member-name">{member.name}</h3>
                <p className="member-email">{member.email}</p>
              </div>
              <div className="member-badges">
                <span className={`role-badge ${getRoleColor(member.role)}`}>
                  {member.role.replace('_', ' ')}
                </span>
                <span className={`status-badge ${getStatusColor(member.status)}`}>
                  {member.status}
                </span>
              </div>
            </div>

            <div className="member-bio">
              <p>{member.bio}</p>
            </div>

            <div className="member-details">
              <div className="detail-item">
                <span className="detail-label">Location:</span>
                <span className="detail-value">{member.location}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Joined:</span>
                <span className="detail-value">{new Date(member.joinDate).toLocaleDateString()}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Contributions:</span>
                <span className="detail-value">{member.totalContributions}</span>
              </div>
            </div>

            <div className="member-stats">
              <div className="stat-item">
                <div className="stat-value">${member.portfolioValue.toLocaleString()}</div>
                <div className="stat-label">Portfolio Value</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{member.projects.length}</div>
                <div className="stat-label">Active Projects</div>
              </div>
            </div>

            <div className="member-skills">
              <h4 className="skills-title">Skills & Expertise</h4>
              <div className="skills-list">
                {member.expertise.map((skill, index) => (
                  <span key={index} className="skill-tag">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="member-projects">
              <h4 className="projects-title">Current Projects</h4>
              <div className="projects-list">
                {member.projects.map((project) => (
                  <div key={project.id} className="project-item">
                    <span className="project-name">{project.name}</span>
                    <span className="project-role">{project.role}</span>
                    {project.ownership > 0 && (
                      <span className="project-ownership">{project.ownership}%</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredMembers.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3 className="empty-title">No members found</h3>
          <p className="empty-description">
            Try adjusting your search terms or filters.
          </p>
        </div>
      )}

      {/* Results Summary */}
      <div className="results-summary">
        <p>Showing {filteredMembers.length} of {members.length} community members</p>
      </div>
    </AppLayout>
  )
}
