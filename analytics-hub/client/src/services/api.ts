/**
 * API CLIENT
 * Axios-based API client with authentication
 */

import axios, { type AxiosInstance, type AxiosError } from 'axios';
import { useDashboardStore } from '@/store/dashboardStore';
import type {
  LoginRequest,
  LoginResponse,
  DashboardStats,
  RealtimeStats,
  PageStats,
  SourceStats,
  ConversionGoal,
  DateRange,
  AdminUser,
} from '@shared/types';

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (add JWT token)
api.interceptors.request.use(
  (config) => {
    const token = useDashboardStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor (handle errors)
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle 401 Unauthorized (token expired)
    if (error.response?.status === 401) {
      useDashboardStore.getState().logout();
      window.location.href = '/login';
    }

    // Handle other errors
    const errorMessage =
      (error.response?.data as any)?.error || error.message || 'An error occurred';
    
    useDashboardStore.getState().addNotification('error', errorMessage);
    
    return Promise.reject(error);
  }
);

// ============================================================================
// AUTHENTICATION
// ============================================================================

export const authApi = {
  /**
   * Login
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/api/admin/login', {
      email,
      password,
    } as LoginRequest);
    return response.data;
  },

  /**
   * Logout
   */
  async logout(): Promise<void> {
    await api.post('/api/admin/logout');
  },

  /**
   * Refresh token
   */
  async refresh(token: string): Promise<{ success: boolean; token?: string }> {
    const response = await api.post('/api/admin/refresh', { token });
    return response.data;
  },

  /**
   * Get current user
   */
  async me(): Promise<{ success: boolean; user?: AdminUser }> {
    const response = await api.get('/api/admin/me');
    return response.data;
  },
};

// ============================================================================
// ANALYTICS
// ============================================================================

export const analyticsApi = {
  /**
   * Get dashboard overview stats
   */
  async getOverview(dateRange: DateRange): Promise<{ success: boolean; data?: DashboardStats }> {
    const response = await api.get('/api/admin/stats/overview', {
      params: dateRange,
    });
    return response.data;
  },

  /**
   * Get real-time stats
   */
  async getRealtime(): Promise<{ success: boolean; data?: RealtimeStats }> {
    const response = await api.get('/api/admin/stats/realtime');
    return response.data;
  },

  /**
   * Get traffic trends
   */
  async getTrends(
    dateRange: DateRange,
    interval: 'hour' | 'day' | 'week' | 'month' = 'day'
  ): Promise<{
    success: boolean;
    data?: Array<{ date: string; visitors: number; sessions: number; pageViews: number }>;
  }> {
    const response = await api.get('/api/admin/stats/trends', {
      params: { ...dateRange, interval },
    });
    return response.data;
  },

  /**
   * Get page analytics
   */
  async getPages(dateRange: DateRange, limit: number = 20): Promise<{
    success: boolean;
    data?: PageStats[];
    total?: number;
  }> {
    const response = await api.get('/api/admin/analytics/pages', {
      params: { ...dateRange, limit },
    });
    return response.data;
  },

  /**
   * Get traffic sources
   */
  async getSources(dateRange: DateRange, limit: number = 10): Promise<{
    success: boolean;
    data?: SourceStats[];
  }> {
    const response = await api.get('/api/admin/analytics/sources', {
      params: { ...dateRange, limit },
    });
    return response.data;
  },

  /**
   * Get device breakdown
   */
  async getDevices(dateRange: DateRange): Promise<{
    success: boolean;
    data?: Array<{ deviceType: string; count: number; percentage: number }>;
  }> {
    const response = await api.get('/api/admin/analytics/devices', {
      params: dateRange,
    });
    return response.data;
  },

  /**
   * Get geographic data
   */
  async getLocations(dateRange: DateRange): Promise<{
    success: boolean;
    data?: Array<{ countryCode: string; countryName: string; count: number; percentage: number }>;
  }> {
    const response = await api.get('/api/admin/analytics/locations', {
      params: dateRange,
    });
    return response.data;
  },
};

// ============================================================================
// GOALS
// ============================================================================

export const goalsApi = {
  /**
   * Get all goals
   */
  async getAll(): Promise<{ success: boolean; data?: ConversionGoal[] }> {
    const response = await api.get('/api/admin/goals');
    return response.data;
  },

  /**
   * Get goal performance
   */
  async getPerformance(slug: string, dateRange: DateRange): Promise<{
    success: boolean;
    data?: {
      goal: ConversionGoal;
      conversions: number;
      conversionRate: number;
      totalValue: number;
      trend: Array<{ date: string; conversions: number }>;
    };
  }> {
    const response = await api.get(`/api/admin/goals/${slug}/performance`, {
      params: dateRange,
    });
    return response.data;
  },

  /**
   * Get conversion funnel
   */
  async getFunnel(steps: string[], dateRange: DateRange): Promise<{
    success: boolean;
    data?: Array<{
      name: string;
      value: number;
      percentage: number;
      dropOff?: number;
      dropOffPercentage?: number;
    }>;
  }> {
    const response = await api.post('/api/admin/funnel', {
      steps,
      dateRange,
    });
    return response.data;
  },
};

// ============================================================================
// HEALTH
// ============================================================================

export const healthApi = {
  /**
   * Check API health
   */
  async check(): Promise<{ success: boolean; status?: string }> {
    const response = await api.get('/api/v1/health');
    return response.data;
  },
};

export default api;
