'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import {
  BrainCircuit,
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Heart,
  Activity,
  Shield,
  Loader2,
  ArrowUpRight,
  Eye,
} from 'lucide-react';
import { cn } from '../lib/utils';

// ── Simulated Predictive Data ──

interface HealthRiskScore {
  patientName: string;
  patientId: string;
  species: string;
  breed: string;
  age: number;
  overallScore: number; // 0-100, 100 = healthiest
  riskFactors: { name: string; score: number; trend: 'improving' | 'stable' | 'declining' }[];
  predictions: { condition: string; probability: number; timeframe: string }[];
}

interface PopulationInsight {
  metric: string;
  value: string;
  change: number; // percentage
  trend: 'up' | 'down' | 'flat';
  detail: string;
}

interface DiseasePrevalence {
  condition: string;
  count: number;
  percentage: number;
  color: string;
}

const MOCK_RISK_SCORES: HealthRiskScore[] = [
  {
    patientName: 'Max', patientId: '30000000-0000-0000-0000-000000000001', species: 'dog', breed: 'Golden Retriever', age: 4,
    overallScore: 88,
    riskFactors: [
      { name: 'Weight', score: 85, trend: 'stable' },
      { name: 'Dental', score: 92, trend: 'stable' },
      { name: 'Cardiac', score: 90, trend: 'stable' },
      { name: 'Joint', score: 78, trend: 'declining' },
      { name: 'Cancer', score: 82, trend: 'stable' },
    ],
    predictions: [
      { condition: 'Joint Dysplasia', probability: 18, timeframe: '2-4 years' },
      { condition: 'Obesity Risk', probability: 12, timeframe: '1-2 years' },
    ],
  },
  {
    patientName: 'Bella', patientId: '30000000-0000-0000-0000-000000000003', species: 'dog', breed: 'Labrador Retriever', age: 6,
    overallScore: 72,
    riskFactors: [
      { name: 'Weight', score: 68, trend: 'declining' },
      { name: 'Dental', score: 75, trend: 'declining' },
      { name: 'Cardiac', score: 88, trend: 'stable' },
      { name: 'Joint', score: 55, trend: 'declining' },
      { name: 'Cancer', score: 78, trend: 'stable' },
    ],
    predictions: [
      { condition: 'Hip Dysplasia Progression', probability: 65, timeframe: '6-12 months' },
      { condition: 'Dental Disease Grade III', probability: 35, timeframe: '1 year' },
      { condition: 'Obesity (BCS 7+)', probability: 28, timeframe: '6 months' },
    ],
  },
  {
    patientName: 'Thor', patientId: '30000000-0000-0000-0000-000000000009', species: 'dog', breed: 'Rottweiler', age: 3,
    overallScore: 76,
    riskFactors: [
      { name: 'Weight', score: 60, trend: 'declining' },
      { name: 'Dental', score: 90, trend: 'stable' },
      { name: 'Cardiac', score: 82, trend: 'stable' },
      { name: 'Joint', score: 70, trend: 'stable' },
      { name: 'Cancer', score: 75, trend: 'stable' },
    ],
    predictions: [
      { condition: 'Cruciate Ligament Issue', probability: 25, timeframe: '1-3 years' },
      { condition: 'Obesity Risk', probability: 40, timeframe: '6 months' },
    ],
  },
  {
    patientName: 'Luna', patientId: '30000000-0000-0000-0000-000000000002', species: 'cat', breed: 'Siamese', age: 3,
    overallScore: 94,
    riskFactors: [
      { name: 'Weight', score: 95, trend: 'stable' },
      { name: 'Dental', score: 88, trend: 'stable' },
      { name: 'Cardiac', score: 96, trend: 'stable' },
      { name: 'Renal', score: 95, trend: 'stable' },
      { name: 'Respiratory', score: 92, trend: 'stable' },
    ],
    predictions: [
      { condition: 'Dental Tartar (Grade II)', probability: 15, timeframe: '2 years' },
    ],
  },
  {
    patientName: 'Milo', patientId: '30000000-0000-0000-0000-000000000012', species: 'dog', breed: 'French Bulldog', age: 4,
    overallScore: 68,
    riskFactors: [
      { name: 'Weight', score: 72, trend: 'stable' },
      { name: 'Dental', score: 65, trend: 'declining' },
      { name: 'Cardiac', score: 70, trend: 'stable' },
      { name: 'Respiratory', score: 50, trend: 'declining' },
      { name: 'Spinal', score: 75, trend: 'stable' },
    ],
    predictions: [
      { condition: 'Brachycephalic Syndrome', probability: 55, timeframe: 'Ongoing' },
      { condition: 'IVDD', probability: 20, timeframe: '2-5 years' },
      { condition: 'Dental Disease', probability: 42, timeframe: '1 year' },
    ],
  },
];

