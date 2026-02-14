'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { inventoryApi } from '../../api/inventory';
import {
  ITEM_CATEGORY_OPTIONS,
  ITEM_UNIT_OPTIONS,
} from '../../types';

export default function InventoryFormPage() {
  const { id } = useParams() as { id: string };
  const isEdit = !!id;
  const router = useRouter();

  const [form, setForm] = useState({
    sku: '',
    name: '',
    description: '',
    category: 'medication',
    unit: 'unit',
    manufacturer: '',
    supplier: '',
    costPrice: '',
    sellingPrice: '',
    quantityOnHand: '0',
    reorderLevel: '10',
    reorderQuantity: '50',
    lotNumber: '',
    expirationDate: '',
    location: '',
    requiresPrescription: false,
    isControlledSubstance: false,
    notes: '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit) {
      inventoryApi.get(id).then(({ data }) => {
        setForm({
          sku: data.sku,
          name: data.name,
          description: data.description || '',
          category: data.category,
          unit: data.unit,
          manufacturer: data.manufacturer || '',
          supplier: data.supplier || '',
          costPrice: String(data.costPrice),
          sellingPrice: String(data.sellingPrice),
          quantityOnHand: String(data.quantityOnHand),
          reorderLevel: String(data.reorderLevel),
          reorderQuantity: String(data.reorderQuantity),
          lotNumber: data.lotNumber || '',
          expirationDate: data.expirationDate ? data.expirationDate.slice(0, 10) : '',
          location: data.location || '',
          requiresPrescription: data.requiresPrescription,
          isControlledSubstance: data.isControlledSubstance,
          notes: data.notes || '',
        });
      }).catch(() => setError('Item not found'));
    }
  }, [id, isEdit]);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload: any = {
      sku: form.sku,
      name: form.name,
      description: form.description || undefined,
      category: form.category,
      unit: form.unit,
      manufacturer: form.manufacturer || undefined,
      supplier: form.supplier || undefined,
      costPrice: parseFloat(form.costPrice) || 0,
      sellingPrice: parseFloat(form.sellingPrice) || 0,
      reorderLevel: parseInt(form.reorderLevel, 10) || 10,
      reorderQuantity: parseInt(form.reorderQuantity, 10) || 50,
      lotNumber: form.lotNumber || undefined,
      expirationDate: form.expirationDate || undefined,
      location: form.location || undefined,
      requiresPrescription: form.requiresPrescription,
      isControlledSubstance: form.isControlledSubstance,
      notes: form.notes || undefined,
    };

    if (!isEdit) {
      payload.quantityOnHand = parseInt(form.quantityOnHand, 10) || 0;
    }

    try {
      if (isEdit) {
        await inventoryApi.update(id, payload);
        router.push(`/pharmacy/${id}`);
      } else {
        const { data } = await inventoryApi.create(payload);
        router.push(`/pharmacy/${data.id}`);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save item');
      setSaving(false);
    }
  };

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => router.push(isEdit ? `/pharmacy/${id}` : '/pharmacy')} sx={{ mb: 2 }}>
        Back
      </Button>
      <Typography variant="h6" gutterBottom>
        {isEdit ? 'Edit Inventory Item' : 'Add Inventory Item'}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper variant="outlined" sx={{ p: 2 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField label="SKU" fullWidth required value={form.sku} onChange={set('sku')} disabled={isEdit} />
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField label="Name" fullWidth required value={form.name} onChange={set('name')} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="Category" select fullWidth value={form.category} onChange={set('category')}>
                {ITEM_CATEGORY_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="Unit" select fullWidth value={form.unit} onChange={set('unit')}>
                {ITEM_UNIT_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="Location (shelf/bin)" fullWidth value={form.location} onChange={set('location')} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Manufacturer" fullWidth value={form.manufacturer} onChange={set('manufacturer')} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Supplier" fullWidth value={form.supplier} onChange={set('supplier')} />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField label="Cost Price" type="number" fullWidth value={form.costPrice} onChange={set('costPrice')} inputProps={{ step: '0.01', min: '0' }} />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField label="Selling Price" type="number" fullWidth value={form.sellingPrice} onChange={set('sellingPrice')} inputProps={{ step: '0.01', min: '0' }} />
            </Grid>
            {!isEdit && (
              <Grid item xs={6} sm={3}>
                <TextField label="Initial Qty" type="number" fullWidth value={form.quantityOnHand} onChange={set('quantityOnHand')} inputProps={{ min: '0' }} />
              </Grid>
            )}
            <Grid item xs={6} sm={3}>
              <TextField label="Reorder Level" type="number" fullWidth value={form.reorderLevel} onChange={set('reorderLevel')} inputProps={{ min: '0' }} />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField label="Reorder Qty" type="number" fullWidth value={form.reorderQuantity} onChange={set('reorderQuantity')} inputProps={{ min: '0' }} />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField label="Lot Number" fullWidth value={form.lotNumber} onChange={set('lotNumber')} />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField label="Expiration Date" type="date" fullWidth value={form.expirationDate} onChange={set('expirationDate')} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Description" fullWidth multiline rows={2} value={form.description} onChange={set('description')} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Notes" fullWidth multiline rows={2} value={form.notes} onChange={set('notes')} />
            </Grid>
            <Grid item xs={6} sm={4}>
              <FormControlLabel
                control={<Checkbox checked={form.requiresPrescription} onChange={set('requiresPrescription')} />}
                label="Requires Prescription"
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <FormControlLabel
                control={<Checkbox checked={form.isControlledSubstance} onChange={set('isControlledSubstance')} />}
                label="Controlled Substance"
              />
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end" gap={1}>
                <Button onClick={() => router.push(isEdit ? `/pharmacy/${id}` : '/pharmacy')}>Cancel</Button>
                <Button type="submit" variant="contained" disabled={saving}>
                  {saving ? 'Saving…' : isEdit ? 'Update Item' : 'Create Item'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
}
