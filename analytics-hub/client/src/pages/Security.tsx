/**
 * SECURITY DASHBOARD
 * Comprehensive security monitoring with threat detection and system health
 */

import { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Lock,
  Globe,
  Activity,
  Clock,
  MapPin,
  User,
  Server,
  Database,
  Cpu,
  HardDrive
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AdvancedLineChart } from '@/components/charts/AdvancedLineChart';
import { AnimatedBarChart } from '@/components/charts/AnimatedBarChart';
import { DonutChart } from '@/components/charts/DonutChart';
import { analyticsApi } from '@/services/api';
import { useDashboardStore } from '@/store/dashboardStore';

const SecurityContainer = styled.div`
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

const SecurityStatusGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const StatusCard = styled(Card)<{ status: 'secure' | 'warning' | 'critical' }>`
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${({ status }) => 
      status === 'secure' ? '#10b981' : 
      status === 'warning' ? '#f59e0b' : 
      '#ef4444'};
  }
`;

const StatusValue = styled.div<{ status: 'secure' | 'warning' | 'critical' }>`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${({ status }) => 
    status === 'secure' ? '#10b981' : 
    status === 'warning' ? '#f59e0b' : 
    '#ef4444'};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const StatusDescription = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text}80;
  line-height: 1.5;
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

const ThreatTable = styled.div`
  background: ${({ theme }) => theme.colors.card};
  border-radius: 12px;
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.neumorphic};
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
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
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
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

const ThreatType = styled.div<{ severity: 'low' | 'medium' | 'high' | 'critical' }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${({ severity }) => 
    severity === 'low' ? '#10b98120' : 
    severity === 'medium' ? '#f59e0b20' : 
    severity === 'high' ? '#ef444420' : 
    '#dc262620'};
  color: ${({ severity }) => 
    severity === 'low' ? '#10b981' : 
    severity === 'medium' ? '#f59e0b' : 
    severity === 'high' ? '#ef4444' : 
    '#dc2626'};
`;

const IPAddress = styled.div`
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text};
`;

const SystemHealthGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const HealthCard = styled(Card)<{ status: 'healthy' | 'warning' | 'critical' }>`
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${({ status }) => 
      status === 'healthy' ? '#10b981' : 
      status === 'warning' ? '#f59e0b' : 
      '#ef4444'};
  }
`;

