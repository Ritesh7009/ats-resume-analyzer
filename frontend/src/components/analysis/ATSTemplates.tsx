import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import {
  Download,
  Visibility,
  CheckCircle,
  Close,
  Star,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  category: 'professional' | 'modern' | 'creative' | 'simple';
  atsScore: number;
  features: string[];
  previewImage: string;
  downloadUrl?: string;
  recommended?: boolean;
}

// ATS-Approved Resume Templates Data
export const atsTemplates: ResumeTemplate[] = [
  {
    id: 'classic-professional',
    name: 'Classic Professional',
    description: 'Clean, traditional format that works perfectly with all ATS systems. Ideal for corporate and traditional industries.',
    category: 'professional',
    atsScore: 98,
    features: [
      'Single column layout',
      'Standard section headers',
      'No graphics or tables',
      'Clear hierarchy',
      'Times New Roman / Arial fonts',
    ],
    previewImage: '/templates/classic-professional.png',
    recommended: true,
  },
  {
    id: 'modern-clean',
    name: 'Modern Clean',
    description: 'Contemporary design with excellent ATS compatibility. Perfect for tech and startup environments.',
    category: 'modern',
    atsScore: 95,
    features: [
      'Minimalist design',
      'Clear sections',
      'Skills highlighted',
      'Contact info prominent',
      'Calibri / Helvetica fonts',
    ],
    previewImage: '/templates/modern-clean.png',
    recommended: true,
  },
  {
    id: 'simple-elegant',
    name: 'Simple & Elegant',
    description: 'Straightforward layout focusing on content. Best for entry-level and career changers.',
    category: 'simple',
    atsScore: 99,
    features: [
      'Maximum readability',
      'Bullet points',
      'Standard margins',
      'No fancy formatting',
      'Easy to customize',
    ],
    previewImage: '/templates/simple-elegant.png',
  },
  {
    id: 'executive-pro',
    name: 'Executive Pro',
    description: 'Sophisticated format for senior professionals. Highlights achievements and leadership experience.',
    category: 'professional',
    atsScore: 94,
    features: [
      'Executive summary section',
      'Achievement focused',
      'Professional tone',
      'Strategic keywords',
      'Leadership emphasis',
    ],
    previewImage: '/templates/executive-pro.png',
  },
  {
    id: 'tech-optimized',
    name: 'Tech Optimized',
    description: 'Designed specifically for IT and engineering roles. Skills-focused with project highlights.',
    category: 'modern',
    atsScore: 96,
    features: [
      'Technical skills section',
      'Project highlights',
      'GitHub/Portfolio links',
      'Certifications section',
      'Clean code-like format',
    ],
    previewImage: '/templates/tech-optimized.png',
    recommended: true,
  },
  {
    id: 'career-changer',
    name: 'Career Changer',
    description: 'Emphasizes transferable skills over job titles. Perfect for those switching industries.',
    category: 'simple',
    atsScore: 93,
    features: [
      'Skills-based format',
      'Transferable skills focus',
      'Flexible sections',
      'Achievement highlights',
      'Education prominent',
    ],
    previewImage: '/templates/career-changer.png',
  },
];

interface ATSTemplatesProps {
  onSelectTemplate?: (template: ResumeTemplate) => void;
}

