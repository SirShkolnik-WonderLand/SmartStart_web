/**
 * LEAD TRACKING SERVICE
 * Tracks and analyzes contact form submissions
 */

import { analyticsStorage, LeadData } from './analyticsStorage.js';

export interface LeadAnalytics {
  totalLeads: number;
  totalLeadsPreviousDay: number;
  leadsChange: number;
  leadsChangePercent: number;
  conversionRate: number;
  conversionRatePreviousDay: number;
  leadsByService: Array<{ service: string; count: number; percent: number }>;
  leadsBySource: Array<{ source: string; count: number; percent: number }>;
  leadsByBudget: Array<{ budget: string; count: number; percent: number }>;
  leadsByTimeline: Array<{ timeline: string; count: number; percent: number }>;
  leadsByCompanySize: Array<{ size: string; count: number; percent: number }>;
  leadsByIndustry: Array<{ industry: string; count: number; percent: number }>;
  topConvertingPages: Array<{ page: string; leads: number; conversionRate: number }>;
  mailingListSignups: number;
  mailingListSignupRate: number;
  geographicDistribution: Array<{ country?: string; region?: string; count: number }>;
  newLeads: LeadData[];
}

class LeadTrackingService {
  /**
   * Track a new lead submission
   */
  async trackLead(leadData: Omit<LeadData, 'id' | 'timestamp'>): Promise<LeadData> {
    return await analyticsStorage.storeLead(leadData);
  }

  /**
   * Get lead analytics for a specific date
   */
  async getLeadAnalytics(date: Date = new Date()): Promise<LeadAnalytics> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const previousDay = new Date(date);
    previousDay.setDate(previousDay.getDate() - 1);
    const prevStartOfDay = new Date(previousDay);
    prevStartOfDay.setHours(0, 0, 0, 0);
    const prevEndOfDay = new Date(previousDay);
    prevEndOfDay.setHours(23, 59, 59, 999);

    // Get leads for today
    const todayLeads = analyticsStorage.getLeads(startOfDay, endOfDay);
    
    // Get leads for previous day
    const previousDayLeads = analyticsStorage.getLeads(prevStartOfDay, prevEndOfDay);

    const totalLeads = todayLeads.length;
    const totalLeadsPreviousDay = previousDayLeads.length;
    const leadsChange = totalLeads - totalLeadsPreviousDay;
    const leadsChangePercent = totalLeadsPreviousDay > 0 
      ? (leadsChange / totalLeadsPreviousDay) * 100 
      : totalLeads > 0 ? 100 : 0;

    // Aggregate by service
    const serviceCounts: Record<string, number> = {};
    todayLeads.forEach(lead => {
      const service = lead.service || 'Not specified';
      serviceCounts[service] = (serviceCounts[service] || 0) + 1;
    });
    const leadsByService = Object.entries(serviceCounts)
      .map(([service, count]) => ({
        service,
        count,
        percent: (count / totalLeads) * 100,
      }))
      .sort((a, b) => b.count - a.count);

    // Aggregate by source (referrer)
    const sourceCounts: Record<string, number> = {};
    todayLeads.forEach(lead => {
      const source = this.categorizeSource(lead.referrer);
      sourceCounts[source] = (sourceCounts[source] || 0) + 1;
    });
    const leadsBySource = Object.entries(sourceCounts)
      .map(([source, count]) => ({
        source,
        count,
        percent: (count / totalLeads) * 100,
      }))
      .sort((a, b) => b.count - a.count);

    // Aggregate by budget
    const budgetCounts: Record<string, number> = {};
    todayLeads.forEach(lead => {
      const budget = lead.budget || 'Not specified';
      budgetCounts[budget] = (budgetCounts[budget] || 0) + 1;
    });
    const leadsByBudget = Object.entries(budgetCounts)
      .map(([budget, count]) => ({
        budget,
        count,
        percent: (count / totalLeads) * 100,
      }))
      .sort((a, b) => b.count - a.count);

