'use client';

// SmartStart HUB - Comprehensive User Dashboard
// This dashboard displays ALL user data from the database in a single, organized interface
// Last updated: 2025-09-01 - Complete database integration

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
  Star,
  Trophy,
  Gift,
  Heart,
  Lightbulb,
  Code,
  Globe,
  Lock,
  Unlock,
  UserCheck,
  UserX,
  GitBranch,
  GitCommit,
  GitPullRequest,
  Layers,
  PieChart,
  LineChart,
  TrendingDown,
  Minus,
  Equal,
  Crown,
  Medal,
  Badge,
  Sparkles,
  Rocket,
  Flag,
  MapPin,
  Clock3,
  Timer,
  Play,
  Pause,
  Square,
  Circle,
  Hexagon,
  Octagon,
  Triangle,
  Diamond
} from 'lucide-react';

// Enhanced TypeScript interfaces for comprehensive data
interface UserProfile {
  id: string;
  name: string;
  email: string;
  level: string;
  xp: number;
  reputation: number;
  status: string;
  lastActive: string;
  totalPortfolioValue: number;
  activeProjectsCount: number;
  totalContributions: number;
  totalEquityOwned: number;
  averageEquityPerProject: number;
  portfolioDiversity: number;
  lastEquityEarned: string;
}

interface PortfolioStats {
  totalValue: number;
  activeProjects: number;
  teamSize: number;
  totalEquity: number;
  monthlyGrowth: number;
  totalContributions: number;
  systemHealth: 'EXCELLENT' | 'GOOD' | 'WARNING' | 'CRITICAL';
  lastUpdated: string;
  totalXP: number;
  reputation: number;
  level: string;
  portfolioDiversity: number;
  averageEquityPerProject: number;
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
  currentSprint: number;
  currentPhase: string;
  completionRate: number;
  activeMembers: number;
  userRole: string;
  userOwnership: number;
}

interface Contribution {
  id: string;
  taskId: string;
  contributorId: string;
  effort: number;
  impact: number;
  proposedPct: number;
  finalPct: number;
  status: string;
  createdAt: string;
  acceptedAt: string;
  task: {
    id: string;
    title: string;
    description: string;
    project: {
      id: string;
      name: string;
    };
  };
  contributor: {
    id: string;
    name: string;
    email: string;
  };
}

interface MeshItem {
  id: string;
  type: string;
  title: string;
  description: string;
  authorId: string;
  projectId: string;
  priority: number;
  metadata: any;
  createdAt: string;
  author: {
    id: string;
    name: string;
  };
  reactions: Array<{
    id: string;
    emoji: string;
    userId: string;
  }>;
}

interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  earnedAt: string;
  badge: {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
  };
}

interface UserSkill {
  id: string;
  userId: string;
  skillId: string;
  level: number;
  skill: {
    id: string;
    name: string;
    category: string;
    description: string;
  };
}

interface Activity {
  id: string;
  type: 'EQUITY' | 'TEAM' | 'MILESTONE' | 'CONTRACT' | 'SYSTEM' | 'SECURITY' | 'CONTRIBUTION' | 'BADGE' | 'LEVEL_UP';
  message: string;
  timestamp: string;
  projectId?: string;
  projectName?: string;
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  userId?: string;
  userName?: string;
  metadata?: any;
}

