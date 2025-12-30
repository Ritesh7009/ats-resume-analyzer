import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  Alert,
  Grid,
} from '@mui/material';
import {
  ExpandMore,
  Error as ErrorIcon,
  Warning,
  Info,
  CheckCircle,
  Cancel,
  Lightbulb,
  Build,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { ATSFlaw, ATSApprovalTip, EnhancedAnalysis } from '../../types';

interface FlawsDisplayProps {
  enhancedAnalysis: EnhancedAnalysis;
}

const getCategoryIcon = (category: ATSFlaw['category']) => {
  switch (category) {
    case 'critical':
      return <ErrorIcon sx={{ color: 'error.main' }} />;
    case 'major':
      return <Warning sx={{ color: 'warning.main' }} />;
    case 'minor':
      return <Info sx={{ color: 'info.main' }} />;
  }
};

const getCategoryColor = (category: ATSFlaw['category']) => {
  switch (category) {
    case 'critical':
      return 'error';
    case 'major':
      return 'warning';
    case 'minor':
      return 'info';
  }
};

const getPriorityColor = (priority: ATSApprovalTip['priority']) => {
  switch (priority) {
    case 'high':
      return 'error';
    case 'medium':
      return 'warning';
    case 'low':
      return 'info';
  }
};

const getReadinessColor = (readiness: EnhancedAnalysis['overallReadiness']) => {
  switch (readiness) {
    case 'ready':
      return 'success';
    case 'needs_work':
      return 'warning';
    case 'not_ready':
      return 'error';
  }
};

const getReadinessLabel = (readiness: EnhancedAnalysis['overallReadiness']) => {
  switch (readiness) {
    case 'ready':
      return 'ATS Ready';
    case 'needs_work':
      return 'Needs Improvement';
    case 'not_ready':
      return 'Not ATS Ready';
  }
};

export const FlawsDisplay: React.FC<FlawsDisplayProps> = ({ enhancedAnalysis }) => {
  const { flaws, approvalTips, overallReadiness, readinessScore, summary } = enhancedAnalysis;

  const criticalFlaws = flaws.filter((f) => f.category === 'critical');
  const majorFlaws = flaws.filter((f) => f.category === 'major');
  const minorFlaws = flaws.filter((f) => f.category === 'minor');

  const implementedTips = approvalTips.filter((t) => t.implemented);
  const pendingTips = approvalTips.filter((t) => !t.implemented);

  return (
    <Box>
      {/* Readiness Overview */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: `${getReadinessColor(overallReadiness)}.lighter`,
                  border: 3,
                  borderColor: `${getReadinessColor(overallReadiness)}.main`,
                }}
              >
                <Typography variant="h4" fontWeight={700} color={`${getReadinessColor(overallReadiness)}.main`}>
                  {readinessScore}
                </Typography>
              </Box>
              <Box>
                <Chip
                  label={getReadinessLabel(overallReadiness)}
                  color={getReadinessColor(overallReadiness)}
                  sx={{ fontWeight: 600, mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  ATS Readiness Score
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Alert severity={getReadinessColor(overallReadiness)} sx={{ borderRadius: 2 }}>
              {summary}
            </Alert>
          </Grid>
        </Grid>
      </Paper>

      {/* Flaws Section */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Build color="error" />
          Issues Found in Your CV
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          These are the problems detected in your resume that may cause ATS rejection.
        </Typography>

        {flaws.length === 0 ? (
          <Alert severity="success" sx={{ borderRadius: 2 }}>
            <Typography variant="body1">
              🎉 Great job! No major issues found in your resume.
            </Typography>
          </Alert>
        ) : (
          <Box>
            {/* Critical Issues */}
            {criticalFlaws.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" color="error.main" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ErrorIcon /> Critical Issues ({criticalFlaws.length})
                </Typography>
                {criticalFlaws.map((flaw, index) => (
                  <FlawCard key={index} flaw={flaw} />
                ))}
              </Box>
            )}

            {/* Major Issues */}
            {majorFlaws.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" color="warning.main" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Warning /> Major Issues ({majorFlaws.length})
                </Typography>
                {majorFlaws.map((flaw, index) => (
                  <FlawCard key={index} flaw={flaw} />
                ))}
              </Box>
            )}

            {/* Minor Issues */}
            {minorFlaws.length > 0 && (
              <Box>
                <Typography variant="h6" color="info.main" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Info /> Minor Issues ({minorFlaws.length})
                </Typography>
                {minorFlaws.map((flaw, index) => (
                  <FlawCard key={index} flaw={flaw} />
                ))}
              </Box>
            )}
          </Box>
        )}
      </Paper>

      {/* ATS Approval Checklist */}
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Lightbulb color="warning" />
          How to Make Your CV ATS-Approved
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Follow this checklist to ensure your resume passes ATS systems.
        </Typography>

        {/* Progress */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" fontWeight={600}>
              Checklist Progress
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {implementedTips.length} / {approvalTips.length} completed
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={(implementedTips.length / approvalTips.length) * 100}
            sx={{ height: 10, borderRadius: 5 }}
            color="success"
          />
        </Box>

        {/* Pending Tips */}
        {pendingTips.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} color="error.main" gutterBottom>
              ❌ Still Needed ({pendingTips.length})
            </Typography>
            <List dense>
              {pendingTips.map((tip, index) => (
                <TipItem key={index} tip={tip} />
              ))}
            </List>
          </Box>
        )}

        {/* Completed Tips */}
        {implementedTips.length > 0 && (
          <Box>
            <Typography variant="subtitle1" fontWeight={600} color="success.main" gutterBottom>
              ✅ Already Implemented ({implementedTips.length})
            </Typography>
            <List dense>
              {implementedTips.map((tip, index) => (
                <TipItem key={index} tip={tip} />
              ))}
            </List>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

const FlawCard: React.FC<{ flaw: ATSFlaw }> = ({ flaw }) => {
  return (
    <Accordion
      component={motion.div}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      sx={{ mb: 1, borderRadius: 2, '&:before': { display: 'none' } }}
    >
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
          {getCategoryIcon(flaw.category)}
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              {flaw.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {flaw.description}
            </Typography>
          </Box>
          <Chip
            label={flaw.category.toUpperCase()}
            size="small"
            color={getCategoryColor(flaw.category)}
            sx={{ fontWeight: 600 }}
          />
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ pl: 5 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="error.main" fontWeight={600}>
              ⚠️ Impact:
            </Typography>
            <Typography variant="body2">{flaw.impact}</Typography>
          </Box>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="success.main" fontWeight={600}>
              ✅ How to Fix:
            </Typography>
            <Typography variant="body2">{flaw.howToFix}</Typography>
          </Box>
          {flaw.examples && flaw.examples.length > 0 && (
            <Box>
              <Typography variant="subtitle2" color="primary.main" fontWeight={600}>
                📝 Examples:
              </Typography>
              <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 2, mt: 1 }}>
                {flaw.examples.map((example, idx) => (
                  <Typography key={idx} variant="body2" sx={{ fontFamily: 'monospace', mb: 0.5 }}>
                    {example}
                  </Typography>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

const TipItem: React.FC<{ tip: ATSApprovalTip }> = ({ tip }) => {
  return (
    <ListItem
      sx={{
        bgcolor: tip.implemented ? 'success.lighter' : 'grey.50',
        borderRadius: 2,
        mb: 1,
        border: 1,
        borderColor: tip.implemented ? 'success.light' : 'grey.200',
      }}
    >
      <ListItemIcon>
        {tip.implemented ? (
          <CheckCircle color="success" />
        ) : (
          <Cancel color="error" />
        )}
      </ListItemIcon>
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle2" fontWeight={600}>
              {tip.title}
            </Typography>
            <Chip
              label={tip.category}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.7rem' }}
            />
            <Chip
              label={tip.priority}
              size="small"
              color={getPriorityColor(tip.priority)}
              sx={{ fontSize: '0.7rem' }}
            />
          </Box>
        }
        secondary={tip.description}
      />
    </ListItem>
  );
};

export default FlawsDisplay;
