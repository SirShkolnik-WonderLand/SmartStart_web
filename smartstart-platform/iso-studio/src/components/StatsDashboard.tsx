import { Stats, Control, Project, Framework } from '../types';
import { BarChart3, PieChart, TrendingUp, CheckCircle, AlertCircle, XCircle, Target, Shield, ChevronRight, Activity } from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Dashboard.css';
import AdvisorBot from './AdvisorBot';
import SmartStats from './SmartStats';

interface StatsDashboardProps {
  stats: Stats;
  controls: Control[];
  project: Project | null;
  frameworks: Framework[];
  onNavigateToDomains?: () => void;
  onNavigateToControls?: () => void;
}

export default function StatsDashboard({ stats, controls, project, frameworks, onNavigateToDomains, onNavigateToControls }: StatsDashboardProps) {
  // Prepare data for charts
  const statusData = [
    { name: 'Ready', value: stats.readyControls, color: '#22c55e' },
    { name: 'Partial', value: stats.partialControls, color: '#f59e0b' },
    { name: 'Missing', value: stats.missingControls, color: '#ef4444' }
  ];

  // Group controls by domain for bar chart
  const domainData = controls.reduce((acc, control) => {
    if (!acc[control.domainId]) {
      acc[control.domainId] = { name: control.domainId, ready: 0, partial: 0, missing: 0 };
    }
    const status = project?.answers[control.id]?.status || 'missing';
    acc[control.domainId][status]++;
    return acc;
  }, {} as Record<string, any>);

  const chartData = Object.values(domainData);

  return (
    <div className="dashboard-modern">
      {/* Header */}
      <div className="dashboard-header-modern">
        <div className="header-left-modern">
          <div className="header-icon-modern">
            <Shield size={40} />
          </div>
          <div>
            <h1 className="header-title-modern">ISO 27001:2022 Compliance</h1>
            <p className="header-subtitle-modern">Track your progress across all 93 controls</p>
          </div>
        </div>
        <div className="header-actions-modern">
          {onNavigateToDomains && (
            <button className="btn-primary-modern" onClick={onNavigateToDomains}>
              <span>View Domains</span>
              <ChevronRight size={20} />
            </button>
          )}
          {onNavigateToControls && (
            <button className="btn-secondary-modern" onClick={onNavigateToControls}>
              <span>View Controls</span>
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Advisor Bot */}
      <AdvisorBot stats={stats} controls={controls} project={project} />

      {/* Stats Cards - Clickable */}
      <div className="stats-cards-modern">
        <div 
          className="stat-card-new clickable" 
          onClick={() => onNavigateToControls?.()}
          title="Click to view all controls"
        >
          <div className="stat-icon-new blue">
            <Target size={32} />
          </div>
          <div className="stat-info">
            <div className="stat-value-new">{stats.totalControls}</div>
            <div className="stat-label-new">Total Controls</div>
            <div className="stat-badge-new">93 Required</div>
          </div>
        </div>

        <div 
          className="stat-card-new clickable" 
          onClick={() => onNavigateToControls?.()}
          title="Click to view ready controls"
        >
          <div className="stat-icon-new green">
            <CheckCircle size={32} />
          </div>
          <div className="stat-info">
            <div className="stat-value-new">{stats.readyControls}</div>
            <div className="stat-label-new">Ready</div>
            <div className="stat-progress-new">
              <div className="progress-bar-new">
                <div className="progress-fill-new" style={{ width: `${stats.readinessPercentage}%`, background: '#22c55e' }}></div>
              </div>
              <span className="progress-text-new">{stats.readinessPercentage}%</span>
            </div>
          </div>
        </div>

        <div 
          className="stat-card-new clickable" 
          onClick={() => onNavigateToControls?.()}
          title="Click to view partial controls"
        >
          <div className="stat-icon-new orange">
            <AlertCircle size={32} />
          </div>
          <div className="stat-info">
            <div className="stat-value-new">{stats.partialControls}</div>
            <div className="stat-label-new">In Progress</div>
            <div className="stat-progress-new">
              <div className="progress-bar-new">
                <div className="progress-fill-new" style={{ width: `${(stats.partialControls / stats.totalControls) * 100}%`, background: '#f59e0b' }}></div>
              </div>
              <span className="progress-text-new">Needs Work</span>
            </div>
          </div>
        </div>

        <div 
          className="stat-card-new clickable" 
          onClick={() => onNavigateToControls?.()}
          title="Click to view missing controls"
        >
          <div className="stat-icon-new red">
            <XCircle size={32} />
          </div>
          <div className="stat-info">
            <div className="stat-value-new">{stats.missingControls}</div>
            <div className="stat-label-new">Missing</div>
            <div className="stat-progress-new">
              <div className="progress-bar-new">
                <div className="progress-fill-new" style={{ width: `${(stats.missingControls / stats.totalControls) * 100}%`, background: '#ef4444' }}></div>
              </div>
              <span className="progress-text-new">Action Required</span>
            </div>
          </div>
        </div>
      </div>

      {/* Smart Stats - Replaces Charts */}
      <SmartStats stats={stats} controls={controls} project={project} />
    </div>
  );
}
