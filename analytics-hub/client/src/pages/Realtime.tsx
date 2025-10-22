/**
 * REAL-TIME PAGE
 * Live visitor tracking with animations
 */

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Activity, Users, Eye, MapPin, Smartphone } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { VisitorMap } from '@/components/charts/VisitorMap';
import { analyticsApi } from '@/services/api';
import { useWebSocket } from '@/services/websocket';
import type { RealtimeStats } from '@shared/types';

const RealtimeContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xl};
`;

const PageHeader = styled(motion.div)`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  
  h1 {
    font-size: ${({ theme }) => theme.typography.h2};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.md};
    
    .pulse {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: ${({ theme }) => theme.colors.success};
      animation: pulse 2s ease-in-out infinite;
    }
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

const BigNumber = styled(motion.div)`
  font-size: ${({ theme }) => theme.typography.h1};
  font-weight: 700;
  font-family: ${({ theme }) => theme.typography.fontFamilyDisplay};
  color: ${({ theme }) => theme.colors.primary};
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl} 0;
`;

const ActivePagesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  max-height: 400px;
  overflow-y: auto;
`;

const ActivePageItem = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.cardHover};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border-left: 3px solid ${({ theme }) => theme.colors.primary};
  
  .url {
    flex: 1;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.text};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .count {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.xs};
    padding: 4px 12px;
    background: ${({ theme }) => theme.colors.primary}20;
    color: ${({ theme }) => theme.colors.primary};
    border-radius: ${({ theme }) => theme.borderRadius.full};
    font-weight: 600;
    font-size: ${({ theme }) => theme.typography.small};
  }
`;

const EventFeed = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  max-height: 500px;
  overflow-y: auto;
`;

const EventItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.card};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: ${({ theme }) => theme.shadows.soft};
  
  .icon {
    width: 32px;
    height: 32px;
    border-radius: ${({ theme }) => theme.borderRadius.sm};
    background: ${({ theme }) => theme.colors.primary}15;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${({ theme }) => theme.colors.primary};
    
    svg {
      width: 16px;
      height: 16px;
    }
  }
  
  .details {
    flex: 1;
    
    .type {
      font-weight: 600;
      color: ${({ theme }) => theme.colors.text};
      font-size: ${({ theme }) => theme.typography.small};
    }
    
    .meta {
      font-size: ${({ theme }) => theme.typography.tiny};
      color: ${({ theme }) => theme.colors.textMuted};
    }
  }
  
  .time {
    font-size: ${({ theme }) => theme.typography.tiny};
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

export function Realtime() {
  const { connect, isConnected } = useWebSocket();
  const [liveStats, setLiveStats] = useState<RealtimeStats | null>(null);

  // Fetch real-time stats
  const { data: realtimeData } = useQuery({
    queryKey: ['realtime-stats'],
    queryFn: () => analyticsApi.getRealtime(),
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Connect to WebSocket and listen for updates
  useEffect(() => {
    connect();

    const handleRealtimeUpdate = (event: CustomEvent) => {
      setLiveStats((prev) => ({
        ...prev,
        ...event.detail,
      } as RealtimeStats));
    };

    window.addEventListener('realtime-update', handleRealtimeUpdate as EventListener);

    return () => {
      window.removeEventListener('realtime-update', handleRealtimeUpdate as EventListener);
    };
  }, []);

  const stats = liveStats || realtimeData?.data;

  return (
    <RealtimeContainer>
      {/* Page header */}
      <PageHeader
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>
          <span className="pulse" />
          Real-Time Analytics
        </h1>
        <p>Live visitor tracking • Updates every 5 seconds</p>
      </PageHeader>

      {/* Live stats */}
      <StatsGrid>
        <Card>
          <CardHeader>
            <CardTitle>
              <Users size={20} />
              Active Visitors
            </CardTitle>
          </CardHeader>
          <BigNumber
            key={stats?.activeVisitors}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            {stats?.activeVisitors || 0}
          </BigNumber>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <Activity size={20} />
              Active Sessions
            </CardTitle>
          </CardHeader>
          <BigNumber
            key={stats?.activeSessions}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            {stats?.activeSessions || 0}
          </BigNumber>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <Eye size={20} />
              Page Views (5 min)
            </CardTitle>
          </CardHeader>
          <BigNumber
            key={stats?.recentEvents?.length}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            {stats?.recentEvents?.length || 0}
          </BigNumber>
        </Card>
      </StatsGrid>

      {/* Visitor Map */}
      <Card>
        <CardHeader>
          <CardTitle>
            <MapPin size={20} />
            Live Visitor Locations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <VisitorMap
            locations={[
              {
                id: 'toronto-1',
                lat: 43.6532,
                lng: -79.3832,
                city: 'Toronto',
                country: 'Canada',
                count: 15,
                lastSeen: new Date().toISOString(),
                deviceType: 'Desktop',
                browser: 'Chrome'
              },
              {
                id: 'markham-1',
                lat: 43.8668,
                lng: -79.2663,
                city: 'Markham',
                country: 'Canada',
                count: 8,
                lastSeen: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
                deviceType: 'Mobile',
                browser: 'Safari'
              },
              {
                id: 'mississauga-1',
                lat: 43.5890,
                lng: -79.6441,
                city: 'Mississauga',
                country: 'Canada',
                count: 12,
                lastSeen: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
                deviceType: 'Desktop',
                browser: 'Firefox'
              }
            ]}
            width={800}
            height={400}
            animated={true}
            title="Real-time Visitor Map"
            subtitle="Live visitor locations across the GTA"
          />
        </CardContent>
      </Card>

      {/* Active pages */}
      <Card>
        <CardHeader>
          <CardTitle>Active Pages</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivePagesList>
            <AnimatePresence>
              {stats?.activePages && stats.activePages.length > 0 ? (
                stats.activePages.map((page, index) => (
                  <ActivePageItem
                    key={page.url}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <div className="url">{page.url}</div>
                    <div className="count">
                      <Eye size={14} />
                      {page.count}
                    </div>
                  </ActivePageItem>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ textAlign: 'center', padding: '40px', color: '#8492a6' }}
                >
                  No active visitors right now
                </motion.div>
              )}
            </AnimatePresence>
          </ActivePagesList>
        </CardContent>
      </Card>

      {/* Recent events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <EventFeed>
            <AnimatePresence>
              {stats?.recentEvents?.slice(0, 10).map((event, index) => (
                <EventItem
                  key={event.id || index}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="icon">
                    {event.eventType === 'page_view' && <Eye />}
                    {event.eventType === 'click' && <MousePointerClick />}
                    {event.eventType === 'conversion' && <Target />}
                  </div>
                  <div className="details">
                    <div className="type">
                      {event.eventType === 'page_view' && 'Page View'}
                      {event.eventType === 'click' && 'Click'}
                      {event.eventType === 'conversion' && 'Conversion'}
                    </div>
                    <div className="meta">
                      {event.pageTitle || event.pageUrl} • {event.city}, {event.countryCode}
                    </div>
                  </div>
                  <div className="time">Just now</div>
                </EventItem>
              ))}
            </AnimatePresence>
          </EventFeed>
        </CardContent>
      </Card>

      {/* Connection status */}
      {!isConnected() && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: '#ef444420',
            padding: '12px 20px',
            borderRadius: '50px',
            color: '#ef4444',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          Real-time updates disconnected
        </motion.div>
      )}
    </RealtimeContainer>
  );
}
