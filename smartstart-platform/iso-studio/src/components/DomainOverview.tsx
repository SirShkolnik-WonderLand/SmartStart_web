import { Framework, Control, Project } from '../types';
import { ChevronRight, CheckCircle, AlertCircle, XCircle, Grid3x3 } from 'lucide-react';

interface DomainOverviewProps {
  framework: Framework;
  controls: Control[];
  project: Project | null;
  onSelectDomain: (domainId: string) => void;
}

export default function DomainOverview({ framework, controls, project, onSelectDomain }: DomainOverviewProps) {
  const getDomainStats = (domainId: string) => {
    const domainControls = controls.filter(c => c.domainId === domainId);
    const ready = domainControls.filter(c => project?.answers[c.id]?.status === 'ready').length;
    const partial = domainControls.filter(c => project?.answers[c.id]?.status === 'partial').length;
    const missing = domainControls.filter(c => !project?.answers[c.id] || project?.answers[c.id]?.status === 'missing').length;
    const progress = domainControls.length > 0 ? Math.round((ready / domainControls.length) * 100) : 0;
    
    return { total: domainControls.length, ready, partial, missing, progress };
  };

  return (
    <div className="domain-overview">
      {/* Section Header */}
      <div className="controls-section-header">
        <div>
          <h2 className="controls-section-title">Control Domains</h2>
          <p className="controls-section-subtitle">{framework.domains.length} domains, {controls.length} controls</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="metrics-grid-dark">
        <div className="metric-card-dark">
          <div className="metric-icon-dark" style={{ background: 'rgba(59, 130, 246, 0.2)' }}>
            <Grid3x3 size={24} color="#3b82f6" />
          </div>
          <div className="metric-content-dark">
            <div className="metric-value-dark">{framework.domains.length}</div>
            <div className="metric-label-dark">Domains</div>
          </div>
          <div className="metric-badge-dark">
            <span>4 Key Areas</span>
          </div>
        </div>

        <div className="metric-card-dark">
          <div className="metric-icon-dark" style={{ background: 'rgba(139, 92, 246, 0.2)' }}>
            <CheckCircle size={24} color="#8b5cf6" />
          </div>
          <div className="metric-content-dark">
            <div className="metric-value-dark">{controls.length}</div>
            <div className="metric-label-dark">Total Controls</div>
          </div>
          <div className="metric-badge-dark">
            <span>ISO 27001:2022</span>
          </div>
        </div>

        <div className="metric-card-dark">
          <div className="metric-icon-dark" style={{ background: 'rgba(34, 197, 94, 0.2)' }}>
            <AlertCircle size={24} color="#22c55e" />
          </div>
          <div className="metric-content-dark">
            <div className="metric-value-dark">{controls.filter(c => project?.answers[c.id]?.status === 'ready').length}</div>
            <div className="metric-label-dark">Ready</div>
          </div>
          <div className="metric-badge-dark positive">
            <span>{Math.round((controls.filter(c => project?.answers[c.id]?.status === 'ready').length / controls.length) * 100)}%</span>
          </div>
        </div>

        <div className="metric-card-dark">
          <div className="metric-icon-dark" style={{ background: 'rgba(245, 158, 11, 0.2)' }}>
            <XCircle size={24} color="#f59e0b" />
          </div>
          <div className="metric-content-dark">
            <div className="metric-value-dark">{controls.filter(c => !project?.answers[c.id] || project?.answers[c.id]?.status === 'missing').length}</div>
            <div className="metric-label-dark">Needs Attention</div>
          </div>
          <div className="metric-badge-dark warning">
            <span>Action Required</span>
          </div>
        </div>
      </div>

      <div className="domains-grid">
        {framework.domains.map(domain => {
          const stats = getDomainStats(domain.id);
          
          return (
            <div
              key={domain.id}
              className="domain-card"
              onClick={() => onSelectDomain(domain.id)}
            >
              <div className="domain-header">
                <div className="domain-code">{domain.code}</div>
                <ChevronRight size={20} className="domain-arrow" />
              </div>
              
              <h3 className="domain-name">{domain.name}</h3>
              <p className="domain-description">{domain.description}</p>
              
              <div className="domain-stats">
                <div className="stat-item">
                  <span className="stat-value">{stats.total}</span>
                  <span className="stat-label">Controls</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                  <span className="stat-value">{stats.progress}%</span>
                  <span className="stat-label">Ready</span>
                </div>
              </div>

              <div className="domain-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${stats.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="domain-status-badges">
                <div className="status-badge ready">
                  <CheckCircle size={14} />
                  <span>{stats.ready}</span>
                </div>
                <div className="status-badge partial">
                  <AlertCircle size={14} />
                  <span>{stats.partial}</span>
                </div>
                <div className="status-badge missing">
                  <XCircle size={14} />
                  <span>{stats.missing}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

