import { IJobMatchResult, IKeywordMatch, ISkillGap, IParsedSections } from '../types';

/**
 * Job Description Matching Service
 * Compares resumes against job descriptions to find gaps
 */
export class JobMatcher {
  /**
   * Match resume against a job description
   */
  matchJobDescription(
    resumeText: string,
    resumeSections: IParsedSections,
    jobDescription: string
  ): IJobMatchResult {
    const jobKeywords = this.extractJobKeywords(jobDescription);
    const resumeKeywords = this.extractResumeKeywords(resumeText, resumeSections);

    const keywordMatch = this.calculateKeywordMatch(jobKeywords, resumeKeywords);
    const skillGap = this.analyzeSkillGap(jobDescription, resumeSections);
    const matchScore = this.calculateMatchScore(keywordMatch, skillGap);
    const recommendations = this.generateRecommendations(keywordMatch, skillGap, jobDescription);
    const improvementPotential = this.calculateImprovementPotential(keywordMatch, skillGap);

    return {
      matchScore,
      keywordMatch,
      skillGap,
      recommendations,
      improvementPotential,
    };
  }

  /**
   * Extract keywords from job description
   */
  private extractJobKeywords(jobDescription: string): string[] {
    const keywords = new Set<string>();
    const lowerText = jobDescription.toLowerCase();

    // Common technical skills
    const technicalPatterns = [
      /\b(javascript|typescript|python|java|c\+\+|c#|ruby|go|rust|php|swift|kotlin)\b/gi,
      /\b(react|angular|vue|node\.?js|express|django|flask|spring|rails|\.net)\b/gi,
      /\b(aws|azure|gcp|docker|kubernetes|jenkins|ci\/cd|git|github|gitlab)\b/gi,
      /\b(mongodb|postgresql|mysql|redis|elasticsearch|graphql|rest\s*api)\b/gi,
      /\b(html|css|sass|tailwind|bootstrap|material\s*ui)\b/gi,
      /\b(machine\s*learning|deep\s*learning|tensorflow|pytorch|data\s*science)\b/gi,
      /\b(agile|scrum|kanban|jira|confluence)\b/gi,
    ];

    for (const pattern of technicalPatterns) {
      const matches = jobDescription.match(pattern);
      if (matches) {
        matches.forEach((m) => keywords.add(m.toLowerCase()));
      }
    }

    // Experience requirements
    const expMatch = jobDescription.match(/(\d+)\+?\s*years?\s*(?:of\s*)?experience/gi);
    if (expMatch) {
      expMatch.forEach((m) => keywords.add(m.toLowerCase()));
    }

    // Soft skills
    const softSkills = [
      'leadership', 'communication', 'teamwork', 'problem-solving', 'analytical',
      'management', 'collaboration', 'creative', 'detail-oriented', 'self-motivated',
    ];
    for (const skill of softSkills) {
      if (lowerText.includes(skill)) {
        keywords.add(skill);
      }
    }

    // Role-specific terms
    const roleTerms = [
      'full-stack', 'frontend', 'backend', 'devops', 'data engineer', 'ml engineer',
      'product manager', 'project manager', 'business analyst', 'qa engineer',
      'senior', 'lead', 'principal', 'architect', 'manager', 'director',
    ];
    for (const term of roleTerms) {
      if (lowerText.includes(term)) {
        keywords.add(term);
      }
    }

    // Extract quoted requirements
    const quotedMatch = jobDescription.match(/"([^"]+)"/g);
    if (quotedMatch) {
      quotedMatch.forEach((m) => {
        const cleaned = m.replace(/"/g, '').toLowerCase();
        if (cleaned.length > 2 && cleaned.length < 50) {
          keywords.add(cleaned);
        }
      });
    }

    return Array.from(keywords);
  }

  /**
   * Extract keywords from resume
   */
  private extractResumeKeywords(text: string, sections: IParsedSections): string[] {
    const keywords = new Set<string>();
    const lowerText = text.toLowerCase();

    // Add skills
    if (sections.skills) {
      sections.skills.forEach((skill) => keywords.add(skill.toLowerCase()));
    }

    // Extract from experience
    if (sections.experience) {
      for (const exp of sections.experience) {
        // Job titles
        if (exp.title) {
          keywords.add(exp.title.toLowerCase());
        }

        // Extract tech from descriptions
        for (const desc of exp.description || []) {
          const techMatch = desc.match(/\b[A-Z][a-z]*(?:\.[a-z]+)*\b/g);
          if (techMatch) {
            techMatch.forEach((t) => keywords.add(t.toLowerCase()));
          }
        }
      }
    }

    // Extract common terms
    const commonTerms = [
      'javascript', 'typescript', 'python', 'java', 'react', 'angular', 'vue',
      'node', 'express', 'mongodb', 'postgresql', 'aws', 'azure', 'docker',
      'kubernetes', 'agile', 'scrum', 'ci/cd', 'git',
    ];

    for (const term of commonTerms) {
      if (lowerText.includes(term)) {
        keywords.add(term);
      }
    }

    return Array.from(keywords);
  }

  /**
   * Calculate keyword match between job and resume
   */
  private calculateKeywordMatch(jobKeywords: string[], resumeKeywords: string[]): IKeywordMatch {
    const resumeSet = new Set(resumeKeywords.map((k) => k.toLowerCase()));
    const matched: string[] = [];
    const missing: string[] = [];

    for (const keyword of jobKeywords) {
      const lowerKeyword = keyword.toLowerCase();
      // Check for exact match or partial match
      const isMatched = resumeKeywords.some(
        (rk) => rk.includes(lowerKeyword) || lowerKeyword.includes(rk)
      );

      if (isMatched) {
        matched.push(keyword);
      } else {
        missing.push(keyword);
      }
    }

    const percentage = jobKeywords.length > 0 
      ? Math.round((matched.length / jobKeywords.length) * 100) 
      : 0;

    return {
      matched,
      missing,
      percentage,
    };
  }

  /**
   * Analyze skill gap between job requirements and resume
   */
  private analyzeSkillGap(jobDescription: string, sections: IParsedSections): ISkillGap {
    const requiredSkills = this.extractRequiredSkills(jobDescription);
    const resumeSkills = (sections.skills || []).map((s) => s.toLowerCase());

    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];
    const additionalSkills: string[] = [];

    for (const skill of requiredSkills) {
      const found = resumeSkills.some(
        (rs) => rs.includes(skill.toLowerCase()) || skill.toLowerCase().includes(rs)
      );
      if (found) {
        matchedSkills.push(skill);
      } else {
        missingSkills.push(skill);
      }
    }

    // Find additional skills in resume not in job description
    const reqLower = requiredSkills.map((s) => s.toLowerCase());
    for (const skill of resumeSkills) {
      if (!reqLower.some((r) => r.includes(skill) || skill.includes(r))) {
        additionalSkills.push(skill);
      }
    }

    return {
      requiredSkills,
      matchedSkills,
      missingSkills,
      additionalSkills,
    };
  }

