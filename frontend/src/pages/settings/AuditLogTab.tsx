import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  TextField,
  Stack,
  Typography,
  Chip,
  Alert,
} from '@mui/material';
import { auditApi } from '../../api/notifications';
import { AuditLogEntry, PaginatedResult } from '../../types';

export default function AuditLogTab() {
  const [data, setData] = useState<PaginatedResult<AuditLogEntry> | null>(null);
  const [page, setPage] = useState(0);
  const [resource, setResource] = useState('');
  const [action, setAction] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setError('');
    auditApi
      .list({
        page: page + 1,
        limit: 30,
        resource: resource || undefined,
        action: action || undefined,
      })
      .then(({ data: d }) => setData(d))
      .catch(() => setError('Failed to load audit logs'));
  }, [page, resource, action]);

  useEffect(() => { load(); }, [load]);

  const methodColor = (act: string): 'success' | 'info' | 'warning' | 'error' | 'default' => {
    if (act.startsWith('POST')) return 'success';
    if (act.startsWith('PATCH') || act.startsWith('PUT')) return 'warning';
    if (act.startsWith('DELETE')) return 'error';
    return 'default';
  };

  return (
    <Box>
      <Stack direction="row" spacing={2} mb={2} alignItems="center">
        <TextField
          size="small"
          placeholder="Filter by resource…"
          value={resource}
          onChange={(e) => { setResource(e.target.value); setPage(0); }}
          sx={{ minWidth: 200 }}
        />
        <TextField
          size="small"
          placeholder="Filter by action…"
          value={action}
          onChange={(e) => { setAction(e.target.value); setPage(0); }}
          sx={{ minWidth: 200 }}
        />
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Time</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Resource</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.data.map((log) => (
              <TableRow key={log.id}>
                <TableCell sx={{ whiteSpace: 'nowrap', fontSize: 12 }}>
                  {new Date(log.createdAt).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Chip label={log.action} size="small" color={methodColor(log.action)} sx={{ fontFamily: 'monospace', fontSize: 11 }} />
                </TableCell>
                <TableCell>
                  {log.resource}
                  {log.resourceId && (
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                      ({log.resourceId.slice(0, 8)}…)
                    </Typography>
                  )}
                </TableCell>
                <TableCell>{log.userEmail || '—'}</TableCell>
                <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', fontSize: 12 }}>
                  {log.details ? JSON.stringify(log.details).slice(0, 120) : '—'}
                </TableCell>
              </TableRow>
            ))}
            {data?.data.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">No audit logs found.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {data && data.total > 30 && (
          <TablePagination
            component="div"
            count={data.total}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={30}
            rowsPerPageOptions={[30]}
          />
        )}
      </TableContainer>
    </Box>
  );
}
