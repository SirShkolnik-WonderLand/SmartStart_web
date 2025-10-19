import { Shield, CheckCircle, AlertCircle, XCircle, TrendingUp } from 'lucide-react';

interface EmptyStateProps {
  type: 'no-data' | 'no-results' | 'no-assessments';
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({ type, title, message, action }: EmptyStateProps) {
  const icons = {
    'no-data': <Shield size={80} />,
    'no-results': <AlertCircle size={80} />,
    'no-assessments': <TrendingUp size={80} />
  };

  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        {icons[type]}
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-message">{message}</p>
      {action && (
        <button className="btn-primary" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}

