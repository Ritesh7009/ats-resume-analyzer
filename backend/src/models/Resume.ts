import mongoose, { Schema, Document } from 'mongoose';
import { IResume, IParsedSections, IAnalysisResult } from '../types';

export interface IResumeDocument extends Omit<IResume, '_id'>, Document {}

const experienceItemSchema = new Schema(
  {
    title: String,
    company: String,
    location: String,
    startDate: String,
    endDate: String,
    current: Boolean,
    description: [String],
  },
  { _id: false }
);

const educationItemSchema = new Schema(
  {
    degree: String,
    institution: String,
    location: String,
    graduationDate: String,
    gpa: String,
    details: [String],
  },
  { _id: false }
);

const projectItemSchema = new Schema(
  {
    name: String,
    description: String,
    technologies: [String],
    link: String,
  },
  { _id: false }
);

const contactInfoSchema = new Schema(
  {
    name: String,
    email: String,
    phone: String,
    linkedin: String,
    github: String,
    website: String,
    location: String,
  },
  { _id: false }
);

const parsedSectionsSchema = new Schema<IParsedSections>(
  {
    summary: String,
    experience: [experienceItemSchema],
    education: [educationItemSchema],
    skills: [String],
    projects: [projectItemSchema],
    certifications: [String],
    contact: contactInfoSchema,
  },
  { _id: false }
);

const scoreBreakdownSchema = new Schema(
  {
    keywordRelevance: { type: Number, default: 0 },
    sectionStructure: { type: Number, default: 0 },
    formatting: { type: Number, default: 0 },
    experienceQuality: { type: Number, default: 0 },
    skillsMatch: { type: Number, default: 0 },
    fileStructure: { type: Number, default: 0 },
  },
  { _id: false }
);

const sectionFeedbackSchema = new Schema(
  {
    section: String,
    score: Number,
    status: { type: String, enum: ['good', 'warning', 'error'] },
    issues: [String],
    suggestions: [String],
  },
  { _id: false }
);

const keywordAnalysisSchema = new Schema(
  {
    found: [String],
    missing: [String],
    relevanceScore: Number,
    industryKeywords: [String],
  },
  { _id: false }
);

const improvementSchema = new Schema(
  {
    type: { type: String, enum: ['critical', 'major', 'minor'] },
    section: String,
    issue: String,
    suggestion: String,
    example: String,
  },
  { _id: false }
);

const formatIssueSchema = new Schema(
  {
    type: String,
    description: String,
    severity: { type: String, enum: ['high', 'medium', 'low'] },
  },
  { _id: false }
);

const analysisResultSchema = new Schema<IAnalysisResult>(
  {
    overallScore: { type: Number, default: 0 },
    scores: scoreBreakdownSchema,
    feedback: [sectionFeedbackSchema],
    keywords: keywordAnalysisSchema,
    improvements: [improvementSchema],
    formatIssues: [formatIssueSchema],
  },
  { _id: false }
);

const resumeSchema = new Schema<IResumeDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId as any,
      ref: 'User',
      required: true,
      index: true,
    },
    originalFileName: {
      type: String,
      required: true,
    },
    originalFilePath: {
      type: String,
      required: true,
    },
    parsedText: {
      type: String,
      default: '',
    },
    sections: {
      type: parsedSectionsSchema,
      default: {},
    },
    atsScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    analysisResult: {
      type: analysisResultSchema,
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes
resumeSchema.index({ userId: 1, createdAt: -1 });
resumeSchema.index({ atsScore: 1 });

export const Resume = mongoose.model<IResumeDocument>('Resume', resumeSchema);
