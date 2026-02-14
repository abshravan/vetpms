import { Routes, Route } from 'react-router-dom';
import LoginPage from './auth/LoginPage';
import ProtectedRoute from './auth/ProtectedRoute';
import AppLayout from './layout/AppLayout';
import DashboardPage from './pages/DashboardPage';
import ReportsPage from './pages/ReportsPage';
import PlaceholderPage from './pages/PlaceholderPage';
import ClientsListPage from './pages/clients/ClientsListPage';
import ClientDetailPage from './pages/clients/ClientDetailPage';
import PatientsListPage from './pages/patients/PatientsListPage';
import PatientProfilePage from './pages/patients/PatientProfilePage';
import AppointmentsPage from './pages/appointments/AppointmentsPage';
import AppointmentDetailPage from './pages/appointments/AppointmentDetailPage';
import NewVisitPage from './pages/visits/NewVisitPage';
import VisitDetailPage from './pages/visits/VisitDetailPage';
import InvoicesPage from './pages/billing/InvoicesPage';
import InvoiceDetailPage from './pages/billing/InvoiceDetailPage';
import NewInvoicePage from './pages/billing/NewInvoicePage';
import InventoryListPage from './pages/pharmacy/InventoryListPage';
import InventoryDetailPage from './pages/pharmacy/InventoryDetailPage';
import InventoryFormPage from './pages/pharmacy/InventoryFormPage';

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
        <Route path="/clients" element={<ClientsListPage />} />
        <Route path="/clients/:id" element={<ClientDetailPage />} />
        <Route path="/patients" element={<PatientsListPage />} />
        <Route path="/patients/:id" element={<PatientProfilePage />} />
        <Route path="/appointments" element={<AppointmentsPage />} />
        <Route path="/appointments/:id" element={<AppointmentDetailPage />} />
        <Route path="/visits/new" element={<NewVisitPage />} />
        <Route path="/visits/:id" element={<VisitDetailPage />} />
        <Route path="/pharmacy" element={<InventoryListPage />} />
        <Route path="/pharmacy/new" element={<InventoryFormPage />} />
        <Route path="/pharmacy/:id/edit" element={<InventoryFormPage />} />
        <Route path="/pharmacy/:id" element={<InventoryDetailPage />} />
        <Route path="/billing" element={<InvoicesPage />} />
        <Route path="/billing/new" element={<NewInvoicePage />} />
        <Route path="/billing/:id" element={<InvoiceDetailPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
      </Route>
    </Routes>
  );
}
