'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Users,
  PawPrint,
  CalendarDays,
  Receipt,
  Pill,
  Settings,
  BarChart3,
  Bell,
  Stethoscope,
  LayoutDashboard,
  ArrowRight,
  Command,
} from 'lucide-react';
import { clientsApi } from '../api/clients';
import { patientsApi } from '../api/patients';
import { appointmentsApi } from '../api/appointments';
import { cn } from '../lib/utils';

interface SearchResult {
  id: string;
  label: string;
  sublabel: string;
  icon: React.ElementType;
  path: string;
  category: string;
}

const quickLinks: SearchResult[] = [
  { id: 'nav-dashboard', label: 'Dashboard', sublabel: 'Overview & stats', icon: LayoutDashboard, path: '/', category: 'Pages' },
  { id: 'nav-clients', label: 'Clients', sublabel: 'Manage pet owners', icon: Users, path: '/clients', category: 'Pages' },
  { id: 'nav-patients', label: 'Patients', sublabel: 'Manage animals', icon: PawPrint, path: '/patients', category: 'Pages' },
  { id: 'nav-appointments', label: 'Appointments', sublabel: 'Schedule & calendar', icon: CalendarDays, path: '/appointments', category: 'Pages' },
  { id: 'nav-billing', label: 'Billing', sublabel: 'Invoices & payments', icon: Receipt, path: '/billing', category: 'Pages' },
  { id: 'nav-pharmacy', label: 'Pharmacy', sublabel: 'Inventory & stock', icon: Pill, path: '/pharmacy', category: 'Pages' },
  { id: 'nav-reports', label: 'Reports', sublabel: 'Analytics & insights', icon: BarChart3, path: '/reports', category: 'Pages' },
  { id: 'nav-visits', label: 'New Visit', sublabel: 'Start a visit record', icon: Stethoscope, path: '/visits/new', category: 'Actions' },
  { id: 'nav-invoice', label: 'New Invoice', sublabel: 'Create an invoice', icon: Receipt, path: '/billing/new', category: 'Actions' },
  { id: 'nav-notifications', label: 'Notifications', sublabel: 'Alerts & reminders', icon: Bell, path: '/notifications', category: 'Pages' },
  { id: 'nav-settings', label: 'Settings', sublabel: 'Clinic configuration', icon: Settings, path: '/settings', category: 'Pages' },
];

export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when opening
  useEffect(() => {
    if (open) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Search API on query change
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSelectedIndex(0);
      return;
    }

    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      const searchResults: SearchResult[] = [];

      try {
        const [clientsRes, patientsRes, apptsRes] = await Promise.allSettled([
          clientsApi.list({ search: query, limit: 5 }),
          patientsApi.list({ search: query, limit: 5 }),
          appointmentsApi.list({ search: query, limit: 5 }),
        ]);

        if (clientsRes.status === 'fulfilled') {
          clientsRes.value.data.data.forEach((c) =>
            searchResults.push({
              id: `client-${c.id}`,
              label: `${c.firstName} ${c.lastName}`,
              sublabel: `${c.email} · ${c.phone}`,
              icon: Users,
              path: `/clients/${c.id}`,
              category: 'Clients',
            }),
          );
        }

        if (patientsRes.status === 'fulfilled') {
          patientsRes.value.data.data.forEach((p) =>
            searchResults.push({
              id: `patient-${p.id}`,
              label: p.name,
              sublabel: `${p.species} · ${p.breed || 'Unknown breed'}`,
              icon: PawPrint,
              path: `/patients/${p.id}`,
              category: 'Patients',
            }),
          );
        }

        if (apptsRes.status === 'fulfilled') {
          apptsRes.value.data.data.forEach((a) =>
            searchResults.push({
              id: `appt-${a.id}`,
              label: `${a.patient?.name || 'Unknown'} — ${a.type}`,
              sublabel: new Date(a.startTime).toLocaleDateString(),
              icon: CalendarDays,
              path: `/appointments/${a.id}`,
              category: 'Appointments',
            }),
          );
        }
      } catch {
        // Silenced — just show what we got
      }

      setResults(searchResults);
      setSelectedIndex(0);
      setSearching(false);
    }, 200);

    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
  }, [query]);

  // Filtered quick links
  const filteredLinks = useMemo(() => {
    if (!query.trim()) return quickLinks;
    const q = query.toLowerCase();
    return quickLinks.filter(
      (l) => l.label.toLowerCase().includes(q) || l.sublabel.toLowerCase().includes(q),
    );
  }, [query]);

  const allItems = useMemo(() => {
    if (!query.trim()) return quickLinks;
    return [...results, ...filteredLinks];
  }, [query, results, filteredLinks]);

  const navigate = useCallback(
    (path: string) => {
      setOpen(false);
      router.push(path);
    },
    [router],
  );

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, allItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && allItems[selectedIndex]) {
      e.preventDefault();
      navigate(allItems[selectedIndex].path);
    }
  };

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selected = listRef.current.children[selectedIndex] as HTMLElement;
      selected?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  // Group results by category
  const grouped = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {};
    allItems.forEach((item) => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [allItems]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-0 top-[15%] z-50 mx-auto w-full max-w-[560px] px-4"
          >
            <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl">
              {/* Search input */}
              <div className="flex items-center gap-3 border-b border-border/60 px-4">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search clients, patients, appointments..."
                  className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
                />
                <kbd className="hidden rounded-md border border-border/60 bg-muted/50 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-block">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div ref={listRef} className="max-h-[360px] overflow-y-auto p-2">
                {searching && (
                  <div className="flex items-center justify-center py-6">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span className="ml-2 text-xs text-muted-foreground">Searching...</span>
                  </div>
                )}

                {!searching && allItems.length === 0 && query.trim() && (
                  <div className="py-8 text-center">
                    <Search className="mx-auto mb-2 h-8 w-8 text-muted-foreground/20" />
                    <p className="text-sm text-muted-foreground/60">No results found</p>
                  </div>
                )}

                {!searching &&
                  Object.entries(grouped).map(([category, items]) => {
                    // Compute the start index of items in this group within allItems
                    let startIdx = 0;
                    for (const [cat, catItems] of Object.entries(grouped)) {
                      if (cat === category) break;
                      startIdx += catItems.length;
                    }

                    return (
                      <div key={category}>
                        <p className="px-2 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/60">
                          {category}
                        </p>
                        {items.map((item, i) => {
                          const globalIdx = startIdx + i;
                          return (
                            <button
                              key={item.id}
                              onClick={() => navigate(item.path)}
                              onMouseEnter={() => setSelectedIndex(globalIdx)}
                              className={cn(
                                'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                                globalIdx === selectedIndex
                                  ? 'bg-primary/10 text-foreground'
                                  : 'text-foreground/80 hover:bg-accent',
                              )}
                            >
                              <div
                                className={cn(
                                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                                  globalIdx === selectedIndex
                                    ? 'bg-primary/15 text-primary'
                                    : 'bg-muted text-muted-foreground',
                                )}
                              >
                                <item.icon className="h-4 w-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium">{item.label}</p>
                                <p className="truncate text-xs text-muted-foreground">
                                  {item.sublabel}
                                </p>
                              </div>
                              {globalIdx === selectedIndex && (
                                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-primary" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-border/60 px-4 py-2">
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground/50">
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-border/60 bg-muted/50 px-1 py-0.5 font-mono">↑↓</kbd>
                    navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-border/60 bg-muted/50 px-1 py-0.5 font-mono">↵</kbd>
                    open
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground/50">
                  <Command className="h-3 w-3" />
                  <span>K to toggle</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
