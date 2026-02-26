'use client';

import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { useSidebar } from './SidebarContext';
import {
  LayoutDashboard,
  Users,
  PawPrint,
  CalendarDays,
  Pill,
  Receipt,
  BarChart3,
  Settings,
  Bell,
  X,
  Video,
  BrainCircuit,
  MessageSquare,
  FlaskConical,
  CalendarClock,
} from 'lucide-react';

export const SIDEBAR_WIDTH = 260;

const navGroups = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    ],
  },
  {
    label: 'Practice',
    items: [
      { label: 'Clients', icon: Users, path: '/clients' },
      { label: 'Patients', icon: PawPrint, path: '/patients' },
      { label: 'Appointments', icon: CalendarDays, path: '/appointments' },
      { label: 'Telemedicine', icon: Video, path: '/telemedicine' },
    ],
  },
  {
    label: 'Clinical',
    items: [
      { label: 'Lab Results', icon: FlaskConical, path: '/lab-results' },
      { label: 'Communications', icon: MessageSquare, path: '/communications' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Pharmacy', icon: Pill, path: '/pharmacy' },
      { label: 'Billing', icon: Receipt, path: '/billing' },
      { label: 'Scheduling', icon: CalendarClock, path: '/scheduling' },
      { label: 'Reports', icon: BarChart3, path: '/reports' },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Notifications', icon: Bell, path: '/notifications' },
      { label: 'Settings', icon: Settings, path: '/settings' },
    ],
  },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { isOpen, isMobile, close } = useSidebar();

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  const handleNav = (path: string) => {
    router.push(path);
    if (isMobile) close();
  };

  const sidebarContent = (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
        isMobile && !isOpen && '-translate-x-full',
      )}
      style={{ width: SIDEBAR_WIDTH }}
    >
      {/* Logo area with gradient accent */}
      <div className="relative flex h-16 items-center justify-between gap-3 px-5">
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-sidebar-border to-transparent" />
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-md glow-primary">
            <PawPrint className="h-[18px] w-[18px] text-primary-foreground" />
          </div>
          <div>
            <span className="text-[15px] font-bold tracking-tight text-sidebar-foreground">
              VetPMS
            </span>
            <p className="text-[10px] font-medium text-muted-foreground">
              Practice Management
            </p>
          </div>
        </div>
        {isMobile && (
          <button
            onClick={close}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-5">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-6">
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/70">
              {group.label}
            </p>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const active = isActive(item.path);
                return (
                  <li key={item.path}>
                    <button
                      onClick={() => handleNav(item.path)}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200',
                        active
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                          : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground',
                      )}
                    >
                      {active && (
                        <div className="absolute -left-3 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />
                      )}
                      <item.icon
                        className={cn(
                          'h-[18px] w-[18px] shrink-0 transition-all duration-200',
                          active
                            ? 'text-primary'
                            : 'text-muted-foreground/70 group-hover:text-sidebar-foreground',
                        )}
                      />
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom branding */}
      <div className="relative px-5 py-4">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sidebar-border to-transparent" />
        <div className="rounded-xl bg-gradient-to-br from-primary/[0.06] to-transparent p-3">
          <p className="text-[11px] font-medium text-muted-foreground">
            Veterinary Practice
          </p>
          <p className="text-[10px] text-muted-foreground/60">
            Management System v1.0
          </p>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={close}
          />
        )}
      </AnimatePresence>
      {sidebarContent}
    </>
  );
}
