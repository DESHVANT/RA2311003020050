'use client';

import Link from 'next/link';
import { AppBar, Box, Button, CssBaseline, GlobalStyles, Toolbar, ThemeProvider, Typography, createTheme } from '@mui/material';
import { NotificationProvider } from '@/app/providers';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0f766e',
    },
    secondary: {
      main: '#1d4ed8',
    },
    background: {
      default: '#f6f8fb',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: 'var(--font-plus-jakarta), sans-serif',
    h4: { fontWeight: 800 },
    h6: { fontWeight: 800 },
  },
  shape: {
    borderRadius: 16,
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles
        styles={{
          body: {
            background:
              'radial-gradient(circle at top left, rgba(15,118,110,0.08), transparent 28%), linear-gradient(180deg, #f8fbfd 0%, #eef4f8 100%)',
          },
          a: { color: 'inherit', textDecoration: 'none' },
        }}
      />
      <NotificationProvider>
        <AppBar position="sticky" elevation={0} color="transparent" sx={{ backdropFilter: 'blur(14px)', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
            <Box>
              <Typography variant="subtitle1" fontWeight={800}>
                Campus Notifications
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Microservice dashboard
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button component={Link} href="/" variant="text" sx={{ textTransform: 'none' }}>
                All Notifications
              </Button>
              <Button component={Link} href="/priority-inbox" variant="outlined" sx={{ textTransform: 'none' }}>
                Priority Inbox
              </Button>
            </Box>
          </Toolbar>
        </AppBar>
        {children}
      </NotificationProvider>
    </ThemeProvider>
  );
}