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
} from '@mui/material';
import { Client, CreateClientData } from '../../types';

interface ClientFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateClientData) => Promise<void>;
  client?: Client | null;
}

const emptyForm: CreateClientData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  alternatePhone: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  notes: '',
};

export default function ClientFormDialog({ open, onClose, onSubmit, client }: ClientFormDialogProps) {
  const [form, setForm] = useState<CreateClientData>(emptyForm);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (client) {
      setForm({
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email,
        phone: client.phone,
        alternatePhone: client.alternatePhone || '',
        address: client.address || '',
        city: client.city || '',
        state: client.state || '',
        zipCode: client.zipCode || '',
        notes: client.notes || '',
      });
    } else {
      setForm(emptyForm);
    }
    setError('');
  }, [client, open]);

  const handleChange = (field: keyof CreateClientData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.phone) {
      setError('First name, last name, email, and phone are required');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await onSubmit(form);
      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message :
        typeof err === 'object' && err !== null && 'response' in err
          ? ((err as { response: { data: { message: string } } }).response?.data?.message || 'Failed to save client')
          : 'Failed to save client';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{client ? 'Edit Client' : 'New Client'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={6}>
              <TextField label="First Name" value={form.firstName} onChange={handleChange('firstName')} required fullWidth autoFocus />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Last Name" value={form.lastName} onChange={handleChange('lastName')} required fullWidth />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Email" type="email" value={form.email} onChange={handleChange('email')} required fullWidth />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Phone" value={form.phone} onChange={handleChange('phone')} required fullWidth />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Alternate Phone" value={form.alternatePhone} onChange={handleChange('alternatePhone')} fullWidth />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Address" value={form.address} onChange={handleChange('address')} fullWidth />
            </Grid>
            <Grid item xs={4}>
              <TextField label="City" value={form.city} onChange={handleChange('city')} fullWidth />
            </Grid>
            <Grid item xs={4}>
              <TextField label="State" value={form.state} onChange={handleChange('state')} fullWidth />
            </Grid>
            <Grid item xs={4}>
              <TextField label="ZIP Code" value={form.zipCode} onChange={handleChange('zipCode')} fullWidth />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Notes" value={form.notes} onChange={handleChange('notes')} fullWidth multiline rows={2} />
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
