'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  CalendarDays,
  Users,
  PawPrint,
  Receipt,
  Stethoscope,
  X,
} from 'lucide-react';
import { cn } from '../lib/utils';

const actions = [
  { label: 'New Appointment', icon: CalendarDays, href: '/appointments', color: 'from-orange-500 to-amber-500', action: 'openAppt' },
  { label: 'New Client', icon: Users, href: '/clients', color: 'from-emerald-500 to-emerald-600', action: 'openClient' },
  { label: 'New Patient', icon: PawPrint, href: '/patients', color: 'from-blue-500 to-blue-600', action: 'openPatient' },
  { label: 'New Invoice', icon: Receipt, href: '/billing/new', color: 'from-purple-500 to-violet-500' },
  { label: 'New Visit', icon: Stethoscope, href: '/visits/new', color: 'from-rose-500 to-red-500' },
];

export default function QuickActions() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleAction = (action: typeof actions[number]) => {
    setOpen(false);
    router.push(action.href);
  };

  return (
    <div className="no-print fixed bottom-6 right-6 z-50 sm:bottom-8 sm:right-8">
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            {/* Action items */}
            <div className="absolute bottom-16 right-0 z-50 mb-2 flex flex-col items-end gap-2">
              {actions.map((action, i) => (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.8 }}
                  transition={{ delay: i * 0.05, duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => handleAction(action)}
                  className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-2.5 shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
                >
                  <span className="text-sm font-medium text-foreground whitespace-nowrap">{action.label}</span>
                  <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-sm', action.color)}>
                    <action.icon className="h-4 w-4" />
                  </div>
                </motion.button>
              ))}
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => setOpen(!open)}
        className={cn(
          'relative z-50 flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg transition-all duration-300',
          'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground glow-primary',
          'hover:shadow-xl hover:brightness-110',
          open && 'rotate-45',
        )}
        aria-label={open ? 'Close quick actions' : 'Quick actions'}
      >
        {open ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
      </motion.button>
    </div>
  );
}
