import { useState } from 'react';
import { Typography, Box, Paper, Tabs, Tab } from '@mui/material';
import ClinicSettingsTab from './ClinicSettingsTab';
import StaffManagementTab from './StaffManagementTab';

export default function SettingsPage() {
  const [tab, setTab] = useState(0);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Settings</Typography>
      <Paper variant="outlined">
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Clinic Info" />
          <Tab label="Staff Management" />
        </Tabs>
        <Box sx={{ p: 2 }}>
          {tab === 0 && <ClinicSettingsTab />}
          {tab === 1 && <StaffManagementTab />}
        </Box>
      </Paper>
    </Box>
  );
}
