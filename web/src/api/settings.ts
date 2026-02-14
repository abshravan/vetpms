import api from './client';
import {
  ClinicSettings,
  UpdateClinicSettingsData,
  UserProfile,
  CreateUserData,
  UpdateUserData,
} from '../types';

export const settingsApi = {
  get: () => api.get<ClinicSettings>('/settings'),
  update: (data: UpdateClinicSettingsData) =>
    api.patch<ClinicSettings>('/settings', data),
};

export const usersApi = {
  list: () => api.get<UserProfile[]>('/users'),
  get: (id: string) => api.get<UserProfile>(`/users/${id}`),
  create: (data: CreateUserData) => api.post<UserProfile>('/users', data),
  update: (id: string, data: UpdateUserData) =>
    api.patch<UserProfile>(`/users/${id}`, data),
  deactivate: (id: string) => api.delete(`/users/${id}`),
};
