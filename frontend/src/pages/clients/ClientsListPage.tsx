import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  TablePagination,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Pets as PetsIcon,
} from '@mui/icons-material';
import { clientsApi } from '../../api/clients';
import { Client, PaginatedResult } from '../../types';
import ClientFormDialog from './ClientFormDialog';

export default function ClientsListPage() {
  const navigate = useNavigate();
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

  // Debounce search
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
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Clients</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
          New Client
        </Button>
      </Box>

      <TextField
        placeholder="Search by name, email, or phone..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />

      <TableContainer component={Paper} variant="outlined">
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
                <TableCell colSpan={7} align="center">Loading...</TableCell>
              </TableRow>
            ) : result && result.data.length > 0 ? (
              result.data.map((client) => (
                <TableRow
                  key={client.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/clients/${client.id}`)}
                >
                  <TableCell sx={{ fontWeight: 500 }}>
                    {client.lastName}, {client.firstName}
                  </TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{client.phone}</TableCell>
                  <TableCell>{client.city || '—'}</TableCell>
                  <TableCell align="center">
                    <Chip
                      icon={<PetsIcon />}
                      label={client.patients?.length ?? 0}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={client.isActive ? 'Active' : 'Inactive'}
                      size="small"
                      color={client.isActive ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/clients/${client.id}`);
                      }}
                    >
                      <ViewIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  {search ? 'No clients match your search' : 'No clients yet. Create your first client.'}
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

      <ClientFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleCreate}
      />
    </Box>
  );
}
