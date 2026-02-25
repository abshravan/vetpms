'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
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
  Clock,
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

type ViewMode = 'day' | 'week' | 'list';

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(d: Date) {
  return d.toISOString().split('T')[0];
}

function getWeekDays(dateStr: string): Date[] {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() - ((day + 6) % 7)); // Mon = 0
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const dd = new Date(monday);
    dd.setDate(monday.getDate() + i);
    days.push(dd);
  }
  return days;
}

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

const STATUS_DOT_COLORS: Record<string, string> = {
  scheduled: 'bg-slate-400',
  confirmed: 'bg-blue-400',
  checked_in: 'bg-amber-400',
  in_progress: 'bg-purple-400',
  completed: 'bg-emerald-400',
  cancelled: 'bg-red-400',
  no_show: 'bg-red-400',
};

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
      } else if (view === 'week') {
        // Fetch all appointments for the week
        const weekDays = getWeekDays(currentDate);
        const promises = weekDays.map((d) =>
          appointmentsApi.getDay(formatDate(d), vetFilter || undefined),
        );
        const results = await Promise.all(promises);
        setAppointments(results.flatMap((r) => r.data));
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
    if (view === 'week') {
      d.setDate(d.getDate() + offset * 7);
    } else {
      d.setDate(d.getDate() + offset);
    }
    setCurrentDate(formatDate(d));
  };

  const handleCreate = async (data: Parameters<typeof appointmentsApi.create>[0]) => {
    await appointmentsApi.create(data);
    fetchAppointments();
  };

  const dateLabel = useMemo(() => {
    if (view === 'week') {
      const days = getWeekDays(currentDate);
      const start = days[0].toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      const end = days[6].toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
      return `${start} — ${end}`;
    }
    return new Date(currentDate + 'T00:00:00').toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [currentDate, view]);

  const typeLabel = (type: string) =>
    APPOINTMENT_TYPE_OPTIONS.find((t) => t.value === type)?.label || type;

  // Week view data
  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);
  const todayStr = formatDate(new Date());

  // Group appointments by day for week view
  const apptsByDay = useMemo(() => {
    const map: Record<string, Appointment[]> = {};
    appointments.forEach((a) => {
      const day = a.startTime.slice(0, 10);
      if (!map[day]) map[day] = [];
      map[day].push(a);
    });
    return map;
  }, [appointments]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
    >
      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Scheduling</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Schedule and manage patient appointments</p>
        </div>
        <button
          onClick={() => setDialogOpen(true)}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/90 px-5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:shadow-lg hover:brightness-110 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Book Appointment
        </button>
      </div>

      {/* Controls bar */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        {/* View toggle */}
        <div className="inline-flex rounded-xl border border-border/60 bg-muted/50 p-1">
          {(['day', 'week', 'list'] as ViewMode[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                'rounded-lg px-3.5 py-1.5 text-xs font-semibold capitalize transition-all',
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
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-all hover:bg-accent hover:text-foreground hover:shadow-sm"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[200px] text-center text-sm font-medium">{dateLabel}</span>
          <button
            onClick={() => navigateDate(1)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-all hover:bg-accent hover:text-foreground hover:shadow-sm"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCurrentDate(formatDate(new Date()))}
            title="Today"
            className="ml-1 inline-flex h-9 items-center gap-1.5 rounded-xl border border-border/60 px-3 text-xs font-semibold text-muted-foreground transition-all hover:bg-accent hover:text-foreground hover:shadow-sm"
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

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-sm">Loading appointments...</span>
        </div>
      )}

      {/* Week calendar view */}
      {!loading && view === 'week' && (
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card">
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Day headers */}
              <div className="grid grid-cols-[64px_repeat(7,1fr)] border-b border-border/60">
                <div className="border-r border-border/40 p-2" />
                {weekDays.map((d) => {
                  const dayStr = formatDate(d);
                  const isToday = dayStr === todayStr;
                  return (
                    <div
                      key={dayStr}
                      className={cn(
                        'border-r border-border/40 p-2 text-center last:border-r-0',
                        isToday && 'bg-primary/5',
                      )}
                    >
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {d.toLocaleDateString(undefined, { weekday: 'short' })}
                      </p>
                      <p
                        className={cn(
                          'mt-0.5 text-lg font-bold leading-none',
                          isToday ? 'text-primary' : 'text-foreground',
                        )}
                      >
                        {d.getDate()}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Time grid */}
              {HOURS.map((hour) => (
                <div key={hour} className="grid grid-cols-[64px_repeat(7,1fr)] border-b border-border/30 last:border-b-0">
                  <div className="flex items-start justify-end border-r border-border/40 px-2 py-1">
                    <span className="text-[10px] font-medium tabular-nums text-muted-foreground/60">
                      {hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
                    </span>
                  </div>
                  {weekDays.map((d) => {
                    const dayStr = formatDate(d);
                    const isToday = dayStr === todayStr;
                    const dayAppts = (apptsByDay[dayStr] || []).filter((a) => {
                      const h = new Date(a.startTime).getHours();
                      return h === hour;
                    });

                    return (
                      <div
                        key={dayStr}
                        className={cn(
                          'min-h-[56px] border-r border-border/30 p-0.5 last:border-r-0',
                          isToday && 'bg-primary/[0.02]',
                        )}
                      >
                        {dayAppts.map((appt) => (
                          <button
                            key={appt.id}
                            onClick={() => router.push(`/appointments/${appt.id}`)}
                            className={cn(
                              'mb-0.5 w-full rounded-lg border px-1.5 py-1 text-left transition-all hover:shadow-sm',
                              appt.status === 'cancelled' || appt.status === 'no_show'
                                ? 'border-red-200 bg-red-50 dark:border-red-900/30 dark:bg-red-950/20'
                                : appt.status === 'completed'
                                  ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/30 dark:bg-emerald-950/20'
                                  : 'border-primary/20 bg-primary/5 dark:border-primary/20 dark:bg-primary/10',
                            )}
                          >
                            <div className="flex items-center gap-1">
                              <div className={cn('h-1.5 w-1.5 shrink-0 rounded-full', STATUS_DOT_COLORS[appt.status])} />
                              <span className="truncate text-[10px] font-semibold">
                                {appt.patient?.name}
                              </span>
                            </div>
                            <p className="truncate text-[9px] text-muted-foreground">
                              {formatTime(appt.startTime)} · {typeLabel(appt.type)}
                            </p>
                          </button>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3 border-t border-border/60 px-4 py-2">
            {Object.entries(STATUS_DOT_COLORS).map(([status, color]) => (
              <div key={status} className="flex items-center gap-1.5">
                <div className={cn('h-2 w-2 rounded-full', color)} />
                <span className="text-[10px] capitalize text-muted-foreground">
                  {status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Day table view */}
      {!loading && view === 'day' && (
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card">
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
                {appointments.length > 0 ? (
                  appointments.map((appt) => (
                    <TableRow
                      key={appt.id}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => router.push(`/appointments/${appt.id}`)}
                    >
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        <span className="text-xs font-semibold tabular-nums">
                          {formatTime(appt.startTime)} – {formatTime(appt.endTime)}
                        </span>
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
                    <TableCell colSpan={7} align="center" sx={{ py: 10 }}>
                      <div className="flex flex-col items-center gap-2">
                        <CalendarDays className="h-10 w-10 text-muted-foreground/20" />
                        <p className="text-sm font-medium text-muted-foreground/60">
                          No appointments for this day
                        </p>
                        <p className="text-xs text-muted-foreground/40">Your schedule is clear</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}

      {/* List view */}
      {!loading && view === 'list' && (
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card">
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date & Time</TableCell>
                  <TableCell>Patient</TableCell>
                  <TableCell>Owner</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Vet</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Reason</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {appointments.length > 0 ? (
                  appointments.map((appt) => (
                    <TableRow
                      key={appt.id}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => router.push(`/appointments/${appt.id}`)}
                    >
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3 text-muted-foreground/50" />
                          <div>
                            <p className="text-xs font-semibold tabular-nums">
                              {formatTime(appt.startTime)} – {formatTime(appt.endTime)}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {new Date(appt.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </p>
                          </div>
                        </div>
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
                    <TableCell colSpan={7} align="center" sx={{ py: 10 }}>
                      <div className="flex flex-col items-center gap-2">
                        <CalendarDays className="h-10 w-10 text-muted-foreground/20" />
                        <p className="text-sm font-medium text-muted-foreground/60">
                          No upcoming appointments
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}

      <AppointmentFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleCreate}
        defaultDate={currentDate}
      />
    </motion.div>
  );
}
