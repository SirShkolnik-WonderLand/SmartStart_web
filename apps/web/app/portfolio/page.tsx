'use client';

import React, { useEffect, useState } from 'react';
import { usePortfolio, useAuth } from '../utils/smartState';
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

export default function PortfolioPage() {
  const { user, isAuthenticated } = useAuth();
  const { projects, insights, opportunities, recentActivity, badges, skills, fetchPortfolio, isLoading, error } = usePortfolio();
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'insights' | 'activity'>('overview');
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);
  const [showWalletModal, setShowWalletModal] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPortfolio();
    }
  }, [isAuthenticated, fetchPortfolio]);

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

  const totalPortfolioValue = projects.reduce((sum: number, project: ProjectData) => sum + project.totalValue, 0);
  const totalOwnership = projects.reduce((sum: number, project: ProjectData) => sum + project.userOwnership, 0);
  const avgCompletionRate = projects.length > 0 
    ? projects.reduce((sum: number, project: ProjectData) => sum + project.completionRate, 0) / projects.length
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
                  <span className="balance-amount">${totalPortfolioValue.toLocaleString()}</span>
                  <span className="balance-label">Total Value</span>
                </div>
                <div className="wallet-metrics">
                  <div className="metric">
                    <span className="metric-label">Ownership</span>
                    <span className="metric-value">{totalOwnership.toFixed(1)}%</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Projects</span>
                    <span className="metric-value">{projects.length}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Completion</span>
                    <span className="metric-value">{avgCompletionRate.toFixed(1)}%</span>
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
            <span className="tab-icon">📊</span>
            Overview
          </button>
          <button 
            className={`tab ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => setActiveTab('projects')}
          >
            <span className="tab-icon">🚀</span>
            Projects
          </button>
          <button 
            className={`tab ${activeTab === 'insights' ? 'active' : ''}`}
            onClick={() => setActiveTab('insights')}
          >
            <span className="tab-icon">🧠</span>
            Smart Insights
          </button>
          <button 
            className={`tab ${activeTab === 'activity' ? 'active' : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            <span className="tab-icon">📈</span>
            Activity
          </button>
        </div>

        {/* Content Area */}
        <div className="portfolio-content">
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
            />
          )}

          {activeTab === 'activity' && (
            <ActivityTab 
                          recentActivity={recentActivity}
            badges={badges}
            skills={skills}
            />
          )}
        </div>

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
  avgCompletionRate 
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
}) {
  return (
    <div className="overview-tab">
      {/* Portfolio Summary Cards */}
      <div className="summary-grid">
        <div className="summary-card value-card">
          <div className="card-icon">💎</div>
          <div className="card-content">
            <h3>Portfolio Value</h3>
            <div className="card-value">${totalPortfolioValue.toLocaleString()}</div>
            <div className="card-change positive">+12.5% this month</div>
          </div>
        </div>

        <div className="summary-card ownership-card">
          <div className="card-icon">🎯</div>
          <div className="card-content">
            <h3>Total Ownership</h3>
            <div className="card-value">{totalOwnership.toFixed(1)}%</div>
            <div className="card-change positive">+2.3% this week</div>
          </div>
        </div>

        <div className="summary-card completion-card">
          <div className="card-icon">✅</div>
          <div className="card-content">
            <h3>Avg Completion</h3>
            <div className="card-value">{avgCompletionRate.toFixed(1)}%</div>
            <div className="card-change neutral">On track</div>
          </div>
        </div>

        <div className="summary-card projects-card">
          <div className="card-icon">🚀</div>
          <div className="card-content">
            <h3>Active Projects</h3>
                            <div className="card-value">{projects.length}</div>
            <div className="card-change positive">+1 new this month</div>
          </div>
        </div>
      </div>

      {/* Project Distribution Chart */}
      <div className="distribution-section">
        <h3>📊 Project Distribution</h3>
        <div className="distribution-chart">
          {projects.map((project, index) => {
            const percentage = (project.totalValue / totalPortfolioValue) * 100;
            const rotation = (index / projects.length) * 360;
            
            return (
              <div 
                key={project.id}
                className="project-slice"
                style={{
                  '--percentage': `${percentage}%`,
                  '--rotation': `${rotation}deg`,
                  '--color': `hsl(${200 + (index * 40)}, 70%, 60%)`
                } as React.CSSProperties}
              >
                <div className="slice-content">
                  <span className="project-name">{project.name}</span>
                  <span className="project-percentage">{percentage.toFixed(1)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>⚡ Quick Actions</h3>
        <div className="actions-grid">
          <button className="action-button">
            <span className="action-icon">➕</span>
            <span>Add New Project</span>
          </button>
          <button className="action-button">
            <span className="action-icon">📈</span>
            <span>View Analytics</span>
          </button>
          <button className="action-button">
            <span className="action-icon">🤝</span>
            <span>Find Collaborators</span>
          </button>
          <button className="action-button">
            <span className="action-icon">📊</span>
            <span>Export Report</span>
          </button>
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

function InsightsTab({ insights, opportunities }: {
  insights: any[];
  opportunities: any;
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
          {opportunities?.needsHelp?.slice(0, 3).map((item, index) => (
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

function WalletModal({ portfolio, totalPortfolioValue, onClose }) {
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

function ProjectDetailsModal({ project, onClose }) {
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
