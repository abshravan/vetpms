'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { ArrowLeft, Loader2, Pencil, PawPrint, AlertTriangle, Plus, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import { patientsApi } from '../../../../api/patients';
import { visitsApi } from '../../../../api/visits';
import { treatmentsApi } from '../../../../api/treatments';
import { billingApi } from '../../../../api/billing';
import {
  Patient,
  CreatePatientData,
  Visit,
  Vaccination,
  PreventiveCare,
  Invoice,
  VACCINATION_STATUS_LABELS,
  VACCINATION_STATUS_COLORS,
  PREVENTIVE_CARE_TYPE_OPTIONS,
  PREVENTIVE_CARE_STATUS_COLORS,
  INVOICE_STATUS_LABELS,
  INVOICE_STATUS_COLORS,
} from '../../../../types';
import PatientFormDialog from '../../../../components/patients/PatientFormDialog';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">{label}</span>
      <p className="mt-0.5 text-sm">{children}</p>
    </div>
  );
}

function SectionCard({ title, count, children, action }: { title: string; count?: number; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-4 rounded-2xl border border-border/60 bg-card shadow-card">
      <div className="flex items-center justify-between p-5 pb-0">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
          {title} {count !== undefined && <span className="text-muted-foreground/50">({count})</span>}
        </h2>
        {action}
      </div>
      <div className="mx-5 mt-3 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="p-5 pt-4">{children}</div>
    </div>
  );
}

