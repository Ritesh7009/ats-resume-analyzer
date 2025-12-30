import { IParsedSections, IAnalysisResult } from '../types';

export interface IATSFlaw {
  category: 'critical' | 'major' | 'minor';
  title: string;
  description: string;
  impact: string;
  howToFix: string;
  examples?: string[];
}

export interface IATSApprovalTip {
  category: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  implemented: boolean;
}

export interface IEnhancedAnalysis {
  flaws: IATSFlaw[];
  approvalTips: IATSApprovalTip[];
  overallReadiness: 'ready' | 'needs_work' | 'not_ready';
  readinessScore: number;
  summary: string;
}

/**
 * ATS Flaw Analyzer Service
 * Provides detailed analysis of CV flaws and how to make it ATS-approved
 */
export class ATSFlawAnalyzer {
  /**
   * Analyze resume and provide detailed flaws and approval tips
   */
  analyze(text: string, sections: IParsedSections, analysisResult: IAnalysisResult): IEnhancedAnalysis {
    const flaws = this.detectFlaws(text, sections, analysisResult);
    const approvalTips = this.generateApprovalTips(text, sections, analysisResult);
    const readinessScore = this.calculateReadinessScore(flaws, approvalTips);
    
    return {
      flaws,
      approvalTips,
      overallReadiness: readinessScore >= 80 ? 'ready' : readinessScore >= 50 ? 'needs_work' : 'not_ready',
      readinessScore,
      summary: this.generateSummary(flaws, readinessScore),
    };
  }

