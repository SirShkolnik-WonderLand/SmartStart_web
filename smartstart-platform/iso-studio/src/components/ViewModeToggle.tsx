import { FileText, List, Grid3x3, BookOpen } from 'lucide-react';

type ViewMode = 'story' | 'list' | 'compact';

interface ViewModeToggleProps {
  currentMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

export default function ViewModeToggle({ currentMode, onModeChange }: ViewModeToggleProps) {
  const modes = [
    { id: 'story' as ViewMode, icon: BookOpen, label: 'Story', description: 'Audit narrative' },
    { id: 'list' as ViewMode, icon: List, label: 'List', description: 'Detailed table' },
    { id: 'compact' as ViewMode, icon: Grid3x3, label: 'Compact', description: 'Card view' }
  ];

  return (
    <div className="view-mode-toggle">
      <span className="view-mode-label">View Mode:</span>
      <div className="view-mode-buttons">
        {modes.map(mode => {
          const Icon = mode.icon;
          return (
            <button
              key={mode.id}
              className={`view-mode-btn ${currentMode === mode.id ? 'active' : ''}`}
              onClick={() => onModeChange(mode.id)}
              title={mode.description}
            >
              <Icon size={18} />
              <span>{mode.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

