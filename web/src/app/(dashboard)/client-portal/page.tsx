'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  PawPrint,
  Calendar,
  Syringe,
  FileText,
  Receipt,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Download,
  Phone,
  MapPin,
  Star,
  Shield,
  ChevronRight,
  MessageSquare,
  Eye,
  Pill,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import toast from 'react-hot-toast';

// ── Mock Client Portal Data ──

interface PortalPet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: string;
  weight: string;
  photoColor: string;
  nextAppointment: { date: string; type: string; vet: string } | null;
  vaccinations: { name: string; date: string; nextDue: string; status: 'current' | 'due_soon' | 'overdue' }[];
  medications: { name: string; dosage: string; refillDate: string }[];
  recentVisits: { date: string; reason: string; vet: string }[];
}

interface PortalInvoice {
  id: string;
  number: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  pet: string;
}

const PORTAL_CLIENT = {
  name: 'Michael Johnson',
  email: 'mjohnson@email.com',
  phone: '(555) 123-4567',
  address: '456 Elm Street, Springfield, IL 62701',
  memberSince: 'March 2022',
  loyaltyPoints: 1250,
};

const PORTAL_PETS: PortalPet[] = [
  {
    id: 'p-1', name: 'Max', species: 'Dog', breed: 'Golden Retriever', age: '4 years', weight: '72 lbs', photoColor: '#f59e0b',
    nextAppointment: { date: new Date(Date.now() + 14 * 86400000).toISOString(), type: 'Post-Op Follow Up', vet: 'Dr. Carter' },
    vaccinations: [
      { name: 'Rabies', date: '2025-06-15', nextDue: '2026-06-15', status: 'current' },
      { name: 'DHPP', date: '2025-09-01', nextDue: '2026-09-01', status: 'current' },
      { name: 'Bordetella', date: '2025-04-10', nextDue: '2026-04-10', status: 'due_soon' },
      { name: 'Lyme', date: '2025-03-20', nextDue: '2026-03-20', status: 'due_soon' },
    ],
    medications: [
      { name: 'Carprofen 75mg', dosage: 'BID with food', refillDate: new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10) },
      { name: 'Cephalexin 500mg', dosage: 'BID × 10 days', refillDate: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10) },
    ],
    recentVisits: [
      { date: new Date(Date.now() - 3 * 86400000).toISOString(), reason: 'TPLO Surgery — Right Stifle', vet: 'Dr. Carter' },
      { date: new Date(Date.now() - 30 * 86400000).toISOString(), reason: 'Pre-surgical exam & bloodwork', vet: 'Dr. Carter' },
      { date: new Date(Date.now() - 180 * 86400000).toISOString(), reason: 'Annual wellness exam', vet: 'Dr. Park' },
    ],
  },
  {
    id: 'p-2', name: 'Luna', species: 'Cat', breed: 'Siamese', age: '3 years', weight: '9 lbs', photoColor: '#8b5cf6',
    nextAppointment: null,
    vaccinations: [
      { name: 'Rabies', date: '2025-11-10', nextDue: '2026-11-10', status: 'current' },
      { name: 'FVRCP', date: '2025-11-10', nextDue: '2026-11-10', status: 'current' },
    ],
    medications: [],
    recentVisits: [
      { date: new Date(Date.now() - 2 * 86400000).toISOString(), reason: 'Dental cleaning', vet: 'Dr. Park' },
      { date: new Date(Date.now() - 120 * 86400000).toISOString(), reason: 'Annual wellness exam', vet: 'Dr. Park' },
    ],
  },
];

const PORTAL_INVOICES: PortalInvoice[] = [
  { id: 'inv-1', number: 'INV-2026-042', date: new Date(Date.now() - 3 * 86400000).toISOString(), amount: 2850.00, status: 'pending', pet: 'Max' },
  { id: 'inv-2', number: 'INV-2026-039', date: new Date(Date.now() - 5 * 86400000).toISOString(), amount: 385.00, status: 'paid', pet: 'Luna' },
  { id: 'inv-3', number: 'INV-2026-035', date: new Date(Date.now() - 30 * 86400000).toISOString(), amount: 215.00, status: 'paid', pet: 'Max' },
];

// ── Styles ──

const VACC_STATUS_STYLES = {
  current: { bg: 'bg-emerald-100 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-400', label: 'Current', icon: CheckCircle2 },
  due_soon: { bg: 'bg-amber-100 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-400', label: 'Due Soon', icon: Clock },
  overdue: { bg: 'bg-red-100 dark:bg-red-950/40', text: 'text-red-700 dark:text-red-400', label: 'Overdue', icon: AlertTriangle },
};

const INV_STATUS_STYLES = {
  paid: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Paid' },
  pending: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pending' },
  overdue: { bg: 'bg-red-100', text: 'text-red-700', label: 'Overdue' },
};

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } } };

