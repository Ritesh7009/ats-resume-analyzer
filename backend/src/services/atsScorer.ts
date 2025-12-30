import {
  IParsedSections,
  IAnalysisResult,
  IScoreBreakdown,
  ISectionFeedback,
  IKeywordAnalysis,
  IImprovement,
  IFormatIssue,
} from '../types';

/**
 * ATS Scoring Engine
 * Calculates ATS compatibility score based on multiple factors
 */
export class ATSScorer {
  // Industry-standard keywords categorized by domain
  private readonly industryKeywords: Record<string, string[]> = {
    general: [
      'leadership', 'management', 'communication', 'teamwork', 'problem-solving',
      'analytical', 'strategic', 'organized', 'detail-oriented', 'results-driven',
      'innovative', 'collaborative', 'adaptable', 'proactive', 'motivated',
    ],
    tech: [
      'software development', 'agile', 'scrum', 'devops', 'cloud computing',
      'microservices', 'api', 'database', 'testing', 'deployment',
      'scalability', 'performance', 'security', 'automation', 'integration',
      'full-stack', 'frontend', 'backend', 'mobile development', 'web development',
    ],
    business: [
      'project management', 'stakeholder', 'roi', 'kpi', 'budget',
      'strategy', 'operations', 'process improvement', 'client relations',
      'business development', 'account management', 'revenue growth',
    ],
    marketing: [
      'seo', 'sem', 'social media', 'content marketing', 'brand management',
      'analytics', 'campaign', 'lead generation', 'digital marketing',
      'email marketing', 'conversion', 'engagement',
    ],
    data: [
      'data analysis', 'machine learning', 'statistics', 'visualization',
      'python', 'sql', 'tableau', 'power bi', 'big data', 'predictive modeling',
      'data mining', 'etl', 'reporting', 'insights',
    ],
  };

  // Action verbs that strengthen resume bullets
  private readonly actionVerbs = [
    'achieved', 'accomplished', 'accelerated', 'administered', 'analyzed',
    'built', 'created', 'coordinated', 'delivered', 'designed', 'developed',
    'directed', 'enhanced', 'established', 'exceeded', 'executed', 'expanded',
    'generated', 'implemented', 'improved', 'increased', 'initiated', 'innovated',
    'launched', 'led', 'managed', 'negotiated', 'optimized', 'orchestrated',
    'pioneered', 'produced', 'reduced', 'resolved', 'revamped', 'spearheaded',
    'streamlined', 'strengthened', 'transformed', 'unified',
  ];

  // Required sections for a complete resume
  private readonly requiredSections = [
    'contact',
    'summary',
    'experience',
    'education',
    'skills',
  ];

  /**
   * Calculate comprehensive ATS score
   */
  calculateScore(text: string, sections: IParsedSections): IAnalysisResult {
    const scores = this.calculateScoreBreakdown(text, sections);
    const overallScore = this.calculateOverallScore(scores);
    const feedback = this.generateFeedback(sections, scores);
    const keywords = this.analyzeKeywords(text, sections);
    const improvements = this.generateImprovements(text, sections, scores);
    const formatIssues = this.checkFormatting(text);

    return {
      overallScore,
      scores,
      feedback,
      keywords,
      improvements,
      formatIssues,
    };
  }

  /**
   * Calculate individual score components
   */
  private calculateScoreBreakdown(text: string, sections: IParsedSections): IScoreBreakdown {
    return {
      keywordRelevance: this.scoreKeywordRelevance(text),
      sectionStructure: this.scoreSectionStructure(sections),
      formatting: this.scoreFormatting(text),
      experienceQuality: this.scoreExperienceQuality(sections),
      skillsMatch: this.scoreSkillsMatch(sections),
      fileStructure: this.scoreFileStructure(text, sections),
    };
  }

  /**
   * Calculate weighted overall score
   */
  private calculateOverallScore(scores: IScoreBreakdown): number {
    const weights = {
      keywordRelevance: 0.25,
      sectionStructure: 0.20,
      formatting: 0.15,
      experienceQuality: 0.15,
      skillsMatch: 0.15,
      fileStructure: 0.10,
    };

    let totalScore = 0;
    for (const [key, weight] of Object.entries(weights)) {
      totalScore += scores[key as keyof IScoreBreakdown] * weight;
    }

    return Math.round(totalScore);
  }

