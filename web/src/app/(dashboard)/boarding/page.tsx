'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  PawPrint,
  Clock,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Utensils,
  Pill,
  Thermometer,
  Droplets,
  Moon,
  Sun,
  Eye,
  ChevronDown,
  ChevronUp,
  Phone,
  User,
  Activity,
  Loader2,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import toast from 'react-hot-toast';

// ── Types ──

interface BoardingPatient {
  id: string;
  patientName: string;
  species: string;
  breed: string;
  clientName: string;
  clientPhone: string;
  kennel: string;
  ward: 'general' | 'icu' | 'isolation' | 'post_op' | 'boarding';
  checkInDate: string;
  expectedCheckOut: string;
  reason: string;
  status: 'admitted' | 'stable' | 'critical' | 'improving' | 'discharged';
  dietaryNotes: string;
  medications: MedicationSchedule[];
  feedingSchedule: FeedingEntry[];
  vitalChecks: VitalCheck[];
  alerts: string[];
}

interface MedicationSchedule {
  name: string;
  dosage: string;
  frequency: string;
  nextDue: string;
  administered: boolean;
}

interface FeedingEntry {
  time: string;
  type: string;
  amount: string;
  consumed: 'full' | 'partial' | 'refused' | 'pending';
}

interface VitalCheck {
  time: string;
  temperature: number;
  heartRate: number;
  respiratoryRate: number;
  notes: string;
  recordedBy: string;
}

// ── Mock Data ──

const now = new Date();
const todayStr = now.toISOString().slice(0, 10);

