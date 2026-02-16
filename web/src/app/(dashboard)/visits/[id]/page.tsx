'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { ArrowLeft, Loader2 } from 'lucide-react';
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

  const handleRecordVitals = async (data: RecordVitalsData) => {
    if (!id) return;
    await visitsApi.recordVitals(id, data);
    fetchAll();
  };

  const handleAddNote = async (data: CreateClinicalNoteData) => {
    if (!id) return;
    await visitsApi.addNote(id, data);
    fetchAll();
  };

  const handleAddTreatment = async (data: CreateTreatmentData) => {
    await treatmentsApi.create(data);
    fetchAll();
  };

  const handleAddVaccination = async (data: CreateVaccinationData) => {
    await treatmentsApi.createVaccination(data);
    fetchAll();
  };

  const handleTreatmentStatus = async (treatmentId: string, status: 'completed' | 'cancelled') => {
    await treatmentsApi.update(treatmentId, { status });
    fetchAll();
  };

  const handleComplete = async () => {
    if (!id) return;
    await visitsApi.complete(id);
    fetchAll();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (error || !visit) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-destructive/20 bg-destructive/5 p-6">
        <p className="text-sm text-destructive">{error || 'Visit not found'}</p>
      </div>
    );
  }

  const isCompleted = visit.status === 'completed';
  const noteTypeLabel = (t: string) => NOTE_TYPE_OPTIONS.find((o) => o.value === t)?.label || t;
  const categoryLabel = (c: string) => TREATMENT_CATEGORY_OPTIONS.find((o) => o.value === c)?.label || c;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-1 mb-2">
        <button onClick={() => router.push(`/patients/${visit.patientId}`)} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-2xl font-bold tracking-tight flex-grow">
          Visit — {visit.patient?.name || 'Unknown'}
        </h1>
        <Chip label={visit.status.replace('_', ' ').toUpperCase()} color={STATUS_COLORS[visit.status]} />
        {!isCompleted && (
          <Button variant="contained" color="success" onClick={handleComplete}>
            Complete Visit
          </Button>
        )}
      </div>

      {/* Visit info */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary">Patient</Typography>
            <Typography
              variant="body2"
              sx={{ cursor: 'pointer', color: 'primary.main' }}
              onClick={() => router.push(`/patients/${visit.patientId}`)}
            >
              {visit.patient?.name} ({visit.patient?.species})
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary">Owner</Typography>
            <Typography
              variant="body2"
              sx={{ cursor: 'pointer', color: 'primary.main' }}
              onClick={() => router.push(`/clients/${visit.clientId}`)}
            >
              {visit.client ? `${visit.client.lastName}, ${visit.client.firstName}` : '—'}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary">Veterinarian</Typography>
            <Typography variant="body2">
              {visit.vet ? `Dr. ${visit.vet.lastName}, ${visit.vet.firstName}` : '—'}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary">Date</Typography>
            <Typography variant="body2">{new Date(visit.createdAt).toLocaleString()}</Typography>
          </Grid>
          {visit.chiefComplaint && (
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary">Chief Complaint</Typography>
              <Typography variant="body2">{visit.chiefComplaint}</Typography>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Vitals */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <h2 className="text-sm font-semibold mb-1">Vitals</h2>
        <Divider sx={{ mb: 2 }} />

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
      </Paper>

      {/* Treatments */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <h2 className="text-sm font-semibold mb-1">Treatments & Procedures</h2>
        <Divider sx={{ mb: 2 }} />

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
                      <Typography variant="body2" fontWeight={500}>{tx.name}</Typography>
                      {tx.description && <Typography variant="caption" color="text.secondary">{tx.description}</Typography>}
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
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Button size="small" onClick={() => handleTreatmentStatus(tx.id, 'completed')}>Done</Button>
                            <Button size="small" color="error" onClick={() => handleTreatmentStatus(tx.id, 'cancelled')}>Cancel</Button>
                          </Box>
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
          <Typography variant="body2" color="text.secondary" textAlign="center">
            No treatments recorded for this visit.
          </Typography>
        )}
      </Paper>

      {/* Vaccinations */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <h2 className="text-sm font-semibold mb-1">Vaccinations</h2>
        <Divider sx={{ mb: 2 }} />

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
                    <TableCell><Typography variant="body2" fontWeight={500}>{v.vaccineName}</Typography></TableCell>
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
          <Typography variant="body2" color="text.secondary" textAlign="center">
            No vaccinations recorded for this visit.
          </Typography>
        )}
      </Paper>

      {/* Clinical Notes */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <h2 className="text-sm font-semibold mb-1">Clinical Notes</h2>
        <Divider sx={{ mb: 2 }} />

        {visit.clinicalNotes && visit.clinicalNotes.length > 0 && (
          <Box sx={{ mb: 3 }}>
            {visit.clinicalNotes.map((note) => (
              <Paper key={note.id} variant="outlined" sx={{ p: 2, mb: 1.5, bgcolor: 'grey.50' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Chip label={noteTypeLabel(note.noteType)} size="small" variant="outlined" />
                  <Typography variant="caption" color="text.secondary">
                    {note.author ? `Dr. ${note.author.lastName}` : ''} — {new Date(note.createdAt).toLocaleString()}
                  </Typography>
                </Box>
                {note.noteType === 'soap' ? (
                  <Grid container spacing={1.5}>
                    {note.content.subjective && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" fontWeight={600} color="primary">S — Subjective</Typography>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{note.content.subjective}</Typography>
                      </Grid>
                    )}
                    {note.content.objective && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" fontWeight={600} color="primary">O — Objective</Typography>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{note.content.objective}</Typography>
                      </Grid>
                    )}
                    {note.content.assessment && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" fontWeight={600} color="primary">A — Assessment</Typography>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{note.content.assessment}</Typography>
                      </Grid>
                    )}
                    {note.content.plan && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" fontWeight={600} color="primary">P — Plan</Typography>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{note.content.plan}</Typography>
                      </Grid>
                    )}
                  </Grid>
                ) : (
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{note.content.text}</Typography>
                )}
              </Paper>
            ))}
          </Box>
        )}

        {!isCompleted && <SOAPNoteForm onSubmit={handleAddNote} disabled={isCompleted} />}
        {isCompleted && visit.clinicalNotes.length === 0 && (
          <Typography variant="body2" color="text.secondary" textAlign="center">
            No clinical notes recorded for this visit.
          </Typography>
        )}
      </Paper>
    </div>
  );
}
