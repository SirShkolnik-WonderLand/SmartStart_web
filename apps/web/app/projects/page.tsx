'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth';
import { 
  Briefcase, 
  Plus, 
  Calendar, 
  Users, 
  Target, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  BarChart3,
  GitBranch,
  GitCommit,
  GitPullRequest,
  Play,
  Pause,
  Square,
  Circle,
  Triangle,
  AlertTriangle,
  Settings,
  Filter,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Star,
  Award,
  Zap,
  Flag,
  MapPin,
  DollarSign,
  PieChart,
  LineChart,
  Activity,
  Milestone,
  CheckSquare,
  Calendar,
  Kanban,
  List,
  Grid,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Equal
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'PLANNING' | 'ACTIVE' | 'SPRINT' | 'REVIEW' | 'COMPLETED' | 'PAUSED';
  phase: 'DISCOVERY' | 'PLANNING' | 'BUILD' | 'TEST' | 'LAUNCH' | 'MAINTAIN';
  progress: number;
  currentSprint: number;
  totalSprints: number;
  startDate: string;
  targetDate: string;
  teamSize: number;
  totalValue: number;
  equity: number;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  members: Array<{
    id: string;
    name: string;
    role: string;
    equity: number;
  }>;
  sprints: Sprint[];
  tasks: Task[];
  milestones: Milestone[];
  budget: {
    allocated: number;
    spent: number;
    remaining: number;
  };
  metrics: {
    velocity: number;
    burndown: number;
    quality: number;
    satisfaction: number;
  };
}

interface Sprint {
  id: string;
  number: number;
  name: string;
  startDate: string;
  endDate: string;
  status: 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  goals: string[];
  tasks: string[];
  velocity: number;
  burndown: number;
  completedTasks: number;
  totalTasks: number;
}

interface Task {
  id: string;
  title: string;
  description: string;
  type: 'FEATURE' | 'BUG' | 'IMPROVEMENT' | 'RESEARCH' | 'DOCUMENTATION';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'BLOCKED';
  assignee: {
    id: string;
    name: string;
  };
  sprint: number;
  storyPoints: number;
  effort: number;
  impact: number;
  equity: number;
  createdAt: string;
  updatedAt: string;
  dueDate: string;
  tags: string[];
  dependencies: string[];
  comments: Array<{
    id: string;
    userId: string;
    userName: string;
    message: string;
    timestamp: string;
  }>;
}

interface Milestone {
  id: string;
  name: string;
  description: string;
  targetDate: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED';
  deliverables: string[];
  progress: number;
  dependencies: string[];
}

