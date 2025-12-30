import React, { useState } from 'react';
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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Check,
  Close,
  WorkspacePremium,
  Bolt,
  Star,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

interface PricingTier {
  name: string;
  price: number;
  currency: string;
  description: string;
  icon: React.ReactNode;
  features: { text: string; included: boolean }[];
  popular?: boolean;
  buttonText: string;
  buttonVariant: 'contained' | 'outlined';
}

const PricingPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tiers: PricingTier[] = [
    {
      name: 'Free',
      price: 0,
      currency: '₹',
      description: 'Try out basic features',
      icon: <Bolt sx={{ fontSize: 32 }} />,
      features: [
        { text: 'Upload and analyze resume', included: true },
        { text: 'Basic ATS score', included: true },
        { text: 'Partial analysis (blurred)', included: true },
        { text: 'Full detailed analysis', included: false },
        { text: 'ATS-approved templates', included: false },
        { text: 'Resume builder form', included: false },
        { text: 'Download PDF reports', included: false },
        { text: 'Multiple resume uploads', included: false },
      ],
      buttonText: isAuthenticated ? 'Current Plan' : 'Get Started Free',
      buttonVariant: 'outlined',
    },
    {
      name: 'Premium',
      price: 50,
      currency: '₹',
      description: '5 resume uploads with full access',
      icon: <Star sx={{ fontSize: 32 }} />,
      features: [
        { text: 'Upload and analyze 5 resumes', included: true },
        { text: 'Complete ATS score breakdown', included: true },
        { text: 'Full detailed analysis', included: true },
        { text: 'CV flaws & fixes report', included: true },
        { text: 'ATS-approved templates', included: true },
        { text: 'Resume builder form', included: true },
        { text: 'Download PDF reports', included: true },
        { text: 'Priority support', included: true },
      ],
      popular: true,
      buttonText: user?.isPremium ? `${5 - (user as any)?.uploadCount || 0} uploads left` : 'Upgrade for ₹50',
      buttonVariant: 'contained',
    },
  ];

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePurchase = async (tier: PricingTier) => {
    if (tier.name === 'Free') {
      if (!isAuthenticated) {
        navigate('/register');
      }
      return;
    }

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError('Failed to load payment gateway. Please try again.');
        setIsLoading(false);
        return;
      }

      // Create order on backend
      const response = await api.post('/payment/create-order');
      const { orderId, amount, currency, key } = response.data.data;

      // Initialize Razorpay
      const options = {
        key: key,
        amount: amount,
        currency: currency,
        name: 'ATS Resume Analyzer',
        description: 'Premium Plan - 5 Resume Uploads',
        order_id: orderId,
        handler: async (response: any) => {
          try {
            // Verify payment on backend
            await api.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            
            alert('Payment successful! You now have 5 resume uploads.');
            window.location.reload();
          } catch (err) {
            setError('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: {
          color: '#7c3aed',
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to initiate payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h2"
            sx={{ fontWeight: 700, mb: 2 }}
          >
            Simple Pricing
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
            Get full access to all features for just ₹50
          </Typography>
          <Chip
            icon={<WorkspacePremium />}
            label="One-time payment • 5 resume uploads"
            sx={{
              bgcolor: 'rgba(255,255,255,0.2)',
              color: 'white',
              fontWeight: 600,
              fontSize: '1rem',
              py: 2,
              px: 1,
            }}
          />
        </Container>
      </Box>

      {/* Error Alert */}
      {error && (
        <Container maxWidth="md" sx={{ mt: -4 }}>
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Container>
      )}

      {/* Pricing Cards */}
      <Container maxWidth="md" sx={{ py: 8, mt: -6 }}>
        <Grid container spacing={4} justifyContent="center">
          {tiers.map((tier, index) => (
            <Grid item xs={12} sm={6} key={tier.name}>
              <Card
                component={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  borderRadius: 3,
                  border: tier.popular ? '2px solid' : '1px solid',
                  borderColor: tier.popular ? 'primary.main' : 'divider',
                  boxShadow: tier.popular ? 8 : 2,
                }}
              >
                {tier.popular && (
                  <Chip
                    icon={<WorkspacePremium />}
                    label="Best Value"
                    color="primary"
                    sx={{
                      position: 'absolute',
                      top: -16,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontWeight: 600,
                    }}
                  />
                )}

                <CardContent sx={{ p: 4, flex: 1 }}>
                  <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: 3,
                        bgcolor: tier.popular ? 'primary.main' : 'primary.lighter',
                        color: tier.popular ? 'white' : 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                      }}
                    >
                      {tier.icon}
                    </Box>
                    <Typography variant="h5" fontWeight={700}>
                      {tier.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {tier.description}
                    </Typography>
                  </Box>

                  <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center' }}>
                      <Typography variant="h3" fontWeight={700}>
                        {tier.currency}{tier.price}
                      </Typography>
                      {tier.price > 0 && (
                        <Typography variant="body1" color="text.secondary" sx={{ ml: 1 }}>
                          one-time
                        </Typography>
                      )}
                    </Box>
                    {tier.price > 0 && (
                      <Typography variant="caption" color="success.main" fontWeight={600}>
                        ₹10 per resume upload
                      </Typography>
                    )}
                  </Box>

                  <List dense>
                    {tier.features.map((feature, idx) => (
                      <ListItem key={idx} sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          {feature.included ? (
                            <Check sx={{ color: 'success.main' }} />
                          ) : (
                            <Close sx={{ color: 'text.disabled' }} />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={feature.text}
                          primaryTypographyProps={{
                            variant: 'body2',
                            color: feature.included ? 'text.primary' : 'text.disabled',
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>

                <CardActions sx={{ p: 4, pt: 0 }}>
                  <Button
                    fullWidth
                    variant={tier.buttonVariant}
                    size="large"
                    onClick={() => handlePurchase(tier)}
                    disabled={
                      isLoading ||
                      (tier.name === 'Free' && isAuthenticated && !user?.isPremium) ||
                      (tier.name === 'Premium' && user?.isPremium && ((user as any)?.uploadCount || 0) < 5)
                    }
                    sx={{ py: 1.5 }}
                  >
                    {isLoading && tier.name === 'Premium' ? (
                      <CircularProgress size={24} />
                    ) : (
                      tier.buttonText
                    )}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* FAQ Section */}
      <Box sx={{ py: 8, bgcolor: 'grey.50' }}>
        <Container maxWidth="md">
          <Typography variant="h3" fontWeight={700} textAlign="center" gutterBottom>
            Frequently Asked Questions
          </Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 6 }}>
            Have questions? We&apos;ve got answers.
          </Typography>

          <Grid container spacing={4}>
            {[
              {
                q: 'Can I cancel my subscription anytime?',
                a: 'Yes! You can cancel your subscription at any time. You will continue to have access to premium features until the end of your billing period.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards, PayPal, and Apple Pay through our secure payment processor Gumroad.',
              },
              {
                q: 'Is there a free trial?',
                a: 'Our Free plan is essentially a free trial with limited features. You can upgrade to Pro anytime to unlock all features.',
              },
              {
                q: 'How accurate is the ATS scoring?',
                a: 'Our AI-powered scoring system is trained on thousands of real resumes and job descriptions. It provides industry-standard ATS compatibility scores.',
              },
              {
                q: 'Can I get a refund?',
                a: 'We offer a 14-day money-back guarantee. If you are not satisfied with our service, contact us for a full refund.',
              },
              {
                q: 'Do you store my resume data?',
                a: 'Your resume data is securely stored and encrypted. You can delete your data at any time from your account settings.',
              },
            ].map((faq, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Paper sx={{ p: 3, height: '100%', borderRadius: 2 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {faq.q}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {faq.a}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: 8,
          background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
          color: 'white',
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Ready to Land Your Dream Job?
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, opacity: 0.9 }}>
            Start optimizing your resume today with our AI-powered analysis.
          </Typography>
          <Button
            variant="contained"
            size="large"
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              px: 6,
              py: 1.5,
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

export default PricingPage;