const MOCK_PATIENTS: BoardingPatient[] = [
  {
    id: 'bp-1', patientName: 'Max', species: 'dog', breed: 'Golden Retriever',
    clientName: 'Michael Johnson', clientPhone: '(555) 123-4567',
    kennel: 'K-101', ward: 'post_op', checkInDate: `${todayStr}T08:00:00`,
    expectedCheckOut: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10),
    reason: 'Post-TPLO surgery monitoring',
    status: 'stable',
    dietaryNotes: 'Hill\'s i/d — small frequent meals. No treats. Water ad lib.',
    alerts: ['Check incision site q4h', 'Ice pack 10 min TID'],
    medications: [
      { name: 'Carprofen', dosage: '75mg', frequency: 'BID', nextDue: `${todayStr}T18:00:00`, administered: false },
      { name: 'Cephalexin', dosage: '500mg', frequency: 'BID', nextDue: `${todayStr}T18:00:00`, administered: false },
      { name: 'Tramadol', dosage: '50mg', frequency: 'TID', nextDue: `${todayStr}T14:00:00`, administered: true },
    ],
    feedingSchedule: [
      { time: '07:00', type: 'Hill\'s i/d (wet)', amount: '1/2 can', consumed: 'full' },
      { time: '12:00', type: 'Hill\'s i/d (wet)', amount: '1/2 can', consumed: 'partial' },
      { time: '17:00', type: 'Hill\'s i/d (wet)', amount: '1/2 can', consumed: 'pending' },
    ],
    vitalChecks: [
      { time: '08:00', temperature: 101.2, heartRate: 88, respiratoryRate: 18, notes: 'Comfortable, incision clean', recordedBy: 'Sarah Tech' },
      { time: '12:00', temperature: 101.5, heartRate: 92, respiratoryRate: 20, notes: 'Mild restlessness, offered walk', recordedBy: 'Mike Tech' },
    ],
  },
  {
    id: 'bp-2', patientName: 'Whiskers', species: 'cat', breed: 'Domestic Shorthair',
    clientName: 'Amanda Williams', clientPhone: '(555) 234-5678',
    kennel: 'C-205', ward: 'icu', checkInDate: new Date(Date.now() - 86400000).toISOString().slice(0, 10) + 'T14:00:00',
    expectedCheckOut: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
    reason: 'Diabetic ketoacidosis — IV fluids + insulin CRI',
    status: 'critical',
    dietaryNotes: 'NPO until glucose stabilizes. Then Hill\'s m/d small portions.',
    alerts: ['BG check q2h', 'IV fluids @ 25ml/hr — check catheter', 'Call owner with PM update'],
    medications: [
      { name: 'Regular Insulin CRI', dosage: '0.05 U/kg/hr', frequency: 'Continuous', nextDue: 'Ongoing', administered: true },
      { name: 'Potassium Chloride', dosage: '20mEq/L in fluids', frequency: 'Continuous', nextDue: 'Ongoing', administered: true },
      { name: 'Maropitant (Cerenia)', dosage: '4mg', frequency: 'SID', nextDue: `${todayStr}T08:00:00`, administered: true },
    ],
    feedingSchedule: [
      { time: '08:00', type: 'NPO', amount: '—', consumed: 'refused' },
      { time: '14:00', type: 'NPO', amount: '—', consumed: 'pending' },
    ],
    vitalChecks: [
      { time: '06:00', temperature: 100.8, heartRate: 180, respiratoryRate: 28, notes: 'BG: 380 mg/dL. Lethargic.', recordedBy: 'Sarah Tech' },
      { time: '08:00', temperature: 101.0, heartRate: 168, respiratoryRate: 24, notes: 'BG: 320 mg/dL. Slightly more alert.', recordedBy: 'Sarah Tech' },
      { time: '10:00', temperature: 101.2, heartRate: 160, respiratoryRate: 22, notes: 'BG: 275 mg/dL. Improving.', recordedBy: 'Mike Tech' },
      { time: '12:00', temperature: 101.4, heartRate: 155, respiratoryRate: 20, notes: 'BG: 240 mg/dL. Lifting head, interested in surroundings.', recordedBy: 'Mike Tech' },
    ],
  },
  {
    id: 'bp-3', patientName: 'Cooper', species: 'dog', breed: 'Beagle',
    clientName: 'Sarah Anderson', clientPhone: '(555) 789-0123',
    kennel: 'K-103', ward: 'boarding', checkInDate: new Date(Date.now() - 86400000).toISOString().slice(0, 10) + 'T09:00:00',
    expectedCheckOut: new Date(Date.now() + 4 * 86400000).toISOString().slice(0, 10),
    reason: 'Boarding — owner traveling',
    status: 'admitted',
    dietaryNotes: 'Purina Pro Plan — 1 cup AM/PM. Peanut butter treat at noon. Sensitive stomach.',
    alerts: [],
    medications: [
      { name: 'Simethicone', dosage: '80mg', frequency: 'PRN', nextDue: 'As needed', administered: false },
    ],
    feedingSchedule: [
      { time: '07:00', type: 'Purina Pro Plan', amount: '1 cup', consumed: 'full' },
      { time: '12:00', type: 'PB Kong treat', amount: '1', consumed: 'full' },
      { time: '17:00', type: 'Purina Pro Plan', amount: '1 cup', consumed: 'pending' },
    ],
    vitalChecks: [
      { time: '08:00', temperature: 101.0, heartRate: 80, respiratoryRate: 16, notes: 'Happy, eating well, played in yard', recordedBy: 'Mike Tech' },
    ],
  },
  {
    id: 'bp-4', patientName: 'Daisy', species: 'dog', breed: 'Pomeranian',
    clientName: 'Lisa Park', clientPhone: '(555) 345-6789',
    kennel: 'K-102', ward: 'isolation', checkInDate: `${todayStr}T10:00:00`,
    expectedCheckOut: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10),
    reason: 'Suspected parvovirus — awaiting SNAP test',
    status: 'critical',
    dietaryNotes: 'NPO. IV fluids only.',
    alerts: ['ISOLATION — full PPE required', 'Parvo SNAP pending', 'Strict barrier protocol', 'Monitor for bloody diarrhea'],
    medications: [
      { name: 'LRS + Dextrose IV', dosage: '30ml/hr', frequency: 'Continuous', nextDue: 'Ongoing', administered: true },
      { name: 'Maropitant', dosage: '1mg/kg SQ', frequency: 'SID', nextDue: `${todayStr}T10:00:00`, administered: true },
      { name: 'Ampicillin', dosage: '22mg/kg IV', frequency: 'TID', nextDue: `${todayStr}T18:00:00`, administered: false },
    ],
    feedingSchedule: [
      { time: '—', type: 'NPO', amount: '—', consumed: 'refused' },
    ],
    vitalChecks: [
      { time: '10:00', temperature: 103.8, heartRate: 160, respiratoryRate: 32, notes: 'Febrile, dehydrated (~7%), watery diarrhea', recordedBy: 'Sarah Tech' },
      { time: '12:00', temperature: 103.2, heartRate: 148, respiratoryRate: 28, notes: 'Fluids running. Slightly less lethargic.', recordedBy: 'Sarah Tech' },
    ],
  },
  {
    id: 'bp-5', patientName: 'Luna', species: 'cat', breed: 'Siamese',
    clientName: 'Michael Johnson', clientPhone: '(555) 123-4567',
    kennel: 'C-201', ward: 'general', checkInDate: new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10) + 'T11:00:00',
    expectedCheckOut: todayStr,
    reason: 'Post-dental cleaning observation',
    status: 'improving',
    dietaryNotes: 'Soft food only for 3 days. Royal Canin Recovery.',
    alerts: ['Ready for discharge — call owner'],
    medications: [
      { name: 'Buprenorphine', dosage: '0.02mg/kg', frequency: 'BID', nextDue: `${todayStr}T16:00:00`, administered: false },
    ],
    feedingSchedule: [
      { time: '07:00', type: 'RC Recovery (soft)', amount: '1/4 can', consumed: 'full' },
      { time: '12:00', type: 'RC Recovery (soft)', amount: '1/4 can', consumed: 'full' },
      { time: '17:00', type: 'RC Recovery (soft)', amount: '1/4 can', consumed: 'pending' },
    ],
    vitalChecks: [
      { time: '08:00', temperature: 101.0, heartRate: 170, respiratoryRate: 22, notes: 'Bright, eating well. Mouth looks good.', recordedBy: 'Mike Tech' },
    ],
  },
];

