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
