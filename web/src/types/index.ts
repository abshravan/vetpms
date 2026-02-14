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

// ── Visits / EMR ──

export type VisitStatus = 'open' | 'in_progress' | 'completed';
export type NoteType = 'soap' | 'progress' | 'procedure' | 'discharge' | 'general';

export const NOTE_TYPE_OPTIONS: { value: NoteType; label: string }[] = [
  { value: 'soap', label: 'SOAP Note' },
  { value: 'progress', label: 'Progress Note' },
  { value: 'procedure', label: 'Procedure Note' },
  { value: 'discharge', label: 'Discharge Summary' },
  { value: 'general', label: 'General Note' },
];

export interface SOAPContent {
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
  text?: string;
}

export interface ClinicalNote {
  id: string;
  visitId: string;
  authorId: string;
  author?: { id: string; firstName: string; lastName: string };
  noteType: NoteType;
  content: SOAPContent;
  correctsNoteId: string | null;
  createdAt: string;
}

export interface VitalsRecord {
  id: string;
  visitId: string;
  recordedById: string;
  recordedBy?: { id: string; firstName: string; lastName: string };
  temperature: number | null;
  temperatureUnit: string | null;
  heartRate: number | null;
  respiratoryRate: number | null;
  weight: number | null;
  weightUnit: string | null;
  bodyConditionScore: number | null;
  painScore: number | null;
  mucousMembraneColor: string | null;
  capillaryRefillTime: number | null;
  notes: string | null;
  recordedAt: string;
}

