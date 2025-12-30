import React, { useState, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Divider,
} from '@mui/material';
import { CloudUpload, Description, Work, ArrowForward, ArrowBack } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import FileUpload from '../components/common/FileUpload';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { resumeApi } from '../services/apiService';

const steps = ['Upload Resume', 'Add Job Description (Optional)', 'Review & Analyze'];

const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFileName, setUploadedFileName] = useState<string | undefined>();
  const [uploadError, setUploadError] = useState<string | undefined>();
  const [jobDescription, setJobDescription] = useState('');
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileSelect = useCallback(async (file: File) => {
    setSelectedFile(file);
    setUploadError(undefined);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await resumeApi.upload(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadedFileName(file.name);
      setResumeId(response.data?.resumeId || null);
      
      setTimeout(() => {
        setIsUploading(false);
        setActiveStep(1);
      }, 500);
    } catch (error: unknown) {
      setIsUploading(false);
      setUploadProgress(0);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to upload resume. Please try again.';
      setUploadError(errorMessage);
    }
  }, []);

  const handleAnalyze = async () => {
    if (!resumeId) return;

    setIsAnalyzing(true);
    try {
      await resumeApi.analyze(resumeId);
      
      if (jobDescription.trim()) {
        await resumeApi.matchJob(resumeId, jobDescription);
      }
      
      navigate(`/analysis/${resumeId}`);
    } catch (error) {
      console.error('Analysis error:', error);
      setUploadError('Failed to analyze resume. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNext = () => {
    if (activeStep === 2) {
      handleAnalyze();
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const canProceed = () => {
    switch (activeStep) {
      case 0:
        return !!uploadedFileName;
      case 1:
        return true; // Job description is optional
      case 2:
        return !!resumeId;
      default:
        return false;
    }
  };

  return (
    <Layout>
      <Box sx={{ py: { xs: 4, md: 6 }, bgcolor: 'grey.50', minHeight: 'calc(100vh - 64px)' }}>
        <Container maxWidth="md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Typography variant="h3" fontWeight={700} gutterBottom>
                Analyze Your Resume
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Upload your resume and get instant AI-powered feedback
              </Typography>
            </Box>

            {/* Stepper */}
            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 6 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {/* Content */}
            <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: 3 }}>
              {/* Step 0: Upload */}
              {activeStep === 0 && (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
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
                      <CloudUpload sx={{ color: 'primary.main' }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight={600}>
                        Upload Your Resume
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Supported formats: PDF, DOCX, JPG, JPEG, PNG (Max 10MB)
                      </Typography>
                    </Box>
                  </Box>

                  <FileUpload
                    onFileSelect={handleFileSelect}
                    isUploading={isUploading}
                    uploadProgress={uploadProgress}
                    uploadedFileName={uploadedFileName}
                    error={uploadError}
                    acceptedFormats={['.pdf', '.docx', '.jpg', '.jpeg', '.png']}
                    maxSize={10 * 1024 * 1024}
                  />
                </Box>
              )}

              {/* Step 1: Job Description */}
              {activeStep === 1 && (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
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
                      <Work sx={{ color: 'primary.main' }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight={600}>
                        Add Job Description (Optional)
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Paste a job description to see how well your resume matches
                      </Typography>
                    </Box>
                  </Box>

                  <TextField
                    fullWidth
                    multiline
                    rows={10}
                    placeholder="Paste the job description here to compare your resume against specific requirements..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />

                  <Alert severity="info" sx={{ mt: 3 }}>
                    Adding a job description helps us provide more targeted feedback and identify 
                    specific keywords you may be missing.
                  </Alert>
                </Box>
              )}

              {/* Step 2: Review */}
              {activeStep === 2 && (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
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
                      <Typography variant="h6" fontWeight={600}>
                        Review & Analyze
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Review your submission before analysis
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ bgcolor: 'grey.50', p: 3, borderRadius: 2, mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Resume File
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Description sx={{ color: 'primary.main' }} />
                      <Typography fontWeight={500}>{uploadedFileName}</Typography>
                    </Box>
                  </Box>

                  {jobDescription && (
                    <Box sx={{ bgcolor: 'grey.50', p: 3, borderRadius: 2, mb: 3 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Job Description
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          whiteSpace: 'pre-wrap',
                          maxHeight: 150,
                          overflow: 'auto',
                        }}
                      >
                        {jobDescription.substring(0, 300)}
                        {jobDescription.length > 300 && '...'}
                      </Typography>
                    </Box>
                  )}

                  <Divider sx={{ my: 3 }} />

                  <Alert severity="success">
                    Ready to analyze! Click the button below to get your ATS score and 
                    personalized improvement suggestions.
                  </Alert>
                </Box>
              )}

              {/* Navigation Buttons */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBack />}
                  onClick={handleBack}
                  disabled={activeStep === 0 || isAnalyzing}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  endIcon={activeStep === 2 ? undefined : <ArrowForward />}
                  onClick={handleNext}
                  disabled={!canProceed() || isAnalyzing}
                >
                  {isAnalyzing ? (
                    <LoadingSpinner size={24} />
                  ) : activeStep === 2 ? (
                    'Analyze Resume'
                  ) : (
                    'Continue'
                  )}
                </Button>
              </Box>
            </Paper>
          </motion.div>
        </Container>
      </Box>
    </Layout>
  );
};

export default UploadPage;

