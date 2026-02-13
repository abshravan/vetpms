export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  alternatePhone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  notes: string | null;
  isActive: boolean;
  patients: Patient[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  notes?: string;
}

export type UpdateClientData = Partial<CreateClientData> & { isActive?: boolean };

export type Species = 'dog' | 'cat' | 'bird' | 'rabbit' | 'reptile' | 'horse' | 'other';
export type Sex = 'male' | 'female' | 'male_neutered' | 'female_spayed' | 'unknown';

export const SPECIES_OPTIONS: { value: Species; label: string }[] = [
  { value: 'dog', label: 'Dog' },
  { value: 'cat', label: 'Cat' },
  { value: 'bird', label: 'Bird' },
  { value: 'rabbit', label: 'Rabbit' },
  { value: 'reptile', label: 'Reptile' },
  { value: 'horse', label: 'Horse' },
  { value: 'other', label: 'Other' },
];

export const SEX_OPTIONS: { value: Sex; label: string }[] = [
  { value: 'male', label: 'Male (Intact)' },
  { value: 'female', label: 'Female (Intact)' },
  { value: 'male_neutered', label: 'Male (Neutered)' },
  { value: 'female_spayed', label: 'Female (Spayed)' },
  { value: 'unknown', label: 'Unknown' },
];

export interface Patient {
  id: string;
  clientId: string;
  client?: Client;
  name: string;
  species: Species;
  breed: string | null;
  color: string | null;
  sex: Sex;
  dateOfBirth: string | null;
  weight: number | null;
  weightUnit: string | null;
  microchipNumber: string | null;
  insuranceProvider: string | null;
  insurancePolicyNumber: string | null;
  allergies: string | null;
  notes: string | null;
  photoUrl: string | null;
  isActive: boolean;
  isDeceased: boolean;
  deceasedDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePatientData {
  clientId: string;
  name: string;
  species: Species;
  breed?: string;
  color?: string;
  sex?: Sex;
  dateOfBirth?: string;
  weight?: number;
  weightUnit?: string;
  microchipNumber?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  allergies?: string;
  notes?: string;
}

export type UpdatePatientData = Partial<Omit<CreatePatientData, 'clientId'>> & {
  isActive?: boolean;
  isDeceased?: boolean;
  deceasedDate?: string;
};

// ── Appointments ──

export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'checked_in'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export type AppointmentType =
  | 'checkup'
  | 'vaccination'
  | 'surgery'
  | 'dental'
  | 'grooming'
  | 'emergency'
  | 'follow_up'
  | 'lab_work'
  | 'other';

export const APPOINTMENT_TYPE_OPTIONS: { value: AppointmentType; label: string }[] = [
  { value: 'checkup', label: 'Check-up' },
  { value: 'vaccination', label: 'Vaccination' },
  { value: 'surgery', label: 'Surgery' },
  { value: 'dental', label: 'Dental' },
  { value: 'grooming', label: 'Grooming' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'follow_up', label: 'Follow-up' },
  { value: 'lab_work', label: 'Lab Work' },
  { value: 'other', label: 'Other' },
];

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  scheduled: 'Scheduled',
  confirmed: 'Confirmed',
  checked_in: 'Checked In',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No Show',
};

export const APPOINTMENT_STATUS_COLORS: Record<AppointmentStatus, 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'> = {
  scheduled: 'default',
  confirmed: 'info',
  checked_in: 'warning',
  in_progress: 'secondary',
  completed: 'success',
  cancelled: 'error',
  no_show: 'error',
};

// Valid next statuses for UI buttons
export const APPOINTMENT_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  scheduled: ['confirmed', 'checked_in', 'cancelled', 'no_show'],
  confirmed: ['checked_in', 'cancelled', 'no_show'],
  checked_in: ['in_progress', 'cancelled'],
  in_progress: ['completed'],
  completed: [],
  cancelled: [],
  no_show: [],
};

export interface Appointment {
  id: string;
  clientId: string;
  client?: Client;
  patientId: string;
  patient?: Patient;
  vetId: string;
  vet?: { id: string; firstName: string; lastName: string; email: string; role: string };
  startTime: string;
  endTime: string;
  type: AppointmentType;
  status: AppointmentStatus;
  reason: string | null;
  notes: string | null;
  cancellationReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentData {
  clientId: string;
  patientId: string;
  vetId: string;
  startTime: string;
  endTime: string;
  type?: AppointmentType;
  reason?: string;
  notes?: string;
}

export interface UpdateAppointmentData {
  vetId?: string;
  startTime?: string;
  endTime?: string;
  type?: AppointmentType;
  reason?: string;
  notes?: string;
}
