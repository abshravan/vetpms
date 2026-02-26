'use client';

import { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TrendingUp, Activity, PieChartIcon } from 'lucide-react';
import { reportsApi, RevenueReport, VisitReport } from '../api/reports';
import { cn } from '../lib/utils';

const SPECIES_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

interface SpeciesData {
  name: string;
  value: number;
}

function ChartCard({
  title,
  subtitle,
  icon: Icon,
  iconBg,
  iconColor,
  children,
}: {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card">
      <div className="flex items-center gap-2.5 border-b border-border/50 px-5 py-4">
        <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', iconBg)}>
          <Icon className={cn('h-4 w-4', iconColor)} />
        </div>
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="text-[11px] text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export default function DashboardCharts() {
  const [revenue, setRevenue] = useState<RevenueReport[]>([]);
  const [visits, setVisits] = useState<VisitReport[]>([]);
  const [species, setSpecies] = useState<SpeciesData[]>([]);

  useEffect(() => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const start = sixMonthsAgo.toISOString().slice(0, 10);
    const end = new Date().toISOString().slice(0, 10);

    Promise.allSettled([
      reportsApi.getRevenueReport(start, end, 'month'),
      reportsApi.getVisitReport(start, end, 'month'),
    ]).then(([revResult, visResult]) => {
      if (revResult.status === 'fulfilled') setRevenue(revResult.value.data);
      if (visResult.status === 'fulfilled') setVisits(visResult.value.data);
    });

    // Species breakdown from patients API (we'll just use the chart data endpoint)
    import('../api/patients').then(({ patientsApi }) => {
      patientsApi
        .list({ page: 1, limit: 100 })
        .then(({ data }) => {
          const items = Array.isArray(data) ? data : data.data || [];
          const counts: Record<string, number> = {};
          items.forEach((p: { species?: string }) => {
            const s = p.species || 'unknown';
            const label = s.charAt(0).toUpperCase() + s.slice(1);
            counts[label] = (counts[label] || 0) + 1;
          });
          setSpecies(Object.entries(counts).map(([name, value]) => ({ name, value })));
        })
        .catch(() => {});
    });
  }, []);

  return (
    <div className="mb-8 grid gap-6 lg:grid-cols-3">
      {/* Revenue Trend */}
      <ChartCard
        title="Revenue Trend"
        subtitle="Invoiced vs collected"
        icon={TrendingUp}
        iconBg="bg-emerald-50 dark:bg-emerald-950/30"
        iconColor="text-emerald-500"
      >
        {revenue.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenue} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorInvoiced" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" strokeOpacity={0.4} />
              <XAxis dataKey="period" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
                formatter={(value: number | undefined) => value !== undefined ? [`$${value.toLocaleString()}`] : ['-']}
              />
              <Area
                type="monotone"
                dataKey="totalInvoiced"
                name="Invoiced"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#colorInvoiced)"
              />
              <Area
                type="monotone"
                dataKey="totalCollected"
                name="Collected"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#colorCollected)"
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground/50">
            No revenue data
          </div>
        )}
      </ChartCard>

      {/* Visit Volume */}
      <ChartCard
        title="Visit Volume"
        subtitle="Visits per period"
        icon={Activity}
        iconBg="bg-blue-50 dark:bg-blue-950/30"
        iconColor="text-blue-500"
      >
        {visits.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={visits} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" strokeOpacity={0.4} />
              <XAxis dataKey="period" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="visitCount" name="Total Visits" fill="#6366f1" radius={[6, 6, 0, 0]} />
              <Bar dataKey="completedCount" name="Completed" fill="#10b981" radius={[6, 6, 0, 0]} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground/50">
            No visit data
          </div>
        )}
      </ChartCard>

      {/* Species Breakdown */}
      <ChartCard
        title="Species Breakdown"
        subtitle="Patient distribution"
        icon={PieChartIcon}
        iconBg="bg-purple-50 dark:bg-purple-950/30"
        iconColor="text-purple-500"
      >
        {species.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={species}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {species.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={SPECIES_COLORS[index % SPECIES_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground/50">
            No patient data
          </div>
        )}
      </ChartCard>
    </div>
  );
}
