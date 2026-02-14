'use client';

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
  Autocomplete,
} from '@mui/material';
import { CreateAppointmentData, APPOINTMENT_TYPE_OPTIONS, AppointmentType } from '../../types';
import { clientsApi } from '../../api/clients';
import { usersApi, UserSummary } from '../../api/users';

interface ClientOption {
  id: string;
  label: string;
  patients: { id: string; name: string; species: string }[];
}

interface AppointmentFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAppointmentData) => Promise<void>;
  defaultDate?: string;
}

export default function AppointmentFormDialog({
  open,
  onClose,
  onSubmit,
  defaultDate,
}: AppointmentFormDialogProps) {
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [vets, setVets] = useState<UserSummary[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClientOption | null>(null);
  const [form, setForm] = useState({
    patientId: '',
    vetId: '',
    date: defaultDate || new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '09:30',
    type: 'checkup' as AppointmentType,
    reason: '',
    notes: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      // Fetch clients and vets
      clientsApi.list({ limit: 100 }).then(({ data }) => {
        setClients(
          data.data.map((c) => ({
            id: c.id,
            label: `${c.lastName}, ${c.firstName}`,
            patients: c.patients?.map((p) => ({ id: p.id, name: p.name, species: p.species })) || [],
          })),
        );
      });
      usersApi.list().then(({ data }) => {
        setVets(data.filter((u) => u.role === 'vet' || u.role === 'admin'));
      });
      setSelectedClient(null);
      setForm({
        patientId: '',
        vetId: '',
        date: defaultDate || new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '09:30',
        type: 'checkup',
        reason: '',
        notes: '',
      });
      setError('');
    }
  }, [open, defaultDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !form.patientId || !form.vetId) {
      setError('Client, patient, and vet are required');
      return;
    }

    const startTime = new Date(`${form.date}T${form.startTime}:00`).toISOString();
    const endTime = new Date(`${form.date}T${form.endTime}:00`).toISOString();

    setSubmitting(true);
    setError('');
    try {
      await onSubmit({
        clientId: selectedClient.id,
        patientId: form.patientId,
        vetId: form.vetId,
        startTime,
        endTime,
        type: form.type,
        reason: form.reason || undefined,
        notes: form.notes || undefined,
      });
      onClose();
    } catch (err: unknown) {
      const message =
        typeof err === 'object' && err !== null && 'response' in err
          ? ((err as { response: { data: { message: string } } }).response?.data?.message ||
              'Failed to create appointment')
          : 'Failed to create appointment';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Book Appointment</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <Autocomplete
                options={clients}
                getOptionLabel={(opt) => opt.label}
                value={selectedClient}
                onChange={(_, val) => {
                  setSelectedClient(val);
                  setForm((f) => ({ ...f, patientId: '' }));
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Client (Owner)" required />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Patient"
                value={form.patientId}
                onChange={(e) => setForm((f) => ({ ...f, patientId: e.target.value }))}
                select
                required
                fullWidth
                disabled={!selectedClient}
                helperText={!selectedClient ? 'Select a client first' : undefined}
              >
                {(selectedClient?.patients || []).map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name} ({p.species})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Veterinarian"
                value={form.vetId}
                onChange={(e) => setForm((f) => ({ ...f, vetId: e.target.value }))}
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
            <Grid item xs={4}>
              <TextField
                label="Date"
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Start"
                type="time"
                value={form.startTime}
                onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 300 }}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="End"
                type="time"
                value={form.endTime}
                onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 300 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Type"
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as AppointmentType }))}
                select
                fullWidth
              >
                {APPOINTMENT_TYPE_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Reason for Visit"
                value={form.reason}
                onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Notes"
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
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
            {submitting ? 'Booking...' : 'Book Appointment'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
