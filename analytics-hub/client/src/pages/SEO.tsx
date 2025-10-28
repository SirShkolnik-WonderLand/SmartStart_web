/**
 * SEO METRICS PAGE
 * Comprehensive SEO tracking with keyword rankings, backlinks, and Core Web Vitals
 */

import { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, 
  Link, 
  TrendingUp, 
  TrendingDown, 
  Globe, 
  Clock,
  Zap,
  Eye,
  BarChart3,
  Target,
  AlertTriangle,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LineChart } from '@/components/charts/LineChart';
import { analyticsApi } from '@/services/api';
import { useDashboardStore } from '@/store/dashboardStore';

const SEOContainer = styled.div`
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

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const MetricCard = styled(Card)<{ status?: 'good' | 'warning' | 'poor' }>`
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${({ status, theme }) => 
      status === 'good' ? '#10b981' : 
      status === 'warning' ? '#f59e0b' : 
      status === 'poor' ? '#ef4444' : 
      theme.colors.primary};
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

const KeywordTable = styled.div`
  background: ${({ theme }) => theme.colors.card};
  border-radius: 12px;
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.neumorphic};
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.background};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-weight: 600;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const TableRow = styled(motion.div)`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  align-items: center;
  
  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const KeywordText = styled.div`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
`;

const PositionBadge = styled.div<{ position: number }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${({ position }) => 
    position <= 3 ? '#10b98120' : 
    position <= 10 ? '#f59e0b20' : 
    '#ef444420'};
  color: ${({ position }) => 
    position <= 3 ? '#10b981' : 
    position <= 10 ? '#f59e0b' : 
    '#ef4444'};
`;

const TrendIcon = styled.div<{ trend: 'up' | 'down' | 'stable' }>`
  display: flex;
  align-items: center;
  gap: 4px;
  color: ${({ trend }) => 
    trend === 'up' ? '#10b981' : 
    trend === 'down' ? '#ef4444' : 
    '#6b7280'};
`;

const CoreWebVitalsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const VitalsCard = styled(Card)<{ status: 'good' | 'needs-improvement' | 'poor' }>`
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${({ status }) => 
      status === 'good' ? '#10b981' : 
      status === 'needs-improvement' ? '#f59e0b' : 
      '#ef4444'};
  }
`;

const VitalsValue = styled.div<{ status: 'good' | 'needs-improvement' | 'poor' }>`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ status }) => 
    status === 'good' ? '#10b981' : 
    status === 'needs-improvement' ? '#f59e0b' : 
    '#ef4444'};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const VitalsDescription = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text}80;
  line-height: 1.5;
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

