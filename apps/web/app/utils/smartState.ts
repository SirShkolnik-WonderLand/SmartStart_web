import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { apiCall, apiCallWithAuth } from './api';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface SmartUser {
  id: string;
  email: string;
  name?: string;
  role: string;
  level: string;
  xp: number;
  reputation: number;
  totalPortfolioValue: number;
  activeProjectsCount: number;
  totalContributions: number;
  completionRate: number;
  lastActive: Date;
}

export interface SmartProject {
  id: string;
  name: string;
  summary?: string;
  ownerId: string;
  totalValue: number;
  activeMembers: number;
  completionRate: number;
  lastActivity: Date;
  userRole: string;
  userOwnership: number;
}

export interface SmartInsight {
  type: string;
  title: string;
  description: string;
  priority: number;
  confidence: number;
  data?: any;
}

export interface SmartTask {
  id: string;
  title: string;
  type: string;
  status: string;
  effort: number;
  impact: number;
  priority: number;
  dueDate?: Date;
  assigneeId?: string;
  projectId: string;
}

export interface SmartContribution {
  id: string;
  effort: number;
  impact: number;
  proposedPct: number;
  finalPct?: number;
  status: string;
  quality: number;
  collaboration: number;
  task: SmartTask;
}

export interface SmartIdea {
  id: string;
  title: string;
  body: string;
  status: string;
  votes: number;
  priority: number;
  impact: number;
  category?: string;
  tags: string[];
  projectId?: string;
}

export interface SmartPoll {
  id: string;
  question: string;
  type: string;
  closesAt: Date;
  totalVotes: number;
  isActive: boolean;
  projectId?: string;
}

export interface SmartMessage {
  id: string;
  body: string;
  type: string;
  priority: number;
  projectId?: string;
  authorId: string;
  createdAt: Date;
  reactions: MessageReaction[];
}

export interface MessageReaction {
  id: string;
  emoji: string;
  userId: string;
}

export interface SmartMeshItem {
  id: string;
  type: string;
  title: string;
  description: string;
  priority: string;
  impact: number;
  urgency: number;
  tags: string[];
  projectId?: string;
  authorId: string;
  reactions: MeshReaction[];
}

export interface MeshReaction {
  id: string;
  emoji: string;
  userId: string;
}

export interface CommunityHealth {
  metrics: {
    totalUsers: number;
    activeUsers: number;
    totalProjects: number;
    activeProjects: number;
    totalContributions: number;
    recentActivity: number;
  };
  health: {
    activityScore: number;
    projectHealth: number;
    userEngagement: number;
    overall: number;
  };
}

export interface CollaborationOpportunity {
  needsHelp: SmartMeshItem[];
  openTasks: SmartTask[];
  collaborationIdeas: SmartIdea[];
}

export interface TrendingTopics {
  ideas: SmartIdea[];
  polls: SmartPoll[];
  meshItems: SmartMeshItem[];
}

// ============================================================================
// SMART STATE STORE
// ============================================================================

interface SmartState {
  // User & Authentication
  user: SmartUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Portfolio & Projects
  portfolio: {
    projects: SmartProject[];
    insights: SmartInsight[];
    opportunities: CollaborationOpportunity;
    recentActivity: any[];
    badges: any[];
    skills: any[];
  };

  // Community & Collaboration
  community: {
    health: CommunityHealth | null;
    trendingTopics: TrendingTopics | null;
    activeMembers: SmartUser[];
  };

  // Real-time Updates
  notifications: any[];
  unreadCount: number;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchPortfolio: () => Promise<void>;
  fetchCommunityIntelligence: () => Promise<void>;
  createSmartNotification: (type: string, data: any) => Promise<void>;
  updateUserActivity: (type: string, data: any) => void;
  syncComputedFields: () => Promise<void>;
}

