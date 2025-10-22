import { useQuery } from '@tanstack/react-query';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { TrendingUp, Eye, Users, Target } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { PieChart } from '@/components/charts/PieChart';
import { analyticsApi } from '@/services/api';
import { useDashboardStore } from '@/store/dashboardStore';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xl};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.lg};
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const SourceCard = styled(motion.div)`
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.card};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.neumorphic};
  
  .source-name {
    font-size: ${({ theme }) => theme.typography.h4};
    font-weight: 700;
    margin-bottom: ${({ theme }) => theme.spacing.md};
    color: ${({ theme }) => theme.colors.text};
  }
  
  .stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: ${({ theme }) => theme.spacing.md};
    margin-top: ${({ theme }) => theme.spacing.md};
  }
  
  .stat {
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.xs};
    
    .value {
      font-size: ${({ theme }) => theme.typography.h3};
      font-weight: 700;
      color: ${({ theme }) => theme.colors.primary};
    }
    
    .label {
      font-size: ${({ theme }) => theme.typography.tiny};
      color: ${({ theme }) => theme.colors.textMuted};
    }
  }
`;

export function Sources() {
  const dateRange = useDashboardStore((state) => state.dateRange);

  const { data } = useQuery({
    queryKey: ['sources', dateRange],
    queryFn: () => analyticsApi.getSources(dateRange, 10),
  });

  const sources = data?.data || [];
  const pieData = sources.map(s => ({
    name: s.source,
    value: s.sessions,
    percentage: s.conversionRate,
  }));

  return (
    <Container>
      <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        Traffic Sources
      </motion.h1>

      <Grid>
        <PieChart data={pieData} title="Sessions by Source" />
        
        <Card>
          <CardHeader>
            <CardTitle>Source Performance</CardTitle>
          </CardHeader>
          {sources.slice(0, 5).map((source, idx) => (
            <SourceCard
              key={source.source}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="source-name">{source.source}</div>
              <div className="stats">
                <div className="stat">
                  <div className="value">{source.sessions}</div>
                  <div className="label">Sessions</div>
                </div>
                <div className="stat">
                  <div className="value">{source.conversions}</div>
                  <div className="label">Conversions</div>
                </div>
                <div className="stat">
                  <div className="value">{source.conversionRate.toFixed(1)}%</div>
                  <div className="label">Conv Rate</div>
                </div>
              </div>
            </SourceCard>
          ))}
        </Card>
      </Grid>
    </Container>
  );
}
