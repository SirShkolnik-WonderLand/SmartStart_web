'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  Briefcase, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Settings,
  BarChart3,
  MessageSquare,
  FileText,
  Zap,
  ArrowUpRight,
  Activity,
  Shield,
  Database,
  Wifi,
  Battery,
  Eye,
  Target,
  Award,
  Calendar,
  Star
} from 'lucide-react';

interface PortfolioStats {
  totalValue: number;
  activeProjects: number;
  teamSize: number;
  totalEquity: number;
  monthlyGrowth: number;
  totalContributions: number;
  systemHealth: 'EXCELLENT' | 'GOOD' | 'WARNING' | 'CRITICAL';
  lastUpdated: string;
}

interface Project {
  id: string;
  name: string;
  summary: string;
  progress: number;
  equity: number;
  nextMilestone: string;
  daysToMilestone: number;
  status: 'ACTIVE' | 'LAUNCHING' | 'PLANNING' | 'COMPLETED' | 'PAUSED';
  teamSize: number;
  totalValue: number;
  contractVersion: string;
  equityModel: string;
  vestingSchedule: string;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
}

interface Activity {
  id: string;
  type: 'EQUITY' | 'TEAM' | 'MILESTONE' | 'CONTRACT' | 'SYSTEM' | 'SECURITY';
  message: string;
  timestamp: string;
  projectId?: string;
  projectName?: string;
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  userId?: string;
  userName?: string;
}