  /**
   * Score keyword relevance (0-100)
   */
  private scoreKeywordRelevance(text: string): number {
    const lowerText = text.toLowerCase();
    let score = 0;
    let totalKeywords = 0;
    let foundKeywords = 0;

    for (const category of Object.values(this.industryKeywords)) {
      for (const keyword of category) {
        totalKeywords++;
        if (lowerText.includes(keyword.toLowerCase())) {
          foundKeywords++;
        }
      }
    }

    // Check for action verbs
    let actionVerbCount = 0;
    for (const verb of this.actionVerbs) {
      if (lowerText.includes(verb)) {
        actionVerbCount++;
      }
    }

    // Keyword score (60% weight)
    const keywordRatio = foundKeywords / Math.min(totalKeywords, 50);
    score += Math.min(keywordRatio * 100, 60);

    // Action verb score (40% weight)
    const actionVerbRatio = actionVerbCount / 15; // Expect at least 15 action verbs
    score += Math.min(actionVerbRatio * 40, 40);

    return Math.round(Math.min(score, 100));
  }

  /**
   * Score section structure (0-100)
   */
  private scoreSectionStructure(sections: IParsedSections): number {
    let score = 0;
    const maxScore = 100;
    const sectionPoints = maxScore / this.requiredSections.length;

    // Check for required sections
    if (sections.contact?.email || sections.contact?.phone) score += sectionPoints;
    if (sections.summary && sections.summary.length > 50) score += sectionPoints;
    if (sections.experience && sections.experience.length > 0) score += sectionPoints;
    if (sections.education && sections.education.length > 0) score += sectionPoints;
    if (sections.skills && sections.skills.length > 0) score += sectionPoints;

    // Bonus for additional sections
    if (sections.projects && sections.projects.length > 0) score += 5;
    if (sections.certifications && sections.certifications.length > 0) score += 5;

    return Math.round(Math.min(score, 100));
  }

  /**
   * Score formatting (0-100)
   */
  private scoreFormatting(text: string): number {
    let score = 100;

    // Check for common formatting issues
    const issues = [
      { pattern: /[^\x00-\x7F]/g, penalty: 5, description: 'Special characters' },
      { pattern: /\t{2,}/g, penalty: 10, description: 'Excessive tabs' },
      { pattern: /\n{4,}/g, penalty: 10, description: 'Too many blank lines' },
      { pattern: /<[^>]+>/g, penalty: 15, description: 'HTML tags' },
      { pattern: /[│├└┤┬┴┼]/g, penalty: 20, description: 'Table characters' },
      { pattern: /\|{2,}/g, penalty: 10, description: 'Pipe characters' },
    ];

    for (const issue of issues) {
      const matches = text.match(issue.pattern);
      if (matches && matches.length > 3) {
        score -= issue.penalty;
      }
    }

    // Check resume length
    const wordCount = text.split(/\s+/).length;
    if (wordCount < 200) score -= 15; // Too short
    if (wordCount > 1500) score -= 10; // Too long

    // Check for bullet points (good for ATS)
    const bulletPoints = (text.match(/[•\-*]\s+\w/g) || []).length;
    if (bulletPoints >= 5) score += 5;
    if (bulletPoints >= 10) score += 5;

    return Math.max(0, Math.min(score, 100));
  }

