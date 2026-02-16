'use client';

import { useMemo } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { useTheme } from './ThemeContext';

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  const { theme: mode } = useTheme();

  const muiTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'light'
            ? {
                primary: { main: '#4f46e5' },
                background: { default: '#fafafa', paper: '#ffffff' },
              }
            : {
                primary: { main: '#818cf8' },
                background: { default: '#0f1117', paper: '#1a1d2e' },
              }),
        },
        typography: {
          fontFamily: 'var(--font-inter), "Inter", system-ui, sans-serif',
        },
        shape: { borderRadius: 8 },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                fontWeight: 500,
                borderRadius: 8,
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
              },
            },
          },
          MuiTableCell: {
            styleOverrides: {
              head: {
                fontWeight: 600,
                fontSize: '0.75rem',
                textTransform: 'uppercase' as const,
                letterSpacing: '0.05em',
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                fontWeight: 500,
              },
            },
          },
          MuiDialog: {
            styleOverrides: {
              paper: {
                borderRadius: 12,
              },
            },
          },
        },
      }),
    [mode],
  );

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
