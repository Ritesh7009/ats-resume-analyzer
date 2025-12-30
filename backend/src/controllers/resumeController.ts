import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { Resume, User } from '../models';
import { resumeParser, atsScorer, atsFlawAnalyzer, jobMatcher, emailService } from '../services';
import { ApiResponse, IJobMatchResult } from '../types';
import config from '../config';

/**
 * Upload and parse resume
 * POST /api/resume/upload
 */
export const uploadResume = async (
  req: Request,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const file = req.file;
    const userId = req.user?.userId;

    if (!file) {
      res.status(400).json({
        success: false,
        error: 'No file uploaded. Please upload a PDF or DOCX file.',
      });
      return;
    }

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Authentication required.',
      });
      return;
    }

    // Check upload limits for premium users
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found.',
      });
      return;
    }

    // If user is premium, check upload count
    if (user.isPremium) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const uploadCount = (user as any).uploadCount || 0;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const maxUploads = (user as any).maxUploads || 5;
      
      if (uploadCount >= maxUploads) {
        res.status(403).json({
          success: false,
          error: `You have used all ${maxUploads} uploads. Please purchase again for more uploads.`,
        });
        return;
      }
    }

    const filePath = file.path;

    // Parse the resume
    const parsedText = await resumeParser.parseFile(filePath);
    const sections = resumeParser.extractSections(parsedText);

    // Create resume record
    const resume = new Resume({
      userId,
      originalFileName: file.originalname,
      originalFilePath: filePath,
      parsedText,
      sections,
    });

    await resume.save();

    // Increment upload count for premium users
    if (user.isPremium) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (user as any).uploadCount = ((user as any).uploadCount || 0) + 1;
      await user.save();
    }

    res.status(201).json({
      success: true,
      message: 'Resume uploaded and parsed successfully.',
      data: {
        resumeId: resume._id,
        fileName: file.originalname,
        sections,
        parsedTextPreview: parsedText.substring(0, 500),
        // Include upload info for premium users
        uploadInfo: user.isPremium ? {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          uploadsUsed: (user as any).uploadCount,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          uploadsRemaining: (user as any).maxUploads - (user as any).uploadCount,
        } : null,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up uploaded file on error
    if (req.file?.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch {
        // Ignore cleanup errors
      }
    }

    res.status(500).json({
      success: false,
      error: 'Failed to process resume. Please try again.',
    });
  }
};

/**
 * Analyze resume for ATS compatibility
 * POST /api/resume/analyze
 */
export const analyzeResume = async (
  req: Request<{ id?: string }>,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const resumeId = req.params.id || req.body.resumeId;
    const userId = req.user?.userId;

    if (!resumeId) {
      res.status(400).json({
        success: false,
        error: 'Resume ID is required.',
      });
      return;
    }

    const resume = await Resume.findOne({ _id: resumeId, userId });
    if (!resume) {
      res.status(404).json({
        success: false,
        error: 'Resume not found.',
      });
      return;
    }

    // Perform ATS analysis
    const analysisResult = atsScorer.calculateScore(resume.parsedText, resume.sections);
    
    // Perform enhanced flaw analysis
    const enhancedAnalysis = atsFlawAnalyzer.analyze(resume.parsedText, resume.sections, analysisResult);
    
    // Update resume with analysis results
    resume.atsScore = analysisResult.overallScore;
    resume.analysisResult = analysisResult;
    await resume.save();

    res.json({
      success: true,
      message: 'Resume analysis completed.',
      data: {
        resumeId: resume._id,
        fileName: resume.originalFileName,
        atsScore: analysisResult.overallScore,
        analysis: analysisResult,
        enhancedAnalysis: enhancedAnalysis,
      },
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze resume. Please try again.',
    });
  }
};

/**
 * Match resume with job description
 * POST /api/resume/match-job
 */
export const matchJob = async (
  req: Request<object, ApiResponse, { resumeId: string; jobDescription: string }>,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const { resumeId, jobDescription } = req.body;
    const userId = req.user?.userId;

    if (!resumeId || !jobDescription) {
      res.status(400).json({
        success: false,
        error: 'Resume ID and job description are required.',
      });
      return;
    }

    const resume = await Resume.findOne({ _id: resumeId, userId });
    if (!resume) {
      res.status(404).json({
        success: false,
        error: 'Resume not found.',
      });
      return;
    }

    // Perform job matching
    const matchResult: IJobMatchResult = jobMatcher.matchJobDescription(
      resume.parsedText,
      resume.sections,
      jobDescription
    );

    res.json({
      success: true,
      message: 'Job matching completed.',
      data: {
        resumeId: resume._id,
        currentAtsScore: resume.atsScore,
        matchResult,
      },
    });
  } catch (error) {
    console.error('Job matching error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to match job description. Please try again.',
    });
  }
};

/**
 * Get resume analysis history
 * GET /api/resume/history
 */
export const getHistory = async (
  req: Request,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Authentication required.',
      });
      return;
    }

    const skip = (page - 1) * limit;

    const [resumes, total] = await Promise.all([
      Resume.find({ userId })
        .select('originalFileName atsScore createdAt analysisResult.overallScore')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Resume.countDocuments({ userId }),
    ]);

    res.json({
      success: true,
      data: {
        resumes,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get resume history.',
    });
  }
};

/**
 * Get specific resume analysis
 * GET /api/resume/:id
 */
export const getResume = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const resume = await Resume.findOne({ _id: id, userId });
    if (!resume) {
      res.status(404).json({
        success: false,
        error: 'Resume not found.',
      });
      return;
    }

    res.json({
      success: true,
      data: { resume },
    });
  } catch (error) {
    console.error('Get resume error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get resume.',
    });
  }
};

/**
 * Delete resume
 * DELETE /api/resume/:id
 */
export const deleteResume = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const resume = await Resume.findOne({ _id: id, userId });
    if (!resume) {
      res.status(404).json({
        success: false,
        error: 'Resume not found.',
      });
      return;
    }

    // Delete file
    try {
      fs.unlinkSync(resume.originalFilePath);
    } catch {
      // File may already be deleted
    }

    await Resume.deleteOne({ _id: id });

    res.json({
      success: true,
      message: 'Resume deleted successfully.',
    });
  } catch (error) {
    console.error('Delete resume error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete resume.',
    });
  }
};

/**
 * Send analysis report via email
 * POST /api/resume/send-report
 */
export const sendReport = async (
  req: Request<object, ApiResponse, { resumeId: string }>,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const { resumeId } = req.body;
    const userId = req.user?.userId;

    if (!resumeId) {
      res.status(400).json({
        success: false,
        error: 'Resume ID is required.',
      });
      return;
    }

    const resume = await Resume.findOne({ _id: resumeId, userId }).populate('userId', 'email name');
    if (!resume) {
      res.status(404).json({
        success: false,
        error: 'Resume not found.',
      });
      return;
    }

    if (!resume.analysisResult || !resume.analysisResult.overallScore) {
      res.status(400).json({
        success: false,
        error: 'Resume has not been analyzed yet.',
      });
      return;
    }

    // Get user info
    const user = resume.userId as unknown as { email: string; name: string };

    await emailService.sendAnalysisReport(
      user.email,
      user.name,
      resume.analysisResult,
      resume.originalFileName
    );

    res.json({
      success: true,
      message: 'Analysis report sent to your email.',
    });
  } catch (error) {
    console.error('Send report error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send report.',
    });
  }
};