export default function PatientProfilePage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [preventiveCare, setPreventiveCare] = useState<PreventiveCare[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const fetchPatient = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [patientRes, visitsRes, vaccRes, pcRes, invRes] = await Promise.all([
        patientsApi.get(id),
        visitsApi.getByPatient(id),
        treatmentsApi.getVaccinationsByPatient(id),
        treatmentsApi.getPreventiveCareByPatient(id),
        billingApi.getByPatient(id),
      ]);
      setPatient(patientRes.data);
      setVisits(visitsRes.data);
      setVaccinations(vaccRes.data);
      setPreventiveCare(pcRes.data);
      setInvoices(invRes.data);
    } catch {
      setError('Failed to load patient');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPatient();
  }, [fetchPatient]);

  const handleUpdate = async (data: CreatePatientData) => {
    if (!id) return;
    const { clientId: _, ...updateData } = data;
    await patientsApi.update(id, updateData);
    toast.success('Patient updated successfully');
    fetchPatient();
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(reader.result as string);
      toast.success('Photo uploaded');
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">Loading patient...</span>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="flex items-center gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
        <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
        <p className="text-sm text-destructive">{error || 'Patient not found'}</p>
      </div>
    );
  }

  const formatAge = (dob: string | null) => {
    if (!dob) return 'Unknown';
    const birth = new Date(dob);
    const now = new Date();
    const years = now.getFullYear() - birth.getFullYear();
    const months = now.getMonth() - birth.getMonth();
    const adjustedMonths = months >= 0 ? months : 12 + months;
    const adjustedYears = months < 0 ? years - 1 : years;
    if (adjustedYears > 0) return `${adjustedYears} year${adjustedYears > 1 ? 's' : ''}, ${adjustedMonths} month${adjustedMonths !== 1 ? 's' : ''}`;
    return `${adjustedMonths} month${adjustedMonths !== 1 ? 's' : ''}`;
  };

  const sexLabel: Record<string, string> = {
    male: 'Male (Intact)', female: 'Female (Intact)', male_neutered: 'Male (Neutered)',
    female_spayed: 'Female (Spayed)', unknown: 'Unknown',
  };

  const careTypeLabel = (t: string) => PREVENTIVE_CARE_TYPE_OPTIONS.find((o) => o.value === t)?.label || t;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
    >
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => router.push(patient.client ? `/clients/${patient.clientId}` : '/patients')}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-all hover:bg-accent hover:text-foreground hover:shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        {/* Photo avatar */}
        <label className="group relative cursor-pointer" title="Upload photo">
          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border-2 border-border/60 bg-gradient-to-br from-primary/10 to-primary/5 transition-all group-hover:border-primary/40 group-hover:shadow-md">
            {photoPreview || patient.photoUrl ? (
              <img
                src={photoPreview || patient.photoUrl || ''}
                alt={patient.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <PawPrint className="h-6 w-6 text-primary/40" />
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground opacity-0 shadow-sm transition-all group-hover:opacity-100">
            <Camera className="h-3 w-3" />
          </div>
          <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
        </label>

        <div className="flex-grow">
          <div className="mb-0.5 flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-primary">Patient Profile</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{patient.name}</h1>
        </div>
        {patient.isDeceased && <Chip label="Deceased" size="small" />}
        {!patient.isActive && !patient.isDeceased && <Chip label="Inactive" size="small" />}
        <button
          onClick={() => setEditDialogOpen(true)}
          className="inline-flex h-9 items-center gap-2 rounded-xl border border-border/60 px-3.5 text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-foreground hover:shadow-sm"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </button>
      </div>

      {/* Allergy alert */}
      {patient.allergies && (
        <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-warning/30 bg-warning/5 p-3.5">
          <AlertTriangle className="h-4 w-4 shrink-0 text-warning" />
          <p className="text-sm"><strong>Allergies:</strong> {patient.allergies}</p>
        </div>
      )}

      {/* Patient Info */}
      <SectionCard title="Patient Information">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Field label="Species"><span className="capitalize">{patient.species}</span></Field>
          <Field label="Breed">{patient.breed || '—'}</Field>
          <Field label="Color">{patient.color || '—'}</Field>
          <Field label="Sex">{sexLabel[patient.sex] || patient.sex}</Field>
          <Field label="Date of Birth">{patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : '—'}</Field>
          <Field label="Age">{formatAge(patient.dateOfBirth)}</Field>
          <Field label="Weight"><span className="font-semibold">{patient.weight ? `${patient.weight} ${patient.weightUnit || 'kg'}` : '—'}</span></Field>
          <Field label="Microchip">{patient.microchipNumber || '—'}</Field>
        </div>
      </SectionCard>

      {/* Insurance */}
      {(patient.insuranceProvider || patient.insurancePolicyNumber) && (
        <SectionCard title="Insurance">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Provider">{patient.insuranceProvider || '—'}</Field>
            <Field label="Policy Number">{patient.insurancePolicyNumber || '—'}</Field>
          </div>
        </SectionCard>
      )}

      {/* Owner */}
      {patient.client && (
        <SectionCard title="Owner">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Field label="Name">
              <button
                className="text-primary hover:underline"
                onClick={() => router.push(`/clients/${patient.clientId}`)}
              >
                {patient.client.lastName}, {patient.client.firstName}
              </button>
            </Field>
            <Field label="Phone">{patient.client.phone}</Field>
            <Field label="Email">{patient.client.email}</Field>
          </div>
        </SectionCard>
      )}

      {/* Notes */}
      {patient.notes && (
        <SectionCard title="Notes">
          <p className="text-sm">{patient.notes}</p>
        </SectionCard>
      )}

      {/* Vaccinations */}
      <SectionCard title="Vaccination History" count={vaccinations.length}>
        {vaccinations.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-border/40">
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Vaccine</TableCell>
                    <TableCell>Date Given</TableCell>
                    <TableCell>Next Due</TableCell>
                    <TableCell>Route / Site</TableCell>
                    <TableCell>Lot #</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {vaccinations.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell sx={{ fontWeight: 500 }}>{v.vaccineName}</TableCell>
                      <TableCell>{v.dateAdministered ? new Date(v.dateAdministered).toLocaleDateString() : '—'}</TableCell>
                      <TableCell>
                        {v.nextDueDate ? (
                          <span className={new Date(v.nextDueDate) < new Date() ? 'font-semibold text-destructive' : ''}>
                            {new Date(v.nextDueDate).toLocaleDateString()}
                          </span>
                        ) : '—'}
                      </TableCell>
                      <TableCell>{[v.route, v.site].filter(Boolean).join(' / ') || '—'}</TableCell>
                      <TableCell>{v.lotNumber || '—'}</TableCell>
                      <TableCell>
                        <Chip label={VACCINATION_STATUS_LABELS[v.status]} color={VACCINATION_STATUS_COLORS[v.status]} size="small" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground/60">No vaccinations recorded.</p>
        )}
      </SectionCard>

      {/* Preventive Care */}
      <SectionCard title="Preventive Care" count={preventiveCare.length}>
        {preventiveCare.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-border/40">
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Product</TableCell>
                    <TableCell>Last Given</TableCell>
                    <TableCell>Next Due</TableCell>
                    <TableCell>Frequency</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {preventiveCare.map((pc) => (
                    <TableRow key={pc.id}>
                      <TableCell>{careTypeLabel(pc.careType)}</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{pc.name}</TableCell>
                      <TableCell>{pc.productName || '—'}</TableCell>
                      <TableCell>{pc.lastAdministered ? new Date(pc.lastAdministered).toLocaleDateString() : '—'}</TableCell>
                      <TableCell>
                        {pc.nextDueDate ? (
                          <span className={new Date(pc.nextDueDate) < new Date() ? 'font-semibold text-destructive' : ''}>
                            {new Date(pc.nextDueDate).toLocaleDateString()}
                          </span>
                        ) : '—'}
                      </TableCell>
                      <TableCell>{pc.frequencyDays ? `Every ${pc.frequencyDays} days` : '—'}</TableCell>
                      <TableCell>
                        <Chip label={pc.status.replace('_', ' ').toUpperCase()} color={PREVENTIVE_CARE_STATUS_COLORS[pc.status]} size="small" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground/60">No preventive care plans set up.</p>
        )}
      </SectionCard>

      {/* Invoices */}
      <SectionCard
        title="Invoices"
        count={invoices.length}
        action={
          <button
            onClick={() => router.push(`/billing/new?clientId=${patient.clientId}&patientId=${patient.id}`)}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border/60 px-3 text-xs font-medium text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
          >
            <Plus className="h-3 w-3" />
            New Invoice
          </button>
        }
      >
        {invoices.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-border/40">
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Invoice #</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell align="right">Balance</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoices.map((inv) => (
                    <TableRow key={inv.id} hover sx={{ cursor: 'pointer' }} onClick={() => router.push(`/billing/${inv.id}`)}>
                      <TableCell sx={{ fontWeight: 500 }}>{inv.invoiceNumber}</TableCell>
                      <TableCell>{new Date(inv.issueDate).toLocaleDateString()}</TableCell>
                      <TableCell align="right"><span className="tabular-nums">${Number(inv.totalAmount).toFixed(2)}</span></TableCell>
                      <TableCell align="right">
                        <span className={`tabular-nums ${Number(inv.balanceDue) > 0 ? 'font-semibold text-destructive' : ''}`}>
                          ${Number(inv.balanceDue).toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Chip label={INVOICE_STATUS_LABELS[inv.status]} color={INVOICE_STATUS_COLORS[inv.status]} size="small" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground/60">No invoices for this patient.</p>
        )}
      </SectionCard>

      {/* Visit History */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Visit History <span className="text-sm font-normal text-muted-foreground">({visits.length})</span>
        </h2>
        <button
          onClick={() => router.push(`/visits/new?patientId=${patient.id}&clientId=${patient.clientId}`)}
          className="inline-flex h-9 items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/90 px-4 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:shadow-lg hover:brightness-110 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Start Visit
        </button>
      </div>
      {visits.length > 0 ? (
        <div className="space-y-2">
          {visits.map((visit) => (
            <div
              key={visit.id}
              onClick={() => router.push(`/visits/${visit.id}`)}
              className="cursor-pointer rounded-2xl border border-border/60 bg-card p-4 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">
                    {new Date(visit.createdAt).toLocaleDateString()} — {visit.chiefComplaint || 'Visit'}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Dr. {visit.vet?.lastName || '—'} | {visit.vitals?.length || 0} vitals | {visit.clinicalNotes?.length || 0} notes
                  </p>
                </div>
                <Chip
                  label={visit.status.replace('_', ' ').toUpperCase()}
                  size="small"
                  color={visit.status === 'completed' ? 'success' : visit.status === 'in_progress' ? 'warning' : 'default'}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-border/60 bg-card p-8 text-center shadow-card">
          <PawPrint className="mx-auto mb-2 h-10 w-10 text-muted-foreground/20" />
          <p className="text-sm font-medium text-muted-foreground/60">No visits recorded yet</p>
          <p className="text-xs text-muted-foreground/40">Click &quot;Start Visit&quot; to begin</p>
        </div>
      )}

      <PatientFormDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onSubmit={handleUpdate}
        clientId={patient.clientId}
        patient={patient}
      />
    </motion.div>
  );
}
