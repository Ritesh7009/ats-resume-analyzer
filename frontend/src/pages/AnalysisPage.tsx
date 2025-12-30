import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  Chip,
  Card,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Skeleton,
} from '@mui/material';
import {
  Download,
  Email,
  Refresh,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  TrendingUp,
  WorkspacePremium,
  Lightbulb,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import Layout from '../components/layout/Layout';
import { ScoreCircle, ScoreBreakdown, FeedbackCard } from '../components/analysis/ScoreDisplay';
import FlawsDisplay from '../components/analysis/FlawsDisplay';
import ATSTemplates from '../components/analysis/ATSTemplates';
import ResumeBuilderForm from '../components/analysis/ResumeBuilderForm';
import BlurOverlay from '../components/common/BlurOverlay';
import { resumeApi } from '../services/apiService';
import { AnalysisResult, JobMatchResult, EnhancedAnalysis } from '../types';
import { useAuth } from '../context/AuthContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

const AnalysisPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [enhancedAnalysis, setEnhancedAnalysis] = useState<EnhancedAnalysis | null>(null);
  const [jobMatch, setJobMatch] = useState<JobMatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSendingReport, setIsSendingReport] = useState(false);

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const response = await resumeApi.get(id);
        setAnalysis(response.data?.resume?.analysisResult || null);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setEnhancedAnalysis((response.data as any)?.enhancedAnalysis || null);
        setJobMatch(response.data?.resume?.jobMatchResult || null);
      } catch (err) {
        console.error('Failed to fetch analysis:', err);
        setError('Failed to load analysis results');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalysis();
  }, [id]);

  const handleSendReport = async () => {
    if (!id) return;
    
    setIsSendingReport(true);
    try {
      await resumeApi.sendReport(id);
      alert('Report sent to your email!');
    } catch (err) {
      console.error('Failed to send report:', err);
      alert('Failed to send report. Please try again.');
    } finally {
      setIsSendingReport(false);
    }
  };

  const handleReanalyze = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const response = await resumeApi.analyze(id);
      setAnalysis(response.data?.analysis || null);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setEnhancedAnalysis((response.data as any)?.enhancedAnalysis || null);
    } catch (err) {
      console.error('Failed to reanalyze:', err);
      setError('Failed to reanalyze resume');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 3 }} />
            </Grid>
            <Grid item xs={12} md={8}>
              <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 3 }} />
            </Grid>
            <Grid item xs={12}>
              <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3 }} />
            </Grid>
          </Grid>
        </Container>
      </Layout>
    );
  }

  if (error || !analysis) {
    return (
      <Layout>
        <Container maxWidth="md" sx={{ py: 6, textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 4 }}>
            {error || 'No analysis results found'}
          </Alert>
          <Button variant="contained" onClick={() => navigate('/upload')}>
            Upload New Resume
          </Button>
        </Container>
      </Layout>
    );
  }

  const keywordData = [
    { name: 'Matched', value: analysis.keywords?.matched?.length || 0, color: '#4caf50' },
    { name: 'Missing', value: analysis.keywords?.missing?.length || 0, color: '#f44336' },
  ];

  const sectionData = (analysis.sections || []).map((section) => ({
    name: section.section,
    score: section.score,
    status: section.status,
  }));

  return (
    <Layout>
      <Box sx={{ py: { xs: 4, md: 6 }, bgcolor: 'grey.50', minHeight: 'calc(100vh - 64px)' }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="h3" fontWeight={700} gutterBottom>
                  Analysis Results
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Here&apos;s how your resume performed in our ATS analysis
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={handleReanalyze}
                >
                  Re-analyze
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Email />}
                  onClick={handleSendReport}
                  disabled={isSendingReport || !user?.isPremium}
                >
                  {isSendingReport ? 'Sending...' : 'Email Report'}
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Download />}
                  disabled={!user?.isPremium}
                >
                  Download PDF
                </Button>
              </Box>
            </Box>

            {!user?.isPremium && (
              <Alert 
                severity="info" 
                sx={{ mb: 4 }}
                action={
                  <Button color="inherit" size="small" onClick={() => navigate('/pricing')}>
                    Upgrade
                  </Button>
                }
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WorkspacePremium />
                  Upgrade to Premium to download PDF reports and get email notifications
                </Box>
              </Alert>
            )}

            {/* Main Score Card */}
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3, height: '100%' }}>
                  <Typography variant="h6" gutterBottom>
                    Your ATS Score
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                    <ScoreCircle score={analysis.overallScore} size="large" />
                  </Box>
                  <Chip
                    icon={
                      analysis.overallScore >= 80 ? <CheckCircle /> : 
                      analysis.overallScore >= 60 ? <Warning /> : <ErrorIcon />
                    }
                    label={
                      analysis.overallScore >= 80 ? 'Excellent' :
                      analysis.overallScore >= 60 ? 'Good' :
                      analysis.overallScore >= 40 ? 'Needs Work' : 'Poor'
                    }
                    color={
                      analysis.overallScore >= 80 ? 'success' :
                      analysis.overallScore >= 60 ? 'warning' : 'error'
                    }
                    sx={{ fontWeight: 600 }}
                  />
                </Paper>
              </Grid>

              <Grid item xs={12} md={8}>
                {analysis.breakdown && <ScoreBreakdown scores={analysis.breakdown} />}
              </Grid>
            </Grid>

            {/* Tabs */}
            <Paper sx={{ mt: 4, borderRadius: 3 }}>
              <Tabs
                value={tabValue}
                onChange={(_, newValue) => setTabValue(newValue)}
                sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab label="🔍 CV Flaws & Fixes" />
                <Tab label="📝 Build Resume" />
                <Tab label="📋 ATS Templates" />
                <Tab label="Section Feedback" />
                <Tab label="Keywords" />
                <Tab label="Improvements" />
                {jobMatch && <Tab label="Job Match" />}
              </Tabs>

              {/* CV Flaws & ATS Approval Tab */}
              <TabPanel value={tabValue} index={0}>
                <Box sx={{ px: 3 }}>
                  <BlurOverlay 
                    isPremium={user?.isPremium || false}
                    title="Unlock CV Flaws Analysis"
                    message="See all the issues in your resume and learn exactly how to fix them."
                  >
                    {enhancedAnalysis ? (
                      <FlawsDisplay enhancedAnalysis={enhancedAnalysis} />
                    ) : (
                      <Alert severity="info">
                        Enhanced analysis not available. Click &quot;Re-analyze&quot; to generate detailed flaws and tips.
                      </Alert>
                    )}
                  </BlurOverlay>
                </Box>
              </TabPanel>

              {/* Resume Builder Form Tab */}
              <TabPanel value={tabValue} index={1}>
                <Box sx={{ px: 3 }}>
                  <BlurOverlay 
                    isPremium={user?.isPremium || false}
                    title="Unlock Resume Builder"
                    message="Build an ATS-optimized resume with our guided form and expert tips."
                  >
                    <ResumeBuilderForm 
                      flaws={enhancedAnalysis?.flaws || []}
                      onSave={(data) => {
                        console.log('Resume data saved:', data);
                        localStorage.setItem('resumeBuilderData', JSON.stringify(data));
                        alert('Resume data saved! You can now use this with a template.');
                      }}
                    />
                  </BlurOverlay>
                </Box>
              </TabPanel>

              {/* ATS Templates Tab */}
              <TabPanel value={tabValue} index={2}>
                <Box sx={{ px: 3 }}>
                  <BlurOverlay 
                    isPremium={user?.isPremium || false}
                    title="Unlock ATS Templates"
                    message="Access 6 professionally designed ATS-approved resume templates."
                  >
                    <ATSTemplates 
                      onSelectTemplate={(template) => {
                        console.log('Selected template:', template);
                        alert(`You selected the "${template.name}" template. In a production app, this would apply the template to your resume.`);
                      }}
                    />
                  </BlurOverlay>
                </Box>
              </TabPanel>

              {/* Section Feedback Tab */}
              <TabPanel value={tabValue} index={3}>
                <Box sx={{ px: 3 }}>
                  <BlurOverlay 
                    isPremium={user?.isPremium || false}
                    title="Unlock Section Feedback"
                    message="Get detailed feedback for each section of your resume."
                  >
                    <Grid container spacing={3}>
                      {(analysis.sections || []).map((section, index) => (
                        <Grid item xs={12} md={6} key={index}>
                          <FeedbackCard
                            section={section.section}
                            score={section.score}
                            status={section.status}
                            issues={section.issues}
                            suggestions={section.suggestions}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </BlurOverlay>
                </Box>
              </TabPanel>

              <TabPanel value={tabValue} index={4}>
                <Box sx={{ px: 3 }}>
                  <BlurOverlay 
                    isPremium={user?.isPremium || false}
                    title="Unlock Keyword Analysis"
                    message="See which keywords are matched and missing from your resume."
                  >
                    <Grid container spacing={4}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom>
                          Keyword Analysis
                        </Typography>
                        <Box sx={{ height: 300 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={keywordData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                                label={({ name, percent }) => 
                                  `${name} (${(percent * 100).toFixed(0)}%)`
                                }
                              >
                                <Cell fill="#4caf50" />
                                <Cell fill="#f44336" />
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Box>
                          <Typography variant="subtitle1" color="success.main" gutterBottom>
                            Matched Keywords ({analysis.keywords?.matched?.length || 0})
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                          {(analysis.keywords?.matched || []).map((keyword, idx) => (
                            <Chip
                              key={idx}
                              label={keyword}
                              size="small"
                              color="success"
                              variant="outlined"
                            />
                          ))}
                        </Box>

                        <Typography variant="subtitle1" color="error.main" gutterBottom>
                          Missing Keywords ({analysis.keywords?.missing?.length || 0})
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {(analysis.keywords?.missing || []).map((keyword, idx) => (
                            <Chip
                              key={idx}
                              label={keyword}
                              size="small"
                              color="error"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                  </BlurOverlay>
                </Box>
              </TabPanel>

              {/* Improvements Tab */}
              <TabPanel value={tabValue} index={5}>
                <Box sx={{ px: 3 }}>
                  <BlurOverlay 
                    isPremium={user?.isPremium || false}
                    title="Unlock Improvement Suggestions"
                    message="Get personalized suggestions to improve your resume."
                  >
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Lightbulb color="warning" />
                      Suggested Improvements
                    </Typography>
                    <List>
                      {(analysis.improvements || []).map((improvement, index) => (
                        <ListItem
                          key={index}
                          component={motion.div}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          sx={{
                            bgcolor: 'grey.50',
                            borderRadius: 2,
                            mb: 1,
                          }}
                        >
                          <ListItemIcon>
                            <Box
                              sx={{
                                width: 28,
                                height: 28,
                                borderRadius: '50%',
                                bgcolor: 'primary.main',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                              }}
                            >
                              {index + 1}
                            </Box>
                          </ListItemIcon>
                          <ListItemText
                            primary={improvement}
                            primaryTypographyProps={{ variant: 'body1' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </BlurOverlay>
                </Box>
              </TabPanel>

              {/* Job Match Tab */}
              {jobMatch && (
                <TabPanel value={tabValue} index={6}>
                  <Box sx={{ px: 3 }}>
                    <BlurOverlay 
                      isPremium={user?.isPremium || false}
                      title="Unlock Job Match Analysis"
                      message="See how well your resume matches specific job descriptions."
                    >
                      <Grid container spacing={4}>
                        <Grid item xs={12} md={4}>
                          <Card sx={{ textAlign: 'center', p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                              Job Match Score
                            </Typography>
                            <ScoreCircle 
                              score={jobMatch.matchScore} 
                              label="Match" 
                              size="medium" 
                            />
                          </Card>
                        </Grid>
                        <Grid item xs={12} md={8}>
                          <Typography variant="h6" gutterBottom>
                            Skill Gap Analysis
                          </Typography>
                          <Box sx={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={sectionData}>
                                <XAxis dataKey="name" />
                                <YAxis domain={[0, 100]} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="score" fill="#7c3aed" name="Your Score" />
                              </BarChart>
                            </ResponsiveContainer>
                          </Box>
                        </Grid>
                        <Grid item xs={12}>
                          <Box>
                            <Typography variant="subtitle1" color="error.main" gutterBottom>
                            Missing Skills
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {jobMatch.skillGap?.missingSkills?.map((skill: string, idx: number) => (
                              <Chip
                                key={idx}
                                label={skill}
                                color="error"
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </BlurOverlay>
                  </Box>
                </TabPanel>
              )}
            </Paper>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/upload')}
              >
                Upload New Resume
              </Button>
              <Button
                variant="contained"
                size="large"
                startIcon={<TrendingUp />}
                onClick={() => navigate('/dashboard')}
              >
                View Dashboard
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Box>
    </Layout>
  );
};

export default AnalysisPage;

