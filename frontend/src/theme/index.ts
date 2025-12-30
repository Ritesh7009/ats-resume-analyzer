import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#667eea',
      light: '#8b9ef5',
      dark: '#4a5fcf',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#764ba2',
      light: '#9b6fc4',
      dark: '#5a3580',
      contrastText: '#ffffff',
    },
    success: {
      main: '#4caf50',
      light: '#80e27e',
      dark: '#087f23',
    },
    warning: {
      main: '#ff9800',
      light: '#ffc947',
      dark: '#c66900',
    },
    error: {
      main: '#f44336',
      light: '#ff7961',
      dark: '#ba000d',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a202c',
      secondary: '#64748b',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '0.875rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 1px 3px rgba(0, 0, 0, 0.08)',
    '0px 2px 6px rgba(0, 0, 0, 0.08)',
    '0px 4px 12px rgba(0, 0, 0, 0.1)',
    '0px 8px 24px rgba(0, 0, 0, 0.12)',
    '0px 12px 36px rgba(0, 0, 0, 0.14)',
    '0px 16px 48px rgba(0, 0, 0, 0.16)',
    '0px 20px 60px rgba(0, 0, 0, 0.18)',
    '0px 24px 72px rgba(0, 0, 0, 0.2)',
    '0px 28px 84px rgba(0, 0, 0, 0.22)',
    '0px 32px 96px rgba(0, 0, 0, 0.24)',
    '0px 36px 108px rgba(0, 0, 0, 0.26)',
    '0px 40px 120px rgba(0, 0, 0, 0.28)',
    '0px 44px 132px rgba(0, 0, 0, 0.3)',
    '0px 48px 144px rgba(0, 0, 0, 0.32)',
    '0px 52px 156px rgba(0, 0, 0, 0.34)',
    '0px 56px 168px rgba(0, 0, 0, 0.36)',
    '0px 60px 180px rgba(0, 0, 0, 0.38)',
    '0px 64px 192px rgba(0, 0, 0, 0.4)',
    '0px 68px 204px rgba(0, 0, 0, 0.42)',
    '0px 72px 216px rgba(0, 0, 0, 0.44)',
    '0px 76px 228px rgba(0, 0, 0, 0.46)',
    '0px 80px 240px rgba(0, 0, 0, 0.48)',
    '0px 84px 252px rgba(0, 0, 0, 0.5)',
    '0px 88px 264px rgba(0, 0, 0, 0.52)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          fontSize: '0.95rem',
        },
        contained: {
          boxShadow: '0px 4px 12px rgba(102, 126, 234, 0.25)',
          '&:hover': {
            boxShadow: '0px 6px 16px rgba(102, 126, 234, 0.35)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 16,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          height: 8,
        },
      },
    },
  },
});

export default theme;
