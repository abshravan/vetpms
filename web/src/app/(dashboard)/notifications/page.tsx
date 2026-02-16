'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Stack,
  Alert,
  FormControlLabel,
  Switch,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { RefreshCw } from 'lucide-react';
import { notificationsApi } from '../../../api/notifications';
import {
  AppNotification,
  PaginatedResult,
  NOTIFICATION_TYPE_LABELS,
  NOTIFICATION_PRIORITY_COLORS,
} from '../../../types';

export default function NotificationsPage() {
  const router = useRouter();
  const [data, setData] = useState<PaginatedResult<AppNotification> | null>(null);
  const [page, setPage] = useState(0);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);
  const [genResult, setGenResult] = useState('');

  const load = useCallback(() => {
    setError('');
    notificationsApi
      .list({ unreadOnly, page: page + 1, limit: 25 })
      .then(({ data: d }) => setData(d))
      .catch(() => setError('Failed to load notifications'));
  }, [page, unreadOnly]);

  useEffect(() => { load(); }, [load]);

  const handleGenerate = async () => {
    setGenerating(true);
    setGenResult('');
    try {
      const { data: result } = await notificationsApi.generate();
      setGenResult(`Generated ${result.created} new alert(s).`);
      load();
    } catch {
      setError('Failed to generate alerts');
    } finally {
      setGenerating(false);
    }
  };

  const handleMarkAllRead = async () => {
    await notificationsApi.markAllRead();
    load();
  };

  const handleMarkRead = async (id: string) => {
    await notificationsApi.markRead(id);
    load();
  };

  const handleDismiss = async (id: string) => {
    await notificationsApi.dismiss(id);
    load();
  };

  const navigateToRef = (notif: AppNotification) => {
    if (!notif.referenceId || !notif.referenceType) return;
    const routes: Record<string, string> = {
      patient: `/patients/${notif.referenceId}`,
      inventory: `/pharmacy/${notif.referenceId}`,
      invoice: `/billing/${notif.referenceId}`,
      appointment: `/appointments/${notif.referenceId}`,
    };
    const route = routes[notif.referenceType];
    if (route) {
      handleMarkRead(notif.id);
      router.push(route);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">System alerts and activity updates</p>
        </div>
        <Stack direction="row" spacing={1}>
          <button
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-border px-4 text-sm font-medium shadow-sm transition-all hover:bg-accent active:scale-[0.98] disabled:opacity-50"
            onClick={handleGenerate}
            disabled={generating}
          >
            <RefreshCw className={`h-4 w-4 ${generating ? 'animate-spin' : ''}`} />
            {generating ? 'Scanning...' : 'Scan for Alerts'}
          </button>
          <button
            className="inline-flex h-9 items-center rounded-lg border border-border px-4 text-sm font-medium shadow-sm transition-all hover:bg-accent active:scale-[0.98]"
            onClick={handleMarkAllRead}
          >
            Mark All Read
          </button>
        </Stack>
      </div>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {genResult && <Alert severity="success" sx={{ mb: 2 }}>{genResult}</Alert>}

      <div className="mb-4">
        <FormControlLabel
          control={<Switch checked={unreadOnly} onChange={(e) => { setUnreadOnly(e.target.checked); setPage(0); }} />}
          label="Unread only"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 40 }}></TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Message</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.data.map((notif) => (
                <TableRow
                  key={notif.id}
                  sx={{
                    bgcolor: notif.isRead ? 'inherit' : 'action.hover',
                    cursor: notif.referenceId ? 'pointer' : 'default',
                  }}
                  onClick={() => navigateToRef(notif)}
                >
                  <TableCell>
                    {!notif.isRead && (
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={notif.priority}
                      size="small"
                      color={NOTIFICATION_PRIORITY_COLORS[notif.priority]}
                    />
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    {NOTIFICATION_TYPE_LABELS[notif.type]}
                  </TableCell>
                  <TableCell sx={{ fontWeight: notif.isRead ? 400 : 600 }}>
                    {notif.title}
                  </TableCell>
                  <TableCell>{notif.message}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    {new Date(notif.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Stack direction="row" spacing={0.5}>
                      {!notif.isRead && (
                        <IconButton size="small" title="Mark read" onClick={() => handleMarkRead(notif.id)}>
                          <CheckIcon fontSize="small" />
                        </IconButton>
                      )}
                      <IconButton size="small" title="Dismiss" onClick={() => handleDismiss(notif.id)}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {data?.data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <span className="text-muted-foreground">
                      No notifications. Click &quot;Scan for Alerts&quot; to check for new alerts.
                    </span>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {data && data.total > 25 && (
            <TablePagination
              component="div"
              count={data.total}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              rowsPerPage={25}
              rowsPerPageOptions={[25]}
            />
          )}
        </TableContainer>
      </div>
    </div>
  );
}
