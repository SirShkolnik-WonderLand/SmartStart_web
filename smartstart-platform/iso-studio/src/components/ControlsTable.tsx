import { Control, Project } from '../types';
import { CheckCircle, AlertCircle, XCircle, ChevronRight } from 'lucide-react';

interface ControlsTableProps {
  controls: Control[];
  project: Project | null;
  selectedControl: Control | null;
  onSelectControl: (control: Control) => void;
  viewStyle: 'grid' | 'table';
}

export default function ControlsTable({ controls, project, selectedControl, onSelectControl, viewStyle }: ControlsTableProps) {
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

  if (viewStyle === 'grid') {
    return (
      <div className="controls-grid-view">
        {controls.map(control => {
          const status = getStatus(control.id);
          const answer = project?.answers[control.id];
          
          return (
            <div
              key={control.id}
              className={`control-card-grid ${selectedControl?.id === control.id ? 'selected' : ''} status-${status}`}
              onClick={() => onSelectControl(control)}
            >
              <div className="control-card-header">
                <div className="control-code">{control.code}</div>
                {getStatusIcon(status)}
              </div>
              
              <h4 className="control-title">{control.title}</h4>
              <p className="control-description">{control.description.substring(0, 120)}...</p>
              
              {control.tags && control.tags.length > 0 && (
                <div className="control-tags">
                  {control.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              )}

              {answer && (
                <div className="control-meta">
                  {answer.owner && <span className="meta-item">👤 {answer.owner}</span>}
                  {answer.dueDate && <span className="meta-item">📅 {new Date(answer.dueDate).toLocaleDateString()}</span>}
                </div>
              )}

              <div className="control-footer">
                <ChevronRight size={16} />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="controls-table-view">
      <table className="controls-table">
        <thead>
          <tr>
            <th>Status</th>
            <th>Code</th>
            <th>Control</th>
            <th>Owner</th>
            <th>Due Date</th>
            <th>Tags</th>
          </tr>
        </thead>
        <tbody>
          {controls.map(control => {
            const status = getStatus(control.id);
            const answer = project?.answers[control.id];
            
            return (
              <tr
                key={control.id}
                className={`table-row ${selectedControl?.id === control.id ? 'selected' : ''} status-${status}`}
                onClick={() => onSelectControl(control)}
              >
                <td>{getStatusIcon(status)}</td>
                <td className="code-cell">{control.code}</td>
                <td className="title-cell">
                  <div className="control-title">{control.title}</div>
                  <div className="control-description">{control.description.substring(0, 80)}...</div>
                </td>
                <td>{answer?.owner || '-'}</td>
                <td>{answer?.dueDate ? new Date(answer.dueDate).toLocaleDateString() : '-'}</td>
                <td>
                  <div className="table-tags">
                    {control.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

