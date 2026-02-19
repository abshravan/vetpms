'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { ArrowLeft, Loader2, AlertTriangle, Calendar } from 'lucide-react';
import { appointmentsApi } from '../../../../api/appointments';
import {
  Appointment,
  AppointmentStatus,
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_STATUS_COLORS,
  APPOINTMENT_TRANSITIONS,
  APPOINTMENT_TYPE_OPTIONS,
} from '../../../../types';

const STATUS_BUTTON_LABELS: Partial<Record<AppointmentStatus, string>> = {
  confirmed: 'Confirm',
  checked_in: 'Check In',
  in_progress: 'Start Visit',
  completed: 'Complete',
  cancelled: 'Cancel',
  no_show: 'No Show',
};

export default function AppointmentDetailPage() {
  const params = useParams() as { id: string };
  const id = params.id;
  const router = useRouter();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [transitioning, setTransitioning] = useState(false);

  const fetchAppointment = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data } = await appointmentsApi.get(id);
      setAppointment(data);
    } catch {
      setError('Failed to load appointment');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAppointment();
  }, [fetchAppointment]);

  const handleTransition = async (status: AppointmentStatus) => {
    if (!id) return;
    if (status === 'cancelled') {
      setCancelDialogOpen(true);
      return;
    }
    setTransitioning(true);
    try {
      await appointmentsApi.transition(id, status);
      fetchAppointment();
    } catch {
      setError('Failed to update status');
    } finally {
      setTransitioning(false);
    }
  };

  const handleCancel = async () => {
    if (!id) return;
    setTransitioning(true);
    try {
      await appointmentsApi.transition(id, 'cancelled', cancelReason);
      setCancelDialogOpen(false);
      fetchAppointment();
    } catch {
      setError('Failed to cancel appointment');
    } finally {
      setTransitioning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 p-3.5">
        <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
        <p className="text-sm text-destructive">{error || 'Appointment not found'}</p>
      </div>
    );
  }

  const nextStatuses = APPOINTMENT_TRANSITIONS[appointment.status];
  const typeLabel =
    APPOINTMENT_TYPE_OPTIONS.find((t) => t.value === appointment.type)?.label || appointment.type;

  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
    >
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => router.push('/appointments')}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-all hover:bg-accent hover:text-foreground hover:shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-grow">
          <div className="mb-0.5 flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-primary">APPOINTMENT</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {appointment.patient?.name || 'Unknown'}
          </h1>
        </div>
        <Chip
          label={APPOINTMENT_STATUS_LABELS[appointment.status]}
          color={APPOINTMENT_STATUS_COLORS[appointment.status]}
        />
      </div>

      {/* Status actions */}
      {nextStatuses.length > 0 && (
        <div className="mb-4 rounded-2xl border border-border/60 bg-card p-5 shadow-card">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">Actions:</span>
            {nextStatuses.map((status) => (
              <button
                key={status}
                disabled={transitioning}
                onClick={() => handleTransition(status)}
                className={
                  status === 'cancelled' || status === 'no_show'
                    ? 'inline-flex h-9 items-center gap-2 rounded-xl border border-destructive/30 px-3.5 text-sm font-medium text-destructive transition-all hover:bg-destructive/10 hover:shadow-sm disabled:opacity-50'
                    : status === 'completed'
                      ? 'inline-flex h-9 items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110 active:scale-[0.98] disabled:opacity-50'
                      : 'inline-flex h-9 items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/90 px-4 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:shadow-lg hover:brightness-110 active:scale-[0.98] disabled:opacity-50'
                }
              >
                {STATUS_BUTTON_LABELS[status] || status}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Details */}
      <div className="mb-4 rounded-2xl border border-border/60 bg-card p-5 shadow-card">
        <h2 className="text-lg font-semibold">Appointment Details</h2>
        <div className="my-3 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">Start</span>
            <p className="text-sm">{formatDateTime(appointment.startTime)}</p>
          </div>
          <div>
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">End</span>
            <p className="text-sm">{formatDateTime(appointment.endTime)}</p>
          </div>
          <div>
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">Type</span>
            <p className="text-sm">{typeLabel}</p>
          </div>
          <div>
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">Vet</span>
            <p className="text-sm">
              {appointment.vet ? `Dr. ${appointment.vet.lastName}, ${appointment.vet.firstName}` : '—'}
            </p>
          </div>
          {appointment.reason && (
            <div className="col-span-2 sm:col-span-4">
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">Reason</span>
              <p className="text-sm">{appointment.reason}</p>
            </div>
          )}
          {appointment.notes && (
            <div className="col-span-2 sm:col-span-4">
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">Notes</span>
              <p className="text-sm">{appointment.notes}</p>
            </div>
          )}
          {appointment.cancellationReason && (
            <div className="col-span-2 sm:col-span-4">
              <span className="text-[11px] font-medium uppercase tracking-wider text-destructive">Cancellation Reason</span>
              <p className="text-sm text-destructive">
                {appointment.cancellationReason}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Patient & Client */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-card">
          <h2 className="text-lg font-semibold">Patient</h2>
          <div className="my-3 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          {appointment.patient ? (
            <>
              <p
                className="cursor-pointer text-sm font-medium text-primary hover:underline"
                onClick={() => router.push(`/patients/${appointment.patientId}`)}
              >
                {appointment.patient.name}
              </p>
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
                {appointment.patient.species}
                {appointment.patient.breed ? ` — ${appointment.patient.breed}` : ''}
              </span>
            </>
          ) : (
            <p className="text-sm">—</p>
          )}
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-card">
          <h2 className="text-lg font-semibold">Owner</h2>
          <div className="my-3 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          {appointment.client ? (
            <>
              <p
                className="cursor-pointer text-sm font-medium text-primary hover:underline"
                onClick={() => router.push(`/clients/${appointment.clientId}`)}
              >
                {appointment.client.lastName}, {appointment.client.firstName}
              </p>
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
                {appointment.client.phone}
              </span>
            </>
          ) : (
            <p className="text-sm">—</p>
          )}
        </div>
      </div>

      {/* Cancel dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Cancel Appointment</DialogTitle>
        <DialogContent>
          <TextField
            label="Reason for cancellation"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            fullWidth
            multiline
            rows={3}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <button
            onClick={() => setCancelDialogOpen(false)}
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-border/60 px-3.5 text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-foreground hover:shadow-sm"
          >
            Back
          </button>
          <button
            onClick={handleCancel}
            disabled={transitioning}
            className="inline-flex h-9 items-center gap-2 rounded-xl bg-destructive px-4 text-sm font-semibold text-destructive-foreground shadow-md transition-all hover:shadow-lg hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
          >
            {transitioning ? 'Cancelling...' : 'Confirm Cancel'}
          </button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
}
