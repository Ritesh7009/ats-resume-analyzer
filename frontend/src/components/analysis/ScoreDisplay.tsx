import React from 'react';
import { Box, Typography, Paper, Chip, LinearProgress, Tooltip } from '@mui/material';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  Warning, 
  Error as ErrorIcon,
  TrendingUp,
  Psychology,
  Code,
  School,
  WorkOutline,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface ScoreDisplayProps {
  score: number;
  label?: string;
  size?: 'small' | 'medium' | 'large';
  showGrade?: boolean;
}

export const ScoreCircle: React.FC<ScoreDisplayProps> = ({ 
  score, 
  label = 'ATS Score', 
  size = 'medium',
  showGrade = true,
}) => {
  const getScoreColor = () => {
    if (score >= 80) return '#4caf50';
    if (score >= 60) return '#ff9800';
    if (score >= 40) return '#f44336';
    return '#9e9e9e';
  };

  const getGrade = () => {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  };

  const dimensions = {
    small: { outer: 100, inner: 80, fontSize: '1.5rem', labelSize: '0.75rem' },
    medium: { outer: 150, inner: 120, fontSize: '2.5rem', labelSize: '0.875rem' },
    large: { outer: 200, inner: 160, fontSize: '3.5rem', labelSize: '1rem' },
  };

  const { outer, inner, fontSize, labelSize } = dimensions[size];

  const data = [
    { value: score },
    { value: 100 - score },
  ];

  return (
    <Box sx={{ position: 'relative', width: outer, height: outer }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={inner / 2}
            outerRadius={outer / 2}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            strokeWidth={0}
          >
            <Cell fill={getScoreColor()} />
            <Cell fill="#e0e0e0" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
        }}
      >
        <Typography
          component={motion.div}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          sx={{ fontSize, fontWeight: 700, color: getScoreColor() }}
        >
          {score}
        </Typography>
        {showGrade && (
          <Chip
            label={getGrade()}
            size="small"
            sx={{
              bgcolor: getScoreColor(),
              color: 'white',
              fontWeight: 600,
              fontSize: '0.7rem',
            }}
          />
        )}
        <Typography sx={{ fontSize: labelSize, color: 'text.secondary', mt: 0.5 }}>
          {label}
        </Typography>
      </Box>
    </Box>
  );
};

interface ScoreBreakdownProps {
  scores: {
    keywordRelevance: number;
    sectionStructure: number;
    formatting: number;
    experienceQuality: number;
    skillsMatch: number;
    fileStructure: number;
  };
}

export const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({ scores }) => {
  const breakdownItems = [
    { label: 'Keyword Relevance', value: scores.keywordRelevance, icon: <Psychology />, weight: '25%' },
    { label: 'Section Structure', value: scores.sectionStructure, icon: <WorkOutline />, weight: '20%' },
    { label: 'Formatting', value: scores.formatting, icon: <Code />, weight: '15%' },
    { label: 'Experience Quality', value: scores.experienceQuality, icon: <TrendingUp />, weight: '15%' },
    { label: 'Skills Match', value: scores.skillsMatch, icon: <School />, weight: '15%' },
    { label: 'File Structure', value: scores.fileStructure, icon: <Code />, weight: '10%' },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Score Breakdown
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {breakdownItems.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ color: 'primary.main' }}>{item.icon}</Box>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Tooltip title={`Weight: ${item.weight}`}>
                    <Typography variant="body2">{item.label}</Typography>
                  </Tooltip>
                  <Typography variant="body2" fontWeight={600}>
                    {item.value}/100
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={item.value}
                  color={getScoreColor(item.value)}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            </Box>
          </motion.div>
        ))}
      </Box>
    </Paper>
  );
};

interface FeedbackCardProps {
  section: string;
  score: number;
  status: 'good' | 'warning' | 'error';
  issues: string[];
  suggestions: string[];
}

export const FeedbackCard: React.FC<FeedbackCardProps> = ({
  section,
  score,
  status,
  issues,
  suggestions,
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'good':
        return <CheckCircle sx={{ color: 'success.main' }} />;
      case 'warning':
        return <Warning sx={{ color: 'warning.main' }} />;
      case 'error':
        return <ErrorIcon sx={{ color: 'error.main' }} />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'good':
        return 'success.lighter';
      case 'warning':
        return 'warning.lighter';
      case 'error':
        return 'error.lighter';
    }
  };

  return (
    <Paper
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      sx={{
        p: 2,
        bgcolor: getStatusColor(),
        border: '1px solid',
        borderColor: status === 'good' ? 'success.light' : status === 'warning' ? 'warning.light' : 'error.light',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        {getStatusIcon()}
        <Typography variant="h6" sx={{ flex: 1 }}>
          {section}
        </Typography>
        <Chip
          label={`${score}/100`}
          size="small"
          color={status === 'good' ? 'success' : status === 'warning' ? 'warning' : 'error'}
        />
      </Box>
      
      {issues.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="error.main" gutterBottom>
            Issues:
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2 }}>
            {issues.map((issue, idx) => (
              <Typography component="li" variant="body2" key={idx}>
                {issue}
              </Typography>
            ))}
          </Box>
        </Box>
      )}
      
      {suggestions.length > 0 && (
        <Box>
          <Typography variant="subtitle2" color="primary.main" gutterBottom>
            Suggestions:
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2 }}>
            {suggestions.map((suggestion, idx) => (
              <Typography component="li" variant="body2" key={idx}>
                {suggestion}
              </Typography>
            ))}
          </Box>
        </Box>
      )}
    </Paper>
  );
};

