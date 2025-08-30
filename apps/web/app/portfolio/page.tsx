'use client';

import React, { useEffect, useState } from 'react';
import { usePortfolio } from '../utils/smartState'
import { useAuth } from '../components/AuthProvider';
import AppLayout from '../components/AppLayout';
import '../styles/portfolio.css';

interface ProjectData {
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

interface PortfolioData {
  projects: ProjectData[];
  insights: any[];
  opportunities: any;
  recentActivity: any[];
  badges: any[];
  skills: any[];
}

interface ContractOffer {
  id: string;
  projectId: string;
  project: {
    id: string;
    name: string;
    summary?: string;
    owner: {
      id: string;
      name: string;
      email: string;
    };
  };
  equityPercentage: number;
  vestingSchedule: string;
  contributionType: string;
  effortRequired: number;
  impactExpected: number;
  status: string;
  expiresAt: Date;
  createdAt: Date;
  terms: string;
  deliverables: string[];
  milestones: string[];
}

interface PortfolioInsights {
  totalEquityOwned: number;
  averageEquityPerProject: number;
  portfolioDiversity: number;
  highestEquityProject: string;
  lowestEquityProject: string;
  equityGrowthRate: number;
  riskScore: number;
  opportunityScore: number;
}

export default function PortfolioPage() {
  const { user, isAuthenticated, isInitialized } = useAuth();
  const { projects, insights, opportunities, recentActivity, badges, skills, fetchPortfolio, isLoading, error } = usePortfolio();
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'insights' | 'activity' | 'contracts' | 'vesting'>('overview');
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  
  // New state for smart contracts
  const [contractOffers, setContractOffers] = useState<ContractOffer[]>([]);
  const [portfolioInsights, setPortfolioInsights] = useState<PortfolioInsights | null>(null);
  const [vestingSchedules, setVestingSchedules] = useState<any[]>([]);
  const [showContractModal, setShowContractModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState<ContractOffer | null>(null);

  useEffect(() => {
    if (isAuthenticated && isInitialized) {
      fetchPortfolio();
      fetchSmartContractData();
    }
  }, [isAuthenticated, isInitialized, fetchPortfolio]);

  const fetchSmartContractData = async () => {
    try {
      // Get auth token from cookies
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('authToken='))
        ?.split('=')[1];

      if (!token) {
        console.error('No auth token found');
        return;
      }

      // Fetch contract offers
      const offersResponse = await fetch(`https://smartstart-api.onrender.com/smart-contracts/offers/user/${user?.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (offersResponse.ok) {
        const offers = await offersResponse.json();
        setContractOffers(offers);
      }

      // Fetch portfolio insights
      const insightsResponse = await fetch(`https://smartstart-api.onrender.com/smart-contracts/portfolio-insights/${user?.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (insightsResponse.ok) {
        const insights = await insightsResponse.json();
        setPortfolioInsights(insights);
      }

      // Fetch vesting schedules
      const vestingResponse = await fetch(`https://smartstart-api.onrender.com/smart-contracts/vesting/${user?.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (vestingResponse.ok) {
        const vesting = await vestingResponse.json();
        setVestingSchedules(vesting);
      }
    } catch (error) {
      console.error('Error fetching smart contract data:', error);
    }
  };

  const handleContractAction = async (contractId: string, action: 'accept' | 'reject', reason?: string) => {
    try {
      // Get auth token from cookies
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('authToken='))
        ?.split('=')[1];

      if (!token) {
        console.error('No auth token found');
        return;
      }

      const response = await fetch(`https://smartstart-api.onrender.com/smart-contracts/offers/${contractId}/${action}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });

      if (response.ok) {
        // Refresh data
        fetchSmartContractData();
        setShowContractModal(false);
        setSelectedContract(null);
      }
    } catch (error) {
      console.error(`Error ${action}ing contract:`, error);
    }
  };

  if (!isInitialized) {
    return (
      <div className="portfolio-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Initializing...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="portfolio-page">
        <div className="auth-required">
          <h2>🔐 Authentication Required</h2>
          <p>Please log in to view your portfolio.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="portfolio-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your portfolio...</p>
        </div>
      </div>
      );
  }

  if (error) {
    return (
      <div className="portfolio-page">
        <div className="error-container">
          <h2>❌ Error Loading Portfolio</h2>
          <p>{error}</p>
          <button onClick={fetchPortfolio} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const totalPortfolioValue = projects.reduce((sum: number, project: ProjectData) => sum + (project.totalValue || 0), 0);
  const totalOwnership = portfolioInsights?.totalEquityOwned || projects.reduce((sum: number, project: ProjectData) => sum + (project.userOwnership || 0), 0);
  const avgCompletionRate = projects.length > 0 
    ? projects.reduce((sum: number, project: ProjectData) => sum + (project.completionRate || 0), 0) / projects.length
    : 0;

  return (
    <AppLayout currentPage="/portfolio">
      <div className="portfolio-page">
        {/* Hero Section */}
        <div className="portfolio-hero">
          <div className="hero-content">
            <div className="user-profile-section">
              <div className="profile-avatar">
                <div className="avatar-image">
                  {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </div>
                <div className="online-indicator"></div>
              </div>
              <div className="profile-info">
                <h1 className="user-nickname">{user?.name || 'Portfolio Master'}</h1>
                <p className="user-email">{user?.email}</p>
                <div className="user-stats">
                  <span className="stat-item">
                    <span className="stat-icon">⭐</span>
                    <span className="stat-label">Level</span>
                    <span className="stat-value">{user?.level || 'OWLET'}</span>
                  </span>
                  <span className="stat-item">
                    <span className="stat-icon">🔥</span>
                    <span className="stat-label">XP</span>
                    <span className="stat-value">{user?.xp || 0}</span>
                  </span>
                  <span className="stat-item">
                    <span className="stat-icon">🏆</span>
                    <span className="stat-label">Reputation</span>
                    <span className="stat-value">{user?.reputation || 0}</span>
                  </span>
                </div>
              </div>
            </div>
            
            <div className="wallet-overview">
              <div className="wallet-card" onClick={() => setShowWalletModal(true)}>
                <div className="wallet-header">
                  <h3>💰 Portfolio Wallet</h3>
                  <span className="wallet-icon">💼</span>
                </div>
                <div className="wallet-balance">
                  <span className="balance-amount">${isNaN(totalPortfolioValue) ? '0' : totalPortfolioValue.toLocaleString()}</span>
                  <span className="balance-label">Total Value</span>
                </div>
                <div className="wallet-metrics">
                  <div className="metric">
                    <span className="metric-label">Equity</span>
                    <span className="metric-value">{isNaN(totalOwnership) ? '0.0' : totalOwnership.toFixed(1)}%</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Projects</span>
                    <span className="metric-value">{projects.length}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Completion</span>
                    <span className="metric-value">{isNaN(avgCompletionRate) ? '0.0' : avgCompletionRate.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="wallet-action">
                  <span>Click to view details →</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="portfolio-tabs">
          <button 
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => setActiveTab('projects')}
          >
            Projects
          </button>
          <button 
            className={`tab ${activeTab === 'insights' ? 'active' : ''}`}
            onClick={() => setActiveTab('insights')}
          >
            Insights
          </button>
          <button 
            className={`tab ${activeTab === 'activity' ? 'active' : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            Activity
          </button>
          <button 
            className={`tab ${activeTab === 'contracts' ? 'active' : ''}`}
            onClick={() => setActiveTab('contracts')}
          >
            Contracts
          </button>
          <button 
            className={`tab ${activeTab === 'vesting' ? 'active' : ''}`}
            onClick={() => setActiveTab('vesting')}
          >
            Vesting
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <OverviewTab 
            projects={projects}
            insights={insights}
            opportunities={opportunities}
            recentActivity={recentActivity}
            badges={badges}
            skills={skills}
            totalPortfolioValue={totalPortfolioValue}
            totalOwnership={totalOwnership}
            avgCompletionRate={avgCompletionRate}
            portfolioInsights={portfolioInsights}
          />
        )}

        {activeTab === 'projects' && (
          <ProjectsTab 
            projects={projects}
            selectedProject={selectedProject}
            setSelectedProject={setSelectedProject}
          />
        )}

        {activeTab === 'insights' && (
          <InsightsTab 
            insights={insights}
            opportunities={opportunities}
            portfolioInsights={portfolioInsights}
          />
        )}

        {activeTab === 'activity' && (
          <ActivityTab 
            recentActivity={recentActivity}
            badges={badges}
            skills={skills}
          />
        )}

        {activeTab === 'contracts' && (
          <ContractsTab 
            contractOffers={contractOffers}
            onContractAction={handleContractAction}
            onContractSelect={(contract) => {
              setSelectedContract(contract);
              setShowContractModal(true);
            }}
          />
        )}

        {activeTab === 'vesting' && (
          <VestingTab 
            vestingSchedules={vestingSchedules}
          />
        )}

        {/* Wallet Modal */}
        {showWalletModal && (
          <WalletModal 
            projects={projects}
            insights={insights}
            opportunities={opportunities}
            recentActivity={recentActivity}
            badges={badges}
            skills={skills}
            totalPortfolioValue={totalPortfolioValue}
            onClose={() => setShowWalletModal(false)}
          />
        )}

        {/* Contract Modal */}
        {showContractModal && selectedContract && (
          <ContractModal 
            contract={selectedContract}
            onAccept={() => handleContractAction(selectedContract.id, 'accept')}
            onReject={() => handleContractAction(selectedContract.id, 'reject')}
            onClose={() => {
              setShowContractModal(false);
              setSelectedContract(null);
            }}
          />
        )}
      </div>
    </AppLayout>
  );
}

// ============================================================================
// TAB COMPONENTS
// ============================================================================

function OverviewTab({ 
  projects, 
  insights, 
  opportunities, 
  recentActivity, 
  badges, 
  skills, 
  totalPortfolioValue, 
  totalOwnership, 
  avgCompletionRate,
  portfolioInsights
}: {
  projects: any[];
  insights: any[];
  opportunities: any;
  recentActivity: any[];
  badges: any[];
  skills: any[];
  totalPortfolioValue: number;
  totalOwnership: number;
  avgCompletionRate: number;
  portfolioInsights: PortfolioInsights | null;
}) {
  return (
    <div className="overview-tab">
      <div className="overview-grid">
        {/* Portfolio Summary */}
        <div className="overview-card portfolio-summary">
          <h3>📊 Portfolio Summary</h3>
          <div className="summary-stats">
            <div className="stat-row">
              <span className="stat-label">Total Equity Owned:</span>
              <span className="stat-value">{totalOwnership.toFixed(2)}%</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Portfolio Diversity:</span>
              <span className="stat-value">{portfolioInsights?.portfolioDiversity || 'N/A'}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Risk Score:</span>
              <span className="stat-value">{portfolioInsights?.riskScore ? `${(portfolioInsights.riskScore * 100).toFixed(1)}%` : 'N/A'}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Opportunity Score:</span>
              <span className="stat-value">{portfolioInsights?.opportunityScore ? `${portfolioInsights.opportunityScore.toFixed(1)}%` : 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="overview-card recent-activity">
          <h3>🔄 Recent Activity</h3>
          <div className="activity-list">
            {recentActivity.slice(0, 5).map((activity, index) => (
              <div key={index} className="activity-item">
                <span className="activity-icon">📈</span>
                <span className="activity-text">{activity.description}</span>
                <span className="activity-time">{new Date(activity.timestamp).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Skills Overview */}
        <div className="overview-card skills-overview">
          <h3>🛠️ Skills Overview</h3>
          <div className="skills-grid">
            {skills.slice(0, 6).map((skill, index) => (
              <div key={index} className="skill-item">
                <span className="skill-name">{skill.name}</span>
                <div className="skill-level">
                  <div className="skill-bar" style={{ width: `${(skill.level / 5) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Badges Showcase */}
        <div className="overview-card badges-showcase">
          <h3>🏆 Badges & Achievements</h3>
          <div className="badges-grid">
            {badges.slice(0, 8).map((badge, index) => (
              <div key={index} className="badge-item">
                <span className="badge-icon">{badge.icon}</span>
                <span className="badge-name">{badge.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectsTab({ projects, selectedProject, setSelectedProject }: {
  projects: ProjectData[];
  selectedProject: ProjectData | null;
  setSelectedProject: (project: ProjectData | null) => void;
}) {
  return (
    <div className="projects-tab">
      <div className="projects-header">
        <h3>🚀 Your Projects</h3>
        <div className="projects-filter">
          <select className="filter-select">
            <option value="all">All Projects</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="high-value">High Value</option>
          </select>
        </div>
      </div>

      <div className="projects-grid">
        {projects.map((project, index) => (
          <div 
            key={project.id}
            className={`project-card ${selectedProject?.id === project.id ? 'selected' : ''}`}
            onClick={() => setSelectedProject(project)}
          >
            <div className="project-header">
              <div className="project-icon">
                {project.name.charAt(0).toUpperCase()}
              </div>
              <div className="project-info">
                <h4 className="project-name">{project.name}</h4>
                <span className={`role-badge role-${project.userRole.toLowerCase()}`}>
                  {project.userRole}
                </span>
              </div>
              <div className="project-value">
                ${project.totalValue.toLocaleString()}
              </div>
            </div>

            <div className="project-metrics">
              <div className="metric-row">
                <span className="metric-label">Ownership</span>
                <span className="metric-value">{project.userOwnership.toFixed(1)}%</span>
              </div>
              <div className="metric-row">
                <span className="metric-label">Completion</span>
                <span className="metric-value">{project.completionRate.toFixed(1)}%</span>
              </div>
              <div className="metric-row">
                <span className="metric-label">Members</span>
                <span className="metric-value">{project.activeMembers}</span>
              </div>
            </div>

            <div className="project-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${project.completionRate}%` }}
                ></div>
              </div>
              <span className="progress-text">{project.completionRate.toFixed(1)}% Complete</span>
            </div>

            <div className="project-actions">
              <button className="action-btn view-btn">View Details</button>
              <button className="action-btn edit-btn">Edit</button>
            </div>
          </div>
        ))}
      </div>

      {/* Project Details Modal */}
      {selectedProject && (
        <ProjectDetailsModal 
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
}

function InsightsTab({ insights, opportunities, portfolioInsights }: {
  insights: any[];
  opportunities: any;
  portfolioInsights: PortfolioInsights | null;
}) {
  return (
    <div className="insights-tab">
      <div className="insights-header">
        <h3>🧠 Smart Insights</h3>
        <p>AI-powered recommendations to optimize your portfolio</p>
      </div>

      <div className="insights-grid">
        {insights.map((insight, index) => (
          <div key={index} className={`insight-card priority-${insight.priority || 3}`}>
            <div className="insight-header">
              <div className="insight-icon">
                {insight.type === 'SKILL_GAP' ? '🎯' : 
                 insight.type === 'COLLABORATION' ? '🤝' : 
                 insight.type === 'PORTFOLIO_DIVERSIFICATION' ? '📊' : '💡'}
              </div>
              <div className="insight-meta">
                <h4>{insight.title}</h4>
                <span className={`priority-badge priority-${insight.priority || 3}`}>
                  {insight.priority === 4 ? 'High' : insight.priority === 3 ? 'Medium' : 'Low'}
                </span>
              </div>
            </div>
            <p className="insight-description">{insight.description}</p>
            <div className="insight-footer">
              <span className="confidence">
                Confidence: {(insight.confidence * 100).toFixed(0)}%
              </span>
              <button className="insight-action">Take Action</button>
            </div>
          </div>
        ))}
      </div>

      {/* Collaboration Opportunities */}
      <div className="opportunities-section">
        <h3>🤝 Collaboration Opportunities</h3>
        <div className="opportunities-grid">
          {opportunities?.needsHelp?.slice(0, 3).map((item: any, index: number) => (
            <div key={index} className="opportunity-card">
              <div className="opportunity-header">
                <span className="opportunity-type">Need Help</span>
                <span className={`priority-badge priority-${item.priority}`}>
                  {item.priority}
                </span>
              </div>
              <h4>{item.title}</h4>
              <p>{item.description}</p>
              <button className="collaborate-btn">Collaborate</button>
            </div>
          ))}
        </div>
      </div>

      {/* Portfolio Insights */}
      {portfolioInsights && (
        <div className="portfolio-insights-section">
          <h3>📈 Portfolio Insights</h3>
          <div className="insights-grid">
            <div className="insight-card">
              <div className="insight-header">
                <div className="insight-icon">💰</div>
                <h4>Total Equity Owned</h4>
              </div>
              <p>{portfolioInsights.totalEquityOwned.toFixed(2)}%</p>
            </div>
            <div className="insight-card">
              <div className="insight-header">
                <div className="insight-icon">📈</div>
                <h4>Equity Growth Rate</h4>
              </div>
              <p>{portfolioInsights.equityGrowthRate ? `${(portfolioInsights.equityGrowthRate * 100).toFixed(1)}%` : 'N/A'}</p>
            </div>
            <div className="insight-card">
              <div className="insight-header">
                <div className="insight-icon">⚖️</div>
                <h4>Risk Score</h4>
              </div>
              <p>{portfolioInsights.riskScore ? `${(portfolioInsights.riskScore * 100).toFixed(1)}%` : 'N/A'}</p>
            </div>
            <div className="insight-card">
              <div className="insight-header">
                <div className="insight-icon">💡</div>
                <h4>Opportunity Score</h4>
              </div>
              <p>{portfolioInsights.opportunityScore ? `${portfolioInsights.opportunityScore.toFixed(1)}%` : 'N/A'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ActivityTab({ recentActivity, badges, skills }: {
  recentActivity: any[];
  badges: any[];
  skills: any[];
}) {
  return (
    <div className="activity-tab">
      <div className="activity-header">
        <h3>📈 Recent Activity</h3>
        <p>Your latest contributions and achievements</p>
      </div>

      <div className="activity-timeline">
        {recentActivity.map((activity, index) => (
          <div key={index} className="timeline-item">
            <div className="timeline-icon">
              {activity.type === 'LOGIN' ? '🔐' :
               activity.type === 'TASK_VIEW' ? '👀' :
               activity.type === 'CONTRIBUTION' ? '💪' : '📊'}
            </div>
            <div className="timeline-content">
              <h4>{activity.type.replace('_', ' ')}</h4>
              <p>{activity.description || 'Activity recorded'}</p>
              <span className="timeline-time">
                {new Date(activity.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Badges and Skills */}
      <div className="achievements-section">
        <div className="badges-section">
          <h3>🏆 Badges Earned</h3>
          <div className="badges-grid">
            {badges.map((badge, index) => (
              <div key={index} className="badge-item">
                <div className="badge-icon">{badge.icon || '🏅'}</div>
                <span className="badge-name">{badge.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="skills-section">
          <h3>💪 Skills & Expertise</h3>
          <div className="skills-grid">
            {skills.map((skill, index) => (
              <div key={index} className="skill-item">
                <div className="skill-info">
                  <span className="skill-name">{skill.name}</span>
                  <span className="skill-level">Level {skill.level}</span>
                </div>
                <div className="skill-bar">
                  <div 
                    className="skill-fill" 
                    style={{ width: `${(skill.level / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MODAL COMPONENTS
// ============================================================================

function WalletModal({ 
  projects, 
  insights, 
  opportunities, 
  recentActivity, 
  badges, 
  skills, 
  totalPortfolioValue, 
  onClose 
}: {
  projects: any[];
  insights: any[];
  opportunities: any;
  recentActivity: any[];
  badges: any[];
  skills: any[];
  totalPortfolioValue: number;
  onClose: () => void;
}) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="wallet-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>💰 Portfolio Wallet Details</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-content">
          <div className="wallet-summary">
            <div className="total-balance">
              <span className="balance-label">Total Portfolio Value</span>
              <span className="balance-amount">${totalPortfolioValue.toLocaleString()}</span>
            </div>
          </div>

          <div className="project-breakdown">
            <h4>Project Breakdown</h4>
            {projects.map((project, index) => (
              <div key={project.id} className="breakdown-item">
                <div className="project-info">
                  <span className="project-name">{project.name}</span>
                  <span className="project-role">{project.userRole}</span>
                </div>
                <div className="project-values">
                  <span className="ownership">{project.userOwnership.toFixed(1)}%</span>
                  <span className="value">${project.totalValue.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectDetailsModal({ project, onClose }: {
  project: any;
  onClose: () => void;
}) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="project-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🚀 {project.name}</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-content">
          <div className="project-overview">
            <div className="overview-grid">
              <div className="overview-item">
                <span className="item-label">Role</span>
                <span className="item-value">{project.userRole}</span>
              </div>
              <div className="overview-item">
                <span className="item-label">Ownership</span>
                <span className="item-value">{project.userOwnership.toFixed(1)}%</span>
              </div>
              <div className="overview-item">
                <span className="item-label">Project Value</span>
                <span className="item-value">${project.totalValue.toLocaleString()}</span>
              </div>
              <div className="overview-item">
                <span className="item-label">Completion</span>
                <span className="item-value">{project.completionRate.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div className="project-actions">
            <button className="modal-action-btn primary">View Project</button>
            <button className="modal-action-btn secondary">Edit Details</button>
            <button className="modal-action-btn secondary">Share</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// NEW TAB COMPONENTS

function ContractsTab({ 
  contractOffers, 
  onContractAction, 
  onContractSelect 
}: {
  contractOffers: ContractOffer[];
  onContractAction: (contractId: string, action: 'accept' | 'reject') => void;
  onContractSelect: (contract: ContractOffer) => void;
}) {
  const pendingOffers = contractOffers.filter(offer => offer.status === 'PENDING');
  const acceptedOffers = contractOffers.filter(offer => offer.status === 'ACCEPTED');
  const rejectedOffers = contractOffers.filter(offer => offer.status === 'REJECTED');

  return (
    <div className="contracts-tab">
      <div className="contracts-header">
        <h3>📋 Smart Contracts</h3>
        <p>Manage your equity contracts and contribution agreements</p>
      </div>

      {/* Pending Contracts */}
      <div className="contracts-section">
        <h4>⏳ Pending Offers ({pendingOffers.length})</h4>
        {pendingOffers.length > 0 ? (
          <div className="contracts-grid">
            {pendingOffers.map((contract) => (
              <div key={contract.id} className="contract-card pending">
                <div className="contract-header">
                  <h5>{contract.project.name}</h5>
                  <span className="contract-status pending">{contract.status}</span>
                </div>
                <div className="contract-details">
                  <div className="detail-row">
                    <span className="detail-label">Equity Offered:</span>
                    <span className="detail-value">{contract.equityPercentage}%</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Contribution Type:</span>
                    <span className="detail-value">{contract.contributionType}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Effort Required:</span>
                    <span className="detail-value">{contract.effortRequired} hours</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Vesting Schedule:</span>
                    <span className="detail-value">{contract.vestingSchedule}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Expires:</span>
                    <span className="detail-value">{new Date(contract.expiresAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="contract-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={() => onContractSelect(contract)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-contracts">No pending contract offers</p>
        )}
      </div>

      {/* Accepted Contracts */}
      <div className="contracts-section">
        <h4>✅ Accepted Contracts ({acceptedOffers.length})</h4>
        {acceptedOffers.length > 0 ? (
          <div className="contracts-grid">
            {acceptedOffers.map((contract) => (
              <div key={contract.id} className="contract-card accepted">
                <div className="contract-header">
                  <h5>{contract.project.name}</h5>
                  <span className="contract-status accepted">{contract.status}</span>
                </div>
                <div className="contract-details">
                  <div className="detail-row">
                    <span className="detail-label">Equity Granted:</span>
                    <span className="detail-value">{contract.equityPercentage}%</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Accepted:</span>
                    <span className="detail-value">{new Date(contract.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-contracts">No accepted contracts yet</p>
        )}
      </div>
    </div>
  );
}

function VestingTab({ vestingSchedules }: { vestingSchedules: any[] }) {
  return (
    <div className="vesting-tab">
      <div className="vesting-header">
        <h3>⏰ Equity Vesting</h3>
        <p>Track your equity vesting schedules and timelines</p>
      </div>

      {vestingSchedules.length > 0 ? (
        <div className="vesting-grid">
          {vestingSchedules.map((vesting) => (
            <div key={vesting.id} className="vesting-card">
              <div className="vesting-header">
                <h5>{vesting.project.name}</h5>
                <span className="vesting-schedule">{vesting.vestingSchedule}</span>
              </div>
              <div className="vesting-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${(vesting.vestedEquity / vesting.totalEquity) * 100}%` }}
                  ></div>
                </div>
                <div className="progress-text">
                  {vesting.vestedEquity.toFixed(2)}% / {vesting.totalEquity.toFixed(2)}%
                </div>
              </div>
              <div className="vesting-details">
                <div className="detail-row">
                  <span className="detail-label">Start Date:</span>
                  <span className="detail-value">{new Date(vesting.vestingStart).toLocaleDateString()}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">End Date:</span>
                  <span className="detail-value">{new Date(vesting.vestingEnd).toLocaleDateString()}</span>
                </div>
                {vesting.cliffDate && (
                  <div className="detail-row">
                    <span className="detail-label">Cliff Date:</span>
                    <span className="detail-value">{new Date(vesting.cliffDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-vesting">No vesting schedules found</p>
      )}
    </div>
  );
}

function ContractModal({ 
  contract, 
  onAccept, 
  onReject, 
  onClose 
}: {
  contract: ContractOffer;
  onAccept: () => void;
  onReject: () => void;
  onClose: () => void;
}) {
  return (
    <div className="modal-overlay">
      <div className="modal-content contract-modal">
        <div className="modal-header">
          <h3>📋 Contract Details</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="contract-info">
            <h4>{contract.project.name}</h4>
            <p className="project-summary">{contract.project.summary}</p>
            
            <div className="contract-terms">
              <h5>Contract Terms</h5>
              <div className="terms-grid">
                <div className="term-item">
                  <span className="term-label">Equity Offered:</span>
                  <span className="term-value">{contract.equityPercentage}%</span>
                </div>
                <div className="term-item">
                  <span className="term-label">Contribution Type:</span>
                  <span className="term-value">{contract.contributionType}</span>
                </div>
                <div className="term-item">
                  <span className="term-label">Effort Required:</span>
                  <span className="term-value">{contract.effortRequired} hours</span>
                </div>
                <div className="term-item">
                  <span className="term-label">Impact Expected:</span>
                  <span className="term-value">{contract.impactExpected}/5</span>
                </div>
                <div className="term-item">
                  <span className="term-label">Vesting Schedule:</span>
                  <span className="term-value">{contract.vestingSchedule}</span>
                </div>
                <div className="term-item">
                  <span className="term-label">Expires:</span>
                  <span className="term-value">{new Date(contract.expiresAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            {contract.deliverables && contract.deliverables.length > 0 && (
              <div className="deliverables">
                <h5>Deliverables</h5>
                <ul>
                  {contract.deliverables.map((deliverable, index) => (
                    <li key={index}>{deliverable}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {contract.milestones && contract.milestones.length > 0 && (
              <div className="milestones">
                <h5>Milestones</h5>
                <ul>
                  {contract.milestones.map((milestone, index) => (
                    <li key={index}>{milestone}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-danger" onClick={onReject}>
            Reject
          </button>
          <button className="btn btn-primary" onClick={onAccept}>
            Accept Contract
          </button>
        </div>
      </div>
    </div>
  );
}
