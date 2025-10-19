import { Control, Project } from '../types';
import { CheckCircle, AlertCircle, XCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface StoryViewProps {
  controls: Control[];
  project: Project | null;
  onSelectControl: (control: Control) => void;
}

export default function StoryView({ controls, project, onSelectControl }: StoryViewProps) {
  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(new Set(['A5']));

  const toggleDomain = (domainId: string) => {
    const newExpanded = new Set(expandedDomains);
    if (newExpanded.has(domainId)) {
      newExpanded.delete(domainId);
    } else {
      newExpanded.add(domainId);
    }
    setExpandedDomains(newExpanded);
  };

  const getStatus = (controlId: string) => {
    const answer = project?.answers[controlId];
    return answer?.status || 'missing';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready': return <CheckCircle size={18} className="status-icon ready" />;
      case 'partial': return <AlertCircle size={18} className="status-icon partial" />;
      default: return <XCircle size={18} className="status-icon missing" />;
    }
  };

  // Group controls by domain
  const controlsByDomain = controls.reduce((acc, control) => {
    if (!acc[control.domainId]) {
      acc[control.domainId] = [];
    }
    acc[control.domainId].push(control);
    return acc;
  }, {} as Record<string, Control[]>);

  return (
    <div className="story-view">
      {Object.entries(controlsByDomain).map(([domainId, domainControls]) => {
        const ready = domainControls.filter(c => getStatus(c.id) === 'ready').length;
        const partial = domainControls.filter(c => getStatus(c.id) === 'partial').length;
        const missing = domainControls.filter(c => getStatus(c.id) === 'missing').length;
        const progress = Math.round((ready / domainControls.length) * 100);
        const isExpanded = expandedDomains.has(domainId);

        return (
          <div key={domainId} className="story-domain">
            <div 
              className="story-domain-header"
              onClick={() => toggleDomain(domainId)}
            >
              <div className="story-domain-info">
                {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                <div>
                  <h3 className="story-domain-title">{domainId}</h3>
                  <p className="story-domain-description">
                    {domainControls[0]?.domainId === 'A5' && 'Organizational Controls'}
                    {domainControls[0]?.domainId === 'A6' && 'People Controls'}
                    {domainControls[0]?.domainId === 'A7' && 'Physical Controls'}
                    {domainControls[0]?.domainId === 'A8' && 'Technological Controls'}
                  </p>
                </div>
              </div>
              <div className="story-domain-stats">
                <span className="stat-ready">✓ {ready}</span>
                <span className="stat-partial">⚠ {partial}</span>
                <span className="stat-missing">✗ {missing}</span>
                <span className="stat-progress">{progress}%</span>
              </div>
            </div>

            {isExpanded && (
              <div className="story-controls">
                {domainControls.map(control => {
                  const status = getStatus(control.id);
                  const answer = project?.answers[control.id];
                  
                  return (
                    <div
                      key={control.id}
                      className={`story-control ${status}`}
                      onClick={() => onSelectControl(control)}
                    >
                      <div className="story-control-header">
                        {getStatusIcon(status)}
                        <span className="story-control-code">{control.code}</span>
                        <h4 className="story-control-title">{control.title}</h4>
                      </div>
                      <p className="story-control-description">{control.description}</p>
                      {answer && (
                        <div className="story-control-meta">
                          {answer.owner && <span>👤 {answer.owner}</span>}
                          {answer.dueDate && <span>📅 {new Date(answer.dueDate).toLocaleDateString()}</span>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

