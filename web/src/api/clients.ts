import api from './client';
import { Client, CreateClientData, UpdateClientData, PaginatedResult } from '../types';

export const clientsApi = {
  list(params?: { page?: number; limit?: number; search?: string }) {
    return api.get<PaginatedResult<Client>>('/clients', { params });
  },

  get(id: string) {
    return api.get<Client>(`/clients/${id}`);
  },

  create(data: CreateClientData) {
    return api.post<Client>('/clients', data);
  },

  update(id: string, data: UpdateClientData) {
    return api.patch<Client>(`/clients/${id}`, data);
  },

  deactivate(id: string) {
    return api.delete<Client>(`/clients/${id}`);
  },
};
