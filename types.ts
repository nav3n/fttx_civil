import type React from 'react';

export type ResponsibleParty = 'Applicant' | 'Authority' | 'Shared' | 'System';

export interface WorkflowStep {
  id: number;
  title: string;
  responsible: ResponsibleParty;
  description: string;
  duration?: string;
}

export interface Citation {
  source: string;
  page: number | string;
}

export interface InfoItem {
  title?: string;
  description?: string;
  details: string;
  citation?: Citation;
  visualization?: React.ReactNode;
  subItems?: InfoItem[];
}

export interface TableData {
    headers: string[];
    rows: (string | React.ReactNode)[][];
    citation?: Citation;
}

export interface WorkflowSection {
  title: string;
  type: 'flowchart' | 'steps' | 'info' | 'table';
  description?: string;
  content: WorkflowStep[] | InfoItem[] | TableData;
  citation?: Citation;
}

export interface WorkflowCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  sections: WorkflowSection[];
}