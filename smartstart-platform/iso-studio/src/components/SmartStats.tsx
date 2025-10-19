import React from 'react';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Clock, Target } from 'lucide-react';
import { Stats, Control, Project } from '../types';

interface SmartStatsProps {
  stats: Stats;
  controls: Control[];
  project: Project | null;
}

export default function SmartStats({ stats, controls, project }: SmartStatsProps) {
  // Calculate smart statistics
  const calculateSmartStats = () => {
    const statsData = [];

    // 1. Overall Progress
    statsData.push({
      icon: <Target size={24} />,
      title: 'Overall Progress',
      value: `${stats.readinessPercentage}%`,
      subtitle: `${stats.readyControls} of ${stats.totalControls} controls`,
      trend: stats.readinessPercentage > 0 ? 'up' : 'neutral',
      color: stats.readinessPercentage > 50 ? '#22c55e' : stats.readinessPercentage > 0 ? '#f59e0b' : '#ef4444',
      description: stats.readinessPercentage === 0 
        ? 'Starting your ISO 27001 journey' 
        : stats.readinessPercentage < 30 
        ? 'Early stage - focus on quick wins'
        : stats.readinessPercentage < 70
        ? 'Good progress - keep the momentum'
        : 'Excellent progress - almost there!'
    });

    // 2. Average Implementation Time
    const controlsWithDates = controls.filter(c => project?.answers[c.id]?.dueDate);
    const avgDays = controlsWithDates.length > 0 
      ? Math.round(controlsWithDates.reduce((sum, c) => {
          const answer = project?.answers[c.id];
          if (!answer?.dueDate) return sum;
          const days = Math.ceil((new Date(answer.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          return sum + days;
        }, 0) / controlsWithDates.length)
      : 0;

    statsData.push({
      icon: <Clock size={24} />,
      title: 'Avg. Timeline',
      value: avgDays > 0 ? `${avgDays} days` : 'Not set',
      subtitle: 'Average implementation time',
      trend: avgDays > 90 ? 'up' : avgDays > 30 ? 'neutral' : 'down',
      color: avgDays > 90 ? '#ef4444' : avgDays > 30 ? '#f59e0b' : '#22c55e',
      description: avgDays === 0 
        ? 'Set due dates to track progress'
        : avgDays > 90 
        ? 'Consider breaking down into smaller tasks'
        : avgDays > 30
        ? 'On track with implementation'
        : 'Excellent pace!'
    });

    // 3. Risk Level
    const highRiskControls = controls.filter(c => {
      const answer = project?.answers[c.id];
      return answer && answer.riskImpact >= 4;
    }).length;

    const riskLevel = highRiskControls === 0 ? 'Low' 
      : highRiskControls < 10 ? 'Medium' 
      : 'High';

    statsData.push({
      icon: <AlertCircle size={24} />,
      title: 'Risk Level',
      value: riskLevel,
      subtitle: `${highRiskControls} high-risk controls`,
      trend: riskLevel === 'Low' ? 'down' : riskLevel === 'Medium' ? 'neutral' : 'up',
      color: riskLevel === 'Low' ? '#22c55e' : riskLevel === 'Medium' ? '#f59e0b' : '#ef4444',
      description: riskLevel === 'Low'
        ? 'Your security posture is strong'
        : riskLevel === 'Medium'
        ? 'Address high-risk controls soon'
        : 'Critical: Prioritize high-risk controls immediately'
    });

    // 4. Completion Velocity
    const recentCompletions = controls.filter(c => {
      const answer = project?.answers[c.id];
      if (!answer || answer.status !== 'ready') return false;
      const timestamp = new Date(answer.timestamp).getTime();
      const daysSince = (Date.now() - timestamp) / (1000 * 60 * 60 * 24);
      return daysSince <= 30;
    }).length;

    statsData.push({
      icon: <TrendingUp size={24} />,
      title: 'Recent Activity',
      value: `${recentCompletions} controls`,
      subtitle: 'Completed in last 30 days',
      trend: recentCompletions > 5 ? 'up' : recentCompletions > 0 ? 'neutral' : 'down',
      color: recentCompletions > 5 ? '#22c55e' : recentCompletions > 0 ? '#f59e0b' : '#ef4444',
      description: recentCompletions === 0
        ? 'No recent completions - time to accelerate'
        : recentCompletions < 5
        ? 'Steady progress'
        : 'Excellent momentum!'
    });

    // 5. Domain Coverage
    const domains = ['A5', 'A6', 'A7', 'A8'];
    const domainProgress = domains.map(domainId => {
      const domainControls = controls.filter(c => c.domainId === domainId);
      const ready = domainControls.filter(c => project?.answers[c.id]?.status === 'ready').length;
      return { domainId, progress: Math.round((ready / domainControls.length) * 100) };
    });

    const avgDomainProgress = Math.round(
      domainProgress.reduce((sum, d) => sum + d.progress, 0) / domains.length
    );

    statsData.push({
      icon: <CheckCircle size={24} />,
      title: 'Domain Coverage',
      value: `${avgDomainProgress}%`,
      subtitle: 'Average across all domains',
      trend: avgDomainProgress > 50 ? 'up' : avgDomainProgress > 0 ? 'neutral' : 'down',
      color: avgDomainProgress > 50 ? '#22c55e' : avgDomainProgress > 0 ? '#f59e0b' : '#ef4444',
      description: avgDomainProgress === 0
        ? 'Start implementing controls across domains'
        : avgDomainProgress < 30
        ? 'Focus on completing one domain at a time'
        : avgDomainProgress < 70
        ? 'Good coverage across domains'
        : 'Excellent domain coverage!'
    });

    // 6. Effort Distribution
    const lowEffort = controls.filter(c => {
      const answer = project?.answers[c.id];
      return answer && answer.effort <= 2;
    }).length;

    statsData.push({
      icon: <TrendingDown size={24} />,
      title: 'Quick Wins Available',
      value: `${lowEffort} controls`,
      subtitle: 'Low effort, high impact',
      trend: lowEffort > 10 ? 'up' : lowEffort > 0 ? 'neutral' : 'down',
      color: lowEffort > 10 ? '#22c55e' : lowEffort > 0 ? '#f59e0b' : '#ef4444',
      description: lowEffort === 0
        ? 'Assess control complexity'
        : lowEffort < 10
        ? 'Focus on quick wins first'
        : 'Many easy wins available - start here!'
    });

    return statsData;
  };

  const smartStats = calculateSmartStats();

  return (
    <div className="smart-stats-grid">
      {smartStats.map((stat, index) => (
        <div key={index} className="smart-stat-card">
          <div className="smart-stat-icon" style={{ color: stat.color }}>
            {stat.icon}
          </div>
          <div className="smart-stat-content">
            <div className="smart-stat-header">
              <h4 className="smart-stat-title">{stat.title}</h4>
              {stat.trend === 'up' && <TrendingUp size={16} className="trend-up" />}
              {stat.trend === 'down' && <TrendingDown size={16} className="trend-down" />}
              {stat.trend === 'neutral' && <div className="trend-neutral" />}
            </div>
            <div className="smart-stat-value" style={{ color: stat.color }}>
              {stat.value}
            </div>
            <p className="smart-stat-subtitle">{stat.subtitle}</p>
            <p className="smart-stat-description">{stat.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

