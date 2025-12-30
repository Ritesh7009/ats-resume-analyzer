import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Menu,
  MenuItem,
  Skeleton,
  Alert,
} from '@mui/material';
import {
  Upload,
  TrendingUp,
  History,
  MoreVert,
  Visibility,
  Delete,
  Email,
  Analytics,
  Description,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import Layout from '../components/layout/Layout';
import { ScoreCircle } from '../components/analysis/ScoreDisplay';
import { useAuth } from '../context/AuthContext';
import { resumeApi } from '../services/apiService';
import { Resume } from '../types';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        setIsLoading(true);
        const response = await resumeApi.getHistory();
        setResumes(response.data?.resumes || []);
      } catch (err) {
        console.error('Failed to fetch resumes:', err);
        setError('Failed to load your resumes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResumes();
  }, []);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, resumeId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedResumeId(resumeId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedResumeId(null);
  };

  const handleDelete = async () => {
    if (!selectedResumeId) return;
    
    try {
      await resumeApi.delete(selectedResumeId);
      setResumes((prev) => prev.filter((r) => r.id !== selectedResumeId));
    } catch (err) {
      console.error('Failed to delete resume:', err);
    }
    handleMenuClose();
  };

  const getScoreColor = (score: number | undefined) => {
    if (!score) return 'default';
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Calculate stats
  const analyzedResumes = resumes.filter((r) => r.analysisResult);
  const averageScore = analyzedResumes.length > 0
    ? Math.round(
        analyzedResumes.reduce((sum, r) => sum + (r.analysisResult?.overallScore || 0), 0) /
        analyzedResumes.length
      )
    : 0;

  const highestScore = analyzedResumes.length > 0
    ? Math.max(...analyzedResumes.map((r) => r.analysisResult?.overallScore || 0))
    : 0;

  // Score history for chart
  const scoreHistory = analyzedResumes
    .slice(-10)
    .map((r) => ({
      date: formatDate(r.createdAt),
      score: r.analysisResult?.overallScore || 0,
    }));

  // Score distribution for pie chart
  const scoreDistribution = [
    { name: 'Excellent (80+)', value: analyzedResumes.filter((r) => (r.analysisResult?.overallScore || 0) >= 80).length },
    { name: 'Good (60-79)', value: analyzedResumes.filter((r) => (r.analysisResult?.overallScore || 0) >= 60 && (r.analysisResult?.overallScore || 0) < 80).length },
    { name: 'Needs Work (<60)', value: analyzedResumes.filter((r) => (r.analysisResult?.overallScore || 0) < 60).length },
  ];

  const COLORS = ['#4caf50', '#ff9800', '#f44336'];

  if (isLoading) {
    return (
      <Layout>
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Skeleton variant="text" width={300} height={60} />
          <Grid container spacing={4} sx={{ mt: 2 }}>
            {[1, 2, 3, 4].map((i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 3 }} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Layout>
    );
  }

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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Box>
                <Typography variant="h3" fontWeight={700}>
                  Welcome back, {user?.firstName || 'User'}!
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Here&apos;s an overview of your resume analysis history
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<Upload />}
                onClick={() => navigate('/upload')}
                size="large"
              >
                Upload Resume
              </Button>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 4 }}>
                {error}
              </Alert>
            )}

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  component={motion.div}
                  whileHover={{ y: -4 }}
                  sx={{ p: 3, borderRadius: 3 }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        bgcolor: 'primary.lighter',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Description sx={{ color: 'primary.main' }} />
                    </Box>
                    <Box>
                      <Typography variant="h4" fontWeight={700}>
                        {resumes.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Resumes
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  component={motion.div}
                  whileHover={{ y: -4 }}
                  sx={{ p: 3, borderRadius: 3 }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        bgcolor: 'success.lighter',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Analytics sx={{ color: 'success.main' }} />
                    </Box>
                    <Box>
                      <Typography variant="h4" fontWeight={700}>
                        {analyzedResumes.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Analyzed
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  component={motion.div}
                  whileHover={{ y: -4 }}
                  sx={{ p: 3, borderRadius: 3 }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        bgcolor: 'warning.lighter',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <TrendingUp sx={{ color: 'warning.main' }} />
                    </Box>
                    <Box>
                      <Typography variant="h4" fontWeight={700}>
                        {averageScore}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Average Score
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  component={motion.div}
                  whileHover={{ y: -4 }}
                  sx={{ p: 3, borderRadius: 3 }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        bgcolor: 'info.lighter',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <History sx={{ color: 'info.main' }} />
                    </Box>
                    <Box>
                      <Typography variant="h4" fontWeight={700}>
                        {highestScore}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Best Score
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            </Grid>

            {/* Charts */}
            {analyzedResumes.length > 0 && (
              <Grid container spacing={4} sx={{ mb: 4 }}>
                <Grid item xs={12} md={8}>
                  <Paper sx={{ p: 3, borderRadius: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Score History
                    </Typography>
                    <Box sx={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={scoreHistory}>
                          <XAxis dataKey="date" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey="score"
                            stroke="#7c3aed"
                            strokeWidth={2}
                            dot={{ fill: '#7c3aed' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                    <Typography variant="h6" gutterBottom>
                      Score Distribution
                    </Typography>
                    <Box sx={{ height: 250 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={scoreDistribution.filter((d) => d.value > 0)}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {scoreDistribution.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {scoreDistribution.map((item, index) => (
                        <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              bgcolor: COLORS[index],
                            }}
                          />
                          <Typography variant="caption">
                            {item.name}: {item.value}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            )}

            {/* Resume History Table */}
            <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6">
                  Resume History
                </Typography>
              </Box>
              
              {resumes.length === 0 ? (
                <Box sx={{ p: 6, textAlign: 'center' }}>
                  <Description sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    No resumes yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Upload your first resume to get started with ATS analysis
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Upload />}
                    onClick={() => navigate('/upload')}
                  >
                    Upload Resume
                  </Button>
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>File Name</TableCell>
                        <TableCell>Upload Date</TableCell>
                        <TableCell>ATS Score</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {resumes.map((resume) => (
                        <TableRow
                          key={resume.id}
                          component={motion.tr}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          hover
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Description sx={{ color: 'primary.main' }} />
                              {resume.originalFileName}
                            </Box>
                          </TableCell>
                          <TableCell>{formatDate(resume.createdAt)}</TableCell>
                          <TableCell>
                            {resume.analysisResult ? (
                              <Chip
                                label={resume.analysisResult.overallScore}
                                size="small"
                                color={getScoreColor(resume.analysisResult.overallScore) as 'success' | 'warning' | 'error' | 'default'}
                              />
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={resume.status}
                              size="small"
                              color={resume.status === 'analyzed' ? 'success' : 'default'}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              onClick={(e) => handleMenuOpen(e, resume.id)}
                            >
                              <MoreVert />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>

            {/* Menu */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => { navigate(`/analysis/${selectedResumeId}`); handleMenuClose(); }}>
                <Visibility sx={{ mr: 1 }} fontSize="small" />
                View Analysis
              </MenuItem>
              <MenuItem onClick={handleMenuClose}>
                <Email sx={{ mr: 1 }} fontSize="small" />
                Send Report
              </MenuItem>
              <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
                <Delete sx={{ mr: 1 }} fontSize="small" />
                Delete
              </MenuItem>
            </Menu>
          </motion.div>
        </Container>
      </Box>
    </Layout>
  );
};

export default DashboardPage;