  /**
   * Detect all flaws in the resume
   */
  private detectFlaws(text: string, sections: IParsedSections, analysis: IAnalysisResult): IATSFlaw[] {
    const flaws: IATSFlaw[] = [];

    // === CRITICAL FLAWS ===
    
    // Missing contact information
    if (!sections.contact?.email) {
      flaws.push({
        category: 'critical',
        title: 'Missing Email Address',
        description: 'Your resume does not contain a visible email address.',
        impact: 'Recruiters cannot contact you, and ATS systems may reject your application.',
        howToFix: 'Add your professional email address prominently at the top of your resume.',
        examples: ['john.smith@email.com', 'jane.doe@gmail.com'],
      });
    }

    if (!sections.contact?.phone) {
      flaws.push({
        category: 'critical',
        title: 'Missing Phone Number',
        description: 'No phone number detected in your resume.',
        impact: 'Limits recruiter\'s ability to reach you quickly.',
        howToFix: 'Include your phone number in the contact section.',
        examples: ['+1 (555) 123-4567', '555-123-4567'],
      });
    }

    // Missing key sections
    if (!sections.experience || sections.experience.length === 0) {
      flaws.push({
        category: 'critical',
        title: 'No Work Experience Section',
        description: 'Your resume lacks a work experience section.',
        impact: 'ATS systems prioritize work experience. Without it, your resume may score very low.',
        howToFix: 'Add a clear "Work Experience" or "Professional Experience" section with your job history.',
        examples: [
          'SOFTWARE ENGINEER | ABC Company | Jan 2020 - Present',
          '• Developed RESTful APIs serving 10,000+ daily users',
          '• Reduced deployment time by 40% through CI/CD implementation',
        ],
      });
    }

    if (!sections.skills || sections.skills.length === 0) {
      flaws.push({
        category: 'critical',
        title: 'No Skills Section',
        description: 'Skills section is missing from your resume.',
        impact: 'ATS systems match job keywords against skills. Missing skills = missing matches.',
        howToFix: 'Create a dedicated "Skills" or "Technical Skills" section.',
        examples: ['Programming: JavaScript, Python, Java', 'Tools: Docker, AWS, Git'],
      });
    }

    // === MAJOR FLAWS ===

    // Image-based resume warning
    const wordCount = text.split(/\s+/).filter(w => w.length > 1).length;
    if (wordCount < 100) {
      flaws.push({
        category: 'major',
        title: 'Insufficient Text Content Detected',
        description: 'Your resume has very little extractable text. This may indicate an image-heavy or graphical resume.',
        impact: 'ATS systems cannot read images or graphics. Your resume may appear blank to automated systems.',
        howToFix: 'Use a text-based resume format. Avoid graphics, images, logos, and complex layouts.',
        examples: ['Use simple, clean layouts', 'Stick to standard fonts like Arial, Calibri, or Times New Roman'],
      });
    }

    // No quantified achievements
    const hasQuantifiedAchievements = sections.experience?.some(exp => 
      exp.description?.some(desc => /\d+%|\$\d+|\d+\s*(users?|customers?|clients?|projects?|team members?)/i.test(desc))
    );
    if (!hasQuantifiedAchievements && sections.experience && sections.experience.length > 0) {
      flaws.push({
        category: 'major',
        title: 'No Quantified Achievements',
        description: 'Your experience bullets lack specific numbers and metrics.',
        impact: 'Quantified achievements are 40% more likely to catch recruiter attention.',
        howToFix: 'Add specific numbers, percentages, and metrics to your accomplishments.',
        examples: [
          '❌ "Improved sales performance"',
          '✅ "Increased sales by 35% within 6 months, generating $500K in new revenue"',
          '❌ "Managed a team"',
          '✅ "Led a team of 8 engineers to deliver 3 major product releases"',
        ],
      });
    }

    // Missing professional summary
    if (!sections.summary || sections.summary.length < 50) {
      flaws.push({
        category: 'major',
        title: 'Missing or Weak Professional Summary',
        description: 'Your resume lacks a compelling professional summary.',
        impact: 'A strong summary helps both ATS and recruiters quickly understand your value.',
        howToFix: 'Add a 2-4 sentence summary highlighting your experience, key skills, and career goals.',
        examples: [
          'Results-driven software engineer with 5+ years of experience in full-stack development. Proven track record of building scalable applications serving 1M+ users. Expertise in React, Node.js, and AWS.',
        ],
      });
    }

    // Weak action verbs
    const experienceText = sections.experience?.map(e => e.description?.join(' ')).join(' ').toLowerCase() || '';
    const strongVerbs = ['led', 'developed', 'implemented', 'achieved', 'increased', 'reduced', 'designed', 'built', 'managed', 'created'];
    const strongVerbCount = strongVerbs.filter(verb => experienceText.includes(verb)).length;
    if (strongVerbCount < 3 && sections.experience && sections.experience.length > 0) {
      flaws.push({
        category: 'major',
        title: 'Weak Action Verbs',
        description: 'Your resume lacks strong action verbs that demonstrate impact.',
        impact: 'Strong verbs improve ATS matching and make your achievements more compelling.',
        howToFix: 'Start each bullet point with a powerful action verb.',
        examples: [
          'Strong verbs: Led, Developed, Implemented, Achieved, Increased, Reduced, Designed, Optimized, Spearheaded',
          '❌ "Was responsible for managing..."',
          '✅ "Managed a portfolio of 20+ client accounts..."',
        ],
      });
    }

    // === MINOR FLAWS ===

    // Missing LinkedIn
    if (!sections.contact?.linkedin) {
      flaws.push({
        category: 'minor',
        title: 'No LinkedIn Profile',
        description: 'LinkedIn URL is not included in your resume.',
        impact: 'Many recruiters check LinkedIn for additional information.',
        howToFix: 'Add your LinkedIn profile URL to your contact information.',
        examples: ['linkedin.com/in/yourname'],
      });
    }

    // No education section
    if (!sections.education || sections.education.length === 0) {
      flaws.push({
        category: 'minor',
        title: 'Missing Education Section',
        description: 'No education information found.',
        impact: 'Some ATS systems and jobs require education verification.',
        howToFix: 'Add your educational background with degree, institution, and graduation date.',
        examples: ['Bachelor of Science in Computer Science | MIT | May 2020'],
      });
    }

    // Too few skills
    if (sections.skills && sections.skills.length < 5) {
      flaws.push({
        category: 'minor',
        title: 'Insufficient Skills Listed',
        description: `Only ${sections.skills.length} skills detected. This is below the recommended 10-15.`,
        impact: 'Fewer skills mean fewer keyword matches with job descriptions.',
        howToFix: 'Add more relevant technical and soft skills.',
        examples: ['Aim for 10-15 key skills', 'Include both hard skills (Python, SQL) and soft skills (Leadership, Communication)'],
      });
    }

    // Formatting issues from analysis
    if (analysis.formatIssues && analysis.formatIssues.length > 0) {
      const highSeverity = analysis.formatIssues.filter(i => i.severity === 'high');
      if (highSeverity.length > 0) {
        flaws.push({
          category: 'major',
          title: 'Formatting Issues Detected',
          description: highSeverity.map(i => i.description).join('; '),
          impact: 'Poor formatting can cause ATS parsing errors.',
          howToFix: 'Use a clean, single-column layout with standard fonts and no tables or graphics.',
        });
      }
    }

    return flaws;
  }

