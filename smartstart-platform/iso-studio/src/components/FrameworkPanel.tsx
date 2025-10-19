import { Framework } from '../types';
import { FileText } from 'lucide-react';

interface FrameworkPanelProps {
  frameworks: Framework[];
  selectedFramework: Framework | null;
  onSelectFramework: (framework: Framework) => void;
}

export default function FrameworkPanel({ frameworks, selectedFramework, onSelectFramework }: FrameworkPanelProps) {
  return (
    <div className="panel frameworks-panel">
      <div className="panel-header">
        <FileText size={20} />
        <span>Frameworks</span>
      </div>
      
      <div className="frameworks-list">
        {frameworks.map(framework => (
          <div
            key={framework.id}
            className={`framework-card ${selectedFramework?.id === framework.id ? 'active' : ''}`}
            onClick={() => onSelectFramework(framework)}
          >
            <div className="framework-code">{framework.key}</div>
            <div className="framework-name">{framework.name}</div>
            <div className="framework-stats">
              {framework.domains.length} domains • {framework.controlCount} controls
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

