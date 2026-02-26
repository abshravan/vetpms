'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Chip,
  IconButton,
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
import { ArrowLeft, Loader2, AlertTriangle, Trash2, Receipt, Printer, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { billingApi } from '../../../../api/billing';
import ConfirmDialog from '../../../../components/ConfirmDialog';
import { CardSkeleton } from '../../../../components/Skeleton';
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
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [confirmRemoveItem, setConfirmRemoveItem] = useState<string | null>(null);

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
      toast.success('Payment recorded successfully');
      fetchInvoice();
    } catch {
      toast.error('Failed to record payment');
    } finally {
      setPaying(false);
    }
  };

  const handleStatusChange = async (status: 'sent' | 'cancelled') => {
    if (!id) return;
    try {
      await billingApi.update(id, { status });
      toast.success(status === 'cancelled' ? 'Invoice cancelled' : 'Invoice marked as sent');
      setConfirmCancel(false);
      fetchInvoice();
    } catch {
      toast.error('Failed to update invoice');
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!id) return;
    try {
      await billingApi.removeItem(id, itemId);
      toast.success('Line item removed');
      setConfirmRemoveItem(null);
      fetchInvoice();
    } catch {
      toast.error('Failed to remove item');
    }
  };

  const fmt = (n: number | string) => `$${Number(n).toFixed(2)}`;

  if (loading) {
    return <CardSkeleton lines={8} />;
  }
  if (error || !invoice) {
    return (
      <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 p-3.5">
        <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
        <p className="text-sm text-destructive">{error || 'Invoice not found'}</p>
      </div>
    );
  }

  const canEdit = invoice.status === 'draft' || invoice.status === 'sent';
  const canPay = invoice.status !== 'paid' && invoice.status !== 'cancelled' && invoice.status !== 'refunded';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
    >
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <button
          onClick={() => router.push('/billing')}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-all hover:bg-accent hover:text-foreground hover:shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-grow">
          <div className="mb-0.5 flex items-center gap-2">
            <Receipt className="h-3.5 w-3.5 text-primary" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-primary">INVOICE</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {invoice.invoiceNumber}
          </h1>
        </div>
        <Chip
          label={INVOICE_STATUS_LABELS[invoice.status]}
          color={INVOICE_STATUS_COLORS[invoice.status]}
        />
        {invoice.status === 'draft' && (
          <button
            onClick={() => handleStatusChange('sent')}
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-border/60 px-3.5 text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-foreground hover:shadow-sm"
          >
            Mark as Sent
          </button>
        )}
        {canPay && (
          <button
            onClick={() => { setPayAmount(String(invoice.balanceDue)); setPayDialogOpen(true); }}
            className="inline-flex h-9 items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110 active:scale-[0.98]"
          >
            Record Payment
          </button>
        )}
        {canEdit && (
          <button
            onClick={() => setConfirmCancel(true)}
            className="no-print inline-flex h-9 items-center gap-2 rounded-xl border border-destructive/30 px-3.5 text-sm font-medium text-destructive transition-all hover:bg-destructive/10 hover:shadow-sm"
          >
            Cancel
          </button>
        )}
        <button
          onClick={() => window.print()}
          className="no-print inline-flex h-9 items-center gap-2 rounded-xl border border-border/60 px-3.5 text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-foreground hover:shadow-sm"
          title="Print invoice"
        >
          <Printer className="h-4 w-4" />
          Print
        </button>
        <button
          onClick={() => { document.title = `Invoice_${invoice.invoiceNumber}`; window.print(); document.title = 'VetPMS — Veterinary Practice Management'; }}
          className="no-print inline-flex h-9 items-center gap-2 rounded-xl border border-border/60 px-3.5 text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-foreground hover:shadow-sm"
          title="Save as PDF (use browser Print → Save as PDF)"
        >
          <Download className="h-4 w-4" />
          PDF
        </button>
      </div>

      {/* Print header — only visible when printing */}
      <div className="print-header mb-6 hidden">
        <div className="mb-4 flex items-center justify-between border-b-2 border-black pb-3">
          <div>
            <h2 className="text-xl font-bold">Springfield Veterinary Clinic</h2>
            <p className="text-sm text-gray-600">1200 Medical Center Drive, Springfield, IL 62701</p>
            <p className="text-sm text-gray-600">(555) 200-3000 · info@springfieldvet.com</p>
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-bold">INVOICE</h1>
            <p className="text-lg font-semibold">{invoice.invoiceNumber}</p>
          </div>
        </div>
      </div>

      {/* Invoice info */}
      <div className="mb-4 rounded-2xl border border-border/60 bg-card p-5 shadow-card">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          <div>
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">Client</span>
            <p
              className="cursor-pointer text-sm text-primary hover:underline"
              onClick={() => router.push(`/clients/${invoice.clientId}`)}
            >
              {invoice.client ? `${invoice.client.lastName}, ${invoice.client.firstName}` : '—'}
            </p>
          </div>
          <div>
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">Patient</span>
            <p
              className={invoice.patientId ? 'cursor-pointer text-sm text-primary hover:underline' : 'text-sm'}
              onClick={() => invoice.patientId && router.push(`/patients/${invoice.patientId}`)}
            >
              {invoice.patient?.name || '—'}
            </p>
          </div>
          <div>
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">Issue Date</span>
            <p className="text-sm">{new Date(invoice.issueDate).toLocaleDateString()}</p>
          </div>
          <div>
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">Due Date</span>
            <p className="text-sm">
              {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '—'}
            </p>
          </div>
          <div>
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">Payment</span>
            <p className="text-sm">
              {invoice.paymentMethod
                ? PAYMENT_METHOD_OPTIONS.find((o) => o.value === invoice.paymentMethod)?.label
                : '—'}
            </p>
          </div>
          {invoice.notes && (
            <div className="col-span-2 sm:col-span-5">
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">Notes</span>
              <p className="whitespace-pre-wrap text-sm">{invoice.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Line Items */}
      <div className="mb-4 rounded-2xl border border-border/60 bg-card p-5 shadow-card">
        <h2 className="text-lg font-semibold">Line Items</h2>
        <div className="my-3 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
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
                    <span className="text-sm">{item.description}</span>
                    {item.notes && <span className="block text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">{item.notes}</span>}
                  </TableCell>
                  <TableCell>{item.category || '—'}</TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell align="right">{fmt(item.unitPrice)}</TableCell>
                  <TableCell align="right">{fmt(item.lineTotal)}</TableCell>
                  {canEdit && (
                    <TableCell>
                      <IconButton size="small" color="error" onClick={() => setConfirmRemoveItem(item.id)}>
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
        <div className="mt-4 flex justify-end">
          <div className="w-[280px]">
            <div className="mb-1 flex justify-between">
              <span className="text-sm">Subtotal</span>
              <span className="text-sm">{fmt(invoice.subtotal)}</span>
            </div>
            {Number(invoice.taxRate) > 0 && (
              <div className="mb-1 flex justify-between">
                <span className="text-sm">Tax ({invoice.taxRate}%)</span>
                <span className="text-sm">{fmt(invoice.taxAmount)}</span>
              </div>
            )}
            {Number(invoice.discountAmount) > 0 && (
              <div className="mb-1 flex justify-between">
                <span className="text-sm text-emerald-600">Discount</span>
                <span className="text-sm text-emerald-600">-{fmt(invoice.discountAmount)}</span>
              </div>
            )}
            <div className="my-2 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            <div className="mb-1 flex justify-between">
              <span className="text-sm font-semibold">Total</span>
              <span className="text-sm font-semibold">{fmt(invoice.totalAmount)}</span>
            </div>
            <div className="mb-1 flex justify-between">
              <span className="text-sm">Amount Paid</span>
              <span className="text-sm">{fmt(invoice.amountPaid)}</span>
            </div>
            <div className="flex justify-between">
              <span className={`text-sm font-bold ${Number(invoice.balanceDue) > 0 ? 'text-destructive' : 'text-emerald-600'}`}>
                Balance Due
              </span>
              <span className={`text-sm font-bold ${Number(invoice.balanceDue) > 0 ? 'text-destructive' : 'text-emerald-600'}`}>
                {fmt(invoice.balanceDue)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={payDialogOpen} onClose={() => setPayDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Record Payment</DialogTitle>
        <DialogContent>
          <div className="flex flex-col gap-4 pt-2">
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
          </div>
        </DialogContent>
        <DialogActions>
          <button
            onClick={() => setPayDialogOpen(false)}
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-border/60 px-3.5 text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-foreground hover:shadow-sm"
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            disabled={paying || !payAmount}
            className="inline-flex h-9 items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
          >
            {paying ? 'Processing...' : 'Record Payment'}
          </button>
        </DialogActions>
      </Dialog>

      {/* Cancel invoice confirmation */}
      <ConfirmDialog
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        onConfirm={() => handleStatusChange('cancelled')}
        title="Cancel Invoice"
        message="Are you sure you want to cancel this invoice? This action cannot be undone."
        confirmLabel="Cancel Invoice"
        variant="danger"
      />

      {/* Remove item confirmation */}
      <ConfirmDialog
        open={confirmRemoveItem !== null}
        onClose={() => setConfirmRemoveItem(null)}
        onConfirm={() => confirmRemoveItem && handleRemoveItem(confirmRemoveItem)}
        title="Remove Line Item"
        message="Are you sure you want to remove this line item from the invoice?"
        confirmLabel="Remove Item"
        variant="danger"
      />
    </motion.div>
  );
}
