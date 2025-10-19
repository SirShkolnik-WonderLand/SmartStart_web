import { Stats, Control, Project, Framework } from '../types';
import { BarChart3, PieChart, TrendingUp, CheckCircle, AlertCircle, XCircle, Target, Shield, ChevronRight } from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface StatsDashboardProps {
  stats: Stats;
  controls: Control[];
  project: Project | null;
  frameworks: Framework[];
  onNavigateToDomains?: () => void;
}

export default function StatsDashboard({ stats, controls, project, frameworks, onNavigateToDomains }: StatsDashboardProps) {
  const statusData = [
    { name: 'Ready', value: stats.readyControls, color: '#22c55e' },
    { name: 'Partial', value: stats.partialControls, color: '#f59e0b' },
    { name: 'Missing', value: stats.missingControls, color: '#ef4444' }
  ];

  const domainData = controls.reduce((acc, control) => {
    const domain = control.domainId;
    if (!acc[domain]) {
      acc[domain] = { name: domain, ready: 0, partial: 0, missing: 0 };
    }
    const answer = project?.answers[control.id];
    const status = answer?.status || 'missing';
    acc[domain][status]++;
    return acc;
  }, {} as Record<string, any>);

  const chartData = Object.values(domainData);

  return (
    <div className="dashboard">
      {/* Modern Header with Quick Stats */}
      <div className="dashboard-header-modern">
        <div className="header-content">
          <div className="header-left">
            <div className="header-icon">
              <Shield size={32} />
            </div>
            <div>
              <h1 className="header-title">ISO 27001:2022 Compliance</h1>
              <p className="header-subtitle">Information Security Management System</p>
            </div>
          </div>
          {onNavigateToDomains && (
            <button className="btn-primary-action" onClick={onNavigateToDomains}>
              <span>Start Assessment</span>
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="metrics-grid-modern">
        <div className="metric-card-modern">
          <div className="metric-icon" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
            <Target size={24} color="#3b82f6" />
          </div>
          <div className="metric-content">
            <div className="metric-value">{stats.totalControls}</div>
            <div className="metric-label">Total Controls</div>
          </div>
          <div className="metric-trend">
            <span className="trend-text">93 Required</span>
          </div>
        </div>

        <div className="metric-card-modern">
          <div className="metric-icon" style={{ background: 'rgba(34, 197, 94, 0.1)' }}>
            <CheckCircle size={24} color="#22c55e" />
          </div>
          <div className="metric-content">
            <div className="metric-value">{stats.readyControls}</div>
            <div className="metric-label">Ready</div>
          </div>
          <div className="metric-trend positive">
            <span className="trend-text">{stats.readinessPercentage}%</span>
          </div>
        </div>

        <div className="metric-card-modern">
          <div className="metric-icon" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
            <AlertCircle size={24} color="#f59e0b" />
          </div>
          <div className="metric-content">
            <div className="metric-value">{stats.partialControls}</div>
            <div className="metric-label">In Progress</div>
          </div>
          <div className="metric-trend warning">
            <span className="trend-text">Needs Work</span>
          </div>
        </div>

        <div className="metric-card-modern">
          <div className="metric-icon" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
            <XCircle size={24} color="#ef4444" />
          </div>
          <div className="metric-content">
            <div className="metric-value">{stats.missingControls}</div>
            <div className="metric-label">Missing</div>
          </div>
          <div className="metric-trend negative">
            <span className="trend-text">Action Required</span>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.2)' }}>
            <Target size={24} color="#3b82f6" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.readinessPercentage}%</div>
            <div className="stat-label">Readiness</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(34, 197, 94, 0.2)' }}>
            <CheckCircle size={24} color="#22c55e" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.readyControls}</div>
            <div className="stat-label">Ready</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(251, 191, 36, 0.2)' }}>
            <AlertCircle size={24} color="#fbbf24" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.partialControls}</div>
            <div className="stat-label">Partial</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.2)' }}>
            <XCircle size={24} color="#ef4444" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.missingControls}</div>
            <div className="stat-label">Missing</div>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>
            <PieChart size={20} />
            Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>
            <BarChart3 size={20} />
            Domain Progress
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(59, 130, 246, 0.2)" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #3b82f6', borderRadius: '8px' }} />
              <Legend />
              <Bar dataKey="ready" stackId="a" fill="#22c55e" name="Ready" />
              <Bar dataKey="partial" stackId="a" fill="#f59e0b" name="Partial" />
              <Bar dataKey="missing" stackId="a" fill="#ef4444" name="Missing" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="progress-card">
        <h3>
          <TrendingUp size={20} />
          Overall Progress
        </h3>
        <div className="progress-bar-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${stats.progressPercentage}%` }}
            ></div>
          </div>
          <div className="progress-text">{stats.progressPercentage}% Complete</div>
        </div>
      </div>
    </div>
  );
}

