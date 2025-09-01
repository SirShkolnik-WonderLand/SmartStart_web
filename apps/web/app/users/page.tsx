'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth';
import { 
  Users, 
  Shield, 
  UserPlus, 
  Edit, 
  Trash2, 
  Eye, 
  Lock, 
  Unlock,
  Crown,
  Star,
  Hexagon,
  Circle,
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertTriangle,
  UserCheck,
  UserX,
  Settings,
  Key,
  Activity,
  TrendingUp,
  Award
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'OWNER' | 'MANAGER' | 'MEMBER' | 'VIEWER';
  level: 'OWLET' | 'BUILDER' | 'ARCHITECT' | 'VENTURE_MASTER';
  xp: number;
  reputation: number;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';
  lastActive: string;
  joinedAt: string;
  totalContributions: number;
  totalEquity: number;
  projects: string[];
  permissions: string[];
  badges: Array<{
    id: string;
    name: string;
    icon: string;
    earnedAt: string;
  }>;
}

interface Role {
  name: string;
  permissions: string[];
  description: string;
  color: string;
  icon: React.ReactNode;
}

export default function UserManagementPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);

  const roles: Role[] = [
    {
      name: 'ADMIN',
      permissions: ['ALL'],
      description: 'Full system access and control',
      color: 'bg-red-100 text-red-800',
      icon: <Crown size={16} />
    },
    {
      name: 'OWNER',
      permissions: ['PROJECT_CREATE', 'EQUITY_MANAGE', 'TEAM_MANAGE', 'FINANCIAL_VIEW'],
      description: 'Project ownership and management',
      color: 'bg-purple-100 text-purple-800',
      icon: <Star size={16} />
    },
    {
      name: 'MANAGER',
      permissions: ['PROJECT_MANAGE', 'TEAM_MANAGE', 'CONTRIBUTION_APPROVE'],
      description: 'Team and project management',
      color: 'bg-blue-100 text-blue-800',
      icon: <Hexagon size={16} />
    },
    {
      name: 'MEMBER',
      permissions: ['PROJECT_VIEW', 'CONTRIBUTION_SUBMIT', 'MESH_ACCESS'],
      description: 'Active project participation',
      color: 'bg-green-100 text-green-800',
      icon: <Circle size={16} />
    },
    {
      name: 'VIEWER',
      permissions: ['PROJECT_VIEW', 'MESH_VIEW'],
      description: 'Read-only access',
      color: 'bg-gray-100 text-gray-800',
      icon: <Eye size={16} />
    }
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        // Fallback data for development
        setUsers([
          {
            id: 'user-1',
            email: 'udi@alicesolutions.com',
            name: 'Udi Shkolnik',
            role: 'ADMIN',
            level: 'VENTURE_MASTER',
            xp: 2500,
            reputation: 95,
            status: 'ACTIVE',
            lastActive: new Date().toISOString(),
            joinedAt: new Date(Date.now() - 86400000 * 90).toISOString(),
            totalContributions: 45,
            totalEquity: 150,
            projects: ['project-1', 'project-2'],
            permissions: ['ALL'],
            badges: [
              { id: 'badge-1', name: 'Founder', icon: '👑', earnedAt: new Date(Date.now() - 86400000 * 90).toISOString() },
              { id: 'badge-2', name: 'MVP Launcher', icon: '🚀', earnedAt: new Date(Date.now() - 86400000 * 30).toISOString() }
            ]
          },
          {
            id: 'user-2',
            email: 'alice@example.com',
            name: 'Alice Chen',
            role: 'MANAGER',
            level: 'ARCHITECT',
            xp: 1800,
            reputation: 87,
            status: 'ACTIVE',
            lastActive: new Date(Date.now() - 3600000).toISOString(),
            joinedAt: new Date(Date.now() - 86400000 * 60).toISOString(),
            totalContributions: 32,
            totalEquity: 85,
            projects: ['project-1'],
            permissions: ['PROJECT_MANAGE', 'TEAM_MANAGE', 'CONTRIBUTION_APPROVE'],
            badges: [
              { id: 'badge-3', name: 'Team Leader', icon: '👥', earnedAt: new Date(Date.now() - 86400000 * 45).toISOString() }
            ]
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleInfo = (roleName: string) => {
    return roles.find(role => role.name === roleName) || roles[4];
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'VENTURE_MASTER': return <Crown size={16} className="text-yellow-600" />;
      case 'ARCHITECT': return <Star size={16} className="text-blue-600" />;
      case 'BUILDER': return <Hexagon size={16} className="text-green-600" />;
      case 'OWLET': return <Circle size={16} className="text-gray-600" />;
      default: return <Circle size={16} className="text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { color: 'bg-green-100 text-green-800', icon: <CheckCircle size={14} /> },
      INACTIVE: { color: 'bg-gray-100 text-gray-800', icon: <UserX size={14} /> },
      SUSPENDED: { color: 'bg-red-100 text-red-800', icon: <Lock size={14} /> },
      PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: <AlertTriangle size={14} /> }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.INACTIVE;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold">Loading User Management</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <div className="logo-icon">
                <Users size={20} />
              </div>
              <div className="logo-text">
                <h1>User Management</h1>
                <p>RBAC Controls & User Administration</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => setShowUserModal(true)}
                className="btn btn-primary btn-sm"
              >
                <UserPlus size={16} />
                Add User
              </button>
              <button 
                onClick={() => setShowRoleModal(true)}
                className="btn btn-ghost btn-sm"
              >
                <Shield size={16} />
                Manage Roles
              </button>
              <a href="/" className="btn btn-ghost btn-sm">
                Back to HUB
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="card-content p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users size={20} className="text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{users.length}</div>
                  <div className="text-sm text-secondary">Total Users</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-content p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <UserCheck size={20} className="text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {users.filter(u => u.status === 'ACTIVE').length}
                  </div>
                  <div className="text-sm text-secondary">Active Users</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-content p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Award size={20} className="text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {users.filter(u => u.role === 'ADMIN' || u.role === 'OWNER').length}
                  </div>
                  <div className="text-sm text-secondary">Admin/Owners</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-content p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <TrendingUp size={20} className="text-orange-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {users.reduce((sum, u) => sum + u.totalContributions, 0)}
                  </div>
                  <div className="text-sm text-secondary">Total Contributions</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="card mb-6">
          <div className="card-content p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-tertiary" />
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-bg-elevated text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-2 border border-border rounded-lg bg-bg-elevated text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Roles</option>
                  {roles.map(role => (
                    <option key={role.name} value={role.name}>{role.name}</option>
                  ))}
                </select>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-border rounded-lg bg-bg-elevated text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="PENDING">Pending</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="card">
          <div className="card-content p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-bg-tertiary">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-tertiary uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-tertiary uppercase tracking-wider">
                      Role & Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-tertiary uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-tertiary uppercase tracking-wider">
                      Stats
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-tertiary uppercase tracking-wider">
                      Last Active
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-tertiary uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-bg-tertiary">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-primary-600 font-semibold">
                              {user.name.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-primary">{user.name}</div>
                            <div className="text-sm text-secondary">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleInfo(user.role).color}`}>
                            {getRoleInfo(user.role).icon}
                            {user.role}
                          </span>
                          <div className="flex items-center gap-1">
                            {getLevelIcon(user.level)}
                            <span className="text-xs text-tertiary">{user.level}</span>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        {getStatusBadge(user.status)}
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-tertiary">XP:</span>
                            <span className="font-medium">{user.xp}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-tertiary">Rep:</span>
                            <span className="font-medium">{user.reputation}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-tertiary">Equity:</span>
                            <span className="font-medium">{user.totalEquity}%</span>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 text-sm text-tertiary">
                        {new Date(user.lastActive).toLocaleDateString()}
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowUserModal(true);
                            }}
                            className="btn btn-ghost btn-sm"
                            title="Edit User"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowUserModal(true);
                            }}
                            className="btn btn-ghost btn-sm"
                            title="View Details"
                          >
                            <Eye size={14} />
                          </button>
                          <button className="btn btn-ghost btn-sm" title="More Options">
                            <MoreVertical size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-bg-elevated rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {selectedUser ? 'Edit User' : 'Add New User'}
              </h2>
              <button
                onClick={() => {
                  setShowUserModal(false);
                  setSelectedUser(null);
                }}
                className="btn btn-ghost btn-sm"
              >
                ×
              </button>
            </div>
            
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    defaultValue={selectedUser?.name || ''}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-bg-elevated text-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    defaultValue={selectedUser?.email || ''}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-bg-elevated text-primary"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <select className="w-full px-3 py-2 border border-border rounded-lg bg-bg-elevated text-primary">
                    {roles.map(role => (
                      <option key={role.name} value={role.name}>{role.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select className="w-full px-3 py-2 border border-border rounded-lg bg-bg-elevated text-primary">
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="SUSPENDED">Suspended</option>
                    <option value="PENDING">Pending</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowUserModal(false);
                    setSelectedUser(null);
                  }}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {selectedUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Role Management Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-bg-elevated rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Role & Permission Management</h2>
              <button
                onClick={() => setShowRoleModal(false)}
                className="btn btn-ghost btn-sm"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {roles.map(role => (
                <div key={role.name} className="card">
                  <div className="card-content p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${role.color}`}>
                        {role.icon}
                        {role.name}
                      </span>
                    </div>
                    <p className="text-sm text-secondary mb-3">{role.description}</p>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Permissions:</h4>
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.map(permission => (
                          <span key={permission} className="inline-flex items-center px-2 py-1 rounded text-xs bg-bg-tertiary text-tertiary">
                            {permission}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
