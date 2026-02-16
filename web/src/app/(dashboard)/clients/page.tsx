'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
    <div>
      {/* Page header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage client accounts and contact information</p>
        </div>
        <button
          onClick={() => setDialogOpen(true)}
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          New Client
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder="Search by name, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex h-10 w-full rounded-lg border border-input bg-background pl-10 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
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
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
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
                      <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-xs font-medium text-muted-foreground">
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
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
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
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <div className="flex flex-col items-center gap-2">
                      <Users className="h-8 w-8 text-muted-foreground/40" />
                      <p className="text-sm text-muted-foreground">
                        {search ? 'No clients match your search' : 'No clients yet. Create your first client.'}
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
    </div>
  );
}
