'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  TextField,
  MenuItem,
} from '@mui/material';
import { ArrowLeft, AlertTriangle, Stethoscope } from 'lucide-react';
import { visitsApi } from '../../../../api/visits';
import { patientsApi } from '../../../../api/patients';
import { usersApi, UserSummary } from '../../../../api/users';
import { Patient } from '../../../../types';

export default function NewVisitPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [vets, setVets] = useState<UserSummary[]>([]);
  const [vetId, setVetId] = useState('');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const patientId = searchParams.get('patientId') || '';
  const clientId = searchParams.get('clientId') || '';

  useEffect(() => {
    if (patientId) {
      patientsApi.get(patientId).then(({ data }) => setPatient(data));
    }
    usersApi.list().then(({ data }) => {
      const vetList = data.filter((u) => u.role === 'vet' || u.role === 'admin');
      setVets(vetList);
      if (vetList.length === 1) setVetId(vetList[0].id);
    });
  }, [patientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !clientId || !vetId) {
      setError('Patient and vet are required');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const { data } = await visitsApi.create({
        patientId,
        clientId,
        vetId,
        chiefComplaint: chiefComplaint || undefined,
      });
      router.push(`/visits/${data.id}`);
    } catch {
      setError('Failed to create visit');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
    >
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-all hover:bg-accent hover:text-foreground hover:shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <div className="mb-0.5 flex items-center gap-2">
            <Stethoscope className="h-3.5 w-3.5 text-primary" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-primary">NEW VISIT</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Start Visit {patient ? `— ${patient.name}` : ''}
          </h1>
        </div>
      </div>

      <div className="max-w-[500px] rounded-2xl border border-border/60 bg-card p-5 shadow-card">
        {error && (
          <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 p-3.5">
            <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {patient && (
          <div className="mb-4">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">Patient</span>
            <p className="text-sm font-medium">
              {patient.name} — {patient.species} {patient.breed ? `(${patient.breed})` : ''}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4">
            <TextField
              label="Veterinarian"
              value={vetId}
              onChange={(e) => setVetId(e.target.value)}
              select
              required
              fullWidth
            >
              {vets.map((v) => (
                <MenuItem key={v.id} value={v.id}>
                  Dr. {v.lastName}, {v.firstName}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Chief Complaint / Reason for Visit"
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              fullWidth
              multiline
              rows={3}
              placeholder="What brought the patient in today?"
            />
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/90 px-4 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:shadow-lg hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Start Visit'}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