const POPULATION_INSIGHTS: PopulationInsight[] = [
  { metric: 'Avg Health Score', value: '79.6', change: 2.1, trend: 'up', detail: 'Across all active patients' },
  { metric: 'Vaccination Rate', value: '87%', change: 5, trend: 'up', detail: 'Core vaccines up to date' },
  { metric: 'Obesity Rate', value: '23%', change: -3, trend: 'down', detail: 'BCS 7+ patients improving' },
  { metric: 'Dental Disease', value: '34%', change: 1, trend: 'up', detail: 'Grade II+ periodontal disease' },
];

const DISEASE_PREVALENCE: DiseasePrevalence[] = [
  { condition: 'Periodontal Disease', count: 5, percentage: 38, color: '#f59e0b' },
  { condition: 'Obesity', count: 3, percentage: 23, color: '#ef4444' },
  { condition: 'Joint Disease', count: 3, percentage: 23, color: '#8b5cf6' },
  { condition: 'Allergies', count: 2, percentage: 15, color: '#3b82f6' },
  { condition: 'Respiratory', count: 1, percentage: 8, color: '#10b981' },
];

const HEALTH_TREND_DATA = [
  { month: 'Aug', avgScore: 76, atRisk: 4 },
  { month: 'Sep', avgScore: 77, atRisk: 4 },
  { month: 'Oct', avgScore: 78, atRisk: 3 },
  { month: 'Nov', avgScore: 77, atRisk: 4 },
  { month: 'Dec', avgScore: 79, atRisk: 3 },
  { month: 'Jan', avgScore: 80, atRisk: 3 },
  { month: 'Feb', avgScore: 80, atRisk: 2 },
];

// ── Component ──

function ScoreRing({ score, size = 56 }: { score: number; size?: number }) {
  const color = score >= 85 ? '#10b981' : score >= 70 ? '#f59e0b' : '#ef4444';
  const r = (size - 8) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" className="text-muted/20" strokeWidth="4" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold tabular-nums">
        {score}
      </span>
    </div>
  );
}

