// User related types
export interface IUser {
  _id: string;
  name: string;
  email: string;
  passwordHash?: string;
  googleId?: string;
  githubId?: string;
  authProvider: 'local' | 'google' | 'github';
  avatar?: string;
  isVerified: boolean;
  isPremium: boolean;
  premiumExpiresAt?: Date;
  uploadCount: number;
  maxUploads: number;
  razorpayCustomerId?: string;
  razorpayOrderId?: string;
  paymentId?: string;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Resume related types
export interface IResume {
  _id: string;
  userId: string;
  originalFileName: string;
  originalFilePath: string;
  parsedText: string;
  sections: IParsedSections;
  atsScore: number;
  analysisResult: IAnalysisResult;
  createdAt: Date;
  updatedAt: Date;
}

export interface IParsedSections {
  summary?: string;
  experience?: IExperienceItem[];
  education?: IEducationItem[];
  skills?: string[];
  projects?: IProjectItem[];
  certifications?: string[];
  contact?: IContactInfo;
}

export interface IExperienceItem {
  title: string;
  company: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description: string[];
}

export interface IEducationItem {
  degree: string;
  institution: string;
  location?: string;
  graduationDate?: string;
  gpa?: string;
  details?: string[];
}

export interface IProjectItem {
  name: string;
  description: string;
  technologies?: string[];
  link?: string;
}

export interface IContactInfo {
  name?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  location?: string;
}

// Analysis result types
export interface IAnalysisResult {
  overallScore: number;
  scores: IScoreBreakdown;
  feedback: ISectionFeedback[];
  keywords: IKeywordAnalysis;
  improvements: IImprovement[];
  formatIssues: IFormatIssue[];
}

export interface IScoreBreakdown {
  keywordRelevance: number;
  sectionStructure: number;
  formatting: number;
  experienceQuality: number;
  skillsMatch: number;
  fileStructure: number;
}

export interface ISectionFeedback {
  section: string;
  score: number;
  status: 'good' | 'warning' | 'error';
  issues: string[];
  suggestions: string[];
}

export interface IKeywordAnalysis {
  found: string[];
  missing: string[];
  relevanceScore: number;
  industryKeywords: string[];
}

export interface IImprovement {
  type: 'critical' | 'major' | 'minor';
  section: string;
  issue: string;
  suggestion: string;
  example?: string;
}

export interface IFormatIssue {
  type: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
}

// Job matching types
export interface IJobMatchResult {
  matchScore: number;
  keywordMatch: IKeywordMatch;
  skillGap: ISkillGap;
  recommendations: string[];
  improvementPotential: number;
}

export interface IKeywordMatch {
  matched: string[];
  missing: string[];
  percentage: number;
}

export interface ISkillGap {
  requiredSkills: string[];
  matchedSkills: string[];
  missingSkills: string[];
  additionalSkills: string[];
}

// Payment types
export interface IPayment {
  _id: string;
  userId: string;
  gumroadOrderId: string;
  gumroadSaleId: string;
  email: string;
  plan: 'basic' | 'premium' | 'enterprise';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'refunded' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

// API Response types
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

// Auth types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  isPremium: boolean;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}
