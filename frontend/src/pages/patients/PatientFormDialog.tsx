import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Alert,
  MenuItem,
} from '@mui/material';
import { CreatePatientData, Patient, SPECIES_OPTIONS, SEX_OPTIONS } from '../../types';

interface PatientFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePatientData) => Promise<void>;
  clientId: string;
  patient?: Patient | null;
}

export default function PatientFormDialog({
  open,
  onClose,
  onSubmit,
  clientId,
  patient,
}: PatientFormDialogProps) {
  const [form, setForm] = useState<CreatePatientData>({
    clientId,
    name: '',
    species: 'dog',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (patient) {
      setForm({
        clientId: patient.clientId,
        name: patient.name,
        species: patient.species,
        breed: patient.breed || '',
        color: patient.color || '',
        sex: patient.sex,
        dateOfBirth: patient.dateOfBirth || '',
        weight: patient.weight ?? undefined,
        weightUnit: patient.weightUnit || 'kg',
        microchipNumber: patient.microchipNumber || '',
        insuranceProvider: patient.insuranceProvider || '',
        insurancePolicyNumber: patient.insurancePolicyNumber || '',
        allergies: patient.allergies || '',
        notes: patient.notes || '',
      });
    } else {
      setForm({ clientId, name: '', species: 'dog', weightUnit: 'kg' });
    }
    setError('');
  }, [patient, clientId, open]);

  const handleChange =
    (field: keyof CreatePatientData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = field === 'weight' ? (e.target.value ? parseFloat(e.target.value) : undefined) : e.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.species) {
      setError('Name and species are required');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await onSubmit(form);
      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === 'object' && err !== null && 'response' in err
            ? ((err as { response: { data: { message: string } } }).response?.data?.message ||
                'Failed to save patient')
            : 'Failed to save patient';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{patient ? 'Edit Patient' : 'New Patient'}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={6}>
              <TextField
                label="Name"
                value={form.name}
                onChange={handleChange('name')}
                required
                fullWidth
                autoFocus
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Species"
                value={form.species}
                onChange={handleChange('species')}
                select
                required
                fullWidth
              >
                {SPECIES_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField label="Breed" value={form.breed || ''} onChange={handleChange('breed')} fullWidth />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Color" value={form.color || ''} onChange={handleChange('color')} fullWidth />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Sex"
                value={form.sex || 'unknown'}
                onChange={handleChange('sex')}
                select
                fullWidth
              >
                {SEX_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Date of Birth"
                type="date"
                value={form.dateOfBirth || ''}
                onChange={handleChange('dateOfBirth')}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Weight"
                type="number"
                value={form.weight ?? ''}
                onChange={handleChange('weight')}
                fullWidth
                inputProps={{ step: 0.01, min: 0 }}
              />
            </Grid>
            <Grid item xs={2}>
              <TextField
                label="Unit"
                value={form.weightUnit || 'kg'}
                onChange={handleChange('weightUnit')}
                select
                fullWidth
              >
                <MenuItem value="kg">kg</MenuItem>
                <MenuItem value="lb">lb</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Microchip #"
                value={form.microchipNumber || ''}
                onChange={handleChange('microchipNumber')}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Insurance Provider"
                value={form.insuranceProvider || ''}
                onChange={handleChange('insuranceProvider')}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Policy Number"
                value={form.insurancePolicyNumber || ''}
                onChange={handleChange('insurancePolicyNumber')}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Allergies"
                value={form.allergies || ''}
                onChange={handleChange('allergies')}
                fullWidth
                multiline
                rows={2}
                color="warning"
                helperText="List known allergies for safety alerts"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Notes"
                value={form.notes || ''}
                onChange={handleChange('notes')}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
