/**
 * MAIN DASHBOARD PAGE
 * Overview with KPIs, charts, and real-time data
 */

import { useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Users, Eye, Target, Activity } from 'lucide-react';
import { KPICard } from '@/components/widgets/KPICard';
import { KPIGrid, ChartsGrid, StatsGrid } from '@/components/ui/ResponsiveGrid';
import { LineChart, PieChart } from '@/components/charts';
import { analyticsApi } from '@/services/api';
import { useDashboardStore } from '@/store/dashboardStore';
import { useWebSocket } from '@/services/websocket';

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xl};
`;

const PageHeader = styled(motion.div)`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  
  h1 {
    font-size: ${({ theme }) => theme.typography.h2};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    background: ${({ theme }) => theme.gradients.cosmic};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  p {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const StyledKPIGrid = styled(KPIGrid)`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const StyledChartsGrid = styled(ChartsGrid)`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const StyledStatsGrid = styled(StatsGrid)`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const LoadingContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: ${({ theme }) => theme.spacing.lg};
  
  .spinner {
    width: 60px;
    height: 60px;
    border: 4px solid ${({ theme }) => theme.colors.border};
    border-top-color: ${({ theme }) => theme.colors.primary};
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  p {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: ${({ theme }) => theme.typography.small};
  }
`;

export function Dashboard() {
  console.log('Dashboard component mounted!');
  
  const dateRange = useDashboardStore((state) => state.dateRange);
  const token = useDashboardStore((state) => state.token);
  const { connect, isConnected } = useWebSocket();

  // Debug logging
  console.log('Dashboard token:', token);

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['dashboard-stats', dateRange],
    queryFn: () => {
      console.log('Fetching dashboard stats...');
      return analyticsApi.getOverview(dateRange);
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Debug logging
  console.log('Dashboard stats:', { stats, statsLoading, statsError });

  // Fetch traffic trends
  const { data: trends, isLoading: trendsLoading } = useQuery({
    queryKey: ['traffic-trends', dateRange],
    queryFn: () => analyticsApi.getTrends(dateRange, 'day'),
    refetchInterval: 60000, // Refresh every minute
  });

  // Fetch device breakdown
  const { data: devices, isLoading: devicesLoading } = useQuery({
    queryKey: ['device-breakdown', dateRange],
    queryFn: () => analyticsApi.getDevices(dateRange),
    refetchInterval: 60000,
  });

  // Fetch traffic sources
  const { data: sources, isLoading: sourcesLoading } = useQuery({
    queryKey: ['traffic-sources', dateRange],
    queryFn: () => analyticsApi.getSources(dateRange, 5),
    refetchInterval: 60000,
  });

  // Connect to WebSocket
  useEffect(() => {
    connect();
  }, []);

  if (statsLoading || trendsLoading) {
    return (
      <LoadingContainer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="spinner" />
        <p>Loading your analytics...</p>
      </LoadingContainer>
    );
  }

  const dashboardStats = stats?.data;
  const trafficData = trends?.data || [];
  const deviceData = devices?.data?.map((d) => ({
    name: d.deviceType,
    value: d.count,
    percentage: d.percentage,
  })) || [];
  const sourceData = sources?.data?.map((s) => ({
    name: s.source,
    value: s.sessions,
    percentage: Math.round((s.sessions / (dashboardStats?.totalSessions || 1)) * 100),
  })) || [];

  return (
    <DashboardContainer>
      {/* Page header */}
      <PageHeader
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>Dashboard</h1>
        <p>Real-time analytics for AliceSolutions</p>
      </PageHeader>

        {/* KPI Cards */}
        <StyledKPIGrid>
        <KPICard
          title="Total Visitors"
          value={dashboardStats?.totalVisitors.toLocaleString() || '0'}
          change={dashboardStats?.visitorsChange}
          subtitle="vs previous period"
          icon={<Users />}
          iconColor="#4a90e2"
          delay={0}
        />

        <KPICard
          title="Page Views"
          value={dashboardStats?.totalPageViews.toLocaleString() || '0'}
          change={dashboardStats?.pageViewsChange}
          subtitle="vs previous period"
          icon={<Eye />}
          iconColor="#6a5cff"
          delay={0.1}
        />

        <KPICard
          title="Conversions"
          value={dashboardStats?.totalConversions.toLocaleString() || '0'}
          change={dashboardStats?.conversionsChange}
          subtitle={`${dashboardStats?.conversionRate.toFixed(1) || '0'}% conversion rate`}
          icon={<Target />}
          iconColor="#1de0c1"
          delay={0.2}
        />

        <KPICard
          title="Active Now"
          value={dashboardStats?.activeVisitors.toString() || '0'}
          subtitle="visitors online"
          icon={<Activity />}
          iconColor="#10b981"
          delay={0.3}
        />
        </StyledKPIGrid>

        {/* Advanced Traffic chart */}
        <StyledChartsGrid>
        <LineChart
          data={trafficData.map(d => ({
            date: d.date,
            visitors: d.visitors,
            sessions: d.sessions,
            pageViews: d.pageViews
          }))}
          title="Traffic Over Time"
          height={300}
        />
        </StyledChartsGrid>

        {/* Breakdown charts */}
        <StyledStatsGrid>
        <PieChart
          data={deviceData.map(d => ({
            name: d.name,
            value: d.value
          }))}
          title="Device Breakdown"
          height={300}
        />

        <PieChart
          data={sourceData.map(s => ({
            name: s.name,
            value: s.value
          }))}
          title="Traffic Sources"
          height={300}
        />
        </StyledStatsGrid>

      {/* Real-time indicator */}
      {isConnected() && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: '#10b98120',
            padding: '12px 20px',
            borderRadius: '50px',
            color: '#10b981',
            fontSize: '14px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          }}
        >
          <motion.div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#10b981',
            }}
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          Real-time updates active
        </motion.div>
      )}
    </DashboardContainer>
  );
}
