import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Moon, Sun, Bell, Download } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useDashboardStore } from '@/store/dashboardStore';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xl};
  max-width: 800px;
`;

const SettingRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.lg} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  
  &:last-child {
    border-bottom: none;
  }
  
  .info {
    .title {
      font-weight: 600;
      color: ${({ theme }) => theme.colors.text};
      margin-bottom: ${({ theme }) => theme.spacing.xs};
    }
    
    .description {
      font-size: ${({ theme }) => theme.typography.small};
      color: ${({ theme }) => theme.colors.textMuted};
    }
  }
`;

const Toggle = styled(motion.button)<{ $active: boolean }>`
  width: 56px;
  height: 32px;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  position: relative;
  background: ${({ $active, theme }) =>
    $active ? theme.gradients.primary : theme.colors.border};
  transition: all ${({ theme }) => theme.transitions.normal};
  
  &::after {
    content: '';
    position: absolute;
    top: 4px;
    left: ${({ $active }) => ($active ? 'calc(100% - 28px)' : '4px')};
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    transition: left ${({ theme }) => theme.transitions.normal};
  }
`;

export function Settings() {
  const theme = useDashboardStore((state) => state.theme);
  const toggleTheme = useDashboardStore((state) => state.toggleTheme);
  const preferences = useDashboardStore((state) => state.preferences);
  const updatePreferences = useDashboardStore((state) => state.updatePreferences);
  const realtimeEnabled = useDashboardStore((state) => state.realtimeEnabled);
  const toggleRealtime = useDashboardStore((state) => state.toggleRealtime);
  const user = useDashboardStore((state) => state.user);

  return (
    <Container>
      <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        Settings
      </motion.h1>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        
        <SettingRow>
          <div className="info">
            <div className="title">Theme</div>
            <div className="description">
              {theme === 'dark' ? 'Dark mode enabled' : 'Light mode enabled'}
            </div>
          </div>
          <Toggle
            $active={theme === 'dark'}
            onClick={toggleTheme}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          />
        </SettingRow>

        <SettingRow>
          <div className="info">
            <div className="title">Animations</div>
            <div className="description">Enable smooth transitions and micro-interactions</div>
          </div>
          <Toggle
            $active={preferences.showAnimations}
            onClick={() => updatePreferences({ showAnimations: !preferences.showAnimations })}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          />
        </SettingRow>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Real-Time Updates</CardTitle>
        </CardHeader>
        
        <SettingRow>
          <div className="info">
            <div className="title">Enable Real-Time</div>
            <div className="description">Get live updates via WebSocket</div>
          </div>
          <Toggle
            $active={realtimeEnabled}
            onClick={toggleRealtime}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          />
        </SettingRow>

        <SettingRow>
          <div className="info">
            <div className="title">Auto Refresh</div>
            <div className="description">Automatically refresh dashboard data</div>
          </div>
          <Toggle
            $active={preferences.autoRefresh}
            onClick={() => updatePreferences({ autoRefresh: !preferences.autoRefresh })}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          />
        </SettingRow>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        
        <SettingRow>
          <div className="info">
            <div className="title">Email</div>
            <div className="description">{user?.email}</div>
          </div>
        </SettingRow>

        <SettingRow>
          <div className="info">
            <div className="title">Role</div>
            <div className="description">{user?.role}</div>
          </div>
        </SettingRow>
      </Card>
    </Container>
  );
}
