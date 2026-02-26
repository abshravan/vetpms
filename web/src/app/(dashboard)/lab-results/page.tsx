'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FlaskConical,
  Search,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Download,
  Printer,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  FileText,
  Microscope,
} from 'lucide-react';
import { cn } from '../../../lib/utils';

// ── Types ──

interface LabPanel {
  id: string;
  patientName: string;
  patientId: string;
  species: string;
  breed: string;
  clientName: string;
  orderedBy: string;
  orderDate: string;
  status: 'ordered' | 'in_progress' | 'completed' | 'cancelled';
  panelName: string;
  priority: 'routine' | 'stat' | 'urgent';
  results: LabResult[];
  notes: string;
}

interface LabResult {
  testName: string;
  value: number | string;
  unit: string;
  referenceRange: string;
  refLow: number;
  refHigh: number;
  status: 'normal' | 'low' | 'high' | 'critical_low' | 'critical_high';
  previousValue?: number | string;
  flag: string;
}

// ── Mock Data ──

const MOCK_PANELS: LabPanel[] = [
  {
    id: 'lab-1',
    patientName: 'Bella', patientId: '30000000-0000-0000-0000-000000000003', species: 'dog', breed: 'Labrador Retriever', clientName: 'Amanda Williams',
    orderedBy: 'Dr. Carter', orderDate: new Date().toISOString(),
    status: 'completed', panelName: 'Comprehensive Metabolic Panel', priority: 'routine',
    notes: 'Pre-anesthetic bloodwork for upcoming dental cleaning.',
    results: [
      { testName: 'BUN (Blood Urea Nitrogen)', value: 18, unit: 'mg/dL', referenceRange: '7-27', refLow: 7, refHigh: 27, status: 'normal', previousValue: 16, flag: '' },
      { testName: 'Creatinine', value: 1.2, unit: 'mg/dL', referenceRange: '0.5-1.8', refLow: 0.5, refHigh: 1.8, status: 'normal', previousValue: 1.1, flag: '' },
      { testName: 'ALT (SGPT)', value: 82, unit: 'U/L', referenceRange: '10-125', refLow: 10, refHigh: 125, status: 'normal', previousValue: 68, flag: '' },
      { testName: 'ALP', value: 185, unit: 'U/L', referenceRange: '23-212', refLow: 23, refHigh: 212, status: 'normal', previousValue: 145, flag: '' },
      { testName: 'Total Protein', value: 7.2, unit: 'g/dL', referenceRange: '5.2-8.2', refLow: 5.2, refHigh: 8.2, status: 'normal', previousValue: 7.0, flag: '' },
      { testName: 'Albumin', value: 3.4, unit: 'g/dL', referenceRange: '2.3-4.0', refLow: 2.3, refHigh: 4.0, status: 'normal', flag: '' },
      { testName: 'Glucose', value: 112, unit: 'mg/dL', referenceRange: '74-143', refLow: 74, refHigh: 143, status: 'normal', previousValue: 105, flag: '' },
      { testName: 'Cholesterol', value: 295, unit: 'mg/dL', referenceRange: '110-320', refLow: 110, refHigh: 320, status: 'normal', flag: '' },
      { testName: 'Calcium', value: 10.8, unit: 'mg/dL', referenceRange: '7.9-12.0', refLow: 7.9, refHigh: 12.0, status: 'normal', flag: '' },
      { testName: 'Phosphorus', value: 4.5, unit: 'mg/dL', referenceRange: '2.5-6.8', refLow: 2.5, refHigh: 6.8, status: 'normal', flag: '' },
    ],
  },
  {
    id: 'lab-2',
    patientName: 'Max', patientId: '30000000-0000-0000-0000-000000000001', species: 'dog', breed: 'Golden Retriever', clientName: 'Michael Johnson',
    orderedBy: 'Dr. Carter', orderDate: new Date(Date.now() - 86400000).toISOString(),
    status: 'completed', panelName: 'Complete Blood Count (CBC)', priority: 'stat',
    notes: 'Evaluate for infection post-surgery. Monitor WBC trend.',
    results: [
      { testName: 'WBC', value: 19.8, unit: 'K/uL', referenceRange: '5.5-16.9', refLow: 5.5, refHigh: 16.9, status: 'high', previousValue: 14.2, flag: 'H' },
      { testName: 'RBC', value: 6.8, unit: 'M/uL', referenceRange: '5.5-8.5', refLow: 5.5, refHigh: 8.5, status: 'normal', previousValue: 7.1, flag: '' },
      { testName: 'Hemoglobin', value: 15.2, unit: 'g/dL', referenceRange: '12-18', refLow: 12, refHigh: 18, status: 'normal', flag: '' },
      { testName: 'Hematocrit', value: 45, unit: '%', referenceRange: '37-55', refLow: 37, refHigh: 55, status: 'normal', previousValue: 48, flag: '' },
      { testName: 'Platelets', value: 280, unit: 'K/uL', referenceRange: '175-500', refLow: 175, refHigh: 500, status: 'normal', flag: '' },
      { testName: 'Neutrophils', value: 82, unit: '%', referenceRange: '60-77', refLow: 60, refHigh: 77, status: 'high', previousValue: 72, flag: 'H' },
      { testName: 'Lymphocytes', value: 10, unit: '%', referenceRange: '12-30', refLow: 12, refHigh: 30, status: 'low', previousValue: 18, flag: 'L' },
      { testName: 'Monocytes', value: 6, unit: '%', referenceRange: '3-10', refLow: 3, refHigh: 10, status: 'normal', flag: '' },
      { testName: 'Eosinophils', value: 2, unit: '%', referenceRange: '2-10', refLow: 2, refHigh: 10, status: 'normal', flag: '' },
    ],
  },
  {
    id: 'lab-3',
    patientName: 'Cleo', patientId: '30000000-0000-0000-0000-000000000007', species: 'cat', breed: 'Maine Coon', clientName: 'Karen Thomas',
    orderedBy: 'Dr. Park', orderDate: new Date(Date.now() - 2 * 86400000).toISOString(),
    status: 'completed', panelName: 'Thyroid + Renal Panel', priority: 'routine',
    notes: 'Annual senior screening. Monitor kidney values.',
    results: [
      { testName: 'T4 (Total)', value: 4.8, unit: 'ug/dL', referenceRange: '1.0-4.0', refLow: 1.0, refHigh: 4.0, status: 'high', flag: 'H' },
      { testName: 'Free T4', value: 42, unit: 'pmol/L', referenceRange: '12-35', refLow: 12, refHigh: 35, status: 'high', flag: 'H' },
      { testName: 'BUN', value: 32, unit: 'mg/dL', referenceRange: '16-36', refLow: 16, refHigh: 36, status: 'normal', previousValue: 28, flag: '' },
      { testName: 'Creatinine', value: 2.1, unit: 'mg/dL', referenceRange: '0.8-2.4', refLow: 0.8, refHigh: 2.4, status: 'normal', previousValue: 1.8, flag: '' },
      { testName: 'SDMA', value: 18, unit: 'ug/dL', referenceRange: '0-14', refLow: 0, refHigh: 14, status: 'high', previousValue: 12, flag: 'H' },
      { testName: 'Phosphorus', value: 5.2, unit: 'mg/dL', referenceRange: '3.1-6.8', refLow: 3.1, refHigh: 6.8, status: 'normal', flag: '' },
    ],
  },
  {
    id: 'lab-4',
    patientName: 'Thor', patientId: '30000000-0000-0000-0000-000000000009', species: 'dog', breed: 'Rottweiler', clientName: 'Emily Chen',
    orderedBy: 'Dr. Carter', orderDate: new Date().toISOString(),
    status: 'in_progress', panelName: 'Urinalysis + Culture', priority: 'urgent',
    notes: 'Suspected UTI. Straining to urinate, hematuria.',
    results: [],
  },
  {
    id: 'lab-5',
    patientName: 'Cooper', patientId: '30000000-0000-0000-0000-000000000005', species: 'dog', breed: 'Beagle', clientName: 'Sarah Anderson',
    orderedBy: 'Dr. Park', orderDate: new Date().toISOString(),
    status: 'ordered', panelName: 'Heartworm/Tick Panel (4Dx)', priority: 'routine',
    notes: 'Annual heartworm screening.',
    results: [],
  },
];