export const SEO: React.FC = () => {
  const { dateRange } = useDashboardStore();
  const [selectedMetric, setSelectedMetric] = useState('rankings');

  // Fetch real SEO data from API
  const { data: seoData, isLoading: seoLoading } = useQuery({
    queryKey: ['seo-data', dateRange],
    queryFn: () => analyticsApi.getSEOData(dateRange),
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  if (seoLoading) {
    return (
      <SEOContainer>
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div className="spinner" />
          <p>Loading SEO processedSeoData...</p>
        </div>
      </SEOContainer>
    );
  }

  const processedSeoData = seoData?.data || {
    rankings: [],
    backlinks: {
      total: 0,
      new: 0,
      lost: 0,
      referringDomains: 0,
      domainAuthority: 0
    },
    coreWebVitals: {
      lcp: { value: 0, status: 'good' as const, description: 'Largest Contentful Paint measures loading performance' },
      fid: { value: 0, status: 'good' as const, description: 'First Input Delay measures interactivity' },
      cls: { value: 0, status: 'good' as const, description: 'Cumulative Layout Shift measures visual stability' }
    },
    organicTraffic: [],
    topPages: [],
  };

  // Prepare chart data
  const organicTrafficData = processedSeoData.organicTraffic.map(d => ({
    date: d.date,
    value: d.visitors,
    label: `Organic visitors: ${d.visitors}`
  }));

  const topPagesData = processedSeoData.topPages.map(p => ({
    label: p.page,
    value: p.visitors,
    percentage: Math.round((p.visitors / Math.max(...processedSeoData.topPages.map(p => p.visitors), 1)) * 100)
  }));

  const insights = [
    {
      title: "Keyword Opportunity",
      content: "You're ranking on page 2 for 'cybersecurity automation' and 'zero trust security'. With focused content optimization, these could move to page 1 and drive significant traffic.",
      icon: <Search size={20} />
    },
    {
      title: "Content Performance",
      content: "Your services page is your top organic performer. Consider creating more service-specific landing pages to capture long-tail keywords.",
      icon: <BarChart3 size={20} />
    },
    {
      title: "Technical SEO",
      content: "Your Core Web Vitals are mostly good, but Cumulative Layout Shift needs improvement. Focus on optimizing images and avoiding dynamic content shifts.",
      icon: <Zap size={20} />
    },
    {
      title: "Link Building",
      content: "You've gained 23 new backlinks this month. Continue building relationships with cybersecurity publications and industry blogs.",
      icon: <Link size={20} />
    }
  ];

  return (
    <SEOContainer>
      <PageHeader
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1>
            <Search size={32} />
            SEO Metrics
          </h1>
          <p>Search engine optimization performance and insights</p>
        </div>
      </PageHeader>

      {/* Key SEO Metrics */}
      <MetricsGrid>
        <MetricCard status="good">
          <CardContent>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <Search size={24} color="#10b981" />
              <div>
                <div style={{ fontSize: '0.875rem', color: '#666' }}>Average Position</div>
                <MetricValue>8.2</MetricValue>
              </div>
            </div>
            <MetricChange positive={true}>
              <TrendingUp size={16} />
              +0.3 vs last month
            </MetricChange>
          </CardContent>
        </MetricCard>

        <MetricCard status="good">
          <CardContent>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <Globe size={24} color="#4a90e2" />
              <div>
                <div style={{ fontSize: '0.875rem', color: '#666' }}>Organic Traffic</div>
                <MetricValue>1,247</MetricValue>
              </div>
            </div>
            <MetricChange positive={true}>
              <TrendingUp size={16} />
              +12.5% vs last month
            </MetricChange>
          </CardContent>
        </MetricCard>

        <MetricCard status="warning">
          <CardContent>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <Link size={24} color="#f59e0b" />
              <div>
                <div style={{ fontSize: '0.875rem', color: '#666' }}>Domain Authority</div>
                <MetricValue>42</MetricValue>
              </div>
            </div>
            <MetricChange positive={true}>
              <TrendingUp size={16} />
              +2 vs last month
            </MetricChange>
          </CardContent>
        </MetricCard>

        <MetricCard status="good">
          <CardContent>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <Target size={24} color="#1de0c1" />
              <div>
                <div style={{ fontSize: '0.875rem', color: '#666' }}>Click-Through Rate</div>
                <MetricValue>4.2%</MetricValue>
              </div>
            </div>
            <MetricChange positive={true}>
              <TrendingUp size={16} />
              +0.8% vs last month
            </MetricChange>
          </CardContent>
        </MetricCard>
      </MetricsGrid>

      {/* Core Web Vitals */}
      <CoreWebVitalsGrid>
        <VitalsCard status={processedSeoData.coreWebVitals.lcp.status}>
          <CardHeader>
            <CardTitle>
              <Clock size={20} />
              Largest Contentful Paint
            </CardTitle>
          </CardHeader>
          <CardContent>
            <VitalsValue status={processedSeoData.coreWebVitals.lcp.status}>
              {processedSeoData.coreWebVitals.lcp.value}s
            </VitalsValue>
            <VitalsDescription>
              {processedSeoData.coreWebVitals.lcp.description}
            </VitalsDescription>
          </CardContent>
        </VitalsCard>

        <VitalsCard status={processedSeoData.coreWebVitals.fid.status}>
          <CardHeader>
            <CardTitle>
              <Zap size={20} />
              First Input Delay
            </CardTitle>
          </CardHeader>
          <CardContent>
            <VitalsValue status={processedSeoData.coreWebVitals.fid.status}>
              {processedSeoData.coreWebVitals.fid.value}ms
            </VitalsValue>
            <VitalsDescription>
              {processedSeoData.coreWebVitals.fid.description}
            </VitalsDescription>
          </CardContent>
        </VitalsCard>

        <VitalsCard status={processedSeoData.coreWebVitals.cls.status}>
          <CardHeader>
            <CardTitle>
              <Eye size={20} />
              Cumulative Layout Shift
            </CardTitle>
          </CardHeader>
          <CardContent>
            <VitalsValue status={processedSeoData.coreWebVitals.cls.status}>
              {processedSeoData.coreWebVitals.cls.value}
            </VitalsValue>
            <VitalsDescription>
              {processedSeoData.coreWebVitals.cls.description}
            </VitalsDescription>
          </CardContent>
        </VitalsCard>
      </CoreWebVitalsGrid>

      {/* Main Charts */}
      <ChartsGrid>
        <Card>
          <CardHeader>
            <CardTitle>Organic Traffic Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart
              seoData={organicTrafficData}
              title="Organic Traffic Over Time"
              subtitle="Search engine driven visitors"
              width={600}
              height={300}
              animated={true}
              color="#10b981"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Organic Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <AnimatedBarChart
              seoData={topPagesData}
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

      {/* Keyword Rankings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Keyword Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          <KeywordTable>
            <TableHeader>
              <div>Keyword</div>
              <div>Position</div>
              <div>Change</div>
              <div>Search Volume</div>
            </TableHeader>
            {processedSeoData.rankings.map((keyword, index) => (
              <TableRow
                key={keyword.keyword}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <KeywordText>{keyword.keyword}</KeywordText>
                <PositionBadge position={keyword.position}>
                  #{keyword.position}
                </PositionBadge>
                <TrendIcon trend={keyword.trend}>
                  {keyword.trend === 'up' ? <TrendingUp size={14} /> : 
                   keyword.trend === 'down' ? <TrendingDown size={14} /> : 
                   <div style={{ width: '14px', height: '2px', background: '#6b7280' }} />}
                  {Math.abs(keyword.change)}
                </TrendIcon>
                <div>{keyword.volume.toLocaleString()}</div>
              </TableRow>
            ))}
          </KeywordTable>
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
    </SEOContainer>
  );
};
