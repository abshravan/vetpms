import { useState } from 'react';
import {
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Alert,
  Chip,
  Stack,
} from '@mui/material';
import {
  reportsApi,
  RevenueReport,
  VisitReport,
  VaccinationDueReport,
  TopServiceReport,
} from '../api/reports';

function startOfMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}
function today(): string {
  return new Date().toISOString().slice(0, 10);
}

const fmt = (n: number) =>
  `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ───── Revenue Tab ─────
function RevenueTab() {
  const [startDate, setStartDate] = useState(startOfMonth());
  const [endDate, setEndDate] = useState(today());
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('day');
  const [data, setData] = useState<RevenueReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    reportsApi
      .getRevenueReport(startDate, endDate, groupBy)
      .then(({ data: d }) => setData(d))
      .catch(() => setError('Failed to load revenue report'))
      .finally(() => setLoading(false));
  };

  return (
    <Box>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }} alignItems="center" flexWrap="wrap">
        <TextField label="Start" type="date" size="small" value={startDate} onChange={(e) => setStartDate(e.target.value)} InputLabelProps={{ shrink: true }} />
        <TextField label="End" type="date" size="small" value={endDate} onChange={(e) => setEndDate(e.target.value)} InputLabelProps={{ shrink: true }} />
        <TextField label="Group by" select size="small" value={groupBy} onChange={(e) => setGroupBy(e.target.value as 'day' | 'week' | 'month')} SelectProps={{ native: true }}>
          <option value="day">Day</option>
          <option value="week">Week</option>
          <option value="month">Month</option>
        </TextField>
        <Button variant="contained" size="small" onClick={load} disabled={loading}>
          {loading ? 'Loading…' : 'Run Report'}
        </Button>
      </Stack>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {data.length > 0 && (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Period</TableCell>
                <TableCell align="right">Invoiced</TableCell>
                <TableCell align="right">Collected</TableCell>
                <TableCell align="right">Outstanding</TableCell>
                <TableCell align="right">Invoices</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.period}>
                  <TableCell>{row.period}</TableCell>
                  <TableCell align="right">{fmt(row.totalInvoiced)}</TableCell>
                  <TableCell align="right">{fmt(row.totalCollected)}</TableCell>
                  <TableCell align="right">{fmt(row.outstanding)}</TableCell>
                  <TableCell align="right">{row.invoiceCount}</TableCell>
                </TableRow>
              ))}
              {data.length > 1 && (
                <TableRow sx={{ fontWeight: 700, '& td': { fontWeight: 700 } }}>
                  <TableCell>Total</TableCell>
                  <TableCell align="right">{fmt(data.reduce((s, r) => s + r.totalInvoiced, 0))}</TableCell>
                  <TableCell align="right">{fmt(data.reduce((s, r) => s + r.totalCollected, 0))}</TableCell>
                  <TableCell align="right">{fmt(data.reduce((s, r) => s + r.outstanding, 0))}</TableCell>
                  <TableCell align="right">{data.reduce((s, r) => s + r.invoiceCount, 0)}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {!loading && data.length === 0 && !error && (
        <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
          Click "Run Report" to generate revenue data.
        </Typography>
      )}
    </Box>
  );
}

// ───── Visits Tab ─────
function VisitsTab() {
  const [startDate, setStartDate] = useState(startOfMonth());
  const [endDate, setEndDate] = useState(today());
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('day');
  const [data, setData] = useState<VisitReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    reportsApi
      .getVisitReport(startDate, endDate, groupBy)
      .then(({ data: d }) => setData(d))
      .catch(() => setError('Failed to load visit report'))
      .finally(() => setLoading(false));
  };

  return (
    <Box>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }} alignItems="center" flexWrap="wrap">
        <TextField label="Start" type="date" size="small" value={startDate} onChange={(e) => setStartDate(e.target.value)} InputLabelProps={{ shrink: true }} />
        <TextField label="End" type="date" size="small" value={endDate} onChange={(e) => setEndDate(e.target.value)} InputLabelProps={{ shrink: true }} />
        <TextField label="Group by" select size="small" value={groupBy} onChange={(e) => setGroupBy(e.target.value as 'day' | 'week' | 'month')} SelectProps={{ native: true }}>
          <option value="day">Day</option>
          <option value="week">Week</option>
          <option value="month">Month</option>
        </TextField>
        <Button variant="contained" size="small" onClick={load} disabled={loading}>
          {loading ? 'Loading…' : 'Run Report'}
        </Button>
      </Stack>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {data.length > 0 && (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Period</TableCell>
                <TableCell align="right">Total Visits</TableCell>
                <TableCell align="right">Completed</TableCell>
                <TableCell align="right">Completion %</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.period}>
                  <TableCell>{row.period}</TableCell>
                  <TableCell align="right">{row.visitCount}</TableCell>
                  <TableCell align="right">{row.completedCount}</TableCell>
                  <TableCell align="right">
                    {row.visitCount > 0 ? Math.round((row.completedCount / row.visitCount) * 100) : 0}%
                  </TableCell>
                </TableRow>
              ))}
              {data.length > 1 && (
                <TableRow sx={{ '& td': { fontWeight: 700 } }}>
                  <TableCell>Total</TableCell>
                  <TableCell align="right">{data.reduce((s, r) => s + r.visitCount, 0)}</TableCell>
                  <TableCell align="right">{data.reduce((s, r) => s + r.completedCount, 0)}</TableCell>
                  <TableCell align="right">
                    {(() => {
                      const tv = data.reduce((s, r) => s + r.visitCount, 0);
                      const tc = data.reduce((s, r) => s + r.completedCount, 0);
                      return tv > 0 ? Math.round((tc / tv) * 100) : 0;
                    })()}%
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {!loading && data.length === 0 && !error && (
        <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
          Click "Run Report" to generate visit data.
        </Typography>
      )}
    </Box>
  );
}

// ───── Vaccinations Due Tab ─────
function VaccinationsTab() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<VaccinationDueReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    reportsApi
      .getVaccinationsDue(days)
      .then(({ data: d }) => setData(d))
      .catch(() => setError('Failed to load vaccinations due'))
      .finally(() => setLoading(false));
  };

  return (
    <Box>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }} alignItems="center">
        <TextField label="Days ahead" type="number" size="small" value={days} onChange={(e) => setDays(Number(e.target.value))} sx={{ width: 120 }} />
        <Button variant="contained" size="small" onClick={load} disabled={loading}>
          {loading ? 'Loading…' : 'Run Report'}
        </Button>
      </Stack>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {data.length > 0 && (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Due Date</TableCell>
                <TableCell>Vaccine</TableCell>
                <TableCell>Patient</TableCell>
                <TableCell>Species</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.id}>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    {new Date(row.nextDueDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{row.vaccineName}</TableCell>
                  <TableCell>{row.patientName}</TableCell>
                  <TableCell>{row.species}</TableCell>
                  <TableCell>{row.clientName}</TableCell>
                  <TableCell>{row.clientPhone || '—'}</TableCell>
                  <TableCell>
                    <Chip
                      label={row.status}
                      size="small"
                      color={new Date(row.nextDueDate) < new Date() ? 'error' : 'warning'}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {!loading && data.length === 0 && !error && (
        <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
          Click "Run Report" to see upcoming vaccinations.
        </Typography>
      )}
    </Box>
  );
}

// ───── Top Services Tab ─────
function TopServicesTab() {
  const [startDate, setStartDate] = useState(startOfMonth());
  const [endDate, setEndDate] = useState(today());
  const [limit, setLimit] = useState(20);
  const [data, setData] = useState<TopServiceReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    reportsApi
      .getTopServices(startDate, endDate, limit)
      .then(({ data: d }) => setData(d))
      .catch(() => setError('Failed to load top services'))
      .finally(() => setLoading(false));
  };

  return (
    <Box>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }} alignItems="center" flexWrap="wrap">
        <TextField label="Start" type="date" size="small" value={startDate} onChange={(e) => setStartDate(e.target.value)} InputLabelProps={{ shrink: true }} />
        <TextField label="End" type="date" size="small" value={endDate} onChange={(e) => setEndDate(e.target.value)} InputLabelProps={{ shrink: true }} />
        <TextField label="Limit" type="number" size="small" value={limit} onChange={(e) => setLimit(Number(e.target.value))} sx={{ width: 100 }} />
        <Button variant="contained" size="small" onClick={load} disabled={loading}>
          {loading ? 'Loading…' : 'Run Report'}
        </Button>
      </Stack>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {data.length > 0 && (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Service</TableCell>
                <TableCell>Category</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell align="right">Revenue</TableCell>
                <TableCell align="right">Invoices</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, idx) => (
                <TableRow key={row.description}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{row.description}</TableCell>
                  <TableCell>{row.category || '—'}</TableCell>
                  <TableCell align="right">{row.totalQuantity}</TableCell>
                  <TableCell align="right">{fmt(row.totalRevenue)}</TableCell>
                  <TableCell align="right">{row.invoiceCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {!loading && data.length === 0 && !error && (
        <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
          Click "Run Report" to see top services.
        </Typography>
      )}
    </Box>
  );
}

// ───── Main Reports Page ─────
export default function ReportsPage() {
  const [tab, setTab] = useState(0);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Reports</Typography>
      <Paper variant="outlined">
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
          <Tab label="Revenue" />
          <Tab label="Visits" />
          <Tab label="Vaccinations Due" />
          <Tab label="Top Services" />
        </Tabs>
        <Box sx={{ p: 2 }}>
          {tab === 0 && <RevenueTab />}
          {tab === 1 && <VisitsTab />}
          {tab === 2 && <VaccinationsTab />}
          {tab === 3 && <TopServicesTab />}
        </Box>
      </Paper>
    </Box>
  );
}
