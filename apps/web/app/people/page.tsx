'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from '../components/AppLayout'
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
        
        // Fetch community members data
        fetchMembersData()
      } catch (error) {
        console.error('Error parsing user data:', error)
        router.push('/login')
      }
    }

    getUserFromCookies()
  }, [router])

  const fetchMembersData = () => {
    // Mock community members data
    const mockMembers: CommunityMember[] = [
      {
        id: '1',
        name: 'Alice Johnson',
        email: 'alice@smartstart.com',
        role: 'SUPER_ADMIN',
        avatar: 'AJ',
        skills: ['Full-Stack Development', 'Product Management', 'Team Leadership'],
        projects: [
          { id: '1', name: 'SmartStart Platform', role: 'OWNER', ownership: 40 },
          { id: '2', name: 'AI Marketing Tool', role: 'ADMIN', ownership: 25 }
        ],
        portfolioValue: 125000,
        totalContributions: 45,
        joinDate: '2023-01-01',
        status: 'active',
        bio: 'Founder and visionary behind SmartStart. Passionate about building communities that create value together.',
        location: 'Toronto, Canada',
        expertise: ['React', 'Node.js', 'PostgreSQL', 'AWS', 'Product Strategy']
      },
      {
        id: '2',
        name: 'Bob Chen',
        email: 'bob@demo.local',
        role: 'ADMIN',
        avatar: 'BC',
        skills: ['Backend Development', 'DevOps', 'System Architecture'],
        projects: [
          { id: '1', name: 'SmartStart Platform', role: 'ADMIN', ownership: 20 },
          { id: '3', name: 'E-commerce Platform', role: 'OWNER', ownership: 35 }
        ],
        portfolioValue: 85000,
        totalContributions: 32,
        joinDate: '2023-03-15',
        status: 'active',
        bio: 'Senior backend developer with expertise in scalable systems and cloud infrastructure.',
        location: 'Vancouver, Canada',
        expertise: ['Python', 'Django', 'Docker', 'Kubernetes', 'PostgreSQL']
      },
      {
        id: '3',
        name: 'Carol Rodriguez',
        email: 'carol@demo.local',
        role: 'OWNER',
        avatar: 'CR',
        skills: ['Frontend Development', 'UI/UX Design', 'Mobile Development'],
        projects: [
          { id: '2', name: 'AI Marketing Tool', role: 'OWNER', ownership: 30 },
          { id: '4', name: 'Mobile App Framework', role: 'CONTRIBUTOR', ownership: 15 }
        ],
        portfolioValue: 65000,
        totalContributions: 28,
        joinDate: '2023-05-20',
        status: 'active',
        bio: 'Creative frontend developer and designer. Love building beautiful, user-friendly interfaces.',
        location: 'Montreal, Canada',
        expertise: ['React', 'TypeScript', 'Figma', 'React Native', 'CSS']
      },
      {
        id: '4',
        name: 'David Kim',
        email: 'david@demo.local',
        role: 'CONTRIBUTOR',
        avatar: 'DK',
        skills: ['Data Science', 'Machine Learning', 'Python Development'],
        projects: [
          { id: '2', name: 'AI Marketing Tool', role: 'CONTRIBUTOR', ownership: 10 },
          { id: '5', name: 'Data Analytics Platform', role: 'OWNER', ownership: 40 }
        ],
        portfolioValue: 45000,
        totalContributions: 18,
        joinDate: '2023-07-10',
        status: 'active',
        bio: 'Data scientist and ML engineer. Passionate about turning data into actionable insights.',
        location: 'Calgary, Canada',
        expertise: ['Python', 'TensorFlow', 'Pandas', 'Scikit-learn', 'SQL']
      },
      {
        id: '5',
        name: 'Emma Wilson',
        email: 'emma@demo.local',
        role: 'MEMBER',
        avatar: 'EW',
        skills: ['Marketing', 'Content Creation', 'Community Management'],
        projects: [
          { id: '1', name: 'SmartStart Platform', role: 'CONTRIBUTOR', ownership: 5 },
          { id: '6', name: 'Content Hub', role: 'OWNER', ownership: 50 }
        ],
        portfolioValue: 30000,
        totalContributions: 12,
        joinDate: '2023-09-01',
        status: 'active',
        bio: 'Marketing specialist and community builder. Love connecting people and growing communities.',
        location: 'Ottawa, Canada',
        expertise: ['Digital Marketing', 'Content Strategy', 'Social Media', 'SEO', 'Analytics']
      },
      {
        id: '6',
        name: 'Frank Miller',
        email: 'frank@demo.local',
        role: 'VIEWER',
        avatar: 'FM',
        skills: ['Business Development', 'Sales', 'Partnerships'],
        projects: [
          { id: '1', name: 'SmartStart Platform', role: 'VIEWER', ownership: 0 }
        ],
        portfolioValue: 0,
        totalContributions: 0,
        joinDate: '2023-11-15',
        status: 'pending',
        bio: 'Business development professional interested in exploring collaboration opportunities.',
        location: 'Edmonton, Canada',
        expertise: ['Business Strategy', 'Sales', 'Partnerships', 'Market Research']
      }
    ]
    
    setMembers(mockMembers)
    setFilteredMembers(mockMembers)
    setLoading(false)
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
