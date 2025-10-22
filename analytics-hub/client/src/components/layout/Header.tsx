/**
 * DASHBOARD HEADER
 * Top bar with search, theme toggle, and quick actions
 */

import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Menu, Sun, Moon, Bell, Download, RefreshCw } from 'lucide-react';
import { useDashboardStore } from '@/store/dashboardStore';
import { IconButton } from '../ui/Button';
import { useWebSocket } from '@/services/websocket';

const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.xl};
  gap: ${({ theme }) => theme.spacing.lg};
  
  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing.md};
  }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const PageTitle = styled(motion.h2)`
  font-size: ${({ theme }) => theme.typography.h3};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  
  @media (max-width: 768px) {
    font-size: ${({ theme }) => theme.typography.h4};
  }
`;

const RealtimeIndicator = styled(motion.div)<{ $connected: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background: ${({ $connected, theme }) =>
    $connected ? theme.colors.successLight + '20' : theme.colors.errorLight + '20'};
  color: ${({ $connected, theme }) => ($connected ? theme.colors.success : theme.colors.error)};
  font-size: ${({ theme }) => theme.typography.tiny};
  font-weight: 600;
  
  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${({ $connected, theme }) =>
      $connected ? theme.colors.success : theme.colors.error};
    animation: ${({ $connected }) => ($connected ? 'pulse 2s ease-in-out infinite' : 'none')};
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;

const NotificationBadge = styled.div`
  position: absolute;
  top: -4px;
  right: -4px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: ${({ theme }) => theme.gradients.danger};
  color: white;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ButtonWrapper = styled.div`
  position: relative;
`;

export function Header() {
  const theme = useDashboardStore((state) => state.theme);
  const toggleTheme = useDashboardStore((state) => state.toggleTheme);
  const toggleSidebar = useDashboardStore((state) => state.toggleSidebar);
  const notifications = useDashboardStore((state) => state.notifications);
  
  const { isConnected, requestStats } = useWebSocket();
  const isRealTimeConnected = isConnected();

  const handleRefresh = () => {
    requestStats();
    window.location.reload();
  };

  return (
    <HeaderContainer>
      <LeftSection>
        {/* Mobile menu toggle */}
        <IconButton
          onClick={toggleSidebar}
          $variant="ghost"
          $size="sm"
          aria-label="Toggle menu"
        >
          <Menu />
        </IconButton>

        {/* Page title */}
        <PageTitle
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          Dashboard
        </PageTitle>

        {/* Real-time indicator */}
        <RealtimeIndicator
          $connected={isRealTimeConnected}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {isRealTimeConnected ? 'Live' : 'Offline'}
        </RealtimeIndicator>
      </LeftSection>

      <RightSection>
        {/* Refresh button */}
        <IconButton
          onClick={handleRefresh}
          $variant="ghost"
          $size="sm"
          aria-label="Refresh data"
          whileHover={{ rotate: 180 }}
          transition={{ duration: 0.3 }}
        >
          <RefreshCw />
        </IconButton>

        {/* Export button */}
        <IconButton $variant="ghost" $size="sm" aria-label="Export data">
          <Download />
        </IconButton>

        {/* Notifications */}
        <ButtonWrapper>
          <IconButton $variant="ghost" $size="sm" aria-label="Notifications">
            <Bell />
            {notifications.length > 0 && (
              <NotificationBadge>{notifications.length}</NotificationBadge>
            )}
          </IconButton>
        </ButtonWrapper>

        {/* Theme toggle */}
        <IconButton
          onClick={toggleTheme}
          $variant="ghost"
          $size="sm"
          aria-label="Toggle theme"
          whileHover={{ rotate: 180 }}
          transition={{ duration: 0.4 }}
        >
          {theme === 'light' ? <Moon /> : <Sun />}
        </IconButton>
      </RightSection>
    </HeaderContainer>
  );
}