export default function PredictiveHealthDashboard() {
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<HealthRiskScore | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const atRiskPatients = MOCK_RISK_SCORES.filter((p) => p.overallScore < 75);
  const highRiskPredictions = MOCK_RISK_SCORES.flatMap((p) =>
    p.predictions
      .filter((pred) => pred.probability >= 30)
      .map((pred) => ({ ...pred, patientName: p.patientName, patientId: p.patientId }))
  ).sort((a, b) => b.probability - a.probability);

  if (loading) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card p-8 shadow-card">
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="relative">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 p-3">
              <BrainCircuit className="h-8 w-8 text-cyan-500" />
            </div>
            <Loader2 className="absolute -bottom-1 -right-1 h-5 w-5 animate-spin text-cyan-500" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">Loading Predictive Health Insights...</p>
            <p className="mt-1 text-xs text-muted-foreground">Analyzing patient population data</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Section header */}
      <div className="mb-6 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 shadow-md">
          <BrainCircuit className="h-4 w-4 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold tracking-tight">Predictive Health Insights</h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-cyan-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-400">
              <Sparkles className="h-2.5 w-2.5" /> AI
            </span>
          </div>
          <p className="text-xs text-muted-foreground">ML-powered health risk analysis across your patient population</p>
        </div>
      </div>

      {/* Population Overview Cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {POPULATION_INSIGHTS.map((insight, i) => (
          <motion.div
            key={insight.metric}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 shadow-card"
          >
            <div className={cn('absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r', insight.trend === 'up' ? 'from-emerald-500 to-emerald-600' : insight.trend === 'down' ? 'from-blue-500 to-blue-600' : 'from-gray-400 to-gray-500')} />
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{insight.metric}</p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold tabular-nums">{insight.value}</span>
              <span className={cn(
                'inline-flex items-center gap-0.5 text-[11px] font-semibold',
                insight.change > 0 && insight.metric !== 'Dental Disease' && insight.metric !== 'Obesity Rate'
                  ? 'text-emerald-600'
                  : insight.change < 0 && (insight.metric === 'Obesity Rate')
                    ? 'text-emerald-600'
                    : 'text-red-500',
              )}>
                {insight.change > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {Math.abs(insight.change)}%
              </span>
            </div>
            <p className="mt-0.5 text-[10px] text-muted-foreground">{insight.detail}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Health Score Trend */}
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card lg:col-span-2">
          <div className="flex items-center gap-2.5 border-b border-border/50 px-5 py-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
              <Activity className="h-4 w-4 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Population Health Trend</h3>
              <p className="text-[11px] text-muted-foreground">Average health score & at-risk count over time</p>
            </div>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={HEALTH_TREND_DATA} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" strokeOpacity={0.4} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" domain={[60, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="avgScore" name="Avg Health Score" stroke="#10b981" strokeWidth={2.5} fill="url(#healthGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Disease Prevalence */}
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card">
          <div className="flex items-center gap-2.5 border-b border-border/50 px-5 py-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/30">
              <Shield className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Disease Prevalence</h3>
              <p className="text-[11px] text-muted-foreground">Common conditions in your practice</p>
            </div>
          </div>
          <div className="p-5">
            <div className="space-y-3">
              {DISEASE_PREVALENCE.map((disease) => (
                <div key={disease.condition}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs font-medium">{disease.condition}</span>
                    <span className="text-[10px] font-bold tabular-nums text-muted-foreground">{disease.percentage}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted/50">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${disease.percentage}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: disease.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Patient Risk Cards */}
      <div className="mt-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Individual Patient Risk Profiles</h3>
          <span className="text-[11px] text-muted-foreground">{MOCK_RISK_SCORES.length} patients analyzed</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {MOCK_RISK_SCORES.map((patient, i) => (
            <motion.div
              key={patient.patientId}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              onClick={() => setSelectedPatient(selectedPatient?.patientId === patient.patientId ? null : patient)}
              className={cn(
                'cursor-pointer rounded-2xl border bg-card p-4 shadow-card transition-all hover:shadow-card-hover hover:-translate-y-0.5',
                selectedPatient?.patientId === patient.patientId
                  ? 'border-primary/40 ring-2 ring-primary/20'
                  : 'border-border/60',
                patient.overallScore < 70 && 'border-l-4 border-l-red-500',
              )}
            >
              <div className="flex items-center gap-3">
                <ScoreRing score={patient.overallScore} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{patient.patientName}</p>
                  <p className="text-[11px] text-muted-foreground">{patient.breed} · {patient.age}y</p>
                  {patient.predictions.length > 0 && (
                    <p className="mt-1 truncate text-[10px] text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="mr-0.5 inline h-3 w-3" />
                      {patient.predictions[0].condition} ({patient.predictions[0].probability}%)
                    </p>
                  )}
                </div>
                <ArrowUpRight className={cn(
                  'h-4 w-4 shrink-0 transition-all',
                  selectedPatient?.patientId === patient.patientId
                    ? 'rotate-90 text-primary'
                    : 'text-muted-foreground/30',
                )} />
              </div>

              {/* Expanded detail */}
              {selectedPatient?.patientId === patient.patientId && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="mt-4 space-y-3 overflow-hidden border-t border-border/30 pt-3"
                >
                  {/* Risk factors */}
                  <div>
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Risk Factor Breakdown</p>
                    <div className="space-y-1.5">
                      {patient.riskFactors.map((rf) => (
                        <div key={rf.name} className="flex items-center gap-2">
                          <span className="w-16 text-[11px] font-medium">{rf.name}</span>
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted/50">
                            <div
                              className={cn('h-full rounded-full transition-all', rf.score >= 85 ? 'bg-emerald-500' : rf.score >= 70 ? 'bg-amber-500' : 'bg-red-500')}
                              style={{ width: `${rf.score}%` }}
                            />
                          </div>
                          <span className="w-6 text-right text-[10px] font-bold tabular-nums">{rf.score}</span>
                          {rf.trend === 'declining' ? (
                            <TrendingDown className="h-3 w-3 text-red-500" />
                          ) : rf.trend === 'improving' ? (
                            <TrendingUp className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <span className="h-3 w-3 text-center text-[10px] text-muted-foreground">—</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Predictions */}
                  {patient.predictions.length > 0 && (
                    <div>
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Health Predictions</p>
                      <div className="space-y-1.5">
                        {patient.predictions.map((pred, j) => (
                          <div key={j} className="flex items-center gap-2 rounded-lg bg-muted/30 px-2.5 py-1.5">
                            <Eye className="h-3 w-3 shrink-0 text-muted-foreground" />
                            <span className="flex-1 text-[11px]">{pred.condition}</span>
                            <span className={cn(
                              'rounded-full px-1.5 py-0.5 text-[9px] font-bold',
                              pred.probability >= 50 ? 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400'
                                : pred.probability >= 25 ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400'
                                  : 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400',
                            )}>
                              {pred.probability}%
                            </span>
                            <span className="text-[10px] text-muted-foreground">{pred.timeframe}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* High-Risk Predictions Banner */}
      {highRiskPredictions.length > 0 && (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-5 shadow-card dark:border-amber-800/40 dark:from-amber-950/20 dark:to-orange-950/20">
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-400">High-Risk Predictions Requiring Attention</h3>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {highRiskPredictions.slice(0, 6).map((pred, i) => (
              <div key={i} className="flex items-center gap-2 rounded-xl bg-white/60 px-3 py-2 dark:bg-black/10">
                <div className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white',
                  pred.probability >= 50 ? 'bg-red-500' : 'bg-amber-500',
                )}>
                  {pred.probability}%
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium">{pred.patientName} — {pred.condition}</p>
                  <p className="text-[10px] text-muted-foreground">{pred.timeframe}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <p className="mt-4 text-[10px] leading-relaxed text-muted-foreground/50">
        <span className="font-semibold">AI Disclaimer:</span> Health risk scores and predictions are generated using simulated ML models based on species, breed, age, and clinical data. These are decision-support tools only and should not replace clinical judgment. Actual risk assessment requires comprehensive patient evaluation.
      </p>
    </motion.div>
  );
}
