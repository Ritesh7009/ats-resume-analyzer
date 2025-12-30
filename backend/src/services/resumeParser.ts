import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import Tesseract from 'tesseract.js';
import { IParsedSections, IContactInfo, IExperienceItem, IEducationItem, IProjectItem } from '../types';

/**
 * Resume Parser Service
 * Extracts text and structured data from PDF, DOCX, and image files
 */
export class ResumeParser {
  /**
   * Parse resume file and extract text content
   */
  async parseFile(filePath: string): Promise<string> {
    const ext = path.extname(filePath).toLowerCase();
    
    if (ext === '.pdf') {
      return this.parsePDF(filePath);
    } else if (ext === '.docx') {
      return this.parseDOCX(filePath);
    } else if (['.jpg', '.jpeg', '.png'].includes(ext)) {
      return this.parseImage(filePath);
    } else {
      throw new Error('Unsupported file format. Please upload PDF, DOCX, JPG, JPEG, or PNG.');
    }
  }

  /**
   * Parse PDF file
   */
  private async parsePDF(filePath: string): Promise<string> {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return this.cleanText(data.text);
  }

  /**
   * Parse DOCX file
   */
  private async parseDOCX(filePath: string): Promise<string> {
    const result = await mammoth.extractRawText({ path: filePath });
    return this.cleanText(result.value);
  }

  /**
   * Parse image file using OCR (Tesseract.js)
   */
  private async parseImage(filePath: string): Promise<string> {
    const result = await Tesseract.recognize(filePath, 'eng', {
      logger: () => {} // Suppress logging
    });
    return this.cleanText(result.data.text);
  }

