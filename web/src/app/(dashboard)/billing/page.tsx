'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Paper,
  Chip,
  TextField,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
} from '@mui/material';
import { Plus, Loader2 } from 'lucide-react';
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
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
          <p className="mt-1 text-sm text-muted-foreground">Track invoices and manage payments</p>
        </div>
        <button
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98]"
          onClick={() => router.push('/billing/new')}
        >
          <Plus className="h-4 w-4" />
          New Invoice
        </button>
      </div>

      <TextField
        placeholder="Search by invoice # or client name..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(0); }}
        fullWidth
        size="small"
        sx={{ mb: 2 }}
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <div className="flex items-center justify-center gap-2 text-muted-foreground py-8">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading...</span>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
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
                      <span className="text-sm font-semibold">{inv.invoiceNumber}</span>
                    </TableCell>
                    <TableCell>
                      {inv.client ? `${inv.client.lastName}, ${inv.client.firstName}` : '—'}
                    </TableCell>
                    <TableCell>{inv.patient?.name || '—'}</TableCell>
                    <TableCell>{new Date(inv.issueDate).toLocaleDateString()}</TableCell>
                    <TableCell align="right">{fmt(inv.totalAmount)}</TableCell>
                    <TableCell align="right">{fmt(inv.amountPaid)}</TableCell>
                    <TableCell align="right">
                      <span
                        className={`text-sm ${Number(inv.balanceDue) > 0 ? 'font-semibold text-red-600' : ''}`}
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
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <span className="text-sm text-muted-foreground">No invoices found.</span>
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
    </div>
  );
}