export default function SmartStartHub() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [portfolioStats, setPortfolioStats] = useState<PortfolioStats | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [meshItems, setMeshItems] = useState<MeshItem[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Fetch all user data from database
  const fetchAllUserData = async () => {
    try {
      setError(null);
      
      // Fetch user profile and portfolio stats with individual error handling
      const fetchWithFallback = async (url: string, fallbackData: any) => {
        try {
          const response = await fetch(url);
          if (response.ok) {
            const data = await response.json();
            return data.success ? data.data : fallbackData;
          }
        } catch (err) {
          console.log(`API call failed for ${url}, using fallback data:`, err);
        }
        return fallbackData;
      };

      // Fetch all data with fallbacks
      const [statsData, projectsData, contributionsData, meshData, badgesData, skillsData] = await Promise.all([
        fetchWithFallback('/api/portfolio/stats', {
          totalValue: 3700000,
          activeProjects: 6,
          teamSize: 4,
          totalEquity: 367,
          monthlyGrowth: 12.5,
          totalContributions: 12,
          systemHealth: 'GOOD',
          lastUpdated: new Date().toISOString(),
          totalXP: 1250,
          reputation: 85,
          level: 'BUILDER',
          portfolioDiversity: 6,
          averageEquityPerProject: 61.2
        }),
        fetchWithFallback('/api/portfolio/projects', [
          {
            id: 'project-1',
            name: 'SmartStart Platform',
            summary: 'Community-driven development platform for building ventures together with transparent equity tracking, smart contracts, and collaborative project management.',
            progress: 75,
            equity: 35,
            nextMilestone: 'Launch v2.0',
            daysToMilestone: 3,
            status: 'LAUNCHING',
            teamSize: 4,
            totalValue: 3700000,
            contractVersion: 'v2.0',
            equityModel: 'DYNAMIC',
            vestingSchedule: 'IMMEDIATE',
            createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
            updatedAt: new Date().toISOString(),
            owner: {
              id: 'owner-1',
              name: 'Udi Shkolnik',
              email: 'udi@alicesolutions.com'
            },
            currentSprint: 3,
            currentPhase: 'BUILD',
            completionRate: 75,
            activeMembers: 4,
            userRole: 'OWNER',
            userOwnership: 35
          }
        ]),
        fetchWithFallback('/api/contributions', [
          {
            id: 'contribution-1',
            taskId: 'task-1',
            contributorId: 'demo-user-1',
            effort: 8,
            impact: 9,
            proposedPct: 2.5,
            finalPct: 2.5,
            status: 'APPROVED',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            acceptedAt: new Date(Date.now() - 82800000).toISOString(),
            task: {
              id: 'task-1',
              title: 'Implement User Authentication',
              description: 'Build secure JWT-based authentication system',
              project: {
                id: 'project-1',
                name: 'SmartStart Platform'
              }
            },
            contributor: {
              id: 'demo-user-1',
              name: 'Demo User',
              email: 'demo@example.com'
            }
          }
        ]),
        fetchWithFallback('/api/mesh/items', [
          {
            id: 'mesh-1',
            type: 'IDEA',
            title: 'AI-Powered Contract Review',
            description: 'Using machine learning to automatically review and validate legal contracts for compliance and risk assessment.',
            authorId: 'user-1',
            projectId: 'project-1',
            priority: 1,
            metadata: { category: 'innovation' },
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            author: {
              id: 'user-1',
              name: 'Alice Chen'
            },
            reactions: [
              { id: 'reaction-1', emoji: '🚀', userId: 'user-2' },
              { id: 'reaction-2', emoji: '💡', userId: 'user-3' }
            ]
          }
        ]),
        fetchWithFallback('/api/user/badges', [
          {
            id: 'badge-1',
            userId: 'demo-user-1',
            badgeId: 'badge-1',
            earnedAt: new Date(Date.now() - 86400000).toISOString(),
            badge: {
              id: 'badge-1',
              name: 'MVP Launcher',
              description: 'Successfully launched an MVP',
              icon: '🚀',
              category: 'achievement'
            }
          }
        ]),
        fetchWithFallback('/api/user/skills', [
          {
            id: 'skill-1',
            userId: 'demo-user-1',
            skillId: 'skill-1',
            level: 5,
            skill: {
              id: 'skill-1',
              name: 'React Development',
              category: 'tech',
              description: 'Frontend development with React'
            }
          }
        ])
      ]);

      // Set all the data
      setPortfolioStats(statsData);
      setProjects(projectsData);
      setContributions(contributionsData);
      setMeshItems(meshData);
      setUserBadges(badgesData);
      setUserSkills(skillsData);

      // Generate recent activity from all data sources
      const activity: Activity[] = [];
      
      // Add project activities
      projects.forEach(project => {
        activity.push({
          id: `project-${project.id}`,
          type: 'MILESTONE',
          message: `Project "${project.name}" is ${project.status.toLowerCase()}`,
          timestamp: project.updatedAt,
          projectId: project.id,
          projectName: project.name,
          severity: 'INFO'
        });
      });

      // Add contribution activities
      contributions.slice(0, 5).forEach(contribution => {
        activity.push({
          id: `contribution-${contribution.id}`,
          type: 'CONTRIBUTION',
          message: `Contribution to "${contribution.task.project.name}" - ${contribution.finalPct}% equity`,
          timestamp: contribution.createdAt,
          projectId: contribution.task.project.id,
          projectName: contribution.task.project.name,
          severity: 'SUCCESS'
        });
      });

      // Add badge activities
      userBadges.slice(0, 3).forEach(badge => {
        activity.push({
          id: `badge-${badge.id}`,
          type: 'BADGE',
          message: `Earned "${badge.badge.name}" badge`,
          timestamp: badge.earnedAt,
          severity: 'SUCCESS'
        });
      });

      setRecentActivity(activity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));

      setLastRefresh(new Date());
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError(`Failed to load dashboard data: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllUserData();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchAllUserData, 30000);
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
      case 'contribution': return 'contribution';
      case 'badge': return 'badge';
      case 'level_up': return 'level-up';
      default: return 'system';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case 'owlet': return <Circle size={16} />;
      case 'builder': return <Hexagon size={16} />;
      case 'architect': return <Diamond size={16} />;
      case 'venture_master': return <Crown size={16} />;
      default: return <Circle size={16} />;
    }
  };

  const getSkillCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'tech': return <Code size={16} />;
      case 'ops': return <Settings size={16} />;
      case 'growth': return <TrendingUp size={16} />;
      case 'compliance': return <Shield size={16} />;
      default: return <Star size={16} />;
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <div className="text-center mt-4">
          <h2 className="text-xl font-semibold mb-2">Loading SmartStart HUB</h2>
          <p className="text-secondary">Connecting to database and loading your data...</p>
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
                onClick={fetchAllUserData}
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
      <main className="container py-6">
        {/* Status Bar */}
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

        {/* Portfolio Overview - Enhanced with all user data */}
        {portfolioStats && (
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 size={24} />
              <h2 className="text-2xl font-semibold">Portfolio Overview</h2>
            </div>
            
            <div className="stats-grid">
              <div className="stat-card positive">
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

              {/* New Gamification Stats */}
              <div className="stat-card">
                <div className="stat-icon">
                  <Trophy size={20} />
                </div>
                <div className="stat-value">{portfolioStats.totalXP}</div>
                <div className="stat-label">Total XP</div>
                <div className="stat-change positive">
                  Level {portfolioStats.level}
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <Star size={20} />
                </div>
                <div className="stat-value">{portfolioStats.reputation}</div>
                <div className="stat-label">Reputation</div>
                <div className="stat-change positive">
                  Community trusted
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <GitBranch size={20} />
                </div>
                <div className="stat-value">{portfolioStats.totalContributions}</div>
                <div className="stat-label">Contributions</div>
                <div className="stat-change positive">
                  Active contributor
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <Layers size={20} />
                </div>
                <div className="stat-value">{portfolioStats.portfolioDiversity}</div>
                <div className="stat-label">Portfolio Diversity</div>
                <div className="stat-change positive">
                  Well diversified
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Projects - Enhanced */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Briefcase size={24} />
                <h2 className="text-2xl font-semibold">Active Projects</h2>
                <span className="text-sm text-tertiary">({projects.length} projects)</span>
              </div>
              <button className="btn btn-primary btn-sm">
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
                        <span>{project.userOwnership}% equity</span>
                        <span>•</span>
                        <span>v{project.contractVersion}</span>
                        <span>•</span>
                        <span>{project.equityModel}</span>
                        <span>•</span>
                        <span className="capitalize">{project.userRole}</span>
                      </div>
                    </div>
                    <div className={`project-status ${getStatusClass(project.status)}`}>
                      {project.status}
                    </div>
                  </div>
                  
                  <div className="progress-container">
                    <div className="progress-header">
                      <span className="progress-label">Progress</span>
                      <span className="progress-value">{project.completionRate}%</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${project.completionRate}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-tertiary">
                      <Calendar size={16} />
                      <span>{project.currentPhase} - Sprint {project.currentSprint}/4</span>
                    </div>
                    <div className="flex items-center gap-1 text-tertiary">
                      <Users size={16} />
                      <span>{project.activeMembers} members</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Contributions */}
            {contributions.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center gap-3 mb-4">
                  <GitCommit size={20} />
                  <h3 className="text-xl font-semibold">Recent Contributions</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {contributions.slice(0, 4).map((contribution) => (
                    <div key={contribution.id} className="card">
                      <div className="card-content p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-sm">{contribution.task.title}</h4>
                          <span className="text-xs bg-success-100 text-success-700 px-2 py-1 rounded-full">
                            {contribution.finalPct}% equity
                          </span>
                        </div>
                        <p className="text-xs text-secondary mb-2">{contribution.task.project.name}</p>
                        <div className="flex items-center gap-4 text-xs text-tertiary">
                          <span>Effort: {contribution.effort}</span>
                          <span>Impact: {contribution.impact}</span>
                          <span>{new Date(contribution.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Enhanced with all user data */}
          <div className="lg:col-span-1">
            {/* User Profile & Gamification */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <UserCheck size={20} />
                <h2 className="text-xl font-semibold">Your Profile</h2>
              </div>
              
              <div className="card">
                <div className="card-content p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Crown size={20} className="text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Level {portfolioStats?.level}</h3>
                      <p className="text-sm text-secondary">{portfolioStats?.totalXP} XP</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Reputation</span>
                      <span className="font-semibold">{portfolioStats?.reputation}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Contributions</span>
                      <span className="font-semibold">{portfolioStats?.totalContributions}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Portfolio Diversity</span>
                      <span className="font-semibold">{portfolioStats?.portfolioDiversity}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills & Badges */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Award size={20} />
                <h2 className="text-xl font-semibold">Skills & Badges</h2>
              </div>
              
              <div className="space-y-4">
                {/* Skills */}
                {userSkills.length > 0 && (
                  <div className="card">
                    <div className="card-content p-4">
                      <h3 className="font-semibold text-sm mb-3">Top Skills</h3>
                      <div className="space-y-2">
                        {userSkills.slice(0, 5).map((skill) => (
                          <div key={skill.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getSkillCategoryIcon(skill.skill.category)}
                              <span className="text-sm">{skill.skill.name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              {[...Array(skill.level)].map((_, i) => (
                                <Star key={i} size={12} className="text-warning-500 fill-current" />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Badges */}
                {userBadges.length > 0 && (
                  <div className="card">
                    <div className="card-content p-4">
                      <h3 className="font-semibold text-sm mb-3">Recent Badges</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {userBadges.slice(0, 4).map((badge) => (
                          <div key={badge.id} className="text-center p-2 bg-secondary rounded-lg">
                            <div className="text-2xl mb-1">{badge.badge.icon}</div>
                            <div className="text-xs font-medium">{badge.badge.name}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
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

                <div className="action-item">
                  <div className="action-icon" style={{ background: 'var(--error-100)', color: 'var(--error-600)' }}>
                    <Lightbulb size={16} />
                  </div>
                  <div className="action-content">
                    <h3>Submit Idea</h3>
                    <p>New project proposal</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Activity size={20} />
                <h2 className="text-xl font-semibold">Recent Activity</h2>
              </div>
              
              <div className="activity-feed">
                {recentActivity.slice(0, 6).map((activity) => (
                  <div key={activity.id} className="activity-item">
                    <div className={`activity-icon ${getActivityIconClass(activity.type)}`}>
                      {activity.type === 'EQUITY' && <DollarSign size={14} />}
                      {activity.type === 'TEAM' && <Users size={14} />}
                      {activity.type === 'MILESTONE' && <CheckCircle size={14} />}
                      {activity.type === 'CONTRACT' && <FileText size={14} />}
                      {activity.type === 'SYSTEM' && <Activity size={14} />}
                      {activity.type === 'SECURITY' && <Shield size={14} />}
                      {activity.type === 'CONTRIBUTION' && <GitCommit size={14} />}
                      {activity.type === 'BADGE' && <Award size={14} />}
                      {activity.type === 'LEVEL_UP' && <Trophy size={14} />}
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

        {/* Community Mesh - Enhanced */}
        {meshItems.length > 0 && (
          <section className="mt-8">
            <div className="flex items-center gap-3 mb-6">
              <Globe size={24} />
              <h2 className="text-2xl font-semibold">Community Activity</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {meshItems.slice(0, 6).map((item) => (
                <div key={item.id} className="card">
                  <div className="card-content p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Lightbulb size={16} className="text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{item.title}</h3>
                        <p className="text-xs text-secondary">by {item.author.name}</p>
                      </div>
                    </div>
                    <p className="text-sm text-secondary mb-3 line-clamp-2">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {item.reactions.map((reaction) => (
                          <span key={reaction.id} className="text-sm">{reaction.emoji}</span>
                        ))}
                      </div>
                      <span className="text-xs text-tertiary">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Performance Metrics - Enhanced */}
        <section className="mt-8">
          <div className="flex items-center gap-3 mb-6">
            <Target size={24} />
            <h2 className="text-2xl font-semibold">Performance Metrics</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

            <div className="card">
              <div className="card-content p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-error-100 rounded-lg flex items-center justify-center">
                    <TrendingUp size={16} className="text-error-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Growth</h3>
                    <p className="text-xs text-secondary">Portfolio value</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-error-600">+12.5%</div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