export default function ClientPortalPage() {
  const [selectedPet, setSelectedPet] = useState<PortalPet>(PORTAL_PETS[0]);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="mb-1 flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">Client Portal</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Pet Owner Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Preview of the client-facing portal experience</p>
      </div>

      {/* Demo Banner */}
      <div className="mb-6 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 to-primary/[0.02] p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-lg font-bold text-primary">
            {PORTAL_CLIENT.name.split(' ').map((n) => n[0]).join('')}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">Welcome back, {PORTAL_CLIENT.name.split(' ')[0]}!</p>
            <p className="text-[11px] text-muted-foreground">Member since {PORTAL_CLIENT.memberSince} · {PORTAL_PETS.length} pet{PORTAL_PETS.length > 1 ? 's' : ''} registered</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-amber-500" />
                <span className="text-lg font-bold tabular-nums text-amber-600">{PORTAL_CLIENT.loyaltyPoints.toLocaleString()}</span>
              </div>
              <span className="text-[9px] font-medium text-muted-foreground">Loyalty Points</span>
            </div>
            <button className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-md">
              <Calendar className="h-3.5 w-3.5" /> Book Appointment
            </button>
          </div>
        </div>
      </div>

      {/* Pet Selector */}
      <div className="mb-6 flex gap-3">
        {PORTAL_PETS.map((pet) => (
          <button
            key={pet.id}
            onClick={() => setSelectedPet(pet)}
            className={cn(
              'flex items-center gap-3 rounded-2xl border p-4 transition-all',
              selectedPet.id === pet.id
                ? 'border-primary/40 bg-primary/5 ring-2 ring-primary/20 shadow-md'
                : 'border-border/60 bg-card hover:border-primary/20 hover:shadow-sm',
            )}
          >
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold text-white"
              style={{ backgroundColor: pet.photoColor }}
            >
              {pet.name[0]}
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold">{pet.name}</p>
              <p className="text-[11px] text-muted-foreground">{pet.breed} · {pet.age}</p>
              <p className="text-[10px] text-muted-foreground">{pet.weight}</p>
            </div>
          </button>
        ))}
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Appointments + Vaccinations */}
        <div className="space-y-6 lg:col-span-2">
          {/* Next Appointment */}
          <motion.div variants={fadeUp} className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card">
            <div className="flex items-center gap-2.5 border-b border-border/50 px-5 py-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/30">
                <Calendar className="h-4 w-4 text-blue-500" />
              </div>
              <h2 className="text-sm font-semibold">Upcoming Appointment</h2>
            </div>
            <div className="p-5">
              {selectedPet.nextAppointment ? (
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-primary/5 p-4 text-center">
                    <p className="text-2xl font-bold text-primary">
                      {new Date(selectedPet.nextAppointment.date).getDate()}
                    </p>
                    <p className="text-[10px] font-semibold uppercase text-primary">
                      {new Date(selectedPet.nextAppointment.date).toLocaleDateString([], { month: 'short' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{selectedPet.nextAppointment.type}</p>
                    <p className="text-xs text-muted-foreground">with {selectedPet.nextAppointment.vet}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(selectedPet.nextAppointment.date).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="ml-auto flex gap-2">
                    <button onClick={() => toast.success('Reminder set!')} className="inline-flex h-8 items-center gap-1 rounded-lg border border-border/40 px-3 text-[11px] font-medium text-muted-foreground hover:bg-muted">
                      <Clock className="h-3 w-3" /> Remind Me
                    </button>
                    <button className="inline-flex h-8 items-center gap-1 rounded-lg bg-primary px-3 text-[11px] font-semibold text-primary-foreground">
                      Confirm
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">No upcoming appointments</p>
                  <button className="inline-flex h-8 items-center gap-1 rounded-lg bg-primary px-3 text-[11px] font-semibold text-primary-foreground">
                    <Plus className="h-3 w-3" /> Schedule Now
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Vaccination Record */}
          <motion.div variants={fadeUp} className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card">
            <div className="flex items-center gap-2.5 border-b border-border/50 px-5 py-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
                <Syringe className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="flex-1">
                <h2 className="text-sm font-semibold">Vaccination Record</h2>
                <p className="text-[10px] text-muted-foreground">{selectedPet.name}'s immunization history</p>
              </div>
              <button className="inline-flex h-7 items-center gap-1 rounded-lg border border-border/40 px-2.5 text-[10px] font-medium text-muted-foreground hover:bg-muted">
                <Download className="h-3 w-3" /> Export
              </button>
            </div>
            <div className="divide-y divide-border/30">
              {selectedPet.vaccinations.map((vacc, i) => {
                const style = VACC_STATUS_STYLES[vacc.status];
                const StatusIcon = style.icon;
                return (
                  <div key={i} className="flex items-center gap-3 px-5 py-3">
                    <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', style.bg)}>
                      <StatusIcon className={cn('h-4 w-4', style.text)} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold">{vacc.name}</p>
                      <p className="text-[10px] text-muted-foreground">Given: {new Date(vacc.date).toLocaleDateString()} · Next: {new Date(vacc.nextDue).toLocaleDateString()}</p>
                    </div>
                    <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', style.bg, style.text)}>{style.label}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Visit History */}
          <motion.div variants={fadeUp} className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card">
            <div className="flex items-center gap-2.5 border-b border-border/50 px-5 py-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-950/30">
                <FileText className="h-4 w-4 text-purple-500" />
              </div>
              <h2 className="text-sm font-semibold">Visit History</h2>
            </div>
            <div className="divide-y divide-border/30">
              {selectedPet.recentVisits.map((visit, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/20">
                  <span className="w-16 shrink-0 text-[11px] font-medium text-muted-foreground">
                    {new Date(visit.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold">{visit.reason}</p>
                    <p className="text-[10px] text-muted-foreground">{visit.vet}</p>
                  </div>
                  <button className="inline-flex h-7 items-center gap-1 rounded-lg text-[10px] font-medium text-primary hover:bg-primary/5">
                    <Eye className="h-3 w-3" /> View Summary
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Active Medications */}
          <motion.div variants={fadeUp} className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card">
            <div className="flex items-center gap-2.5 border-b border-border/50 px-5 py-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/30">
                <Pill className="h-4 w-4 text-amber-500" />
              </div>
              <h2 className="text-sm font-semibold">Active Medications</h2>
            </div>
            <div className="p-4">
              {selectedPet.medications.length > 0 ? (
                <div className="space-y-3">
                  {selectedPet.medications.map((med, i) => (
                    <div key={i} className="rounded-xl border border-border/40 p-3">
                      <p className="text-xs font-semibold">{med.name}</p>
                      <p className="text-[10px] text-muted-foreground">{med.dosage}</p>
                      <div className="mt-1.5 flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">Refill by {new Date(med.refillDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                        <button onClick={() => toast.success('Refill requested')} className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                          Request Refill
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-4 text-center text-xs text-muted-foreground">No active medications</p>
              )}
            </div>
          </motion.div>

          {/* Billing */}
          <motion.div variants={fadeUp} className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card">
            <div className="flex items-center gap-2.5 border-b border-border/50 px-5 py-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-950/30">
                <Receipt className="h-4 w-4 text-rose-500" />
              </div>
              <h2 className="text-sm font-semibold">Recent Invoices</h2>
            </div>
            <div className="divide-y divide-border/30">
              {PORTAL_INVOICES.map((inv) => {
                const style = INV_STATUS_STYLES[inv.status];
                return (
                  <div key={inv.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold">{inv.number}</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(inv.date).toLocaleDateString()} · {inv.pet}</p>
                    </div>
                    <span className="text-sm font-bold tabular-nums">${inv.amount.toFixed(2)}</span>
                    <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', style.bg, style.text)}>{style.label}</span>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-border/30 px-5 py-3">
              <button className="flex w-full items-center justify-center gap-1 text-xs font-medium text-primary">
                View All Invoices <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={fadeUp} className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card">
            <div className="p-4">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Quick Actions</h3>
              <div className="space-y-1.5">
                {[
                  { label: 'Message Your Vet', icon: MessageSquare },
                  { label: 'Request Prescription Refill', icon: Pill },
                  { label: 'Update Contact Info', icon: Phone },
                  { label: 'Download Health Records', icon: Download },
                  { label: 'Leave a Review', icon: Star },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => toast.success(`${item.label} — coming soon!`)}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-medium transition-all hover:bg-muted/40"
                  >
                    <item.icon className="h-4 w-4 text-primary" />
                    {item.label}
                    <ChevronRight className="ml-auto h-3 w-3 text-muted-foreground/40" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Clinic Info */}
          <motion.div variants={fadeUp} className="rounded-2xl border border-border/60 bg-gradient-to-br from-primary/5 to-transparent p-4 shadow-card">
            <h3 className="mb-2 text-xs font-bold">Springfield Veterinary Clinic</h3>
            <div className="space-y-1.5 text-[11px] text-muted-foreground">
              <p className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> (555) 200-3000</p>
              <p className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> 1200 Medical Center Dr, Springfield</p>
              <p className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> Mon-Fri 8AM-6PM · Sat 8AM-1PM</p>
            </div>
            <button className="mt-3 inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-lg border border-primary/30 text-xs font-semibold text-primary">
              <Phone className="h-3 w-3" /> Call Now
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

function Plus(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 12h14" /><path d="M12 5v14" />
    </svg>
  );
}
