'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  User, 
  Crown, 
  Shield, 
  Code, 
  MapPin, 
  Globe, 
  Github, 
  Linkedin, 
  Mail,
  TrendingUp,
  Award,
  Star,
  Edit,
  Eye,
  MoreHorizontal
} from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'OWNER' | 'CONTRIBUTOR' | 'MEMBER';
  xp: number;
  reputation: number;
  level: string;
  isActive: boolean;
  profile?: {
    bio?: string;
    location?: string;
    website?: string;
    github?: string;
    linkedin?: string;
  };
  equity: number;
  projects: number;
  contributions: number;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Mock data for now - replace with real API call
      const mockUsers: UserProfile[] = [
        {
          id: 'user-1',
          name: 'Udi Shkolnik',
          email: 'udi@alicesolutions.com',
          role: 'SUPER_ADMIN',
          xp: 250,
          reputation: 45,
          level: 'BUILDER',
          isActive: true,
          profile: {
            bio: 'Founder and CEO of AliceSolutions Ventures. Building the future of collaborative venture development.',
            location: 'Toronto, Canada',
            website: 'https://alicesolutions.com',
            github: 'udishkolnik',
            linkedin: 'udishkolnik'
          },
          equity: 35,
          projects: 1,
          contributions: 3
        },
        {
          id: 'user-2',
          name: 'Brian Johnson',
          email: 'brian@smartstart.com',
          role: 'OWNER',
          xp: 180,
          reputation: 35,
          level: 'BUILDER',
          isActive: true,
          profile: {
            bio: 'Full-stack developer with 8 years of experience in React, Node.js, and cloud architecture.',
            location: 'San Francisco, CA',
            website: 'https://brianjohnson.dev',
            github: 'brianjohnson',
            linkedin: 'brianjohnson'
          },
          equity: 35,
          projects: 1,
          contributions: 2
        },
        {
          id: 'user-3',
          name: 'Vlad Petrov',
          email: 'vlad@smartstart.com',
          role: 'CONTRIBUTOR',
          xp: 320,
          reputation: 52,
          level: 'BUILDER',
          isActive: true,
          profile: {
            bio: 'Backend engineer specializing in scalable systems, databases, and API design.',
            location: 'New York, NY',
            website: 'https://vladpetrov.dev',
            github: 'vladpetrov',
            linkedin: 'vladpetrov'
          },
          equity: 15,
          projects: 1,
          contributions: 1
        },
        {
          id: 'user-4',
          name: 'Andrii Kovalenko',
          email: 'andrii@smartstart.com',
          role: 'CONTRIBUTOR',
          xp: 95,
          reputation: 28,
          level: 'BUILDER',
          isActive: true,
          profile: {
            bio: 'Frontend developer passionate about user experience and modern web technologies.',
            location: 'Austin, TX',
            website: 'https://andriikovalenko.dev',
            github: 'andriikovalenko',
            linkedin: 'andriikovalenko'
          },
          equity: 10,
          projects: 1,
          contributions: 1
        }
      ];

      setUsers(mockUsers);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <Crown className="w-4 h-4 text-purple-500" />;
      case 'ADMIN':
        return <Shield className="w-4 h-4 text-blue-500" />;
      case 'OWNER':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'CONTRIBUTOR':
        return <Code className="w-4 h-4 text-green-500" />;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ADMIN':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'OWNER':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CONTRIBUTOR':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'FOUNDER':
        return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'BUILDER':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      case 'CONTRIBUTOR':
        return 'bg-gradient-to-r from-green-500 to-emerald-500';
      default:
        return 'bg-gradient-to-r from-gray-500 to-slate-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto"></div>
          <h2 className="text-xl font-semibold mt-4 mb-2">Loading Users</h2>
          <p className="text-slate-600">Fetching team members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-600" />
                Team Members
              </h1>
              <p className="text-slate-600 mt-1">Manage your team and view member profiles</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium">
                {users.length} Active Members
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Total Members</p>
                <p className="text-3xl font-bold text-slate-900">{users.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Active Projects</p>
                <p className="text-3xl font-bold text-slate-900">
                  {users.reduce((sum, user) => sum + user.projects, 0)}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Total Equity</p>
                <p className="text-3xl font-bold text-slate-900">
                  {users.reduce((sum, user) => sum + user.equity, 0)}%
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Avg XP</p>
                <p className="text-3xl font-bold text-slate-900">
                  {Math.round(users.reduce((sum, user) => sum + user.xp, 0) / users.length)}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {users.map((user) => (
            <div key={user.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow">
              {/* User Header */}
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{user.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {getRoleIcon(user.role)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                          {user.role.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* User Details */}
              <div className="p-6">
                {/* Contact Info */}
                <div className="flex items-center gap-2 text-slate-600 mb-4">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{user.email}</span>
                </div>

                {/* Bio */}
                {user.profile?.bio && (
                  <p className="text-slate-600 text-sm mb-4 line-clamp-2">{user.profile.bio}</p>
                )}

                {/* Location */}
                {user.profile?.location && (
                  <div className="flex items-center gap-2 text-slate-600 mb-4">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{user.profile.location}</span>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-900">{user.xp}</p>
                    <p className="text-xs text-slate-600">XP</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-900">{user.reputation}</p>
                    <p className="text-xs text-slate-600">Reputation</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-900">{user.equity}%</p>
                    <p className="text-xs text-slate-600">Equity</p>
                  </div>
                </div>

                {/* Level Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getLevelColor(user.level)}`}>
                    {user.level}
                  </span>
                  <span className="text-xs text-slate-500">
                    {user.projects} projects • {user.contributions} contributions
                  </span>
                </div>

                {/* Social Links */}
                <div className="flex items-center gap-3">
                  {user.profile?.website && (
                    <a href={user.profile.website} target="_blank" rel="noopener noreferrer" 
                       className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
                      <Globe className="w-4 h-4" />
                    </a>
                  )}
                  {user.profile?.github && (
                    <a href={`https://github.com/${user.profile.github}`} target="_blank" rel="noopener noreferrer"
                       className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                  {user.profile?.linkedin && (
                    <a href={`https://linkedin.com/in/${user.profile.linkedin}`} target="_blank" rel="noopener noreferrer"
                       className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
