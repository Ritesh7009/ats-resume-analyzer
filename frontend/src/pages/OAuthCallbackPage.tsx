import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Container, Typography, CircularProgress, Alert } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';

const OAuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginWithTokens } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const accessToken = searchParams.get('accessToken');
      const refreshToken = searchParams.get('refreshToken');
      const provider = searchParams.get('provider');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setError(getErrorMessage(errorParam));
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      if (accessToken && refreshToken) {
        try {
          await loginWithTokens(accessToken, refreshToken);
          navigate('/dashboard', { replace: true });
        } catch (err) {
          console.error('OAuth login failed:', err);
          setError('Failed to complete login. Please try again.');
          setTimeout(() => navigate('/login'), 3000);
        }
      } else {
        setError('Invalid OAuth response. Missing tokens.');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, loginWithTokens, navigate]);

  const getErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'google_auth_failed':
        return 'Google authentication failed. Please try again.';
      case 'github_auth_failed':
        return 'GitHub authentication failed. Please try again.';
      case 'no_user':
        return 'Unable to retrieve user information.';
      case 'callback_failed':
        return 'Authentication callback failed. Please try again.';
      default:
        return 'An error occurred during authentication.';
    }
  };

  return (
    <Layout showFooter={false}>
      <Box
        sx={{
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Container maxWidth="sm">
          <Box sx={{ textAlign: 'center' }}>
            {error ? (
              <>
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
                <Typography variant="body2" color="text.secondary">
                  Redirecting to login page...
                </Typography>
              </>
            ) : (
              <>
                <CircularProgress size={48} sx={{ mb: 3 }} />
                <Typography variant="h6" gutterBottom>
                  Completing sign in...
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Please wait while we complete your authentication.
                </Typography>
              </>
            )}
          </Box>
        </Container>
      </Box>
    </Layout>
  );
};

export default OAuthCallbackPage;