export const useSmartStore = create<SmartState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // ============================================================================
      // INITIAL STATE
      // ============================================================================
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      portfolio: {
        projects: [],
        insights: [],
        opportunities: {
          needsHelp: [],
          openTasks: [],
          collaborationIdeas: []
        },
        recentActivity: [],
        badges: [],
        skills: []
      },

      community: {
        health: null,
        trendingTopics: null,
        activeMembers: []
      },

      notifications: [],
      unreadCount: 0,

      // ============================================================================
      // AUTHENTICATION & USER MANAGEMENT
      // ============================================================================

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
          });

          if (response.token) {
            // Store token in cookie
            document.cookie = `authToken=${response.token}; path=/; max-age=${24 * 60 * 60}`;
            document.cookie = `user=${JSON.stringify(response.user)}; path=/; max-age=${24 * 60 * 60}`;

            set({
              user: response.user,
              isAuthenticated: true,
              isLoading: false
            });

            // Fetch portfolio data immediately after login
            await get().fetchPortfolio();
            await get().fetchCommunityIntelligence();
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false
          });
        }
      },

      logout: () => {
        // Clear cookies
        document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

        set({
          user: null,
          isAuthenticated: false,
          portfolio: {
            projects: [],
            insights: [],
            opportunities: {
              needsHelp: [],
              openTasks: [],
              collaborationIdeas: []
            },
            recentActivity: [],
            badges: [],
            skills: []
          },
          community: {
            health: null,
            trendingTopics: null,
            activeMembers: []
          },
          notifications: [],
          unreadCount: 0
        });
      },

      // ============================================================================
      // PORTFOLIO & PROJECT INTELLIGENCE
      // ============================================================================

      fetchPortfolio: async () => {
        const { user } = get();
        if (!user) return;

        set({ isLoading: true });

        try {
          const token = getAuthToken();
          if (!token) throw new Error('No auth token');

          // Get user's projects and portfolio data
          const [projectsResponse, portfolioInsightsResponse] = await Promise.all([
            apiCallWithAuth('/projects/portfolio', token),
            apiCallWithAuth(`/smart-contracts/portfolio-insights/${user.id}`, token)
          ]);
          
          const portfolioData = {
            user: {
              projects: projectsResponse.projects || [],
              totalPortfolioValue: portfolioInsightsResponse.totalEquityOwned || 0,
              activeProjectsCount: projectsResponse.projects?.filter((p: any) => p.activeMembers > 0).length || 0,
              totalContributions: projectsResponse.projects?.reduce((sum: any, p: any) => sum + (p.contributions?.length || 0), 0) || 0,
              completionRate: projectsResponse.projects?.reduce((sum: any, p: any) => sum + (p.completionRate || 0), 0) / Math.max(projectsResponse.projects?.length || 1, 1) || 0
            },
            insights: [],
            opportunities: {
              needsHelp: [],
              openTasks: [],
              collaborationIdeas: []
            },
            recentActivity: [],
            badges: [],
            skills: []
          };
          
          set({
            portfolio: {
              projects: portfolioData.user.projects || [],
              insights: portfolioData.insights || [],
              opportunities: portfolioData.opportunities || {
                needsHelp: [],
                openTasks: [],
                collaborationIdeas: []
              },
              recentActivity: portfolioData.recentActivity || [],
              badges: portfolioData.badges || [],
              skills: portfolioData.skills || []
            },
            isLoading: false
          });

          // Update user with computed fields
          set({
            user: {
              ...user,
              totalPortfolioValue: portfolioData.user.totalPortfolioValue || 0,
              activeProjectsCount: portfolioData.user.activeProjectsCount || 0,
              totalContributions: portfolioData.user.totalContributions || 0,
              completionRate: portfolioData.user.completionRate || 0
            }
          });

        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch portfolio',
            isLoading: false
          });
        }
      },

      // ============================================================================
      // COMMUNITY INTELLIGENCE
      // ============================================================================

      fetchCommunityIntelligence: async () => {
        const { user } = get();
        if (!user) return;

        try {
          // For now, set default community data since the endpoint doesn't exist
          set({
            community: {
              health: {
                metrics: {
                  totalUsers: 0,
                  activeUsers: 0,
                  totalProjects: 0,
                  activeProjects: 0,
                  totalContributions: 0,
                  recentActivity: 0
                },
                health: {
                  activityScore: 0,
                  projectHealth: 0,
                  userEngagement: 0,
                  overall: 0
                }
              },
              trendingTopics: {
                ideas: [],
                polls: [],
                meshItems: []
              },
              activeMembers: []
            }
          });

        } catch (error) {
          console.error('Failed to fetch community intelligence:', error);
        }
      },

      // ============================================================================
      // SMART NOTIFICATIONS & REAL-TIME UPDATES
      // ============================================================================

      createSmartNotification: async (type: string, data: any) => {
        const { user } = get();
        if (!user) return;

        try {
          const token = getAuthToken();
          if (!token) throw new Error('No auth token');

          // For now, create a local notification since the endpoint doesn't exist
          const notification = {
            id: Date.now().toString(),
            type,
            data,
            createdAt: new Date().toISOString(),
            read: false
          };

          // Add to local state
          set(state => ({
            notifications: [notification, ...state.notifications],
            unreadCount: state.unreadCount + 1
          }));

          // Update user activity
          get().updateUserActivity(type, data);

        } catch (error) {
          console.error('Failed to create notification:', error);
        }
      },

      updateUserActivity: (type: string, data: any) => {
        const { user } = get();
        if (!user) return;

        // Update last active timestamp
        set(state => ({
          user: state.user ? {
            ...state.user,
            lastActive: new Date()
          } : null
        }));

        // Log activity locally for immediate feedback
        const activity = {
          id: Date.now().toString(),
          type,
          entity: data.entityId,
          entityType: data.entityType,
          data,
          createdAt: new Date()
        };

        set(state => ({
          portfolio: {
            ...state.portfolio,
            recentActivity: [activity, ...state.portfolio.recentActivity.slice(0, 9)]
          }
        }));
      },

      // ============================================================================
      // DATA SYNCHRONIZATION
      // ============================================================================

      syncComputedFields: async () => {
        const { user } = get();
        if (!user) return;

        try {
          const token = getAuthToken();
          if (!token) throw new Error('No auth token');

          await apiCallWithAuth('/data/sync-computed-fields', token, {
            method: 'POST'
          });

          // Refresh portfolio data after sync
          await get().fetchPortfolio();

        } catch (error) {
          console.error('Failed to sync computed fields:', error);
        }
      }
    })),
    {
      name: 'smart-state',
      enabled: process.env.NODE_ENV === 'development'
    }
  )
);

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getAuthToken(): string | null {
  const cookies = document.cookie.split(';');
  const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('authToken='));
  return tokenCookie ? tokenCookie.split('=')[1] : null;
}

