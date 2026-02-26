'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Stethoscope,
  Syringe,
  Receipt,
  Calendar,
  HeartPulse,
  ChevronRight,
} from 'lucide-react';
import { Visit, Vaccination, Invoice } from '../types';
import { cn } from '../lib/utils';

interface TimelineEvent {
  id: string;
  date: string;
  type: 'visit' | 'vaccination' | 'invoice';
  title: string;
  subtitle: string;
  status: string;
  link?: string;
}

interface PatientTimelineProps {
  visits: Visit[];
  vaccinations: Vaccination[];
  invoices: Invoice[];
}

const TYPE_CONFIG = {
  visit: {
    icon: Stethoscope,
    color: 'bg-purple-500',
    lightBg: 'bg-purple-50 dark:bg-purple-950/30',
    borderColor: 'border-purple-200 dark:border-purple-800/40',
  },
  vaccination: {
    icon: Syringe,
    color: 'bg-amber-500',
    lightBg: 'bg-amber-50 dark:bg-amber-950/30',
    borderColor: 'border-amber-200 dark:border-amber-800/40',
  },
  invoice: {
    icon: Receipt,
    color: 'bg-emerald-500',
    lightBg: 'bg-emerald-50 dark:bg-emerald-950/30',
    borderColor: 'border-emerald-200 dark:border-emerald-800/40',
  },
};

export default function PatientTimeline({ visits, vaccinations, invoices }: PatientTimelineProps) {
  const router = useRouter();

  const events = useMemo(() => {
    const items: TimelineEvent[] = [];

    visits.forEach((v) => {
      items.push({
        id: `visit-${v.id}`,
        date: v.createdAt,
        type: 'visit',
        title: v.chiefComplaint || 'Visit',
        subtitle: `Dr. ${v.vet?.lastName || 'Unknown'} · ${v.vitals?.length || 0} vitals · ${v.clinicalNotes?.length || 0} notes`,
        status: v.status,
        link: `/visits/${v.id}`,
      });
    });

    vaccinations.forEach((v) => {
      items.push({
        id: `vax-${v.id}`,
        date: v.dateAdministered || v.createdAt || new Date().toISOString(),
        type: 'vaccination',
        title: v.vaccineName,
        subtitle: [v.route, v.site, v.lotNumber ? `Lot: ${v.lotNumber}` : ''].filter(Boolean).join(' · ') || 'Vaccination',
        status: v.status,
      });
    });

    invoices.forEach((inv) => {
      items.push({
        id: `inv-${inv.id}`,
        date: inv.issueDate,
        type: 'invoice',
        title: `${inv.invoiceNumber} — $${Number(inv.totalAmount).toFixed(2)}`,
        subtitle: `Balance: $${Number(inv.balanceDue).toFixed(2)}`,
        status: inv.status,
        link: `/billing/${inv.id}`,
      });
    });

    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [visits, vaccinations, invoices]);

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <Calendar className="mb-3 h-10 w-10 text-muted-foreground/20" />
        <p className="text-sm font-medium text-muted-foreground/60">No timeline events yet</p>
      </div>
    );
  }

  // Group events by month
  const grouped = useMemo(() => {
    const map = new Map<string, TimelineEvent[]>();
    events.forEach((e) => {
      const d = new Date(e.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    });
    return Array.from(map.entries());
  }, [events]);

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-border via-border/60 to-transparent" />

      {grouped.map(([monthKey, monthEvents]) => {
        const d = new Date(monthKey + '-01');
        const monthLabel = d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

        return (
          <div key={monthKey} className="mb-6">
            {/* Month header */}
            <div className="relative mb-3 flex items-center gap-3 pl-10">
              <div className="absolute left-3 h-4 w-4 rounded-full border-2 border-border bg-card" />
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">
                {monthLabel}
              </p>
            </div>

            {/* Events */}
            {monthEvents.map((event) => {
              const config = TYPE_CONFIG[event.type];
              const Icon = config.icon;
              const eventDate = new Date(event.date);

              return (
                <div
                  key={event.id}
                  className={cn(
                    'relative mb-2 ml-10 rounded-xl border bg-card p-3.5 transition-all',
                    config.borderColor,
                    event.link && 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md',
                  )}
                  onClick={() => event.link && router.push(event.link)}
                >
                  {/* Timeline dot */}
                  <div className={cn('absolute -left-[30px] top-4 flex h-5 w-5 items-center justify-center rounded-full text-white', config.color)}>
                    <Icon className="h-2.5 w-2.5" />
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span className={cn('inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase', config.lightBg)}>
                          {event.type}
                        </span>
                        <span className="text-[10px] tabular-nums text-muted-foreground">
                          {eventDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                        <span className={cn(
                          'rounded-md px-1.5 py-0.5 text-[10px] font-medium capitalize',
                          event.status === 'completed' || event.status === 'paid' || event.status === 'administered'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                            : event.status === 'cancelled' || event.status === 'overdue'
                              ? 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                              : 'bg-muted text-muted-foreground',
                        )}>
                          {event.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm font-medium">{event.title}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{event.subtitle}</p>
                    </div>
                    {event.link && (
                      <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground/30" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
