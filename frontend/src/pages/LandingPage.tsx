import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
} from '@mui/material';
import {
  Upload,
  Analytics,
  Speed,
  TrendingUp,
  CheckCircle,
  Description,
  Psychology,
  WorkspacePremium,
  ArrowForward,
  Star,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';

const MotionBox = motion(Box);
const MotionPaper = motion(Paper);

const LandingPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const features = [
    {
      icon: <Analytics sx={{ fontSize: 40 }} />,
      title: 'ATS Score Analysis',
      description: 'Get a comprehensive 0-100 score showing how well your resume will perform with Applicant Tracking Systems.',
    },
    {
      icon: <Description sx={{ fontSize: 40 }} />,
      title: 'Keyword Optimization',
      description: 'Identify missing keywords and phrases that recruiters and ATS systems are looking for.',
    },
    {
      icon: <Psychology sx={{ fontSize: 40 }} />,
      title: 'AI-Powered Insights',
      description: 'Leverage advanced AI to get personalized recommendations for improving your resume.',
    },
    {
      icon: <Speed sx={{ fontSize: 40 }} />,
      title: 'Instant Results',
      description: 'Upload your resume and get detailed feedback in seconds, not hours.',
    },
    {
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      title: 'Job Matching',
      description: 'Compare your resume against specific job descriptions to maximize your match rate.',
    },
    {
      icon: <WorkspacePremium sx={{ fontSize: 40 }} />,
      title: 'Premium Reports',
      description: 'Get detailed PDF reports with actionable improvement suggestions.',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Upload Your Resume',
      description: 'Simply drag and drop your resume in PDF or DOCX format.',
    },
    {
      number: '02',
      title: 'AI Analysis',
      description: 'Our AI scans and evaluates your resume against industry standards.',
    },
    {
      number: '03',
      title: 'Get Your Score',
      description: 'Receive a detailed breakdown of your ATS compatibility score.',
    },
    {
      number: '04',
      title: 'Improve & Apply',
      description: 'Follow our suggestions to optimize your resume and land more interviews.',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Software Engineer at Google',
      content: 'This tool helped me identify critical gaps in my resume. After making the suggested changes, I started getting 3x more interview callbacks!',
      rating: 5,
    },
    {
      name: 'Michael Chen',
      role: 'Product Manager at Microsoft',
      content: 'The job matching feature is incredible. It showed me exactly which skills to highlight for my target role.',
      rating: 5,
    },
    {
      name: 'Emily Rodriguez',
      role: 'Data Scientist at Amazon',
      content: 'I was skeptical at first, but the detailed feedback was spot-on. Highly recommend for anyone job hunting.',
      rating: 5,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <Layout>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #c084fc 100%)',
          color: 'white',
          pt: { xs: 8, md: 12 },
          pb: { xs: 10, md: 16 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background decoration */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            background: 'radial-gradient(circle at 20% 80%, white 0%, transparent 50%)',
          }}
        />
        
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <MotionBox
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Chip
                  label="AI-Powered Resume Analysis"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    mb: 2,
                    fontWeight: 500,
                  }}
                />
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    fontWeight: 800,
                    lineHeight: 1.2,
                    mb: 3,
                  }}
                >
                  Beat the ATS.
                  <br />
                  Land More Interviews.
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 400,
                    mb: 4,
                    opacity: 0.9,
                    lineHeight: 1.6,
                  }}
                >
                  Upload your resume and get instant AI-powered feedback on how to 
                  optimize it for Applicant Tracking Systems and land your dream job.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForward />}
                    onClick={() => navigate('/signup')}
                    sx={{
                      bgcolor: 'white',
                      color: 'primary.main',
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      '&:hover': {
                        bgcolor: 'grey.100',
                      },
                    }}
                  >
                    Get Started Free
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/pricing')}
                    sx={{
                      borderColor: 'white',
                      color: 'white',
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      '&:hover': {
                        borderColor: 'white',
                        bgcolor: 'rgba(255,255,255,0.1)',
                      },
                    }}
                  >
                    View Pricing
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mt: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle sx={{ color: 'success.light' }} />
                    <Typography variant="body2">Free tier available</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle sx={{ color: 'success.light' }} />
                    <Typography variant="body2">No credit card required</Typography>
                  </Box>
                </Box>
              </MotionBox>
            </Grid>
            <Grid item xs={12} md={6}>
              <MotionBox
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <Paper
                  elevation={20}
                  sx={{
                    p: 4,
                    borderRadius: 4,
                    maxWidth: 400,
                    textAlign: 'center',
                  }}
                >
                  <Box
                    sx={{
                      width: 120,
                      height: 120,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 3,
                    }}
                  >
                    <Typography variant="h2" sx={{ color: 'white', fontWeight: 700 }}>
                      87
                    </Typography>
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    Your ATS Score
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Great job! Your resume is well-optimized.
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Chip label="A Grade" color="success" sx={{ fontWeight: 600 }} />
                  </Box>
                </Paper>
              </MotionBox>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.default' }} id="features">
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h2"
              sx={{ fontWeight: 700, mb: 2 }}
            >
              Everything You Need to
              <br />
              <Box component="span" sx={{ color: 'primary.main' }}>
                Optimize Your Resume
              </Box>
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Our AI-powered platform analyzes every aspect of your resume to help you 
              stand out from the competition.
            </Typography>
          </Box>

          <Grid 
            container 
            spacing={4}
            component={motion.div}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <MotionPaper
                  variants={itemVariants}
                  whileHover={{ y: -8, boxShadow: theme.shadows[8] }}
                  sx={{
                    p: 4,
                    height: '100%',
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                  }}
                >
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: 3,
                      bgcolor: 'primary.lighter',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'primary.main',
                      mb: 3,
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </MotionPaper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'grey.50' }} id="how-it-works">
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h2" sx={{ fontWeight: 700, mb: 2 }}>
              How It Works
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Get your resume analyzed in just a few simple steps
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {steps.map((step, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <MotionBox
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  sx={{ textAlign: 'center' }}
                >
                  <Typography
                    sx={{
                      fontSize: '4rem',
                      fontWeight: 800,
                      color: 'primary.lighter',
                      lineHeight: 1,
                      mb: 2,
                    }}
                  >
                    {step.number}
                  </Typography>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {step.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {step.description}
                  </Typography>
                </MotionBox>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ textAlign: 'center', mt: 8 }}>
            <Button
              variant="contained"
              size="large"
              endIcon={<Upload />}
              onClick={() => navigate('/signup')}
              sx={{ px: 6, py: 1.5 }}
            >
              Start Analyzing Now
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h2" sx={{ fontWeight: 700, mb: 2 }}>
              Trusted by Job Seekers
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Join thousands of professionals who have improved their resumes with our platform
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  component={motion.div}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  sx={{ height: '100%' }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', mb: 2 }}>
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} sx={{ color: 'warning.main', fontSize: 20 }} />
                      ))}
                    </Box>
                    <Typography variant="body1" sx={{ mb: 3, fontStyle: 'italic' }}>
                      &ldquo;{testimonial.content}&rdquo;
                    </Typography>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {testimonial.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {testimonial.role}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
          color: 'white',
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
            Ready to Beat the ATS?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Upload your resume now and get instant feedback on how to improve it.
          </Typography>
          <Button
            variant="contained"
            size="large"
            endIcon={<ArrowForward />}
            onClick={() => navigate('/signup')}
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              px: 6,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600,
              '&:hover': {
                bgcolor: 'grey.100',
              },
            }}
          >
            Get Started Free
          </Button>
        </Container>
      </Box>
    </Layout>
  );
};

export default LandingPage;

