'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
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
import {
  TrendingUp,
  TrendingDown,
  Package,
  AlertTriangle,
  DollarSign,
  RotateCcw,
  ShoppingCart,
  Clock,
  CheckCircle2,
  Pill,
  Syringe,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  Zap,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import toast from 'react-hot-toast';

// ── Mock Data ──

interface InventoryMetric {
  label: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'flat';
  detail: string;
}

interface ReorderSuggestion {
  id: string;
  itemName: string;
  category: string;
  currentStock: number;
  reorderLevel: number;
  suggestedQty: number;
  estimatedCost: number;
  daysUntilOut: number;
  urgency: 'critical' | 'soon' | 'planned';
  usageRate: string;
}

interface ExpiringItem {
  name: string;
  lotNumber: string;
  expirationDate: string;
  quantity: number;
  daysUntilExpiry: number;
  value: number;
}

const METRICS: InventoryMetric[] = [
  { label: 'Total Inventory Value', value: '$24,850', change: 3.2, trend: 'up', detail: 'Across 12 categories' },
  { label: 'Monthly Turnover', value: '4.2x', change: 0.3, trend: 'up', detail: 'Industry avg: 3.5x' },
  { label: 'Waste Rate', value: '1.8%', change: -0.5, trend: 'down', detail: 'Down from 2.3% last month' },
  { label: 'Items Below Reorder', value: '4', change: 2, trend: 'up', detail: 'Action needed' },
];

const USAGE_TREND = [
  { month: 'Sep', medications: 4200, vaccines: 1800, supplies: 2100 },
  { month: 'Oct', medications: 4500, vaccines: 2200, supplies: 1900 },
  { month: 'Nov', medications: 3800, vaccines: 1500, supplies: 2300 },
  { month: 'Dec', medications: 4100, vaccines: 1200, supplies: 2000 },
  { month: 'Jan', medications: 4800, vaccines: 2400, supplies: 2200 },
  { month: 'Feb', medications: 5100, vaccines: 2600, supplies: 2400 },
];

const CATEGORY_BREAKDOWN = [
  { name: 'Medications', value: 9800, color: '#6366f1' },
  { name: 'Vaccines', value: 5200, color: '#10b981' },
  { name: 'Surgical Supplies', value: 4100, color: '#f59e0b' },
  { name: 'Lab Supplies', value: 2800, color: '#ef4444' },
  { name: 'Food & Suppl.', value: 1950, color: '#8b5cf6' },
  { name: 'Equipment', value: 1000, color: '#ec4899' },
];

const REORDER_SUGGESTIONS: ReorderSuggestion[] = [
  { id: 'ro-1', itemName: 'Carprofen 75mg', category: 'Medication', currentStock: 12, reorderLevel: 50, suggestedQty: 100, estimatedCost: 185.00, daysUntilOut: 3, urgency: 'critical', usageRate: '4/day' },
  { id: 'ro-2', itemName: 'Rabies Vaccine (1yr)', category: 'Vaccine', currentStock: 8, reorderLevel: 20, suggestedQty: 50, estimatedCost: 375.00, daysUntilOut: 5, urgency: 'critical', usageRate: '1.5/day' },
  { id: 'ro-3', itemName: 'Cephalexin 500mg', category: 'Medication', currentStock: 35, reorderLevel: 40, suggestedQty: 100, estimatedCost: 125.00, daysUntilOut: 8, urgency: 'soon', usageRate: '4/day' },
  { id: 'ro-4', itemName: 'Surgical Gloves (M)', category: 'Surgical Supply', currentStock: 45, reorderLevel: 100, suggestedQty: 200, estimatedCost: 42.00, daysUntilOut: 12, urgency: 'soon', usageRate: '4/day' },
  { id: 'ro-5', itemName: 'IV Catheter 20ga', category: 'Supply', currentStock: 18, reorderLevel: 25, suggestedQty: 50, estimatedCost: 89.00, daysUntilOut: 15, urgency: 'planned', usageRate: '1.2/day' },
  { id: 'ro-6', itemName: 'Maropitant (Cerenia) 10mg', category: 'Medication', currentStock: 22, reorderLevel: 30, suggestedQty: 50, estimatedCost: 245.00, daysUntilOut: 18, urgency: 'planned', usageRate: '1.2/day' },
];

const EXPIRING_ITEMS: ExpiringItem[] = [
  { name: 'Leptospirosis Vaccine', lotNumber: 'LEP-2024-884', expirationDate: new Date(Date.now() + 14 * 86400000).toISOString(), quantity: 5, daysUntilExpiry: 14, value: 87.50 },
  { name: 'Dexmedetomidine 0.5mg/ml', lotNumber: 'DEX-2024-291', expirationDate: new Date(Date.now() + 21 * 86400000).toISOString(), quantity: 3, daysUntilExpiry: 21, value: 135.00 },
  { name: 'Amoxicillin 250mg', lotNumber: 'AMX-2025-105', expirationDate: new Date(Date.now() + 45 * 86400000).toISOString(), quantity: 28, daysUntilExpiry: 45, value: 42.00 },
];

const TOP_ITEMS = [
  { name: 'Carprofen 75mg', dispensed: 120, revenue: 2160, trend: 12 },
  { name: 'Rabies Vaccine', dispensed: 45, revenue: 1125, trend: 8 },
  { name: 'DHPP Vaccine', dispensed: 38, revenue: 1216, trend: -3 },
  { name: 'Cerenia 16mg', dispensed: 32, revenue: 1280, trend: 15 },
  { name: 'Cephalexin 500mg', dispensed: 85, revenue: 680, trend: 5 },
];

// ── Styles ──

const URGENCY_STYLES = {
  critical: { bg: 'bg-red-100 dark:bg-red-950/40', text: 'text-red-700 dark:text-red-400', label: 'Critical', border: 'border-l-red-500' },
  soon: { bg: 'bg-amber-100 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-400', label: 'Soon', border: 'border-l-amber-500' },
  planned: { bg: 'bg-blue-100 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-400', label: 'Planned', border: 'border-l-blue-500' },
};

export default function InventoryAnalyticsPage() {
  const totalReorderCost = REORDER_SUGGESTIONS.reduce((sum, r) => sum + r.estimatedCost, 0);

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Inventory</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Analytics</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => toast.success('Auto-reorder submitted for review')}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/90 px-5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:shadow-lg hover:brightness-110 active:scale-[0.98]"
          >
            <Zap className="h-4 w-4" /> Auto-Reorder All (${totalReorderCost.toFixed(0)})
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {METRICS.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 shadow-card"
          >
            <div className={cn('absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r', m.trend === 'down' && m.label === 'Waste Rate' ? 'from-emerald-500 to-emerald-600' : m.trend === 'up' && m.label === 'Items Below Reorder' ? 'from-red-500 to-red-600' : 'from-blue-500 to-blue-600')} />
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{m.label}</p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold tabular-nums">{m.value}</span>
              <span className={cn(
                'inline-flex items-center gap-0.5 text-[11px] font-semibold',
                (m.trend === 'down' && m.label === 'Waste Rate') || (m.trend === 'up' && m.label !== 'Items Below Reorder')
                  ? 'text-emerald-600'
                  : 'text-red-500',
              )}>
                {m.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {Math.abs(m.change)}{typeof m.change === 'number' && m.label.includes('%') ? 'pp' : m.label.includes('x') ? '' : '%'}
              </span>
            </div>
            <p className="mt-0.5 text-[10px] text-muted-foreground">{m.detail}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Usage Trend Chart */}
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card lg:col-span-2">
          <div className="flex items-center gap-2.5 border-b border-border/50 px-5 py-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/30">
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Usage Trend by Category</h3>
              <p className="text-[11px] text-muted-foreground">Monthly cost trend (6 months)</p>
            </div>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={USAGE_TREND} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradMeds" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradVacc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" strokeOpacity={0.4} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '12px', fontSize: '12px' }} formatter={(value) => [`$${Number(value).toLocaleString()}`]} />
                <Area type="monotone" dataKey="medications" name="Medications" stroke="#6366f1" strokeWidth={2} fill="url(#gradMeds)" />
                <Area type="monotone" dataKey="vaccines" name="Vaccines" stroke="#10b981" strokeWidth={2} fill="url(#gradVacc)" />
                <Area type="monotone" dataKey="supplies" name="Supplies" stroke="#f59e0b" strokeWidth={2} fillOpacity={0} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card">
          <div className="flex items-center gap-2.5 border-b border-border/50 px-5 py-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-950/30">
              <DollarSign className="h-4 w-4 text-purple-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Value by Category</h3>
              <p className="text-[11px] text-muted-foreground">Current inventory value</p>
            </div>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={CATEGORY_BREAKDOWN} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value" strokeWidth={0}>
                  {CATEGORY_BREAKDOWN.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '12px', fontSize: '12px' }} formatter={(value) => [`$${Number(value).toLocaleString()}`]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 grid grid-cols-2 gap-1">
              {CATEGORY_BREAKDOWN.map((cat) => (
                <div key={cat.name} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-[10px] text-muted-foreground">{cat.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Smart Reorder Suggestions */}
      <div className="mt-6">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">Smart Reorder Suggestions</h2>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">AI</span>
        </div>
        <div className="space-y-2">
          {REORDER_SUGGESTIONS.map((item) => {
            const urgStyle = URGENCY_STYLES[item.urgency];
            const stockPercent = Math.round((item.currentStock / item.reorderLevel) * 100);
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn('flex items-center gap-4 rounded-xl border border-l-4 bg-card px-5 py-3 shadow-card', urgStyle.border)}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{item.itemName}</span>
                    <span className="text-[10px] text-muted-foreground">({item.category})</span>
                  </div>
                  <div className="mt-1 flex items-center gap-4 text-[10px] text-muted-foreground">
                    <span>Stock: <span className="font-bold text-foreground">{item.currentStock}</span> / {item.reorderLevel}</span>
                    <span>Usage: {item.usageRate}</span>
                    <span className={cn('font-bold', item.daysUntilOut <= 5 ? 'text-red-600' : item.daysUntilOut <= 10 ? 'text-amber-600' : 'text-foreground')}>
                      {item.daysUntilOut}d until stockout
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-32 overflow-hidden rounded-full bg-muted/50">
                    <div
                      className={cn('h-full rounded-full', stockPercent <= 25 ? 'bg-red-500' : stockPercent <= 50 ? 'bg-amber-500' : 'bg-emerald-500')}
                      style={{ width: `${Math.min(stockPercent, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Order <span className="font-bold text-foreground">{item.suggestedQty}</span> units</p>
                  <p className="text-sm font-bold tabular-nums">${item.estimatedCost.toFixed(2)}</p>
                </div>
                <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold', urgStyle.bg, urgStyle.text)}>
                  {urgStyle.label}
                </span>
                <button
                  onClick={() => toast.success(`Reorder placed: ${item.itemName} × ${item.suggestedQty}`)}
                  className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground shadow-sm"
                >
                  Order
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Expiring Items */}
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card">
          <div className="flex items-center gap-2.5 border-b border-border/50 px-5 py-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/30">
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
            <h3 className="text-sm font-semibold">Expiring Soon</h3>
          </div>
          <div className="divide-y divide-border/30">
            {EXPIRING_ITEMS.map((item, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3">
                <div className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                  item.daysUntilExpiry <= 14 ? 'bg-red-100 dark:bg-red-950/40' : item.daysUntilExpiry <= 30 ? 'bg-amber-100 dark:bg-amber-950/40' : 'bg-muted',
                )}>
                  <AlertTriangle className={cn('h-4 w-4', item.daysUntilExpiry <= 14 ? 'text-red-600' : item.daysUntilExpiry <= 30 ? 'text-amber-600' : 'text-muted-foreground')} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold">{item.name}</p>
                  <p className="text-[10px] text-muted-foreground">Lot: {item.lotNumber} · Qty: {item.quantity} · Value: ${item.value.toFixed(2)}</p>
                </div>
                <span className={cn(
                  'rounded-full px-2 py-0.5 text-[10px] font-bold',
                  item.daysUntilExpiry <= 14 ? 'bg-red-100 text-red-700' : item.daysUntilExpiry <= 30 ? 'bg-amber-100 text-amber-700' : 'bg-muted text-muted-foreground',
                )}>
                  {item.daysUntilExpiry}d
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Dispensed Items */}
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card">
          <div className="flex items-center gap-2.5 border-b border-border/50 px-5 py-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
              <ShoppingCart className="h-4 w-4 text-emerald-500" />
            </div>
            <h3 className="text-sm font-semibold">Top Dispensed This Month</h3>
          </div>
          <div className="divide-y divide-border/30">
            {TOP_ITEMS.map((item, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold">{item.name}</p>
                  <p className="text-[10px] text-muted-foreground">{item.dispensed} units dispensed</p>
                </div>
                <span className="text-xs font-bold tabular-nums">${item.revenue.toLocaleString()}</span>
                <span className={cn(
                  'inline-flex items-center gap-0.5 text-[10px] font-semibold',
                  item.trend > 0 ? 'text-emerald-600' : 'text-red-500',
                )}>
                  {item.trend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {Math.abs(item.trend)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
