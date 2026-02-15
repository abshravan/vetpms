'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Users,
  PawPrint,
  CalendarDays,
  Stethoscope,
  Receipt,
  DollarSign,
  Syringe,
  AlertTriangle,
  Loader2,
  CalendarClock,
  ClipboardList,
} from 'lucide-react';
import { Chip } from '@mui/material';
import { reportsApi, DashboardStats } from '../../api/reports';
import { cn } from '../../lib/utils';

const STATUS_COLORS: Record<string, 'default' | 'warning' | 'success' | 'info' | 'error'> = {
  open: 'default',
  in_progress: 'warning',
  completed: 'success',
  scheduled: 'default',
  confirmed: 'info',
  checked_in: 'warning',
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
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
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-destructive/20 bg-destructive/5 p-6">
        <p className="text-sm text-destructive">{error || 'Failed to load'}</p>
      </div>
    );
  }

  const fmt = (n: number) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const statCards = [
    { label: 'Clients', value: stats.totalClients, icon: Users, accent: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30', link: '/clients' },
    { label: 'Patients', value: stats.totalPatients, icon: PawPrint, accent: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/30', link: '/patients' },
    { label: "Today's Appts", value: stats.todayAppointments, icon: CalendarDays, accent: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/30', link: '/appointments' },
    { label: 'Open Visits', value: stats.openVisits, icon: Stethoscope, accent: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/30' },
    { label: 'Pending Invoices', value: stats.pendingInvoices, icon: Receipt, accent: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/30', link: '/billing' },
    { label: 'Outstanding', value: fmt(stats.outstandingBalance), icon: DollarSign, accent: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/30', link: '/billing' },
    { label: 'Vaccines Due (30d)', value: stats.upcomingVaccinations, icon: Syringe, accent: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30' },
    { label: 'Overdue Care', value: stats.overduePreventiveCare, icon: AlertTriangle, accent: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/30' },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Dashboard</h1>

      {/* Stat Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4"
      >
        {statCards.map((card) => (
          <motion.div key={card.label} variants={fadeUp}>
            <div
              onClick={() => card.link && router.push(card.link)}
              className={cn(
                'group relative overflow-hidden rounded-xl border border-border bg-card p-4 transition-all duration-200',
                card.link && 'cursor-pointer hover:border-primary/30 hover:shadow-md',
              )}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {card.label}
                  </p>
                  <p className={cn('mt-1.5 text-2xl font-bold tabular-nums', card.accent)}>
                    {card.value}
                  </p>
                </div>
                <div className={cn('rounded-lg p-2', card.bg)}>
                  <card.icon className={cn('h-4 w-4', card.accent)} />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Tables Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Schedule */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="rounded-xl border border-border bg-card"
        >
          <div className="flex items-center gap-2 border-b border-border px-5 py-3.5">
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Today&apos;s Schedule</h2>
          </div>

          {stats.todaySchedule.length > 0 ? (
            <div className="divide-y divide-border">
              {stats.todaySchedule.map((appt) => (
                <div
                  key={appt.id}
                  onClick={() => router.push(`/appointments/${appt.id}`)}
                  className="flex cursor-pointer items-center gap-4 px-5 py-3 transition-colors hover:bg-muted/50"
                >
                  <span className="w-14 shrink-0 text-xs font-medium tabular-nums text-muted-foreground">
                    {new Date(appt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{appt.patientName}</p>
                    <p className="truncate text-xs text-muted-foreground">{appt.clientName} &middot; {appt.vetName}</p>
                  </div>
                  <Chip
                    label={appt.status.replace('_', ' ')}
                    size="small"
                    color={STATUS_COLORS[appt.status] || 'default'}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <CalendarDays className="mb-2 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No appointments scheduled for today.</p>
            </div>
          )}
        </motion.div>

        {/* Recent Visits */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="rounded-xl border border-border bg-card"
        >
          <div className="flex items-center gap-2 border-b border-border px-5 py-3.5">
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Recent Visits</h2>
          </div>

          {stats.recentVisits.length > 0 ? (
            <div className="divide-y divide-border">
              {stats.recentVisits.map((visit) => (
                <div
                  key={visit.id}
                  onClick={() => router.push(`/visits/${visit.id}`)}
                  className="flex cursor-pointer items-center gap-4 px-5 py-3 transition-colors hover:bg-muted/50"
                >
                  <span className="w-20 shrink-0 text-xs tabular-nums text-muted-foreground">
                    {new Date(visit.createdAt).toLocaleDateString()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{visit.patientName}</p>
                    <p className="truncate text-xs text-muted-foreground">{visit.chiefComplaint || 'No complaint noted'}</p>
                  </div>
                  <Chip
                    label={visit.status.replace('_', ' ')}
                    size="small"
                    color={STATUS_COLORS[visit.status] || 'default'}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <ClipboardList className="mb-2 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No visits recorded yet.</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
