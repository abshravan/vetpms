'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  TextField,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  MenuItem,
} from '@mui/material';
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Loader2,
} from 'lucide-react';
import { appointmentsApi } from '../../../api/appointments';
import { usersApi, UserSummary } from '../../../api/users';
import {
  Appointment,
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_STATUS_COLORS,
  APPOINTMENT_TYPE_OPTIONS,
} from '../../../types';
import AppointmentFormDialog from '../../../components/appointments/AppointmentFormDialog';
import { cn } from '../../../lib/utils';

type ViewMode = 'day' | 'list';

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(d: Date) {
  return d.toISOString().split('T')[0];
}

export default function AppointmentsPage() {
  const router = useRouter();
  const [view, setView] = useState<ViewMode>('day');
  const [currentDate, setCurrentDate] = useState(formatDate(new Date()));
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [vets, setVets] = useState<UserSummary[]>([]);
  const [vetFilter, setVetFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    usersApi.list().then(({ data }) => {
      setVets(data.filter((u) => u.role === 'vet' || u.role === 'admin'));
    });
  }, []);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      if (view === 'day') {
        const { data } = await appointmentsApi.getDay(
          currentDate,
          vetFilter || undefined,
        );
        setAppointments(data);
      } else {
        const { data } = await appointmentsApi.list({
          dateFrom: currentDate,
          vetId: vetFilter || undefined,
          limit: 50,
        });
        setAppointments(data.data);
      }
    } catch {
      // silenced
    } finally {
      setLoading(false);
    }
  }, [view, currentDate, vetFilter]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const navigateDate = (offset: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + offset);
    setCurrentDate(formatDate(d));
  };

  const handleCreate = async (data: Parameters<typeof appointmentsApi.create>[0]) => {
    await appointmentsApi.create(data);
    fetchAppointments();
  };

  const dateLabel = new Date(currentDate + 'T00:00:00').toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const typeLabel = (type: string) =>
    APPOINTMENT_TYPE_OPTIONS.find((t) => t.value === type)?.label || type;

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Appointments</h1>
          <p className="mt-1 text-sm text-muted-foreground">Schedule and manage patient appointments</p>
        </div>
        <button
          onClick={() => setDialogOpen(true)}
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Book Appointment
        </button>
      </div>

      {/* Controls bar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {/* View toggle */}
        <div className="inline-flex rounded-lg border border-border bg-muted/50 p-0.5">
          {(['day', 'list'] as ViewMode[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-all',
                view === v
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {v}
            </button>
          ))}
        </div>

        {/* Date nav */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigateDate(-1)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[200px] text-center text-sm font-medium">{dateLabel}</span>
          <button
            onClick={() => navigateDate(1)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCurrentDate(formatDate(new Date()))}
            title="Today"
            className="ml-1 inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <CalendarDays className="h-3.5 w-3.5" />
            Today
          </button>
        </div>

        {/* Vet filter */}
        <TextField
          label="Vet"
          value={vetFilter}
          onChange={(e) => setVetFilter(e.target.value)}
          select
          size="small"
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">All Vets</MenuItem>
          {vets.map((v) => (
            <MenuItem key={v.id} value={v.id}>
              Dr. {v.lastName}
            </MenuItem>
          ))}
        </TextField>
      </div>

      {/* Schedule table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Time</TableCell>
                <TableCell>Patient</TableCell>
                <TableCell>Owner</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Vet</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Reason</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Loading appointments...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : appointments.length > 0 ? (
                appointments.map((appt) => (
                  <TableRow
                    key={appt.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => router.push(`/appointments/${appt.id}`)}
                  >
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      {formatTime(appt.startTime)} – {formatTime(appt.endTime)}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>
                      {appt.patient?.name || '—'}
                    </TableCell>
                    <TableCell>
                      {appt.client
                        ? `${appt.client.lastName}, ${appt.client.firstName}`
                        : '—'}
                    </TableCell>
                    <TableCell>{typeLabel(appt.type)}</TableCell>
                    <TableCell>
                      {appt.vet ? `Dr. ${appt.vet.lastName}` : '—'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={APPOINTMENT_STATUS_LABELS[appt.status]}
                        size="small"
                        color={APPOINTMENT_STATUS_COLORS[appt.status]}
                      />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {appt.reason || '—'}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <div className="flex flex-col items-center gap-2">
                      <CalendarDays className="h-8 w-8 text-muted-foreground/40" />
                      <p className="text-sm text-muted-foreground">
                        No appointments for this {view === 'day' ? 'day' : 'period'}.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      <AppointmentFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleCreate}
        defaultDate={currentDate}
      />
    </div>
  );
}
