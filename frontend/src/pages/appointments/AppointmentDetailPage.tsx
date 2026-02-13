import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';
import { appointmentsApi } from '../../api/appointments';
import {
  Appointment,
  AppointmentStatus,
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_STATUS_COLORS,
  APPOINTMENT_TRANSITIONS,
  APPOINTMENT_TYPE_OPTIONS,
} from '../../types';

const STATUS_BUTTON_LABELS: Partial<Record<AppointmentStatus, string>> = {
  confirmed: 'Confirm',
  checked_in: 'Check In',
  in_progress: 'Start Visit',
  completed: 'Complete',
  cancelled: 'Cancel',
  no_show: 'No Show',
};

export default function AppointmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !appointment) {
    return <Alert severity="error">{error || 'Appointment not found'}</Alert>;
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
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <IconButton onClick={() => navigate('/appointments')}>
          <BackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Appointment — {appointment.patient?.name || 'Unknown'}
        </Typography>
        <Chip
          label={APPOINTMENT_STATUS_LABELS[appointment.status]}
          color={APPOINTMENT_STATUS_COLORS[appointment.status]}
        />
      </Box>

      {/* Status actions */}
      {nextStatuses.length > 0 && (
        <Paper variant="outlined" sx={{ p: 2, mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mr: 1, alignSelf: 'center' }}>
            Actions:
          </Typography>
          {nextStatuses.map((status) => (
            <Button
              key={status}
              variant={status === 'cancelled' || status === 'no_show' ? 'outlined' : 'contained'}
              color={
                status === 'cancelled' || status === 'no_show'
                  ? 'error'
                  : status === 'completed'
                    ? 'success'
                    : 'primary'
              }
              size="small"
              disabled={transitioning}
              onClick={() => handleTransition(status)}
            >
              {STATUS_BUTTON_LABELS[status] || status}
            </Button>
          ))}
        </Paper>
      )}

      {/* Details */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Appointment Details
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary">Start</Typography>
            <Typography variant="body2">{formatDateTime(appointment.startTime)}</Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary">End</Typography>
            <Typography variant="body2">{formatDateTime(appointment.endTime)}</Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary">Type</Typography>
            <Typography variant="body2">{typeLabel}</Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary">Vet</Typography>
            <Typography variant="body2">
              {appointment.vet ? `Dr. ${appointment.vet.lastName}, ${appointment.vet.firstName}` : '—'}
            </Typography>
          </Grid>
          {appointment.reason && (
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary">Reason</Typography>
              <Typography variant="body2">{appointment.reason}</Typography>
            </Grid>
          )}
          {appointment.notes && (
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary">Notes</Typography>
              <Typography variant="body2">{appointment.notes}</Typography>
            </Grid>
          )}
          {appointment.cancellationReason && (
            <Grid item xs={12}>
              <Typography variant="caption" color="error">Cancellation Reason</Typography>
              <Typography variant="body2" color="error">
                {appointment.cancellationReason}
              </Typography>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Patient & Client */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Patient
            </Typography>
            <Divider sx={{ mb: 1 }} />
            {appointment.patient ? (
              <>
                <Typography
                  variant="body2"
                  fontWeight={500}
                  sx={{ cursor: 'pointer', color: 'primary.main', '&:hover': { textDecoration: 'underline' } }}
                  onClick={() => navigate(`/patients/${appointment.patientId}`)}
                >
                  {appointment.patient.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                  {appointment.patient.species}
                  {appointment.patient.breed ? ` — ${appointment.patient.breed}` : ''}
                </Typography>
              </>
            ) : (
              <Typography variant="body2">—</Typography>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Owner
            </Typography>
            <Divider sx={{ mb: 1 }} />
            {appointment.client ? (
              <>
                <Typography
                  variant="body2"
                  fontWeight={500}
                  sx={{ cursor: 'pointer', color: 'primary.main', '&:hover': { textDecoration: 'underline' } }}
                  onClick={() => navigate(`/clients/${appointment.clientId}`)}
                >
                  {appointment.client.lastName}, {appointment.client.firstName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {appointment.client.phone}
                </Typography>
              </>
            ) : (
              <Typography variant="body2">—</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

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
          <Button onClick={() => setCancelDialogOpen(false)}>Back</Button>
          <Button variant="contained" color="error" onClick={handleCancel} disabled={transitioning}>
            {transitioning ? 'Cancelling...' : 'Confirm Cancel'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