// ── Styles ──

const WARD_STYLES: Record<string, { bg: string; text: string; label: string; border: string }> = {
  general: { bg: 'bg-blue-100 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-400', label: 'General', border: 'border-l-blue-500' },
  icu: { bg: 'bg-red-100 dark:bg-red-950/40', text: 'text-red-700 dark:text-red-400', label: 'ICU', border: 'border-l-red-500' },
  isolation: { bg: 'bg-orange-100 dark:bg-orange-950/40', text: 'text-orange-700 dark:text-orange-400', label: 'Isolation', border: 'border-l-orange-500' },
  post_op: { bg: 'bg-purple-100 dark:bg-purple-950/40', text: 'text-purple-700 dark:text-purple-400', label: 'Post-Op', border: 'border-l-purple-500' },
  boarding: { bg: 'bg-emerald-100 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-400', label: 'Boarding', border: 'border-l-emerald-500' },
};

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  admitted: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  stable: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  critical: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500 animate-pulse' },
  improving: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  discharged: { bg: 'bg-muted', text: 'text-muted-foreground', dot: 'bg-gray-400' },
};

const CONSUMED_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  full: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Full' },
  partial: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Partial' },
  refused: { bg: 'bg-red-100', text: 'text-red-700', label: 'Refused' },
  pending: { bg: 'bg-muted', text: 'text-muted-foreground', label: 'Pending' },
};

