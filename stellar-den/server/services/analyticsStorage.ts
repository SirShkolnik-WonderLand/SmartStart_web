/**
 * ANALYTICS DATA STORAGE
 * Stores historical data for comparisons and lead tracking
 * Uses JSON files for simplicity (can migrate to DB later)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../data/analytics');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');
const DAILY_SUMMARIES_FILE = path.join(DATA_DIR, 'daily-summaries.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export interface LeadData {
  id: string;
  timestamp: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  service?: string;
  message: string;
  // Enhanced fields
  budget?: string;
  timeline?: string;
  companySize?: string;
  industry?: string;
  howDidYouHear?: string;
  mailingList: boolean;
  // Lead source
  pageUrl: string;
  referrer: string;
  userAgent?: string;
  timezone?: string;
}

export interface DailySummary {
  date: string; // YYYY-MM-DD
  totalVisitors: number;
  totalPageViews: number;
  uniqueVisitors: number;
  totalLeads: number;
  conversionRate: number;
  topPages: Array<{ path: string; views: number }>;
  referrers: Array<{ source: string; visitors: number }>;
  devices: { desktop: number; mobile: number; tablet: number };
  countries: Array<{ country: string; visitors: number }>;
  leadsByService: Record<string, number>;
  leadsBySource: Record<string, number>;
}

class AnalyticsStorage {
  private loadLeads(): LeadData[] {
    try {
      if (fs.existsSync(LEADS_FILE)) {
        const data = fs.readFileSync(LEADS_FILE, 'utf-8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading leads:', error);
    }
    return [];
  }

  private saveLeads(leads: LeadData[]): void {
    try {
      fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));
    } catch (error) {
      console.error('Error saving leads:', error);
    }
  }

  private loadDailySummaries(): DailySummary[] {
    try {
      if (fs.existsSync(DAILY_SUMMARIES_FILE)) {
        const data = fs.readFileSync(DAILY_SUMMARIES_FILE, 'utf-8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading daily summaries:', error);
    }
    return [];
  }

  private saveDailySummaries(summaries: DailySummary[]): void {
    try {
      fs.writeFileSync(DAILY_SUMMARIES_FILE, JSON.stringify(summaries, null, 2));
    } catch (error) {
      console.error('Error saving daily summaries:', error);
    }
  }

  /**
   * Store a new lead submission
   */
  async storeLead(leadData: Omit<LeadData, 'id' | 'timestamp'>): Promise<LeadData> {
    const leads = this.loadLeads();
    const newLead: LeadData = {
      id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...leadData,
    };
    leads.push(newLead);
    this.saveLeads(leads);
    return newLead;
  }

  /**
   * Get leads for a specific date range
   */
  getLeads(startDate: Date, endDate: Date): LeadData[] {
    const leads = this.loadLeads();
    const start = startDate.toISOString();
    const end = endDate.toISOString();
    return leads.filter(lead => lead.timestamp >= start && lead.timestamp <= end);
  }

  /**
   * Get all leads
   */
  getAllLeads(): LeadData[] {
    return this.loadLeads();
  }

  /**
   * Store daily summary
   */
  async storeDailySummary(summary: DailySummary): Promise<void> {
    const summaries = this.loadDailySummaries();
    // Remove existing summary for this date if it exists
    const filtered = summaries.filter(s => s.date !== summary.date);
    filtered.push(summary);
    // Keep only last 365 days
    const sorted = filtered.sort((a, b) => b.date.localeCompare(a.date));
    const trimmed = sorted.slice(0, 365);
    this.saveDailySummaries(trimmed);
  }

  /**
   * Get daily summary for a specific date
   */
  getDailySummary(date: Date): DailySummary | null {
    const summaries = this.loadDailySummaries();
    const dateStr = date.toISOString().split('T')[0];
    return summaries.find(s => s.date === dateStr) || null;
  }

  /**
   * Get summaries for date range
   */
  getDailySummaries(startDate: Date, endDate: Date): DailySummary[] {
    const summaries = this.loadDailySummaries();
    const start = startDate.toISOString().split('T')[0];
    const end = endDate.toISOString().split('T')[0];
    return summaries.filter(s => s.date >= start && s.date <= end);
  }

  /**
   * Get summary for previous day
   */
  getPreviousDaySummary(currentDate: Date): DailySummary | null {
    const previousDay = new Date(currentDate);
    previousDay.setDate(previousDay.getDate() - 1);
    return this.getDailySummary(previousDay);
  }

  /**
   * Get summary for same day last week
   */
  getPreviousWeekSummary(currentDate: Date): DailySummary | null {
    const lastWeek = new Date(currentDate);
    lastWeek.setDate(lastWeek.getDate() - 7);
    return this.getDailySummary(lastWeek);
  }
}

export const analyticsStorage = new AnalyticsStorage();

