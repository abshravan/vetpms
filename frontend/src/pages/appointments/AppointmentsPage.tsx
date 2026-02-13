import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButtonGroup,
  ToggleButton,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  ChevronLeft,
  ChevronRight,
  Today as TodayIcon,
} from '@mui/icons-material';
import { appointmentsApi } from '../../api/appointments';
import { usersApi, UserSummary } from '../../api/users';
import {
  Appointment,
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_STATUS_COLORS,
  APPOINTMENT_TYPE_OPTIONS,
} from '../../types';
import AppointmentFormDialog from './AppointmentFormDialog';

type ViewMode = 'day' | 'list';

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(d: Date) {
  return d.toISOString().split('T')[0];
}

export default function AppointmentsPage() {
  const navigate = useNavigate();
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
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Appointments</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
          Book Appointment
        </Button>
      </Box>

      {/* Controls */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={(_, v) => v && setView(v)}
          size="small"
        >
          <ToggleButton value="day">Day</ToggleButton>
          <ToggleButton value="list">List</ToggleButton>
        </ToggleButtonGroup>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconButton size="small" onClick={() => navigateDate(-1)}>
            <ChevronLeft />
          </IconButton>
          <Typography variant="body2" sx={{ minWidth: 200, textAlign: 'center' }}>
            {dateLabel}
          </Typography>
          <IconButton size="small" onClick={() => navigateDate(1)}>
            <ChevronRight />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => setCurrentDate(formatDate(new Date()))}
            title="Today"
          >
            <TodayIcon />
          </IconButton>
        </Box>

        <TextField
          label="Vet"
          value={vetFilter}
          onChange={(e) => setVetFilter(e.target.value)}
          select
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">All Vets</MenuItem>
          {vets.map((v) => (
            <MenuItem key={v.id} value={v.id}>
              Dr. {v.lastName}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* Schedule table */}
      <TableContainer component={Paper} variant="outlined">
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
                <TableCell colSpan={7} align="center">Loading...</TableCell>
              </TableRow>
            ) : appointments.length > 0 ? (
              appointments.map((appt) => (
                <TableRow
                  key={appt.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/appointments/${appt.id}`)}
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
                <TableCell colSpan={7} align="center">
                  No appointments for this {view === 'day' ? 'day' : 'period'}.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <AppointmentFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleCreate}
        defaultDate={currentDate}
      />
    </Box>
  );
}
