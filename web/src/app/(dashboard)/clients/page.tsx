'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TablePagination,
} from '@mui/material';
import { Plus, Search, Eye, Users, PawPrint, Loader2 } from 'lucide-react';
import { clientsApi } from '../../../api/clients';
import { Client, PaginatedResult } from '../../../types';
import ClientFormDialog from '../../../components/clients/ClientFormDialog';
import { cn } from '../../../lib/utils';

export default function ClientsListPage() {
  const router = useRouter();
  const [result, setResult] = useState<PaginatedResult<Client> | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await clientsApi.list({
        page: page + 1,
        limit: rowsPerPage,
        search: search || undefined,
      });
      setResult(data);
    } catch {
      // Error handled silently for now
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
      fetchClients();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreate = async (data: Parameters<typeof clientsApi.create>[0]) => {
    await clientsApi.create(data);
    fetchClients();
  };

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
            <Users className="h-5 w-5 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Client Management</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Manage client accounts and contact information</p>
        </div>
        <button
          onClick={() => setDialogOpen(true)}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/90 px-5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:shadow-lg hover:brightness-110 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          New Client
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder="Search by name, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex h-11 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:shadow-sm"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>City</TableCell>
                <TableCell align="center">Patients</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && !result ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <span className="text-sm">Loading clients...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : result && result.data.length > 0 ? (
                result.data.map((client) => (
                  <TableRow
                    key={client.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => router.push(`/clients/${client.id}`)}
                  >
                    <TableCell sx={{ fontWeight: 500 }}>
                      {client.lastName}, {client.firstName}
                    </TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client.phone}</TableCell>
                    <TableCell>{client.city || '—'}</TableCell>
                    <TableCell align="center">
                      <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/30 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                        <PawPrint className="h-3 w-3" />
                        {client.patients?.length ?? 0}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={client.isActive ? 'Active' : 'Inactive'}
                        size="small"
                        color={client.isActive ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <button
                        className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground transition-all hover:bg-accent hover:text-foreground hover:shadow-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/clients/${client.id}`);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 10 }}>
                    <div className="flex flex-col items-center gap-2">
                      <Users className="h-10 w-10 text-muted-foreground/20" />
                      <p className="text-sm font-medium text-muted-foreground/60">
                        {search ? 'No clients match your search' : 'No clients yet'}
                      </p>
                      <p className="text-xs text-muted-foreground/40">
                        {search ? 'Try a different search term' : 'Create your first client to get started'}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {result && (
            <TablePagination
              component="div"
              count={result.total}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[10, 20, 50]}
            />
          )}
        </TableContainer>
      </div>

      <ClientFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleCreate}
      />
    </motion.div>
  );
}
