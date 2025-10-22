/**
 * ANIMATED LINE CHART
 * Beautiful traffic chart with smooth animations
 */

import styled from 'styled-components';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, CardTitle } from '../ui/Card';

const ChartCard = styled(Card)`
  height: 100%;
  min-height: 400px;
`;

const TooltipContainer = styled.div`
  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.md};
  box-shadow: ${({ theme }) => theme.shadows.medium};
  
  .label {
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: ${({ theme }) => theme.spacing.xs};
  }
  
  .value {
    font-size: ${({ theme }) => theme.typography.small};
    color: ${({ theme }) => theme.colors.textSecondary};
    
    &.visitors {
      color: ${({ theme }) => theme.colors.chart1};
    }
    
    &.sessions {
      color: ${({ theme }) => theme.colors.chart2};
    }
    
    &.pageViews {
      color: ${({ theme }) => theme.colors.chart3};
    }
  }
`;

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <TooltipContainer>
      <div className="label">{label}</div>
      {payload.map((entry, index) => (
        <div key={index} className={`value ${entry.dataKey}`}>
          {entry.name}: <strong>{entry.value.toLocaleString()}</strong>
        </div>
      ))}
    </TooltipContainer>
  );
}

interface LineChartProps {
  data: Array<{
    date: string;
    visitors?: number;
    sessions?: number;
    pageViews?: number;
  }>;
  title?: string;
  showVisitors?: boolean;
  showSessions?: boolean;
  showPageViews?: boolean;
}

export function LineChart({
  data,
  title = 'Traffic Over Time',
  showVisitors = true,
  showSessions = true,
  showPageViews = true,
}: LineChartProps) {
  return (
    <ChartCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>

      <ResponsiveContainer width="100%" height={320}>
        <RechartsLineChart
          data={data}
          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
        >
          <defs>
            <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4a90e2" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#4a90e2" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6a5cff" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6a5cff" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorPageViews" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1de0c1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#1de0c1" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#2a3656" opacity={0.3} />
          
          <XAxis
            dataKey="date"
            stroke="#8492a6"
            fontSize={12}
            tickLine={false}
          />
          
          <YAxis
            stroke="#8492a6"
            fontSize={12}
            tickLine={false}
            tickFormatter={(value) => value.toLocaleString()}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
          />

          {showVisitors && (
            <Line
              type="monotone"
              dataKey="visitors"
              name="Visitors"
              stroke="#4a90e2"
              strokeWidth={3}
              dot={{ fill: '#4a90e2', r: 4 }}
              activeDot={{ r: 6, fill: '#4a90e2' }}
              fill="url(#colorVisitors)"
              animationDuration={1000}
              animationEasing="ease-in-out"
            />
          )}

          {showSessions && (
            <Line
              type="monotone"
              dataKey="sessions"
              name="Sessions"
              stroke="#6a5cff"
              strokeWidth={3}
              dot={{ fill: '#6a5cff', r: 4 }}
              activeDot={{ r: 6, fill: '#6a5cff' }}
              fill="url(#colorSessions)"
              animationDuration={1200}
              animationEasing="ease-in-out"
            />
          )}

          {showPageViews && (
            <Line
              type="monotone"
              dataKey="pageViews"
              name="Page Views"
              stroke="#1de0c1"
              strokeWidth={3}
              dot={{ fill: '#1de0c1', r: 4 }}
              activeDot={{ r: 6, fill: '#1de0c1' }}
              fill="url(#colorPageViews)"
              animationDuration={1400}
              animationEasing="ease-in-out"
            />
          )}
        </RechartsLineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
