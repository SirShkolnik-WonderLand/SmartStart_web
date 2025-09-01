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
  Battery
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
      const activityResponse = await fetch('/api/portfolio/activity?limit=10');
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'status-success';
      case 'LAUNCHING': return 'status-warning';
      case 'PLANNING': return 'status-info';
      case 'COMPLETED': return 'status-success';
      case 'PAUSED': return 'status-error';
      default: return 'status-info';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'SUCCESS': return 'status-success';
      case 'INFO': return 'status-info';
      case 'WARNING': return 'status-warning';
      case 'ERROR': return 'status-error';
      default: return 'status-info';
    }
  };

  const getSystemHealthColor = (health: string) => {
    switch (health) {
      case 'EXCELLENT': return 'text-green-600';
      case 'GOOD': return 'text-blue-600';
      case 'WARNING': return 'text-yellow-600';
      case 'CRITICAL': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading SmartStart HUB...</p>
          <p className="text-gray-500 text-sm mt-2">Initializing enterprise dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-professional">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">SmartStart HUB</h1>
                <p className="text-sm text-gray-500">AliceSolutions Ventures • Udi Shkolnik</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* System Status */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-600 text-sm font-medium">System Online</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Database className="w-4 h-4 text-blue-500" />
                  <span className="text-blue-600 text-sm">DB Connected</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Wifi className="w-4 h-4 text-green-500" />
                  <span className="text-green-600 text-sm">Network Stable</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center space-x-2">
                <button 
                  onClick={fetchData}
                  className="btn btn-ghost btn-sm"
                  title="Refresh data"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </button>
                <button className="btn btn-ghost btn-sm">
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 mx-4 mt-4 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700 font-medium">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Last Updated */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-gray-500 text-sm">
              <Clock className="w-4 h-4" />
              <span>Last updated: {lastRefresh.toLocaleTimeString()}</span>
            </div>
            {portfolioStats && (
              <div className={`flex items-center space-x-2 text-sm ${getSystemHealthColor(portfolioStats.systemHealth)}`}>
                <div className="w-2 h-2 rounded-full bg-current"></div>
                <span>System Health: {portfolioStats.systemHealth}</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2 text-gray-500 text-sm">
            <Shield className="w-4 h-4" />
            <span>Enterprise Security Active</span>
          </div>
        </div>

        {/* Portfolio Overview */}
        {portfolioStats && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Portfolio Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card shadow-professional-lg">
                <div className="card-content">
                  <div className="flex items-center justify-between mb-4">
                    <DollarSign className="w-8 h-8 text-green-600" />
                    <span className="text-green-600 text-sm font-medium">+{portfolioStats.monthlyGrowth}%</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-2">
                    ${(portfolioStats.totalValue / 1000000).toFixed(1)}M
                  </p>
                  <p className="text-gray-600 text-sm">Total Portfolio Value</p>
                </div>
              </div>
              
              <div className="card shadow-professional-lg">
                <div className="card-content">
                  <div className="flex items-center justify-between mb-4">
                    <Briefcase className="w-8 h-8 text-blue-600" />
                    <span className="text-blue-600 text-sm font-medium">Active</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{portfolioStats.activeProjects}</p>
                  <p className="text-gray-600 text-sm">Active Projects</p>
                </div>
              </div>
              
              <div className="card shadow-professional-lg">
                <div className="card-content">
                  <div className="flex items-center justify-between mb-4">
                    <Users className="w-8 h-8 text-purple-600" />
                    <span className="text-purple-600 text-sm font-medium">Growing</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{portfolioStats.teamSize}</p>
                  <p className="text-gray-600 text-sm">Team Members</p>
                </div>
              </div>
              
              <div className="card shadow-professional-lg">
                <div className="card-content">
                  <div className="flex items-center justify-between mb-4">
                    <TrendingUp className="w-8 h-8 text-indigo-600" />
                    <span className="text-indigo-600 text-sm font-medium">Ownership</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{portfolioStats.totalEquity}%</p>
                  <p className="text-gray-600 text-sm">Total Equity</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Active Projects */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Briefcase className="w-5 h-5 mr-2" />
              Active Projects
            </h2>
            <button className="btn btn-primary btn-md">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="card shadow-professional-lg hover:shadow-professional-xl transition-shadow">
                <div className="card-content">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{project.name}</h3>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">{project.summary}</p>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-gray-500">{project.equity}% equity</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-500">v{project.contractVersion}</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-500">{project.equityModel}</span>
                      </div>
                    </div>
                    <div className={`status-indicator ${getStatusColor(project.status)}`}>
                      {project.status}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-700 text-sm">Progress</span>
                      <span className="text-gray-700 text-sm font-medium">{project.progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      {project.nextMilestone} in {project.daysToMilestone} days
                    </div>
                    <div className="flex items-center text-gray-500">
                      <Users className="w-4 h-4 mr-1" />
                      {project.teamSize} members
                    </div>
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
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              Quick Actions
            </h2>
            <div className="space-y-3">
              <button className="w-full card shadow-professional hover:shadow-professional-lg transition-shadow text-left group">
                <div className="card-content">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-200 transition-colors">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-gray-900 font-medium">Review Contracts</p>
                      <p className="text-gray-500 text-sm">3 pending approvals</p>
                    </div>
                  </div>
                </div>
              </button>
              
              <button className="w-full card shadow-professional hover:shadow-professional-lg transition-shadow text-left group">
                <div className="card-content">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-green-200 transition-colors">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-gray-900 font-medium">Approve Equity</p>
                      <p className="text-gray-500 text-sm">2 distributions ready</p>
                    </div>
                  </div>
                </div>
              </button>
              
              <button className="w-full card shadow-professional hover:shadow-professional-lg transition-shadow text-left group">
                <div className="card-content">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-purple-200 transition-colors">
                      <MessageSquare className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-gray-900 font-medium">Team Meeting</p>
                      <p className="text-gray-500 text-sm">Scheduled in 2 hours</p>
                    </div>
                  </div>
                </div>
              </button>
              
              <button className="w-full card shadow-professional hover:shadow-professional-lg transition-shadow text-left group">
                <div className="card-content">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-orange-200 transition-colors">
                      <TrendingUp className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-gray-900 font-medium">Deploy Update</p>
                      <p className="text-gray-500 text-sm">SmartStart v2.0 ready</p>
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Recent Activity
            </h2>
            <div className="card shadow-professional-lg">
              <div className="card-content">
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getSeverityColor(activity.severity)}`}>
                        {activity.type === 'EQUITY' && <DollarSign className="w-4 h-4" />}
                        {activity.type === 'TEAM' && <Users className="w-4 h-4" />}
                        {activity.type === 'MILESTONE' && <CheckCircle className="w-4 h-4" />}
                        {activity.type === 'CONTRACT' && <FileText className="w-4 h-4" />}
                        {activity.type === 'SYSTEM' && <Activity className="w-4 h-4" />}
                        {activity.type === 'SECURITY' && <Shield className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900 text-sm font-medium">{activity.message}</p>
                        <div className="flex items-center mt-1 space-x-4">
                          {activity.projectName && (
                            <span className="text-blue-600 text-xs bg-blue-100 px-2 py-1 rounded-full">
                              {activity.projectName}
                            </span>
                          )}
                          {activity.userName && (
                            <span className="text-gray-500 text-xs">
                              by {activity.userName}
                            </span>
                          )}
                          <span className="text-gray-400 text-xs">
                            {new Date(activity.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
