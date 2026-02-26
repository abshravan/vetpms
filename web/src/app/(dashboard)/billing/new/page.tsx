'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { ArrowLeft, Trash2, Plus, AlertTriangle, FileText } from 'lucide-react';
import { billingApi } from '../../../../api/billing';
import { clientsApi } from '../../../../api/clients';
import { patientsApi } from '../../../../api/patients';
import toast from 'react-hot-toast';
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
      toast.success('Invoice created');
      router.push(`/billing/${data.id}`);
    } catch {
      toast.error('Failed to create invoice');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
    >
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => router.push('/billing')}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-all hover:bg-accent hover:text-foreground hover:shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <div className="mb-0.5 flex items-center gap-2">
            <FileText className="h-3.5 w-3.5 text-primary" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-primary">NEW INVOICE</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Create Invoice</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Create a new invoice for a client</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 p-3.5">
          <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4 rounded-2xl border border-border/60 bg-card p-5 shadow-card">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
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
            <TextField
              label="Issue Date"
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Due Date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </div>
        </div>

        {/* Line Items */}
        <div className="mb-4 rounded-2xl border border-border/60 bg-card p-5 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Line Items</h2>
            <button
              type="button"
              className="inline-flex h-9 items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/90 px-4 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:shadow-lg hover:brightness-110 active:scale-[0.98]"
              onClick={addItem}
            >
              <Plus className="h-3.5 w-3.5" />
              Add Item
            </button>
          </div>
          <div className="mb-4 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
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
                        <button
                          type="button"
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => removeItem(i)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
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
                <span className="text-sm text-emerald-600">-{fmt(disc)}</span>
              </div>
              <div className="my-2 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
              <div className="flex items-center justify-between">
                <span className="text-base font-bold">Total</span>
                <span className="text-base font-bold">{fmt(total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="mb-4 rounded-2xl border border-border/60 bg-card p-5 shadow-card">
          <TextField
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            fullWidth
            multiline
            rows={2}
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-border/60 px-3.5 text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-foreground hover:shadow-sm"
            onClick={() => router.push('/billing')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex h-9 items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/90 px-4 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:shadow-lg hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
            disabled={submitting}
          >
            {submitting ? 'Creating...' : 'Create Invoice'}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
