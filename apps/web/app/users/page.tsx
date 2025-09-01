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
  Mail
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
  skillName: string;
  level: string;
  xp: number;
}

interface UserBadge {
  badgeName: string;
  earnedAt: string;
  xpReward: number;
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
  skills: UserSkill[];
  badges: UserBadge[];
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
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-600 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">User Management</h1>
          </div>
          <p className="text-gray-300">
            Manage team members, roles, and equity distribution across all projects
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-white">{users.length}</p>
              </div>
              <Users className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Projects</p>
                <p className="text-2xl font-bold text-white">
                  {users.reduce((sum, user) => sum + user.activeProjectsCount, 0)}
                </p>
              </div>
              <Briefcase className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Equity</p>
                <p className="text-2xl font-bold text-white">
                  {users.reduce((sum, user) => sum + user.totalEquityOwned, 0).toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total XP</p>
                <p className="text-2xl font-bold text-white">
                  {users.reduce((sum, user) => sum + user.xp, 0)}
                </p>
              </div>
              <Award className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {users.map((user) => (
            <div key={user.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-purple-500 transition-colors">
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
                <div className="bg-gray-700 rounded p-3">
                  <p className="text-gray-400 text-xs">Portfolio Value</p>
                  <p className="text-white font-semibold">{formatCurrency(user.totalPortfolioValue)}</p>
                </div>
                <div className="bg-gray-700 rounded p-3">
                  <p className="text-gray-400 text-xs">Equity Owned</p>
                  <p className="text-white font-semibold">{user.totalEquityOwned.toFixed(1)}%</p>
                </div>
                <div className="bg-gray-700 rounded p-3">
                  <p className="text-gray-400 text-xs">XP</p>
                  <p className="text-white font-semibold">{user.xp}</p>
                </div>
                <div className="bg-gray-700 rounded p-3">
                  <p className="text-gray-400 text-xs">Reputation</p>
                  <p className="text-white font-semibold">{user.reputation}</p>
                </div>
              </div>

              {/* Skills */}
              {user.skills && user.skills.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Top Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {user.skills.slice(0, 3).map((skill, index) => (
                      <span key={index} className="px-2 py-1 bg-purple-600 text-white text-xs rounded">
                        {skill.skillName}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Badges */}
              {user.badges && user.badges.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Recent Badges</h4>
                  <div className="flex flex-wrap gap-2">
                    {user.badges.slice(0, 3).map((badge, index) => (
                      <span key={index} className="px-2 py-1 bg-yellow-600 text-white text-xs rounded">
                        {badge.badgeName}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Social Links */}
              {user.profile && (user.profile.linkedinUrl || user.profile.twitterUrl || user.profile.githubUrl) && (
                <div className="flex gap-2">
                  {user.profile.linkedinUrl && (
                    <a href={user.profile.linkedinUrl} target="_blank" rel="noopener noreferrer" 
                       className="p-2 bg-blue-600 rounded hover:bg-blue-700 transition-colors">
                      <Linkedin className="w-4 h-4 text-white" />
                    </a>
                  )}
                  {user.profile.twitterUrl && (
                    <a href={user.profile.twitterUrl} target="_blank" rel="noopener noreferrer"
                       className="p-2 bg-blue-400 rounded hover:bg-blue-500 transition-colors">
                      <Twitter className="w-4 h-4 text-white" />
                    </a>
                  )}
                  {user.profile.githubUrl && (
                    <a href={user.profile.githubUrl} target="_blank" rel="noopener noreferrer"
                       className="p-2 bg-gray-600 rounded hover:bg-gray-700 transition-colors">
                      <Github className="w-4 h-4 text-white" />
                    </a>
                  )}
                </div>
              )}

              {/* Member Since */}
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="flex items-center gap-2 text-gray-400 text-xs">
                  <Calendar className="w-3 h-3" />
                  <span>Member since {formatDate(user.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="mt-8 text-center">
            <p className="text-red-400">{error}</p>
          </div>
        )}
      </div>
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
    skills: [
      { skillName: 'Leadership', level: 'EXPERT', xp: 500 },
      { skillName: 'Strategy', level: 'EXPERT', xp: 450 },
      { skillName: 'Business Development', level: 'EXPERT', xp: 400 }
    ],
    badges: [
      { badgeName: '🚀 MVP Launcher', earnedAt: '2025-08-31T00:00:00Z', xpReward: 50 },
      { badgeName: '💼 Project Owner', earnedAt: '2025-08-31T00:00:00Z', xpReward: 30 },
      { badgeName: '🎯 Goal Setter', earnedAt: '2025-08-31T00:00:00Z', xpReward: 20 }
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
    skills: [
      { skillName: 'Leadership', level: 'INTERMEDIATE', xp: 60 },
      { skillName: 'Strategy', level: 'INTERMEDIATE', xp: 60 },
      { skillName: 'Business Development', level: 'INTERMEDIATE', xp: 60 }
    ],
    badges: [
      { badgeName: '🚀 MVP Launcher', earnedAt: '2025-08-31T00:00:00Z', xpReward: 10 },
      { badgeName: '💼 Project Owner', earnedAt: '2025-08-31T00:00:00Z', xpReward: 10 },
      { badgeName: '🎯 Goal Setter', earnedAt: '2025-08-31T00:00:00Z', xpReward: 10 }
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
    skills: [
      { skillName: 'Full-Stack Development', level: 'EXPERT', xp: 107 },
      { skillName: 'Blockchain', level: 'EXPERT', xp: 107 },
      { skillName: 'Smart Contracts', level: 'EXPERT', xp: 106 }
    ],
    badges: [
      { badgeName: '⚡ Code Ninja', earnedAt: '2025-08-31T00:00:00Z', xpReward: 10 },
      { badgeName: '🔗 Blockchain Expert', earnedAt: '2025-08-31T00:00:00Z', xpReward: 10 },
      { badgeName: '🛠️ Tech Lead', earnedAt: '2025-08-31T00:00:00Z', xpReward: 10 }
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
    skills: [
      { skillName: 'Product Management', level: 'INTERMEDIATE', xp: 32 },
      { skillName: 'UX Design', level: 'INTERMEDIATE', xp: 32 },
      { skillName: 'User Research', level: 'INTERMEDIATE', xp: 31 }
    ],
    badges: [
      { badgeName: '🎨 Design Thinker', earnedAt: '2025-08-31T00:00:00Z', xpReward: 10 },
      { badgeName: '📊 Data Analyst', earnedAt: '2025-08-31T00:00:00Z', xpReward: 10 },
      { badgeName: '🤝 Team Player', earnedAt: '2025-08-31T00:00:00Z', xpReward: 10 }
    ],
    projectMemberships: [{ role: 'MEMBER', project: { name: 'SmartStart Platform' } }]
  }
];
