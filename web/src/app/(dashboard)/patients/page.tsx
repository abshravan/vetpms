'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TablePagination,
  MenuItem,
} from '@mui/material';
import { Search, PawPrint, Loader2 } from 'lucide-react';
import { patientsApi } from '../../../api/patients';
import { Patient, PaginatedResult, Species, SPECIES_OPTIONS } from '../../../types';

export default function PatientsListPage() {
  const router = useRouter();
  const [result, setResult] = useState<PaginatedResult<Patient> | null>(null);
  const [search, setSearch] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState<Species | ''>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [loading, setLoading] = useState(true);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await patientsApi.list({
        page: page + 1,
        limit: rowsPerPage,
        search: search || undefined,
        species: speciesFilter || undefined,
      });
      setResult(data);
    } catch {
      // Error silenced
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, speciesFilter]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
      fetchPatients();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, speciesFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const formatAge = (dob: string | null) => {
    if (!dob) return '—';
    const birth = new Date(dob);
    const now = new Date();
    const years = now.getFullYear() - birth.getFullYear();
    if (years > 0) return `${years}y`;
    const months = now.getMonth() - birth.getMonth();
    return `${months >= 0 ? months : 12 + months}m`;
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Patients</h1>
        <p className="mt-1 text-sm text-muted-foreground">Browse and manage patient records</p>
      </div>

      <div className="flex gap-4 mb-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, owner, or microchip..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-input bg-background pl-10 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <TextField
          label="Species"
          value={speciesFilter}
          onChange={(e) => setSpeciesFilter(e.target.value as Species | '')}
          select
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">All Species</MenuItem>
          {SPECIES_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
          ))}
        </TextField>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Species</TableCell>
                <TableCell>Breed</TableCell>
                <TableCell>Owner</TableCell>
                <TableCell>Age</TableCell>
                <TableCell>Weight</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && !result ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Loading patients...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : result && result.data.length > 0 ? (
                result.data.map((patient) => (
                  <TableRow
                    key={patient.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => router.push(`/patients/${patient.id}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <PawPrint className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">{patient.name}</span>
                      </div>
                    </TableCell>
                    <TableCell sx={{ textTransform: 'capitalize' }}>{patient.species}</TableCell>
                    <TableCell>{patient.breed || '—'}</TableCell>
                    <TableCell>
                      {patient.client
                        ? `${patient.client.lastName}, ${patient.client.firstName}`
                        : '—'}
                    </TableCell>
                    <TableCell>{formatAge(patient.dateOfBirth)}</TableCell>
                    <TableCell>
                      {patient.weight ? `${patient.weight} ${patient.weightUnit || 'kg'}` : '—'}
                    </TableCell>
                    <TableCell>
                      {patient.isDeceased ? (
                        <Chip label="Deceased" size="small" />
                      ) : (
                        <Chip
                          label={patient.isActive ? 'Active' : 'Inactive'}
                          size="small"
                          color={patient.isActive ? 'success' : 'default'}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <div className="flex flex-col items-center gap-2">
                      <PawPrint className="h-8 w-8 text-muted-foreground/40" />
                      <p className="text-sm text-muted-foreground">
                        {search || speciesFilter ? 'No patients match your filters' : 'No patients registered yet.'}
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
    </div>
  );
}
