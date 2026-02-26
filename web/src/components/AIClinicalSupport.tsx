'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Sparkles,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Pill,
  Stethoscope,
  BookOpen,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  XCircle,
  Info,
  Zap,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Visit, Treatment, VitalsRecord } from '../types';

// ── AI Knowledge Base (simulated) ──

interface DifferentialDiagnosis {
  condition: string;
  probability: number; // 0-100
  severity: 'low' | 'moderate' | 'high' | 'critical';
  reasoning: string;
  suggestedTests: string[];
  suggestedTreatments: string[];
  references: string[];
}

interface DrugInteraction {
  drug1: string;
  drug2: string;
  severity: 'minor' | 'moderate' | 'major';
  description: string;
}

interface VitalsAlert {
  parameter: string;
  value: number;
  unit: string;
  status: 'normal' | 'borderline' | 'abnormal' | 'critical';
  message: string;
}

// Simulated knowledge base for differential diagnoses
const SYMPTOM_DB: Record<string, DifferentialDiagnosis[]> = {
  limping: [
    { condition: 'Cruciate Ligament Rupture', probability: 72, severity: 'high', reasoning: 'Common in large-breed dogs. Sudden onset limping, especially hind limb, with stifle instability is highly suggestive.', suggestedTests: ['Orthopedic exam', 'Drawer test', 'Radiographs (stifle)', 'Tibial thrust test'], suggestedTreatments: ['NSAID (Carprofen 2.2mg/kg BID)', 'Activity restriction', 'Surgical consult (TPLO/TTA)'], references: ['JAVMA Vol 243, 2013', 'Vet Surgery 2019;48:S52-S62'] },
    { condition: 'Soft Tissue Injury', probability: 65, severity: 'moderate', reasoning: 'Acute onset with no structural changes on radiograph. Pain on palpation without crepitus.', suggestedTests: ['Radiographs', 'Palpation exam', 'Ultrasound if persistent'], suggestedTreatments: ['NSAID therapy', 'Cold compress TID × 3 days', 'Strict rest 2 weeks'], references: ['BSAVA Manual of Musculoskeletal Disorders'] },
    { condition: 'Osteoarthritis', probability: 45, severity: 'moderate', reasoning: 'Chronic degenerative condition, more common in older patients. May show reduced ROM and crepitus.', suggestedTests: ['Radiographs (affected joint)', 'Synovial fluid analysis', 'Orthopedic exam'], suggestedTreatments: ['Multimodal pain management', 'Joint supplements (glucosamine)', 'Weight management', 'Physical rehabilitation'], references: ['ACVS Guidelines 2020'] },
    { condition: 'Panosteitis', probability: 30, severity: 'low', reasoning: 'Self-limiting condition in young, large-breed dogs. Shifting leg lameness is characteristic.', suggestedTests: ['Radiographs (long bones)', 'CBC'], suggestedTreatments: ['NSAIDs for pain', 'Monitor — self-resolving'], references: ['Textbook of Vet Internal Med, 8th Ed'] },
  ],
  vomiting: [
    { condition: 'Gastritis (Acute)', probability: 68, severity: 'moderate', reasoning: 'Most common cause of acute vomiting. Often dietary indiscretion or stress-related.', suggestedTests: ['CBC', 'Chemistry panel', 'Abdominal radiographs'], suggestedTreatments: ['Maropitant (Cerenia) 1mg/kg SQ q24h', 'NPO 12-24h then bland diet', 'Fluid therapy if dehydrated'], references: ['JVIM 2018;32:1442-1450'] },
    { condition: 'Foreign Body Obstruction', probability: 42, severity: 'critical', reasoning: 'History of chewing objects, progressive vomiting, abdominal pain. Requires rapid intervention.', suggestedTests: ['Abdominal radiographs (3 views)', 'Abdominal ultrasound', 'Contrast study if needed'], suggestedTreatments: ['IV fluid therapy', 'Surgical exploration if confirmed', 'Endoscopic retrieval if accessible'], references: ['Vet Surgery 2020;49:O45-O52'] },
    { condition: 'Pancreatitis', probability: 55, severity: 'high', reasoning: 'Abdominal pain with vomiting, often preceded by high-fat meal. Elevated lipase expected.', suggestedTests: ['cPLI / SNAP cPL', 'CBC + Chemistry', 'Abdominal ultrasound'], suggestedTreatments: ['IV fluids', 'Maropitant antiemetic', 'Pain management', 'Low-fat diet once eating'], references: ['ACVIM Consensus 2021'] },
  ],
  'wellness exam': [
    { condition: 'Healthy — Routine Wellness', probability: 85, severity: 'low', reasoning: 'Normal physical exam findings with up-to-date preventive care.', suggestedTests: ['Annual bloodwork', 'Fecal exam', 'Heartworm test', 'Urinalysis'], suggestedTreatments: ['Update vaccinations', 'Continue preventives', 'Dental evaluation'], references: ['AAHA Canine Preventive Care Guidelines 2019'] },
  ],
  'vaccine update': [
    { condition: 'Routine Vaccination Visit', probability: 90, severity: 'low', reasoning: 'Scheduled vaccination — ensure no contraindications present.', suggestedTests: ['Pre-vaccination health check', 'Titer testing (if requested)'], suggestedTreatments: ['Administer due vaccines', 'Update vaccination record', 'Schedule next boosters'], references: ['AAHA Canine Vaccination Guidelines 2022', 'AAFP Feline Vaccination Advisory Panel'] },
  ],
  dental: [
    { condition: 'Periodontal Disease', probability: 75, severity: 'moderate', reasoning: 'Tartar accumulation, gingivitis, and potential tooth root abscess. Very common in adult pets.', suggestedTests: ['Dental radiographs (full mouth)', 'Probe depths under anesthesia'], suggestedTreatments: ['Professional dental cleaning', 'Extractions as needed', 'Dental home care protocol', 'Antibiotics if abscess'], references: ['AVDC Position Statement on Dental Cleaning'] },
    { condition: 'Tooth Resorption (Feline)', probability: 50, severity: 'moderate', reasoning: 'Common in cats. Painful erosive lesions on teeth.', suggestedTests: ['Full-mouth dental radiographs', 'Oral exam under anesthesia'], suggestedTreatments: ['Crown amputation or extraction', 'Pain management'], references: ['JVDS 2019;36(4):247-256'] },
  ],
  'hip dysplasia': [
    { condition: 'Hip Dysplasia', probability: 82, severity: 'high', reasoning: 'Breed predisposition (Labs, GSD, Goldens). Bilateral hind limb lameness, difficulty rising, "bunny hopping" gait.', suggestedTests: ['Ventrodorsal hip radiograph', 'PennHIP evaluation', 'Ortolani test'], suggestedTreatments: ['Weight management', 'NSAIDs', 'Joint supplements', 'Physical therapy', 'FHO or THR if severe'], references: ['OFA Canine Hip Dysplasia Guidelines', 'Vet Surgery 2018;47:S20-S30'] },
  ],
};

