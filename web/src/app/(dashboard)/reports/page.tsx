'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Chip,
} from '@mui/material';
import {
  BarChart3,
  Loader2,
  DollarSign,
  ClipboardList,
  Syringe,
  Star,
  AlertTriangle,
} from 'lucide-react';
import {
  reportsApi,
  RevenueReport,
  VisitReport,
  VaccinationDueReport,
  TopServiceReport,
} from '../../../api/reports';
import { cn } from '../../../lib/utils';

function startOfMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}
function today(): string {
  return new Date().toISOString().slice(0, 10);
}

const fmt = (n: number) =>
  `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function RunButton({ loading, onClick }: { loading: boolean; onClick: () => void }) {
  return (
    <button
      className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/90 px-5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:shadow-lg hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
      onClick={onClick}
      disabled={loading}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {loading ? 'Loading...' : 'Run Report'}
    </button>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 p-3.5">
      <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
      <p className="text-sm text-destructive">{message}</p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-10">
      <BarChart3 className="h-10 w-10 text-muted-foreground/20" />
      <p className="text-sm text-muted-foreground/60">{message}</p>
    </div>
  );
}

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
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <TextField label="Start" type="date" size="small" value={startDate} onChange={(e) => setStartDate(e.target.value)} InputLabelProps={{ shrink: true }} />
        <TextField label="End" type="date" size="small" value={endDate} onChange={(e) => setEndDate(e.target.value)} InputLabelProps={{ shrink: true }} />
        <TextField label="Group by" select size="small" value={groupBy} onChange={(e) => setGroupBy(e.target.value as 'day' | 'week' | 'month')} SelectProps={{ native: true }}>
          <option value="day">Day</option>
          <option value="week">Week</option>
          <option value="month">Month</option>
        </TextField>
        <RunButton loading={loading} onClick={load} />
      </div>
      {error && <ErrorBanner message={error} />}
      {data.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card">
          <TableContainer>
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
                    <TableCell align="right"><span className="tabular-nums">{fmt(row.totalInvoiced)}</span></TableCell>
                    <TableCell align="right"><span className="tabular-nums">{fmt(row.totalCollected)}</span></TableCell>
                    <TableCell align="right"><span className="tabular-nums">{fmt(row.outstanding)}</span></TableCell>
                    <TableCell align="right"><span className="tabular-nums">{row.invoiceCount}</span></TableCell>
                  </TableRow>
                ))}
                {data.length > 1 && (
                  <TableRow sx={{ '& td': { fontWeight: 700 } }}>
                    <TableCell>Total</TableCell>
                    <TableCell align="right"><span className="tabular-nums">{fmt(data.reduce((s, r) => s + r.totalInvoiced, 0))}</span></TableCell>
                    <TableCell align="right"><span className="tabular-nums">{fmt(data.reduce((s, r) => s + r.totalCollected, 0))}</span></TableCell>
                    <TableCell align="right"><span className="tabular-nums">{fmt(data.reduce((s, r) => s + r.outstanding, 0))}</span></TableCell>
                    <TableCell align="right"><span className="tabular-nums">{data.reduce((s, r) => s + r.invoiceCount, 0)}</span></TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}
      {!loading && data.length === 0 && !error && (
        <EmptyState message="Click &quot;Run Report&quot; to generate revenue data." />
      )}
    </div>
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
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <TextField label="Start" type="date" size="small" value={startDate} onChange={(e) => setStartDate(e.target.value)} InputLabelProps={{ shrink: true }} />
        <TextField label="End" type="date" size="small" value={endDate} onChange={(e) => setEndDate(e.target.value)} InputLabelProps={{ shrink: true }} />
        <TextField label="Group by" select size="small" value={groupBy} onChange={(e) => setGroupBy(e.target.value as 'day' | 'week' | 'month')} SelectProps={{ native: true }}>
          <option value="day">Day</option>
          <option value="week">Week</option>
          <option value="month">Month</option>
        </TextField>
        <RunButton loading={loading} onClick={load} />
      </div>
      {error && <ErrorBanner message={error} />}
      {data.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card">
          <TableContainer>
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
                    <TableCell align="right"><span className="tabular-nums">{row.visitCount}</span></TableCell>
                    <TableCell align="right"><span className="tabular-nums">{row.completedCount}</span></TableCell>
                    <TableCell align="right">
                      <span className="tabular-nums">{row.visitCount > 0 ? Math.round((row.completedCount / row.visitCount) * 100) : 0}%</span>
                    </TableCell>
                  </TableRow>
                ))}
                {data.length > 1 && (
                  <TableRow sx={{ '& td': { fontWeight: 700 } }}>
                    <TableCell>Total</TableCell>
                    <TableCell align="right"><span className="tabular-nums">{data.reduce((s, r) => s + r.visitCount, 0)}</span></TableCell>
                    <TableCell align="right"><span className="tabular-nums">{data.reduce((s, r) => s + r.completedCount, 0)}</span></TableCell>
                    <TableCell align="right">
                      <span className="tabular-nums">
                        {(() => {
                          const tv = data.reduce((s, r) => s + r.visitCount, 0);
                          const tc = data.reduce((s, r) => s + r.completedCount, 0);
                          return tv > 0 ? Math.round((tc / tv) * 100) : 0;
                        })()}%
                      </span>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}
      {!loading && data.length === 0 && !error && (
        <EmptyState message="Click &quot;Run Report&quot; to generate visit data." />
      )}
    </div>
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
    <div>
      <div className="mb-4 flex items-center gap-3">
        <TextField label="Days ahead" type="number" size="small" value={days} onChange={(e) => setDays(Number(e.target.value))} sx={{ width: 120 }} />
        <RunButton loading={loading} onClick={load} />
      </div>
      {error && <ErrorBanner message={error} />}
      {data.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card">
          <TableContainer>
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
        </div>
      )}
      {!loading && data.length === 0 && !error && (
        <EmptyState message="Click &quot;Run Report&quot; to see upcoming vaccinations." />
      )}
    </div>
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
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <TextField label="Start" type="date" size="small" value={startDate} onChange={(e) => setStartDate(e.target.value)} InputLabelProps={{ shrink: true }} />
        <TextField label="End" type="date" size="small" value={endDate} onChange={(e) => setEndDate(e.target.value)} InputLabelProps={{ shrink: true }} />
        <TextField label="Limit" type="number" size="small" value={limit} onChange={(e) => setLimit(Number(e.target.value))} sx={{ width: 100 }} />
        <RunButton loading={loading} onClick={load} />
      </div>
      {error && <ErrorBanner message={error} />}
      {data.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card">
          <TableContainer>
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
                    <TableCell>
                      <span className="tabular-nums text-muted-foreground">{idx + 1}</span>
                    </TableCell>
                    <TableCell><span className="font-medium">{row.description}</span></TableCell>
                    <TableCell>{row.category || '—'}</TableCell>
                    <TableCell align="right"><span className="tabular-nums">{row.totalQuantity}</span></TableCell>
                    <TableCell align="right"><span className="tabular-nums">{fmt(row.totalRevenue)}</span></TableCell>
                    <TableCell align="right"><span className="tabular-nums">{row.invoiceCount}</span></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}
      {!loading && data.length === 0 && !error && (
        <EmptyState message="Click &quot;Run Report&quot; to see top services." />
      )}
    </div>
  );
}

// ───── Tab config ─────
const reportTabs = [
  { label: 'Revenue', icon: DollarSign },
  { label: 'Visits', icon: ClipboardList },
  { label: 'Vaccinations Due', icon: Syringe },
  { label: 'Top Services', icon: Star },
];

// ───── Main Reports Page ─────
export default function ReportsPage() {
  const [tab, setTab] = useState(0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
    >
      {/* Page header */}
      <div className="mb-8">
        <div className="mb-1 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">Analytics</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">Analytics and practice insights</p>
      </div>

      {/* Custom tab navigation */}
      <div className="mb-6 flex gap-1 rounded-xl border border-border/60 bg-muted/50 p-1">
        {reportTabs.map((t, i) => (
          <button
            key={t.label}
            onClick={() => setTab(i)}
            className={cn(
              'flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all',
              tab === i
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-card">
        {tab === 0 && <RevenueTab />}
        {tab === 1 && <VisitsTab />}
        {tab === 2 && <VaccinationsTab />}
        {tab === 3 && <TopServicesTab />}
      </div>
    </motion.div>
  );
}