  /**
   * Extract required skills from job description
   */
  private extractRequiredSkills(jobDescription: string): string[] {
    const skills = new Set<string>();
    const lowerText = jobDescription.toLowerCase();

    // Requirements section patterns
    const requirementPatterns = [
      /requirements?:?\s*\n([\s\S]*?)(?=\n\s*(?:responsibilities|qualifications|benefits|about|$))/i,
      /qualifications?:?\s*\n([\s\S]*?)(?=\n\s*(?:responsibilities|requirements|benefits|about|$))/i,
      /must\s*have:?\s*\n([\s\S]*?)(?=\n\s*(?:nice|good|responsibilities|$))/i,
    ];

    let requirementsText = jobDescription;
    for (const pattern of requirementPatterns) {
      const match = jobDescription.match(pattern);
      if (match) {
        requirementsText = match[1];
        break;
      }
    }

    // Extract bullet items
    const bulletItems = requirementsText.match(/[•\-*]\s*([^\n]+)/g) || [];
    for (const item of bulletItems) {
      // Look for skill patterns in bullet items
      const skillMatch = item.match(/\b([A-Z][a-zA-Z+#.]+(?:\s+[A-Z][a-zA-Z+#.]+)?)\b/g);
      if (skillMatch) {
        skillMatch.forEach((s) => {
          if (s.length >= 2 && s.length <= 30) {
            skills.add(s);
          }
        });
      }
    }

    // Common required skills
    const commonSkills = [
      'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'Go', 'Rust',
      'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Spring',
      'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Git',
      'SQL', 'MongoDB', 'PostgreSQL', 'Redis',
      'Agile', 'Scrum', 'CI/CD',
    ];

    for (const skill of commonSkills) {
      if (lowerText.includes(skill.toLowerCase())) {
        skills.add(skill);
      }
    }

    return Array.from(skills).slice(0, 30);
  }

  /**
   * Calculate overall match score
   */
  private calculateMatchScore(keywordMatch: IKeywordMatch, skillGap: ISkillGap): number {
    // Keyword match weight: 60%
    const keywordScore = keywordMatch.percentage * 0.6;

    // Skill match weight: 40%
    const skillMatchRatio = skillGap.requiredSkills.length > 0
      ? skillGap.matchedSkills.length / skillGap.requiredSkills.length
      : 0;
    const skillScore = skillMatchRatio * 40;

    return Math.round(keywordScore + skillScore);
  }

  /**
   * Generate recommendations for improving match
   */
  private generateRecommendations(
    keywordMatch: IKeywordMatch,
    skillGap: ISkillGap,
    jobDescription: string
  ): string[] {
    const recommendations: string[] = [];

    // Missing keywords
    if (keywordMatch.missing.length > 0) {
      const topMissing = keywordMatch.missing.slice(0, 5).join(', ');
      recommendations.push(
        `Add these missing keywords to your resume: ${topMissing}`
      );
    }

    // Missing skills
    if (skillGap.missingSkills.length > 0) {
      const topMissingSkills = skillGap.missingSkills.slice(0, 5).join(', ');
      recommendations.push(
        `Consider adding these skills to your resume: ${topMissingSkills}`
      );
    }

    // Experience level recommendation
    const expMatch = jobDescription.match(/(\d+)\+?\s*years?\s*(?:of\s*)?experience/i);
    if (expMatch) {
      recommendations.push(
        `This role requires ${expMatch[1]}+ years of experience. Ensure your resume clearly shows relevant experience duration.`
      );
    }

    // Keyword percentage recommendation
    if (keywordMatch.percentage < 50) {
      recommendations.push(
        'Your resume has less than 50% keyword match. Tailor your resume more closely to this job description.'
      );
    }

    // Additional skills recommendation
    if (skillGap.additionalSkills.length > 5) {
      recommendations.push(
        'You have many additional skills not mentioned in the job description. Consider highlighting the most relevant ones.'
      );
    }

    // Generic recommendations
    if (recommendations.length === 0) {
      recommendations.push(
        'Your resume is a good match! Consider adding specific achievements that align with the job responsibilities.'
      );
    }

    return recommendations;
  }

  /**
   * Calculate improvement potential
   */
  private calculateImprovementPotential(keywordMatch: IKeywordMatch, skillGap: ISkillGap): number {
    const currentScore = this.calculateMatchScore(keywordMatch, skillGap);
    
    // If all missing keywords were added
    const potentialKeywordImprovement = keywordMatch.missing.length * 2;
    
    // If missing skills were added
    const potentialSkillImprovement = skillGap.missingSkills.length * 3;

    const potentialScore = Math.min(
      100,
      currentScore + potentialKeywordImprovement + potentialSkillImprovement
    );

    return potentialScore - currentScore;
  }
}

export const jobMatcher = new JobMatcher();
