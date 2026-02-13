import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Pets as PetsIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { patientsApi } from '../../api/patients';
import { Patient, CreatePatientData } from '../../types';
import PatientFormDialog from './PatientFormDialog';

export default function PatientProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const fetchPatient = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data } = await patientsApi.get(id);
      setPatient(data);
    } catch {
      setError('Failed to load patient');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPatient();
  }, [fetchPatient]);

  const handleUpdate = async (data: CreatePatientData) => {
    if (!id) return;
    const { clientId: _, ...updateData } = data;
    await patientsApi.update(id, updateData);
    fetchPatient();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !patient) {
    return <Alert severity="error">{error || 'Patient not found'}</Alert>;
  }

  const formatAge = (dob: string | null) => {
    if (!dob) return 'Unknown';
    const birth = new Date(dob);
    const now = new Date();
    const years = now.getFullYear() - birth.getFullYear();
    const months = now.getMonth() - birth.getMonth();
    const adjustedMonths = months >= 0 ? months : 12 + months;
    const adjustedYears = months < 0 ? years - 1 : years;
    if (adjustedYears > 0) return `${adjustedYears} year${adjustedYears > 1 ? 's' : ''}, ${adjustedMonths} month${adjustedMonths !== 1 ? 's' : ''}`;
    return `${adjustedMonths} month${adjustedMonths !== 1 ? 's' : ''}`;
  };

  const sexLabel: Record<string, string> = {
    male: 'Male (Intact)',
    female: 'Female (Intact)',
    male_neutered: 'Male (Neutered)',
    female_spayed: 'Female (Spayed)',
    unknown: 'Unknown',
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <IconButton onClick={() => navigate(patient.client ? `/clients/${patient.clientId}` : '/patients')}>
          <BackIcon />
        </IconButton>
        <PetsIcon color="primary" />
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {patient.name}
        </Typography>
        {patient.isDeceased && <Chip label="Deceased" size="small" />}
        {!patient.isActive && <Chip label="Inactive" size="small" color="default" />}
        <Button startIcon={<EditIcon />} onClick={() => setEditDialogOpen(true)}>
          Edit
        </Button>
      </Box>

      {/* Allergy alert */}
      {patient.allergies && (
        <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 2 }}>
          <strong>Allergies:</strong> {patient.allergies}
        </Alert>
      )}

      {/* Basic Info */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Patient Information
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary">Species</Typography>
            <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>{patient.species}</Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary">Breed</Typography>
            <Typography variant="body2">{patient.breed || '—'}</Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary">Color</Typography>
            <Typography variant="body2">{patient.color || '—'}</Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary">Sex</Typography>
            <Typography variant="body2">{sexLabel[patient.sex] || patient.sex}</Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary">Date of Birth</Typography>
            <Typography variant="body2">
              {patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : '—'}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary">Age</Typography>
            <Typography variant="body2">{formatAge(patient.dateOfBirth)}</Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary">Weight</Typography>
            <Typography variant="body2" fontWeight={600}>
              {patient.weight ? `${patient.weight} ${patient.weightUnit || 'kg'}` : '—'}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary">Microchip</Typography>
            <Typography variant="body2">{patient.microchipNumber || '—'}</Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Insurance */}
      {(patient.insuranceProvider || patient.insurancePolicyNumber) && (
        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Insurance
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Provider</Typography>
              <Typography variant="body2">{patient.insuranceProvider || '—'}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Policy Number</Typography>
              <Typography variant="body2">{patient.insurancePolicyNumber || '—'}</Typography>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Owner Info */}
      {patient.client && (
        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Owner
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={6} sm={4}>
              <Typography variant="caption" color="text.secondary">Name</Typography>
              <Typography
                variant="body2"
                sx={{ cursor: 'pointer', color: 'primary.main', '&:hover': { textDecoration: 'underline' } }}
                onClick={() => navigate(`/clients/${patient.clientId}`)}
              >
                {patient.client.lastName}, {patient.client.firstName}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={4}>
              <Typography variant="caption" color="text.secondary">Phone</Typography>
              <Typography variant="body2">{patient.client.phone}</Typography>
            </Grid>
            <Grid item xs={6} sm={4}>
              <Typography variant="caption" color="text.secondary">Email</Typography>
              <Typography variant="body2">{patient.client.email}</Typography>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Notes */}
      {patient.notes && (
        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Notes
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="body2">{patient.notes}</Typography>
        </Paper>
      )}

      {/* Placeholder for future medical timeline */}
      <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Medical history, vaccinations, and visit timeline will appear here in Phase 4.
        </Typography>
      </Paper>

      <PatientFormDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onSubmit={handleUpdate}
        clientId={patient.clientId}
        patient={patient}
      />
    </Box>
  );
}