export default function ProjectManagementPage() {
  const { user: currentUser } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'kanban'>('grid');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [phaseFilter, setPhaseFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showSprintModal, setShowSprintModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
      } else {
        // Fallback data for development
        setProjects([
          {
            id: 'project-1',
            name: 'SmartStart Platform',
            description: 'Community-driven development platform for building ventures together with transparent equity tracking, smart contracts, and collaborative project management.',
            status: 'ACTIVE',
            phase: 'BUILD',
            progress: 75,
            currentSprint: 3,
            totalSprints: 8,
            startDate: new Date(Date.now() - 86400000 * 90).toISOString(),
            targetDate: new Date(Date.now() + 86400000 * 60).toISOString(),
            teamSize: 4,
            totalValue: 3700000,
            equity: 35,
            owner: {
              id: 'user-1',
              name: 'Udi Shkolnik',
              email: 'udi@alicesolutions.com'
            },
            members: [
              { id: 'user-1', name: 'Udi Shkolnik', role: 'OWNER', equity: 35 },
              { id: 'user-2', name: 'Alice Chen', role: 'MANAGER', equity: 25 },
              { id: 'user-3', name: 'Vlad Petrov', role: 'DEVELOPER', equity: 20 },
              { id: 'user-4', name: 'Andrii Kovalenko', role: 'DESIGNER', equity: 20 }
            ],
            sprints: [
              {
                id: 'sprint-1',
                number: 1,
                name: 'Foundation',
                startDate: new Date(Date.now() - 86400000 * 90).toISOString(),
                endDate: new Date(Date.now() - 86400000 * 60).toISOString(),
                status: 'COMPLETED',
                goals: ['Setup project structure', 'Define core architecture'],
                tasks: ['task-1', 'task-2'],
                velocity: 15,
                burndown: 100,
                completedTasks: 8,
                totalTasks: 8
              },
              {
                id: 'sprint-2',
                number: 2,
                name: 'Core Features',
                startDate: new Date(Date.now() - 86400000 * 60).toISOString(),
                endDate: new Date(Date.now() - 86400000 * 30).toISOString(),
                status: 'COMPLETED',
                goals: ['Implement authentication', 'Build user management'],
                tasks: ['task-3', 'task-4'],
                velocity: 18,
                burndown: 100,
                completedTasks: 10,
                totalTasks: 10
              },
              {
                id: 'sprint-3',
                number: 3,
                name: 'Advanced Features',
                startDate: new Date(Date.now() - 86400000 * 30).toISOString(),
                endDate: new Date(Date.now() + 86400000 * 7).toISOString(),
                status: 'ACTIVE',
                goals: ['Smart contracts', 'Equity tracking'],
                tasks: ['task-5', 'task-6'],
                velocity: 12,
                burndown: 65,
                completedTasks: 6,
                totalTasks: 12
              }
            ],
            tasks: [
              {
                id: 'task-1',
                title: 'Setup project structure',
                description: 'Initialize project with proper folder structure and dependencies',
                type: 'FEATURE',
                priority: 'HIGH',
                status: 'DONE',
                assignee: { id: 'user-1', name: 'Udi Shkolnik' },
                sprint: 1,
                storyPoints: 3,
                effort: 8,
                impact: 8,
                equity: 2.5,
                createdAt: new Date(Date.now() - 86400000 * 90).toISOString(),
                updatedAt: new Date(Date.now() - 86400000 * 60).toISOString(),
                dueDate: new Date(Date.now() - 86400000 * 60).toISOString(),
                tags: ['setup', 'infrastructure'],
                dependencies: [],
                comments: []
              },
              {
                id: 'task-2',
                title: 'Implement authentication system',
                description: 'Build secure JWT-based authentication with role-based access control',
                type: 'FEATURE',
                priority: 'CRITICAL',
                status: 'DONE',
                assignee: { id: 'user-2', name: 'Alice Chen' },
                sprint: 2,
                storyPoints: 5,
                effort: 12,
                impact: 9,
                equity: 3.0,
                createdAt: new Date(Date.now() - 86400000 * 75).toISOString(),
                updatedAt: new Date(Date.now() - 86400000 * 45).toISOString(),
                dueDate: new Date(Date.now() - 86400000 * 45).toISOString(),
                tags: ['auth', 'security'],
                dependencies: ['task-1'],
                comments: []
              }
            ],
            milestones: [
              {
                id: 'milestone-1',
                name: 'MVP Launch',
                description: 'Minimum viable product ready for beta testing',
                targetDate: new Date(Date.now() + 86400000 * 30).toISOString(),
                status: 'IN_PROGRESS',
                deliverables: ['Core platform', 'User authentication', 'Basic project management'],
                progress: 75,
                dependencies: []
              }
            ],
            budget: {
              allocated: 50000,
              spent: 37500,
              remaining: 12500
            },
            metrics: {
              velocity: 15,
              burndown: 65,
              quality: 92,
              satisfaction: 88
            }
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesPhase = phaseFilter === 'all' || project.phase === phaseFilter;
    
    return matchesSearch && matchesStatus && matchesPhase;
  });

  const getStatusColor = (status: string) => {
    const statusConfig = {
      PLANNING: 'bg-blue-100 text-blue-800',
      ACTIVE: 'bg-green-100 text-green-800',
      SPRINT: 'bg-purple-100 text-purple-800',
      REVIEW: 'bg-yellow-100 text-yellow-800',
      COMPLETED: 'bg-gray-100 text-gray-800',
      PAUSED: 'bg-red-100 text-red-800'
    };
    
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.PLANNING;
  };

  const getPhaseColor = (phase: string) => {
    const phaseConfig = {
      DISCOVERY: 'bg-indigo-100 text-indigo-800',
      PLANNING: 'bg-blue-100 text-blue-800',
      BUILD: 'bg-green-100 text-green-800',
      TEST: 'bg-yellow-100 text-yellow-800',
      LAUNCH: 'bg-purple-100 text-purple-800',
      MAINTAIN: 'bg-gray-100 text-gray-800'
    };
    
    return phaseConfig[phase as keyof typeof phaseConfig] || phaseConfig.DISCOVERY;
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return <AlertTriangle size={16} className="text-red-600" />;
      case 'HIGH': return <Triangle size={16} className="text-orange-600" />;
      case 'MEDIUM': return <Square size={16} className="text-yellow-600" />;
      case 'LOW': return <Circle size={16} className="text-green-600" />;
      default: return <Circle size={16} className="text-green-600" />;
    }
  };

  const getTaskStatusColor = (status: string) => {
    const statusConfig = {
      TODO: 'bg-gray-100 text-gray-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      REVIEW: 'bg-yellow-100 text-yellow-800',
      DONE: 'bg-green-100 text-green-800',
      BLOCKED: 'bg-red-100 text-red-800'
    };
    
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.TODO;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold">Loading Project Management</h2>
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
                <Briefcase size={20} />
              </div>
              <div className="logo-text">
                <h1>Project Management</h1>
                <p>Sprint Tracking & Project Lifecycle</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => setShowProjectModal(true)}
                className="btn btn-primary btn-sm"
              >
                <Plus size={16} />
                New Project
              </button>
              <button 
                onClick={() => setShowSprintModal(true)}
                className="btn btn-ghost btn-sm"
              >
                        <Calendar size={16} />
        Manage Sprints
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
                  <Briefcase size={20} className="text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{projects.length}</div>
                  <div className="text-sm text-secondary">Total Projects</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-content p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Play size={20} className="text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {projects.filter(p => p.status === 'ACTIVE' || p.status === 'SPRINT').length}
                  </div>
                  <div className="text-sm text-secondary">Active Projects</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-content p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar size={20} className="text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {projects.reduce((sum, p) => sum + p.currentSprint, 0)}
                  </div>
                  <div className="text-sm text-secondary">Current Sprints</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-content p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <DollarSign size={20} className="text-orange-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    ${(projects.reduce((sum, p) => sum + p.totalValue, 0) / 1000000).toFixed(1)}M
                  </div>
                  <div className="text-sm text-secondary">Portfolio Value</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="card mb-6">
          <div className="card-content p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-tertiary" />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-bg-elevated text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-border rounded-lg bg-bg-elevated text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Status</option>
                  <option value="PLANNING">Planning</option>
                  <option value="ACTIVE">Active</option>
                  <option value="SPRINT">Sprint</option>
                  <option value="REVIEW">Review</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="PAUSED">Paused</option>
                </select>
                
                <select
                  value={phaseFilter}
                  onChange={(e) => setPhaseFilter(e.target.value)}
                  className="px-3 py-2 border border-border rounded-lg bg-bg-elevated text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Phases</option>
                  <option value="DISCOVERY">Discovery</option>
                  <option value="PLANNING">Planning</option>
                  <option value="BUILD">Build</option>
                  <option value="TEST">Test</option>
                  <option value="LAUNCH">Launch</option>
                  <option value="MAINTAIN">Maintain</option>
                </select>
              </div>
              
              <div className="flex gap-1 bg-bg-tertiary rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'text-tertiary'}`}
                  title="Grid View"
                >
                  <Grid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'text-tertiary'}`}
                  title="List View"
                >
                  <List size={16} />
                </button>
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`p-2 rounded ${viewMode === 'kanban' ? 'bg-primary-600 text-white' : 'text-tertiary'}`}
                  title="Kanban View"
                >
                  <Kanban size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Projects Grid/List */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div key={project.id} className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedProject(project)}>
                <div className="card-content p-6">
                  {/* Project Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-primary mb-2">{project.name}</h3>
                      <p className="text-sm text-secondary line-clamp-2">{project.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPhaseColor(project.phase)}`}>
                        {project.phase}
                      </span>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-tertiary">Progress</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-bg-tertiary rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Sprint Info */}
                  <div className="flex items-center gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-2">
                              <Calendar size={16} className="text-tertiary" />
        <span>Sprint {project.currentSprint}/{project.totalSprints}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-tertiary" />
                      <span>{project.teamSize} members</span>
                    </div>
                  </div>
                  
                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-tertiary">Value</div>
                      <div className="font-medium">${(project.totalValue / 1000000).toFixed(1)}M</div>
                    </div>
                    <div>
                      <div className="text-tertiary">Equity</div>
                      <div className="font-medium">{project.equity}%</div>
                    </div>
                  </div>
                  
                  {/* Team Preview */}
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-tertiary">Team</span>
                      <span className="text-tertiary">{project.members.length} members</span>
                    </div>
                    <div className="flex -space-x-2">
                      {project.members.slice(0, 4).map((member, index) => (
                        <div key={member.id} className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center border-2 border-bg-elevated">
                          <span className="text-primary-600 text-xs font-medium">
                            {member.name.charAt(0)}
                          </span>
                        </div>
                      ))}
                      {project.members.length > 4 && (
                        <div className="w-8 h-8 bg-bg-tertiary rounded-full flex items-center justify-center border-2 border-bg-elevated">
                          <span className="text-tertiary text-xs font-medium">
                            +{project.members.length - 4}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === 'list' && (
          <div className="card">
            <div className="card-content p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-bg-tertiary">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-tertiary uppercase tracking-wider">
                        Project
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-tertiary uppercase tracking-wider">
                        Status & Phase
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-tertiary uppercase tracking-wider">
                        Progress
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-tertiary uppercase tracking-wider">
                        Sprint
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-tertiary uppercase tracking-wider">
                        Team
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-tertiary uppercase tracking-wider">
                        Value
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-tertiary uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredProjects.map((project) => (
                      <tr key={project.id} className="hover:bg-bg-tertiary">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-primary">{project.name}</div>
                            <div className="text-sm text-secondary line-clamp-1">{project.description}</div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                              {project.status}
                            </span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPhaseColor(project.phase)}`}>
                              {project.phase}
                            </span>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="w-24">
                            <div className="flex justify-between text-xs mb-1">
                              <span>{project.progress}%</span>
                            </div>
                            <div className="w-full bg-bg-tertiary rounded-full h-2">
                              <div 
                                className="bg-primary-600 h-2 rounded-full"
                                style={{ width: `${project.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center gap-2">
                                    <Calendar size={16} className="text-tertiary" />
        <span>{project.currentSprint}/{project.totalSprints}</span>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-1">
                              {project.members.slice(0, 3).map((member) => (
                                <div key={member.id} className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center border border-bg-elevated">
                                  <span className="text-primary-600 text-xs font-medium">
                                    {member.name.charAt(0)}
                                  </span>
                                </div>
                              ))}
                            </div>
                            <span className="text-sm text-tertiary">{project.teamSize}</span>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 text-sm">
                          <div className="text-primary font-medium">${(project.totalValue / 1000000).toFixed(1)}M</div>
                          <div className="text-tertiary">{project.equity}% equity</div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedProject(project)}
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
        )}

        {viewMode === 'kanban' && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {['PLANNING', 'ACTIVE', 'SPRINT', 'REVIEW', 'COMPLETED'].map((status) => (
              <div key={status} className="bg-bg-tertiary rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-primary">{status}</h3>
                  <span className="text-sm text-tertiary bg-bg-elevated px-2 py-1 rounded-full">
                    {filteredProjects.filter(p => p.status === status).length}
                  </span>
                </div>
                
                <div className="space-y-3">
                  {filteredProjects
                    .filter(project => project.status === status)
                    .map(project => (
                      <div 
                        key={project.id} 
                        className="card cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setSelectedProject(project)}
                      >
                        <div className="card-content p-3">
                          <h4 className="font-medium text-sm text-primary mb-1">{project.name}</h4>
                          <div className="flex items-center gap-2 text-xs text-tertiary mb-2">
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${getPhaseColor(project.phase)}`}>
                              {project.phase}
                            </span>
                          </div>
                          <div className="w-full bg-bg-tertiary rounded-full h-1.5 mb-2">
                            <div 
                              className="bg-primary-600 h-1.5 rounded-full"
                              style={{ width: `${project.progress}%` }}
                            ></div>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-tertiary">{project.progress}%</span>
                            <span className="text-tertiary">Sprint {project.currentSprint}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-bg-elevated rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-primary">{selectedProject.name}</h2>
                <p className="text-secondary">{selectedProject.description}</p>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="btn btn-ghost btn-sm"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Project Overview */}
              <div className="lg:col-span-2">
                <div className="card mb-6">
                  <div className="card-content p-4">
                    <h3 className="text-lg font-semibold mb-4">Project Overview</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm text-tertiary">Status</div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedProject.status)}`}>
                          {selectedProject.status}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm text-tertiary">Phase</div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPhaseColor(selectedProject.phase)}`}>
                          {selectedProject.phase}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm text-tertiary">Progress</div>
                        <div className="text-lg font-semibold">{selectedProject.progress}%</div>
                      </div>
                      <div>
                        <div className="text-sm text-tertiary">Current Sprint</div>
                        <div className="text-lg font-semibold">{selectedProject.currentSprint}/{selectedProject.totalSprints}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Sprints */}
                <div className="card mb-6">
                  <div className="card-content p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Sprints</h3>
                      <button className="btn btn-primary btn-sm">Add Sprint</button>
                    </div>
                    <div className="space-y-3">
                      {selectedProject.sprints.map(sprint => (
                        <div key={sprint.id} className="flex items-center justify-between p-3 bg-bg-tertiary rounded-lg">
                          <div>
                            <div className="font-medium">Sprint {sprint.number}: {sprint.name}</div>
                            <div className="text-sm text-secondary">
                              {new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              sprint.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                              sprint.status === 'ACTIVE' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {sprint.status}
                            </span>
                            <div className="text-sm">
                              <div className="text-tertiary">Tasks</div>
                              <div className="font-medium">{sprint.completedTasks}/{sprint.totalTasks}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Tasks */}
                <div className="card">
                  <div className="card-content p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Recent Tasks</h3>
                      <button className="btn btn-primary btn-sm">Add Task</button>
                    </div>
                    <div className="space-y-3">
                      {selectedProject.tasks.slice(0, 5).map(task => (
                        <div key={task.id} className="flex items-center justify-between p-3 bg-bg-tertiary rounded-lg">
                          <div className="flex items-center gap-3">
                            {getPriorityIcon(task.priority)}
                            <div>
                              <div className="font-medium text-sm">{task.title}</div>
                              <div className="text-xs text-secondary">Assigned to {task.assignee.name}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTaskStatusColor(task.status)}`}>
                              {task.status}
                            </span>
                            <div className="text-sm">
                              <div className="text-tertiary">Equity</div>
                              <div className="font-medium">{task.equity}%</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Sidebar */}
              <div className="lg:col-span-1">
                {/* Team */}
                <div className="card mb-6">
                  <div className="card-content p-4">
                    <h3 className="font-semibold mb-3">Team</h3>
                    <div className="space-y-3">
                      {selectedProject.members.map(member => (
                        <div key={member.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                              <span className="text-primary-600 text-sm font-medium">
                                {member.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-medium">{member.name}</div>
                              <div className="text-xs text-secondary">{member.role}</div>
                            </div>
                          </div>
                          <div className="text-sm font-medium">{member.equity}%</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Metrics */}
                <div className="card mb-6">
                  <div className="card-content p-4">
                    <h3 className="font-semibold mb-3">Metrics</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-tertiary">Velocity</span>
                        <span className="text-sm font-medium">{selectedProject.metrics.velocity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-tertiary">Quality</span>
                        <span className="text-sm font-medium">{selectedProject.metrics.quality}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-tertiary">Satisfaction</span>
                        <span className="text-sm font-medium">{selectedProject.metrics.satisfaction}%</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Budget */}
                <div className="card">
                  <div className="card-content p-4">
                    <h3 className="font-semibold mb-3">Budget</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-tertiary">Allocated</span>
                        <span className="text-sm font-medium">${selectedProject.budget.allocated.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-tertiary">Spent</span>
                        <span className="text-sm font-medium">${selectedProject.budget.spent.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-tertiary">Remaining</span>
                        <span className="text-sm font-medium">${selectedProject.budget.remaining.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-bg-tertiary rounded-full h-2">
                        <div 
                          className="bg-primary-600 h-2 rounded-full"
                          style={{ width: `${(selectedProject.budget.spent / selectedProject.budget.allocated) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
