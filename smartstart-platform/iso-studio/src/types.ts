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
  priority: 'low' | 'medium' | 'high';
}

export interface Answer {
  controlId: string;
  status: ControlStatus;
  owner: string;
  dueDate: string;
  riskImpact: number;
  effort: number;
  notes: string;
  updatedAt: string;
}

export type ControlStatus = 'ready' | 'partial' | 'missing';

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

