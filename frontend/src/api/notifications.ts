import api from './client';
import { AppNotification, PaginatedResult, AuditLogEntry } from '../types';

export const notificationsApi = {
  list: (params?: { unreadOnly?: boolean; type?: string; page?: number; limit?: number }) =>
    api.get<PaginatedResult<AppNotification>>('/notifications', { params }),

  getUnreadCount: () => api.get<number>('/notifications/unread-count'),

  generate: () => api.post<{ created: number }>('/notifications/generate'),

  markRead: (id: string) => api.post(`/notifications/${id}/read`),

  markAllRead: () => api.post('/notifications/mark-all-read'),

  dismiss: (id: string) => api.post(`/notifications/${id}/dismiss`),
};

export const auditApi = {
  list: (params?: { page?: number; limit?: number; resource?: string; action?: string }) =>
    api.get<PaginatedResult<AuditLogEntry>>('/audit', { params }),
};
