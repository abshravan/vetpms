import api from './client';

export interface SeedResult {
  success: boolean;
  message: string;
  summary: {
    users: number;
    clients: number;
    patients: number;
    appointments: number;
    visits: number;
    vaccinations: number;
    inventoryItems: number;
    invoices: number;
  };
}

export const seedApi = {
  seedDemo: () => api.post<SeedResult>('/seed/demo'),
};
