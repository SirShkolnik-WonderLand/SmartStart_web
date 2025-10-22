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

  // Mock SEO data (in real implementation, this would come from APIs like Google Search Console)
  const seoData = {
    rankings: [
      { keyword: 'cybersecurity consultant toronto', position: 3, change: 2, trend: 'up' as const, volume: 1200 },
      { keyword: 'iso 27001 consultant canada', position: 5, change: -1, trend: 'down' as const, volume: 800 },
      { keyword: 'ciso as a service', position: 8, change: 0, trend: 'stable' as const, volume: 600 },
      { keyword: 'smartstart venture studio', position: 12, change: 3, trend: 'up' as const, volume: 400 },
      { keyword: 'cybersecurity automation', position: 15, change: -2, trend: 'down' as const, volume: 300 },
      { keyword: 'zero trust security', position: 18, change: 1, trend: 'up' as const, volume: 250 },
    ],
    backlinks: {
      total: 1247,
      new: 23,
      lost: 8,
      referringDomains: 89,
      domainAuthority: 42
    },
    coreWebVitals: {
      lcp: { value: 2.1, status: 'good' as const, description: 'Largest Contentful Paint measures loading performance' },
      fid: { value: 45, status: 'good' as const, description: 'First Input Delay measures interactivity' },
      cls: { value: 0.08, status: 'needs-improvement' as const, description: 'Cumulative Layout Shift measures visual stability' }
    },
    organicTraffic: [
      { date: '2024-10-16', visitors: 120, sessions: 150, pageViews: 320 },
      { date: '2024-10-17', visitors: 135, sessions: 165, pageViews: 350 },
      { date: '2024-10-18', visitors: 142, sessions: 178, pageViews: 380 },
      { date: '2024-10-19', visitors: 128, sessions: 155, pageViews: 340 },
      { date: '2024-10-20', visitors: 156, sessions: 190, pageViews: 420 },
      { date: '2024-10-21', visitors: 148, sessions: 175, pageViews: 390 },
      { date: '2024-10-22', visitors: 162, sessions: 195, pageViews: 440 },
    ],
    topPages: [
      { page: '/services', visitors: 45, position: 2.3, change: 0.2 },
      { page: '/smartstart', visitors: 38, position: 4.1, change: -0.3 },
      { page: '/iso-studio', visitors: 32, position: 5.2, change: 0.5 },
      { page: '/contact', visitors: 28, position: 6.8, change: -0.1 },
      { page: '/about', visitors: 22, position: 8.5, change: 0.3 },
    ]
  };

  // Prepare chart data
  const organicTrafficData = seoData.organicTraffic.map(d => ({
    date: d.date,
    value: d.visitors,
    label: `Organic visitors: ${d.visitors}`
  }));

  const topPagesData = seoData.topPages.map(p => ({
    label: p.page,
    value: p.visitors,
    percentage: Math.round((p.visitors / 162) * 100)
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
        <VitalsCard status={seoData.coreWebVitals.lcp.status}>
          <CardHeader>
            <CardTitle>
              <Clock size={20} />
              Largest Contentful Paint
            </CardTitle>
          </CardHeader>
          <CardContent>
            <VitalsValue status={seoData.coreWebVitals.lcp.status}>
              {seoData.coreWebVitals.lcp.value}s
            </VitalsValue>
            <VitalsDescription>
              {seoData.coreWebVitals.lcp.description}
            </VitalsDescription>
          </CardContent>
        </VitalsCard>

        <VitalsCard status={seoData.coreWebVitals.fid.status}>
          <CardHeader>
            <CardTitle>
              <Zap size={20} />
              First Input Delay
            </CardTitle>
          </CardHeader>
          <CardContent>
            <VitalsValue status={seoData.coreWebVitals.fid.status}>
              {seoData.coreWebVitals.fid.value}ms
            </VitalsValue>
            <VitalsDescription>
              {seoData.coreWebVitals.fid.description}
            </VitalsDescription>
          </CardContent>
        </VitalsCard>

        <VitalsCard status={seoData.coreWebVitals.cls.status}>
          <CardHeader>
            <CardTitle>
              <Eye size={20} />
              Cumulative Layout Shift
            </CardTitle>
          </CardHeader>
          <CardContent>
            <VitalsValue status={seoData.coreWebVitals.cls.status}>
              {seoData.coreWebVitals.cls.value}
            </VitalsValue>
            <VitalsDescription>
              {seoData.coreWebVitals.cls.description}
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
            <AdvancedLineChart
              data={organicTrafficData}
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
              data={topPagesData}
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
            {seoData.rankings.map((keyword, index) => (
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
