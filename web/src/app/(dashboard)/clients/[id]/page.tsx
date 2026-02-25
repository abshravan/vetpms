'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Chip } from '@mui/material';
import { ArrowLeft, Loader2, Pencil, Plus, PawPrint, Users, AlertTriangle } from 'lucide-react';
import { clientsApi } from '../../../../api/clients';
import { patientsApi } from '../../../../api/patients';
import toast from 'react-hot-toast';
import { Client, CreateClientData, CreatePatientData } from '../../../../types';
import ClientFormDialog from '../../../../components/clients/ClientFormDialog';
import PatientFormDialog from '../../../../components/patients/PatientFormDialog';
import { CardSkeleton } from '../../../../components/Skeleton';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">{label}</span>
      <p className="mt-0.5 text-sm">{children}</p>
    </div>
  );
}

export default function ClientDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [patientDialogOpen, setPatientDialogOpen] = useState(false);

  const fetchClient = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data } = await clientsApi.get(id);
      setClient(data);
    } catch {
      setError('Failed to load client');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchClient();
  }, [fetchClient]);

  const handleUpdate = async (data: CreateClientData) => {
    if (!id) return;
    await clientsApi.update(id, data);
    toast.success('Client updated successfully');
    fetchClient();
  };

  const handleAddPatient = async (data: CreatePatientData) => {
    await patientsApi.create(data);
    toast.success('Patient added successfully');
    fetchClient();
  };

  if (loading) {
    return <CardSkeleton lines={6} />;
  }

  if (error || !client) {
    return (
      <div className="flex items-center gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
        <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
        <p className="text-sm text-destructive">{error || 'Client not found'}</p>
      </div>
    );
  }

  const formatAge = (dob: string | null) => {
    if (!dob) return '—';
    const birth = new Date(dob);
    const now = new Date();
    const years = now.getFullYear() - birth.getFullYear();
    const months = now.getMonth() - birth.getMonth();
    if (years > 0) return `${years}y ${months >= 0 ? months : 12 + months}m`;
    return `${months >= 0 ? months : 12 + months}m`;
  };

  const sexLabel = (sex: string) => {
    const map: Record<string, string> = {
      male: 'M (Intact)', female: 'F (Intact)', male_neutered: 'M (Neutered)',
      female_spayed: 'F (Spayed)', unknown: 'Unknown',
    };
    return map[sex] || sex;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
    >
      {/* Header */}
      <div className="mb-6 flex items-center gap-2">
        <button
          onClick={() => router.push('/clients')}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-all hover:bg-accent hover:text-foreground hover:shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-grow">
          <div className="mb-0.5 flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-primary">Client Profile</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {client.lastName}, {client.firstName}
          </h1>
        </div>
        <Chip
          label={client.isActive ? 'Active' : 'Inactive'}
          size="small"
          color={client.isActive ? 'success' : 'default'}
        />
        <button
          onClick={() => setEditDialogOpen(true)}
          className="inline-flex h-9 items-center gap-2 rounded-xl border border-border/60 px-3.5 text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-foreground hover:shadow-sm"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </button>
      </div>

      {/* Client Info Card */}
      <div className="mb-4 rounded-2xl border border-border/60 bg-card p-5 shadow-card">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Contact Information</h2>
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-4" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Field label="Email">{client.email}</Field>
          <Field label="Phone">{client.phone}</Field>
          <Field label="Alt. Phone">{client.alternatePhone || '—'}</Field>
          <div className="col-span-2">
            <Field label="Address">
              {[client.address, client.city, client.state, client.zipCode].filter(Boolean).join(', ') || '—'}
            </Field>
          </div>
          <Field label="Client Since">{new Date(client.createdAt).toLocaleDateString()}</Field>
        </div>
        {client.notes && (
          <>
            <div className="my-4 h-px bg-border/50" />
            <Field label="Notes">{client.notes}</Field>
          </>
        )}
      </div>

      {/* Patients Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Patients <span className="text-sm font-normal text-muted-foreground">({client.patients?.length ?? 0})</span>
        </h2>
        <button
          onClick={() => setPatientDialogOpen(true)}
          className="inline-flex h-9 items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/90 px-4 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:shadow-lg hover:brightness-110 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Add Patient
        </button>
      </div>

      {/* Patient Cards */}
      {client.patients && client.patients.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {client.patients.map((patient) => (
            <div
              key={patient.id}
              onClick={() => router.push(`/patients/${patient.id}`)}
              className="group cursor-pointer rounded-2xl border border-border/60 bg-card p-4 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
            >
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                  <PawPrint className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-sm font-semibold">{patient.name}</span>
                {patient.isDeceased && <Chip label="Deceased" size="small" />}
              </div>
              <div className="h-px bg-border/50 mb-3" />
              <div className="grid grid-cols-2 gap-2">
                <Field label="Species"><span className="capitalize">{patient.species}</span></Field>
                <Field label="Breed">{patient.breed || '—'}</Field>
                <Field label="Sex">{sexLabel(patient.sex)}</Field>
                <Field label="Age">{formatAge(patient.dateOfBirth)}</Field>
                <Field label="Weight">{patient.weight ? `${patient.weight} ${patient.weightUnit || 'kg'}` : '—'}</Field>
              </div>
              {patient.allergies && (
                <div className="mt-3">
                  <Chip label={`Allergies: ${patient.allergies}`} size="small" color="warning" variant="outlined" />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-border/60 bg-card p-8 text-center shadow-card">
          <PawPrint className="mx-auto mb-2 h-10 w-10 text-muted-foreground/20" />
          <p className="text-sm font-medium text-muted-foreground/60">No patients registered</p>
          <p className="text-xs text-muted-foreground/40">Click &quot;Add Patient&quot; to register an animal</p>
        </div>
      )}

      <ClientFormDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onSubmit={handleUpdate}
        client={client}
      />

      <PatientFormDialog
        open={patientDialogOpen}
        onClose={() => setPatientDialogOpen(false)}
        onSubmit={handleAddPatient}
        clientId={client.id}
      />
    </motion.div>
  );
}
