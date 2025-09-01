'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  LogOut
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface Project {
  id: string;
  name: string;
  progress: number;
  equity: number;
  nextMilestone: string;
  daysToMilestone: number;
  status: 'active' | 'launching' | 'planning';
  teamSize: number;
  totalValue: number;
}

interface Activity {
  id: string;
  type: 'equity' | 'team' | 'milestone' | 'contract';
  message: string;
  time: string;
  project?: string;
}

interface PortfolioStats {
  totalValue: number;
  activeProjects: number;
  teamSize: number;
  totalEquity: number;
  monthlyGrowth: number;
}

export default function SmartStartHub() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  const [portfolioStats, setPortfolioStats] = useState<PortfolioStats>({
    totalValue: 2500000,
    activeProjects: 5,
    teamSize: 12,
    totalEquity: 35,
    monthlyGrowth: 15.2
  });

  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'SmartStart Platform',
      progress: 75,
      equity: 35,
      nextMilestone: 'Launch v2.0',
      daysToMilestone: 3,
      status: 'launching',
      teamSize: 4,
      totalValue: 1500000
    },
    {
      id: '2',
      name: 'AI Marketing Tool',
      progress: 45,
      equity: 20,
      nextMilestone: 'Beta Testing',
      daysToMilestone: 7,
      status: 'active',
      teamSize: 3,
      totalValue: 500000
    },
    {
      id: '3',
      name: 'E-commerce Platform',
      progress: 30,
      equity: 15,
      nextMilestone: 'MVP Development',
      daysToMilestone: 14,
      status: 'planning',
      teamSize: 2,
      totalValue: 300000
    },
    {
      id: '4',
      name: 'Mobile App Framework',
      progress: 60,
      equity: 25,
      nextMilestone: 'Framework Release',
      daysToMilestone: 5,
      status: 'active',
      teamSize: 3,
      totalValue: 200000
    }
  ]);

  const [recentActivity, setRecentActivity] = useState<Activity[]>([
    {
      id: '1',
      type: 'team',
      message: 'New contributor joined SmartStart Platform',
      time: '2 hours ago',
      project: 'SmartStart Platform'
    },
    {
      id: '2',
      type: 'equity',
      message: 'Equity distribution completed for AI Marketing Tool',
      time: '1 day ago',
      project: 'AI Marketing Tool'
    },
    {
      id: '3',
      type: 'contract',
      message: 'Smart contract deployed for E-commerce Platform',
      time: '3 days ago',
      project: 'E-commerce Platform'
    },
    {
      id: '4',
      type: 'milestone',
      message: 'Mobile App Framework reached 60% completion',
      time: '5 days ago',
      project: 'Mobile App Framework'
    }
  ]);

  useEffect(() => {
    // Check for user authentication
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (userData && token) {
      try {
        const user = JSON.parse(userData);
        setUser(user);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
    
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-slate-300 text-lg">Loading SmartStart HUB...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Animated Background */}
      <div className="animated-background"></div>
      
      {/* Header */}
      <header className="relative z-10 bg-slate-800/80 backdrop-blur-xl border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">SmartStart HUB</h1>
                <p className="text-slate-400 text-sm">{user.name} • {user.role}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg px-3 py-1">
                <span className="text-green-400 text-sm font-medium">System Online</span>
              </div>
              <button 
                onClick={handleLogout}
                className="bg-slate-700 hover:bg-slate-600 p-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <LogOut className="w-5 h-5 text-slate-300" />
                <span className="text-slate-300 text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Portfolio Overview */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Portfolio Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="w-8 h-8 text-green-400" />
                <span className="text-green-400 text-sm font-medium">+{portfolioStats.monthlyGrowth}%</span>
              </div>
              <p className="text-2xl font-bold text-white">${(portfolioStats.totalValue / 1000000).toFixed(1)}M</p>
              <p className="text-slate-400 text-sm">Total Portfolio Value</p>
            </div>
            
            <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <Briefcase className="w-8 h-8 text-blue-400" />
                <span className="text-blue-400 text-sm font-medium">Active</span>
              </div>
              <p className="text-2xl font-bold text-white">{portfolioStats.activeProjects}</p>
              <p className="text-slate-400 text-sm">Active Projects</p>
            </div>
            
            <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <Users className="w-8 h-8 text-purple-400" />
                <span className="text-purple-400 text-sm font-medium">Growing</span>
              </div>
              <p className="text-2xl font-bold text-white">{portfolioStats.teamSize}</p>
              <p className="text-slate-400 text-sm">Team Members</p>
            </div>
            
            <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-8 h-8 text-indigo-400" />
                <span className="text-indigo-400 text-sm font-medium">Ownership</span>
              </div>
              <p className="text-2xl font-bold text-white">{portfolioStats.totalEquity}%</p>
              <p className="text-slate-400 text-sm">Total Equity</p>
            </div>
          </div>
        </section>

        {/* Active Projects */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <Briefcase className="w-5 h-5 mr-2" />
              Active Projects
            </h2>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="bg-slate-800/60 backdrop-blur-xl border border-slate-700 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">{project.name}</h3>
                    <p className="text-slate-400 text-sm">{project.equity}% equity • ${(project.totalValue / 1000).toFixed(0)}K value</p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    project.status === 'launching' ? 'bg-orange-500/20 text-orange-400' :
                    project.status === 'active' ? 'bg-green-500/20 text-green-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-300 text-sm">Progress</span>
                    <span className="text-slate-300 text-sm">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-slate-400">
                    <Clock className="w-4 h-4 mr-1" />
                    {project.nextMilestone} in {project.daysToMilestone} days
                  </div>
                  <div className="flex items-center text-slate-400">
                    <Users className="w-4 h-4 mr-1" />
                    {project.teamSize} members
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
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              Quick Actions
            </h2>
            <div className="space-y-3">
              <button className="w-full bg-slate-800/60 backdrop-blur-xl border border-slate-700 rounded-xl p-4 text-left hover:bg-slate-700/60 transition-colors group">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-500/30 transition-colors">
                    <FileText className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Review Contracts</p>
                    <p className="text-slate-400 text-sm">3 pending approvals</p>
                  </div>
                </div>
              </button>
              
              <button className="w-full bg-slate-800/60 backdrop-blur-xl border border-slate-700 rounded-xl p-4 text-left hover:bg-slate-700/60 transition-colors group">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center mr-3 group-hover:bg-green-500/30 transition-colors">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Approve Equity</p>
                    <p className="text-slate-400 text-sm">2 distributions ready</p>
                  </div>
                </div>
              </button>
              
              <button className="w-full bg-slate-800/60 backdrop-blur-xl border border-slate-700 rounded-xl p-4 text-left hover:bg-slate-700/60 transition-colors group">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mr-3 group-hover:bg-purple-500/30 transition-colors">
                    <MessageSquare className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Team Meeting</p>
                    <p className="text-slate-400 text-sm">Scheduled in 2 hours</p>
                  </div>
                </div>
              </button>
              
              <button className="w-full bg-slate-800/60 backdrop-blur-xl border border-slate-700 rounded-xl p-4 text-left hover:bg-slate-700/60 transition-colors group">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center mr-3 group-hover:bg-orange-500/30 transition-colors">
                    <TrendingUp className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Deploy Update</p>
                    <p className="text-slate-400 text-sm">SmartStart v2.0 ready</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Recent Activity
            </h2>
            <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700 rounded-xl p-6">
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.type === 'equity' ? 'bg-green-500/20' :
                      activity.type === 'team' ? 'bg-blue-500/20' :
                      activity.type === 'milestone' ? 'bg-purple-500/20' :
                      'bg-orange-500/20'
                    }`}>
                      {activity.type === 'equity' && <DollarSign className="w-4 h-4 text-green-400" />}
                      {activity.type === 'team' && <Users className="w-4 h-4 text-blue-400" />}
                      {activity.type === 'milestone' && <CheckCircle className="w-4 h-4 text-purple-400" />}
                      {activity.type === 'contract' && <FileText className="w-4 h-4 text-orange-400" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm">{activity.message}</p>
                      <div className="flex items-center mt-1">
                        {activity.project && (
                          <span className="text-indigo-400 text-xs mr-2">{activity.project}</span>
                        )}
                        <span className="text-slate-400 text-xs">{activity.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
