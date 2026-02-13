import api from './client';
import { Patient, CreatePatientData, UpdatePatientData, PaginatedResult, Species } from '../types';

export const patientsApi = {
  list(params?: { page?: number; limit?: number; search?: string; species?: Species; clientId?: string }) {
    return api.get<PaginatedResult<Patient>>('/patients', { params });
  },

  get(id: string) {
    return api.get<Patient>(`/patients/${id}`);
  },

  create(data: CreatePatientData) {
    return api.post<Patient>('/patients', data);
  },

  update(id: string, data: UpdatePatientData) {
    return api.patch<Patient>(`/patients/${id}`, data);
  },

  deactivate(id: string) {
    return api.delete<Patient>(`/patients/${id}`);
  },
};