export interface Visit {
  id: string;
  patientId: string;
  patient?: Patient;
  clientId: string;
  client?: Client;
  vetId: string;
  vet?: { id: string; firstName: string; lastName: string };
  appointmentId: string | null;
  status: VisitStatus;
  chiefComplaint: string | null;
  vitals: VitalsRecord[];
  clinicalNotes: ClinicalNote[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateVisitData {
  patientId: string;
  clientId: string;
  vetId: string;
  appointmentId?: string;
  chiefComplaint?: string;
}

export interface RecordVitalsData {
  temperature?: number;
  temperatureUnit?: string;
  heartRate?: number;
  respiratoryRate?: number;
  weight?: number;
  weightUnit?: string;
  bodyConditionScore?: number;
  painScore?: number;
  mucousMembraneColor?: string;
  capillaryRefillTime?: number;
  notes?: string;
}

export interface CreateClinicalNoteData {
  noteType?: NoteType;
  content: SOAPContent;
  correctsNoteId?: string;
}

// ── Treatments ──

export type TreatmentStatus = 'ordered' | 'in_progress' | 'completed' | 'cancelled';
export type TreatmentCategory = 'medication' | 'procedure' | 'surgery' | 'lab_test' | 'imaging' | 'fluid_therapy' | 'other';

export const TREATMENT_CATEGORY_OPTIONS: { value: TreatmentCategory; label: string }[] = [
  { value: 'medication', label: 'Medication' },
  { value: 'procedure', label: 'Procedure' },
  { value: 'surgery', label: 'Surgery' },
  { value: 'lab_test', label: 'Lab Test' },
  { value: 'imaging', label: 'Imaging' },
  { value: 'fluid_therapy', label: 'Fluid Therapy' },
  { value: 'other', label: 'Other' },
];

export const TREATMENT_STATUS_LABELS: Record<TreatmentStatus, string> = {
  ordered: 'Ordered',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const TREATMENT_STATUS_COLORS: Record<TreatmentStatus, 'default' | 'info' | 'success' | 'error'> = {
  ordered: 'default',
  in_progress: 'info',
  completed: 'success',
  cancelled: 'error',
};

export interface Treatment {
  id: string;
  visitId: string;
  patientId: string;
  patient?: Patient;
  administeredById: string;
  administeredBy?: { id: string; firstName: string; lastName: string };
  category: TreatmentCategory;
  name: string;
  description: string | null;
  dosage: string | null;
  dosageUnit: string | null;
  route: string | null;
  frequency: string | null;
  durationDays: number | null;
  status: TreatmentStatus;
  notes: string | null;
  cost: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTreatmentData {
  visitId: string;
  patientId: string;
  category?: TreatmentCategory;
  name: string;
  description?: string;
  dosage?: string;
  dosageUnit?: string;
  route?: string;
  frequency?: string;
  durationDays?: number;
  notes?: string;
  cost?: number;
}

export interface UpdateTreatmentData {
  status?: TreatmentStatus;
  dosage?: string;
  dosageUnit?: string;
  route?: string;
  frequency?: string;
  durationDays?: number;
  notes?: string;
  cost?: number;
}

// ── Vaccinations ──

export type VaccinationStatus = 'scheduled' | 'administered' | 'missed' | 'cancelled';

export const VACCINATION_STATUS_LABELS: Record<VaccinationStatus, string> = {
  scheduled: 'Scheduled',
  administered: 'Administered',
  missed: 'Missed',
  cancelled: 'Cancelled',
};

export const VACCINATION_STATUS_COLORS: Record<VaccinationStatus, 'default' | 'success' | 'warning' | 'error'> = {
  scheduled: 'default',
  administered: 'success',
  missed: 'warning',
  cancelled: 'error',
};

export interface Vaccination {
  id: string;
  patientId: string;
  patient?: Patient;
  visitId: string | null;
  administeredById: string | null;
  administeredBy?: { id: string; firstName: string; lastName: string } | null;
  vaccineName: string;
  manufacturer: string | null;
  lotNumber: string | null;
  expirationDate: string | null;
  route: string | null;
  site: string | null;
  dateAdministered: string | null;
  nextDueDate: string | null;
  status: VaccinationStatus;
  notes: string | null;
  cost: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVaccinationData {
  patientId: string;
  visitId?: string;
  vaccineName: string;
  manufacturer?: string;
  lotNumber?: string;
  expirationDate?: string;
  route?: string;
  site?: string;
  dateAdministered?: string;
  nextDueDate?: string;
  notes?: string;
  cost?: number;
}

export interface UpdateVaccinationData {
  visitId?: string;
  status?: VaccinationStatus;
  manufacturer?: string;
  lotNumber?: string;
  expirationDate?: string;
  route?: string;
  site?: string;
  dateAdministered?: string;
  nextDueDate?: string;
  notes?: string;
  cost?: number;
}

// ── Preventive Care ──

export type PreventiveCareType = 'flea_tick' | 'heartworm' | 'deworming' | 'dental' | 'wellness_exam' | 'blood_work' | 'urinalysis' | 'other';
export type PreventiveCareStatus = 'active' | 'due' | 'overdue' | 'completed' | 'discontinued';

export const PREVENTIVE_CARE_TYPE_OPTIONS: { value: PreventiveCareType; label: string }[] = [
  { value: 'flea_tick', label: 'Flea & Tick' },
  { value: 'heartworm', label: 'Heartworm' },
  { value: 'deworming', label: 'Deworming' },
  { value: 'dental', label: 'Dental' },
  { value: 'wellness_exam', label: 'Wellness Exam' },
  { value: 'blood_work', label: 'Blood Work' },
  { value: 'urinalysis', label: 'Urinalysis' },
  { value: 'other', label: 'Other' },
];

export const PREVENTIVE_CARE_STATUS_COLORS: Record<PreventiveCareStatus, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  active: 'success',
  due: 'warning',
  overdue: 'error',
  completed: 'default',
  discontinued: 'default',
};

export interface PreventiveCare {
  id: string;
  patientId: string;
  patient?: Patient;
  careType: PreventiveCareType;
  name: string;
  description: string | null;
  productName: string | null;
  lastAdministered: string | null;
  nextDueDate: string | null;
  frequencyDays: number | null;
  status: PreventiveCareStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePreventiveCareData {
  patientId: string;
  careType: PreventiveCareType;
  name: string;
  description?: string;
  productName?: string;
  lastAdministered?: string;
  nextDueDate?: string;
  frequencyDays?: number;
  notes?: string;
}

export interface UpdatePreventiveCareData {
  name?: string;
  description?: string;
  productName?: string;
  lastAdministered?: string;
  nextDueDate?: string;
  frequencyDays?: number;
  status?: PreventiveCareStatus;
  notes?: string;
}

// ── Billing & Invoicing ──

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled' | 'refunded';
export type PaymentMethod = 'cash' | 'credit_card' | 'debit_card' | 'check' | 'insurance' | 'other';

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  paid: 'Paid',
  partially_paid: 'Partially Paid',
  overdue: 'Overdue',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

export const INVOICE_STATUS_COLORS: Record<InvoiceStatus, 'default' | 'info' | 'success' | 'warning' | 'error'> = {
  draft: 'default',
  sent: 'info',
  paid: 'success',
  partially_paid: 'warning',
  overdue: 'error',
  cancelled: 'error',
  refunded: 'default',
};

export const PAYMENT_METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'debit_card', label: 'Debit Card' },
  { value: 'check', label: 'Check' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'other', label: 'Other' },
];

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  description: string;
  category: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  notes: string | null;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  client?: Client;
  patientId: string | null;
  patient?: Patient | null;
  visitId: string | null;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string | null;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  paymentMethod: PaymentMethod | null;
  paymentDate: string | null;
  notes: string | null;
  items: InvoiceItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvoiceItemData {
  description: string;
  category?: string;
  quantity?: number;
  unitPrice: number;
  notes?: string;
}

export interface CreateInvoiceData {
  clientId: string;
  patientId?: string;
  visitId?: string;
  issueDate?: string;
  dueDate?: string;
  taxRate?: number;
  discountAmount?: number;
  notes?: string;
  items: CreateInvoiceItemData[];
}

export interface UpdateInvoiceData {
  status?: InvoiceStatus;
  dueDate?: string;
  taxRate?: number;
  discountAmount?: number;
  notes?: string;
}

export interface RecordPaymentData {
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate?: string;
  notes?: string;
}

// ── Pharmacy & Inventory ──

export type ItemCategory = 'medication' | 'vaccine' | 'surgical_supply' | 'lab_supply' | 'food' | 'supplement' | 'equipment' | 'consumable' | 'other';
export type ItemUnit = 'tablet' | 'capsule' | 'ml' | 'mg' | 'g' | 'dose' | 'vial' | 'bottle' | 'box' | 'pack' | 'unit' | 'other';
export type TransactionType = 'purchase' | 'dispensed' | 'adjustment' | 'return' | 'expired' | 'damaged' | 'transfer';

export const ITEM_CATEGORY_OPTIONS: { value: ItemCategory; label: string }[] = [
  { value: 'medication', label: 'Medication' },
  { value: 'vaccine', label: 'Vaccine' },
  { value: 'surgical_supply', label: 'Surgical Supply' },
  { value: 'lab_supply', label: 'Lab Supply' },
  { value: 'food', label: 'Food' },
  { value: 'supplement', label: 'Supplement' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'consumable', label: 'Consumable' },
  { value: 'other', label: 'Other' },
];

export const ITEM_UNIT_OPTIONS: { value: ItemUnit; label: string }[] = [
  { value: 'tablet', label: 'Tablet' },
  { value: 'capsule', label: 'Capsule' },
  { value: 'ml', label: 'mL' },
  { value: 'mg', label: 'mg' },
  { value: 'g', label: 'g' },
  { value: 'dose', label: 'Dose' },
  { value: 'vial', label: 'Vial' },
  { value: 'bottle', label: 'Bottle' },
  { value: 'box', label: 'Box' },
  { value: 'pack', label: 'Pack' },
  { value: 'unit', label: 'Unit' },
  { value: 'other', label: 'Other' },
];

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  purchase: 'Purchase',
  dispensed: 'Dispensed',
  adjustment: 'Adjustment',
  return: 'Return',
  expired: 'Expired',
  damaged: 'Damaged',
  transfer: 'Transfer',
};

export const TRANSACTION_TYPE_COLORS: Record<TransactionType, 'success' | 'error' | 'warning' | 'info' | 'default'> = {
  purchase: 'success',
  dispensed: 'info',
  adjustment: 'warning',
  return: 'success',
  expired: 'error',
  damaged: 'error',
  transfer: 'default',
};

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  category: ItemCategory;
  unit: ItemUnit;
  manufacturer: string | null;
  supplier: string | null;
  costPrice: number;
  sellingPrice: number;
  quantityOnHand: number;
  reorderLevel: number;
  reorderQuantity: number;
  lotNumber: string | null;
  expirationDate: string | null;
  location: string | null;
  isActive: boolean;
  requiresPrescription: boolean;
  isControlledSubstance: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInventoryItemData {
  sku: string;
  name: string;
  description?: string;
  category?: ItemCategory;
  unit?: ItemUnit;
  manufacturer?: string;
  supplier?: string;
  costPrice?: number;
  sellingPrice?: number;
  quantityOnHand?: number;
  reorderLevel?: number;
  reorderQuantity?: number;
  lotNumber?: string;
  expirationDate?: string;
  location?: string;
  requiresPrescription?: boolean;
  isControlledSubstance?: boolean;
  notes?: string;
}

export interface UpdateInventoryItemData {
  sku?: string;
  name?: string;
  description?: string;
  category?: ItemCategory;
  unit?: ItemUnit;
  manufacturer?: string;
  supplier?: string;
  costPrice?: number;
  sellingPrice?: number;
  reorderLevel?: number;
  reorderQuantity?: number;
  lotNumber?: string;
  expirationDate?: string;
  location?: string;
  isActive?: boolean;
  requiresPrescription?: boolean;
  isControlledSubstance?: boolean;
  notes?: string;
}

export interface InventoryTransaction {
  id: string;
  itemId: string;
  item?: InventoryItem;
  type: TransactionType;
  quantity: number;
  quantityAfter: number;
  unitCost: number | null;
  patientId: string | null;
  visitId: string | null;
  performedById: string | null;
  reference: string | null;
  notes: string | null;
  createdAt: string;
}

export interface CreateTransactionData {
  itemId: string;
  type: TransactionType;
  quantity: number;
  unitCost?: number;
  patientId?: string;
  visitId?: string;
  reference?: string;
  notes?: string;
}

// ── Settings & User Management ──

export type UserRole = 'admin' | 'vet' | 'tech' | 'receptionist';

export const USER_ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'admin', label: 'Administrator' },
  { value: 'vet', label: 'Veterinarian' },
  { value: 'tech', label: 'Technician' },
  { value: 'receptionist', label: 'Receptionist' },
];

