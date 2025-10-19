import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: 'ready' | 'partial' | 'missing';
  count?: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function StatusBadge({ status, count, size = 'md' }: StatusBadgeProps) {
  const icons = {
    ready: <CheckCircle size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />,
    partial: <AlertCircle size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />,
    missing: <XCircle size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
  };

  const config = {
    ready: { 
      icon: icons.ready, 
      label: 'Ready', 
      color: 'var(--success)',
      bg: 'rgba(34, 197, 94, 0.1)',
      border: 'rgba(34, 197, 94, 0.3)'
    },
    partial: { 
      icon: icons.partial, 
      label: 'Partial', 
      color: 'var(--warning)',
      bg: 'rgba(245, 158, 11, 0.1)',
      border: 'rgba(245, 158, 11, 0.3)'
    },
    missing: { 
      icon: icons.missing, 
      label: 'Missing', 
      color: 'var(--danger)',
      bg: 'rgba(239, 68, 68, 0.1)',
      border: 'rgba(239, 68, 68, 0.3)'
    }
  };

  const { icon, label, color, bg, border } = config[status];

  return (
    <div 
      className={`status-badge status-badge-${status} status-badge-${size}`}
      style={{ 
        color, 
        background: bg, 
        borderColor: border 
      }}
    >
      {icon}
      <span>{count !== undefined ? `${count} ${label}` : label}</span>
    </div>
  );
}