  /**
   * Generate tips to make the resume ATS-approved
   */
  private generateApprovalTips(text: string, sections: IParsedSections, analysis: IAnalysisResult): IATSApprovalTip[] {
    const tips: IATSApprovalTip[] = [];

    // Contact Information
    tips.push({
      category: 'Contact Information',
      title: 'Include Complete Contact Details',
      description: 'Full name, email, phone number, LinkedIn, and location (city, state)',
      priority: 'high',
      implemented: !!(sections.contact?.email && sections.contact?.phone),
    });

    // Format
    tips.push({
      category: 'Format',
      title: 'Use ATS-Friendly File Format',
      description: 'Save your resume as PDF or DOCX. Avoid images or scanned documents.',
      priority: 'high',
      implemented: true, // If they uploaded it, we assume it's valid
    });

    tips.push({
      category: 'Format',
      title: 'Use Standard Section Headers',
      description: 'Use clear headers like "Work Experience", "Education", "Skills" instead of creative alternatives.',
      priority: 'high',
      implemented: analysis.scores.sectionStructure >= 70,
    });

    tips.push({
      category: 'Format',
      title: 'Avoid Tables, Graphics, and Images',
      description: 'ATS cannot read images. Use plain text and simple bullet points.',
      priority: 'high',
      implemented: !analysis.formatIssues?.some(i => i.type === 'tables'),
    });

    tips.push({
      category: 'Format',
      title: 'Use Standard Fonts',
      description: 'Stick to Arial, Calibri, Times New Roman, or similar readable fonts.',
      priority: 'medium',
      implemented: true, // Hard to detect from text
    });

    // Keywords
    tips.push({
      category: 'Keywords',
      title: 'Include Industry Keywords',
      description: 'Mirror keywords from the job description naturally throughout your resume.',
      priority: 'high',
      implemented: analysis.scores.keywordRelevance >= 60,
    });

    tips.push({
      category: 'Keywords',
      title: 'Use Both Acronyms and Full Terms',
      description: 'Include both "SEO" and "Search Engine Optimization" to match various ATS searches.',
      priority: 'medium',
      implemented: analysis.keywords.found.length >= 10,
    });

    // Experience
    tips.push({
      category: 'Experience',
      title: 'Quantify Your Achievements',
      description: 'Use numbers, percentages, and dollar amounts to demonstrate impact.',
      priority: 'high',
      implemented: analysis.scores.experienceQuality >= 70,
    });

    tips.push({
      category: 'Experience',
      title: 'Use Strong Action Verbs',
      description: 'Start bullets with verbs like Developed, Led, Implemented, Achieved, Increased.',
      priority: 'high',
      implemented: analysis.scores.experienceQuality >= 60,
    });

    tips.push({
      category: 'Experience',
      title: 'Include Relevant Job Titles',
      description: 'Use industry-standard job titles that match what recruiters search for.',
      priority: 'medium',
      implemented: !!(sections.experience && sections.experience.length > 0 && sections.experience[0].title),
    });

    // Skills
    tips.push({
      category: 'Skills',
      title: 'Create a Dedicated Skills Section',
      description: 'List 10-15 relevant skills in a separate, clearly labeled section.',
      priority: 'high',
      implemented: !!(sections.skills && sections.skills.length >= 5),
    });

    tips.push({
      category: 'Skills',
      title: 'Include Both Hard and Soft Skills',
      description: 'Technical skills + soft skills like Leadership, Communication, Problem-solving.',
      priority: 'medium',
      implemented: !!(sections.skills && sections.skills.length >= 8),
    });

    // Summary
    tips.push({
      category: 'Summary',
      title: 'Write a Targeted Professional Summary',
      description: '2-4 sentences highlighting your experience level, key skills, and career objective.',
      priority: 'medium',
      implemented: !!(sections.summary && sections.summary.length >= 100),
    });

    // Length
    const wordCount = text.split(/\s+/).length;
    tips.push({
      category: 'Length',
      title: 'Keep Resume to 1-2 Pages',
      description: 'Entry-level: 1 page. Experienced: 1-2 pages. Executives: up to 3 pages.',
      priority: 'medium',
      implemented: wordCount >= 300 && wordCount <= 1200,
    });

    return tips;
  }

  /**
   * Calculate overall ATS readiness score
   */
  private calculateReadinessScore(flaws: IATSFlaw[], tips: IATSApprovalTip[]): number {
    let score = 100;

    // Deduct for flaws
    for (const flaw of flaws) {
      if (flaw.category === 'critical') score -= 15;
      else if (flaw.category === 'major') score -= 10;
      else score -= 5;
    }

    // Add for implemented tips
    const implementedCount = tips.filter(t => t.implemented).length;
    const implementedRatio = implementedCount / tips.length;
    score = Math.round(score * 0.7 + (implementedRatio * 100) * 0.3);

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Generate a summary message
   */
  private generateSummary(flaws: IATSFlaw[], score: number): string {
    const criticalCount = flaws.filter(f => f.category === 'critical').length;
    const majorCount = flaws.filter(f => f.category === 'major').length;

    if (score >= 80) {
      return 'Your resume is well-optimized for ATS systems. Focus on minor tweaks to achieve a perfect score.';
    } else if (score >= 60) {
      return `Your resume has potential but needs improvements. Found ${criticalCount} critical and ${majorCount} major issues to address.`;
    } else if (score >= 40) {
      return `Your resume needs significant work to pass ATS systems. Address the ${criticalCount} critical issues first.`;
    } else {
      return `Your resume is not ATS-ready. It may be rejected by automated systems. Please address all critical issues immediately.`;
    }
  }
}

export const atsFlawAnalyzer = new ATSFlawAnalyzer();