  /**
   * Clean and normalize extracted text
   */
  private cleanText(text: string): string {
    return text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\t/g, ' ')
      .replace(/\u00A0/g, ' ') // Non-breaking spaces
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();
  }

  /**
   * Extract structured sections from resume text
   */
  extractSections(text: string): IParsedSections {
    const sections: IParsedSections = {
      contact: this.extractContactInfo(text),
      summary: this.extractSummary(text),
      experience: this.extractExperience(text),
      education: this.extractEducation(text),
      skills: this.extractSkills(text),
      projects: this.extractProjects(text),
      certifications: this.extractCertifications(text),
    };

    return sections;
  }

  /**
   * Extract contact information
   */
  private extractContactInfo(text: string): IContactInfo {
    const contact: IContactInfo = {};
    const lines = text.split('\n').slice(0, 10); // Usually in first few lines
    const textBlock = lines.join(' ');

    // Email
    const emailMatch = textBlock.match(/[\w.-]+@[\w.-]+\.\w+/i);
    if (emailMatch) contact.email = emailMatch[0].toLowerCase();

    // Phone
    const phoneMatch = textBlock.match(/[\+]?[(]?[0-9]{1,3}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}/);
    if (phoneMatch) contact.phone = phoneMatch[0];

    // LinkedIn
    const linkedinMatch = textBlock.match(/linkedin\.com\/in\/[\w-]+/i);
    if (linkedinMatch) contact.linkedin = `https://${linkedinMatch[0]}`;

    // GitHub
    const githubMatch = textBlock.match(/github\.com\/[\w-]+/i);
    if (githubMatch) contact.github = `https://${githubMatch[0]}`;

    // Website
    const websiteMatch = textBlock.match(/(?:https?:\/\/)?(?:www\.)?[\w-]+\.[\w.-]+(?:\/[\w.-]*)?/gi);
    if (websiteMatch) {
      const website = websiteMatch.find(
        (url) => !url.includes('linkedin') && !url.includes('github') && !url.includes('@')
      );
      if (website) contact.website = website;
    }

    // Name (usually first line or first proper words)
    const nameMatch = lines[0]?.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/);
    if (nameMatch) contact.name = nameMatch[1];

    return contact;
  }

  /**
   * Extract professional summary
   */
  private extractSummary(text: string): string | undefined {
    const summaryPatterns = [
      /(?:SUMMARY|PROFILE|OBJECTIVE|ABOUT ME|PROFESSIONAL SUMMARY)[\s:]*\n?([\s\S]*?)(?=\n\s*(?:EXPERIENCE|WORK|EDUCATION|SKILLS|PROJECTS)|\n\n\n)/i,
    ];

    for (const pattern of summaryPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const summary = match[1].trim();
        if (summary.length > 20 && summary.length < 2000) {
          return summary;
        }
      }
    }

    return undefined;
  }

  /**
   * Extract work experience
   */
  private extractExperience(text: string): IExperienceItem[] {
    const experiences: IExperienceItem[] = [];
    
    const experienceSection = this.extractSection(text, [
      'EXPERIENCE',
      'WORK EXPERIENCE',
      'PROFESSIONAL EXPERIENCE',
      'EMPLOYMENT HISTORY',
      'WORK HISTORY',
    ]);

    if (!experienceSection) return experiences;

    // Split into individual job entries
    const jobBlocks = experienceSection.split(/\n(?=[A-Z][a-z]+.*?(?:\d{4}|Present))/);

    for (const block of jobBlocks) {
      if (block.trim().length < 20) continue;

      const lines = block.split('\n').filter((l) => l.trim());
      if (lines.length === 0) continue;

      const experience: IExperienceItem = {
        title: '',
        company: '',
        description: [],
      };

      // Try to extract title and company from first lines
      const firstLine = lines[0];
      const dateMatch = firstLine.match(/(\w+\s+\d{4})\s*[-–—]\s*(\w+\s+\d{4}|Present|Current)/i);
      
      if (dateMatch) {
        experience.startDate = dateMatch[1];
        experience.endDate = dateMatch[2];
        experience.current = /present|current/i.test(dateMatch[2]);
      }

      // Extract title (usually first meaningful text)
      const titleMatch = firstLine.match(/^([A-Z][^|@\d]*?)(?:\s*[-–|@]|\s*\d{4}|$)/);
      if (titleMatch) experience.title = titleMatch[1].trim();

      // Extract company
      if (lines.length > 1) {
        const companyLine = lines[1];
        const companyMatch = companyLine.match(/^([^|@\d]+?)(?:\s*[-–|]|$)/);
        if (companyMatch) experience.company = companyMatch[1].trim();
      }

      // Extract bullet points
      for (let i = 2; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.length > 10 && (line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || /^[A-Z]/.test(line))) {
          experience.description.push(line.replace(/^[•\-*]\s*/, ''));
        }
      }

      if (experience.title || experience.company) {
        experiences.push(experience);
      }
    }

    return experiences;
  }

  /**
   * Extract education
   */
  private extractEducation(text: string): IEducationItem[] {
    const education: IEducationItem[] = [];
    
    const educationSection = this.extractSection(text, [
      'EDUCATION',
      'ACADEMIC BACKGROUND',
      'QUALIFICATIONS',
    ]);

    if (!educationSection) return education;

    const blocks = educationSection.split(/\n(?=[A-Z])/);

    for (const block of blocks) {
      if (block.trim().length < 10) continue;

      const lines = block.split('\n').filter((l) => l.trim());
      if (lines.length === 0) continue;

      const edu: IEducationItem = {
        degree: '',
        institution: '',
      };

      // Look for degree patterns
      const degreePatterns = [
        /(?:Bachelor|Master|PhD|Doctor|Associate|B\.?S\.?|M\.?S\.?|B\.?A\.?|M\.?A\.?|MBA|B\.?Tech|M\.?Tech)[^,\n]*/i,
      ];

      for (const pattern of degreePatterns) {
        const match = lines[0]?.match(pattern);
        if (match) {
          edu.degree = match[0].trim();
          break;
        }
      }

      // Look for institution (usually has University, College, Institute)
      for (const line of lines) {
        if (/university|college|institute|school/i.test(line)) {
          edu.institution = line.replace(/\d{4}.*$/, '').trim();
          break;
        }
      }

      // Look for graduation date
      const dateMatch = block.match(/\d{4}/);
      if (dateMatch) edu.graduationDate = dateMatch[0];

      // Look for GPA
      const gpaMatch = block.match(/(?:GPA|CGPA)[\s:]*(\d+\.?\d*)/i);
      if (gpaMatch) edu.gpa = gpaMatch[1];

      if (edu.degree || edu.institution) {
        education.push(edu);
      }
    }

    return education;
  }

  /**
   * Extract skills
   */
  private extractSkills(text: string): string[] {
    const skills: Set<string> = new Set();
    
    const skillsSection = this.extractSection(text, [
      'SKILLS',
      'TECHNICAL SKILLS',
      'CORE COMPETENCIES',
      'KEY SKILLS',
      'TECHNOLOGIES',
      'EXPERTISE',
    ]);

    if (skillsSection) {
      // Extract comma or bullet separated skills
      const skillPatterns = [
        /([A-Za-z][A-Za-z0-9+#.\/\s-]{1,30})/g,
      ];

      const skillLines = skillsSection.split('\n');
      for (const line of skillLines) {
        // Split by common separators
        const items = line.split(/[,;|•\-\n]/);
        for (const item of items) {
          const cleaned = item.trim();
          if (cleaned.length >= 2 && cleaned.length <= 40 && /^[A-Za-z]/.test(cleaned)) {
            skills.add(cleaned);
          }
        }
      }
    }

    // Also search for common tech skills throughout the document
    const commonSkills = [
      'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'Go', 'Rust', 'PHP', 'Swift',
      'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Flask', 'Spring', 'Rails',
      'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'Git', 'GitHub', 'GitLab',
      'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Elasticsearch', 'GraphQL', 'REST API',
      'HTML', 'CSS', 'SASS', 'Tailwind', 'Bootstrap', 'Material UI',
      'Agile', 'Scrum', 'Jira', 'Confluence', 'Figma', 'Photoshop',
      'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Data Analysis',
      'SQL', 'NoSQL', 'Linux', 'Windows', 'macOS',
    ];

    for (const skill of commonSkills) {
      if (text.toLowerCase().includes(skill.toLowerCase())) {
        skills.add(skill);
      }
    }

    return Array.from(skills);
  }

  /**
   * Extract projects
   */
  private extractProjects(text: string): IProjectItem[] {
    const projects: IProjectItem[] = [];
    
    const projectsSection = this.extractSection(text, [
      'PROJECTS',
      'PERSONAL PROJECTS',
      'KEY PROJECTS',
      'SELECTED PROJECTS',
    ]);

    if (!projectsSection) return projects;

    const blocks = projectsSection.split(/\n(?=[A-Z])/);

    for (const block of blocks) {
      if (block.trim().length < 20) continue;

      const lines = block.split('\n').filter((l) => l.trim());
      if (lines.length === 0) continue;

      const project: IProjectItem = {
        name: lines[0]?.replace(/[-–|:].*$/, '').trim() || '',
        description: lines.slice(1).join(' ').trim(),
        technologies: [],
      };

      // Extract technologies mentioned
      const techMatch = block.match(/(?:Technologies?|Stack|Built with)[\s:]+([^\n]+)/i);
      if (techMatch) {
        project.technologies = techMatch[1].split(/[,;|]/).map((t) => t.trim());
      }

      // Extract link
      const linkMatch = block.match(/https?:\/\/[^\s]+/);
      if (linkMatch) project.link = linkMatch[0];

      if (project.name) {
        projects.push(project);
      }
    }

    return projects;
  }

  /**
   * Extract certifications
   */
  private extractCertifications(text: string): string[] {
    const certs: string[] = [];
    
    const certsSection = this.extractSection(text, [
      'CERTIFICATIONS',
      'CERTIFICATES',
      'LICENSES',
      'CREDENTIALS',
    ]);

    if (!certsSection) return certs;

    const lines = certsSection.split('\n');
    for (const line of lines) {
      const cleaned = line.replace(/^[•\-*]\s*/, '').trim();
      if (cleaned.length > 5 && cleaned.length < 200) {
        certs.push(cleaned);
      }
    }

    return certs;
  }

  /**
   * Helper to extract a section by header keywords
   */
  private extractSection(text: string, keywords: string[]): string | null {
    for (const keyword of keywords) {
      const pattern = new RegExp(
        `(?:^|\\n)\\s*${keyword}[\\s:]*\\n([\\s\\S]*?)(?=\\n\\s*(?:${this.getAllSectionHeaders().join('|')})[\\s:]*\\n|$)`,
        'i'
      );
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    return null;
  }

  /**
   * Get all possible section headers for parsing
   */
  private getAllSectionHeaders(): string[] {
    return [
      'SUMMARY', 'PROFILE', 'OBJECTIVE', 'ABOUT',
      'EXPERIENCE', 'WORK EXPERIENCE', 'EMPLOYMENT',
      'EDUCATION', 'ACADEMIC',
      'SKILLS', 'TECHNICAL SKILLS', 'COMPETENCIES',
      'PROJECTS', 'PERSONAL PROJECTS',
      'CERTIFICATIONS', 'CERTIFICATES',
      'AWARDS', 'ACHIEVEMENTS',
      'LANGUAGES', 'INTERESTS', 'HOBBIES',
      'REFERENCES', 'PUBLICATIONS',
    ];
  }
}

export const resumeParser = new ResumeParser();
