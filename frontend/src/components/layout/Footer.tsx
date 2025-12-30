import React from 'react';
import { Box, Container, Typography, Link, IconButton, Divider, Grid } from '@mui/material';
import { GitHub, LinkedIn, Twitter, Email } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Footer: React.FC = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: 'Features', path: '/#features' },
      { label: 'Pricing', path: '/pricing' },
      { label: 'How it Works', path: '/#how-it-works' },
      { label: 'FAQ', path: '/#faq' },
    ],
    company: [
      { label: 'About Us', path: '/about' },
      { label: 'Contact', path: '/contact' },
      { label: 'Blog', path: '/blog' },
      { label: 'Careers', path: '/careers' },
    ],
    legal: [
      { label: 'Privacy Policy', path: '/privacy' },
      { label: 'Terms of Service', path: '/terms' },
      { label: 'Cookie Policy', path: '/cookies' },
    ],
  };

  const socialLinks = [
    { icon: <Twitter />, url: 'https://twitter.com', label: 'Twitter' },
    { icon: <LinkedIn />, url: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: <GitHub />, url: 'https://github.com', label: 'GitHub' },
    { icon: <Email />, url: 'mailto:support@atsanalyzer.com', label: 'Email' },
  ];

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'grey.50',
        borderTop: '1px solid',
        borderColor: 'divider',
        py: 6,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Brand Section */}
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '1.2rem' }}>
                    A
                  </Typography>
                </Box>
                <Typography variant="h6" fontWeight={700}>
                  ATS Analyzer
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 300 }}>
                AI-powered resume analysis to help you land your dream job. 
                Optimize your resume for ATS systems and stand out to recruiters.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {socialLinks.map((social) => (
                  <IconButton
                    key={social.label}
                    component="a"
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="small"
                    sx={{
                      bgcolor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
                      '&:hover': {
                        bgcolor: 'primary.main',
                        color: 'white',
                        borderColor: 'primary.main',
                      },
                    }}
                    aria-label={social.label}
                  >
                    {social.icon}
                  </IconButton>
                ))}
              </Box>
            </Box>
          </Grid>

          {/* Links Sections */}
          <Grid item xs={6} sm={4} md={2}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
              Product
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {footerLinks.product.map((link) => (
                <Link
                  key={link.label}
                  component="button"
                  variant="body2"
                  color="text.secondary"
                  underline="hover"
                  onClick={() => navigate(link.path)}
                  sx={{ textAlign: 'left' }}
                >
                  {link.label}
                </Link>
              ))}
            </Box>
          </Grid>

          <Grid item xs={6} sm={4} md={2}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
              Company
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {footerLinks.company.map((link) => (
                <Link
                  key={link.label}
                  component="button"
                  variant="body2"
                  color="text.secondary"
                  underline="hover"
                  onClick={() => navigate(link.path)}
                  sx={{ textAlign: 'left' }}
                >
                  {link.label}
                </Link>
              ))}
            </Box>
          </Grid>

          <Grid item xs={6} sm={4} md={2}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
              Legal
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.label}
                  component="button"
                  variant="body2"
                  color="text.secondary"
                  underline="hover"
                  onClick={() => navigate(link.path)}
                  sx={{ textAlign: 'left' }}
                >
                  {link.label}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* Newsletter Section */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
              Stay Updated
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Get the latest tips on resume optimization and job hunting.
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        {/* Bottom Section */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © {currentYear} ATS Resume Analyzer. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Link
              component="button"
              variant="body2"
              color="text.secondary"
              underline="hover"
              onClick={() => navigate('/privacy')}
            >
              Privacy
            </Link>
            <Link
              component="button"
              variant="body2"
              color="text.secondary"
              underline="hover"
              onClick={() => navigate('/terms')}
            >
              Terms
            </Link>
            <Link
              component="button"
              variant="body2"
              color="text.secondary"
              underline="hover"
              onClick={() => navigate('/cookies')}
            >
              Cookies
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;

