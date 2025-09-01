'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  User, 
  Crown, 
  Shield, 
  Star, 
  MapPin, 
  Linkedin, 
  Twitter, 
  Github, 
  Globe,
  Award,
  TrendingUp,
  Briefcase,
  Calendar,
  Mail,
  ArrowUpRight,
  Settings,
  Database,
  Wifi,
  Shield as ShieldIcon,
  Clock,
  Battery,
  AlertCircle,
  BarChart3
} from 'lucide-react';

interface UserProfile {
  id: string;
  bio: string;
  location: string;
  linkedinUrl: string;
  twitterUrl: string;
  githubUrl: string;
  websiteUrl: string;
  avatarUrl: string;
}

interface UserSkill {
  skill: {
    name: string;
    category: string;
    description?: string;
  };
  level: number;
  verified: boolean;
  endorsements: number;
}

interface UserBadge {
  badge: {
    name: string;
    description: string;
    icon: string;
    category?: string;
  };
  earnedAt: string;
}

interface UserData {
  id: string;
  email: string;
  name: string;
  level: string;
  xp: number;
  reputation: number;
  totalPortfolioValue: number;
  totalEquityOwned: number;
  activeProjectsCount: number;
  totalContributions: number;
  portfolioDiversity: number;
  lastEquityEarned: string;
  lastActive: string;
  createdAt: string;
  profile: UserProfile;
  userSkills: UserSkill[];
  userBadges: UserBadge[];
  projectMemberships: {
    role: string;
    project: {
      name: string;
    };
  }[];
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data.users || []);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
      // Fallback to mock data
      setUsers(mockUsers);
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'OWNER':
        return <Crown className="w-4 h-4 text-purple-500" />;
      case 'MEMBER':
        return <Shield className="w-4 h-4 text-blue-500" />;
      case 'CONTRIBUTOR':
        return <Star className="w-4 h-4 text-green-500" />;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'SKY_MASTER':
        return 'text-purple-600 bg-purple-100';
      case 'WISE_OWL':
        return 'text-blue-600 bg-blue-100';
      case 'BUILDER':
        return 'text-green-600 bg-green-100';
      case 'NIGHT_WATCHER':
        return 'text-orange-600 bg-orange-100';
      case 'OWLET':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-800 rounded-lg p-6 h-64"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">
              <Users size={20} />
            </div>
            <div className="logo-text">
              <h1>SmartStart HUB</h1>
              <p>AliceSolutions Ventures • Udi Shkolnik</p>
            </div>
          </div>
          
          <div className="status-indicators">
            <div className="status-item">
              <div className="status-dot online"></div>
              <span>System Online</span>
            </div>
            <div className="status-item">
              <Database size={16} />
              <span>DB Connected</span>
            </div>
            <div className="status-item">
              <Wifi size={16} />
              <span>Network Stable</span>
            </div>
            <div className="status-item">
              <ShieldIcon size={16} />
              <span>Security Active</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={fetchUsers}
              className="btn btn-ghost btn-sm"
              title="Refresh data"
            >
              <ArrowUpRight size={16} />
            </button>
            <a 
              href="/"
              className="btn btn-ghost btn-sm"
              title="Dashboard"
            >
              <BarChart3 size={16} />
            </a>
            <button className="btn btn-ghost btn-sm">
              <Settings size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="error-banner">
          <AlertCircle size={20} className="icon" />
          <p className="error-message">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="error-close"
          >
            ×
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="container py-6">
        {/* Status Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-tertiary">
              <Clock size={16} />
              <span>Last updated: {lastRefresh.toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="status-dot online"></div>
              <span>System Health: GOOD</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-tertiary">
            <Battery size={16} />
            <span>Performance: Excellent</span>
          </div>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-600 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-semibold text-white">User Management</h2>
          </div>
          <p className="text-gray-300">
            Manage team members, roles, and equity distribution across all projects
          </p>
        </div>

        {/* Stats Overview */}
        <section className="mb-8">
          <div className="stats-grid">
            <div className="stat-card positive">
              <div className="stat-icon">
                <Users size={20} />
              </div>
              <div className="stat-content">
                <div className="stat-value">{users.length}</div>
                <div className="stat-label">Total Users</div>
              </div>
            </div>
            
            <div className="stat-card positive">
              <div className="stat-icon">
                <Briefcase size={20} />
              </div>
              <div className="stat-content">
                <div className="stat-value">
                  {users.reduce((sum, user) => sum + user.activeProjectsCount, 0)}
                </div>
                <div className="stat-label">Active Projects</div>
              </div>
            </div>
            
            <div className="stat-card positive">
              <div className="stat-icon">
                <TrendingUp size={20} />
              </div>
              <div className="stat-content">
                <div className="stat-value">
                  {users.reduce((sum, user) => sum + user.totalEquityOwned, 0).toFixed(1)}%
                </div>
                <div className="stat-label">Total Equity</div>
              </div>
            </div>
            
            <div className="stat-card positive">
              <div className="stat-icon">
                <Award size={20} />
              </div>
              <div className="stat-content">
                <div className="stat-value">
                  {users.reduce((sum, user) => sum + user.xp, 0)}
                </div>
                <div className="stat-label">Total XP</div>
              </div>
            </div>
          </div>
        </section>

        {/* Users Grid */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <User size={24} />
            <h2 className="text-2xl font-semibold text-white">Team Members</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {users.map((user) => (
              <div key={user.id} className="card">
                {/* User Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{user.name}</h3>
                      <div className="flex items-center gap-2">
                        {getRoleIcon(user.projectMemberships[0]?.role || 'MEMBER')}
                        <span className="text-sm text-gray-400 capitalize">
                          {user.projectMemberships[0]?.role?.toLowerCase().replace('_', ' ') || 'Member'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(user.level)}`}>
                      {user.level.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 text-gray-400 mb-2">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                  {user.profile?.location && (
                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{user.profile.location}</span>
                    </div>
                  )}
                </div>

                {/* Bio */}
                {user.profile?.bio && (
                  <p className="text-gray-300 text-sm mb-4">{user.profile.bio}</p>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="stat-mini">
                    <div className="stat-mini-label">Portfolio Value</div>
                    <div className="stat-mini-value">{formatCurrency(user.totalPortfolioValue)}</div>
                  </div>
                  <div className="stat-mini">
                    <div className="stat-mini-label">Equity Owned</div>
                    <div className="stat-mini-value">{user.totalEquityOwned.toFixed(1)}%</div>
                  </div>
                  <div className="stat-mini">
                    <div className="stat-mini-label">XP</div>
                    <div className="stat-mini-value">{user.xp}</div>
                  </div>
                  <div className="stat-mini">
                    <div className="stat-mini-label">Reputation</div>
                    <div className="stat-mini-value">{user.reputation}</div>
                  </div>
                </div>

                {/* Skills */}
                {user.userSkills && user.userSkills.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Top Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {user.userSkills.slice(0, 3).map((userSkill, index) => (
                        <span key={index} className="badge badge-primary">
                          {userSkill.skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Badges */}
                {user.userBadges && user.userBadges.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Recent Badges</h4>
                    <div className="flex flex-wrap gap-2">
                      {user.userBadges.slice(0, 3).map((userBadge, index) => (
                        <span key={index} className="badge badge-secondary">
                          {userBadge.badge.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Social Links */}
                {user.profile && (user.profile.linkedinUrl || user.profile.twitterUrl || user.profile.githubUrl) && (
                  <div className="flex gap-2 mb-4">
                    {user.profile.linkedinUrl && (
                      <a href={user.profile.linkedinUrl} target="_blank" rel="noopener noreferrer" 
                         className="btn btn-sm btn-outline">
                        <Linkedin className="w-4 h-4" />
                      </a>
                    )}
                    {user.profile.twitterUrl && (
                      <a href={user.profile.twitterUrl} target="_blank" rel="noopener noreferrer"
                         className="btn btn-sm btn-outline">
                        <Twitter className="w-4 h-4" />
                      </a>
                    )}
                    {user.profile.githubUrl && (
                      <a href={user.profile.githubUrl} target="_blank" rel="noopener noreferrer"
                         className="btn btn-sm btn-outline">
                        <Github className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                )}

                {/* Member Since */}
                <div className="pt-4 border-t border-gray-700">
                  <div className="flex items-center gap-2 text-gray-400 text-xs">
                    <Calendar className="w-3 h-3" />
                    <span>Member since {formatDate(user.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

// Mock data for fallback
const mockUsers: UserData[] = [
  {
    id: '1',
    email: 'alice@alicesolutions.com',
    name: 'Alice Chen',
    level: 'SKY_MASTER',
    xp: 1250,
    reputation: 85,
    totalPortfolioValue: 175000,
    totalEquityOwned: 35,
    activeProjectsCount: 1,
    totalContributions: 12,
    portfolioDiversity: 6,
    lastEquityEarned: '2025-08-31T00:00:00Z',
    lastActive: '2025-08-31T00:00:00Z',
    createdAt: '2025-01-01T00:00:00Z',
    profile: {
      id: '1',
      bio: 'Founder and CEO of AliceSolutions Ventures, passionate about building innovative platforms.',
      location: 'San Francisco, CA',
      linkedinUrl: 'https://linkedin.com/in/alicechen',
      twitterUrl: 'https://twitter.com/alicechen',
      githubUrl: 'https://github.com/alicechen',
      websiteUrl: 'https://alicesolutions.com',
      avatarUrl: ''
    },
    userSkills: [
      { skill: { name: 'Leadership', category: 'Business', description: 'Strategic leadership skills' }, level: 5, verified: true, endorsements: 12 },
      { skill: { name: 'Strategy', category: 'Business', description: 'Strategic planning and execution' }, level: 5, verified: true, endorsements: 8 },
      { skill: { name: 'Business Development', category: 'Business', description: 'Business growth and partnerships' }, level: 5, verified: true, endorsements: 15 }
    ],
    userBadges: [
      { badge: { name: '🚀 MVP Launcher', description: 'Successfully launched an MVP', icon: '🚀', category: 'Achievement' }, earnedAt: '2025-08-31T00:00:00Z' },
      { badge: { name: '💼 Project Owner', description: 'Owned and managed a project', icon: '💼', category: 'Leadership' }, earnedAt: '2025-08-31T00:00:00Z' },
      { badge: { name: '🎯 Goal Setter', description: 'Set and achieved ambitious goals', icon: '🎯', category: 'Planning' }, earnedAt: '2025-08-31T00:00:00Z' }
    ],
    projectMemberships: [{ role: 'OWNER', project: { name: 'SmartStart Platform' } }]
  },
  {
    id: '2',
    email: 'brian.johnson@smartstart.com',
    name: 'Brian Johnson',
    level: 'BUILDER',
    xp: 180,
    reputation: 85,
    totalPortfolioValue: 175000,
    totalEquityOwned: 35,
    activeProjectsCount: 1,
    totalContributions: 18,
    portfolioDiversity: 1,
    lastEquityEarned: '2025-08-31T00:00:00Z',
    lastActive: '2025-08-31T00:00:00Z',
    createdAt: '2025-06-01T00:00:00Z',
    profile: {
      id: '2',
      bio: 'Experienced entrepreneur and startup founder with a passion for building innovative platforms.',
      location: 'San Francisco, CA',
      linkedinUrl: 'https://linkedin.com/in/brianjohnson',
      twitterUrl: 'https://twitter.com/brianjohnson',
      githubUrl: 'https://github.com/brianjohnson',
      websiteUrl: '',
      avatarUrl: ''
    },
    userSkills: [
      { skill: { name: 'Leadership', category: 'Business', description: 'Team leadership and management' }, level: 3, verified: true, endorsements: 5 },
      { skill: { name: 'Strategy', category: 'Business', description: 'Strategic planning and execution' }, level: 3, verified: true, endorsements: 4 },
      { skill: { name: 'Business Development', category: 'Business', description: 'Business growth and partnerships' }, level: 3, verified: true, endorsements: 6 }
    ],
    userBadges: [
      { badge: { name: '🚀 MVP Launcher', description: 'Successfully launched an MVP', icon: '🚀', category: 'Achievement' }, earnedAt: '2025-08-31T00:00:00Z' },
      { badge: { name: '💼 Project Owner', description: 'Owned and managed a project', icon: '💼', category: 'Leadership' }, earnedAt: '2025-08-31T00:00:00Z' },
      { badge: { name: '🎯 Goal Setter', description: 'Set and achieved ambitious goals', icon: '🎯', category: 'Planning' }, earnedAt: '2025-08-31T00:00:00Z' }
    ],
    projectMemberships: [{ role: 'OWNER', project: { name: 'SmartStart Platform' } }]
  },
  {
    id: '3',
    email: 'vlad.petrov@smartstart.com',
    name: 'Vlad Petrov',
    level: 'WISE_OWL',
    xp: 320,
    reputation: 92,
    totalPortfolioValue: 75000,
    totalEquityOwned: 15,
    activeProjectsCount: 1,
    totalContributions: 32,
    portfolioDiversity: 1,
    lastEquityEarned: '2025-08-31T00:00:00Z',
    lastActive: '2025-08-31T00:00:00Z',
    createdAt: '2025-07-01T00:00:00Z',
    profile: {
      id: '3',
      bio: 'Full-stack developer and technical architect with expertise in blockchain and smart contracts.',
      location: 'Kyiv, Ukraine',
      linkedinUrl: 'https://linkedin.com/in/vladpetrov',
      twitterUrl: 'https://twitter.com/vladpetrov',
      githubUrl: 'https://github.com/vladpetrov',
      websiteUrl: '',
      avatarUrl: ''
    },
    userSkills: [
      { skill: { name: 'Full-Stack Development', category: 'Technology', description: 'Full-stack web development' }, level: 5, verified: true, endorsements: 20 },
      { skill: { name: 'Blockchain', category: 'Technology', description: 'Blockchain and cryptocurrency development' }, level: 5, verified: true, endorsements: 15 },
      { skill: { name: 'Smart Contracts', category: 'Technology', description: 'Smart contract development and deployment' }, level: 5, verified: true, endorsements: 18 }
    ],
    userBadges: [
      { badge: { name: '⚡ Code Ninja', description: 'Exceptional coding skills', icon: '⚡', category: 'Technical' }, earnedAt: '2025-08-31T00:00:00Z' },
      { badge: { name: '🔗 Blockchain Expert', description: 'Expert in blockchain technology', icon: '🔗', category: 'Technical' }, earnedAt: '2025-08-31T00:00:00Z' },
      { badge: { name: '🛠️ Tech Lead', description: 'Led technical teams successfully', icon: '🛠️', category: 'Leadership' }, earnedAt: '2025-08-31T00:00:00Z' }
    ],
    projectMemberships: [{ role: 'MEMBER', project: { name: 'SmartStart Platform' } }]
  },
  {
    id: '4',
    email: 'andrii.kovalenko@smartstart.com',
    name: 'Andrii Kovalenko',
    level: 'OWLET',
    xp: 95,
    reputation: 67,
    totalPortfolioValue: 50000,
    totalEquityOwned: 10,
    activeProjectsCount: 1,
    totalContributions: 9,
    portfolioDiversity: 1,
    lastEquityEarned: '2025-08-31T00:00:00Z',
    lastActive: '2025-08-31T00:00:00Z',
    createdAt: '2025-08-01T00:00:00Z',
    profile: {
      id: '4',
      bio: 'Product manager and UX designer focused on creating user-centric solutions.',
      location: 'Lviv, Ukraine',
      linkedinUrl: 'https://linkedin.com/in/andriikovalenko',
      twitterUrl: 'https://twitter.com/andriikovalenko',
      githubUrl: 'https://github.com/andriikovalenko',
      websiteUrl: '',
      avatarUrl: ''
    },
    userSkills: [
      { skill: { name: 'Product Management', category: 'Business', description: 'Product strategy and management' }, level: 3, verified: true, endorsements: 8 },
      { skill: { name: 'UX Design', category: 'Design', description: 'User experience design' }, level: 3, verified: true, endorsements: 6 },
      { skill: { name: 'User Research', category: 'Research', description: 'User research and insights' }, level: 3, verified: true, endorsements: 7 }
    ],
    userBadges: [
      { badge: { name: '🎨 Design Thinker', description: 'Creative design thinking', icon: '🎨', category: 'Design' }, earnedAt: '2025-08-31T00:00:00Z' },
      { badge: { name: '📊 Data Analyst', description: 'Data analysis and insights', icon: '📊', category: 'Analytics' }, earnedAt: '2025-08-31T00:00:00Z' },
      { badge: { name: '🤝 Team Player', description: 'Excellent team collaboration', icon: '🤝', category: 'Collaboration' }, earnedAt: '2025-08-31T00:00:00Z' }
    ],
    projectMemberships: [{ role: 'MEMBER', project: { name: 'SmartStart Platform' } }]
  }
];
