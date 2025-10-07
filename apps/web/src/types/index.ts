// User and Organization types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'CUPPER';
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
  greenBeanGrading?: GreenBeanGrading;
}

// Green Bean Grading types
export interface DefectItem {
  type: string;
  count: number;
  category: 1 | 2;
  description?: string;
}

export interface ScreenSizeDistribution {
  // Flat beans (FT)
  size13?: number;
  size14?: number;
  size15?: number;
  size16?: number;
  size17?: number;
  size18?: number;
  size19?: number;
  size20?: number;
  // Peaberries (PB)
  pb8?: number;
  pb9?: number;
  pb10?: number;
  pb11?: number;
  pb12?: number;
  pb13?: number;
}

export type GradingSystem = 'SCA';

export type GradeClassification =
  | 'SPECIALTY_GRADE'    // 0-5 full defects
  | 'PREMIUM_GRADE'      // 6-8 full defects
  | 'EXCHANGE_GRADE'     // 9-23 full defects
  | 'BELOW_STANDARD'     // 24+ full defects
  | 'OFF_GRADE';         // Significant quality issues

export interface GreenBeanGrading {
  id: string;
  sampleId: string;
  gradingSystem: GradingSystem;
  primaryDefects: number;
  secondaryDefects: number;
  fullDefectEquivalents: number;
  defectBreakdown: DefectItem[];
  screenSizeDistribution?: ScreenSizeDistribution;
  averageScreenSize?: number;
  uniformityPercentage?: number;
  moistureContent?: number;
  waterActivity?: number;
  bulkDensity?: number;
  beanColorAssessment?: string;
  uniformityScore?: number;
  grade?: string;
  classification?: GradeClassification;
  qualityScore?: number;
  gradedBy?: string;
  gradedAt?: string;
  certifiedBy?: string;
  certificationDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGreenBeanGradingForm {
  gradingSystem?: GradingSystem;
  primaryDefects?: number;
  secondaryDefects?: number;
  defectBreakdown?: DefectItem[];
  screenSizeDistribution?: ScreenSizeDistribution;
  moistureContent?: number;
  waterActivity?: number;
  bulkDensity?: number;
  beanColorAssessment?: string;
  uniformityScore?: number;
  notes?: string;
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
  aiSummary?: string;
  aiGeneratedAt?: string;
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

  // Flavor descriptors
  flavorDescriptors?: ScoreFlavorDescriptor[];
}

// Flavor Descriptor types
export interface FlavorDescriptor {
  id: string;
  name: string;
  category: 'POSITIVE' | 'NEGATIVE';
  description?: string;
  isDefault: boolean;
  organizationId?: string;
  createdBy?: string;
  creator?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ScoreFlavorDescriptor {
  id: string;
  scoreId: string;
  flavorDescriptorId: string;
  flavorDescriptor: FlavorDescriptor;
  intensity: number;
  createdAt: string;
}

export interface CreateFlavorDescriptorForm {
  name: string;
  category: 'POSITIVE' | 'NEGATIVE';
  description?: string;
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
