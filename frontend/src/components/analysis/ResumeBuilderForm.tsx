import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Chip,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Add,
  Delete,
  ExpandMore,
  Person,
  Work,
  School,
  Build,
  Description,
  CheckCircle,
  Warning,
  Save,
  ContentCopy,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { ATSFlaw } from '../../types';

interface ContactInfo {
  fullName: string;
  email: string;
  phone: string;
  linkedin: string;
  location: string;
  portfolio: string;
}

interface Experience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

interface Education {
  id: string;
  degree: string;
  institution: string;
  graduationDate: string;
  gpa: string;
}

interface ResumeData {
  contact: ContactInfo;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
}

interface ResumeBuilderFormProps {
  flaws?: ATSFlaw[];
  initialData?: Partial<ResumeData>;
  onSave?: (data: ResumeData) => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const ResumeBuilderForm: React.FC<ResumeBuilderFormProps> = ({
  flaws = [],
  initialData,
  onSave,
}) => {
  const [resumeData, setResumeData] = useState<ResumeData>({
    contact: {
      fullName: initialData?.contact?.fullName || '',
      email: initialData?.contact?.email || '',
      phone: initialData?.contact?.phone || '',
      linkedin: initialData?.contact?.linkedin || '',
      location: initialData?.contact?.location || '',
      portfolio: initialData?.contact?.portfolio || '',
    },
    summary: initialData?.summary || '',
    experience: initialData?.experience || [
      {
        id: generateId(),
        title: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        bullets: [''],
      },
    ],
    education: initialData?.education || [
      {
        id: generateId(),
        degree: '',
        institution: '',
        graduationDate: '',
        gpa: '',
      },
    ],
    skills: initialData?.skills || [],
  });

  const [newSkill, setNewSkill] = useState('');
  const [expandedSection, setExpandedSection] = useState<string | false>('contact');

  // Get critical missing fields from flaws
  const criticalFlaws = flaws.filter((f) => f.category === 'critical');
  const majorFlaws = flaws.filter((f) => f.category === 'major');

  const handleContactChange = (field: keyof ContactInfo, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      contact: { ...prev.contact, [field]: value },
    }));
  };

  const handleSummaryChange = (value: string) => {
    setResumeData((prev) => ({ ...prev, summary: value }));
  };

  const handleAddExperience = () => {
    setResumeData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          id: generateId(),
          title: '',
          company: '',
          location: '',
          startDate: '',
          endDate: '',
          current: false,
          bullets: [''],
        },
      ],
    }));
  };

  const handleRemoveExperience = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.filter((exp) => exp.id !== id),
    }));
  };

  const handleExperienceChange = (id: string, field: keyof Experience, value: string | boolean | string[]) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      ),
    }));
  };

  const handleAddBullet = (expId: string) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) =>
        exp.id === expId ? { ...exp, bullets: [...exp.bullets, ''] } : exp
      ),
    }));
  };

  const handleBulletChange = (expId: string, bulletIndex: number, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) =>
        exp.id === expId
          ? {
              ...exp,
              bullets: exp.bullets.map((b, i) => (i === bulletIndex ? value : b)),
            }
          : exp
      ),
    }));
  };

  const handleRemoveBullet = (expId: string, bulletIndex: number) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) =>
        exp.id === expId
          ? { ...exp, bullets: exp.bullets.filter((_, i) => i !== bulletIndex) }
          : exp
      ),
    }));
  };

  const handleAddEducation = () => {
    setResumeData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        {
          id: generateId(),
          degree: '',
          institution: '',
          graduationDate: '',
          gpa: '',
        },
      ],
    }));
  };

  const handleRemoveEducation = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.filter((edu) => edu.id !== id),
    }));
  };

  const handleEducationChange = (id: string, field: keyof Education, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.map((edu) =>
        edu.id === id ? { ...edu, [field]: value } : edu
      ),
    }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !resumeData.skills.includes(newSkill.trim())) {
      setResumeData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setResumeData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(resumeData);
    }
  };

  const generateResumeText = () => {
    let text = '';
    
    // Contact
    text += `${resumeData.contact.fullName}\n`;
    text += `${resumeData.contact.email} | ${resumeData.contact.phone}\n`;
    if (resumeData.contact.linkedin) text += `${resumeData.contact.linkedin}\n`;
    if (resumeData.contact.location) text += `${resumeData.contact.location}\n`;
    text += '\n';

    // Summary
    if (resumeData.summary) {
      text += `PROFESSIONAL SUMMARY\n`;
      text += `${resumeData.summary}\n\n`;
    }

    // Experience
    if (resumeData.experience.length > 0) {
      text += `WORK EXPERIENCE\n`;
      resumeData.experience.forEach((exp) => {
        text += `${exp.title} | ${exp.company}\n`;
        text += `${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}\n`;
        exp.bullets.forEach((bullet) => {
          if (bullet) text += `• ${bullet}\n`;
        });
        text += '\n';
      });
    }

    // Education
    if (resumeData.education.length > 0) {
      text += `EDUCATION\n`;
      resumeData.education.forEach((edu) => {
        text += `${edu.degree} | ${edu.institution}\n`;
        if (edu.graduationDate) text += `Graduation: ${edu.graduationDate}\n`;
        if (edu.gpa) text += `GPA: ${edu.gpa}\n`;
        text += '\n';
      });
    }

    // Skills
    if (resumeData.skills.length > 0) {
      text += `SKILLS\n`;
      text += resumeData.skills.join(', ') + '\n';
    }

    return text;
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(generateResumeText());
    alert('Resume content copied to clipboard!');
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          ✍️ Build Your ATS-Approved Resume
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Fill in the required fields below to create an ATS-optimized resume. 
          Fields marked with warnings need your attention.
        </Typography>
      </Box>

      {/* Missing Fields Alert */}
      {(criticalFlaws.length > 0 || majorFlaws.length > 0) && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            ⚠️ Your resume is missing important information:
          </Typography>
          <List dense>
            {criticalFlaws.map((flaw, idx) => (
              <ListItem key={idx} sx={{ py: 0 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <Warning color="error" fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary={flaw.title}
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
            ))}
            {majorFlaws.slice(0, 3).map((flaw, idx) => (
              <ListItem key={idx} sx={{ py: 0 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <Warning color="warning" fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary={flaw.title}
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
            ))}
          </List>
        </Alert>
      )}

      {/* Contact Information */}
      <Accordion
        expanded={expandedSection === 'contact'}
        onChange={() => setExpandedSection(expandedSection === 'contact' ? false : 'contact')}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Person color="primary" />
            <Typography fontWeight={600}>Contact Information</Typography>
            {(!resumeData.contact.email || !resumeData.contact.phone) && (
              <Chip label="Required" size="small" color="error" />
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name"
                value={resumeData.contact.fullName}
                onChange={(e) => handleContactChange('fullName', e.target.value)}
                required
                error={!resumeData.contact.fullName}
                helperText={!resumeData.contact.fullName ? 'Required for ATS' : ''}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={resumeData.contact.email}
                onChange={(e) => handleContactChange('email', e.target.value)}
                required
                error={!resumeData.contact.email}
                helperText={!resumeData.contact.email ? 'Required - ATS cannot contact you without this' : ''}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={resumeData.contact.phone}
                onChange={(e) => handleContactChange('phone', e.target.value)}
                required
                error={!resumeData.contact.phone}
                helperText="Format: +1 (555) 123-4567"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Location (City, State)"
                value={resumeData.contact.location}
                onChange={(e) => handleContactChange('location', e.target.value)}
                helperText="e.g., New York, NY"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="LinkedIn URL"
                value={resumeData.contact.linkedin}
                onChange={(e) => handleContactChange('linkedin', e.target.value)}
                helperText="linkedin.com/in/yourname"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Portfolio/Website"
                value={resumeData.contact.portfolio}
                onChange={(e) => handleContactChange('portfolio', e.target.value)}
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Professional Summary */}
      <Accordion
        expanded={expandedSection === 'summary'}
        onChange={() => setExpandedSection(expandedSection === 'summary' ? false : 'summary')}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Description color="primary" />
            <Typography fontWeight={600}>Professional Summary</Typography>
            {resumeData.summary.length < 100 && (
              <Chip label="Needs Improvement" size="small" color="warning" />
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Professional Summary"
            value={resumeData.summary}
            onChange={(e) => handleSummaryChange(e.target.value)}
            placeholder="Results-driven [Your Title] with [X]+ years of experience in [Industry/Field]. Proven track record of [Key Achievement]. Expertise in [Key Skills]. Seeking to leverage my skills at [Target Company/Role]."
            helperText={`${resumeData.summary.length}/300 characters. Aim for 100-300 characters.`}
          />
          <Box sx={{ mt: 2, p: 2, bgcolor: 'info.lighter', borderRadius: 2 }}>
            <Typography variant="subtitle2" color="info.dark">
              💡 Tips for a Great Summary:
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              • Start with a strong adjective (Results-driven, Detail-oriented, Creative)
              <br />• Include years of experience and key skills
              <br />• Mention 1-2 quantifiable achievements
              <br />• Keep it under 4 sentences
            </Typography>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Work Experience */}
      <Accordion
        expanded={expandedSection === 'experience'}
        onChange={() => setExpandedSection(expandedSection === 'experience' ? false : 'experience')}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Work color="primary" />
            <Typography fontWeight={600}>Work Experience</Typography>
            {resumeData.experience.length === 0 && (
              <Chip label="Required" size="small" color="error" />
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          {resumeData.experience.map((exp, index) => (
            <Paper
              key={exp.id}
              component={motion.div}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle2">Experience {index + 1}</Typography>
                {resumeData.experience.length > 1 && (
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleRemoveExperience(exp.id)}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                )}
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Job Title"
                    value={exp.title}
                    onChange={(e) => handleExperienceChange(exp.id, 'title', e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Company"
                    value={exp.company}
                    onChange={(e) => handleExperienceChange(exp.id, 'company', e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Start Date"
                    value={exp.startDate}
                    onChange={(e) => handleExperienceChange(exp.id, 'startDate', e.target.value)}
                    placeholder="Jan 2020"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="End Date"
                    value={exp.endDate}
                    onChange={(e) => handleExperienceChange(exp.id, 'endDate', e.target.value)}
                    placeholder="Present"
                    disabled={exp.current}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Location"
                    value={exp.location}
                    onChange={(e) => handleExperienceChange(exp.id, 'location', e.target.value)}
                    placeholder="New York, NY"
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Achievements (use action verbs and numbers)
              </Typography>
              {exp.bullets.map((bullet, bulletIdx) => (
                <Box key={bulletIdx} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    value={bullet}
                    onChange={(e) => handleBulletChange(exp.id, bulletIdx, e.target.value)}
                    placeholder="• Led a team of 5 engineers to deliver a project 2 weeks ahead of schedule"
                  />
                  {exp.bullets.length > 1 && (
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleRemoveBullet(exp.id, bulletIdx)}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              ))}
              <Button
                size="small"
                startIcon={<Add />}
                onClick={() => handleAddBullet(exp.id)}
              >
                Add Bullet Point
              </Button>
            </Paper>
          ))}
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={handleAddExperience}
            fullWidth
          >
            Add Another Experience
          </Button>
        </AccordionDetails>
      </Accordion>

      {/* Education */}
      <Accordion
        expanded={expandedSection === 'education'}
        onChange={() => setExpandedSection(expandedSection === 'education' ? false : 'education')}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <School color="primary" />
            <Typography fontWeight={600}>Education</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          {resumeData.education.map((edu, index) => (
            <Paper key={edu.id} sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle2">Education {index + 1}</Typography>
                {resumeData.education.length > 1 && (
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleRemoveEducation(edu.id)}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                )}
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Degree"
                    value={edu.degree}
                    onChange={(e) => handleEducationChange(edu.id, 'degree', e.target.value)}
                    placeholder="Bachelor of Science in Computer Science"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Institution"
                    value={edu.institution}
                    onChange={(e) => handleEducationChange(edu.id, 'institution', e.target.value)}
                    placeholder="University of California, Berkeley"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Graduation Date"
                    value={edu.graduationDate}
                    onChange={(e) => handleEducationChange(edu.id, 'graduationDate', e.target.value)}
                    placeholder="May 2020"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="GPA (optional)"
                    value={edu.gpa}
                    onChange={(e) => handleEducationChange(edu.id, 'gpa', e.target.value)}
                    placeholder="3.8/4.0"
                  />
                </Grid>
              </Grid>
            </Paper>
          ))}
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={handleAddEducation}
            fullWidth
          >
            Add Another Education
          </Button>
        </AccordionDetails>
      </Accordion>

      {/* Skills */}
      <Accordion
        expanded={expandedSection === 'skills'}
        onChange={() => setExpandedSection(expandedSection === 'skills' ? false : 'skills')}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Build color="primary" />
            <Typography fontWeight={600}>Skills</Typography>
            {resumeData.skills.length < 5 && (
              <Chip label="Add More" size="small" color="warning" />
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              fullWidth
              size="small"
              label="Add a skill"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
              placeholder="e.g., JavaScript, Project Management, Data Analysis"
            />
            <Button variant="contained" onClick={handleAddSkill}>
              Add
            </Button>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {resumeData.skills.map((skill) => (
              <Chip
                key={skill}
                label={skill}
                onDelete={() => handleRemoveSkill(skill)}
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
          {resumeData.skills.length < 10 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              💡 Tip: Add 10-15 relevant skills including both technical and soft skills.
            </Typography>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<Save />}
          onClick={handleSave}
        >
          Save Resume
        </Button>
        <Button
          variant="outlined"
          size="large"
          startIcon={<ContentCopy />}
          onClick={handleCopyToClipboard}
        >
          Copy to Clipboard
        </Button>
      </Box>

      {/* Preview Section */}
      <Paper sx={{ mt: 4, p: 3, bgcolor: 'grey.50' }}>
        <Typography variant="h6" gutterBottom>
          📄 Resume Preview (Plain Text)
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          This is how your resume will appear to ATS systems:
        </Typography>
        <Box
          sx={{
            p: 2,
            bgcolor: 'white',
            borderRadius: 1,
            fontFamily: 'monospace',
            fontSize: '0.85rem',
            whiteSpace: 'pre-wrap',
            border: 1,
            borderColor: 'grey.300',
            maxHeight: 400,
            overflow: 'auto',
          }}
        >
          {generateResumeText() || 'Start filling in the fields above to see your resume preview...'}
        </Box>
      </Paper>
    </Box>
  );
};

export default ResumeBuilderForm;