const HealthValue = styled.div<{ status: 'healthy' | 'warning' | 'critical' }>`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ status }) => 
    status === 'healthy' ? '#10b981' : 
    status === 'warning' ? '#f59e0b' : 
    '#ef4444'};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
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

export const Security: React.FC = () => {
  const { dateRange } = useDashboardStore();
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');

  // Mock security data (in real implementation, this would come from security monitoring APIs)
  const securityData = {
    overallStatus: 'secure' as const,
    threatsBlocked: 47,
    suspiciousRequests: 12,
    failedLogins: 3,
    systemHealth: {
      server: { status: 'healthy' as const, value: '99.9%', description: 'Uptime' },
      database: { status: 'healthy' as const, value: '45ms', description: 'Response Time' },
      cpu: { status: 'warning' as const, value: '78%', description: 'CPU Usage' },
      memory: { status: 'healthy' as const, value: '62%', description: 'Memory Usage' },
      disk: { status: 'healthy' as const, value: '34%', description: 'Disk Usage' },
      network: { status: 'healthy' as const, value: '1.2ms', description: 'Latency' }
    },
    recentThreats: [
      { id: 1, type: 'SQL Injection', severity: 'high' as const, ip: '192.168.1.100', location: 'Toronto, CA', timestamp: '2 minutes ago', status: 'blocked' },
      { id: 2, type: 'Brute Force', severity: 'medium' as const, ip: '10.0.0.45', location: 'Unknown', timestamp: '15 minutes ago', status: 'blocked' },
      { id: 3, type: 'XSS Attempt', severity: 'medium' as const, ip: '172.16.0.23', location: 'Vancouver, CA', timestamp: '1 hour ago', status: 'blocked' },
      { id: 4, type: 'DDoS', severity: 'critical' as const, ip: '203.0.113.1', location: 'Unknown', timestamp: '3 hours ago', status: 'mitigated' },
      { id: 5, type: 'Suspicious Bot', severity: 'low' as const, ip: '198.51.100.42', location: 'Montreal, CA', timestamp: '5 hours ago', status: 'blocked' },
    ],
    threatTrends: [
      { date: '2024-10-16', threats: 8, blocked: 7, mitigated: 1 },
      { date: '2024-10-17', threats: 12, blocked: 11, mitigated: 1 },
      { date: '2024-10-18', threats: 6, blocked: 5, mitigated: 1 },
      { date: '2024-10-19', threats: 15, blocked: 14, mitigated: 1 },
      { date: '2024-10-20', threats: 9, blocked: 8, mitigated: 1 },
      { date: '2024-10-21', threats: 11, blocked: 10, mitigated: 1 },
      { date: '2024-10-22', threats: 7, blocked: 6, mitigated: 1 },
    ],
    threatTypes: [
      { type: 'SQL Injection', count: 12, percentage: 25.5 },
      { type: 'XSS Attempts', count: 8, percentage: 17.0 },
      { type: 'Brute Force', count: 15, percentage: 31.9 },
      { type: 'DDoS', count: 3, percentage: 6.4 },
      { type: 'Bot Traffic', count: 9, percentage: 19.1 },
    ],
    blockedIPs: [
      { ip: '192.168.1.100', location: 'Toronto, CA', reason: 'SQL Injection', blockedAt: '2 minutes ago' },
      { ip: '10.0.0.45', location: 'Unknown', reason: 'Brute Force', blockedAt: '15 minutes ago' },
      { ip: '172.16.0.23', location: 'Vancouver, CA', reason: 'XSS Attempt', blockedAt: '1 hour ago' },
      { ip: '203.0.113.1', location: 'Unknown', reason: 'DDoS', blockedAt: '3 hours ago' },
    ]
  };

  // Prepare chart data
  const threatTrendData = securityData.threatTrends.map(d => ({
    date: d.date,
    value: d.threats,
    label: `Threats: ${d.threats}`
  }));

  const threatTypesData = securityData.threatTypes.map(t => ({
    label: t.type,
    value: t.count,
    percentage: t.percentage
  }));

  const insights = [
    {
      title: "Security Posture",
      content: "Your security systems are performing well with a 99.2% threat blocking rate. The recent increase in SQL injection attempts suggests you should review your input validation.",
      icon: <Shield size={20} />
    },
    {
      title: "System Performance",
      content: "CPU usage is at 78%, which is above the recommended 70% threshold. Consider scaling your infrastructure or optimizing resource usage.",
      icon: <Cpu size={20} />
    },
    {
      title: "Geographic Threats",
      content: "Most threats are originating from Canadian IPs, which is unusual. This could indicate a targeted attack or compromised local systems.",
      icon: <MapPin size={20} />
    },
    {
      title: "Recommendations",
      content: "Enable rate limiting on authentication endpoints and implement CAPTCHA for login forms to reduce brute force attempts.",
      icon: <CheckCircle size={20} />
    }
  ];

  return (
    <SecurityContainer>
      <PageHeader
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1>
            <Shield size={32} />
            Security Dashboard
          </h1>
          <p>Real-time security monitoring and threat detection</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button 
            variant={selectedTimeframe === '24h' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setSelectedTimeframe('24h')}
          >
            Last 24h
          </Button>
          <Button 
            variant={selectedTimeframe === '7d' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setSelectedTimeframe('7d')}
          >
            Last 7 days
          </Button>
          <Button 
            variant={selectedTimeframe === '30d' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setSelectedTimeframe('30d')}
          >
            Last 30 days
          </Button>
        </div>
      </PageHeader>

      {/* Security Status Overview */}
      <SecurityStatusGrid>
        <StatusCard status={securityData.overallStatus}>
          <CardContent>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <Shield size={24} color={securityData.overallStatus === 'secure' ? '#10b981' : '#ef4444'} />
              <div>
                <div style={{ fontSize: '0.875rem', color: '#666' }}>Overall Status</div>
                <StatusValue status={securityData.overallStatus}>
                  {securityData.overallStatus === 'secure' ? 'Secure' : 'At Risk'}
                </StatusValue>
              </div>
            </div>
            <StatusDescription>
              All security systems are operational and monitoring active threats
            </StatusDescription>
          </CardContent>
        </StatusCard>

        <StatusCard status="secure">
          <CardContent>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <XCircle size={24} color="#10b981" />
              <div>
                <div style={{ fontSize: '0.875rem', color: '#666' }}>Threats Blocked</div>
                <StatusValue status="secure">{securityData.threatsBlocked}</StatusValue>
              </div>
            </div>
            <StatusDescription>
              {securityData.threatsBlocked} threats blocked in the last 24 hours
            </StatusDescription>
          </CardContent>
        </StatusCard>

        <StatusCard status="warning">
          <CardContent>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <AlertTriangle size={24} color="#f59e0b" />
              <div>
                <div style={{ fontSize: '0.875rem', color: '#666' }}>Suspicious Requests</div>
                <StatusValue status="warning">{securityData.suspiciousRequests}</StatusValue>
              </div>
            </div>
            <StatusDescription>
              {securityData.suspiciousRequests} suspicious requests detected and monitored
            </StatusDescription>
          </CardContent>
        </StatusCard>

        <StatusCard status="secure">
          <CardContent>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <Lock size={24} color="#10b981" />
              <div>
                <div style={{ fontSize: '0.875rem', color: '#666' }}>Failed Logins</div>
                <StatusValue status="secure">{securityData.failedLogins}</StatusValue>
              </div>
            </div>
            <StatusDescription>
              {securityData.failedLogins} failed login attempts in the last 24 hours
            </StatusDescription>
          </CardContent>
        </StatusCard>
      </SecurityStatusGrid>

      {/* System Health */}
      <SystemHealthGrid>
        {Object.entries(securityData.systemHealth).map(([key, health]) => (
          <HealthCard key={key} status={health.status}>
            <CardContent>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                {key === 'server' && <Server size={20} color={health.status === 'healthy' ? '#10b981' : '#ef4444'} />}
                {key === 'database' && <Database size={20} color={health.status === 'healthy' ? '#10b981' : '#ef4444'} />}
                {key === 'cpu' && <Cpu size={20} color={health.status === 'healthy' ? '#10b981' : '#ef4444'} />}
                {key === 'memory' && <HardDrive size={20} color={health.status === 'healthy' ? '#10b981' : '#ef4444'} />}
                {key === 'disk' && <HardDrive size={20} color={health.status === 'healthy' ? '#10b981' : '#ef4444'} />}
                {key === 'network' && <Globe size={20} color={health.status === 'healthy' ? '#10b981' : '#ef4444'} />}
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#666', textTransform: 'capitalize' }}>{key}</div>
                  <HealthValue status={health.status}>{health.value}</HealthValue>
                </div>
              </div>
              <StatusDescription>{health.description}</StatusDescription>
            </CardContent>
          </HealthCard>
        ))}
      </SystemHealthGrid>

      {/* Main Charts */}
      <ChartsGrid>
        <Card>
          <CardHeader>
            <CardTitle>Threat Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <AdvancedLineChart
              data={threatTrendData}
              title="Security Threats Over Time"
              subtitle="Daily threat detection and blocking"
              width={600}
              height={300}
              animated={true}
              color="#ef4444"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Threat Types</CardTitle>
          </CardHeader>
          <CardContent>
            <DonutChart
              data={threatTypesData}
              title="Threat Distribution"
              width={400}
              height={300}
              animated={true}
              showLegend={true}
            />
          </CardContent>
        </Card>
      </ChartsGrid>

      {/* Recent Threats Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Security Threats</CardTitle>
        </CardHeader>
        <CardContent>
          <ThreatTable>
            <TableHeader>
              <div>Threat Type</div>
              <div>Severity</div>
              <div>IP Address</div>
              <div>Location</div>
              <div>Time</div>
            </TableHeader>
            {securityData.recentThreats.map((threat, index) => (
              <TableRow
                key={threat.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <div style={{ fontWeight: '500' }}>{threat.type}</div>
                <ThreatType severity={threat.severity}>
                  {threat.severity}
                </ThreatType>
                <IPAddress>{threat.ip}</IPAddress>
                <div>{threat.location}</div>
                <div style={{ fontSize: '0.875rem', color: '#666' }}>{threat.timestamp}</div>
              </TableRow>
            ))}
          </ThreatTable>
        </CardContent>
      </Card>

      {/* AI Security Insights */}
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
    </SecurityContainer>
  );
};