export default function BoardingPage() {
  const [patients, setPatients] = useState(MOCK_PATIENTS);
  const [wardFilter, setWardFilter] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<'overview' | 'meds' | 'feeding' | 'vitals'>('overview');

  const filtered = wardFilter ? patients.filter((p) => p.ward === wardFilter) : patients;
  const criticalCount = patients.filter((p) => p.status === 'critical').length;
  const icuCount = patients.filter((p) => p.ward === 'icu').length;
  const boardingCount = patients.filter((p) => p.ward === 'boarding').length;

  // Kennel grid data
  const wardCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    patients.forEach((p) => { counts[p.ward] = (counts[p.ward] || 0) + 1; });
    return counts;
  }, [patients]);

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Home className="h-5 w-5 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Boarding & Hospitalization</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Inpatient Management</h1>
        </div>
        <div className="flex items-center gap-2">
          {criticalCount > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700 dark:bg-red-950/40 dark:text-red-400">
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" /> {criticalCount} Critical
            </span>
          )}
          <button className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/90 px-5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:shadow-lg hover:brightness-110 active:scale-[0.98]">
            <Plus className="h-4 w-4" /> Admit Patient
          </button>
        </div>
      </div>

      {/* Stats + Ward Filter */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        {[
          { label: 'Total Inpatients', value: patients.length, gradient: 'from-blue-500 to-blue-600', accent: 'text-blue-600' },
          { label: 'ICU', value: icuCount, gradient: 'from-red-500 to-red-600', accent: 'text-red-600' },
          { label: 'Post-Op', value: wardCounts['post_op'] || 0, gradient: 'from-purple-500 to-purple-600', accent: 'text-purple-600' },
          { label: 'Boarding', value: boardingCount, gradient: 'from-emerald-500 to-emerald-600', accent: 'text-emerald-600' },
          { label: 'Critical', value: criticalCount, gradient: 'from-orange-500 to-orange-600', accent: 'text-orange-600' },
        ].map((stat) => (
          <div key={stat.label} className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 shadow-card">
            <div className={cn('absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r', stat.gradient)} />
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{stat.label}</p>
            <p className={cn('mt-1 text-2xl font-bold tabular-nums', stat.accent)}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Ward filter chips */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        <button
          onClick={() => setWardFilter(null)}
          className={cn('rounded-full px-3 py-1 text-[11px] font-semibold transition-all', !wardFilter ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground')}
        >
          All ({patients.length})
        </button>
        {Object.entries(WARD_STYLES).map(([key, style]) => (
          <button
            key={key}
            onClick={() => setWardFilter(wardFilter === key ? null : key)}
            className={cn('rounded-full px-3 py-1 text-[11px] font-semibold transition-all', wardFilter === key ? cn(style.bg, style.text) : 'bg-muted text-muted-foreground')}
          >
            {style.label} ({wardCounts[key] || 0})
          </button>
        ))}
      </div>

      {/* Patient Cards */}
      <div className="space-y-3">
        {filtered.map((patient) => {
          const wardStyle = WARD_STYLES[patient.ward];
          const statusStyle = STATUS_STYLES[patient.status];
          const isExpanded = expandedId === patient.id;
          const pendingMeds = patient.medications.filter((m) => !m.administered).length;
          const daysIn = Math.ceil((Date.now() - new Date(patient.checkInDate).getTime()) / 86400000);

          return (
            <motion.div
              key={patient.id}
              layout
              className={cn(
                'overflow-hidden rounded-2xl border-l-4 border border-border/60 bg-card shadow-card',
                wardStyle.border,
                patient.status === 'critical' && 'ring-1 ring-red-300 dark:ring-red-800/40',
              )}
            >
              {/* Patient Header */}
              <button
                onClick={() => { setExpandedId(isExpanded ? null : patient.id); setActiveDetailTab('overview'); }}
                className="flex w-full items-center gap-4 px-5 py-4 text-left transition-all hover:bg-muted/20"
              >
                <div className="text-center">
                  <span className="block text-lg font-bold tabular-nums text-foreground">{patient.kennel}</span>
                  <span className={cn('rounded-full px-2 py-0.5 text-[9px] font-bold', wardStyle.bg, wardStyle.text)}>
                    {wardStyle.label}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <PawPrint className="h-3.5 w-3.5 text-primary" />
                    <span className="text-sm font-semibold">{patient.patientName}</span>
                    <span className="text-[11px] text-muted-foreground">({patient.breed})</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{patient.reason}</p>
                  <div className="mt-1 flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span><User className="mr-0.5 inline h-3 w-3" />{patient.clientName}</span>
                    <span><Clock className="mr-0.5 inline h-3 w-3" />Day {daysIn}</span>
                    <span>Out: {new Date(patient.expectedCheckOut).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold', statusStyle.bg, statusStyle.text)}>
                    <span className={cn('h-1.5 w-1.5 rounded-full', statusStyle.dot)} />
                    {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                  </span>
                  {pendingMeds > 0 && (
                    <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400">
                      <Pill className="mr-0.5 inline h-3 w-3" />{pendingMeds} med{pendingMeds > 1 ? 's' : ''} due
                    </span>
                  )}
                </div>
                {patient.alerts.length > 0 && (
                  <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
                )}
                {isExpanded ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
              </button>

              {/* Expanded Detail */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-border/30">
                      {/* Alerts banner */}
                      {patient.alerts.length > 0 && (
                        <div className="bg-amber-50 px-5 py-2 dark:bg-amber-950/20">
                          <div className="flex flex-wrap gap-2">
                            {patient.alerts.map((alert, i) => (
                              <span key={i} className="inline-flex items-center gap-1 rounded-lg bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                                <AlertTriangle className="h-3 w-3" /> {alert}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tabs */}
                      <div className="flex border-b border-border/30">
                        {[
                          { key: 'overview' as const, label: 'Overview', icon: Eye },
                          { key: 'meds' as const, label: 'Medications', icon: Pill },
                          { key: 'feeding' as const, label: 'Feeding', icon: Utensils },
                          { key: 'vitals' as const, label: 'Vitals', icon: Activity },
                        ].map((tab) => (
                          <button
                            key={tab.key}
                            onClick={() => setActiveDetailTab(tab.key)}
                            className={cn(
                              'flex items-center gap-1.5 px-4 py-2.5 text-[11px] font-semibold transition-all',
                              activeDetailTab === tab.key ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground',
                            )}
                          >
                            <tab.icon className="h-3 w-3" /> {tab.label}
                          </button>
                        ))}
                      </div>

                      <div className="px-5 py-4">
                        {activeDetailTab === 'overview' && (
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                              <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Dietary Notes</p>
                              <p className="text-xs leading-relaxed">{patient.dietaryNotes}</p>
                            </div>
                            <div>
                              <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Contact</p>
                              <p className="text-xs">{patient.clientName} · <Phone className="mr-0.5 inline h-3 w-3" />{patient.clientPhone}</p>
                              <p className="mt-1 text-xs text-muted-foreground">Check-in: {new Date(patient.checkInDate).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                              <p className="text-xs text-muted-foreground">Expected out: {new Date(patient.expectedCheckOut).toLocaleDateString([], { month: 'short', day: 'numeric' })}</p>
                            </div>
                          </div>
                        )}

                        {activeDetailTab === 'meds' && (
                          <div className="space-y-2">
                            {patient.medications.map((med, i) => (
                              <div key={i} className={cn('flex items-center gap-3 rounded-xl border p-3', med.administered ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-800/30 dark:bg-emerald-950/10' : 'border-border/40')}>
                                <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', med.administered ? 'bg-emerald-100 dark:bg-emerald-950/40' : 'bg-amber-100 dark:bg-amber-950/40')}>
                                  {med.administered ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Clock className="h-4 w-4 text-amber-600" />}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-semibold">{med.name} — {med.dosage}</p>
                                  <p className="text-[10px] text-muted-foreground">{med.frequency} · Next: {med.nextDue === 'Ongoing' ? 'Continuous' : new Date(med.nextDue).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                                {!med.administered && (
                                  <button
                                    onClick={() => {
                                      setPatients((prev) => prev.map((p) => p.id === patient.id ? { ...p, medications: p.medications.map((m, j) => j === i ? { ...m, administered: true } : m) } : p));
                                      toast.success(`${med.name} administered`);
                                    }}
                                    className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-[10px] font-semibold text-primary-foreground"
                                  >
                                    Administer
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {activeDetailTab === 'feeding' && (
                          <div className="space-y-2">
                            {patient.feedingSchedule.map((entry, i) => {
                              const cStyle = CONSUMED_STYLES[entry.consumed];
                              return (
                                <div key={i} className="flex items-center gap-3 rounded-xl border border-border/40 p-3">
                                  <span className="w-12 text-xs font-bold tabular-nums text-muted-foreground">{entry.time}</span>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-medium">{entry.type}</p>
                                    <p className="text-[10px] text-muted-foreground">{entry.amount}</p>
                                  </div>
                                  <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', cStyle.bg, cStyle.text)}>{cStyle.label}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {activeDetailTab === 'vitals' && (
                          <div className="space-y-2">
                            {patient.vitalChecks.length > 0 ? patient.vitalChecks.map((v, i) => (
                              <div key={i} className="rounded-xl border border-border/40 p-3">
                                <div className="mb-2 flex items-center justify-between">
                                  <span className="text-xs font-bold tabular-nums">{v.time}</span>
                                  <span className="text-[10px] text-muted-foreground">by {v.recordedBy}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                  <div className="rounded-lg bg-muted/30 p-2 text-center">
                                    <Thermometer className="mx-auto mb-0.5 h-3.5 w-3.5 text-muted-foreground" />
                                    <p className="text-sm font-bold tabular-nums">{v.temperature}°F</p>
                                    <p className="text-[9px] text-muted-foreground">Temp</p>
                                  </div>
                                  <div className="rounded-lg bg-muted/30 p-2 text-center">
                                    <Activity className="mx-auto mb-0.5 h-3.5 w-3.5 text-muted-foreground" />
                                    <p className="text-sm font-bold tabular-nums">{v.heartRate} bpm</p>
                                    <p className="text-[9px] text-muted-foreground">HR</p>
                                  </div>
                                  <div className="rounded-lg bg-muted/30 p-2 text-center">
                                    <Droplets className="mx-auto mb-0.5 h-3.5 w-3.5 text-muted-foreground" />
                                    <p className="text-sm font-bold tabular-nums">{v.respiratoryRate} /min</p>
                                    <p className="text-[9px] text-muted-foreground">RR</p>
                                  </div>
                                </div>
                                {v.notes && <p className="mt-2 text-[11px] text-muted-foreground">{v.notes}</p>}
                              </div>
                            )) : (
                              <p className="py-4 text-center text-xs text-muted-foreground">No vital checks recorded yet</p>
                            )}
                          </div>
                        )}
                      </div>
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