// Drug interaction database (simulated)
const DRUG_INTERACTIONS: DrugInteraction[] = [
  { drug1: 'Carprofen', drug2: 'Prednisone', severity: 'major', description: 'Concurrent NSAID and corticosteroid use significantly increases risk of GI ulceration and hemorrhage.' },
  { drug1: 'Carprofen', drug2: 'Aspirin', severity: 'major', description: 'Concurrent use of multiple NSAIDs increases GI ulceration risk.' },
  { drug1: 'Metoclopramide', drug2: 'Acepromazine', severity: 'moderate', description: 'Both agents have dopamine-blocking activity; concurrent use may increase extrapyramidal effects.' },
  { drug1: 'Ivermectin', drug2: 'MDR1 mutation', severity: 'major', description: 'MDR1 gene mutation in herding breeds increases neurotoxicity risk with ivermectin. Use alternative parasite prevention.' },
  { drug1: 'Dexmedetomidine', drug2: 'Butorphanol', severity: 'minor', description: 'Combined sedation protocol is common but monitor for excessive cardiovascular depression.' },
];

// Vitals reference ranges by species
const VITALS_RANGES: Record<string, Record<string, [number, number]>> = {
  dog: { temperature: [100.0, 102.5], heartRate: [60, 140], respiratoryRate: [10, 30], bodyConditionScore: [4, 6] },
  cat: { temperature: [100.0, 102.5], heartRate: [140, 220], respiratoryRate: [20, 30], bodyConditionScore: [4, 6] },
  bird: { temperature: [104, 112], heartRate: [200, 600], respiratoryRate: [40, 60], bodyConditionScore: [3, 5] },
  reptile: { temperature: [75, 95], heartRate: [20, 80], respiratoryRate: [2, 10], bodyConditionScore: [3, 5] },
  rabbit: { temperature: [101, 103], heartRate: [130, 325], respiratoryRate: [30, 60], bodyConditionScore: [3, 5] },
};