const ATSTemplates: React.FC<ATSTemplatesProps> = ({ onSelectTemplate }) => {
  const [previewTemplate, setPreviewTemplate] = React.useState<ResumeTemplate | null>(null);

  const getCategoryColor = (category: ResumeTemplate['category']) => {
    switch (category) {
      case 'professional':
        return 'primary';
      case 'modern':
        return 'secondary';
      case 'creative':
        return 'warning';
      case 'simple':
        return 'success';
      default:
        return 'default';
    }
  };

  const handlePreview = (template: ResumeTemplate) => {
    setPreviewTemplate(template);
  };

  const handleClosePreview = () => {
    setPreviewTemplate(null);
  };

  const handleUseTemplate = (template: ResumeTemplate) => {
    if (onSelectTemplate) {
      onSelectTemplate(template);
    }
    setPreviewTemplate(null);
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          📄 ATS-Approved Resume Templates
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Choose from our collection of professionally designed, ATS-friendly resume templates.
          All templates are tested to score 90%+ on ATS systems.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {atsTemplates.map((template, index) => (
          <Grid item xs={12} sm={6} md={4} key={template.id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                {template.recommended && (
                  <Chip
                    icon={<Star sx={{ fontSize: 16 }} />}
                    label="Recommended"
                    color="warning"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      zIndex: 1,
                      fontWeight: 600,
                    }}
                  />
                )}
                
                <CardMedia
                  component="div"
                  sx={{
                    height: 180,
                    bgcolor: 'grey.100',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderBottom: 1,
                    borderColor: 'divider',
                  }}
                >
                  <Box
                    sx={{
                      width: 120,
                      height: 160,
                      bgcolor: 'white',
                      borderRadius: 1,
                      boxShadow: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      p: 1.5,
                      gap: 0.5,
                    }}
                  >
                    {/* Mini template preview */}
                    <Box sx={{ height: 8, bgcolor: 'primary.main', borderRadius: 0.5, width: '60%' }} />
                    <Box sx={{ height: 4, bgcolor: 'grey.300', borderRadius: 0.5, width: '80%' }} />
                    <Box sx={{ height: 4, bgcolor: 'grey.300', borderRadius: 0.5, width: '70%' }} />
                    <Box sx={{ mt: 1, height: 6, bgcolor: 'grey.400', borderRadius: 0.5, width: '50%' }} />
                    <Box sx={{ height: 3, bgcolor: 'grey.200', borderRadius: 0.5 }} />
                    <Box sx={{ height: 3, bgcolor: 'grey.200', borderRadius: 0.5 }} />
                    <Box sx={{ height: 3, bgcolor: 'grey.200', borderRadius: 0.5, width: '90%' }} />
                    <Box sx={{ mt: 1, height: 6, bgcolor: 'grey.400', borderRadius: 0.5, width: '40%' }} />
                    <Box sx={{ height: 3, bgcolor: 'grey.200', borderRadius: 0.5 }} />
                    <Box sx={{ height: 3, bgcolor: 'grey.200', borderRadius: 0.5, width: '85%' }} />
                  </Box>
                </CardMedia>

                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="h6" fontWeight={600}>
                      {template.name}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Chip
                      label={template.category}
                      size="small"
                      color={getCategoryColor(template.category)}
                      variant="outlined"
                    />
                    <Chip
                      icon={<CheckCircle sx={{ fontSize: 14 }} />}
                      label={`${template.atsScore}% ATS Score`}
                      size="small"
                      color="success"
                      variant="filled"
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {template.description}
                  </Typography>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {template.features.slice(0, 3).map((feature, idx) => (
                      <Chip
                        key={idx}
                        label={feature}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    ))}
                    {template.features.length > 3 && (
                      <Chip
                        label={`+${template.features.length - 3} more`}
                        size="small"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    )}
                  </Box>
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    size="small"
                    startIcon={<Visibility />}
                    onClick={() => handlePreview(template)}
                  >
                    Preview
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<Download />}
                    onClick={() => handleUseTemplate(template)}
                  >
                    Use Template
                  </Button>
                </CardActions>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Template Preview Dialog */}
      <Dialog
        open={!!previewTemplate}
        onClose={handleClosePreview}
        maxWidth="md"
        fullWidth
      >
        {previewTemplate && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6">{previewTemplate.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {previewTemplate.category} template • {previewTemplate.atsScore}% ATS Score
                </Typography>
              </Box>
              <IconButton onClick={handleClosePreview}>
                <Close />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  {/* Template Preview */}
                  <Box
                    sx={{
                      bgcolor: 'grey.100',
                      p: 3,
                      borderRadius: 2,
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    <Box
                      sx={{
                        width: 300,
                        height: 400,
                        bgcolor: 'white',
                        borderRadius: 1,
                        boxShadow: 3,
                        p: 3,
                      }}
                    >
                      {/* Sample Resume Content */}
                      <Box sx={{ textAlign: 'center', mb: 2 }}>
                        <Box sx={{ height: 16, bgcolor: 'primary.main', borderRadius: 1, width: '60%', mx: 'auto', mb: 1 }} />
                        <Box sx={{ height: 8, bgcolor: 'grey.400', borderRadius: 0.5, width: '80%', mx: 'auto' }} />
                      </Box>
                      
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ height: 10, bgcolor: 'grey.600', borderRadius: 0.5, width: '40%', mb: 1 }} />
                        <Box sx={{ height: 6, bgcolor: 'grey.300', borderRadius: 0.5, mb: 0.5 }} />
                        <Box sx={{ height: 6, bgcolor: 'grey.300', borderRadius: 0.5, mb: 0.5, width: '95%' }} />
                        <Box sx={{ height: 6, bgcolor: 'grey.300', borderRadius: 0.5, width: '85%' }} />
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ height: 10, bgcolor: 'grey.600', borderRadius: 0.5, width: '35%', mb: 1 }} />
                        <Box sx={{ height: 6, bgcolor: 'grey.300', borderRadius: 0.5, mb: 0.5 }} />
                        <Box sx={{ height: 6, bgcolor: 'grey.300', borderRadius: 0.5, mb: 0.5, width: '90%' }} />
                        <Box sx={{ height: 6, bgcolor: 'grey.300', borderRadius: 0.5, width: '75%' }} />
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ height: 10, bgcolor: 'grey.600', borderRadius: 0.5, width: '30%', mb: 1 }} />
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Box key={i} sx={{ height: 12, bgcolor: 'primary.lighter', borderRadius: 1, px: 1, minWidth: 40 }} />
                          ))}
                        </Box>
                      </Box>

                      <Box>
                        <Box sx={{ height: 10, bgcolor: 'grey.600', borderRadius: 0.5, width: '35%', mb: 1 }} />
                        <Box sx={{ height: 6, bgcolor: 'grey.300', borderRadius: 0.5, mb: 0.5, width: '70%' }} />
                        <Box sx={{ height: 6, bgcolor: 'grey.300', borderRadius: 0.5, width: '60%' }} />
                      </Box>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Template Features
                  </Typography>
                  <Box component="ul" sx={{ pl: 2 }}>
                    {previewTemplate.features.map((feature, idx) => (
                      <Typography component="li" key={idx} variant="body2" sx={{ mb: 1 }}>
                        {feature}
                      </Typography>
                    ))}
                  </Box>

                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    Why This Template Works
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {previewTemplate.description}
                  </Typography>

                  <Box sx={{ mt: 3, p: 2, bgcolor: 'success.lighter', borderRadius: 2 }}>
                    <Typography variant="subtitle2" color="success.dark">
                      ✅ ATS Compatibility: {previewTemplate.atsScore}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      This template has been tested with major ATS systems including Workday, 
                      Greenhouse, Lever, and Taleo.
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClosePreview}>Close</Button>
              <Button
                variant="contained"
                startIcon={<Download />}
                onClick={() => handleUseTemplate(previewTemplate)}
              >
                Use This Template
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default ATSTemplates;