// ── Styles ──

const PANEL_STATUS_STYLES = {
  ordered: { bg: 'bg-blue-100 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-400', label: 'Ordered', icon: Clock },
  in_progress: { bg: 'bg-amber-100 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-400', label: 'Processing', icon: Loader2 },
  completed: { bg: 'bg-emerald-100 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-400', label: 'Completed', icon: CheckCircle2 },
  cancelled: { bg: 'bg-red-100 dark:bg-red-950/40', text: 'text-red-700 dark:text-red-400', label: 'Cancelled', icon: XCircle },
};

const PRIORITY_STYLES = {
  routine: { bg: 'bg-muted', text: 'text-muted-foreground' },
  stat: { bg: 'bg-red-100 dark:bg-red-950/40', text: 'text-red-700 dark:text-red-400' },
  urgent: { bg: 'bg-amber-100 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-400' },
};

function ResultBar({ value, refLow, refHigh, status }: { value: number; refLow: number; refHigh: number; status: string }) {
  const range = refHigh - refLow;
  const numVal = typeof value === 'number' ? value : parseFloat(String(value));
  if (isNaN(numVal)) return null;

  // Position within the visual bar (extend range by 40% on each side for out-of-range values)
  const extendedLow = refLow - range * 0.4;
  const extendedHigh = refHigh + range * 0.4;
  const extendedRange = extendedHigh - extendedLow;
  const clampedValue = Math.min(Math.max(numVal, extendedLow), extendedHigh);
  const position = ((clampedValue - extendedLow) / extendedRange) * 100;
  const refLowPos = ((refLow - extendedLow) / extendedRange) * 100;
  const refHighPos = ((refHigh - extendedLow) / extendedRange) * 100;

  return (
    <div className="relative h-3 w-full min-w-[120px] rounded-full bg-muted/40">
      {/* Normal range highlight */}
      <div
        className="absolute inset-y-0 rounded-full bg-emerald-100 dark:bg-emerald-950/30"
        style={{ left: `${refLowPos}%`, width: `${refHighPos - refLowPos}%` }}
      />
      {/* Value marker */}
      <div
        className={cn(
          'absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md dark:border-gray-800',
          status === 'normal' ? 'bg-emerald-500' :
          status === 'high' || status === 'low' ? 'bg-amber-500' :
          'bg-red-500',
        )}
        style={{ left: `${position}%` }}
      />
    </div>
  );
}