// ============================================================================
// SMART DATA HOOKS
// ============================================================================

/**
 * Hook for portfolio data with smart insights
 */
export const usePortfolio = () => {
  const { portfolio, fetchPortfolio, isLoading, error } = useSmartStore();
  
  return {
    ...portfolio,
    fetchPortfolio,
    isLoading,
    error
  };
};

/**
 * Hook for community intelligence
 */
export const useCommunity = () => {
  const { community, fetchCommunityIntelligence, isLoading } = useSmartStore();
  
  return {
    ...community,
    fetchCommunityIntelligence,
    isLoading
  };
};

/**
 * Hook for user authentication and profile
 */
export const useAuth = () => {
  const { user, isAuthenticated, login, logout, isLoading, error } = useSmartStore();
  
  return {
    user,
    isAuthenticated,
    login,
    logout,
    isLoading,
    error
  };
};

/**
 * Hook for smart notifications
 */
export const useNotifications = () => {
  const { notifications, unreadCount, createSmartNotification } = useSmartStore();
  
  return {
    notifications,
    unreadCount,
    createSmartNotification
  };
};

/**
 * Hook for real-time activity tracking
 */
export const useActivity = () => {
  const { updateUserActivity, syncComputedFields } = useSmartStore();
  
  return {
    updateUserActivity,
    syncComputedFields
  };
};

// ============================================================================
// SMART DATA TRANSFORMERS
// ============================================================================

/**
 * Transform raw project data into smart project objects
 */
export function transformToSmartProject(rawProject: any, userRole: string, userOwnership: number): SmartProject {
  return {
    id: rawProject.id,
    name: rawProject.name,
    summary: rawProject.summary,
    ownerId: rawProject.ownerId,
    totalValue: rawProject.totalValue || 0,
    activeMembers: rawProject.activeMembers || 0,
    completionRate: rawProject.completionRate || 0,
    lastActivity: new Date(rawProject.lastActivity || rawProject.updatedAt),
    userRole,
    userOwnership
  };
}

/**
 * Transform raw task data into smart task objects
 */
export function transformToSmartTask(rawTask: any): SmartTask {
  return {
    id: rawTask.id,
    title: rawTask.title,
    type: rawTask.type,
    status: rawTask.status,
    effort: rawTask.effort || 0,
    impact: rawTask.impact || 3,
    priority: rawTask.priority || 3,
    dueDate: rawTask.dueDate ? new Date(rawTask.dueDate) : undefined,
    assigneeId: rawTask.assigneeId,
    projectId: rawTask.projectId
  };
}

