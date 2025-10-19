import { Stats, Control, Project, Framework } from '../types';
import { BarChart3, PieChart, TrendingUp, CheckCircle, AlertCircle, XCircle, Target, Shield, ChevronRight, Activity } from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

interface StatsDashboardProps {
  stats: Stats;
  controls: Control[];
  project: Project | null;
  frameworks: Framework[];
  onNavigateToDomains?: () => void;
}

export default function StatsDashboard({ stats, controls, project, frameworks, onNavigateToDomains }: StatsDashboardProps) {
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
        {onNavigateToDomains && (
          <button className="btn-primary-modern" onClick={onNavigateToDomains}>
            <span>View Domains</span>
            <ChevronRight size={20} />
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="stats-cards-modern">
        <div className="stat-card-new">
          <div className="stat-icon-new blue">
            <Target size={32} />
          </div>
          <div className="stat-info">
            <div className="stat-value-new">{stats.totalControls}</div>
            <div className="stat-label-new">Total Controls</div>
            <div className="stat-badge-new">93 Required</div>
          </div>
        </div>

        <div className="stat-card-new">
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

        <div className="stat-card-new">
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

        <div className="stat-card-new">
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

      {/* Charts Section */}
      <div className="charts-section-modern">
        <div className="chart-card-new">
          <div className="chart-header-new">
            <div className="chart-icon-new">
              <PieChart size={24} />
            </div>
            <h3 className="chart-title-new">Status Distribution</h3>
          </div>
          <div className="chart-content-new">
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card-new">
          <div className="chart-header-new">
            <div className="chart-icon-new">
              <BarChart3 size={24} />
            </div>
            <h3 className="chart-title-new">Domain Progress</h3>
          </div>
          <div className="chart-content-new">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" />
                <Tooltip />
                <Legend />
                <Bar dataKey="ready" stackId="a" fill="#22c55e" name="Ready" />
                <Bar dataKey="partial" stackId="a" fill="#f59e0b" name="Partial" />
                <Bar dataKey="missing" stackId="a" fill="#ef4444" name="Missing" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
