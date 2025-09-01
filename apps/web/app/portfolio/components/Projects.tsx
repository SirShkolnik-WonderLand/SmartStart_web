'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../components/AuthProvider';
import { apiCall } from '../../utils/api';

interface Project {
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
  stage: 'IDEA' | 'MVP' | 'GROWTH' | 'SCALE' | 'EXIT';
  sector: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  equityValue: number;
  growthRate: number;
}

interface ProjectStats {
  totalProjects: number;
  totalEquityValue: number;
  averageEquityPerProject: number;
  bestPerformer: Project | null;
  highestGrowth: Project | null;
  completionRate: number;
}

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [filter, setFilter] = useState<'all' | 'owner' | 'contributor' | 'member'>('all');

  useEffect(() => {
    fetchProjectsData();
  }, []);

  const fetchProjectsData = async () => {
    try {
      // Fetch user's projects
      const projectsResponse = await apiCall('/projects');
      if (projectsResponse && Array.isArray(projectsResponse)) {
        const userProjects = projectsResponse.map((project: any) => ({
          id: project.id,
          name: project.name,
          summary: project.summary,
          ownerId: project.ownerId,
          totalValue: project.totalValue || 0,
          activeMembers: project.activeMembers || 0,
          completionRate: project.completionRate || 0,
          lastActivity: new Date(project.lastActivity || project.createdAt),
          userRole: project.userRole || 'MEMBER',
          userOwnership: project.userOwnership || 0,
          stage: project.stage || 'IDEA',
          sector: project.sector || 'Technology',
          riskLevel: project.riskLevel || 'MEDIUM',
          equityValue: (project.totalValue || 0) * (project.userOwnership || 0) / 100,
          growthRate: project.growthRate || 0
        }));
        setProjects(userProjects);
        calculateStats(userProjects);
      }
    } catch (error) {
      console.error('Error fetching projects data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (projectList: Project[]) => {
    if (projectList.length === 0) {
      setStats({
        totalProjects: 0,
        totalEquityValue: 0,
        averageEquityPerProject: 0,
        bestPerformer: null,
        highestGrowth: null,
        completionRate: 0
      });
      return;
    }

    const totalEquityValue = projectList.reduce((sum, p) => sum + p.equityValue, 0);
    const averageEquityPerProject = totalEquityValue / projectList.length;
    const completionRate = projectList.reduce((sum, p) => sum + p.completionRate, 0) / projectList.length;
    
    const bestPerformer = projectList.reduce((best, current) => 
      current.equityValue > best.equityValue ? current : best
    );
    
    const highestGrowth = projectList.reduce((highest, current) => 
      current.growthRate > highest.growthRate ? current : highest
    );

    setStats({
      totalProjects: projectList.length,
      totalEquityValue,
      averageEquityPerProject,
      bestPerformer,
      highestGrowth,
      completionRate
    });
  };

  const getFilteredProjects = () => {
    switch (filter) {
      case 'owner':
        return projects.filter(p => p.userRole === 'OWNER');
      case 'contributor':
        return projects.filter(p => p.userRole === 'CONTRIBUTOR');
      case 'member':
        return projects.filter(p => p.userRole === 'MEMBER');
      default:
        return projects;
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'IDEA': return 'bg-blue-100 text-blue-800';
      case 'MVP': return 'bg-yellow-100 text-yellow-800';
      case 'GROWTH': return 'bg-green-100 text-green-800';
      case 'SCALE': return 'bg-purple-100 text-purple-800';
      case 'EXIT': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'text-green-600';
      case 'MEDIUM': return 'text-yellow-600';
      case 'HIGH': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'OWNER': return '👑';
      case 'ADMIN': return '⚡';
      case 'CONTRIBUTOR': return '🛠️';
      case 'MEMBER': return '👤';
      default: return '👤';
    }
  };

  if (loading) {
    return (
      <div className="projects-container">
        <div className="loading-spinner"></div>
        <p>Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="projects-container">
      {/* Projects Summary */}
      <div className="projects-summary">
        <div className="summary-stats">
          <div className="summary-stat">
            <h3>Total Projects</h3>
            <p className="stat-number">{stats?.totalProjects || 0}</p>
          </div>
          <div className="summary-stat">
            <h3>Total Equity Value</h3>
            <p className="stat-number">${stats?.totalEquityValue?.toLocaleString() || '0'}</p>
          </div>
          <div className="summary-stat">
            <h3>Avg. Equity per Project</h3>
            <p className="stat-number">${stats?.averageEquityPerProject?.toLocaleString() || '0'}</p>
          </div>
          <div className="summary-stat">
            <h3>Completion Rate</h3>
            <p className="stat-number">{stats?.completionRate?.toFixed(1) || '0'}%</p>
          </div>
        </div>

        {/* Best Performers */}
        {stats?.bestPerformer && (
          <div className="best-performers">
            <div className="performer-card">
              <h4>🏆 Best Performer</h4>
              <p className="performer-name">{stats.bestPerformer.name}</p>
              <p className="performer-value">${stats.bestPerformer.equityValue.toLocaleString()}</p>
            </div>
            {stats.highestGrowth && (
              <div className="performer-card">
                <h4>📈 Highest Growth</h4>
                <p className="performer-name">{stats.highestGrowth.name}</p>
                <p className="performer-value">+{stats.highestGrowth.growthRate.toFixed(1)}%</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filter Controls */}
      <div className="filter-controls">
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Projects ({projects.length})
          </button>
          <button 
            className={`filter-btn ${filter === 'owner' ? 'active' : ''}`}
            onClick={() => setFilter('owner')}
          >
            Owned ({projects.filter(p => p.userRole === 'OWNER').length})
          </button>
          <button 
            className={`filter-btn ${filter === 'contributor' ? 'active' : ''}`}
            onClick={() => setFilter('contributor')}
          >
            Contributing ({projects.filter(p => p.userRole === 'CONTRIBUTOR').length})
          </button>
          <button 
            className={`filter-btn ${filter === 'member' ? 'active' : ''}`}
            onClick={() => setFilter('member')}
          >
            Member ({projects.filter(p => p.userRole === 'MEMBER').length})
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="projects-grid">
        {getFilteredProjects().length > 0 ? (
          getFilteredProjects().map((project) => (
            <div key={project.id} className="project-card" onClick={() => setSelectedProject(project)}>
              <div className="project-header">
                <div className="project-title">
                  <span className="role-icon">{getRoleIcon(project.userRole)}</span>
                  <h3>{project.name}</h3>
                </div>
                <div className="project-stage">
                  <span className={`stage-badge ${getStageColor(project.stage)}`}>
                    {project.stage}
                  </span>
                </div>
              </div>

              <p className="project-summary">{project.summary || 'No description available'}</p>

              <div className="project-metrics">
                <div className="metric">
                  <span className="metric-label">Equity Value:</span>
                  <span className="metric-value">${project.equityValue.toLocaleString()}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Ownership:</span>
                  <span className="metric-value">{project.userOwnership.toFixed(1)}%</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Growth:</span>
                  <span className={`metric-value ${project.growthRate >= 0 ? 'positive' : 'negative'}`}>
                    {project.growthRate >= 0 ? '+' : ''}{project.growthRate.toFixed(1)}%
                  </span>
                </div>
                <div className="metric">
                  <span className="metric-label">Completion:</span>
                  <span className="metric-value">{project.completionRate.toFixed(1)}%</span>
                </div>
              </div>

              <div className="project-details">
                <div className="detail-item">
                  <span className="detail-label">Sector:</span>
                  <span className="detail-value">{project.sector}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Risk Level:</span>
                  <span className={`detail-value ${getRiskColor(project.riskLevel)}`}>
                    {project.riskLevel}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Members:</span>
                  <span className="detail-value">{project.activeMembers}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Last Activity:</span>
                  <span className="detail-value">
                    {new Date(project.lastActivity).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="project-actions">
                <button className="action-btn primary">View Details</button>
                <button className="action-btn secondary">Manage Equity</button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-projects">
            <p>No projects found for the selected filter.</p>
          </div>
        )}
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="modal-overlay" onClick={() => setSelectedProject(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedProject.name}</h2>
              <button className="close-btn" onClick={() => setSelectedProject(null)}>×</button>
            </div>
            <div className="modal-body">
              <p>{selectedProject.summary}</p>
              <div className="modal-metrics">
                <div className="modal-metric">
                  <h4>Equity Value</h4>
                  <p>${selectedProject.equityValue.toLocaleString()}</p>
                </div>
                <div className="modal-metric">
                  <h4>Ownership</h4>
                  <p>{selectedProject.userOwnership.toFixed(1)}%</p>
                </div>
                <div className="modal-metric">
                  <h4>Growth Rate</h4>
                  <p>{selectedProject.growthRate.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
