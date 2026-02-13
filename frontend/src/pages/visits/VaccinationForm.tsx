import { useState } from 'react';
import { Grid, TextField, Button, Alert, MenuItem } from '@mui/material';
import { CreateVaccinationData } from '../../types';

interface VaccinationFormProps {
  patientId: string;
  visitId?: string;
  onSubmit: (data: CreateVaccinationData) => Promise<void>;
  disabled?: boolean;
}

const COMMON_VACCINES = [
  'Rabies (1-year)',
  'Rabies (3-year)',
  'DHPP (Distemper Combo)',
  'DHLPP',
  'Bordetella',
  'Canine Influenza (H3N2/H3N8)',
  'Leptospirosis',
  'Lyme Disease',
  'FVRCP (Feline Distemper Combo)',
  'FeLV (Feline Leukemia)',
  'FIV',
];

const ROUTE_OPTIONS = ['Subcutaneous (SC)', 'Intramuscular (IM)', 'Intranasal', 'Oral'];
const SITE_OPTIONS = ['Right rear leg', 'Left rear leg', 'Right forelimb', 'Left forelimb', 'Right shoulder', 'Left shoulder', 'Intranasal'];

export default function VaccinationForm({ patientId, visitId, onSubmit, disabled }: VaccinationFormProps) {
  const [vaccineName, setVaccineName] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [lotNumber, setLotNumber] = useState('');
  const [route, setRoute] = useState('');
  const [site, setSite] = useState('');
  const [dateAdministered, setDateAdministered] = useState(new Date().toISOString().split('T')[0]);
  const [nextDueDate, setNextDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [cost, setCost] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setVaccineName('');
    setManufacturer('');
    setLotNumber('');
    setRoute('');
    setSite('');
    setDateAdministered(new Date().toISOString().split('T')[0]);
    setNextDueDate('');
    setNotes('');
    setCost('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vaccineName.trim()) {
      setError('Vaccine name is required');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await onSubmit({
        patientId,
        visitId,
        vaccineName: vaccineName.trim(),
        manufacturer: manufacturer || undefined,
        lotNumber: lotNumber || undefined,
        route: route || undefined,
        site: site || undefined,
        dateAdministered: dateAdministered || undefined,
        nextDueDate: nextDueDate || undefined,
        notes: notes || undefined,
        cost: cost ? Number(cost) : undefined,
      });
      reset();
    } catch {
      setError('Failed to record vaccination');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
      <Grid container spacing={1.5}>
        <Grid item xs={6} sm={4}>
          <TextField
            label="Vaccine"
            value={vaccineName}
            onChange={(e) => setVaccineName(e.target.value)}
            select
            fullWidth
            required
            disabled={disabled}
          >
            {COMMON_VACCINES.map((v) => (
              <MenuItem key={v} value={v}>{v}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={6} sm={3}>
          <TextField label="Manufacturer" value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} fullWidth disabled={disabled} />
        </Grid>
        <Grid item xs={6} sm={2}>
          <TextField label="Lot #" value={lotNumber} onChange={(e) => setLotNumber(e.target.value)} fullWidth disabled={disabled} />
        </Grid>
        <Grid item xs={3} sm={1.5}>
          <TextField
            label="Route"
            value={route}
            onChange={(e) => setRoute(e.target.value)}
            select
            fullWidth
            disabled={disabled}
          >
            {ROUTE_OPTIONS.map((r) => (
              <MenuItem key={r} value={r}>{r}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={3} sm={1.5}>
          <TextField
            label="Site"
            value={site}
            onChange={(e) => setSite(e.target.value)}
            select
            fullWidth
            disabled={disabled}
          >
            {SITE_OPTIONS.map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={4} sm={2}>
          <TextField
            label="Date Given"
            type="date"
            value={dateAdministered}
            onChange={(e) => setDateAdministered(e.target.value)}
            fullWidth
            disabled={disabled}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={4} sm={2}>
          <TextField
            label="Next Due"
            type="date"
            value={nextDueDate}
            onChange={(e) => setNextDueDate(e.target.value)}
            fullWidth
            disabled={disabled}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={4} sm={2}>
          <TextField label="Cost ($)" type="number" value={cost} onChange={(e) => setCost(e.target.value)} fullWidth disabled={disabled} inputProps={{ step: 0.01 }} />
        </Grid>
        <Grid item xs={8} sm={4}>
          <TextField label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} fullWidth disabled={disabled} />
        </Grid>
        <Grid item xs={4} sm={2} sx={{ display: 'flex', alignItems: 'flex-end' }}>
          <Button type="submit" variant="contained" fullWidth disabled={submitting || disabled}>
            {submitting ? 'Saving...' : 'Record'}
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}