/**
 * Transform raw idea data into smart idea objects
 */
export function transformToSmartIdea(rawIdea: any): SmartIdea {
  return {
    id: rawIdea.id,
    title: rawIdea.title,
    body: rawIdea.body,
    status: rawIdea.status,
    votes: rawIdea.votes || 0,
    priority: rawIdea.priority || 3,
    impact: rawIdea.impact || 3,
    category: rawIdea.category,
    tags: rawIdea.tags || [],
    projectId: rawIdea.projectId
  };
}

/**
 * Transform raw mesh item data into smart mesh item objects
 */
export function transformToSmartMeshItem(rawMeshItem: any): SmartMeshItem {
  return {
    id: rawMeshItem.id,
    type: rawMeshItem.type,
    title: rawMeshItem.title,
    description: rawMeshItem.description,
    priority: rawMeshItem.priority,
    impact: rawMeshItem.impact || 3,
    urgency: rawMeshItem.urgency || 3,
    tags: rawMeshItem.tags || [],
    projectId: rawMeshItem.projectId,
    authorId: rawMeshItem.authorId,
    reactions: rawMeshItem.reactions || []
  };
}

// ============================================================================
// SMART DATA VALIDATORS
// ============================================================================

/**
 * Validate smart project data
 */
export function validateSmartProject(project: any): project is SmartProject {
  return (
    project &&
    typeof project.id === 'string' &&
    typeof project.name === 'string' &&
    typeof project.totalValue === 'number' &&
    typeof project.activeMembers === 'number' &&
    typeof project.completionRate === 'number'
  );
}

/**
 * Validate smart insight data
 */
export function validateSmartInsight(insight: any): insight is SmartInsight {
  return (
    insight &&
    typeof insight.type === 'string' &&
    typeof insight.title === 'string' &&
    typeof insight.description === 'string' &&
    typeof insight.priority === 'number' &&
    typeof insight.confidence === 'number'
  );
}

// ============================================================================
// SMART DATA ANALYZERS
// ============================================================================

/**
 * Analyze portfolio performance trends
 */
export function analyzePortfolioTrends(projects: SmartProject[]) {
  if (projects.length === 0) return null;

  const totalValue = projects.reduce((sum, p) => sum + p.totalValue, 0);
  const avgCompletion = projects.reduce((sum, p) => sum + p.completionRate, 0) / projects.length;
  const activeProjects = projects.filter(p => p.activeMembers > 0).length;

  return {
    totalValue,
    avgCompletion,
    activeProjects,
    diversification: projects.length > 1 ? 'Good' : 'Consider diversifying'
  };
}

/**
 * Analyze collaboration opportunities
 */
export function analyzeCollaborationOpportunities(opportunities: CollaborationOpportunity) {
  const totalOpportunities = 
    opportunities.needsHelp.length + 
    opportunities.openTasks.length + 
    opportunities.collaborationIdeas.length;

  const priorityOpportunities = opportunities.needsHelp.filter(item => 
    item.priority === 'HIGH' || item.priority === 'CRITICAL'
  ).length;

  return {
    totalOpportunities,
    priorityOpportunities,
    hasUrgentNeeds: priorityOpportunities > 0,
    collaborationScore: Math.min(100, (totalOpportunities / 10) * 100)
  };
}

/**
 * Analyze community health trends
 */
export function analyzeCommunityHealthTrends(health: CommunityHealth) {
  if (!health) return null;

  const { overall, activityScore, projectHealth, userEngagement } = health.health;

  let status = 'Healthy';
  if (overall < 50) status = 'Needs Attention';
  else if (overall < 75) status = 'Good';
  else if (overall < 90) status = 'Excellent';

  return {
    status,
    overall,
    activityScore,
    projectHealth,
    userEngagement,
    recommendations: generateHealthRecommendations(health.health)
  };
}

/**
 * Generate health recommendations
 */
function generateHealthRecommendations(health: any) {
  const recommendations = [];

  if (health.activityScore < 50) {
    recommendations.push('Consider launching engagement initiatives to increase user activity');
  }

  if (health.projectHealth < 50) {
    recommendations.push('Review project timelines and resource allocation');
  }

  if (health.userEngagement < 50) {
    recommendations.push('Implement community events and recognition programs');
  }

  return recommendations;
}
