'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
} from '@mui/material';
import { Plus, Search, Loader2, Receipt, AlertTriangle } from 'lucide-react';
import { billingApi } from '../../../api/billing';
import {
  Invoice,
  PaginatedResult,
  INVOICE_STATUS_LABELS,
  INVOICE_STATUS_COLORS,
} from '../../../types';

export default function InvoicesPage() {
  const router = useRouter();
  const [result, setResult] = useState<PaginatedResult<Invoice> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await billingApi.getAll({
        page: page + 1,
        limit: rowsPerPage,
        search: search || undefined,
      });
      setResult(data);
    } catch {
      setError('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const fmt = (n: number | string) => `$${Number(n).toFixed(2)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
    >
      {/* Page header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Financial</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Track invoices and manage payments</p>
        </div>
        <button
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/90 px-5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:shadow-lg hover:brightness-110 active:scale-[0.98]"
          onClick={() => router.push('/billing/new')}
        >
          <Plus className="h-4 w-4" />
          New Invoice
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder="Search by invoice # or client name..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          className="flex h-11 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:shadow-sm"
        />
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 p-3.5">
          <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-2 py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Loading invoices...</span>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card">
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Invoice #</TableCell>
                  <TableCell>Client</TableCell>
                  <TableCell>Patient</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell align="right">Paid</TableCell>
                  <TableCell align="right">Balance</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {result?.data.map((inv) => (
                  <TableRow
                    key={inv.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => router.push(`/billing/${inv.id}`)}
                  >
                    <TableCell>
                      <span className="text-sm font-semibold tabular-nums">{inv.invoiceNumber}</span>
                    </TableCell>
                    <TableCell>
                      {inv.client ? `${inv.client.lastName}, ${inv.client.firstName}` : '—'}
                    </TableCell>
                    <TableCell>{inv.patient?.name || '—'}</TableCell>
                    <TableCell>{new Date(inv.issueDate).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      <span className="tabular-nums">{fmt(inv.totalAmount)}</span>
                    </TableCell>
                    <TableCell align="right">
                      <span className="tabular-nums">{fmt(inv.amountPaid)}</span>
                    </TableCell>
                    <TableCell align="right">
                      <span
                        className={`tabular-nums text-sm ${Number(inv.balanceDue) > 0 ? 'font-semibold text-destructive' : ''}`}
                      >
                        {fmt(inv.balanceDue)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={INVOICE_STATUS_LABELS[inv.status]}
                        color={INVOICE_STATUS_COLORS[inv.status]}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {result?.data.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 10 }}>
                      <div className="flex flex-col items-center gap-2">
                        <Receipt className="h-10 w-10 text-muted-foreground/20" />
                        <p className="text-sm font-medium text-muted-foreground/60">No invoices found</p>
                        <p className="text-xs text-muted-foreground/40">Create a new invoice to get started</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {result && (
            <TablePagination
              component="div"
              count={result.total}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
              rowsPerPageOptions={[10, 20, 50]}
            />
          )}
        </div>
      )}
    </motion.div>
  );
}
