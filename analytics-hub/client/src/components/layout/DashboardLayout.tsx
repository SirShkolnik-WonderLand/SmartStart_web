/**
 * DASHBOARD LAYOUT
 * Main layout with sidebar, header, and content area
 */

import { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from '../MobileNav';
import { useDashboardStore } from '@/store/dashboardStore';

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
`;

const SidebarWrapper = styled(motion.aside)<{ $isOpen: boolean }>`
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 280px;
  background: ${({ theme }) => theme.colors.card};
  box-shadow: ${({ theme }) => theme.shadows.neumorphic};
  z-index: 1000;
  overflow-y: auto;
  
  @media (max-width: 768px) {
    width: 100%;
    max-width: 280px;
    transform: ${({ $isOpen }) => $isOpen ? 'translateX(0)' : 'translateX(-100%)'};
  }
`;

const MainContent = styled.main<{ $sidebarOpen: boolean }>`
  flex: 1;
  margin-left: ${({ $sidebarOpen }) => $sidebarOpen ? '280px' : '0'};
  transition: margin-left ${({ theme }) => theme.transitions.normal};
  
  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

const HeaderWrapper = styled.header`
  position: sticky;
  top: 0;
  z-index: 100;
  background: ${({ theme }) => theme.colors.background};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  backdrop-filter: blur(10px);
`;

const ContentArea = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  min-height: calc(100vh - 80px);
  
  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing.md};
  }
`;

const Overlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 999;
  
  @media (min-width: 769px) {
    display: none;
  }
`;

export function DashboardLayout() {
  const sidebarOpen = useDashboardStore((state) => state.sidebarOpen);
  const toggleSidebar = useDashboardStore((state) => state.toggleSidebar);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  return (
    <LayoutContainer>
      {/* Sidebar */}
      <SidebarWrapper
        $isOpen={sidebarOpen}
        initial={{ x: 0 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <Sidebar />
      </SidebarWrapper>

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <Overlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      {/* Main content */}
      <MainContent $sidebarOpen={sidebarOpen}>
        <HeaderWrapper>
          <Header />
        </HeaderWrapper>
        
        <ContentArea>
          <Outlet />
        </ContentArea>
      </MainContent>

      {/* Mobile Navigation */}
      <MobileNav 
        currentPath={currentPath}
        onNavigate={(path) => {
          setCurrentPath(path);
          window.location.href = path;
        }}
      />
    </LayoutContainer>
  );
}
