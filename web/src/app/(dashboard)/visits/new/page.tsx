'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Alert,
  MenuItem,
  IconButton,
} from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';
import { visitsApi } from '../../../../api/visits';
import { patientsApi } from '../../../../api/patients';
import { usersApi, UserSummary } from '../../../../api/users';
import { Patient } from '../../../../types';

export default function NewVisitPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [vets, setVets] = useState<UserSummary[]>([]);
  const [vetId, setVetId] = useState('');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const patientId = searchParams.get('patientId') || '';
  const clientId = searchParams.get('clientId') || '';

  useEffect(() => {
    if (patientId) {
      patientsApi.get(patientId).then(({ data }) => setPatient(data));
    }
    usersApi.list().then(({ data }) => {
      const vetList = data.filter((u) => u.role === 'vet' || u.role === 'admin');
      setVets(vetList);
      if (vetList.length === 1) setVetId(vetList[0].id);
    });
  }, [patientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !clientId || !vetId) {
      setError('Patient and vet are required');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const { data } = await visitsApi.create({
        patientId,
        clientId,
        vetId,
        chiefComplaint: chiefComplaint || undefined,
      });
      router.push(`/visits/${data.id}`);
    } catch {
      setError('Failed to create visit');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <IconButton onClick={() => router.back()}>
          <BackIcon />
        </IconButton>
        <Typography variant="h6">
          New Visit {patient ? `— ${patient.name}` : ''}
        </Typography>
      </Box>

      <Paper variant="outlined" sx={{ p: 3, maxWidth: 500 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {patient && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">Patient</Typography>
            <Typography variant="body1" fontWeight={500}>
              {patient.name} — {patient.species} {patient.breed ? `(${patient.breed})` : ''}
            </Typography>
          </Box>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Veterinarian"
                value={vetId}
                onChange={(e) => setVetId(e.target.value)}
                select
                required
                fullWidth
              >
                {vets.map((v) => (
                  <MenuItem key={v.id} value={v.id}>
                    Dr. {v.lastName}, {v.firstName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Chief Complaint / Reason for Visit"
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                fullWidth
                multiline
                rows={3}
                placeholder="What brought the patient in today?"
              />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" fullWidth disabled={submitting}>
                {submitting ? 'Creating...' : 'Start Visit'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
}
