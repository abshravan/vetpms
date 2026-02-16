'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Paper,
  Grid,
  TextField,
  IconButton,
  Alert,
  Divider,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { ArrowBack as BackIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Plus } from 'lucide-react';
import { billingApi } from '../../../../api/billing';
import { clientsApi } from '../../../../api/clients';
import { patientsApi } from '../../../../api/patients';
import { Client, Patient, CreateInvoiceItemData } from '../../../../types';

interface LineItem extends CreateInvoiceItemData {
  lineTotal: number;
}

export default function NewInvoicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [clients, setClients] = useState<Client[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [clientId, setClientId] = useState(searchParams.get('clientId') || '');
  const [patientId, setPatientId] = useState(searchParams.get('patientId') || '');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [taxRate, setTaxRate] = useState('0');
  const [discountAmount, setDiscountAmount] = useState('0');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<LineItem[]>([{ description: '', unitPrice: 0, quantity: 1, lineTotal: 0 }]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    clientsApi.list({ limit: 200 }).then(({ data }) => setClients(data.data));
  }, []);

  useEffect(() => {
    if (clientId) {
      patientsApi.list({ clientId, limit: 100 }).then(({ data }) => setPatients(data.data));
    } else {
      setPatients([]);
    }
  }, [clientId]);

  const updateItem = (index: number, field: keyof LineItem, value: string | number) => {
    setItems((prev) => {
      const next = [...prev];
      const item = { ...next[index], [field]: value };
      item.lineTotal = Number(((item.quantity ?? 1) * (item.unitPrice ?? 0)).toFixed(2));
      next[index] = item;
      return next;
    });
  };

  const addItem = () => {
    setItems((prev) => [...prev, { description: '', unitPrice: 0, quantity: 1, lineTotal: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
  const tax = Number(taxRate) || 0;
  const taxAmt = Number((subtotal * tax / 100).toFixed(2));
  const disc = Number(discountAmount) || 0;
  const total = Number((subtotal + taxAmt - disc).toFixed(2));

  const fmt = (n: number) => `$${n.toFixed(2)}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) { setError('Client is required'); return; }
    if (items.length === 0 || !items[0].description) { setError('At least one line item is required'); return; }

    setSubmitting(true);
    setError('');
    try {
      const { data } = await billingApi.create({
        clientId,
        patientId: patientId || undefined,
        issueDate,
        dueDate: dueDate || undefined,
        taxRate: tax,
        discountAmount: disc,
        notes: notes || undefined,
        items: items.filter((i) => i.description).map(({ lineTotal, ...rest }) => rest),
      });
      router.push(`/billing/${data.id}`);
    } catch {
      setError('Failed to create invoice');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <IconButton onClick={() => router.push('/billing')}>
          <BackIcon />
        </IconButton>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Invoice</h1>
          <p className="mt-1 text-sm text-muted-foreground">Create a new invoice for a client</p>
        </div>
      </div>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <form onSubmit={handleSubmit}>
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Client"
                value={clientId}
                onChange={(e) => { setClientId(e.target.value); setPatientId(''); }}
                select
                fullWidth
                required
              >
                {clients.map((c) => (
                  <MenuItem key={c.id} value={c.id}>{c.lastName}, {c.firstName}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Patient"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                select
                fullWidth
                disabled={!clientId}
              >
                <MenuItem value="">— None —</MenuItem>
                {patients.map((p) => (
                  <MenuItem key={p.id} value={p.id}>{p.name} ({p.species})</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6} sm={2}>
              <TextField
                label="Issue Date"
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6} sm={2}>
              <TextField
                label="Due Date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Line Items */}
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">Line Items</span>
            <button
              type="button"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98]"
              onClick={addItem}
            >
              <Plus className="h-3.5 w-3.5" />
              Add Item
            </button>
          </div>
          <Divider sx={{ mb: 2 }} />
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Description</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="right" width={80}>Qty</TableCell>
                  <TableCell align="right" width={120}>Unit Price</TableCell>
                  <TableCell align="right" width={100}>Total</TableCell>
                  <TableCell width={40} />
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <TextField
                        value={item.description}
                        onChange={(e) => updateItem(i, 'description', e.target.value)}
                        size="small"
                        fullWidth
                        placeholder="Service or product"
                        required
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        value={item.category || ''}
                        onChange={(e) => updateItem(i, 'category', e.target.value)}
                        size="small"
                        fullWidth
                        placeholder="exam, lab, rx..."
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        value={item.quantity}
                        onChange={(e) => updateItem(i, 'quantity', Number(e.target.value))}
                        type="number"
                        size="small"
                        inputProps={{ min: 1 }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        value={item.unitPrice}
                        onChange={(e) => updateItem(i, 'unitPrice', Number(e.target.value))}
                        type="number"
                        size="small"
                        inputProps={{ step: 0.01, min: 0 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <span className="text-sm">{fmt(item.lineTotal)}</span>
                    </TableCell>
                    <TableCell>
                      {items.length > 1 && (
                        <IconButton size="small" color="error" onClick={() => removeItem(i)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Totals */}
          <div className="flex justify-end mt-4">
            <div className="w-[300px]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Subtotal</span>
                <span className="text-sm">{fmt(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between mb-2 gap-2">
                <TextField
                  label="Tax %"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  type="number"
                  size="small"
                  sx={{ width: 100 }}
                  inputProps={{ step: 0.01, min: 0 }}
                />
                <span className="text-sm">{fmt(taxAmt)}</span>
              </div>
              <div className="flex items-center justify-between mb-2 gap-2">
                <TextField
                  label="Discount $"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                  type="number"
                  size="small"
                  sx={{ width: 100 }}
                  inputProps={{ step: 0.01, min: 0 }}
                />
                <span className="text-sm text-green-600">-{fmt(disc)}</span>
              </div>
              <Divider sx={{ my: 1 }} />
              <div className="flex items-center justify-between">
                <span className="text-base font-bold">Total</span>
                <span className="text-base font-bold">{fmt(total)}</span>
              </div>
            </div>
          </div>
        </Paper>

        {/* Notes */}
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <TextField
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            fullWidth
            multiline
            rows={2}
          />
        </Paper>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="inline-flex h-9 items-center rounded-lg border border-border px-4 text-sm font-medium shadow-sm transition-all hover:bg-accent active:scale-[0.98]"
            onClick={() => router.push('/billing')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50"
            disabled={submitting}
          >
            {submitting ? 'Creating...' : 'Create Invoice'}
          </button>
        </div>
      </form>
    </div>
  );
}
