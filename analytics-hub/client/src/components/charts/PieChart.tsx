/**
 * ANIMATED PIE CHART
 * Beautiful donut chart with smooth animations
 */

import styled from 'styled-components';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { Card, CardHeader, CardTitle } from '../ui/Card';

const ChartCard = styled(Card)`
  height: 100%;
  min-height: 350px;
`;

const COLORS = ['#4a90e2', '#6a5cff', '#1de0c1', '#f59e0b', '#ef4444'];

interface PieChartProps {
  data: Array<{
    name: string;
    value: number;
    percentage?: number;
  }>;
  title?: string;
  innerRadius?: number;
}

export function PieChart({ data, title = 'Distribution', innerRadius = 60 }: PieChartProps) {
  return (
    <ChartCard
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>

      <ResponsiveContainer width="100%" height={280}>
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={100}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
            animationBegin={0}
            animationDuration={1000}
            animationEasing="ease-out"
            label={(entry) => `${entry.percentage || entry.value}%`}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                stroke="none"
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: '#16213e',
              border: '1px solid #2a3656',
              borderRadius: '8px',
              padding: '12px',
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
          />
        </RechartsPieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