    // Aggregate by timeline
    const timelineCounts: Record<string, number> = {};
    todayLeads.forEach(lead => {
      const timeline = lead.timeline || 'Not specified';
      timelineCounts[timeline] = (timelineCounts[timeline] || 0) + 1;
    });
    const leadsByTimeline = Object.entries(timelineCounts)
      .map(([timeline, count]) => ({
        timeline,
        count,
        percent: (count / totalLeads) * 100,
      }))
      .sort((a, b) => b.count - a.count);

    // Aggregate by company size
    const sizeCounts: Record<string, number> = {};
    todayLeads.forEach(lead => {
      const size = lead.companySize || 'Not specified';
      sizeCounts[size] = (sizeCounts[size] || 0) + 1;
    });
    const leadsByCompanySize = Object.entries(sizeCounts)
      .map(([size, count]) => ({
        size,
        count,
        percent: (count / totalLeads) * 100,
      }))
      .sort((a, b) => b.count - a.count);

    // Aggregate by industry
    const industryCounts: Record<string, number> = {};
    todayLeads.forEach(lead => {
      const industry = lead.industry || 'Not specified';
      industryCounts[industry] = (industryCounts[industry] || 0) + 1;
    });
    const leadsByIndustry = Object.entries(industryCounts)
      .map(([industry, count]) => ({
        industry,
        count,
        percent: (count / totalLeads) * 100,
      }))
      .sort((a, b) => b.count - a.count);

    // Top converting pages
    const pageCounts: Record<string, number> = {};
    todayLeads.forEach(lead => {
      const page = this.extractPageFromUrl(lead.pageUrl);
      pageCounts[page] = (pageCounts[page] || 0) + 1;
    });
    const topConvertingPages = Object.entries(pageCounts)
      .map(([page, leads]) => ({
        page,
        leads,
        conversionRate: 0, // Would need traffic data to calculate
      }))
      .sort((a, b) => b.leads - a.leads)
      .slice(0, 10);

    // Mailing list signups
    const mailingListSignups = todayLeads.filter(lead => lead.mailingList).length;
    const mailingListSignupRate = totalLeads > 0 ? (mailingListSignups / totalLeads) * 100 : 0;

    // Geographic distribution (simplified - would need IP geolocation)
    const geographicDistribution: Array<{ country?: string; region?: string; count: number }> = [];
    // For now, we'll use timezone as a proxy
    const timezoneCounts: Record<string, number> = {};
    todayLeads.forEach(lead => {
      const tz = lead.timezone || 'Unknown';
      timezoneCounts[tz] = (timezoneCounts[tz] || 0) + 1;
    });
    Object.entries(timezoneCounts).forEach(([tz, count]) => {
      geographicDistribution.push({ region: tz, count });
    });

    // Conversion rate (would need traffic data - placeholder for now)
    const conversionRate = 0; // Would calculate: (leads / visitors) * 100
    const conversionRatePreviousDay = 0;

    return {
      totalLeads,
      totalLeadsPreviousDay,
      leadsChange,
      leadsChangePercent,
      conversionRate,
      conversionRatePreviousDay,
      leadsByService,
      leadsBySource,
      leadsByBudget,
      leadsByTimeline,
      leadsByCompanySize,
      leadsByIndustry,
      topConvertingPages,
      mailingListSignups,
      mailingListSignupRate,
      geographicDistribution: geographicDistribution.sort((a, b) => b.count - a.count).slice(0, 10),
      newLeads: todayLeads.slice(-10).reverse(), // Last 10 leads, most recent first
    };
  }

  /**
   * Categorize referrer into source type
   */
  private categorizeSource(referrer: string): string {
    if (!referrer || referrer === 'Direct') return 'Direct';
    if (referrer.includes('google.com') || referrer.includes('google.ca')) return 'Google';
    if (referrer.includes('bing.com')) return 'Bing';
    if (referrer.includes('linkedin.com')) return 'LinkedIn';
    if (referrer.includes('twitter.com') || referrer.includes('x.com')) return 'Twitter';
    if (referrer.includes('facebook.com')) return 'Facebook';
    if (referrer.includes('alicesolutionsgroup.com')) return 'Internal';
    return 'Referral';
  }

  /**
   * Extract page path from full URL
   */
  private extractPageFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname || '/';
    } catch {
      return url;
    }
  }
}

export const leadTrackingService = new LeadTrackingService();