export default function SmartStartHub() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [portfolioStats, setPortfolioStats] = useState<PortfolioStats | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Fetch all data
  const fetchData = async () => {
    try {
      setError(null);
      
      // Fetch portfolio stats
      const statsResponse = await fetch('/api/portfolio/stats');
      const statsData = await statsResponse.json();
      if (statsData.success) {
        setPortfolioStats(statsData.data);
      }

      // Fetch projects
      const projectsResponse = await fetch('/api/portfolio/projects');
      const projectsData = await projectsResponse.json();
      if (projectsData.success) {
        setProjects(projectsData.data);
      }

      // Fetch recent activity
      const activityResponse = await fetch('/api/portfolio/activity');
      const activityData = await activityResponse.json();
      if (activityData.success) {
        setRecentActivity(activityData.data);
      }

      setLastRefresh(new Date());
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'active';
      case 'launching': return 'launching';
      case 'planning': return 'planning';
      case 'completed': return 'completed';
      case 'paused': return 'paused';
      default: return 'planning';
    }
  };

  const getActivityIconClass = (type: string) => {
    switch (type.toLowerCase()) {
      case 'equity': return 'equity';
      case 'team': return 'team';
      case 'milestone': return 'milestone';
      case 'contract': return 'contract';
      case 'system': return 'system';
      case 'security': return 'security';
      default: return 'system';
    }
  };

  const getStatCardClass = (type: string) => {
    switch (type) {
      case 'positive': return 'positive';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <div className="text-center mt-4">
          <h2 className="text-xl font-semibold mb-2">Loading SmartStart HUB</h2>
          <p className="text-secondary">Initializing enterprise dashboard...</p>
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
                <TrendingUp size={20} />
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
                <Shield size={16} />
                <span>Security Active</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={fetchData}
                className="btn btn-ghost btn-sm"
                title="Refresh data"
              >
                <ArrowUpRight size={16} />
              </button>
              <button className="btn btn-ghost btn-sm">
                <Settings size={16} />
              </button>
            </div>
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
      <main className="container py-8">
        {/* Status Bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm text-tertiary">
              <Clock size={16} />
              <span>Last updated: {lastRefresh.toLocaleTimeString()}</span>
            </div>
            {portfolioStats && (
              <div className="flex items-center gap-2 text-sm">
                <div className={`status-dot ${portfolioStats.systemHealth.toLowerCase()}`}></div>
                <span>System Health: {portfolioStats.systemHealth}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-tertiary">
            <Battery size={16} />
            <span>Performance: Excellent</span>
          </div>
        </div>

        {/* Portfolio Overview */}
        {portfolioStats && (
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 size={24} />
              <h2 className="text-2xl font-semibold">Portfolio Overview</h2>
            </div>
            
            <div className="stats-grid">
              <div className={`stat-card ${getStatCardClass('positive')}`}>
                <div className="stat-icon">
                  <DollarSign size={24} />
                </div>
                <div className="stat-value">
                  ${(portfolioStats.totalValue / 1000000).toFixed(1)}M
                </div>
                <div className="stat-label">Total Portfolio Value</div>
                <div className="stat-change positive">
                  +{portfolioStats.monthlyGrowth}% this month
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">
                  <Briefcase size={24} />
                </div>
                <div className="stat-value">{portfolioStats.activeProjects}</div>
                <div className="stat-label">Active Projects</div>
                <div className="stat-change positive">
                  All systems operational
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">
                  <Users size={24} />
                </div>
                <div className="stat-value">{portfolioStats.teamSize}</div>
                <div className="stat-label">Team Members</div>
                <div className="stat-change positive">
                  Growing team
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">
                  <TrendingUp size={24} />
                </div>
                <div className="stat-value">{portfolioStats.totalEquity}%</div>
                <div className="stat-label">Total Equity</div>
                <div className="stat-change positive">
                  Strong ownership
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Active Projects */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Briefcase size={24} />
              <h2 className="text-2xl font-semibold">Active Projects</h2>
            </div>
            <button className="btn btn-primary btn-md">
              <Plus size={16} />
              New Project
            </button>
          </div>
          
          <div className="projects-grid">
            {projects.map((project) => (
              <div key={project.id} className="project-card">
                <div className="project-header">
                  <div className="flex-1">
                    <h3 className="project-title">{project.name}</h3>
                    <p className="project-description">{project.summary}</p>
                    <div className="project-meta">
                      <span>{project.equity}% equity</span>
                      <span>•</span>
                      <span>v{project.contractVersion}</span>
                      <span>•</span>
                      <span>{project.equityModel}</span>
                    </div>
                  </div>
                  <div className={`project-status ${getStatusClass(project.status)}`}>
                    {project.status}
                  </div>
                </div>
                
                <div className="progress-container">
                  <div className="progress-header">
                    <span className="progress-label">Progress</span>
                    <span className="progress-value">{project.progress}%</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-tertiary">
                    <Calendar size={16} />
                    <span>{project.nextMilestone} in {project.daysToMilestone} days</span>
                  </div>
                  <div className="flex items-center gap-1 text-tertiary">
                    <Users size={16} />
                    <span>{project.teamSize} members</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <Zap size={24} />
              <h2 className="text-2xl font-semibold">Quick Actions</h2>
            </div>
            
            <div className="quick-actions">
              <div className="action-item">
                <div className="action-icon" style={{ background: 'var(--primary-100)', color: 'var(--primary-600)' }}>
                  <FileText size={20} />
                </div>
                <div className="action-content">
                  <h3>Review Contracts</h3>
                  <p>3 pending approvals</p>
                </div>
              </div>
              
              <div className="action-item">
                <div className="action-icon" style={{ background: 'var(--success-100)', color: 'var(--success-600)' }}>
                  <CheckCircle size={20} />
                </div>
                <div className="action-content">
                  <h3>Approve Equity</h3>
                  <p>2 distributions ready</p>
                </div>
              </div>
              
              <div className="action-item">
                <div className="action-icon" style={{ background: 'var(--warning-100)', color: 'var(--warning-600)' }}>
                  <MessageSquare size={20} />
                </div>
                <div className="action-content">
                  <h3>Team Meeting</h3>
                  <p>Scheduled in 2 hours</p>
                </div>
              </div>
              
              <div className="action-item">
                <div className="action-icon" style={{ background: 'var(--primary-100)', color: 'var(--primary-600)' }}>
                  <TrendingUp size={20} />
                </div>
                <div className="action-content">
                  <h3>Deploy Update</h3>
                  <p>SmartStart v2.0 ready</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <Activity size={24} />
              <h2 className="text-2xl font-semibold">Recent Activity</h2>
            </div>
            
            <div className="activity-feed">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <div className={`activity-icon ${getActivityIconClass(activity.type)}`}>
                    {activity.type === 'EQUITY' && <DollarSign size={16} />}
                    {activity.type === 'TEAM' && <Users size={16} />}
                    {activity.type === 'MILESTONE' && <CheckCircle size={16} />}
                    {activity.type === 'CONTRACT' && <FileText size={16} />}
                    {activity.type === 'SYSTEM' && <Activity size={16} />}
                    {activity.type === 'SECURITY' && <Shield size={16} />}
                  </div>
                  <div className="activity-content">
                    <p className="activity-message">{activity.message}</p>
                    <div className="activity-meta">
                      {activity.projectName && (
                        <span className="activity-project">
                          {activity.projectName}
                        </span>
                      )}
                      {activity.userName && (
                        <span>by {activity.userName}</span>
                      )}
                      <span>{new Date(activity.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <section className="mt-12">
          <div className="flex items-center gap-3 mb-6">
            <Target size={24} />
            <h2 className="text-2xl font-semibold">Performance Metrics</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card">
              <div className="card-content">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
                    <Star size={20} className="text-success-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Success Rate</h3>
                    <p className="text-sm text-secondary">Project completion</p>
                  </div>
                </div>
                <div className="text-3xl font-bold text-success-600">94%</div>
              </div>
            </div>
            
            <div className="card">
              <div className="card-content">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Eye size={20} className="text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Active Users</h3>
                    <p className="text-sm text-secondary">This month</p>
                  </div>
                </div>
                <div className="text-3xl font-bold text-primary-600">1,247</div>
              </div>
            </div>
            
            <div className="card">
              <div className="card-content">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center">
                    <Award size={20} className="text-warning-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Milestones</h3>
                    <p className="text-sm text-secondary">Completed this week</p>
                  </div>
                </div>
                <div className="text-3xl font-bold text-warning-600">23</div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
