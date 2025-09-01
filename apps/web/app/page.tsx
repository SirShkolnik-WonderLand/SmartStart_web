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

  // Fetch all data from real database
  const fetchData = async () => {
    try {
      setError(null);
      
      // Fetch portfolio stats from real database
      const statsResponse = await fetch('/api/portfolio/stats');
      if (!statsResponse.ok) {
        throw new Error(`Stats API error: ${statsResponse.status}`);
      }
      const statsData = await statsResponse.json();
      if (statsData.success) {
        setPortfolioStats(statsData.data);
      } else {
        throw new Error(statsData.error || 'Failed to fetch stats');
      }

      // Fetch projects from real database
      const projectsResponse = await fetch('/api/portfolio/projects');
      if (!projectsResponse.ok) {
        throw new Error(`Projects API error: ${projectsResponse.status}`);
      }
      const projectsData = await projectsResponse.json();
      if (projectsData.success) {
        setProjects(projectsData.data);
      } else {
        throw new Error(projectsData.error || 'Failed to fetch projects');
      }

      // Fetch recent activity from real database
      const activityResponse = await fetch('/api/portfolio/activity');
      if (!activityResponse.ok) {
        throw new Error(`Activity API error: ${activityResponse.status}`);
      }
      const activityData = await activityResponse.json();
      if (activityData.success) {
        setRecentActivity(activityData.data);
      } else {
        throw new Error(activityData.error || 'Failed to fetch activity');
      }

      setLastRefresh(new Date());
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(`Failed to load dashboard data: ${err instanceof Error ? err.message : 'Unknown error'}`);
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
          <p className="text-secondary">Connecting to database...</p>
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

      {/* Main Content - Compact Single Screen Layout */}
      <main className="container py-6">
        {/* Status Bar - Compact */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
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

        {/* Portfolio Overview - Compact */}
        {portfolioStats && (
          <section className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 size={20} />
              <h2 className="text-xl font-semibold">Portfolio Overview</h2>
            </div>
            
            <div className="stats-grid">
              <div className={`stat-card ${getStatCardClass('positive')}`}>
                <div className="stat-icon">
                  <DollarSign size={20} />
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
                  <Briefcase size={20} />
                </div>
                <div className="stat-value">{portfolioStats.activeProjects}</div>
                <div className="stat-label">Active Projects</div>
                <div className="stat-change positive">
                  All systems operational
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">
                  <Users size={20} />
                </div>
                <div className="stat-value">{portfolioStats.teamSize}</div>
                <div className="stat-label">Team Members</div>
                <div className="stat-change positive">
                  Growing team
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">
                  <TrendingUp size={20} />
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

        {/* Main Dashboard Grid - Compact Single Screen */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Projects - Compact */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Briefcase size={20} />
                <h2 className="text-xl font-semibold">Active Projects</h2>
              </div>
              <button className="btn btn-primary btn-sm">
                <Plus size={16} />
                New Project
              </button>
            </div>
            
            <div className="projects-grid">
              {projects.slice(0, 4).map((project) => (
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
          </div>

          {/* Quick Actions & Recent Activity - Compact Sidebar */}
          <div className="lg:col-span-1">
            {/* Quick Actions - Compact */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Zap size={20} />
                <h2 className="text-xl font-semibold">Quick Actions</h2>
              </div>
              
              <div className="quick-actions">
                <div className="action-item">
                  <div className="action-icon" style={{ background: 'var(--primary-100)', color: 'var(--primary-600)' }}>
                    <FileText size={16} />
                  </div>
                  <div className="action-content">
                    <h3>Review Contracts</h3>
                    <p>3 pending approvals</p>
                  </div>
                </div>
                
                <div className="action-item">
                  <div className="action-icon" style={{ background: 'var(--success-100)', color: 'var(--success-600)' }}>
                    <CheckCircle size={16} />
                  </div>
                  <div className="action-content">
                    <h3>Approve Equity</h3>
                    <p>2 distributions ready</p>
                  </div>
                </div>
                
                <div className="action-item">
                  <div className="action-icon" style={{ background: 'var(--warning-100)', color: 'var(--warning-600)' }}>
                    <MessageSquare size={16} />
                  </div>
                  <div className="action-content">
                    <h3>Team Meeting</h3>
                    <p>Scheduled in 2 hours</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity - Compact */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Activity size={20} />
                <h2 className="text-xl font-semibold">Recent Activity</h2>
              </div>
              
              <div className="activity-feed">
                {recentActivity.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="activity-item">
                    <div className={`activity-icon ${getActivityIconClass(activity.type)}`}>
                      {activity.type === 'EQUITY' && <DollarSign size={14} />}
                      {activity.type === 'TEAM' && <Users size={14} />}
                      {activity.type === 'MILESTONE' && <CheckCircle size={14} />}
                      {activity.type === 'CONTRACT' && <FileText size={14} />}
                      {activity.type === 'SYSTEM' && <Activity size={14} />}
                      {activity.type === 'SECURITY' && <Shield size={14} />}
                    </div>
                    <div className="activity-content">
                      <p className="activity-message">{activity.message}</p>
                      <div className="activity-meta">
                        {activity.projectName && (
                          <span className="activity-project">
                            {activity.projectName}
                          </span>
                        )}
                        <span>{new Date(activity.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics - Compact Bottom Row */}
        <section className="mt-6">
          <div className="flex items-center gap-3 mb-4">
            <Target size={20} />
            <h2 className="text-xl font-semibold">Performance Metrics</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card">
              <div className="card-content p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                    <Star size={16} className="text-success-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Success Rate</h3>
                    <p className="text-xs text-secondary">Project completion</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-success-600">94%</div>
              </div>
            </div>
            
            <div className="card">
              <div className="card-content p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Eye size={16} className="text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Active Users</h3>
                    <p className="text-xs text-secondary">This month</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-primary-600">1,247</div>
              </div>
            </div>
            
            <div className="card">
              <div className="card-content p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center">
                    <Award size={16} className="text-warning-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Milestones</h3>
                    <p className="text-xs text-secondary">Completed this week</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-warning-600">23</div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
