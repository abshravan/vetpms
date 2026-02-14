import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Stack,
} from '@mui/material';
import { useAuth } from './AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@vetpms.dev');
  const [password, setPassword] = useState('anything');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email, password);
      navigate('/');
    } catch {
      setError('Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Card sx={{ width: 400, maxWidth: '90vw' }}>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h5" component="h1" textAlign="center" fontWeight={600}>
              VetPMS
            </Typography>
            <Typography variant="body2" textAlign="center" color="text.secondary">
              Veterinary Practice Management
            </Typography>

            <Alert severity="info" variant="outlined">
              Dev mode — enter any email/password to sign in.
            </Alert>

            {error && <Alert severity="error">{error}</Alert>}

            <form onSubmit={handleSubmit}>
              <Stack spacing={2}>
                <TextField
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  fullWidth
                  autoFocus
                />
                <TextField
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  fullWidth
                />
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={submitting}
                  size="large"
                >
                  {submitting ? 'Signing in...' : 'Sign In'}
                </Button>
              </Stack>
            </form>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
