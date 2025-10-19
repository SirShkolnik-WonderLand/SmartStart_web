import { Framework, Control, Project } from '../types';
import { ChevronRight, CheckCircle, AlertCircle, XCircle, Grid3x3 } from 'lucide-react';
import './Dashboard.css';

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
    <div className="domain-overview-modern">
      {/* Header */}
      <div className="dashboard-header-modern">
        <div className="header-left-modern">
          <div className="header-icon-modern">
            <Grid3x3 size={40} />
          </div>
          <div>
            <h1 className="header-title-modern">Control Domains</h1>
            <p className="header-subtitle-modern">{framework.domains.length} domains, {controls.length} controls</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-cards-modern">
        <div className="stat-card-new">
          <div className="stat-icon-new blue">
            <Grid3x3 size={32} />
          </div>
          <div className="stat-info">
            <div className="stat-value-new">{framework.domains.length}</div>
            <div className="stat-label-new">Domains</div>
            <div className="stat-badge-new">4 Key Areas</div>
          </div>
        </div>

        <div className="stat-card-new">
          <div className="stat-icon-new purple">
            <CheckCircle size={32} />
          </div>
          <div className="stat-info">
            <div className="stat-value-new">{controls.length}</div>
            <div className="stat-label-new">Total Controls</div>
            <div className="stat-badge-new">ISO 27001:2022</div>
          </div>
        </div>

        <div className="stat-card-new">
          <div className="stat-icon-new green">
            <AlertCircle size={32} />
          </div>
          <div className="stat-info">
            <div className="stat-value-new">{controls.filter(c => project?.answers[c.id]?.status === 'ready').length}</div>
            <div className="stat-label-new">Ready</div>
            <div className="stat-progress-new">
              <div className="progress-bar-new">
                <div className="progress-fill-new" style={{ width: `${(controls.filter(c => project?.answers[c.id]?.status === 'ready').length / controls.length) * 100}%`, background: '#22c55e' }}></div>
              </div>
              <span className="progress-text-new">{Math.round((controls.filter(c => project?.answers[c.id]?.status === 'ready').length / controls.length) * 100)}%</span>
            </div>
          </div>
        </div>

        <div className="stat-card-new">
          <div className="stat-icon-new orange">
            <XCircle size={32} />
          </div>
          <div className="stat-info">
            <div className="stat-value-new">{controls.filter(c => !project?.answers[c.id] || project?.answers[c.id]?.status === 'missing').length}</div>
            <div className="stat-label-new">Needs Attention</div>
            <div className="stat-progress-new">
              <div className="progress-bar-new">
                <div className="progress-fill-new" style={{ width: `${(controls.filter(c => !project?.answers[c.id] || project?.answers[c.id]?.status === 'missing').length / controls.length) * 100}%`, background: '#f59e0b' }}></div>
              </div>
              <span className="progress-text-new">Action Required</span>
            </div>
          </div>
        </div>
      </div>

      {/* Domain Cards */}
      <div className="domains-grid-modern">
        {framework.domains.map((domain, index) => {
          const stats = getDomainStats(domain.id);
          
          return (
            <div
              key={domain.id}
              className="domain-card-new"
              onClick={() => onSelectDomain(domain.id)}
            >
              <div className="domain-card-header-new">
                <div className="domain-code-new">{domain.code}</div>
                <ChevronRight size={24} className="domain-arrow-new" />
              </div>
              
              <h3 className="domain-name-new">{domain.name}</h3>
              <p className="domain-description-new">{domain.description}</p>
              
              <div className="domain-progress-section-new">
                <div className="domain-progress-bar-new">
                  <div className="domain-progress-fill-new" style={{ width: `${stats.progress}%` }}></div>
                </div>
                <div className="domain-progress-text-new">{stats.progress}% Complete</div>
              </div>

              <div className="domain-status-grid-new">
                <div className="domain-status-item-new">
                  <CheckCircle size={16} color="#22c55e" />
                  <span className="domain-status-value-new">{stats.ready}</span>
                  <span className="domain-status-label-new">Ready</span>
                </div>
                <div className="domain-status-item-new">
                  <AlertCircle size={16} color="#f59e0b" />
                  <span className="domain-status-value-new">{stats.partial}</span>
                  <span className="domain-status-label-new">Partial</span>
                </div>
                <div className="domain-status-item-new">
                  <XCircle size={16} color="#ef4444" />
                  <span className="domain-status-value-new">{stats.missing}</span>
                  <span className="domain-status-label-new">Missing</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
