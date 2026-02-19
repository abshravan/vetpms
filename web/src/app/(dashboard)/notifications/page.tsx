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
  TablePagination,
  Chip,
} from '@mui/material';
import { RefreshCw, Check, X, Bell, AlertTriangle } from 'lucide-react';
import { notificationsApi } from '../../../api/notifications';
import {
  AppNotification,
  PaginatedResult,
  NOTIFICATION_TYPE_LABELS,
  NOTIFICATION_PRIORITY_COLORS,
} from '../../../types';
import { cn } from '../../../lib/utils';

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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
    >
      {/* Page header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Alerts</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">System alerts and activity updates</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-border/60 px-4 text-sm font-semibold text-muted-foreground shadow-sm transition-all hover:bg-accent hover:text-foreground active:scale-[0.98] disabled:opacity-50"
            onClick={handleGenerate}
            disabled={generating}
          >
            <RefreshCw className={cn('h-4 w-4', generating && 'animate-spin')} />
            {generating ? 'Scanning...' : 'Scan for Alerts'}
          </button>
          <button
            className="inline-flex h-10 items-center rounded-xl border border-border/60 px-4 text-sm font-semibold text-muted-foreground shadow-sm transition-all hover:bg-accent hover:text-foreground active:scale-[0.98]"
            onClick={handleMarkAllRead}
          >
            Mark All Read
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 p-3.5">
          <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
      {genResult && (
        <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-success/20 bg-success/5 p-3.5">
          <Check className="h-4 w-4 shrink-0 text-success" />
          <p className="text-sm text-success">{genResult}</p>
        </div>
      )}

      {/* Filter toggle */}
      <div className="mb-5">
        <div className="inline-flex rounded-xl border border-border/60 bg-muted/50 p-1">
          <button
            onClick={() => { setUnreadOnly(false); setPage(0); }}
            className={cn(
              'rounded-lg px-4 py-1.5 text-xs font-semibold transition-all',
              !unreadOnly ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            All
          </button>
          <button
            onClick={() => { setUnreadOnly(true); setPage(0); }}
            className={cn(
              'rounded-lg px-4 py-1.5 text-xs font-semibold transition-all',
              unreadOnly ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            Unread Only
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card">
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
                      <div className="h-2 w-2 rounded-full bg-primary" />
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
                    <div className="flex items-center gap-1">
                      {!notif.isRead && (
                        <button
                          className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground transition-all hover:bg-accent hover:text-foreground hover:shadow-sm"
                          title="Mark read"
                          aria-label="Mark as read"
                          onClick={() => handleMarkRead(notif.id)}
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive hover:shadow-sm"
                        title="Dismiss"
                        aria-label="Dismiss notification"
                        onClick={() => handleDismiss(notif.id)}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {data?.data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 10 }}>
                    <div className="flex flex-col items-center gap-2">
                      <Bell className="h-10 w-10 text-muted-foreground/20" />
                      <p className="text-sm font-medium text-muted-foreground/60">No notifications</p>
                      <p className="text-xs text-muted-foreground/40">Click &quot;Scan for Alerts&quot; to check for new alerts</p>
                    </div>
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
    </motion.div>
  );
}
