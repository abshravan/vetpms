// import { Navigate } from 'react-router-dom';
// import { CircularProgress, Box } from '@mui/material';
// import { useAuth } from './AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
}

// TODO: re-enable auth — currently bypassed for testing
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  // const { user, loading } = useAuth();
  //
  // if (loading) {
  //   return (
  //     <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
  //       <CircularProgress />
  //     </Box>
  //   );
  // }
  //
  // if (!user) {
  //   return <Navigate to="/login" replace />;
  // }
  //
  // if (roles && !roles.includes(user.role)) {
  //   return <Navigate to="/" replace />;
  // }

  return <>{children}</>;
}
