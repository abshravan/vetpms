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
import { ArrowLeft, Loader2, AlertTriangle, Stethoscope, Printer, Download } from 'lucide-react';
import { visitsApi } from '../../../../api/visits';
import { treatmentsApi } from '../../../../api/treatments';
import {
  Visit,
  Treatment,
  Vaccination,
  RecordVitalsData,
  CreateClinicalNoteData,
  CreateTreatmentData,
  CreateVaccinationData,
  NOTE_TYPE_OPTIONS,
  TREATMENT_STATUS_LABELS,
  TREATMENT_STATUS_COLORS,
  TREATMENT_CATEGORY_OPTIONS,
  VACCINATION_STATUS_LABELS,
  VACCINATION_STATUS_COLORS,
} from '../../../../types';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../../../components/ConfirmDialog';
import VitalsForm from '../../../../components/visits/VitalsForm';
import SOAPNoteForm from '../../../../components/visits/SOAPNoteForm';
import TreatmentForm from '../../../../components/visits/TreatmentForm';
import VaccinationForm from '../../../../components/visits/VaccinationForm';

const STATUS_COLORS: Record<string, 'default' | 'warning' | 'success'> = {
  open: 'default',
  in_progress: 'warning',
  completed: 'success',
};

export default function VisitDetailPage() {
  const params = useParams() as { id: string };
  const id = params.id;
  const router = useRouter();
  const [visit, setVisit] = useState<Visit | null>(null);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAll = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [visitRes, txRes] = await Promise.all([
        visitsApi.get(id),
        treatmentsApi.getByVisit(id),
      ]);
      setVisit(visitRes.data);
      setTreatments(txRes.data);
      // Fetch vaccinations for this patient linked to this visit
      if (visitRes.data.patientId) {
        const vaccRes = await treatmentsApi.getVaccinationsByPatient(visitRes.data.patientId);
        setVaccinations(vaccRes.data.filter((v) => v.visitId === id));
      }
    } catch {
      setError('Failed to load visit');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const [confirmComplete, setConfirmComplete] = useState(false);
  const [confirmCancelTx, setConfirmCancelTx] = useState<string | null>(null);

  const handleRecordVitals = async (data: RecordVitalsData) => {
    if (!id) return;
    await visitsApi.recordVitals(id, data);
    toast.success('Vitals recorded');
    fetchAll();
  };

  const handleAddNote = async (data: CreateClinicalNoteData) => {
    if (!id) return;
    await visitsApi.addNote(id, data);
    toast.success('Note added');
    fetchAll();
  };

  const handleAddTreatment = async (data: CreateTreatmentData) => {
    await treatmentsApi.create(data);
    toast.success('Treatment added');
    fetchAll();
  };

  const handleAddVaccination = async (data: CreateVaccinationData) => {
    await treatmentsApi.createVaccination(data);
    toast.success('Vaccination recorded');
    fetchAll();
  };

  const handleTreatmentStatus = async (treatmentId: string, status: 'completed' | 'cancelled') => {
    await treatmentsApi.update(treatmentId, { status });
    toast.success(status === 'completed' ? 'Treatment completed' : 'Treatment cancelled');
    setConfirmCancelTx(null);
    fetchAll();
  };

  const handleComplete = async () => {
    if (!id) return;
    await visitsApi.complete(id);
    toast.success('Visit completed');
    setConfirmComplete(false);
    fetchAll();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }
  if (error || !visit) {
    return (
      <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 p-3.5">
        <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
        <p className="text-sm text-destructive">{error || 'Visit not found'}</p>
      </div>
    );
  }

  const isCompleted = visit.status === 'completed';
  const noteTypeLabel = (t: string) => NOTE_TYPE_OPTIONS.find((o) => o.value === t)?.label || t;
  const categoryLabel = (c: string) => TREATMENT_CATEGORY_OPTIONS.find((o) => o.value === c)?.label || c;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
    >
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => router.push(`/patients/${visit.patientId}`)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-all hover:bg-accent hover:text-foreground hover:shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-grow">
          <div className="mb-0.5 flex items-center gap-2">
            <Stethoscope className="h-3.5 w-3.5 text-primary" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-primary">VISIT</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {visit.patient?.name || 'Unknown'}
          </h1>
        </div>
        <Chip label={visit.status.replace('_', ' ').toUpperCase()} color={STATUS_COLORS[visit.status]} />
        {!isCompleted && (
          <button
            onClick={() => setConfirmComplete(true)}
            className="no-print inline-flex h-9 items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110 active:scale-[0.98]"
          >
            Complete Visit
          </button>
        )}
        <button
          onClick={() => window.print()}
          className="no-print inline-flex h-9 items-center gap-2 rounded-xl border border-border/60 px-3.5 text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-foreground hover:shadow-sm"
          title="Print visit record"
        >
          <Printer className="h-4 w-4" />
          Print
        </button>
        <button
          onClick={() => { document.title = `Visit_${visit.patient?.name}_${new Date(visit.createdAt).toLocaleDateString()}`; window.print(); document.title = 'VetPMS — Veterinary Practice Management'; }}
          className="no-print inline-flex h-9 items-center gap-2 rounded-xl border border-border/60 px-3.5 text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-foreground hover:shadow-sm"
          title="Save as PDF"
        >
          <Download className="h-4 w-4" />
          PDF
        </button>
      </div>

      {/* Print header — only visible when printing */}
      <div className="print-header mb-6 hidden">
        <div className="mb-4 flex items-center justify-between border-b-2 border-black pb-3">
          <div>
            <h2 className="text-xl font-bold">Springfield Veterinary Clinic</h2>
            <p className="text-sm text-gray-600">1200 Medical Center Drive, Springfield, IL 62701</p>
            <p className="text-sm text-gray-600">(555) 200-3000 · info@springfieldvet.com</p>
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-bold">VISIT RECORD</h1>
            <p className="text-sm">{visit.patient?.name} — {new Date(visit.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Visit info */}
      <div className="mb-4 rounded-2xl border border-border/60 bg-card p-5 shadow-card">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">Patient</span>
            <p
              className="cursor-pointer text-sm text-primary hover:underline"
              onClick={() => router.push(`/patients/${visit.patientId}`)}
            >
              {visit.patient?.name} ({visit.patient?.species})
            </p>
          </div>
          <div>
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">Owner</span>
            <p
              className="cursor-pointer text-sm text-primary hover:underline"
              onClick={() => router.push(`/clients/${visit.clientId}`)}
            >
              {visit.client ? `${visit.client.lastName}, ${visit.client.firstName}` : '—'}
            </p>
          </div>
          <div>
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">Veterinarian</span>
            <p className="text-sm">
              {visit.vet ? `Dr. ${visit.vet.lastName}, ${visit.vet.firstName}` : '—'}
            </p>
          </div>
          <div>
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">Date</span>
            <p className="text-sm">{new Date(visit.createdAt).toLocaleString()}</p>
          </div>
          {visit.chiefComplaint && (
            <div className="col-span-2 sm:col-span-4">
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">Chief Complaint</span>
              <p className="text-sm">{visit.chiefComplaint}</p>
            </div>
          )}
        </div>
      </div>

      {/* Vitals */}
      <div className="mb-4 rounded-2xl border border-border/60 bg-card p-5 shadow-card">
        <h2 className="text-lg font-semibold">Vitals</h2>
        <div className="my-3 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        {visit.vitals && visit.vitals.length > 0 && (
          <TableContainer sx={{ mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Time</TableCell>
                  <TableCell>Temp</TableCell>
                  <TableCell>HR</TableCell>
                  <TableCell>RR</TableCell>
                  <TableCell>Weight</TableCell>
                  <TableCell>BCS</TableCell>
                  <TableCell>Pain</TableCell>
                  <TableCell>MM</TableCell>
                  <TableCell>CRT</TableCell>
                  <TableCell>By</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visit.vitals.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      {new Date(v.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </TableCell>
                    <TableCell>{v.temperature ? `${v.temperature}\u00B0${v.temperatureUnit || 'F'}` : '—'}</TableCell>
                    <TableCell>{v.heartRate ?? '—'}</TableCell>
                    <TableCell>{v.respiratoryRate ?? '—'}</TableCell>
                    <TableCell>{v.weight ? `${v.weight} ${v.weightUnit || 'kg'}` : '—'}</TableCell>
                    <TableCell>{v.bodyConditionScore ?? '—'}</TableCell>
                    <TableCell>{v.painScore ?? '—'}</TableCell>
                    <TableCell>{v.mucousMembraneColor || '—'}</TableCell>
                    <TableCell>{v.capillaryRefillTime ? `${v.capillaryRefillTime}s` : '—'}</TableCell>
                    <TableCell>{v.recordedBy ? `${v.recordedBy.firstName}` : '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {!isCompleted && <VitalsForm onSubmit={handleRecordVitals} disabled={isCompleted} />}
      </div>

      {/* Treatments */}
      <div className="mb-4 rounded-2xl border border-border/60 bg-card p-5 shadow-card">
        <h2 className="text-lg font-semibold">Treatments &amp; Procedures</h2>
        <div className="my-3 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        {treatments.length > 0 && (
          <TableContainer sx={{ mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Category</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Dosage</TableCell>
                  <TableCell>Route</TableCell>
                  <TableCell>Frequency</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Cost</TableCell>
                  <TableCell>Status</TableCell>
                  {!isCompleted && <TableCell>Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {treatments.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>{categoryLabel(tx.category)}</TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">{tx.name}</span>
                      {tx.description && <span className="block text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">{tx.description}</span>}
                    </TableCell>
                    <TableCell>{tx.dosage ? `${tx.dosage} ${tx.dosageUnit || ''}`.trim() : '—'}</TableCell>
                    <TableCell>{tx.route || '—'}</TableCell>
                    <TableCell>{tx.frequency || '—'}</TableCell>
                    <TableCell>{tx.durationDays ? `${tx.durationDays}d` : '—'}</TableCell>
                    <TableCell>{tx.cost ? `$${Number(tx.cost).toFixed(2)}` : '—'}</TableCell>
                    <TableCell>
                      <Chip
                        label={TREATMENT_STATUS_LABELS[tx.status]}
                        color={TREATMENT_STATUS_COLORS[tx.status]}
                        size="small"
                      />
                    </TableCell>
                    {!isCompleted && (
                      <TableCell>
                        {(tx.status === 'ordered' || tx.status === 'in_progress') && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleTreatmentStatus(tx.id, 'completed')}
                              className="inline-flex h-7 items-center rounded-lg px-2 text-xs font-medium text-primary transition-all hover:bg-accent"
                            >
                              Done
                            </button>
                            <button
                              onClick={() => setConfirmCancelTx(tx.id)}
                              className="inline-flex h-7 items-center rounded-lg px-2 text-xs font-medium text-destructive transition-all hover:bg-destructive/10"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {!isCompleted && (
          <TreatmentForm
            visitId={visit.id}
            patientId={visit.patientId}
            onSubmit={handleAddTreatment}
            disabled={isCompleted}
          />
        )}
        {isCompleted && treatments.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">
            No treatments recorded for this visit.
          </p>
        )}
      </div>

      {/* Vaccinations */}
      <div className="mb-4 rounded-2xl border border-border/60 bg-card p-5 shadow-card">
        <h2 className="text-lg font-semibold">Vaccinations</h2>
        <div className="my-3 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        {vaccinations.length > 0 && (
          <TableContainer sx={{ mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Vaccine</TableCell>
                  <TableCell>Manufacturer</TableCell>
                  <TableCell>Lot #</TableCell>
                  <TableCell>Route / Site</TableCell>
                  <TableCell>Date Given</TableCell>
                  <TableCell>Next Due</TableCell>
                  <TableCell>Cost</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vaccinations.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell><span className="text-sm font-medium">{v.vaccineName}</span></TableCell>
                    <TableCell>{v.manufacturer || '—'}</TableCell>
                    <TableCell>{v.lotNumber || '—'}</TableCell>
                    <TableCell>{[v.route, v.site].filter(Boolean).join(' / ') || '—'}</TableCell>
                    <TableCell>{v.dateAdministered ? new Date(v.dateAdministered).toLocaleDateString() : '—'}</TableCell>
                    <TableCell>{v.nextDueDate ? new Date(v.nextDueDate).toLocaleDateString() : '—'}</TableCell>
                    <TableCell>{v.cost ? `$${Number(v.cost).toFixed(2)}` : '—'}</TableCell>
                    <TableCell>
                      <Chip
                        label={VACCINATION_STATUS_LABELS[v.status]}
                        color={VACCINATION_STATUS_COLORS[v.status]}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {!isCompleted && (
          <VaccinationForm
            patientId={visit.patientId}
            visitId={visit.id}
            onSubmit={handleAddVaccination}
            disabled={isCompleted}
          />
        )}
        {isCompleted && vaccinations.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">
            No vaccinations recorded for this visit.
          </p>
        )}
      </div>

      {/* Clinical Notes */}
      <div className="mb-4 rounded-2xl border border-border/60 bg-card p-5 shadow-card">
        <h2 className="text-lg font-semibold">Clinical Notes</h2>
        <div className="my-3 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        {visit.clinicalNotes && visit.clinicalNotes.length > 0 && (
          <div className="mb-4 space-y-3">
            {visit.clinicalNotes.map((note) => (
              <div key={note.id} className="rounded-xl border border-border/60 bg-muted/30 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <Chip label={noteTypeLabel(note.noteType)} size="small" variant="outlined" />
                  <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
                    {note.author ? `Dr. ${note.author.lastName}` : ''} — {new Date(note.createdAt).toLocaleString()}
                  </span>
                </div>
                {note.noteType === 'soap' ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {note.content.subjective && (
                      <div>
                        <span className="text-xs font-semibold text-primary">S — Subjective</span>
                        <p className="whitespace-pre-wrap text-sm">{note.content.subjective}</p>
                      </div>
                    )}
                    {note.content.objective && (
                      <div>
                        <span className="text-xs font-semibold text-primary">O — Objective</span>
                        <p className="whitespace-pre-wrap text-sm">{note.content.objective}</p>
                      </div>
                    )}
                    {note.content.assessment && (
                      <div>
                        <span className="text-xs font-semibold text-primary">A — Assessment</span>
                        <p className="whitespace-pre-wrap text-sm">{note.content.assessment}</p>
                      </div>
                    )}
                    {note.content.plan && (
                      <div>
                        <span className="text-xs font-semibold text-primary">P — Plan</span>
                        <p className="whitespace-pre-wrap text-sm">{note.content.plan}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap text-sm">{note.content.text}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {!isCompleted && <SOAPNoteForm onSubmit={handleAddNote} disabled={isCompleted} />}
        {isCompleted && visit.clinicalNotes.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">
            No clinical notes recorded for this visit.
          </p>
        )}
      </div>

      {/* Complete visit confirmation */}
      <ConfirmDialog
        open={confirmComplete}
        onClose={() => setConfirmComplete(false)}
        onConfirm={handleComplete}
        title="Complete Visit"
        message="Are you sure you want to mark this visit as completed? You won't be able to add more notes or treatments after completing."
        confirmLabel="Complete Visit"
        variant="warning"
      />

      {/* Cancel treatment confirmation */}
      <ConfirmDialog
        open={confirmCancelTx !== null}
        onClose={() => setConfirmCancelTx(null)}
        onConfirm={() => confirmCancelTx && handleTreatmentStatus(confirmCancelTx, 'cancelled')}
        title="Cancel Treatment"
        message="Are you sure you want to cancel this treatment?"
        confirmLabel="Cancel Treatment"
        variant="danger"
      />
    </motion.div>
  );
}
