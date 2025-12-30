// User types
export interface User {
  id: string;
  _id?: string;
  firstName: string;
  lastName: string;
  name?: string;
  email: string;
  isVerified: boolean;
  isPremium: boolean;
  premiumExpiresAt?: string;
  uploadCount?: number;
  maxUploads?: number;
  analysisCount?: number;
  createdAt: string;
  updatedAt: string;
}

// Auth types
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

// Resume types
export interface Resume {
  id: string;
  _id?: string;
  userId: string;
  originalFileName: string;
  parsedText?: string;
  sections?: ParsedSections;
  atsScore?: number;
  status: 'uploaded' | 'parsing' | 'parsed' | 'analyzing' | 'analyzed' | 'error';
  analysisResult?: AnalysisResult;
  jobMatchResult?: JobMatchResult;
  createdAt: string;
  updatedAt: string;
}

export interface ParsedSections {
  summary?: string;
  experience?: ExperienceItem[];
  education?: EducationItem[];
  skills?: string[];
  projects?: ProjectItem[];
  certifications?: string[];
  contact?: ContactInfo;
}

export interface ExperienceItem {
  title: string;
  company: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description: string[];
}

export interface EducationItem {
  degree: string;
  institution: string;
  location?: string;
  graduationDate?: string;
  gpa?: string;
  details?: string[];
}

export interface ProjectItem {
  name: string;
  description: string;
  technologies?: string[];
  link?: string;
}

export interface ContactInfo {
  name?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  location?: string;
}

// Analysis types
export interface AnalysisResult {
  overallScore: number;
  breakdown: ScoreBreakdown;
  scores?: ScoreBreakdown;
  sections: SectionFeedback[];
  feedback?: SectionFeedback[];
  keywords: KeywordAnalysis;
  improvements: string[];
  formatIssues?: FormatIssue[];
}

export interface ScoreBreakdown {
  keywordRelevance: number;
  sectionStructure: number;
  formatting: number;
  experienceQuality: number;
  skillsMatch: number;
  fileStructure: number;
}

export interface SectionFeedback {
  section: string;
  score: number;
  status: 'good' | 'warning' | 'error';
  issues: string[];
  suggestions: string[];
}

export interface KeywordAnalysis {
  matched: string[];
  missing: string[];
  found?: string[];
  relevanceScore: number;
  industryKeywords?: string[];
}

export interface Improvement {
  type: 'critical' | 'major' | 'minor';
  section: string;
  issue: string;
  suggestion: string;
  example?: string;
}

export interface FormatIssue {
  type: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
}

// Enhanced ATS Analysis types
export interface ATSFlaw {
  category: 'critical' | 'major' | 'minor';
  title: string;
  description: string;
  impact: string;
  howToFix: string;
  examples?: string[];
}

export interface ATSApprovalTip {
  category: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  implemented: boolean;
}

export interface EnhancedAnalysis {
  flaws: ATSFlaw[];
  approvalTips: ATSApprovalTip[];
  overallReadiness: 'ready' | 'needs_work' | 'not_ready';
  readinessScore: number;
  summary: string;
}

// Job matching types
export interface JobMatchResult {
  matchScore: number;
  keywordMatch: {
    matched: string[];
    missing: string[];
    percentage: number;
  };
  skillGap: {
    requiredSkills: string[];
    matchedSkills: string[];
    missingSkills: string[];
    additionalSkills: string[];
  };
  recommendations: string[];
  improvementPotential: number;
}

// API types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// Payment types
export interface Payment {
  _id: string;
  userId: string;
  gumroadOrderId: string;
  plan: 'basic' | 'premium' | 'enterprise';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'refunded' | 'failed';
  createdAt: string;
}

export interface PaymentStatus {
  isPremium: boolean;
  premiumExpiresAt?: string;
  payments: Payment[];
}
