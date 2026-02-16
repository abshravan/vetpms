'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  IconButton,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { ArrowLeft, Loader2, Trash2 } from 'lucide-react';
import { billingApi } from '../../../../api/billing';
import {
  Invoice,
  RecordPaymentData,
  INVOICE_STATUS_LABELS,
  INVOICE_STATUS_COLORS,
  PAYMENT_METHOD_OPTIONS,
  PaymentMethod,
} from '../../../../types';

export default function InvoiceDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState<PaymentMethod>('credit_card');
  const [payNotes, setPayNotes] = useState('');
  const [paying, setPaying] = useState(false);

  const fetchInvoice = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data } = await billingApi.get(id);
      setInvoice(data);
    } catch {
      setError('Failed to load invoice');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchInvoice();
  }, [fetchInvoice]);

  const handlePayment = async () => {
    if (!id || !payAmount) return;
    setPaying(true);
    try {
      const data: RecordPaymentData = {
        amount: Number(payAmount),
        paymentMethod: payMethod,
        notes: payNotes || undefined,
      };
      await billingApi.recordPayment(id, data);
      setPayDialogOpen(false);
      setPayAmount('');
      setPayNotes('');
      fetchInvoice();
    } catch {
      setError('Failed to record payment');
    } finally {
      setPaying(false);
    }
  };

  const handleStatusChange = async (status: 'sent' | 'cancelled') => {
    if (!id) return;
    await billingApi.update(id, { status });
    fetchInvoice();
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!id) return;
    await billingApi.removeItem(id, itemId);
    fetchInvoice();
  };

  const fmt = (n: number | string) => `$${Number(n).toFixed(2)}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (error || !invoice) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-destructive/20 bg-destructive/5 p-6">
        <p className="text-sm text-destructive">{error || 'Invoice not found'}</p>
      </div>
    );
  }

  const canEdit = invoice.status === 'draft' || invoice.status === 'sent';
  const canPay = invoice.status !== 'paid' && invoice.status !== 'cancelled' && invoice.status !== 'refunded';

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-1 mb-2">
        <button onClick={() => router.push('/billing')} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-2xl font-bold tracking-tight flex-grow">
          Invoice {invoice.invoiceNumber}
        </h1>
        <Chip
          label={INVOICE_STATUS_LABELS[invoice.status]}
          color={INVOICE_STATUS_COLORS[invoice.status]}
        />
        {invoice.status === 'draft' && (
          <Button variant="outlined" onClick={() => handleStatusChange('sent')}>
            Mark as Sent
          </Button>
        )}
        {canPay && (
          <Button
            variant="contained"
            color="success"
            onClick={() => { setPayAmount(String(invoice.balanceDue)); setPayDialogOpen(true); }}
          >
            Record Payment
          </Button>
        )}
        {canEdit && (
          <Button variant="outlined" color="error" onClick={() => handleStatusChange('cancelled')}>
            Cancel
          </Button>
        )}
      </div>

      {/* Invoice info */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary">Client</Typography>
            <Typography
              variant="body2"
              sx={{ cursor: 'pointer', color: 'primary.main' }}
              onClick={() => router.push(`/clients/${invoice.clientId}`)}
            >
              {invoice.client ? `${invoice.client.lastName}, ${invoice.client.firstName}` : '—'}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary">Patient</Typography>
            <Typography
              variant="body2"
              sx={invoice.patientId ? { cursor: 'pointer', color: 'primary.main' } : {}}
              onClick={() => invoice.patientId && router.push(`/patients/${invoice.patientId}`)}
            >
              {invoice.patient?.name || '—'}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={2}>
            <Typography variant="caption" color="text.secondary">Issue Date</Typography>
            <Typography variant="body2">{new Date(invoice.issueDate).toLocaleDateString()}</Typography>
          </Grid>
          <Grid item xs={6} sm={2}>
            <Typography variant="caption" color="text.secondary">Due Date</Typography>
            <Typography variant="body2">
              {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '—'}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={2}>
            <Typography variant="caption" color="text.secondary">Payment</Typography>
            <Typography variant="body2">
              {invoice.paymentMethod
                ? PAYMENT_METHOD_OPTIONS.find((o) => o.value === invoice.paymentMethod)?.label
                : '—'}
            </Typography>
          </Grid>
          {invoice.notes && (
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary">Notes</Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{invoice.notes}</Typography>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Line Items */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <h2 className="text-sm font-semibold mb-1">Line Items</h2>
        <Divider sx={{ mb: 2 }} />
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Description</TableCell>
                <TableCell>Category</TableCell>
                <TableCell align="right">Qty</TableCell>
                <TableCell align="right">Unit Price</TableCell>
                <TableCell align="right">Total</TableCell>
                {canEdit && <TableCell width={40} />}
              </TableRow>
            </TableHead>
            <TableBody>
              {invoice.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Typography variant="body2">{item.description}</Typography>
                    {item.notes && <Typography variant="caption" color="text.secondary">{item.notes}</Typography>}
                  </TableCell>
                  <TableCell>{item.category || '—'}</TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell align="right">{fmt(item.unitPrice)}</TableCell>
                  <TableCell align="right">{fmt(item.lineTotal)}</TableCell>
                  {canEdit && (
                    <TableCell>
                      <IconButton size="small" color="error" onClick={() => handleRemoveItem(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Totals */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Box sx={{ width: 280 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2">Subtotal</Typography>
              <Typography variant="body2">{fmt(invoice.subtotal)}</Typography>
            </Box>
            {Number(invoice.taxRate) > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2">Tax ({invoice.taxRate}%)</Typography>
                <Typography variant="body2">{fmt(invoice.taxAmount)}</Typography>
              </Box>
            )}
            {Number(invoice.discountAmount) > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" color="success.main">Discount</Typography>
                <Typography variant="body2" color="success.main">-{fmt(invoice.discountAmount)}</Typography>
              </Box>
            )}
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2" fontWeight={600}>Total</Typography>
              <Typography variant="body2" fontWeight={600}>{fmt(invoice.totalAmount)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2">Amount Paid</Typography>
              <Typography variant="body2">{fmt(invoice.amountPaid)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" fontWeight={700} color={Number(invoice.balanceDue) > 0 ? 'error.main' : 'success.main'}>
                Balance Due
              </Typography>
              <Typography variant="body2" fontWeight={700} color={Number(invoice.balanceDue) > 0 ? 'error.main' : 'success.main'}>
                {fmt(invoice.balanceDue)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Payment Dialog */}
      <Dialog open={payDialogOpen} onClose={() => setPayDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Record Payment</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Amount"
              type="number"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              fullWidth
              inputProps={{ step: 0.01 }}
            />
            <TextField
              label="Payment Method"
              value={payMethod}
              onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
              select
              fullWidth
            >
              {PAYMENT_METHOD_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Notes"
              value={payNotes}
              onChange={(e) => setPayNotes(e.target.value)}
              fullWidth
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPayDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="success" onClick={handlePayment} disabled={paying || !payAmount}>
            {paying ? 'Processing...' : 'Record Payment'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
