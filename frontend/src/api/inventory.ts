import api from './client';
import {
  InventoryItem,
  CreateInventoryItemData,
  UpdateInventoryItemData,
  InventoryTransaction,
  CreateTransactionData,
  PaginatedResult,
} from '../types';

export const inventoryApi = {
  // Items
  list: (params?: {
    search?: string;
    category?: string;
    lowStock?: boolean;
    active?: boolean;
    page?: number;
    limit?: number;
  }) => api.get<PaginatedResult<InventoryItem>>('/inventory', { params }),

  get: (id: string) => api.get<InventoryItem>(`/inventory/${id}`),

  create: (data: CreateInventoryItemData) =>
    api.post<InventoryItem>('/inventory', data),

  update: (id: string, data: UpdateInventoryItemData) =>
    api.patch<InventoryItem>(`/inventory/${id}`, data),

  remove: (id: string) => api.delete(`/inventory/${id}`),

  getLowStock: () => api.get<InventoryItem[]>('/inventory/low-stock'),

  getExpiring: (days?: number) =>
    api.get<InventoryItem[]>('/inventory/expiring', { params: { days } }),

  // Transactions
  recordTransaction: (data: CreateTransactionData) =>
    api.post<InventoryTransaction>('/inventory/transactions', data),

  getTransactions: (itemId: string, params?: { page?: number; limit?: number }) =>
    api.get<PaginatedResult<InventoryTransaction>>(
      `/inventory/${itemId}/transactions`,
      { params },
    ),

  dispense: (
    itemId: string,
    data: { quantity: number; patientId: string; visitId?: string; notes?: string },
  ) => api.post<InventoryTransaction>(`/inventory/${itemId}/dispense`, data),

  restock: (
    itemId: string,
    data: { quantity: number; unitCost?: number; reference?: string },
  ) => api.post<InventoryTransaction>(`/inventory/${itemId}/restock`, data),
};
