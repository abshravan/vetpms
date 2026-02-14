import api from './client';
import {
  Appointment,
  CreateAppointmentData,
  UpdateAppointmentData,
  PaginatedResult,
  AppointmentStatus,
} from '../types';

export const appointmentsApi = {
  list(params?: {
    page?: number;
    limit?: number;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    vetId?: string;
    clientId?: string;
    patientId?: string;
    status?: AppointmentStatus;
  }) {
    return api.get<PaginatedResult<Appointment>>('/appointments', { params });
  },

  getDay(date: string, vetId?: string) {
    return api.get<Appointment[]>(`/appointments/day/${date}`, {
      params: vetId ? { vetId } : undefined,
    });
  },

  get(id: string) {
    return api.get<Appointment>(`/appointments/${id}`);
  },

  create(data: CreateAppointmentData) {
    return api.post<Appointment>('/appointments', data);
  },

  update(id: string, data: UpdateAppointmentData) {
    return api.patch<Appointment>(`/appointments/${id}`, data);
  },

  transition(id: string, status: AppointmentStatus, cancellationReason?: string) {
    return api.patch<Appointment>(`/appointments/${id}/status`, {
      status,
      ...(cancellationReason && { cancellationReason }),
    });
  },
};
