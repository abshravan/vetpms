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
                background: { default: '#1a1a2e', paper: '#24243e' },
              }),
        },
        typography: {
          fontFamily: 'var(--font-sans), "Inter", system-ui, sans-serif',
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
