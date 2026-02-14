import api from './client';

export interface DashboardStats {
  totalClients: number;
  totalPatients: number;
  todayAppointments: number;
  openVisits: number;
  pendingInvoices: number;
  outstandingBalance: number;
  upcomingVaccinations: number;
  overduePreventiveCare: number;
  recentVisits: {
    id: string;
    patientName: string;
    clientName: string;
    chiefComplaint: string | null;
    status: string;
    createdAt: string;
  }[];
  todaySchedule: {
    id: string;
    patientName: string;
    clientName: string;
    vetName: string;
    startTime: string;
    type: string;
    status: string;
  }[];
}

export interface RevenueReport {
  period: string;
  totalInvoiced: number;
  totalCollected: number;
  outstanding: number;
  invoiceCount: number;
}

export interface VisitReport {
  period: string;
  visitCount: number;
  completedCount: number;
}

export interface VaccinationDueReport {
  id: string;
  vaccineName: string;
  nextDueDate: string;
  status: string;
  patientName: string;
  species: string;
  clientName: string;
  clientPhone: string;
}

export interface TopServiceReport {
  description: string;
  category: string | null;
  totalQuantity: number;
  totalRevenue: number;
  invoiceCount: number;
}

export const reportsApi = {
  getDashboardStats: () => api.get<DashboardStats>('/dashboard/stats'),

  getRevenueReport: (startDate: string, endDate: string, groupBy?: string) =>
    api.get<RevenueReport[]>('/reports/revenue', { params: { startDate, endDate, groupBy } }),

  getVisitReport: (startDate: string, endDate: string, groupBy?: string) =>
    api.get<VisitReport[]>('/reports/visits', { params: { startDate, endDate, groupBy } }),

  getVaccinationsDue: (days?: number) =>
    api.get<VaccinationDueReport[]>('/reports/vaccinations-due', { params: { days } }),

  getTopServices: (startDate: string, endDate: string, limit?: number) =>
    api.get<TopServiceReport[]>('/reports/top-services', { params: { startDate, endDate, limit } }),
};
