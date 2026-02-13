import { useState } from 'react';
import { Grid, TextField, Button, Alert, MenuItem } from '@mui/material';
import {
  CreateTreatmentData,
  TreatmentCategory,
  TREATMENT_CATEGORY_OPTIONS,
} from '../../types';

interface TreatmentFormProps {
  visitId: string;
  patientId: string;
  onSubmit: (data: CreateTreatmentData) => Promise<void>;
  disabled?: boolean;
}

const ROUTE_OPTIONS = ['Oral (PO)', 'Subcutaneous (SC)', 'Intramuscular (IM)', 'Intravenous (IV)', 'Topical', 'Ophthalmic', 'Otic', 'Intranasal', 'Rectal'];

export default function TreatmentForm({ visitId, patientId, onSubmit, disabled }: TreatmentFormProps) {
  const [category, setCategory] = useState<TreatmentCategory>('medication');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dosage, setDosage] = useState('');
  const [dosageUnit, setDosageUnit] = useState('');
  const [route, setRoute] = useState('');
  const [frequency, setFrequency] = useState('');
  const [durationDays, setDurationDays] = useState('');
  const [notes, setNotes] = useState('');
  const [cost, setCost] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isMed = category === 'medication' || category === 'fluid_therapy';

  const reset = () => {
    setName('');
    setDescription('');
    setDosage('');
    setDosageUnit('');
    setRoute('');
    setFrequency('');
    setDurationDays('');
    setNotes('');
    setCost('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Treatment name is required');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await onSubmit({
        visitId,
        patientId,
        category,
        name: name.trim(),
        description: description || undefined,
        dosage: dosage || undefined,
        dosageUnit: dosageUnit || undefined,
        route: route || undefined,
        frequency: frequency || undefined,
        durationDays: durationDays ? Number(durationDays) : undefined,
        notes: notes || undefined,
        cost: cost ? Number(cost) : undefined,
      });
      reset();
    } catch {
      setError('Failed to add treatment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
      <Grid container spacing={1.5}>
        <Grid item xs={6} sm={3}>
          <TextField
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value as TreatmentCategory)}
            select
            fullWidth
            disabled={disabled}
          >
            {TREATMENT_CATEGORY_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={6} sm={4}>
          <TextField
            label="Treatment Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
            disabled={disabled}
            placeholder="e.g. Carprofen, Spay, CBC"
          />
        </Grid>
        <Grid item xs={12} sm={5}>
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            disabled={disabled}
          />
        </Grid>

        {isMed && (
          <>
            <Grid item xs={4} sm={2}>
              <TextField label="Dosage" value={dosage} onChange={(e) => setDosage(e.target.value)} fullWidth disabled={disabled} placeholder="4.4" />
            </Grid>
            <Grid item xs={4} sm={2}>
              <TextField label="Unit" value={dosageUnit} onChange={(e) => setDosageUnit(e.target.value)} fullWidth disabled={disabled} placeholder="mg/kg" />
            </Grid>
            <Grid item xs={4} sm={3}>
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
            <Grid item xs={6} sm={3}>
              <TextField label="Frequency" value={frequency} onChange={(e) => setFrequency(e.target.value)} fullWidth disabled={disabled} placeholder="BID, SID, q12h" />
            </Grid>
            <Grid item xs={6} sm={2}>
              <TextField label="Duration (days)" type="number" value={durationDays} onChange={(e) => setDurationDays(e.target.value)} fullWidth disabled={disabled} />
            </Grid>
          </>
        )}

        <Grid item xs={8} sm={isMed ? 7 : 9}>
          <TextField label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} fullWidth disabled={disabled} />
        </Grid>
        <Grid item xs={4} sm={2}>
          <TextField label="Cost ($)" type="number" value={cost} onChange={(e) => setCost(e.target.value)} fullWidth disabled={disabled} inputProps={{ step: 0.01 }} />
        </Grid>
        <Grid item xs={12} sm={isMed ? 3 : 1} sx={{ display: 'flex', alignItems: 'flex-end' }}>
          <Button type="submit" variant="contained" fullWidth disabled={submitting || disabled}>
            {submitting ? 'Adding...' : 'Add'}
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}
