import { Framework, Control, Project } from '../types';
import { ChevronRight, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

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
      <div className="section-header">
        <h2>Control Domains</h2>
        <p>Click on a domain to view and assess its controls</p>
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

