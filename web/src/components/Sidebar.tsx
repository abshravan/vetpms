'use client';

import { usePathname, useRouter } from 'next/navigation';
import { cn } from '../lib/utils';
import {
  LayoutDashboard,
  Users,
  PawPrint,
  CalendarDays,
  Pill,
  Receipt,
  BarChart3,
  Settings,
} from 'lucide-react';

export const SIDEBAR_WIDTH = 240;

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
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Pharmacy', icon: Pill, path: '/pharmacy' },
      { label: 'Billing', icon: Receipt, path: '/billing' },
      { label: 'Reports', icon: BarChart3, path: '/reports' },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Settings', icon: Settings, path: '/settings' },
    ],
  },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <aside
      className="fixed inset-y-0 left-0 z-30 flex flex-col border-r border-sidebar-border bg-sidebar"
      style={{ width: SIDEBAR_WIDTH }}
    >
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 border-b border-sidebar-border px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <PawPrint className="h-4.5 w-4.5 text-primary-foreground" />
        </div>
        <span className="text-lg font-bold tracking-tight text-sidebar-foreground">
          VetPMS
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.path);
                return (
                  <li key={item.path}>
                    <button
                      onClick={() => router.push(item.path)}
                      className={cn(
                        'group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-all duration-150',
                        active
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                      )}
                    >
                      <item.icon
                        className={cn(
                          'h-4 w-4 shrink-0 transition-colors',
                          active ? 'text-primary' : 'text-muted-foreground group-hover:text-sidebar-foreground',
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
      <div className="border-t border-sidebar-border px-5 py-3">
        <p className="text-[11px] text-muted-foreground">
          Veterinary Practice<br />Management System
        </p>
      </div>
    </aside>
  );
}
