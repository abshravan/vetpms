import { Typography, Paper, Grid, Box } from '@mui/material';

const stats = [
  { label: 'Clients', value: '—', color: '#2e7d32' },
  { label: 'Patients', value: '—', color: '#1565c0' },
  { label: "Today's Appointments", value: '—', color: '#e65100' },
  { label: 'Pending Bills', value: '—', color: '#c62828' },
];

export default function DashboardPage() {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={2}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.label}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" fontWeight={700} color={stat.color}>
                {stat.value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stat.label}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
