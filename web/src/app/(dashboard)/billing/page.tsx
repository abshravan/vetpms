'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  TextField,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
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
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Invoices</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => router.push('/billing/new')}
        >
          New Invoice
        </Button>
      </Box>

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
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
      ) : (
        <Paper variant="outlined">
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
                      <Typography variant="body2" fontWeight={600}>{inv.invoiceNumber}</Typography>
                    </TableCell>
                    <TableCell>
                      {inv.client ? `${inv.client.lastName}, ${inv.client.firstName}` : '—'}
                    </TableCell>
                    <TableCell>{inv.patient?.name || '—'}</TableCell>
                    <TableCell>{new Date(inv.issueDate).toLocaleDateString()}</TableCell>
                    <TableCell align="right">{fmt(inv.totalAmount)}</TableCell>
                    <TableCell align="right">{fmt(inv.amountPaid)}</TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        fontWeight={Number(inv.balanceDue) > 0 ? 600 : 400}
                        color={Number(inv.balanceDue) > 0 ? 'error.main' : 'text.primary'}
                      >
                        {fmt(inv.balanceDue)}
                      </Typography>
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
                      <Typography variant="body2" color="text.secondary">No invoices found.</Typography>
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
        </Paper>
      )}
    </Box>
  );
}