function analyzeVitals(vitals: VitalsRecord, species: string): VitalsAlert[] {
  const alerts: VitalsAlert[] = [];
  const ranges = VITALS_RANGES[species] || VITALS_RANGES.dog;

  if (vitals.temperature !== null) {
    const [lo, hi] = ranges.temperature;
    const t = vitals.temperature;
    if (t < lo - 1 || t > hi + 1.5) alerts.push({ parameter: 'Temperature', value: t, unit: '°F', status: 'critical', message: t > hi ? 'Significant hyperthermia — evaluate for heatstroke, infection, or pain' : 'Hypothermia — evaluate for shock or environmental exposure' });
    else if (t < lo || t > hi) alerts.push({ parameter: 'Temperature', value: t, unit: '°F', status: 'borderline', message: t > hi ? 'Mildly elevated — may indicate stress, excitement, or early infection' : 'Slightly below normal — monitor closely' });
    else alerts.push({ parameter: 'Temperature', value: t, unit: '°F', status: 'normal', message: 'Within normal range' });
  }

  if (vitals.heartRate !== null) {
    const [lo, hi] = ranges.heartRate;
    const hr = vitals.heartRate;
    if (hr < lo * 0.7 || hr > hi * 1.3) alerts.push({ parameter: 'Heart Rate', value: hr, unit: 'bpm', status: 'critical', message: hr > hi ? 'Marked tachycardia — evaluate for pain, anxiety, cardiac disease, or fever' : 'Significant bradycardia — evaluate for cardiac conduction abnormalities' });
    else if (hr < lo || hr > hi) alerts.push({ parameter: 'Heart Rate', value: hr, unit: 'bpm', status: 'borderline', message: hr > hi ? 'Mild tachycardia — consider stress, excitement, or pain' : 'Mild bradycardia — may be normal for athletic dogs' });
    else alerts.push({ parameter: 'Heart Rate', value: hr, unit: 'bpm', status: 'normal', message: 'Within normal range' });
  }

  if (vitals.painScore !== null && vitals.painScore > 0) {
    const ps = vitals.painScore;
    if (ps >= 7) alerts.push({ parameter: 'Pain Score', value: ps, unit: '/10', status: 'critical', message: 'Severe pain — immediate analgesic intervention required' });
    else if (ps >= 4) alerts.push({ parameter: 'Pain Score', value: ps, unit: '/10', status: 'abnormal', message: 'Moderate pain — multi-modal analgesia recommended' });
    else alerts.push({ parameter: 'Pain Score', value: ps, unit: '/10', status: 'borderline', message: 'Mild pain — consider analgesic therapy and monitor' });
  }

  if (vitals.bodyConditionScore !== null) {
    const bcs = vitals.bodyConditionScore;
    const [lo, hi] = ranges.bodyConditionScore;
    if (bcs > hi + 2) alerts.push({ parameter: 'BCS', value: bcs, unit: '/9', status: 'abnormal', message: 'Obese — develop weight management plan (calorie reduction, exercise)' });
    else if (bcs > hi) alerts.push({ parameter: 'BCS', value: bcs, unit: '/9', status: 'borderline', message: 'Overweight — discuss nutritional counseling' });
    else if (bcs < lo) alerts.push({ parameter: 'BCS', value: bcs, unit: '/9', status: 'borderline', message: 'Underweight — evaluate for underlying disease, increase caloric intake' });
    else alerts.push({ parameter: 'BCS', value: bcs, unit: '/9', status: 'normal', message: 'Ideal body condition' });
  }

  return alerts;
}

