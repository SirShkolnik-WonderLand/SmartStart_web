import { useQuery } from '@tanstack/react-query';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FileText, TrendingUp, TrendingDown, Eye, Clock, Target } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { analyticsApi } from '@/services/api';
import { useDashboardStore } from '@/store/dashboardStore';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xl};
`;

const Table = styled.div`
  overflow-x: auto;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.cardHover};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.small};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const TableRow = styled(motion.div)`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    background: ${({ theme }) => theme.colors.cardHover};
  }
`;

const PageUrl = styled.div`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Metric = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.text};
  
  svg {
    width: 16px;
    height: 16px;
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

export function Pages() {
  const dateRange = useDashboardStore((state) => state.dateRange);

  const { data, isLoading } = useQuery({
    queryKey: ['pages', dateRange],
    queryFn: () => analyticsApi.getPages(dateRange, 50),
  });

  const pages = data?.data || [];

  return (
    <Container>
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Pages Analytics
      </motion.h1>

      <Card>
        <CardHeader>
          <CardTitle>Top Pages</CardTitle>
        </CardHeader>
        
        <Table>
          <TableHeader>
            <div>Page URL</div>
            <div>Views</div>
            <div>Visitors</div>
            <div>Avg Time</div>
            <div>Bounce Rate</div>
            <div>Conversions</div>
          </TableHeader>

          {pages.map((page, idx) => (
            <TableRow
              key={page.url}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <PageUrl title={page.url}>{page.url}</PageUrl>
              <Metric><Eye />{page.views.toLocaleString()}</Metric>
              <Metric><Users />{page.uniqueVisitors.toLocaleString()}</Metric>
              <Metric><Clock />{Math.floor(page.avgTimeOnPage / 60)}m {page.avgTimeOnPage % 60}s</Metric>
              <Metric>{page.bounceRate.toFixed(1)}%</Metric>
              <Metric><Target />{page.conversions}</Metric>
            </TableRow>
          ))}
        </Table>
      </Card>
    </Container>
  );
}
