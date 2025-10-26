/**
 * MAIN APP
 * Router, theme provider, and query client
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { GlobalStyles } from './styles/GlobalStyles';
import { lightTheme, darkTheme } from './styles/theme';
import { useDashboardStore } from './store/dashboardStore';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { LazyWrapper } from './components/LazyWrapper';
import {
  LazyLogin,
  LazyDashboard,
  LazyRealtime,
  LazyAnalytics,
  LazySEO,
  LazySecurity,
  LazyPages,
  LazySources,
  LazyVisitors,
  LazyGoals,
  LazySettings,
} from './pages/LazyPages';
import { TestDashboard } from './pages/TestDashboard';
import { Debug } from './pages/Debug';
import { TestAPI } from './pages/TestAPI';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // 30 seconds
      cacheTime: 300000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useDashboardStore((state) => state.isAuthenticated);
  const user = useDashboardStore((state) => state.user);
  const token = useDashboardStore((state) => state.token);

  console.log('ProtectedRoute check:', { isAuthenticated, user: !!user, token: !!token });

  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('Authenticated, rendering protected content');
  return <>{children}</>;
}

function App() {
  const theme = useDashboardStore((state) => state.theme);
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={currentTheme}>
        <GlobalStyles />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: currentTheme.colors.card,
              color: currentTheme.colors.text,
              border: `1px solid ${currentTheme.colors.border}`,
              borderRadius: currentTheme.borderRadius.md,
              boxShadow: currentTheme.shadows.medium,
            },
            success: {
              iconTheme: {
                primary: currentTheme.colors.success,
                secondary: 'white',
              },
            },
            error: {
              iconTheme: {
                primary: currentTheme.colors.error,
                secondary: 'white',
              },
            },
          }}
        />

        <BrowserRouter>
          <Routes>
            {/* Public route */}
            <Route path="/login" element={
              <LazyWrapper loadingText="Loading login...">
                <LazyLogin />
              </LazyWrapper>
            } />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={
                <LazyWrapper loadingText="Loading dashboard...">
                  <TestDashboard />
                </LazyWrapper>
              } />
              <Route path="realtime" element={
                <LazyWrapper loadingText="Loading real-time data...">
                  <LazyRealtime />
                </LazyWrapper>
              } />
              <Route path="analytics" element={
                <LazyWrapper loadingText="Loading analytics...">
                  <LazyAnalytics />
                </LazyWrapper>
              } />
              <Route path="seo" element={
                <LazyWrapper loadingText="Loading SEO metrics...">
                  <LazySEO />
                </LazyWrapper>
              } />
              <Route path="security" element={
                <LazyWrapper loadingText="Loading security dashboard...">
                  <LazySecurity />
                </LazyWrapper>
              } />
              <Route path="pages" element={
                <LazyWrapper loadingText="Loading page analytics...">
                  <LazyPages />
                </LazyWrapper>
              } />
              <Route path="sources" element={
                <LazyWrapper loadingText="Loading traffic sources...">
                  <LazySources />
                </LazyWrapper>
              } />
              <Route path="visitors" element={
                <LazyWrapper loadingText="Loading visitor insights...">
                  <LazyVisitors />
                </LazyWrapper>
              } />
              <Route path="goals" element={
                <LazyWrapper loadingText="Loading conversion goals...">
                  <LazyGoals />
                </LazyWrapper>
              } />
              <Route path="settings" element={
                <LazyWrapper loadingText="Loading settings...">
                  <LazySettings />
                </LazyWrapper>
              } />
              <Route path="debug" element={<Debug />} />
              <Route path="test-api" element={<TestAPI />} />
            </Route>

            {/* 404 redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
// Force rebuild Wed Oct 22 16:12:08 EDT 2025
