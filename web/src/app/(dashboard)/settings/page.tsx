'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Users, ScrollText, Settings } from 'lucide-react';
import ClinicSettingsTab from '../../../components/settings/ClinicSettingsTab';
import StaffManagementTab from '../../../components/settings/StaffManagementTab';
import AuditLogTab from '../../../components/settings/AuditLogTab';
import { cn } from '../../../lib/utils';

const tabs = [
  { label: 'Clinic Info', icon: Building2 },
  { label: 'Staff Management', icon: Users },
  { label: 'Audit Log', icon: ScrollText },
];

export default function SettingsPage() {
  const [tab, setTab] = useState(0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
    >
      {/* Page header */}
      <div className="mb-8">
        <div className="mb-1 flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">Configuration</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">Configure your clinic, manage staff, and view audit history</p>
      </div>

      {/* Tab navigation */}
      <div className="mb-6 flex gap-1 rounded-xl border border-border/60 bg-muted/50 p-1">
        {tabs.map((t, i) => (
          <button
            key={t.label}
            onClick={() => setTab(i)}
            className={cn(
              'flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all',
              tab === i
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-card">
        {tab === 0 && <ClinicSettingsTab />}
        {tab === 1 && <StaffManagementTab />}
        {tab === 2 && <AuditLogTab />}
      </div>
    </motion.div>
  );
}