export const USER_ROLE_COLORS: Record<UserRole, 'error' | 'primary' | 'info' | 'default'> = {
  admin: 'error',
  vet: 'primary',
  tech: 'info',
  receptionist: 'default',
};

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  phone: string | null;
  specialty: string | null;
  licenseNumber: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: UserRole;
  phone?: string;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  phone?: string;
  specialty?: string;
  licenseNumber?: string;
  isActive?: boolean;
  password?: string;
}

export interface ClinicSettings {
  id: string;
  clinicName: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  country: string | null;
  timezone: string | null;
  currency: string;
  defaultTaxRate: number;
  appointmentSlotMinutes: number;
  businessHoursStart: string;
  businessHoursEnd: string;
  closedDays: string | null;
  invoicePaymentTermsDays: number;
  invoiceFooter: string | null;
  logoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateClinicSettingsData {
  clinicName?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  timezone?: string;
  currency?: string;
  defaultTaxRate?: number;
  appointmentSlotMinutes?: number;
  businessHoursStart?: string;
  businessHoursEnd?: string;
  closedDays?: string;
  invoicePaymentTermsDays?: number;
  invoiceFooter?: string;
  logoUrl?: string;
}

// ── Notifications ──

export type NotificationType = 'vaccination_due' | 'preventive_care_overdue' | 'low_stock' | 'expiring_inventory' | 'appointment_reminder' | 'invoice_overdue' | 'system';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  vaccination_due: 'Vaccination Due',
  preventive_care_overdue: 'Preventive Care Overdue',
  low_stock: 'Low Stock',
  expiring_inventory: 'Expiring Inventory',
  appointment_reminder: 'Appointment Reminder',
  invoice_overdue: 'Invoice Overdue',
  system: 'System',
};

export const NOTIFICATION_PRIORITY_COLORS: Record<NotificationPriority, 'default' | 'info' | 'warning' | 'error'> = {
  low: 'default',
  medium: 'info',
  high: 'warning',
  urgent: 'error',
};

export interface AppNotification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  referenceId: string | null;
  referenceType: string | null;
  isRead: boolean;
  isDismissed: boolean;
  createdAt: string;
}

// ── Audit Log ──

export interface AuditLogEntry {
  id: string;
  action: string;
  resource: string;
  resourceId: string | null;
  userId: string | null;
  userEmail: string | null;
  details: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
}
