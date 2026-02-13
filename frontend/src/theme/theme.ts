import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#2e7d32', // Green — veterinary feel
      light: '#60ad5e',
      dark: '#005005',
    },
    secondary: {
      main: '#1565c0',
      light: '#5e92f3',
      dark: '#003c8f',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontSize: 13, // Dense UI for clinic efficiency
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiTextField: {
      defaultProps: {
        size: 'small',
        variant: 'outlined',
      },
    },
    MuiTable: {
      defaultProps: {
        size: 'small',
      },
    },
  },
});
