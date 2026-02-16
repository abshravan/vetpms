'use client';

import { useState } from 'react';
import { Building2, Users, ScrollText } from 'lucide-react';
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
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Configure your clinic, manage staff, and view audit history</p>
      </div>

      {/* Tab navigation */}
      <div className="mb-6 flex gap-1 rounded-lg border border-border bg-muted/50 p-1">
        {tabs.map((t, i) => (
          <button
            key={t.label}
            onClick={() => setTab(i)}
            className={cn(
              'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all',
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
      <div className="rounded-xl border border-border bg-card p-5">
        {tab === 0 && <ClinicSettingsTab />}
        {tab === 1 && <StaffManagementTab />}
        {tab === 2 && <AuditLogTab />}
      </div>
    </div>
  );
}