  /**
   * Score experience quality (0-100)
   */
  private scoreExperienceQuality(sections: IParsedSections): number {
    if (!sections.experience || sections.experience.length === 0) {
      return 20; // Minimum score for missing experience
    }

    let score = 0;
    const experiences = sections.experience;

    // Points for having experiences
    score += Math.min(experiences.length * 15, 30);

    // Check each experience entry
    for (const exp of experiences) {
      // Has title
      if (exp.title && exp.title.length > 2) score += 5;
      
      // Has company
      if (exp.company && exp.company.length > 2) score += 5;
      
      // Has dates
      if (exp.startDate) score += 3;
      if (exp.endDate || exp.current) score += 2;
      
      // Has bullet points
      if (exp.description && exp.description.length > 0) {
        score += Math.min(exp.description.length * 3, 15);
        
        // Check for quantified achievements
        for (const bullet of exp.description) {
          if (/\d+%|\$\d+|\d+\s*(users?|customers?|clients?|projects?|team)/i.test(bullet)) {
            score += 5;
          }
          // Check for action verbs
          const firstWord = bullet.split(' ')[0]?.toLowerCase();
          if (this.actionVerbs.includes(firstWord)) {
            score += 2;
          }
        }
      }
    }

    return Math.round(Math.min(score, 100));
  }

  /**
   * Score skills relevance (0-100)
   */
  private scoreSkillsMatch(sections: IParsedSections): number {
    if (!sections.skills || sections.skills.length === 0) {
      return 20; // Minimum score for missing skills
    }

    let score = 0;
    const skills = sections.skills;

    // Points based on number of skills
    score += Math.min(skills.length * 5, 40);

    // Check for hard vs soft skills balance
    const hardSkillPatterns = [
      /javascript|python|java|c\+\+|typescript|react|angular|vue|node|sql|aws|azure|docker|kubernetes/i,
      /excel|powerpoint|photoshop|figma|tableau|salesforce|sap|oracle/i,
    ];

    const softSkillPatterns = [
      /leadership|communication|teamwork|problem.?solving|management|analytical|creative/i,
    ];

    let hardSkills = 0;
    let softSkills = 0;

    for (const skill of skills) {
      for (const pattern of hardSkillPatterns) {
        if (pattern.test(skill)) hardSkills++;
      }
      for (const pattern of softSkillPatterns) {
        if (pattern.test(skill)) softSkills++;
      }
    }

    // Balanced skills get bonus
    if (hardSkills >= 5) score += 20;
    if (softSkills >= 2) score += 10;
    if (hardSkills >= 3 && softSkills >= 2) score += 10; // Balance bonus

    // Skills organized in categories (detected by variety)
    const uniqueCategories = new Set(skills.map((s) => s.charAt(0).toLowerCase()));
    if (uniqueCategories.size >= 5) score += 10;

    return Math.round(Math.min(score, 100));
  }

  /**
   * Score file structure (0-100)
   */
  private scoreFileStructure(text: string, sections: IParsedSections): number {
    let score = 70; // Base score

    // Check for proper section headers
    const headers = [
      /\b(SUMMARY|PROFILE|OBJECTIVE)\b/i,
      /\b(EXPERIENCE|WORK|EMPLOYMENT)\b/i,
      /\b(EDUCATION|ACADEMIC)\b/i,
      /\b(SKILLS|COMPETENCIES|EXPERTISE)\b/i,
    ];

    for (const header of headers) {
      if (header.test(text)) score += 5;
    }

    // Check contact info is at the top
    if (sections.contact?.email && text.indexOf(sections.contact.email) < 500) {
      score += 10;
    }

    // Penalize issues
    if (!sections.contact?.email) score -= 10;
    if (!sections.contact?.phone) score -= 5;

    return Math.max(0, Math.min(score, 100));
  }

  /**
   * Analyze keywords in detail
   */
  private analyzeKeywords(text: string, sections: IParsedSections): IKeywordAnalysis {
    const lowerText = text.toLowerCase();
    const found: string[] = [];
    const missing: string[] = [];
    const allKeywords = Object.values(this.industryKeywords).flat();

    // Determine industry based on skills
    const likelyIndustry = this.detectIndustry(sections);
    const industryKeywords = this.industryKeywords[likelyIndustry] || this.industryKeywords.general;

    for (const keyword of industryKeywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        found.push(keyword);
      } else {
        missing.push(keyword);
      }
    }

    const relevanceScore = Math.round((found.length / industryKeywords.length) * 100);

