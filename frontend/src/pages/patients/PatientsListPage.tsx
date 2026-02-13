import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TablePagination,
  InputAdornment,
  MenuItem,
} from '@mui/material';
import {
  Search as SearchIcon,
  Pets as PetsIcon,
} from '@mui/icons-material';
import { patientsApi } from '../../api/patients';
import { Patient, PaginatedResult, Species, SPECIES_OPTIONS } from '../../types';

export default function PatientsListPage() {
  const navigate = useNavigate();
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
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>Patients</Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          placeholder="Search by name, owner, or microchip..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flexGrow: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
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
      </Box>

      <TableContainer component={Paper} variant="outlined">
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
                <TableCell colSpan={7} align="center">Loading...</TableCell>
              </TableRow>
            ) : result && result.data.length > 0 ? (
              result.data.map((patient) => (
                <TableRow
                  key={patient.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/patients/${patient.id}`)}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <PetsIcon fontSize="small" color="primary" />
                      <Typography variant="body2" fontWeight={500}>{patient.name}</Typography>
                    </Box>
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
                  {search || speciesFilter ? 'No patients match your filters' : 'No patients registered yet.'}
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
    </Box>
  );
}
