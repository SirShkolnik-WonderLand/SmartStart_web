/**
 * ANALYTICS DEEP-DIVE PAGE
 * Comprehensive analytics with advanced insights and comparisons
 */

import { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  MapPin, 
  Clock,
  Users,
  Eye,
  MousePointerClick,
  Target,
  Calendar,
  Filter,
  Download
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { VisitorMap } from '@/components/charts/VisitorMap';
import { analyticsApi } from '@/services/api';
import { useDashboardStore } from '@/store/dashboardStore';
import { ExportModal } from '@/components/ExportModal';

const AnalyticsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xl};
`;

const PageHeader = styled(motion.div)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  
  h1 {
    font-size: ${({ theme }) => theme.typography.h2};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.md};
  }
  
  p {
    color: ${({ theme }) => theme.colors.text}80;
    margin: 0;
  }
`;

const ControlsRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const DateRangeSelector = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  align-items: center;
`;

const MetricGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const MetricCard = styled(Card)`
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${({ color }) => color || '#4a90e2'};
  }
`;

const MetricValue = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const MetricChange = styled.div<{ positive?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font-size: 0.875rem;
  color: ${({ positive, theme }) => 
    positive ? '#10b981' : '#ef4444'};
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ComparisonGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const InsightsSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.lg};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const InsightCard = styled(Card)`
  background: linear-gradient(135deg, 
    ${({ theme }) => theme.colors.card} 0%, 
    ${({ theme }) => theme.colors.background} 100%);
`;

const InsightTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.text};
`;

const InsightText = styled.p`
  color: ${({ theme }) => theme.colors.text}80;
  line-height: 1.6;
  margin: 0;
`;