    return {
      found,
      missing: missing.slice(0, 10), // Top 10 missing
      relevanceScore,
      industryKeywords: industryKeywords.slice(0, 20),
    };
  }

  /**
   * Detect likely industry from resume content
   */
  private detectIndustry(sections: IParsedSections): string {
    const skills = (sections.skills || []).join(' ').toLowerCase();
    const experience = (sections.experience || [])
      .map((e) => `${e.title} ${e.description.join(' ')}`)
      .join(' ')
      .toLowerCase();
    const combined = `${skills} ${experience}`;

    const scores: Record<string, number> = {
      tech: 0,
      business: 0,
      marketing: 0,
      data: 0,
      general: 0,
    };

    // Tech indicators
    if (/software|developer|engineer|programming|code|api|database/.test(combined)) {
      scores.tech += 5;
    }
    if (/javascript|python|java|react|node|aws|docker/.test(combined)) {
      scores.tech += 3;
    }

    // Business indicators
    if (/manager|director|executive|strategy|operations|business/.test(combined)) {
      scores.business += 5;
    }

    // Marketing indicators
    if (/marketing|brand|campaign|seo|social media|content/.test(combined)) {
      scores.marketing += 5;
    }

    // Data indicators
    if (/data|analyst|machine learning|statistics|visualization|python|sql/.test(combined)) {
      scores.data += 5;
    }

    const maxIndustry = Object.entries(scores).reduce(
      (max, [key, value]) => (value > max[1] ? [key, value] : max),
      ['general', 0]
    );

    return maxIndustry[0];
  }

  /**
   * Generate section-by-section feedback
   */
  private generateFeedback(sections: IParsedSections, scores: IScoreBreakdown): ISectionFeedback[] {
    const feedback: ISectionFeedback[] = [];

    // Contact section
    feedback.push(this.generateContactFeedback(sections.contact));

    // Summary section
    feedback.push(this.generateSummaryFeedback(sections.summary));

    // Experience section
    feedback.push(this.generateExperienceFeedback(sections.experience, scores.experienceQuality));

    // Education section
    feedback.push(this.generateEducationFeedback(sections.education));

    // Skills section
    feedback.push(this.generateSkillsFeedback(sections.skills, scores.skillsMatch));

    return feedback;
  }

  private generateContactFeedback(contact?: IParsedSections['contact']): ISectionFeedback {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    if (!contact?.email) {
      issues.push('Email address is missing');
      suggestions.push('Add a professional email address');
      score -= 30;
    }

    if (!contact?.phone) {
      issues.push('Phone number is missing');
      suggestions.push('Include a contact phone number');
      score -= 20;
    }

    if (!contact?.linkedin) {
      suggestions.push('Add your LinkedIn profile URL');
      score -= 10;
    }

    if (!contact?.name) {
      issues.push('Name not clearly identified');
      suggestions.push('Ensure your full name is prominently displayed at the top');
      score -= 20;
    }

    return {
      section: 'Contact Information',
      score: Math.max(0, score),
      status: score >= 80 ? 'good' : score >= 50 ? 'warning' : 'error',
      issues,
      suggestions,
    };
  }

  private generateSummaryFeedback(summary?: string): ISectionFeedback {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    if (!summary) {
      issues.push('Professional summary is missing');
      suggestions.push('Add a 2-4 sentence professional summary highlighting your key qualifications');
      score = 20;
    } else {
      if (summary.length < 100) {
        issues.push('Summary is too short');
        suggestions.push('Expand your summary to 100-300 words');
        score -= 20;
      }
      if (summary.length > 500) {
        issues.push('Summary is too long');
        suggestions.push('Condense your summary to 100-300 words for better ATS parsing');
        score -= 15;
      }
      if (!/\d/.test(summary)) {
        suggestions.push('Add quantifiable achievements (e.g., "10+ years experience", "managed $1M budget")');
        score -= 10;
      }
    }

    return {
      section: 'Professional Summary',
      score: Math.max(0, score),
      status: score >= 80 ? 'good' : score >= 50 ? 'warning' : 'error',
      issues,
      suggestions,
    };
  }

  private generateExperienceFeedback(experience?: IParsedSections['experience'], qualityScore?: number): ISectionFeedback {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = qualityScore || 50;

    if (!experience || experience.length === 0) {
      issues.push('Work experience section is missing');
      suggestions.push('Add your work experience with clear job titles, companies, dates, and achievements');
      return {
        section: 'Work Experience',
        score: 20,
        status: 'error',
        issues,
        suggestions,
      };
    }

    let hasQuantifiedBullets = false;
    let totalBullets = 0;

    for (const exp of experience) {
      if (!exp.title) issues.push('Job title missing for an experience entry');
      if (!exp.company) issues.push('Company name missing for an experience entry');
      if (!exp.startDate && !exp.endDate) {
        issues.push('Dates missing for an experience entry');
      }

      for (const bullet of exp.description || []) {
        totalBullets++;
        if (/\d+%|\$\d+|\d+\s*(users?|customers?|projects?)/i.test(bullet)) {
          hasQuantifiedBullets = true;
        }
      }
    }

    if (totalBullets < experience.length * 3) {
      suggestions.push('Add more bullet points (3-5 per position) describing your achievements');
    }

    if (!hasQuantifiedBullets) {
      suggestions.push('Quantify your achievements with numbers, percentages, or dollar amounts');
    }

    suggestions.push('Start each bullet point with a strong action verb');

    return {
      section: 'Work Experience',
      score: Math.max(0, Math.min(score, 100)),
      status: score >= 80 ? 'good' : score >= 50 ? 'warning' : 'error',
      issues,
      suggestions,
    };
  }

  private generateEducationFeedback(education?: IParsedSections['education']): ISectionFeedback {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    if (!education || education.length === 0) {
      issues.push('Education section is missing');
      suggestions.push('Add your educational background including degree, institution, and graduation date');
      return {
        section: 'Education',
        score: 30,
        status: 'error',
        issues,
        suggestions,
      };
    }

    for (const edu of education) {
      if (!edu.degree) {
        issues.push('Degree name is missing');
        score -= 15;
      }
      if (!edu.institution) {
        issues.push('Institution name is missing');
        score -= 15;
      }
      if (!edu.graduationDate) {
        suggestions.push('Add graduation date or expected graduation date');
        score -= 5;
      }
    }

    if (education.length > 0 && !education[0].gpa && education[0].graduationDate) {
      const gradYear = parseInt(education[0].graduationDate);
      if (gradYear && new Date().getFullYear() - gradYear < 3) {
        suggestions.push('Consider adding your GPA if it\'s 3.5 or higher (for recent graduates)');
      }
    }

    return {
      section: 'Education',
      score: Math.max(0, score),
      status: score >= 80 ? 'good' : score >= 50 ? 'warning' : 'error',
      issues,
      suggestions,
    };
  }

  private generateSkillsFeedback(skills?: string[], skillsScore?: number): ISectionFeedback {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = skillsScore || 50;

    if (!skills || skills.length === 0) {
      issues.push('Skills section is missing');
      suggestions.push('Add a skills section with relevant technical and soft skills');
      return {
        section: 'Skills',
        score: 20,
        status: 'error',
        issues,
        suggestions,
      };
    }

    if (skills.length < 5) {
      issues.push('Skills section is too short');
      suggestions.push('Add more relevant skills (aim for 10-15 key skills)');
      score -= 10;
    }

    if (skills.length > 30) {
      issues.push('Too many skills listed');
      suggestions.push('Focus on your top 15-20 most relevant skills');
      score -= 5;
    }

    suggestions.push('Organize skills by category (e.g., Programming Languages, Tools, Soft Skills)');

    return {
      section: 'Skills',
      score: Math.max(0, Math.min(score, 100)),
      status: score >= 80 ? 'good' : score >= 50 ? 'warning' : 'error',
      issues,
      suggestions,
    };
  }

  /**
   * Generate actionable improvements
   */
  private generateImprovements(text: string, sections: IParsedSections, scores: IScoreBreakdown): IImprovement[] {
    const improvements: IImprovement[] = [];

    // Critical improvements
    if (!sections.contact?.email) {
      improvements.push({
        type: 'critical',
        section: 'Contact',
        issue: 'Missing email address',
        suggestion: 'Add your professional email address at the top of your resume',
        example: 'john.doe@email.com',
      });
    }

    if (!sections.experience || sections.experience.length === 0) {
      improvements.push({
        type: 'critical',
        section: 'Experience',
        issue: 'No work experience listed',
        suggestion: 'Add your professional experience with job titles, companies, and achievements',
      });
    }

    // Major improvements
    if (scores.keywordRelevance < 50) {
      improvements.push({
        type: 'major',
        section: 'Keywords',
        issue: 'Low keyword relevance score',
        suggestion: 'Include more industry-specific keywords and action verbs throughout your resume',
        example: 'Use terms like "managed", "developed", "implemented", "increased", "reduced"',
      });
    }

    if (scores.experienceQuality < 60 && sections.experience) {
      improvements.push({
        type: 'major',
        section: 'Experience',
        issue: 'Weak experience descriptions',
        suggestion: 'Quantify your achievements with specific numbers and metrics',
        example: 'Changed "Improved sales" to "Increased sales by 35% within 6 months"',
      });
    }

    // Minor improvements
    if (!sections.summary || sections.summary.length < 100) {
      improvements.push({
        type: 'minor',
        section: 'Summary',
        issue: 'Missing or weak professional summary',
        suggestion: 'Add a compelling 2-4 sentence summary of your qualifications',
      });
    }

    if (!sections.projects || sections.projects.length === 0) {
      improvements.push({
        type: 'minor',
        section: 'Projects',
        issue: 'No projects section',
        suggestion: 'Consider adding relevant projects to showcase your skills',
      });
    }

    if (scores.formatting < 70) {
      improvements.push({
        type: 'minor',
        section: 'Formatting',
        issue: 'Formatting issues detected',
        suggestion: 'Use consistent bullet points, avoid tables/graphics, use standard fonts',
      });
    }

    return improvements;
  }

  /**
   * Check for formatting issues
   */
  private checkFormatting(text: string): IFormatIssue[] {
    const issues: IFormatIssue[] = [];

    // Check for special characters
    if (/[^\x00-\x7F]/.test(text)) {
      const specialChars = text.match(/[^\x00-\x7F]/g) || [];
      if (specialChars.length > 10) {
        issues.push({
          type: 'special_characters',
          description: 'Resume contains special characters that may not parse correctly in ATS systems',
          severity: 'medium',
        });
      }
    }

    // Check for tables
    if (/[│├└┤┬┴┼\|]{2,}/.test(text)) {
      issues.push({
        type: 'tables',
        description: 'Tables detected. ATS systems may not parse tabular data correctly',
        severity: 'high',
      });
    }

    // Check for headers/footers issues
    const lines = text.split('\n');
    if (lines.length > 3) {
      const firstLine = lines[0].toLowerCase();
      const lastLine = lines[lines.length - 1].toLowerCase();
      if (/page \d|^\d+$|confidential/.test(firstLine) || /page \d|^\d+$|confidential/.test(lastLine)) {
        issues.push({
          type: 'headers_footers',
          description: 'Headers/footers detected. These may interfere with ATS parsing',
          severity: 'low',
        });
      }
    }

    // Check length
    const wordCount = text.split(/\s+/).length;
    if (wordCount < 200) {
      issues.push({
        type: 'too_short',
        description: 'Resume appears too short. Aim for 400-800 words for a strong resume',
        severity: 'high',
      });
    } else if (wordCount > 1500) {
      issues.push({
        type: 'too_long',
        description: 'Resume may be too long. Consider condensing to 1-2 pages',
        severity: 'medium',
      });
    }

    // Check for all caps sections
    const allCapsLines = lines.filter((line) => line.length > 20 && line === line.toUpperCase());
    if (allCapsLines.length > 5) {
      issues.push({
        type: 'excessive_caps',
        description: 'Excessive use of all caps. Use title case for better readability',
        severity: 'low',
      });
    }

    return issues;
  }
}

export const atsScorer = new ATSScorer();
