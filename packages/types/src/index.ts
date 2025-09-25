// Shared TypeScript types for CuppingLab

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CuppingSession {
  id: string;
  name: string;
  description?: string;
  organizationId: string;
  createdBy: string;
  status: 'draft' | 'active' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface Sample {
  id: string;
  name: string;
  origin?: string;
  variety?: string;
  process?: string;
  sessionId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CuppingScore {
  id: string;
  sampleId: string;
  userId: string;
  sessionId: string;
  scores: Record<string, number>;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
