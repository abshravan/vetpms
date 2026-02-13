import { Routes, Route } from 'react-router-dom';
import LoginPage from './auth/LoginPage';
import ProtectedRoute from './auth/ProtectedRoute';
import AppLayout from './layout/AppLayout';
import DashboardPage from './pages/DashboardPage';
import PlaceholderPage from './pages/PlaceholderPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/clients" element={<PlaceholderPage title="Clients" />} />
        <Route path="/patients" element={<PlaceholderPage title="Patients" />} />
        <Route path="/appointments" element={<PlaceholderPage title="Appointments" />} />
        <Route path="/pharmacy" element={<PlaceholderPage title="Pharmacy & Inventory" />} />
        <Route path="/billing" element={<PlaceholderPage title="Billing" />} />
        <Route path="/reports" element={<PlaceholderPage title="Reports" />} />
        <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
      </Route>
    </Routes>
  );
}