function findDrugInteractions(treatments: Treatment[], patientNotes: string | null): DrugInteraction[] {
  const drugNames = treatments.map((t) => t.name.toLowerCase());
  const found: DrugInteraction[] = [];

  for (const interaction of DRUG_INTERACTIONS) {
    const d1 = interaction.drug1.toLowerCase();
    const d2 = interaction.drug2.toLowerCase();
    const has1 = drugNames.some((n) => n.includes(d1));
    const has2 = d2 === 'mdr1 mutation'
      ? (patientNotes || '').toLowerCase().includes('mdr1')
      : drugNames.some((n) => n.includes(d2));
    if (has1 && has2) found.push(interaction);
  }

  return found;
}

function getDifferentialDiagnoses(chiefComplaint: string): DifferentialDiagnosis[] {
  const complaint = chiefComplaint.toLowerCase();
  for (const [key, diagnoses] of Object.entries(SYMPTOM_DB)) {
    if (complaint.includes(key)) return diagnoses;
  }
  // Fallback: generic
  return [
    { condition: 'Further Workup Needed', probability: 50, severity: 'moderate', reasoning: 'Insufficient data to narrow differential list. Complete history, PE, and diagnostics recommended.', suggestedTests: ['CBC + Chemistry', 'Urinalysis', 'Radiographs (as indicated)', 'Additional history'], suggestedTreatments: ['Symptomatic treatment pending diagnosis'], references: [] },
  ];
}

// ── Component ──

