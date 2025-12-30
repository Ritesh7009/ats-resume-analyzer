import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Lock, WorkspacePremium } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface BlurOverlayProps {
  children: React.ReactNode;
  isPremium: boolean;
  title?: string;
  message?: string;
}

const BlurOverlay: React.FC<BlurOverlayProps> = ({
  children,
  isPremium,
  title = 'Unlock Full Analysis',
  message = 'Upgrade to Premium for just ₹50 to see the complete analysis, templates, and resume builder.',
}) => {
  const navigate = useNavigate();

  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Blurred Content */}
      <Box
        sx={{
          filter: 'blur(8px)',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        {children}
      </Box>

      {/* Overlay */}
      <Box
        component={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(4px)',
          zIndex: 10,
        }}
      >
        <Paper
          component={motion.div}
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          sx={{
            p: 4,
            textAlign: 'center',
            maxWidth: 400,
            borderRadius: 3,
            boxShadow: 4,
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              bgcolor: 'primary.lighter',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <Lock sx={{ fontSize: 32, color: 'primary.main' }} />
          </Box>
          
          <Typography variant="h5" fontWeight={700} gutterBottom>
            {title}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {message}
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<WorkspacePremium />}
              onClick={() => navigate('/pricing')}
              sx={{ py: 1.5 }}
            >
              Upgrade for ₹50
            </Button>
            <Typography variant="caption" color="text.secondary">
              One-time payment • 5 resume uploads • Full access
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default BlurOverlay;
