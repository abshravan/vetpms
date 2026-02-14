'use client';

import { useState, useEffect } from 'react';
import {
  Grid,
  TextField,
  Button,
  Alert,
  Typography,
  Divider,
} from '@mui/material';
import { settingsApi } from '../../api/settings';

export default function ClinicSettingsTab() {
  const [form, setForm] = useState({
    clinicName: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    timezone: '',
    currency: 'USD',
    defaultTaxRate: '0',
    appointmentSlotMinutes: '30',
    businessHoursStart: '08:00',
    businessHoursEnd: '18:00',
    closedDays: '',
    invoicePaymentTermsDays: '30',
    invoiceFooter: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    settingsApi.get().then(({ data }) => {
      setForm({
        clinicName: data.clinicName || '',
        phone: data.phone || '',
        email: data.email || '',
        website: data.website || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        zipCode: data.zipCode || '',
        country: data.country || '',
        timezone: data.timezone || '',
        currency: data.currency || 'USD',
        defaultTaxRate: String(data.defaultTaxRate),
        appointmentSlotMinutes: String(data.appointmentSlotMinutes),
        businessHoursStart: data.businessHoursStart || '08:00',
        businessHoursEnd: data.businessHoursEnd || '18:00',
        closedDays: data.closedDays || '',
        invoicePaymentTermsDays: String(data.invoicePaymentTermsDays),
        invoiceFooter: data.invoiceFooter || '',
      });
    }).catch(() => setError('Failed to load settings'));
  }, []);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await settingsApi.update({
        clinicName: form.clinicName,
        phone: form.phone || undefined,
        email: form.email || undefined,
        website: form.website || undefined,
        address: form.address || undefined,
        city: form.city || undefined,
        state: form.state || undefined,
        zipCode: form.zipCode || undefined,
        country: form.country || undefined,
        timezone: form.timezone || undefined,
        currency: form.currency,
        defaultTaxRate: parseFloat(form.defaultTaxRate) || 0,
        appointmentSlotMinutes: parseInt(form.appointmentSlotMinutes, 10) || 30,
        businessHoursStart: form.businessHoursStart,
        businessHoursEnd: form.businessHoursEnd,
        closedDays: form.closedDays || undefined,
        invoicePaymentTermsDays: parseInt(form.invoicePaymentTermsDays, 10) || 30,
        invoiceFooter: form.invoiceFooter || undefined,
      });
      setSuccess('Settings saved successfully.');
    } catch {
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Typography variant="subtitle2" gutterBottom>Clinic Information</Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <TextField label="Clinic Name" fullWidth value={form.clinicName} onChange={set('clinicName')} />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField label="Phone" fullWidth value={form.phone} onChange={set('phone')} />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField label="Email" fullWidth value={form.email} onChange={set('email')} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="Website" fullWidth value={form.website} onChange={set('website')} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="Address" fullWidth value={form.address} onChange={set('address')} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <TextField label="City" fullWidth value={form.city} onChange={set('city')} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <TextField label="State" fullWidth value={form.state} onChange={set('state')} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <TextField label="ZIP Code" fullWidth value={form.zipCode} onChange={set('zipCode')} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <TextField label="Country" fullWidth value={form.country} onChange={set('country')} />
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle2" gutterBottom>Business Hours & Scheduling</Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <TextField label="Opens" type="time" fullWidth value={form.businessHoursStart} onChange={set('businessHoursStart')} InputLabelProps={{ shrink: true }} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <TextField label="Closes" type="time" fullWidth value={form.businessHoursEnd} onChange={set('businessHoursEnd')} InputLabelProps={{ shrink: true }} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <TextField label="Appt Slot (min)" type="number" fullWidth value={form.appointmentSlotMinutes} onChange={set('appointmentSlotMinutes')} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <TextField label="Timezone" fullWidth value={form.timezone} onChange={set('timezone')} placeholder="America/New_York" />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="Closed Days (comma-separated)" fullWidth value={form.closedDays} onChange={set('closedDays')} placeholder="Sunday, Saturday" />
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle2" gutterBottom>Billing Defaults</Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <TextField label="Currency" fullWidth value={form.currency} onChange={set('currency')} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <TextField label="Default Tax Rate (%)" type="number" fullWidth value={form.defaultTaxRate} onChange={set('defaultTaxRate')} inputProps={{ step: '0.01', min: '0', max: '100' }} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <TextField label="Payment Terms (days)" type="number" fullWidth value={form.invoicePaymentTermsDays} onChange={set('invoicePaymentTermsDays')} />
        </Grid>
        <Grid item xs={12}>
          <TextField label="Invoice Footer Text" fullWidth multiline rows={2} value={form.invoiceFooter} onChange={set('invoiceFooter')} />
        </Grid>
      </Grid>

      <Button variant="contained" onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save Settings'}
      </Button>
    </>
  );
}
