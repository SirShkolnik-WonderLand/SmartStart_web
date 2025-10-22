import { useQuery } from '@tanstack/react-query';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Target, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { goalsApi } from '@/services/api';
import { useDashboardStore } from '@/store/dashboardStore';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xl};
`;

const GoalCard = styled(motion.div)`
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.card};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.neumorphic};
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: ${({ theme }) => theme.spacing.md};
    
    .name {
      font-size: ${({ theme }) => theme.typography.h4};
      font-weight: 700;
      color: ${({ theme }) => theme.colors.text};
    }
    
    .value {
      font-size: ${({ theme }) => theme.typography.h3};
      font-weight: 700;
      color: ${({ theme }) => theme.colors.success};
    }
  }
  
  .stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: ${({ theme }) => theme.spacing.md};
    
    .stat {
      .value {
        font-size: ${({ theme }) => theme.typography.h4};
        font-weight: 700;
        color: ${({ theme }) => theme.colors.primary};
      }
      
      .label {
        font-size: ${({ theme }) => theme.typography.small};
        color: ${({ theme }) => theme.colors.textMuted};
      }
    }
  }
`;

const FunnelViz = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const FunnelStep = styled(motion.div)<{ $percentage: number }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  
  .bar-container {
    flex: 1;
    height: 60px;
    background: ${({ theme }) => theme.colors.cardHover};
    border-radius: ${({ theme }) => theme.borderRadius.md};
    overflow: hidden;
    position: relative;
  }
  
  .bar {
    height: 100%;
    width: ${({ $percentage }) => $percentage}%;
    background: ${({ theme }) => theme.gradients.primary};
    display: flex;
    align-items: center;
    padding: 0 ${({ theme }) => theme.spacing.md};
    transition: width 1s cubic-bezier(0.4, 0.0, 0.2, 1);
    
    .step-name {
      color: white;
      font-weight: 600;
    }
  }
  
  .stats {
    min-width: 120px;
    text-align: right;
    
    .value {
      font-size: ${({ theme }) => theme.typography.h4};
      font-weight: 700;
      color: ${({ theme }) => theme.colors.text};
    }
    
    .percentage {
      font-size: ${({ theme }) => theme.typography.small};
      color: ${({ theme }) => theme.colors.textMuted};
    }
  }
`;

export function Goals() {
  const dateRange = useDashboardStore((state) => state.dateRange);

  const { data: goalsData } = useQuery({
    queryKey: ['goals'],
    queryFn: () => goalsApi.getAll(),
  });

  const { data: funnelData } = useQuery({
    queryKey: ['funnel', dateRange],
    queryFn: () => goalsApi.getFunnel(
      ['Page Visit', 'Engaged', 'Form Start', 'Form Submit'],
      dateRange
    ),
  });

  const goals = goalsData?.data || [];
  const funnel = funnelData?.data || [];

  return (
    <Container>
      <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        Goals & Conversions
      </motion.h1>

      <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
        </CardHeader>
        <FunnelViz>
          {funnel.map((step, idx) => (
            <FunnelStep
              key={step.name}
              $percentage={step.percentage}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
            >
              <div className="bar-container">
                <motion.div
                  className="bar"
                  initial={{ width: 0 }}
                  animate={{ width: `${step.percentage}%` }}
                  transition={{ delay: idx * 0.1 + 0.3, duration: 0.8 }}
                >
                  <div className="step-name">{step.name}</div>
                </motion.div>
              </div>
              <div className="stats">
                <div className="value">{step.value}</div>
                <div className="percentage">{step.percentage.toFixed(1)}%</div>
              </div>
            </FunnelStep>
          ))}
        </FunnelViz>
      </Card>

      <Grid>
        {goals.map((goal, idx) => (
          <GoalCard
            key={goal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <div className="header">
              <div className="name">{goal.goalName}</div>
              <div className="value">${goal.totalValue.toFixed(0)}</div>
            </div>
            <div className="stats">
              <div className="stat">
                <div className="value">{goal.totalConversions}</div>
                <div className="label">Conversions</div>
              </div>
              <div className="stat">
                <div className="value">${goal.goalValue.toFixed(0)}</div>
                <div className="label">Per Conversion</div>
              </div>
              <div className="stat">
                <div className="value">{goal.active ? 'Active' : 'Inactive'}</div>
                <div className="label">Status</div>
              </div>
            </div>
          </GoalCard>
        ))}
      </Grid>
    </Container>
  );
}
