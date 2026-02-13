import api from './client';
import {
  Visit,
  CreateVisitData,
  RecordVitalsData,
  CreateClinicalNoteData,
  VitalsRecord,
  ClinicalNote,
  VisitStatus,
} from '../types';

export const visitsApi = {
  get(id: string) {
    return api.get<Visit>(`/visits/${id}`);
  },

  getByPatient(patientId: string) {
    return api.get<Visit[]>(`/visits/patient/${patientId}`);
  },

  create(data: CreateVisitData) {
    return api.post<Visit>('/visits', data);
  },

  updateStatus(id: string, status: VisitStatus) {
    return api.patch<Visit>(`/visits/${id}/status`, { status });
  },

  complete(id: string) {
    return api.patch<Visit>(`/visits/${id}/complete`);
  },

  recordVitals(visitId: string, data: RecordVitalsData) {
    return api.post<VitalsRecord>(`/visits/${visitId}/vitals`, data);
  },

  addNote(visitId: string, data: CreateClinicalNoteData) {
    return api.post<ClinicalNote>(`/visits/${visitId}/notes`, data);
  },

  getNotes(visitId: string) {
    return api.get<ClinicalNote[]>(`/visits/${visitId}/notes`);
  },
};
