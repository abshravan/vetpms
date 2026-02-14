import api from './client';
import {
  Treatment,
  CreateTreatmentData,
  UpdateTreatmentData,
  Vaccination,
  CreateVaccinationData,
  UpdateVaccinationData,
  PreventiveCare,
  CreatePreventiveCareData,
  UpdatePreventiveCareData,
} from '../types';

export const treatmentsApi = {
  // Treatments
  create: (data: CreateTreatmentData) => api.post<Treatment>('/treatments', data),
  get: (id: string) => api.get<Treatment>(`/treatments/${id}`),
  getByVisit: (visitId: string) => api.get<Treatment[]>(`/visits/${visitId}/treatments`),
  getByPatient: (patientId: string) => api.get<Treatment[]>(`/patients/${patientId}/treatments`),
  update: (id: string, data: UpdateTreatmentData) => api.patch<Treatment>(`/treatments/${id}`, data),

  // Vaccinations
  createVaccination: (data: CreateVaccinationData) => api.post<Vaccination>('/vaccinations', data),
  getVaccination: (id: string) => api.get<Vaccination>(`/vaccinations/${id}`),
  getVaccinationsByPatient: (patientId: string) => api.get<Vaccination[]>(`/patients/${patientId}/vaccinations`),
  updateVaccination: (id: string, data: UpdateVaccinationData) => api.patch<Vaccination>(`/vaccinations/${id}`, data),
  getUpcomingVaccinations: (days?: number) => api.get<Vaccination[]>('/vaccinations/upcoming', { params: { days } }),

  // Preventive Care
  createPreventiveCare: (data: CreatePreventiveCareData) => api.post<PreventiveCare>('/preventive-care', data),
  getPreventiveCare: (id: string) => api.get<PreventiveCare>(`/preventive-care/${id}`),
  getPreventiveCareByPatient: (patientId: string) => api.get<PreventiveCare[]>(`/patients/${patientId}/preventive-care`),
  updatePreventiveCare: (id: string, data: UpdatePreventiveCareData) => api.patch<PreventiveCare>(`/preventive-care/${id}`, data),
  getOverduePreventiveCare: () => api.get<PreventiveCare[]>('/preventive-care-overdue'),
};
