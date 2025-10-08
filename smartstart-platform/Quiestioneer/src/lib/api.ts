const API_BASE = '/api';

export interface ScoreResponse {
  score: number;
  tier: string;
  fixes: string[];
  compliance_hint: string;
}

export interface LeadResponse {
  ok: boolean;
}

export interface PDFResponse {
  url: string;
}

export async function submitScore(answers: number[]): Promise<ScoreResponse> {
  const response = await fetch(`${API_BASE}/score`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to calculate score');
  }
  
  return response.json();
}

export async function submitLead(data: {
  email: string;
  company?: string;
  answers: number[];
  score: number;
  fixes: string[];
}): Promise<LeadResponse> {
  const response = await fetch(`${API_BASE}/lead`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to submit lead');
  }
  
  return response.json();
}

export async function generatePDF(data: {
  email: string;
  company?: string;
  score: number;
  tier: string;
  fixes: string[];
  hint: string;
}): Promise<PDFResponse> {
  const response = await fetch(`${API_BASE}/pdf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to generate PDF');
  }
  
  return response.json();
}

