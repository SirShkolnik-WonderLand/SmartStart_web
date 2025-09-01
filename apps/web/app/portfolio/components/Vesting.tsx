'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../components/AuthProvider';
import { apiCall } from '../../utils/api';

interface VestingSchedule {
  id: string;
  projectId: string;
  projectName: string;
  totalEquity: number;
  vestedEquity: number;
  unvestedEquity: number;
  vestingType: 'IMMEDIATE' | 'CLIFF' | 'GRADUAL';
  startDate: Date;
  endDate?: Date;
  cliffDate?: Date;
  vestingPeriod: number; // in months
  vestingEvents: VestingEvent[];
  status: 'ACTIVE' | 'COMPLETED' | 'TERMINATED';
  progress: number; // 0-100
}

interface VestingEvent {
  id: string;
  date: Date;
  equityAmount: number;
  type: 'CLIFF' | 'GRADUAL' | 'ACCELERATION';
  status: 'PENDING' | 'COMPLETED' | 'FORFEITED';
  notes?: string;
}

interface VestingStats {
  totalSchedules: number;
  totalEquity: number;
  totalVested: number;
  totalUnvested: number;
  averageProgress: number;
  nextVestingDate?: Date;
  nextVestingAmount: number;
}

export default function Vesting() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<VestingSchedule[]>([]);
  const [stats, setStats] = useState<VestingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSchedule, setSelectedSchedule] = useState<VestingSchedule | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'cliff'>('all');

  useEffect(() => {
    fetchVestingData();
  }, []);

  const fetchVestingData = async () => {
    try {
      const vestingResponse = await apiCall(`/smart-contracts/vesting/${user?.id}`);
      if (vestingResponse && Array.isArray(vestingResponse)) {
        const userSchedules = vestingResponse.map((schedule: any) => {
          const progress = schedule.totalEquity > 0 
            ? (schedule.vestedEquity / schedule.totalEquity) * 100 
            : 0;
          
          return {
            id: schedule.id,
            projectId: schedule.projectId,
            projectName: schedule.project?.name || 'Unknown Project',
            totalEquity: schedule.totalEquity || 0,
            vestedEquity: schedule.vestedEquity || 0,
            unvestedEquity: schedule.unvestedEquity || 0,
            vestingType: schedule.vestingType || 'GRADUAL',
            startDate: new Date(schedule.vestingStart || schedule.createdAt),
            endDate: schedule.vestingEnd ? new Date(schedule.vestingEnd) : undefined,
            cliffDate: schedule.cliffDate ? new Date(schedule.cliffDate) : undefined,
            vestingPeriod: schedule.vestingPeriod || 48,
            vestingEvents: (schedule.vestingEvents || []).map((event: any) => ({
              id: event.id,
              date: new Date(event.vestingDate),
              equityAmount: event.equityAmount || 0,
              type: event.type || 'GRADUAL',
              status: event.status || 'PENDING',
              notes: event.notes
            })),
            status: schedule.status || 'ACTIVE',
            progress
          };
        });
        setSchedules(userSchedules);
        calculateStats(userSchedules);
      }
    } catch (error) {
      console.error('Error fetching vesting data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (scheduleList: VestingSchedule[]) => {
    const totalSchedules = scheduleList.length;
    const totalEquity = scheduleList.reduce((sum, s) => sum + s.totalEquity, 0);
    const totalVested = scheduleList.reduce((sum, s) => sum + s.vestedEquity, 0);
    const totalUnvested = scheduleList.reduce((sum, s) => sum + s.unvestedEquity, 0);
    const averageProgress = totalSchedules > 0 
      ? scheduleList.reduce((sum, s) => sum + s.progress, 0) / totalSchedules 
      : 0;

    // Find next vesting event
    const now = new Date();
    const upcomingEvents = scheduleList
      .flatMap(s => s.vestingEvents)
      .filter(e => e.date > now && e.status === 'PENDING')
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    const nextVestingDate = upcomingEvents.length > 0 ? upcomingEvents[0].date : undefined;
    const nextVestingAmount = upcomingEvents.length > 0 ? upcomingEvents[0].equityAmount : 0;

    setStats({
      totalSchedules,
      totalEquity,
      totalVested,
      totalUnvested,
      averageProgress,
      nextVestingDate,
      nextVestingAmount
    });
  };

  const getFilteredSchedules = () => {
    switch (filter) {
      case 'active':
        return schedules.filter(s => s.status === 'ACTIVE');
      case 'completed':
        return schedules.filter(s => s.status === 'COMPLETED');
      case 'cliff':
        return schedules.filter(s => s.vestingType === 'CLIFF');
      default:
        return schedules;
    }
  };

  const getVestingTypeIcon = (type: string) => {
    switch (type) {
      case 'IMMEDIATE': return '⚡';
      case 'CLIFF': return '🏔️';
      case 'GRADUAL': return '📈';
      default: return '⏰';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-600 bg-green-50 border-green-200';
      case 'COMPLETED': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'TERMINATED': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-600';
    if (progress >= 60) return 'text-blue-600';
    if (progress >= 40) return 'text-yellow-600';
    if (progress >= 20) return 'text-orange-600';
    return 'text-red-600';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTimeUntilVesting = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const months = Math.floor(days / 30);
    
    if (months > 0) return `${months} month${months > 1 ? 's' : ''}`;
    if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
    return 'Today';
  };

  if (loading) {
    return (
      <div className="vesting-container">
        <div className="loading-spinner"></div>
        <p>Loading vesting schedules...</p>
      </div>
    );
  }

  return (
    <div className="vesting-container">
      {/* Vesting Summary */}
      <div className="vesting-summary">
        <div className="summary-stats">
          <div className="summary-stat">
            <h3>Total Schedules</h3>
            <p className="stat-number">{stats?.totalSchedules || 0}</p>
          </div>
          <div className="summary-stat">
            <h3>Total Equity</h3>
            <p className="stat-number">{stats?.totalEquity?.toFixed(1) || '0'}%</p>
          </div>
          <div className="summary-stat">
            <h3>Vested Equity</h3>
            <p className="stat-number">{stats?.totalVested?.toFixed(1) || '0'}%</p>
          </div>
          <div className="summary-stat">
            <h3>Unvested Equity</h3>
            <p className="stat-number">{stats?.totalUnvested?.toFixed(1) || '0'}%</p>
          </div>
        </div>

        {/* Next Vesting Alert */}
        {stats?.nextVestingDate && (
          <div className="next-vesting-alert">
            <h4>⏰ Next Vesting Event</h4>
            <p className="next-vesting-date">
              {formatDate(stats.nextVestingDate)} ({getTimeUntilVesting(stats.nextVestingDate)})
            </p>
            <p className="next-vesting-amount">
              {stats.nextVestingAmount.toFixed(1)}% equity will vest
            </p>
          </div>
        )}
      </div>

      {/* Filter Controls */}
      <div className="filter-controls">
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Schedules ({schedules.length})
          </button>
          <button 
            className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            Active ({schedules.filter(s => s.status === 'ACTIVE').length})
          </button>
          <button 
            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed ({schedules.filter(s => s.status === 'COMPLETED').length})
          </button>
          <button 
            className={`filter-btn ${filter === 'cliff' ? 'active' : ''}`}
            onClick={() => setFilter('cliff')}
          >
            Cliff ({schedules.filter(s => s.vestingType === 'CLIFF').length})
          </button>
        </div>
      </div>

      {/* Vesting Schedules Grid */}
      <div className="vesting-grid">
        {getFilteredSchedules().length > 0 ? (
          getFilteredSchedules().map((schedule) => (
            <div key={schedule.id} className="vesting-card" onClick={() => setSelectedSchedule(schedule)}>
              <div className="vesting-header">
                <div className="vesting-title">
                  <span className="vesting-icon">{getVestingTypeIcon(schedule.vestingType)}</span>
                  <h3>{schedule.projectName}</h3>
                </div>
                <div className="vesting-status">
                  <span className={`status-badge ${getStatusColor(schedule.status)}`}>
                    {schedule.status}
                  </span>
                </div>
              </div>

              <div className="vesting-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${schedule.progress}%` }}
                  ></div>
                </div>
                <span className={`progress-text ${getProgressColor(schedule.progress)}`}>
                  {schedule.progress.toFixed(1)}% vested
                </span>
              </div>

              <div className="vesting-details">
                <div className="detail-row">
                  <span className="detail-label">Total Equity:</span>
                  <span className="detail-value">{schedule.totalEquity.toFixed(1)}%</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Vested:</span>
                  <span className="detail-value positive">{schedule.vestedEquity.toFixed(1)}%</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Unvested:</span>
                  <span className="detail-value">{schedule.unvestedEquity.toFixed(1)}%</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Vesting Type:</span>
                  <span className="detail-value">{schedule.vestingType}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Start Date:</span>
                  <span className="detail-value">{formatDate(schedule.startDate)}</span>
                </div>
                {schedule.endDate && (
                  <div className="detail-row">
                    <span className="detail-label">End Date:</span>
                    <span className="detail-value">{formatDate(schedule.endDate)}</span>
                  </div>
                )}
              </div>

              {/* Upcoming Events */}
              {schedule.vestingEvents.length > 0 && (
                <div className="upcoming-events">
                  <h4>Upcoming Events</h4>
                  <div className="events-list">
                    {schedule.vestingEvents
                      .filter(e => e.date > new Date() && e.status === 'PENDING')
                      .slice(0, 2)
                      .map((event, index) => (
                        <div key={event.id} className="event-item">
                          <span className="event-date">{formatDate(event.date)}</span>
                          <span className="event-amount">+{event.equityAmount.toFixed(1)}%</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="no-vesting">
            <p>No vesting schedules found for the selected filter.</p>
          </div>
        )}
      </div>

      {/* Vesting Schedule Detail Modal */}
      {selectedSchedule && (
        <div className="modal-overlay" onClick={() => setSelectedSchedule(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedSchedule.projectName}</h2>
              <button className="close-btn" onClick={() => setSelectedSchedule(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="modal-section">
                <h3>Vesting Overview</h3>
                <div className="vesting-overview">
                  <div className="overview-item">
                    <span className="overview-label">Total Equity:</span>
                    <span className="overview-value">{selectedSchedule.totalEquity.toFixed(1)}%</span>
                  </div>
                  <div className="overview-item">
                    <span className="overview-label">Vested:</span>
                    <span className="overview-value positive">{selectedSchedule.vestedEquity.toFixed(1)}%</span>
                  </div>
                  <div className="overview-item">
                    <span className="overview-label">Unvested:</span>
                    <span className="overview-value">{selectedSchedule.unvestedEquity.toFixed(1)}%</span>
                  </div>
                  <div className="overview-item">
                    <span className="overview-label">Progress:</span>
                    <span className={`overview-value ${getProgressColor(selectedSchedule.progress)}`}>
                      {selectedSchedule.progress.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <h3>Vesting Schedule</h3>
                <div className="schedule-details">
                  <div className="schedule-detail">
                    <span className="detail-label">Type:</span>
                    <span className="detail-value">{selectedSchedule.vestingType}</span>
                  </div>
                  <div className="schedule-detail">
                    <span className="detail-label">Period:</span>
                    <span className="detail-value">{selectedSchedule.vestingPeriod} months</span>
                  </div>
                  <div className="schedule-detail">
                    <span className="detail-label">Start Date:</span>
                    <span className="detail-value">{formatDate(selectedSchedule.startDate)}</span>
                  </div>
                  {selectedSchedule.endDate && (
                    <div className="schedule-detail">
                      <span className="detail-label">End Date:</span>
                      <span className="detail-value">{formatDate(selectedSchedule.endDate)}</span>
                    </div>
                  )}
                  {selectedSchedule.cliffDate && (
                    <div className="schedule-detail">
                      <span className="detail-label">Cliff Date:</span>
                      <span className="detail-value">{formatDate(selectedSchedule.cliffDate)}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedSchedule.vestingEvents.length > 0 && (
                <div className="modal-section">
                  <h3>Vesting Events</h3>
                  <div className="events-timeline">
                    {selectedSchedule.vestingEvents
                      .sort((a, b) => a.date.getTime() - b.date.getTime())
                      .map((event) => (
                        <div key={event.id} className="timeline-event">
                          <div className="event-date">{formatDate(event.date)}</div>
                          <div className="event-content">
                            <div className="event-amount">+{event.equityAmount.toFixed(1)}%</div>
                            <div className="event-type">{event.type}</div>
                            <div className={`event-status ${event.status.toLowerCase()}`}>
                              {event.status}
                            </div>
                            {event.notes && <div className="event-notes">{event.notes}</div>}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
