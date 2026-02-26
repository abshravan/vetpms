'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Sparkles,
  Calendar,
  Syringe,
  Heart,
  Bug,
  Smile,
  FlaskConical,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Patient } from '../types';

// ── Care Plan Knowledge Base ──

interface CarePlanItem {
  id: string;
  category: 'vaccination' | 'parasite' | 'dental' | 'wellness' | 'nutrition' | 'lab_work';
  name: string;
  description: string;
  frequency: string;
  urgency: 'routine' | 'due_soon' | 'overdue' | 'recommended';
  nextDue: string; // relative description
  ageRange?: string;
  breedSpecific?: boolean;
  icon: React.ElementType;
}

const CATEGORY_STYLES: Record<string, { bg: string; text: string; iconBg: string }> = {
  vaccination: { bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-700 dark:text-blue-400', iconBg: 'from-blue-500 to-blue-600' },
  parasite: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-700 dark:text-emerald-400', iconBg: 'from-emerald-500 to-emerald-600' },
  dental: { bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-700 dark:text-amber-400', iconBg: 'from-amber-500 to-amber-600' },
  wellness: { bg: 'bg-purple-50 dark:bg-purple-950/30', text: 'text-purple-700 dark:text-purple-400', iconBg: 'from-purple-500 to-purple-600' },
  nutrition: { bg: 'bg-rose-50 dark:bg-rose-950/30', text: 'text-rose-700 dark:text-rose-400', iconBg: 'from-rose-500 to-rose-600' },
  lab_work: { bg: 'bg-indigo-50 dark:bg-indigo-950/30', text: 'text-indigo-700 dark:text-indigo-400', iconBg: 'from-indigo-500 to-indigo-600' },
};

const URGENCY_STYLES = {
  routine: { bg: 'bg-muted', text: 'text-muted-foreground', label: 'Routine' },
  due_soon: { bg: 'bg-amber-100 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-400', label: 'Due Soon' },
  overdue: { bg: 'bg-red-100 dark:bg-red-950/40', text: 'text-red-700 dark:text-red-400', label: 'Overdue' },
  recommended: { bg: 'bg-blue-100 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-400', label: 'Recommended' },
};

function calculateAge(dob: string | null): number {
  if (!dob) return 3; // default
  const birth = new Date(dob);
  const now = new Date();
  return (now.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
}

function generateCarePlan(patient: Patient): CarePlanItem[] {
  const age = calculateAge(patient.dateOfBirth);
  const species = patient.species;
  const breed = (patient.breed || '').toLowerCase();
  const items: CarePlanItem[] = [];

  // ── Vaccinations ──
  if (species === 'dog') {
    items.push({
      id: 'rabies', category: 'vaccination', name: 'Rabies Vaccine', icon: Syringe,
      description: 'Core vaccine required by law. Initial at 12-16 weeks, then annually or every 3 years.',
      frequency: 'Every 1-3 years', urgency: age < 1 ? 'due_soon' : 'routine',
      nextDue: age < 1 ? 'Due now (puppy series)' : 'Next annual booster',
    });
    items.push({
      id: 'dhpp', category: 'vaccination', name: 'DHPP (Distemper/Parvo)', icon: Syringe,
      description: 'Core combo vaccine. Puppy series at 6-8, 10-12, 14-16 weeks, then booster at 1 year.',
      frequency: age < 1 ? 'Every 3-4 weeks' : 'Every 1-3 years', urgency: age < 1 ? 'due_soon' : 'routine',
      nextDue: age < 1 ? 'Puppy booster needed' : 'Annually or per titer',
    });
    items.push({
      id: 'bordetella', category: 'vaccination', name: 'Bordetella (Kennel Cough)', icon: Syringe,
      description: 'Recommended for dogs in social settings (daycare, boarding, dog parks).',
      frequency: 'Every 6-12 months', urgency: 'recommended',
      nextDue: 'Based on lifestyle risk',
    });
    if (breed.includes('retriever') || breed.includes('spaniel') || breed.includes('hound')) {
      items.push({
        id: 'lyme', category: 'vaccination', name: 'Lyme Disease Vaccine', icon: Syringe,
        description: `Recommended for ${patient.breed} — breed may have higher tick exposure.`,
        frequency: 'Annually', urgency: 'recommended',
        nextDue: 'Based on geographic risk', breedSpecific: true,
      });
    }
  } else if (species === 'cat') {
    items.push({
      id: 'rabies-cat', category: 'vaccination', name: 'Rabies Vaccine', icon: Syringe,
      description: 'Core vaccine required by law for cats.',
      frequency: 'Every 1-3 years', urgency: age < 1 ? 'due_soon' : 'routine',
      nextDue: age < 1 ? 'Due now (kitten series)' : 'Next annual booster',
    });
    items.push({
      id: 'fvrcp', category: 'vaccination', name: 'FVRCP', icon: Syringe,
      description: 'Core combo vaccine for rhinotracheitis, calicivirus, panleukopenia.',
      frequency: age < 1 ? 'Every 3-4 weeks' : 'Every 1-3 years', urgency: age < 1 ? 'due_soon' : 'routine',
      nextDue: age < 1 ? 'Kitten booster needed' : 'Annually or per titer',
    });
    items.push({
      id: 'felv', category: 'vaccination', name: 'FeLV (Feline Leukemia)', icon: Syringe,
      description: 'Recommended for cats with outdoor access or multi-cat households.',
      frequency: 'Annually', urgency: 'recommended',
      nextDue: 'Based on risk assessment',
    });
  }

  // ── Parasite Prevention ──
  items.push({
    id: 'heartworm', category: 'parasite', name: 'Heartworm Prevention', icon: Heart,
    description: species === 'dog'
      ? 'Monthly heartworm preventive (ivermectin/milbemycin). Year-round in endemic areas.'
      : 'Indoor cats still at risk. Monthly prevention recommended.',
    frequency: 'Monthly (year-round)', urgency: 'due_soon',
    nextDue: '1st of each month',
  });
  items.push({
    id: 'flea-tick', category: 'parasite', name: 'Flea & Tick Prevention', icon: Bug,
    description: 'Monthly topical or oral flea/tick preventive. Crucial for parasite-borne disease prevention.',
    frequency: 'Monthly', urgency: 'due_soon',
    nextDue: 'Monthly application/dose',
  });
  if (species === 'dog') {
    items.push({
      id: 'deworming', category: 'parasite', name: 'Intestinal Parasite Screen', icon: FlaskConical,
      description: 'Annual fecal exam for intestinal parasites. Deworm as needed.',
      frequency: 'Annual fecal + PRN deworming', urgency: 'routine',
      nextDue: 'At next wellness exam',
    });
  }

  // ── Dental ──
  if (age >= 2) {
    const dentalUrgency = age >= 5 ? 'due_soon' : 'routine';
    items.push({
      id: 'dental', category: 'dental', name: 'Professional Dental Cleaning', icon: Smile,
      description: age >= 5
        ? `At ${Math.round(age)} years, dental disease is increasingly common. Annual cleanings recommended.`
        : 'Annual dental evaluation with professional cleaning as needed.',
      frequency: 'Annually', urgency: dentalUrgency,
      nextDue: age >= 5 ? 'Overdue — schedule soon' : 'At next annual exam',
    });
  }

  // ── Wellness & Lab Work ──
  items.push({
    id: 'wellness', category: 'wellness', name: 'Annual Wellness Exam', icon: ShieldCheck,
    description: age >= 7
      ? `Senior patients (${Math.round(age)} years) benefit from bi-annual comprehensive exams.`
      : 'Comprehensive physical exam including body condition, dental check, heart/lung assessment.',
    frequency: age >= 7 ? 'Every 6 months' : 'Annually', urgency: 'routine',
    nextDue: age >= 7 ? 'Every 6 months (senior)' : 'Annually',
  });

  if (age >= 7) {
    items.push({
      id: 'senior-labs', category: 'lab_work', name: 'Senior Bloodwork Panel', icon: FlaskConical,
      description: 'CBC, chemistry panel, thyroid, urinalysis. Essential for early disease detection in senior pets.',
      frequency: 'Every 6-12 months', urgency: 'due_soon',
      nextDue: 'At next wellness visit', ageRange: '7+ years',
    });
  } else if (age >= 1) {
    items.push({
      id: 'annual-labs', category: 'lab_work', name: 'Annual Bloodwork', icon: FlaskConical,
      description: 'Baseline CBC and chemistry panel. Establishes normal values for future comparison.',
      frequency: 'Annually', urgency: 'routine',
      nextDue: 'At annual wellness exam',
    });
  }

  // ── Breed-Specific ──
  if (breed.includes('bulldog') || breed.includes('pug') || breed.includes('boxer') || breed.includes('shih tzu')) {
    items.push({
      id: 'brachycephalic', category: 'wellness', name: 'Brachycephalic Airway Assessment', icon: ShieldCheck,
      description: `${patient.breed} is a brachycephalic breed. Regular breathing assessments and weight monitoring are essential.`,
      frequency: 'Every wellness visit', urgency: 'recommended',
      nextDue: 'At each exam', breedSpecific: true,
    });
  }
  if (breed.includes('shepherd') || breed.includes('retriever') || breed.includes('rottweiler')) {
    items.push({
      id: 'hip-screen', category: 'wellness', name: 'Hip/Joint Screening', icon: ShieldCheck,
      description: `${patient.breed} has breed predisposition to hip dysplasia. Early screening recommended.`,
      frequency: age < 2 ? 'At 6 and 12 months' : 'As needed', urgency: age < 2 ? 'due_soon' : 'recommended',
      nextDue: age < 2 ? 'Schedule screening radiographs' : 'Monitor at wellness exams', breedSpecific: true,
    });
  }
  if ((patient.notes || '').toLowerCase().includes('mdr1')) {
    items.push({
      id: 'mdr1', category: 'wellness', name: 'MDR1 Drug Sensitivity Protocol', icon: AlertTriangle,
      description: 'MDR1 gene mutation detected. Avoid ivermectin, loperamide, and certain other drugs. Use safe alternatives.',
      frequency: 'Ongoing awareness', urgency: 'overdue',
      nextDue: 'Active — always verify medications', breedSpecific: true,
    });
  }

  // Sort: overdue first, then due_soon, recommended, routine
  const urgencyOrder = { overdue: 0, due_soon: 1, recommended: 2, routine: 3 };
  items.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);

  return items;
}

// ── Component ──

interface PreventiveCareEngineProps {
  patient: Patient;
}

export default function PreventiveCareEngine({ patient }: PreventiveCareEngineProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const carePlan = useMemo(() => (generated ? generateCarePlan(patient) : []), [generated, patient]);
  const categories = useMemo(() => {
    const counts: Record<string, number> = {};
    carePlan.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return Object.entries(counts).map(([key, count]) => ({ key, count }));
  }, [carePlan]);

  const filteredPlan = selectedCategory ? carePlan.filter((i) => i.category === selectedCategory) : carePlan;
  const overdueCount = carePlan.filter((i) => i.urgency === 'overdue').length;
  const dueSoonCount = carePlan.filter((i) => i.urgency === 'due_soon').length;
  const age = calculateAge(patient.dateOfBirth);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setGenerated(true);
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-card shadow-card">
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-border/50 px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md">
          <ShieldCheck className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">Smart Preventive Care Plan</h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
              <Sparkles className="h-2.5 w-2.5" /> AI
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Auto-generated care plan based on {patient.species}, {patient.breed || 'unknown breed'}, {Math.round(age)} years old
          </p>
        </div>
        {!generated && (
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="inline-flex h-9 items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
          >
            {isGenerating ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</>
            ) : (
              <><Sparkles className="h-4 w-4" /> Generate Plan</>
            )}
          </button>
        )}
        {generated && (
          <div className="flex items-center gap-2">
            {overdueCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-[10px] font-bold text-red-700 dark:bg-red-950/50 dark:text-red-400">
                <AlertTriangle className="h-3 w-3" /> {overdueCount} Overdue
              </span>
            )}
            {dueSoonCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
                <Clock className="h-3 w-3" /> {dueSoonCount} Due Soon
              </span>
            )}
          </div>
        )}
      </div>

      {/* Loading */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center gap-3 py-12"
          >
            <div className="relative">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-600/20 p-3">
                <ShieldCheck className="h-10 w-10 text-emerald-500" />
              </div>
              <motion.div
                className="absolute -inset-1 rounded-2xl border-2 border-emerald-500/30"
                animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">Generating preventive care plan...</p>
              <p className="mt-1 text-xs text-muted-foreground">Analyzing species, breed, age, and medical history</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      {generated && !isGenerating && (
        <div>
          {/* Category filter chips */}
          <div className="flex flex-wrap gap-1.5 border-b border-border/30 px-5 py-3">
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                'rounded-full px-3 py-1 text-[11px] font-semibold transition-all',
                !selectedCategory ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:bg-muted/80',
              )}
            >
              All ({carePlan.length})
            </button>
            {categories.map((cat) => {
              const style = CATEGORY_STYLES[cat.key];
              return (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(selectedCategory === cat.key ? null : cat.key)}
                  className={cn(
                    'rounded-full px-3 py-1 text-[11px] font-semibold capitalize transition-all',
                    selectedCategory === cat.key ? cn(style.bg, style.text) : 'bg-muted text-muted-foreground hover:bg-muted/80',
                  )}
                >
                  {cat.key.replace('_', ' ')} ({cat.count})
                </button>
              );
            })}
          </div>

          {/* Care plan items */}
          <div className="divide-y divide-border/30">
            {filteredPlan.map((item, i) => {
              const catStyle = CATEGORY_STYLES[item.category];
              const urgStyle = URGENCY_STYLES[item.urgency];
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-muted/20"
                >
                  <div className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br shadow-sm', catStyle.iconBg)}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{item.name}</p>
                      {item.breedSpecific && (
                        <span className="rounded-md bg-violet-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-violet-700 dark:bg-violet-950/50 dark:text-violet-400">
                          Breed-specific
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{item.description}</p>
                    <div className="mt-1.5 flex items-center gap-3">
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Calendar className="h-3 w-3" /> {item.frequency}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <ChevronRight className="h-3 w-3" /> {item.nextDue}
                      </span>
                    </div>
                  </div>
                  <span className={cn('mt-1 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold', urgStyle.bg, urgStyle.text)}>
                    {urgStyle.label}
                  </span>
                </motion.div>
              );
            })}
          </div>

          {/* Summary footer */}
          <div className="border-t border-border/30 px-5 py-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-[11px] font-medium text-muted-foreground">
                  {carePlan.filter((i) => i.urgency === 'routine').length} routine items
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-[11px] font-medium text-muted-foreground">
                  {dueSoonCount} due soon
                </span>
              </div>
              {overdueCount > 0 && (
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                  <span className="text-[11px] font-medium text-red-600 dark:text-red-400">
                    {overdueCount} overdue
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
