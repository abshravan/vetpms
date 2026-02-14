'use client';

import { useState } from 'react';
import { Typography, Box, Paper, Tabs, Tab } from '@mui/material';
import ClinicSettingsTab from '../../../components/settings/ClinicSettingsTab';
import StaffManagementTab from '../../../components/settings/StaffManagementTab';
import AuditLogTab from '../../../components/settings/AuditLogTab';

export default function SettingsPage() {
  const [tab, setTab] = useState(0);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Settings</Typography>
      <Paper variant="outlined">
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Clinic Info" />
          <Tab label="Staff Management" />
          <Tab label="Audit Log" />
        </Tabs>
        <Box sx={{ p: 2 }}>
          {tab === 0 && <ClinicSettingsTab />}
          {tab === 1 && <StaffManagementTab />}
          {tab === 2 && <AuditLogTab />}
        </Box>
      </Paper>
    </Box>
  );
}
