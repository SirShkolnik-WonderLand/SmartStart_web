import { useQuery } from '@tanstack/react-query';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { PieChart } from '@/components/charts/PieChart';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { analyticsApi } from '@/services/api';
import { useDashboardStore } from '@/store/dashboardStore';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xl};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

const LocationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const LocationItem = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.cardHover};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  
  .flag {
    font-size: 24px;
  }
  
  .info {
    flex: 1;
    margin: 0 ${({ theme }) => theme.spacing.md};
    
    .name {
      font-weight: 600;
      color: ${({ theme }) => theme.colors.text};
    }
    
    .count {
      font-size: ${({ theme }) => theme.typography.small};
      color: ${({ theme }) => theme.colors.textMuted};
    }
  }
  
  .percentage {
    font-weight: 700;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

export function Visitors() {
  const dateRange = useDashboardStore((state) => state.dateRange);

  const { data: devicesData } = useQuery({
    queryKey: ['devices', dateRange],
    queryFn: () => analyticsApi.getDevices(dateRange),
  });

  const { data: locationsData } = useQuery({
    queryKey: ['locations', dateRange],
    queryFn: () => analyticsApi.getLocations(dateRange),
  });

  const devices = devicesData?.data || [];
  const locations = locationsData?.data || [];

  const devicePieData = devices.map(d => ({
    name: d.deviceType,
    value: d.count,
    percentage: d.percentage,
  }));

  return (
    <Container>
      <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        Visitor Insights
      </motion.h1>

      <Grid>
        <PieChart data={devicePieData} title="Device Breakdown" />
        
        <Card>
          <CardHeader>
            <CardTitle>
              <MapPin />
              Geographic Distribution
            </CardTitle>
          </CardHeader>
          <LocationList>
            {locations.slice(0, 10).map((loc, idx) => (
              <LocationItem
                key={loc.countryCode}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <div className="flag">🌍</div>
                <div className="info">
                  <div className="name">{loc.countryName}</div>
                  <div className="count">{loc.count} visitors</div>
                </div>
                <div className="percentage">{loc.percentage.toFixed(1)}%</div>
              </LocationItem>
            ))}
          </LocationList>
        </Card>
      </Grid>
    </Container>
  );
}
