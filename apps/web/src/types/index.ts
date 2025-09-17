// User and Organization types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'MANAGER' | 'CUPPER' | 'VIEWER';
  organizationId: string;
  emailVerified: boolean;
  avatar?: string;
  bio?: string;
  preferences?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  subdomain: string;
  description?: string;
  logo?: string;
  website?: string;
  subscriptionStatus: 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'UNPAID';
  subscriptionPlan: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE' | 'CUSTOM';
  trialEndsAt?: string;
  subscriptionEndsAt?: string;
  settings?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// Coffee Sample types
export interface Sample {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  code?: string;
  origin: string;
  region?: string;
  farm?: string;
  producer?: string;
  variety?: string;
  altitude?: number;
  processingMethod?: 'WASHED' | 'NATURAL' | 'HONEY' | 'SEMI_WASHED' | 'WET_HULLED' | 'ANAEROBIC' | 'CARBONIC_MACERATION' | 'OTHER';
  harvestDate?: string;
  roaster?: string;
  roastDate?: string;
  roastLevel?: 'LIGHT' | 'MEDIUM_LIGHT' | 'MEDIUM' | 'MEDIUM_DARK' | 'DARK' | 'FRENCH' | 'ITALIAN';
  moisture?: number;
  density?: number;
  screenSize?: string;
  notes?: string;
  imageUrl?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// Cupping Session types
export interface CuppingSession {
  id: string;
  organizationId: string;
  createdBy: string;
  name: string;
  description?: string;
  location?: string;
  templateId?: string;
  template?: CuppingTemplate;
  blindTasting: boolean;
  allowComments: boolean;
  requireCalibration: boolean;
  status: 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'ARCHIVED';
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  notes?: string;
  tags: string[];
  settings?: Record<string, any>;
  participants: SessionParticipant[];
  samples: SessionSample[];
  scores: Score[];
  createdAt: string;
  updatedAt: string;
}

export interface CuppingTemplate {
  id: string;
  organizationId: string;
  createdBy: string;
  name: string;
  description?: string;
  isDefault: boolean;
  isPublic: boolean;
  scoringSystem: 'SCA' | 'COE' | 'CUSTOM';
  maxScore: number;
  categories: {
    categories: Array<{
      name: string;
      weight: number;
      maxScore: number;
      description?: string;
    }>;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SessionParticipant {
  id: string;
  sessionId: string;
  userId: string;
  user: User;
  role: 'CUPPER' | 'HEAD_JUDGE' | 'OBSERVER';
  joinedAt: string;
  leftAt?: string;
  isActive: boolean;
  isCalibrated: boolean;
  calibratedAt?: string;
}

export interface SessionSample {
  id: string;
  sessionId: string;
  sampleId: string;
  sample: Sample;
  position: number;
  isBlind: boolean;
  blindCode?: string;
  grindSize?: string;
  waterTemp?: number;
  brewRatio?: string;
  steepTime?: number;
  addedAt: string;
  scores: Score[];
}

// SCAA Scoring types
export interface Score {
  id: string;
  sessionId: string;
  sessionSampleId: string;
  sampleId: string;
  userId: string;
  user: User;
  totalScore: number;
  maxScore: number;
  scores: Record<string, number>;
  
  // SCAA Standard Categories
  aroma?: number;
  flavor?: number;
  aftertaste?: number;
  acidity?: number;
  body?: number;
  balance?: number;
  sweetness?: number;
  cleanliness?: number;
  uniformity?: number;
  overall?: number;
  
  defects: Array<{
    type: string;
    intensity: number;
    description?: string;
  }>;
  
  notes?: string;
  privateNotes?: string;
  voiceNotes?: string;
  voiceFileUrl?: string;
  
  isComplete: boolean;
  isSubmitted: boolean;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    details?: any;
  };
  message?: string;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterOrganizationForm {
  organizationName: string;
  subdomain: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface CreateSampleForm {
  name: string;
  description?: string;
  code?: string;
  origin: string;
  region?: string;
  farm?: string;
  producer?: string;
  variety?: string;
  altitude?: number;
  processingMethod?: string;
  harvestDate?: string;
  roaster?: string;
  roastDate?: string;
  roastLevel?: string;
  notes?: string;
  tags: string[];
}

export interface CreateSessionForm {
  name: string;
  description?: string;
  location?: string;
  templateId?: string;
  blindTasting: boolean;
  allowComments: boolean;
  requireCalibration: boolean;
  scheduledAt?: string;
  notes?: string;
  tags: string[];
  sampleIds: string[];
}
