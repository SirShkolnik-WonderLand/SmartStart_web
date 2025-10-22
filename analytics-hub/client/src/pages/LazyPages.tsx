/**
 * LAZY PAGES
 * Lazy-loaded page components for code splitting
 */

import { lazy } from 'react';

// Lazy load all pages for better performance
export const LazyDashboard = lazy(() => import('./Dashboard').then(module => ({ default: module.Dashboard })));
export const LazyRealtime = lazy(() => import('./Realtime').then(module => ({ default: module.Realtime })));
export const LazyAnalytics = lazy(() => import('./Analytics').then(module => ({ default: module.Analytics })));
export const LazySEO = lazy(() => import('./SEO').then(module => ({ default: module.SEO })));
export const LazySecurity = lazy(() => import('./Security').then(module => ({ default: module.Security })));
export const LazyPages = lazy(() => import('./Pages').then(module => ({ default: module.Pages })));
export const LazySources = lazy(() => import('./Sources').then(module => ({ default: module.Sources })));
export const LazyVisitors = lazy(() => import('./Visitors').then(module => ({ default: module.Visitors })));
export const LazyGoals = lazy(() => import('./Goals').then(module => ({ default: module.Goals })));
export const LazySettings = lazy(() => import('./Settings').then(module => ({ default: module.Settings })));
export const LazyLogin = lazy(() => import('./Login').then(module => ({ default: module.Login })));