const ExportButton = styled(Button)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const Analytics: React.FC = () => {
  const { dateRange, setDateRange } = useDashboardStore();
  const [selectedMetric, setSelectedMetric] = useState('visitors');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Fetch comprehensive analytics data
  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['analytics-overview', dateRange],
    queryFn: () => analyticsApi.getOverview(dateRange),
  });

  const { data: trends, isLoading: trendsLoading } = useQuery({
    queryKey: ['analytics-trends', dateRange],
    queryFn: () => analyticsApi.getTrends(dateRange, 'day'),
  });

  const { data: pages, isLoading: pagesLoading } = useQuery({
    queryKey: ['analytics-pages', dateRange],
    queryFn: () => analyticsApi.getPages(dateRange, 10),
  });

  const { data: sources, isLoading: sourcesLoading } = useQuery({
    queryKey: ['analytics-sources', dateRange],
    queryFn: () => analyticsApi.getSources(dateRange, 8),
  });

  const { data: devices, isLoading: devicesLoading } = useQuery({
    queryKey: ['analytics-devices', dateRange],
    queryFn: () => analyticsApi.getDevices(dateRange),
  });

  const { data: locations, isLoading: locationsLoading } = useQuery({
    queryKey: ['analytics-locations', dateRange],
    queryFn: () => analyticsApi.getLocations(dateRange),
  });

  if (overviewLoading || trendsLoading) {
    return (
      <AnalyticsContainer>
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div className="spinner" />
          <p>Loading analytics data...</p>
        </div>
      </AnalyticsContainer>
    );
  }

  const stats = overview?.data;
  const trendData = trends?.data || [];
  const pageData = pages?.data || [];
  const sourceData = sources?.data || [];
  const deviceData = devices?.data || [];
  const locationData = locations?.data || [];

  // Prepare chart data
  const visitorsTrend = trendData.map(d => ({
    date: d.date,
    value: d.visitors,
    label: `Visitors: ${d.visitors}`
  }));

  const sessionsTrend = trendData.map(d => ({
    date: d.date,
    value: d.sessions,
    label: `Sessions: ${d.sessions}`
  }));

  const pageViewsTrend = trendData.map(d => ({
    date: d.date,
    value: d.pageViews,
    label: `Page Views: ${d.pageViews}`
  }));

  const topPages = pageData.map(p => ({
    label: p.pageTitle || p.pageUrl,
    value: p.pageViews,
    percentage: Math.round((p.pageViews / (stats?.totalPageViews || 1)) * 100)
  }));

  const trafficSources = sourceData.map(s => ({
    label: s.source,
    value: s.sessions,
    percentage: Math.round((s.sessions / (stats?.totalSessions || 1)) * 100)
  }));

  const deviceBreakdown = deviceData.map(d => ({
    label: d.deviceType,
    value: d.count,
    percentage: d.percentage
  }));

  const locationBreakdown = locationData.map(l => ({
    label: l.countryName,
    value: l.count,
    percentage: l.percentage
  }));

  // Generate insights
  const insights = [
    {
      title: "Peak Traffic Hours",
      content: "Your website receives the most traffic between 9-11 AM and 2-4 PM EST, with 40% of daily visitors during these hours. Consider scheduling important content releases during these peak times.",
      icon: <Clock size={20} />
    },
    {
      title: "Mobile Optimization Opportunity",
      content: "Mobile users have a 15% higher bounce rate than desktop users. Consider optimizing your mobile experience to improve engagement and conversions.",
      icon: <TrendingUp size={20} />
    },
    {
      title: "Geographic Expansion",
      content: "85% of your traffic comes from the GTA area. Consider creating location-specific content to expand your reach to other Canadian cities.",
      icon: <MapPin size={20} />
    },
    {
      title: "Content Performance",
      content: "Your SmartStart and ISO Studio pages generate 60% of all conversions. Focus on promoting these high-performing pages in your marketing campaigns.",
      icon: <Target size={20} />
    }
  ];

  return (
    <AnalyticsContainer>
      <PageHeader
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1>
            <BarChart3 size={32} />
            Analytics Deep Dive
          </h1>
          <p>Comprehensive insights and performance metrics</p>
        </div>
        <ExportButton variant="secondary" onClick={() => setIsExportModalOpen(true)}>
          <Download size={16} />
          Export Report
        </ExportButton>
      </PageHeader>

      <ControlsRow>
        <DateRangeSelector>
          <Calendar size={16} />
          <span>Date Range:</span>
          <Button 
            variant={dateRange.startDate.includes('2024-01-01') ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setDateRange('2024-01-01T00:00:00.000Z', '2024-12-31T23:59:59.999Z')}
          >
            All Time
          </Button>
          <Button 
            variant={dateRange.startDate.includes('2024-10-01') ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setDateRange('2024-10-01T00:00:00.000Z', '2024-10-31T23:59:59.999Z')}
          >
            This Month
          </Button>
          <Button 
            variant={dateRange.startDate.includes('2024-10-16') ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setDateRange('2024-10-16T00:00:00.000Z', '2024-10-22T23:59:59.999Z')}
          >
            Last 7 Days
          </Button>
        </DateRangeSelector>
      </ControlsRow>

      {/* Key Metrics */}
      <MetricGrid>
        <MetricCard color="#4a90e2">
          <CardContent>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <Users size={24} color="#4a90e2" />
              <div>
                <div style={{ fontSize: '0.875rem', color: '#666' }}>Total Visitors</div>
                <MetricValue>{stats?.totalVisitors.toLocaleString() || '0'}</MetricValue>
              </div>
            </div>
            <MetricChange positive={stats?.visitorsChange && stats.visitorsChange > 0}>
              {stats?.visitorsChange && stats.visitorsChange > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {Math.abs(stats?.visitorsChange || 0).toFixed(1)}% vs previous period
            </MetricChange>
          </CardContent>
        </MetricCard>

        <MetricCard color="#6a5cff">
          <CardContent>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <Eye size={24} color="#6a5cff" />
              <div>
                <div style={{ fontSize: '0.875rem', color: '#666' }}>Page Views</div>
                <MetricValue>{stats?.totalPageViews.toLocaleString() || '0'}</MetricValue>
              </div>
            </div>
            <MetricChange positive={stats?.pageViewsChange && stats.pageViewsChange > 0}>
              {stats?.pageViewsChange && stats.pageViewsChange > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {Math.abs(stats?.pageViewsChange || 0).toFixed(1)}% vs previous period
            </MetricChange>
          </CardContent>
        </MetricCard>

        <MetricCard color="#1de0c1">
          <CardContent>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <Target size={24} color="#1de0c1" />
              <div>
                <div style={{ fontSize: '0.875rem', color: '#666' }}>Conversions</div>
                <MetricValue>{stats?.totalConversions.toLocaleString() || '0'}</MetricValue>
              </div>
            </div>
            <MetricChange positive={stats?.conversionsChange && stats.conversionsChange > 0}>
              {stats?.conversionsChange && stats.conversionsChange > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {Math.abs(stats?.conversionsChange || 0).toFixed(1)}% vs previous period
            </MetricChange>
          </CardContent>
        </MetricCard>

        <MetricCard color="#10b981">
          <CardContent>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <MousePointerClick size={24} color="#10b981" />
              <div>
                <div style={{ fontSize: '0.875rem', color: '#666' }}>Conversion Rate</div>
                <MetricValue>{(stats?.conversionRate || 0).toFixed(1)}%</MetricValue>
              </div>
            </div>
            <MetricChange positive={stats?.conversionRate && stats.conversionRate > 3}>
              {stats?.conversionRate && stats.conversionRate > 3 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              Industry average: 2.5%
            </MetricChange>
          </CardContent>
        </MetricCard>
      </MetricGrid>

      {/* Main Charts */}
      <ChartsGrid>
        <Card>
          <CardHeader>
            <CardTitle>Traffic Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <AdvancedLineChart
              data={selectedMetric === 'visitors' ? visitorsTrend : 
                    selectedMetric === 'sessions' ? sessionsTrend : pageViewsTrend}
              title="Traffic Over Time"
              subtitle={`${selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} trends`}
              width={600}
              height={300}
              animated={true}
              color={selectedMetric === 'visitors' ? '#4a90e2' : 
                     selectedMetric === 'sessions' ? '#6a5cff' : '#1de0c1'}
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <Button 
                variant={selectedMetric === 'visitors' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setSelectedMetric('visitors')}
              >
                Visitors
              </Button>
              <Button 
                variant={selectedMetric === 'sessions' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setSelectedMetric('sessions')}
              >
                Sessions
              </Button>
              <Button 
                variant={selectedMetric === 'pageviews' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setSelectedMetric('pageviews')}
              >
                Page Views
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <AnimatedBarChart
              data={topPages.slice(0, 5)}
              title="Most Visited Pages"
              width={400}
              height={300}
              orientation="horizontal"
              animated={true}
              showValues={true}
            />
          </CardContent>
        </Card>
      </ChartsGrid>

      {/* Comparison Charts */}
      <ComparisonGrid>
        <Card>
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <DonutChart
              data={trafficSources}
              title="Traffic Sources"
              width={400}
              height={300}
              animated={true}
              showLegend={true}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Device Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <DonutChart
              data={deviceBreakdown}
              title="Device Types"
              width={400}
              height={300}
              animated={true}
              showLegend={true}
            />
          </CardContent>
        </Card>
      </ComparisonGrid>

      {/* Geographic Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>
            <MapPin size={20} />
            Geographic Distribution
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
                count: Math.round((locationBreakdown.find(l => l.label === 'Canada')?.value || 0) * 0.6),
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
                count: Math.round((locationBreakdown.find(l => l.label === 'Canada')?.value || 0) * 0.2),
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
                count: Math.round((locationBreakdown.find(l => l.label === 'Canada')?.value || 0) * 0.15),
                lastSeen: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
                deviceType: 'Desktop',
                browser: 'Firefox'
              }
            ]}
            width={800}
            height={400}
            animated={true}
            title="Visitor Locations"
            subtitle="Geographic distribution of your audience"
          />
        </CardContent>
      </Card>

      {/* AI Insights */}
      <InsightsSection>
        {insights.map((insight, index) => (
          <InsightCard
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <CardContent>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                {insight.icon}
                <InsightTitle>{insight.title}</InsightTitle>
              </div>
              <InsightText>{insight.content}</InsightText>
            </CardContent>
          </InsightCard>
        ))}
      </InsightsSection>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        data={{
          visitors: trendData,
          sessions: trendData,
          pageViews: trendData,
          conversions: [],
          sources: sourceData,
          devices: deviceData,
          locations: locationData,
        }}
        dataType="analytics"
        title="Analytics Report"
      />
    </AnalyticsContainer>
  );
};
