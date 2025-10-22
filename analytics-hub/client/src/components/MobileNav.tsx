/**
 * MOBILE NAVIGATION
 * Mobile-optimized navigation with touch gestures and responsive design
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  Activity, 
  BarChart3, 
  Search,
  FileText, 
  TrendingUp, 
  Users, 
  Target, 
  Shield, 
  Settings,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useDashboardStore } from '@/store/dashboardStore';
import { useResponsive } from '@/hooks/useResponsive';
import { useTouchGestures } from '@/hooks/useTouchGestures';

const MobileNavContainer = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: ${({ isOpen }) => isOpen ? 'block' : 'none'};
  
  @media (min-width: 768px) {
    display: none;
  }
`;

const Overlay = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
`;

const NavDrawer = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 280px;
  background: ${({ theme }) => theme.colors.card};
  box-shadow: ${({ theme }) => theme.shadows.neumorphic};
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;

const NavHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 700;
  font-size: 1.25rem;
  color: ${({ theme }) => theme.colors.text};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textMuted};
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const NavContent = styled.div`
  flex: 1;
  padding: 20px 0;
`;

const NavSection = styled.div`
  margin-bottom: 32px;
`;

const SectionTitle = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 0 20px 12px;
`;

const NavItem = styled(motion.div)<{ active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  color: ${({ active, theme }) => active ? theme.colors.primary : theme.colors.textSecondary};
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  
  &:hover {
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
  }
  
  ${({ active, theme }) => active && `
    background: ${theme.colors.primary}10;
    border-right: 3px solid ${theme.colors.primary};
  `}
  
  svg {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }
`;

const NavLabel = styled.span`
  font-weight: 500;
  flex: 1;
`;

const NavChevron = styled.div`
  color: ${({ theme }) => theme.colors.textMuted};
`;

const UserSection = styled.div`
  padding: 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.background};
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ theme }) => theme.gradients.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
`;

const UserDetails = styled.div`
  flex: 1;
  min-width: 0;
  
  .name {
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
    font-size: 0.875rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .role {
    font-size: 0.75rem;
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const LogoutButton = styled(motion.button)`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border: none;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.card};
  color: ${({ theme }) => theme.colors.error};
  font-weight: 600;
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.neumorphic};
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.neumorphicHover};
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: ${({ theme }) => theme.shadows.neumorphicInset};
  }
`;

const MobileNavButton = styled(motion.button)`
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 1001;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  border: none;
  background: ${({ theme }) => theme.colors.card};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.neumorphic};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.neumorphicHover};
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: ${({ theme }) => theme.shadows.neumorphicInset};
  }
  
  @media (min-width: 768px) {
    display: none;
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

interface MobileNavProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentPath, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { isMobile } = useResponsive();
  const user = useDashboardStore((state) => state.user);
  const logout = useDashboardStore((state) => state.logout);

  const { attachTouchListeners, detachTouchListeners } = useTouchGestures({
    onSwipeRight: () => setIsOpen(true),
    onSwipeLeft: () => setIsOpen(false),
    threshold: 50,
  });

  useEffect(() => {
    if (isMobile) {
      const body = document.body;
      attachTouchListeners(body);
      
      return () => {
        detachTouchListeners(body);
      };
    }
  }, [isMobile, attachTouchListeners, detachTouchListeners]);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    window.location.href = '/login';
  };

  const getInitials = (name?: string): string => {
    if (!name) return 'AD';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!isMobile) {
    return null;
  }

  return (
    <>
      <MobileNavButton
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Menu size={24} />
      </MobileNavButton>

      <AnimatePresence>
        {isOpen && (
          <MobileNavContainer isOpen={isOpen}>
            <Overlay
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            
            <NavDrawer
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <NavHeader>
                <Logo>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #4a90e2 0%, #1de0c1 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}>
                    AH
                  </div>
                  Analytics Hub
                </Logo>
                <CloseButton onClick={() => setIsOpen(false)}>
                  <X size={20} />
                </CloseButton>
              </NavHeader>

              <NavContent>
                {navItems.map((section, sectionIndex) => (
                  <NavSection key={section.section}>
                    <SectionTitle>{section.section}</SectionTitle>
                    {section.items.map((item, itemIndex) => (
                      <NavItem
                        key={item.path}
                        active={currentPath === item.path}
                        onClick={() => {
                          onNavigate(item.path);
                          setIsOpen(false);
                        }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ 
                          delay: sectionIndex * 0.1 + itemIndex * 0.05,
                          duration: 0.3 
                        }}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <item.icon />
                        <NavLabel>{item.label}</NavLabel>
                        {currentPath === item.path && (
                          <NavChevron>
                            <ChevronRight size={16} />
                          </NavChevron>
                        )}
                      </NavItem>
                    ))}
                  </NavSection>
                ))}
              </NavContent>

              <UserSection>
                <UserInfo>
                  <UserAvatar>
                    {getInitials(user?.name)}
                  </UserAvatar>
                  <UserDetails>
                    <div className="name">{user?.name || 'Admin User'}</div>
                    <div className="role">Administrator</div>
                  </UserDetails>
                </UserInfo>
                
                <LogoutButton
                  onClick={handleLogout}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <LogOut size={16} />
                  Logout
                </LogoutButton>
              </UserSection>
            </NavDrawer>
          </MobileNavContainer>
        )}
      </AnimatePresence>
    </>
  );
};
