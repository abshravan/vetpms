'use client';

import { useState } from 'react';
import { Grid, TextField, Button, Alert, MenuItem } from '@mui/material';
import { RecordVitalsData } from '../../types';

interface VitalsFormProps {
  onSubmit: (data: RecordVitalsData) => Promise<void>;
  disabled?: boolean;
}

export default function VitalsForm({ onSubmit, disabled }: VitalsFormProps) {
  const [form, setForm] = useState<RecordVitalsData>({
    temperatureUnit: 'F',
    weightUnit: 'kg',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleNum = (field: keyof RecordVitalsData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value === '' ? undefined : Number(e.target.value);
    setForm((f) => ({ ...f, [field]: val }));
  };

  const handleStr = (field: keyof RecordVitalsData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await onSubmit(form);
      setForm({ temperatureUnit: 'F', weightUnit: 'kg' });
    } catch {
      setError('Failed to record vitals');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
      <Grid container spacing={1.5}>
        <Grid item xs={4} sm={2}>
          <TextField label="Temp" type="number" value={form.temperature ?? ''} onChange={handleNum('temperature')} fullWidth inputProps={{ step: 0.1 }} disabled={disabled} />
        </Grid>
        <Grid item xs={2} sm={1}>
          <TextField label="Unit" value={form.temperatureUnit || 'F'} onChange={handleStr('temperatureUnit')} select fullWidth disabled={disabled}>
            <MenuItem value="F">°F</MenuItem>
            <MenuItem value="C">°C</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={3} sm={2}>
          <TextField label="HR (bpm)" type="number" value={form.heartRate ?? ''} onChange={handleNum('heartRate')} fullWidth disabled={disabled} />
        </Grid>
        <Grid item xs={3} sm={2}>
          <TextField label="RR (brpm)" type="number" value={form.respiratoryRate ?? ''} onChange={handleNum('respiratoryRate')} fullWidth disabled={disabled} />
        </Grid>
        <Grid item xs={4} sm={2}>
          <TextField label="Weight" type="number" value={form.weight ?? ''} onChange={handleNum('weight')} fullWidth inputProps={{ step: 0.01 }} disabled={disabled} />
        </Grid>
        <Grid item xs={2} sm={1}>
          <TextField label="Unit" value={form.weightUnit || 'kg'} onChange={handleStr('weightUnit')} select fullWidth disabled={disabled}>
            <MenuItem value="kg">kg</MenuItem>
            <MenuItem value="lb">lb</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={3} sm={2}>
          <TextField label="BCS (1-9)" type="number" value={form.bodyConditionScore ?? ''} onChange={handleNum('bodyConditionScore')} fullWidth inputProps={{ min: 1, max: 9 }} disabled={disabled} />
        </Grid>
        <Grid item xs={3} sm={2}>
          <TextField label="Pain (0-4)" type="number" value={form.painScore ?? ''} onChange={handleNum('painScore')} fullWidth inputProps={{ min: 0, max: 4 }} disabled={disabled} />
        </Grid>
        <Grid item xs={4} sm={2}>
          <TextField label="MM Color" value={form.mucousMembraneColor || ''} onChange={handleStr('mucousMembraneColor')} fullWidth disabled={disabled} placeholder="pink" />
        </Grid>
        <Grid item xs={2} sm={1}>
          <TextField label="CRT (s)" type="number" value={form.capillaryRefillTime ?? ''} onChange={handleNum('capillaryRefillTime')} fullWidth disabled={disabled} />
        </Grid>
        <Grid item xs={12} sm={7}>
          <TextField label="Vitals Notes" value={form.notes || ''} onChange={handleStr('notes')} fullWidth disabled={disabled} />
        </Grid>
        <Grid item xs={12} sm={2} sx={{ display: 'flex', alignItems: 'flex-end' }}>
          <Button type="submit" variant="contained" fullWidth disabled={submitting || disabled}>
            {submitting ? 'Saving...' : 'Record'}
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}