const SEVERITY_STYLES = {
  low: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800/40' },
  moderate: { bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800/40' },
  high: { bg: 'bg-orange-50 dark:bg-orange-950/30', text: 'text-orange-700 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800/40' },
  critical: { bg: 'bg-red-50 dark:bg-red-950/30', text: 'text-red-700 dark:text-red-400', border: 'border-red-200 dark:border-red-800/40' },
};

const ALERT_STYLES = {
  normal: { bg: 'bg-emerald-500', icon: CheckCircle2 },
  borderline: { bg: 'bg-amber-500', icon: Info },
  abnormal: { bg: 'bg-orange-500', icon: AlertTriangle },
  critical: { bg: 'bg-red-500', icon: XCircle },
};

interface AIClinicalSupportProps {
  visit: Visit;
  treatments: Treatment[];
  patientSpecies: string;
  patientNotes: string | null;
}

export default function AIClinicalSupport({ visit, treatments, patientSpecies, patientNotes }: AIClinicalSupportProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [diagnoses, setDiagnoses] = useState<DifferentialDiagnosis[]>([]);
  const [vitalsAlerts, setVitalsAlerts] = useState<VitalsAlert[]>([]);
  const [interactions, setInteractions] = useState<DrugInteraction[]>([]);
  const [expandedDiagnosis, setExpandedDiagnosis] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'diagnosis' | 'vitals' | 'interactions'>('diagnosis');

  const runAnalysis = () => {
    setIsAnalyzing(true);
    // Simulate AI processing delay
    setTimeout(() => {
      if (visit.chiefComplaint) {
        setDiagnoses(getDifferentialDiagnoses(visit.chiefComplaint));
      }
      if (visit.vitals && visit.vitals.length > 0) {
        const latestVitals = visit.vitals[visit.vitals.length - 1];
        setVitalsAlerts(analyzeVitals(latestVitals, patientSpecies));
      }
      setInteractions(findDrugInteractions(treatments, patientNotes));
      setIsAnalyzing(false);
      setAnalyzed(true);
    }, 1800);
  };

  const interactionCount = interactions.length;
  const abnormalVitals = vitalsAlerts.filter((a) => a.status !== 'normal').length;

  return (
    <div className="rounded-2xl border border-border/60 bg-card shadow-card">
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-border/50 px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 shadow-md">
          <Brain className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">AI Clinical Decision Support</h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-700 dark:bg-violet-950/50 dark:text-violet-400">
              <Sparkles className="h-2.5 w-2.5" /> Beta
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">Symptom analysis, differential diagnosis, and drug interaction checking</p>
        </div>
        {!analyzed && (
          <button
            onClick={runAnalysis}
            disabled={isAnalyzing}
            className="inline-flex h-9 items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                Run Analysis
              </>
            )}
          </button>
        )}
        {analyzed && (
          <div className="flex items-center gap-2">
            {interactionCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-[10px] font-bold text-red-700 dark:bg-red-950/50 dark:text-red-400">
                <ShieldAlert className="h-3 w-3" /> {interactionCount} Interaction{interactionCount > 1 ? 's' : ''}
              </span>
            )}
            {abnormalVitals > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
                <AlertTriangle className="h-3 w-3" /> {abnormalVitals} Alert{abnormalVitals > 1 ? 's' : ''}
              </span>
            )}
            <button
              onClick={runAnalysis}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border/60 px-3 text-xs font-medium text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
            >
              <Zap className="h-3 w-3" /> Re-analyze
            </button>
          </div>
        )}
      </div>

      {/* Loading animation */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center gap-3 py-12"
          >
            <div className="relative">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 p-3">
                <Brain className="h-10 w-10 text-violet-500" />
              </div>
              <motion.div
                className="absolute -inset-1 rounded-2xl border-2 border-violet-500/30"
                animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">Analyzing clinical data...</p>
              <p className="mt-1 text-xs text-muted-foreground">Evaluating symptoms, vitals, and medications</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      {analyzed && !isAnalyzing && (
        <div>
          {/* Tab bar */}
          <div className="flex border-b border-border/50">
            {[
              { key: 'diagnosis' as const, label: 'Differential Dx', icon: Stethoscope, count: diagnoses.length },
              { key: 'vitals' as const, label: 'Vitals Analysis', icon: Activity, count: vitalsAlerts.length },
              { key: 'interactions' as const, label: 'Drug Interactions', icon: ShieldAlert, count: interactionCount },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex flex-1 items-center justify-center gap-1.5 px-4 py-3 text-xs font-semibold transition-all',
                  activeTab === tab.key
                    ? 'border-b-2 border-violet-500 text-violet-700 dark:text-violet-400'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
                {tab.count > 0 && (
                  <span className={cn(
                    'ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold',
                    tab.key === 'interactions' && tab.count > 0
                      ? 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400'
                      : 'bg-muted text-muted-foreground',
                  )}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="p-5">
            {/* Differential Diagnosis Tab */}
            {activeTab === 'diagnosis' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                {diagnoses.map((dx, i) => {
                  const style = SEVERITY_STYLES[dx.severity];
                  const isExpanded = expandedDiagnosis === i;
                  return (
                    <div
                      key={i}
                      className={cn('rounded-xl border transition-all', style.border, isExpanded ? style.bg : 'bg-card')}
                    >
                      <button
                        onClick={() => setExpandedDiagnosis(isExpanded ? null : i)}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left"
                      >
                        {/* Probability bar */}
                        <div className="relative h-10 w-10 shrink-0">
                          <svg viewBox="0 0 36 36" className="h-10 w-10 -rotate-90">
                            <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" className="text-muted/30" strokeWidth="3" />
                            <circle
                              cx="18" cy="18" r="15" fill="none"
                              stroke={dx.probability >= 70 ? '#ef4444' : dx.probability >= 50 ? '#f59e0b' : '#6366f1'}
                              strokeWidth="3"
                              strokeDasharray={`${dx.probability * 0.94} 100`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold tabular-nums">
                            {dx.probability}%
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold">{dx.condition}</p>
                          <p className="truncate text-[11px] text-muted-foreground">{dx.reasoning.slice(0, 80)}...</p>
                        </div>
                        <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase', style.bg, style.text)}>
                          {dx.severity}
                        </span>
                        {isExpanded ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="space-y-3 border-t border-border/30 px-4 py-3">
                              <div>
                                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Clinical Reasoning</p>
                                <p className="text-sm leading-relaxed">{dx.reasoning}</p>
                              </div>
                              <div className="grid gap-3 sm:grid-cols-2">
                                <div>
                                  <p className="mb-1.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                    <Stethoscope className="h-3 w-3" /> Suggested Diagnostics
                                  </p>
                                  <ul className="space-y-1">
                                    {dx.suggestedTests.map((test, j) => (
                                      <li key={j} className="flex items-start gap-1.5 text-xs">
                                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-violet-500" />
                                        {test}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <p className="mb-1.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                    <Pill className="h-3 w-3" /> Suggested Treatments
                                  </p>
                                  <ul className="space-y-1">
                                    {dx.suggestedTreatments.map((tx, j) => (
                                      <li key={j} className="flex items-start gap-1.5 text-xs">
                                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500" />
                                        {tx}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                              {dx.references.length > 0 && (
                                <div>
                                  <p className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                    <BookOpen className="h-3 w-3" /> References
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {dx.references.map((ref, j) => (
                                      <span key={j} className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{ref}</span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </motion.div>
            )}

            {/* Vitals Analysis Tab */}
            {activeTab === 'vitals' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                {vitalsAlerts.length > 0 ? vitalsAlerts.map((alert, i) => {
                  const style = ALERT_STYLES[alert.status];
                  const AlertIcon = style.icon;
                  return (
                    <div key={i} className="flex items-start gap-3 rounded-xl border border-border/40 p-3">
                      <div className={cn('mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full', style.bg)}>
                        <AlertIcon className="h-3.5 w-3.5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-semibold">{alert.parameter}</span>
                          <span className="tabular-nums text-sm font-bold text-foreground">{alert.value}{alert.unit}</span>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">{alert.message}</p>
                      </div>
                    </div>
                  );
                }) : (
                  <p className="py-8 text-center text-sm text-muted-foreground/60">No vitals data to analyze</p>
                )}
              </motion.div>
            )}

            {/* Drug Interactions Tab */}
            {activeTab === 'interactions' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                {interactions.length > 0 ? interactions.map((ix, i) => (
                  <div
                    key={i}
                    className={cn(
                      'rounded-xl border p-4',
                      ix.severity === 'major'
                        ? 'border-red-200 bg-red-50 dark:border-red-800/40 dark:bg-red-950/20'
                        : ix.severity === 'moderate'
                          ? 'border-amber-200 bg-amber-50 dark:border-amber-800/40 dark:bg-amber-950/20'
                          : 'border-blue-200 bg-blue-50 dark:border-blue-800/40 dark:bg-blue-950/20',
                    )}
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <ShieldAlert className={cn(
                        'h-4 w-4',
                        ix.severity === 'major' ? 'text-red-600' : ix.severity === 'moderate' ? 'text-amber-600' : 'text-blue-600',
                      )} />
                      <span className="text-sm font-semibold">{ix.drug1} + {ix.drug2}</span>
                      <span className={cn(
                        'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase',
                        ix.severity === 'major'
                          ? 'bg-red-200 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                          : ix.severity === 'moderate'
                            ? 'bg-amber-200 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'
                            : 'bg-blue-200 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
                      )}>
                        {ix.severity}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-foreground/80">{ix.description}</p>
                  </div>
                )) : (
                  <div className="flex flex-col items-center justify-center gap-2 py-8">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500/50" />
                    <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">No drug interactions detected</p>
                    <p className="text-xs text-muted-foreground">Current medications appear safe for concurrent use</p>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Disclaimer */}
          <div className="border-t border-border/30 px-5 py-3">
            <p className="text-[10px] leading-relaxed text-muted-foreground/60">
              <span className="font-semibold">Disclaimer:</span> AI-generated suggestions are for clinical decision support only and do not replace professional veterinary judgment. Always verify diagnoses with appropriate diagnostics. Drug interaction data is not exhaustive.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Re-export the Activity icon to avoid import issues
function Activity(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
    </svg>
  );
}
