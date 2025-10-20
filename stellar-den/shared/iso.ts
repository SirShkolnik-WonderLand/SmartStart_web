// Shared types for ISO Studio - Complete System

export type Framework = "ISO27001" | "CMMC";

export type ControlStatus = "ready" | "partial" | "missing";

export type ControlDomain = "Governance" | "Risk Management" | "Compliance" | "Operations";

export type ControlPriority = "low" | "medium" | "high";

export interface Framework {
  id: string;
  key: string;
  name: string;
  version: string;
  description: string;
  controlCount: number;
  controls: Control[];
  domains: Domain[];
}

export interface Domain {
  id: string;
  code: string;
  name: string;
  description: string;
  controlCount: number;
}

export interface Control {
  id: string;
  frameworkId: string;
  domainId: string;
  code: string;
  title: string;
  description: string;
  guidance: string;
  cmmcMappings: string[];
  tags: string[];
  weight: number;
  priority: ControlPriority;
  story?: string; // For story view
  evidence?: string[]; // For evidence tracking
}

export interface Answer {
  controlId: string;
  status: ControlStatus;
  owner: string;
  dueDate: string;
  riskImpact: number; // 1-5
  effort: number; // 1-5
  notes: string;
  references?: string[];
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  frameworkId: string;
  answers: Record<string, Answer>;
  createdAt: string;
  updatedAt: string;
}

export interface Stats {
  totalControls: number;
  readyControls: number;
  partialControls: number;
  missingControls: number;
  progressPercentage: number;
  readinessPercentage: number;
}

export interface StoryBotQuestion {
  id: string;
  category: string;
  question: string;
  guidance: string;
  score: number; // 0-7
}

export interface StoryBotAssessment {
  questions: StoryBotQuestion[];
  totalScore: number;
  maxScore: number;
  percentage: number;
  readinessLevel: "Low" | "Medium" | "High" | "Excellent";
  recommendations: string[];
}

export interface ChecklistItem {
  id: string;
  controlId: string;
  checked: boolean;
  notes?: string;
}

export interface Checklist {
  framework: Framework;
  items: ChecklistItem[];
  email?: string;
  completed: boolean;
}

export interface User {
  name: string;
  email: string;
  createdAt: string;
}

export interface SmartStat {
  id: string;
  title: string;
  value: string;
  description: string;
  icon: string;
  color: string;
  trend?: string;
}

export interface AdvisorMessage {
  type: "warning" | "info" | "success" | "tip";
  title: string;
  message: string;
  action?: string;
  priority: number;
}

