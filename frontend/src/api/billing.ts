import api from './client';
import {
  Invoice,
  CreateInvoiceData,
  UpdateInvoiceData,
  CreateInvoiceItemData,
  RecordPaymentData,
  PaginatedResult,
} from '../types';

export const billingApi = {
  create: (data: CreateInvoiceData) => api.post<Invoice>('/invoices', data),
  getAll: (params?: { page?: number; limit?: number; search?: string; clientId?: string; status?: string }) =>
    api.get<PaginatedResult<Invoice>>('/invoices', { params }),
  get: (id: string) => api.get<Invoice>(`/invoices/${id}`),
  getByClient: (clientId: string) => api.get<Invoice[]>(`/clients/${clientId}/invoices`),
  getByPatient: (patientId: string) => api.get<Invoice[]>(`/patients/${patientId}/invoices`),
  update: (id: string, data: UpdateInvoiceData) => api.patch<Invoice>(`/invoices/${id}`, data),
  recordPayment: (id: string, data: RecordPaymentData) => api.post<Invoice>(`/invoices/${id}/payment`, data),
  addItem: (id: string, data: CreateInvoiceItemData) => api.post<Invoice>(`/invoices/${id}/items`, data),
  removeItem: (invoiceId: string, itemId: string) => api.delete<Invoice>(`/invoices/${invoiceId}/items/${itemId}`),
};
