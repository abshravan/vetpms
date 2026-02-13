import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Box,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Pets as PetsIcon,
  CalendarMonth as CalendarIcon,
  LocalPharmacy as PharmacyIcon,
  Receipt as BillingIcon,
  Assessment as ReportsIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const DRAWER_WIDTH = 220;

const menuItems = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { label: 'Clients', icon: <PeopleIcon />, path: '/clients' },
  { label: 'Patients', icon: <PetsIcon />, path: '/patients' },
  { label: 'Appointments', icon: <CalendarIcon />, path: '/appointments' },
  { label: 'Pharmacy', icon: <PharmacyIcon />, path: '/pharmacy' },
  { label: 'Billing', icon: <BillingIcon />, path: '/billing' },
  { label: 'Reports', icon: <ReportsIcon />, path: '/reports' },
  { label: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
        },
      }}
    >
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PetsIcon color="primary" />
          <Typography variant="h6" fontWeight={700} color="primary">
            VetPMS
          </Typography>
        </Box>
      </Toolbar>
      <List dense>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.path}
            selected={location.pathname === item.path}
            onClick={() => navigate(item.path)}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
}

export { DRAWER_WIDTH };
