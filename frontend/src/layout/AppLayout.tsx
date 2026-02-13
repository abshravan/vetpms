import { Box, Toolbar } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Sidebar, { DRAWER_WIDTH } from './Sidebar';
import Header from './Header';

export default function AppLayout() {
  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Header />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 2,
          width: `calc(100% - ${DRAWER_WIDTH}px)`,
          minHeight: '100vh',
        }}
      >
        <Toolbar variant="dense" />
        <Outlet />
      </Box>
    </Box>
  );
}
