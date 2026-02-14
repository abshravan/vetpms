import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, IconButton, Box, Chip, Badge } from '@mui/material';
import { Logout as LogoutIcon, Notifications as NotificationsIcon } from '@mui/icons-material';
import { useAuth } from '../auth/AuthContext';
import { DRAWER_WIDTH } from './Sidebar';
import { notificationsApi } from '../api/notifications';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    notificationsApi.getUnreadCount().then(({ data }) => setUnreadCount(data)).catch(() => {});
    const interval = setInterval(() => {
      notificationsApi.getUnreadCount().then(({ data }) => setUnreadCount(data)).catch(() => {});
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AppBar
      position="fixed"
      sx={{
        width: `calc(100% - ${DRAWER_WIDTH}px)`,
        ml: `${DRAWER_WIDTH}px`,
        bgcolor: 'background.paper',
        color: 'text.primary',
        boxShadow: 1,
      }}
    >
      <Toolbar variant="dense">
        <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
          Veterinary Practice Management
        </Typography>
        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton size="small" onClick={() => navigate('/notifications')} title="Notifications">
              <Badge badgeContent={unreadCount} color="error" max={99}>
                <NotificationsIcon fontSize="small" />
              </Badge>
            </IconButton>
            <Chip
              label={user.role.toUpperCase()}
              size="small"
              color="primary"
              variant="outlined"
            />
            <Typography variant="body2">
              {user.firstName} {user.lastName}
            </Typography>
            <IconButton size="small" onClick={logout} title="Sign out">
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
