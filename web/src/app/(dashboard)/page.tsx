'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Typography,
  Paper,
  Grid,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
} from '@mui/material';
import {
  People as PeopleIcon,
  Pets as PetsIcon,
  CalendarMonth as CalendarIcon,
  MedicalServices as VisitIcon,
  Receipt as InvoiceIcon,
  AttachMoney as MoneyIcon,
  Vaccines as VaccineIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { reportsApi, DashboardStats } from '../../api/reports';

const STATUS_COLORS: Record<string, 'default' | 'warning' | 'success' | 'info' | 'error'> = {
  open: 'default',
  in_progress: 'warning',
  completed: 'success',
  scheduled: 'default',
  confirmed: 'info',
  checked_in: 'warning',
};

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    reportsApi
      .getDashboardStats()
      .then(({ data }) => setStats(data))
      .catch(() => setError('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>;
  }
  if (error || !stats) {
    return <Alert severity="error">{error || 'Failed to load'}</Alert>;
  }

  const fmt = (n: number) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const statCards = [
    { label: 'Clients', value: stats.totalClients, icon: <PeopleIcon />, color: '#2e7d32', link: '/clients' },
    { label: 'Patients', value: stats.totalPatients, icon: <PetsIcon />, color: '#1565c0', link: '/patients' },
    { label: "Today's Appts", value: stats.todayAppointments, icon: <CalendarIcon />, color: '#e65100', link: '/appointments' },
    { label: 'Open Visits', value: stats.openVisits, icon: <VisitIcon />, color: '#6a1b9a' },
    { label: 'Pending Invoices', value: stats.pendingInvoices, icon: <InvoiceIcon />, color: '#c62828', link: '/billing' },
    { label: 'Outstanding', value: fmt(stats.outstandingBalance), icon: <MoneyIcon />, color: '#c62828', link: '/billing' },
    { label: 'Vaccines Due (30d)', value: stats.upcomingVaccinations, icon: <VaccineIcon />, color: '#f57f17' },
    { label: 'Overdue Care', value: stats.overduePreventiveCare, icon: <WarningIcon />, color: '#d32f2f' },
  ];

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Dashboard</Typography>

      {/* Stat Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {statCards.map((card) => (
          <Grid item xs={6} sm={3} key={card.label}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                cursor: card.link ? 'pointer' : 'default',
                '&:hover': card.link ? { bgcolor: 'action.hover' } : {},
              }}
              onClick={() => card.link && router.push(card.link)}
            >
              <Box sx={{ color: card.color, display: 'flex' }}>{card.icon}</Box>
              <Box>
                <Typography variant="h5" fontWeight={700} color={card.color}>
                  {card.value}
                </Typography>
                <Typography variant="caption" color="text.secondary">{card.label}</Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        {/* Today's Schedule */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Today's Schedule</Typography>
            <Divider sx={{ mb: 1 }} />
            {stats.todaySchedule.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Time</TableCell>
                      <TableCell>Patient</TableCell>
                      <TableCell>Client</TableCell>
                      <TableCell>Vet</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.todaySchedule.map((appt) => (
                      <TableRow
                        key={appt.id}
                        hover
                        sx={{ cursor: 'pointer' }}
                        onClick={() => router.push(`/appointments/${appt.id}`)}
                      >
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          {new Date(appt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </TableCell>
                        <TableCell>{appt.patientName}</TableCell>
                        <TableCell>{appt.clientName}</TableCell>
                        <TableCell>{appt.vetName}</TableCell>
                        <TableCell>
                          <Chip
                            label={appt.status.replace('_', ' ')}
                            size="small"
                            color={STATUS_COLORS[appt.status] || 'default'}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                No appointments scheduled for today.
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Recent Visits */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Recent Visits</Typography>
            <Divider sx={{ mb: 1 }} />
            {stats.recentVisits.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Patient</TableCell>
                      <TableCell>Complaint</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.recentVisits.map((visit) => (
                      <TableRow
                        key={visit.id}
                        hover
                        sx={{ cursor: 'pointer' }}
                        onClick={() => router.push(`/visits/${visit.id}`)}
                      >
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          {new Date(visit.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{visit.patientName}</TableCell>
                        <TableCell>{visit.chiefComplaint || '—'}</TableCell>
                        <TableCell>
                          <Chip
                            label={visit.status.replace('_', ' ')}
                            size="small"
                            color={STATUS_COLORS[visit.status] || 'default'}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                No visits recorded yet.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
