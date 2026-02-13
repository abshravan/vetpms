import { AppBar, Toolbar, Typography, IconButton, Box, Chip } from '@mui/material';
import { Logout as LogoutIcon } from '@mui/icons-material';
import { useAuth } from '../auth/AuthContext';
import { DRAWER_WIDTH } from './Sidebar';

export default function Header() {
  const { user, logout } = useAuth();

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
