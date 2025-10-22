/**
 * SIDEBAR NAVIGATION
 * Beautiful animated sidebar with icons
 */

import styled from 'styled-components';
import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  BarChart3,
  Search,
  Target,
  TrendingUp,
  FileText,
  Users,
  Shield,
  Settings,
  LogOut,
} from 'lucide-react';
import { useDashboardStore } from '@/store/dashboardStore';

const SidebarContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: ${({ theme }) => theme.spacing.lg};
`;

const Logo = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  
  h1 {
    font-size: ${({ theme }) => theme.typography.h3};
    background: ${({ theme }) => theme.gradients.cosmic};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`;

const LogoIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.gradients.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${({ theme }) => theme.shadows.glow};
  
  svg {
    color: white;
    width: 24px;
    height: 24px;
  }
`;

const Nav = styled.nav`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const NavSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const SectionTitle = styled.div`
  font-size: ${({ theme }) => theme.typography.tiny};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  text-decoration: none;
  font-weight: 500;
  position: relative;
  transition: all ${({ theme }) => theme.transitions.fast};
  
  svg {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.cardHover};
    transform: translateX(4px);
  }
  
  &.active {
    color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.cardHover};
    box-shadow: ${({ theme }) => theme.shadows.neumorphicInset};
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 60%;
      background: ${({ theme }) => theme.gradients.primary};
      border-radius: 0 4px 4px 0;
    }
  }
`;

const Footer = styled.div`
  margin-top: auto;
  padding-top: ${({ theme }) => theme.spacing.lg};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.cardHover};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background: ${({ theme }) => theme.gradients.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: ${({ theme }) => theme.typography.small};
`;

const UserDetails = styled.div`
  flex: 1;
  min-width: 0;
  
  .name {
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
    font-size: ${({ theme }) => theme.typography.small};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .role {
    font-size: ${({ theme }) => theme.typography.tiny};
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const LogoutButton = styled(motion.button)`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.card};
  color: ${({ theme }) => theme.colors.error};
  font-weight: 600;
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.neumorphic};
  transition: all ${({ theme }) => theme.transitions.normal};
  
  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.neumorphicHover};
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: ${({ theme }) => theme.shadows.neumorphicInset};
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const navItems = [
  {
    section: 'Overview',
    items: [
      { path: '/', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/realtime', label: 'Real-time', icon: Activity },
    ],
  },
  {
    section: 'Analytics',
    items: [
      { path: '/analytics', label: 'Analytics', icon: BarChart3 },
      { path: '/seo', label: 'SEO Metrics', icon: Search },
      { path: '/pages', label: 'Pages', icon: FileText },
      { path: '/sources', label: 'Traffic Sources', icon: TrendingUp },
      { path: '/visitors', label: 'Visitors', icon: Users },
    ],
  },
  {
    section: 'Goals',
    items: [
      { path: '/goals', label: 'Conversions', icon: Target },
    ],
  },
  {
    section: 'System',
    items: [
      { path: '/security', label: 'Security', icon: Shield },
      { path: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];

export function Sidebar() {
  const user = useDashboardStore((state) => state.user);
  const logout = useDashboardStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const getInitials = (name?: string): string => {
    if (!name) return 'AD';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return parts[0][0] + parts[1][0];
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <SidebarContainer>
      {/* Logo */}
      <Logo
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <LogoIcon>
          <BarChart3 />
        </LogoIcon>
        <h1>Analytics</h1>
      </Logo>

      {/* Navigation */}
      <Nav>
        {navItems.map((section, sectionIdx) => (
          <NavSection key={section.section}>
            <SectionTitle>{section.section}</SectionTitle>
            {section.items.map((item, itemIdx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: sectionIdx * 0.1 + itemIdx * 0.05 }}
                >
                  <NavItem to={item.path} end={item.path === '/'}>
                    <Icon />
                    {item.label}
                  </NavItem>
                </motion.div>
              );
            })}
          </NavSection>
        ))}
      </Nav>

      {/* Footer */}
      <Footer>
        {/* User info */}
        {user && (
          <UserInfo>
            <Avatar>{getInitials(user.name)}</Avatar>
            <UserDetails>
              <div className="name">{user.name || user.email}</div>
              <div className="role">{user.role}</div>
            </UserDetails>
          </UserInfo>
        )}

        {/* Logout button */}
        <LogoutButton
          onClick={handleLogout}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <LogOut />
          Logout
        </LogoutButton>
      </Footer>
    </SidebarContainer>
  );
}