export default function LabResultsPage() {
  const [panels] = useState(MOCK_PANELS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [expandedPanel, setExpandedPanel] = useState<string | null>(null);

  const filteredPanels = panels.filter((p) => {
    if (statusFilter && p.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return p.patientName.toLowerCase().includes(q) || p.panelName.toLowerCase().includes(q) || p.clientName.toLowerCase().includes(q);
    }
    return true;
  });

  const completedCount = panels.filter((p) => p.status === 'completed').length;
  const pendingCount = panels.filter((p) => p.status === 'ordered' || p.status === 'in_progress').length;
  const abnormalCount = panels.reduce((sum, p) => sum + p.results.filter((r) => r.status !== 'normal').length, 0);

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Laboratory</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Lab Results</h1>
        </div>
        <button className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/90 px-5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:shadow-lg hover:brightness-110 active:scale-[0.98]">
          <Plus className="h-4 w-4" /> Order Lab Work
        </button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Total Panels', value: panels.length, icon: FileText, gradient: 'from-blue-500 to-blue-600', accent: 'text-blue-600' },
          { label: 'Completed', value: completedCount, icon: CheckCircle2, gradient: 'from-emerald-500 to-emerald-600', accent: 'text-emerald-600' },
          { label: 'Pending', value: pendingCount, icon: Clock, gradient: 'from-amber-500 to-amber-600', accent: 'text-amber-600' },
          { label: 'Abnormal Values', value: abnormalCount, icon: AlertTriangle, gradient: 'from-red-500 to-red-600', accent: 'text-red-600' },
        ].map((stat) => (
          <div key={stat.label} className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 shadow-card">
            <div className={cn('absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r', stat.gradient)} />
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{stat.label}</p>
            <p className={cn('mt-1 text-2xl font-bold tabular-nums', stat.accent)}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by patient, panel, or client..."
            className="h-10 w-full rounded-xl border border-border/40 bg-muted/20 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex gap-1">
          {(['ordered', 'in_progress', 'completed'] as const).map((st) => {
            const style = PANEL_STATUS_STYLES[st];
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(statusFilter === st ? null : st)}
                className={cn(
                  'rounded-lg px-3 py-2 text-[11px] font-bold transition-all',
                  statusFilter === st ? cn(style.bg, style.text) : 'bg-muted text-muted-foreground hover:bg-muted/80',
                )}
              >
                {style.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Lab Panels */}
      <div className="space-y-3">
        {filteredPanels.map((panel) => {
          const isExpanded = expandedPanel === panel.id;
          const stStyle = PANEL_STATUS_STYLES[panel.status];
          const prStyle = PRIORITY_STYLES[panel.priority];
          const StatusIcon = stStyle.icon;
          const abnormalResults = panel.results.filter((r) => r.status !== 'normal');

          return (
            <motion.div
              key={panel.id}
              layout
              className={cn(
                'overflow-hidden rounded-2xl border bg-card shadow-card transition-all',
                abnormalResults.length > 0 ? 'border-amber-200 dark:border-amber-800/40' : 'border-border/60',
              )}
            >
              {/* Panel Header */}
              <button
                onClick={() => setExpandedPanel(isExpanded ? null : panel.id)}
                className="flex w-full items-center gap-4 px-5 py-4 text-left transition-all hover:bg-muted/20"
              >
                <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', stStyle.bg)}>
                  <StatusIcon className={cn('h-5 w-5', stStyle.text, panel.status === 'in_progress' && 'animate-spin')} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{panel.panelName}</span>
                    <span className={cn('rounded-full px-2 py-0.5 text-[9px] font-bold uppercase', prStyle.bg, prStyle.text)}>
                      {panel.priority}
                    </span>
                    {abnormalResults.length > 0 && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                        <AlertTriangle className="h-2.5 w-2.5" /> {abnormalResults.length} abnormal
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span>{panel.patientName} ({panel.breed})</span>
                    <span>·</span>
                    <span>{panel.clientName}</span>
                    <span>·</span>
                    <span>{panel.orderedBy}</span>
                    <span>·</span>
                    <span>{new Date(panel.orderDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <span className={cn('shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold', stStyle.bg, stStyle.text)}>
                  {stStyle.label}
                </span>
                {isExpanded ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
              </button>

              {/* Expanded Results */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-border/30 px-5 py-4">
                      {panel.notes && (
                        <div className="mb-4 rounded-xl bg-muted/30 px-4 py-3">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Clinical Notes</p>
                          <p className="mt-1 text-xs">{panel.notes}</p>
                        </div>
                      )}

                      {panel.results.length > 0 ? (
                        <>
                          {/* Results table */}
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                              <thead>
                                <tr className="border-b border-border/40">
                                  <th className="py-2 pr-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Test</th>
                                  <th className="py-2 pr-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Result</th>
                                  <th className="py-2 pr-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Unit</th>
                                  <th className="py-2 pr-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Reference</th>
                                  <th className="py-2 pr-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Range</th>
                                  <th className="py-2 pr-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Prev</th>
                                  <th className="py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Flag</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-border/20">
                                {panel.results.map((result, i) => (
                                  <tr
                                    key={i}
                                    className={cn(
                                      'transition-colors',
                                      result.status !== 'normal' && 'bg-amber-50/50 dark:bg-amber-950/10',
                                    )}
                                  >
                                    <td className="py-2.5 pr-4 text-xs font-medium">{result.testName}</td>
                                    <td className={cn(
                                      'py-2.5 pr-4 text-xs font-bold tabular-nums',
                                      result.status === 'normal' ? 'text-foreground' :
                                      result.status === 'high' || result.status === 'low' ? 'text-amber-600 dark:text-amber-400' :
                                      'text-red-600 dark:text-red-400',
                                    )}>
                                      {result.value}
                                    </td>
                                    <td className="py-2.5 pr-4 text-[11px] text-muted-foreground">{result.unit}</td>
                                    <td className="py-2.5 pr-4 text-[11px] text-muted-foreground">{result.referenceRange}</td>
                                    <td className="py-2.5 pr-4">
                                      {typeof result.value === 'number' && (
                                        <ResultBar value={result.value} refLow={result.refLow} refHigh={result.refHigh} status={result.status} />
                                      )}
                                    </td>
                                    <td className="py-2.5 pr-4">
                                      {result.previousValue !== undefined ? (
                                        <div className="flex items-center gap-1">
                                          <span className="text-[11px] tabular-nums text-muted-foreground">{result.previousValue}</span>
                                          {typeof result.value === 'number' && typeof result.previousValue === 'number' && (
                                            result.value > result.previousValue
                                              ? <TrendingUp className="h-3 w-3 text-amber-500" />
                                              : result.value < result.previousValue
                                                ? <TrendingDown className="h-3 w-3 text-blue-500" />
                                                : <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                          )}
                                        </div>
                                      ) : (
                                        <span className="text-[11px] text-muted-foreground/30">—</span>
                                      )}
                                    </td>
                                    <td className="py-2.5">
                                      {result.flag && (
                                        <span className={cn(
                                          'rounded-md px-1.5 py-0.5 text-[10px] font-bold',
                                          result.flag === 'H' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' :
                                          result.flag === 'L' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400' :
                                          'bg-red-100 text-red-700',
                                        )}>
                                          {result.flag}
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Actions */}
                          <div className="mt-4 flex items-center gap-2">
                            <button className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border/40 px-3 text-xs font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground">
                              <Printer className="h-3 w-3" /> Print
                            </button>
                            <button className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border/40 px-3 text-xs font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground">
                              <Download className="h-3 w-3" /> Export PDF
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                          <Microscope className="mb-2 h-8 w-8 opacity-30" />
                          <p className="text-sm font-medium">Results pending</p>
                          <p className="text-xs">Lab work is {panel.status === 'ordered' ? 'awaiting processing' : 'currently being processed'}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
