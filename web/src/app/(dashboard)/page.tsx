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
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { Chip } from '@mui/material';
import { reportsApi, DashboardStats } from '../../api/reports';
import { cn } from '../../lib/utils';
import dynamic from 'next/dynamic';
import { DashboardSkeleton } from '../../components/Skeleton';

const DashboardCharts = dynamic(() => import('../../components/DashboardCharts'), { ssr: false });
const PredictiveHealthDashboard = dynamic(() => import('../../components/PredictiveHealthDashboard'), { ssr: false });

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
  show: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
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
    return <DashboardSkeleton />;
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-8">
        <AlertTriangle className="h-8 w-8 text-destructive/60" />
        <p className="text-sm text-destructive">{error || 'Failed to load'}</p>
      </div>
    );
  }

  const fmt = (n: number) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const statCards = [
    { label: 'Total Clients', value: stats.totalClients, icon: Users, gradient: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30', accent: 'text-emerald-600 dark:text-emerald-400', link: '/clients' },
    { label: 'Total Patients', value: stats.totalPatients, icon: PawPrint, gradient: 'from-blue-500 to-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30', accent: 'text-blue-600 dark:text-blue-400', link: '/patients' },
    { label: "Today's Appts", value: stats.todayAppointments, icon: CalendarDays, gradient: 'from-orange-500 to-amber-500', bg: 'bg-orange-50 dark:bg-orange-950/30', accent: 'text-orange-600 dark:text-orange-400', link: '/appointments' },
    { label: 'Open Visits', value: stats.openVisits, icon: Stethoscope, gradient: 'from-purple-500 to-violet-500', bg: 'bg-purple-50 dark:bg-purple-950/30', accent: 'text-purple-600 dark:text-purple-400' },
    { label: 'Pending Invoices', value: stats.pendingInvoices, icon: Receipt, gradient: 'from-rose-500 to-red-500', bg: 'bg-rose-50 dark:bg-rose-950/30', accent: 'text-rose-600 dark:text-rose-400', link: '/billing' },
    { label: 'Outstanding', value: fmt(stats.outstandingBalance), icon: DollarSign, gradient: 'from-red-500 to-rose-600', bg: 'bg-red-50 dark:bg-red-950/30', accent: 'text-red-600 dark:text-red-400', link: '/billing' },
    { label: 'Vaccines Due', value: stats.upcomingVaccinations, icon: Syringe, gradient: 'from-amber-500 to-yellow-500', bg: 'bg-amber-50 dark:bg-amber-950/30', accent: 'text-amber-600 dark:text-amber-400' },
    { label: 'Overdue Care', value: stats.overduePreventiveCare, icon: AlertTriangle, gradient: 'from-red-500 to-rose-500', bg: 'bg-rose-50 dark:bg-rose-950/30', accent: 'text-rose-600 dark:text-rose-400' },
  ];

  return (
    <div>
      {/* Page header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Overview</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        </div>
      </div>

      {/* Stat Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mb-8 grid grid-cols-2 gap-4 xl:grid-cols-4"
      >
        {statCards.map((card) => (
          <motion.div key={card.label} variants={fadeUp}>
            <div
              onClick={() => card.link && router.push(card.link)}
              className={cn(
                'group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-card transition-all duration-300',
                card.link && 'cursor-pointer hover:shadow-card-hover hover:-translate-y-0.5',
              )}
            >
              {/* Gradient accent line at top */}
              <div className={cn('absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r', card.gradient)} />

              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {card.label}
                  </p>
                  <p className={cn('mt-2 text-2xl font-bold tabular-nums', card.accent)}>
                    {card.value}
                  </p>
                </div>
                <div className={cn('rounded-xl p-2.5', card.bg)}>
                  <card.icon className={cn('h-5 w-5', card.accent)} />
                </div>
              </div>

              {/* Hover arrow */}
              {card.link && (
                <ArrowUpRight className="absolute bottom-3 right-3 h-4 w-4 text-muted-foreground/0 transition-all duration-300 group-hover:text-muted-foreground/40" />
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts */}
      <DashboardCharts />

      {/* Predictive Health Insights */}
      <div className="mb-8">
        <PredictiveHealthDashboard />
      </div>

      {/* Tables Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Schedule */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card"
        >
          <div className="flex items-center gap-2.5 border-b border-border/50 px-5 py-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 dark:bg-orange-950/30">
              <CalendarClock className="h-4 w-4 text-orange-500" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Today&apos;s Schedule</h2>
              <p className="text-[11px] text-muted-foreground">{stats.todaySchedule.length} appointment{stats.todaySchedule.length !== 1 ? 's' : ''}</p>
            </div>
          </div>

          {stats.todaySchedule.length > 0 ? (
            <div className="divide-y divide-border/50">
              {stats.todaySchedule.map((appt) => (
                <div
                  key={appt.id}
                  onClick={() => router.push(`/appointments/${appt.id}`)}
                  className="flex cursor-pointer items-center gap-4 px-5 py-3.5 transition-all duration-200 hover:bg-muted/40"
                >
                  <span className="w-14 shrink-0 text-xs font-semibold tabular-nums text-muted-foreground">
                    {new Date(appt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{appt.patientName}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{appt.clientName} &middot; {appt.vetName}</p>
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
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CalendarDays className="mb-3 h-10 w-10 text-muted-foreground/20" />
              <p className="text-sm font-medium text-muted-foreground/60">No appointments today</p>
              <p className="mt-1 text-xs text-muted-foreground/40">Your schedule is clear</p>
            </div>
          )}
        </motion.div>

        {/* Recent Visits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card"
        >
          <div className="flex items-center gap-2.5 border-b border-border/50 px-5 py-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-950/30">
              <ClipboardList className="h-4 w-4 text-purple-500" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Recent Visits</h2>
              <p className="text-[11px] text-muted-foreground">Latest patient visits</p>
            </div>
          </div>

          {stats.recentVisits.length > 0 ? (
            <div className="divide-y divide-border/50">
              {stats.recentVisits.map((visit) => (
                <div
                  key={visit.id}
                  onClick={() => router.push(`/visits/${visit.id}`)}
                  className="flex cursor-pointer items-center gap-4 px-5 py-3.5 transition-all duration-200 hover:bg-muted/40"
                >
                  <span className="w-20 shrink-0 text-xs font-medium tabular-nums text-muted-foreground">
                    {new Date(visit.createdAt).toLocaleDateString()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{visit.patientName}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{visit.chiefComplaint || 'No complaint noted'}</p>
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
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ClipboardList className="mb-3 h-10 w-10 text-muted-foreground/20" />
              <p className="text-sm font-medium text-muted-foreground/60">No visits yet</p>
              <p className="mt-1 text-xs text-muted-foreground/40">Start a visit to see records here</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
