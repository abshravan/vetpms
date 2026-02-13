import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';
import { visitsApi } from '../../api/visits';
import {
  Visit,
  RecordVitalsData,
  CreateClinicalNoteData,
  NOTE_TYPE_OPTIONS,
} from '../../types';
import VitalsForm from './VitalsForm';
import SOAPNoteForm from './SOAPNoteForm';

const STATUS_COLORS: Record<string, 'default' | 'warning' | 'success'> = {
  open: 'default',
  in_progress: 'warning',
  completed: 'success',
};

export default function VisitDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [visit, setVisit] = useState<Visit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data } = await visitsApi.get(id);
      setVisit(data);
    } catch {
      setError('Failed to load visit');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const handleRecordVitals = async (data: RecordVitalsData) => {
    if (!id) return;
    await visitsApi.recordVitals(id, data);
    fetch();
  };

  const handleAddNote = async (data: CreateClinicalNoteData) => {
    if (!id) return;
    await visitsApi.addNote(id, data);
    fetch();
  };

  const handleComplete = async () => {
    if (!id) return;
    await visitsApi.complete(id);
    fetch();
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>;
  }
  if (error || !visit) {
    return <Alert severity="error">{error || 'Visit not found'}</Alert>;
  }

  const isCompleted = visit.status === 'completed';
  const noteTypeLabel = (t: string) => NOTE_TYPE_OPTIONS.find((o) => o.value === t)?.label || t;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <IconButton onClick={() => navigate(`/patients/${visit.patientId}`)}>
          <BackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Visit — {visit.patient?.name || 'Unknown'}
        </Typography>
        <Chip label={visit.status.replace('_', ' ').toUpperCase()} color={STATUS_COLORS[visit.status]} />
        {!isCompleted && (
          <Button variant="contained" color="success" onClick={handleComplete}>
            Complete Visit
          </Button>
        )}
      </Box>

      {/* Visit info */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary">Patient</Typography>
            <Typography
              variant="body2"
              sx={{ cursor: 'pointer', color: 'primary.main' }}
              onClick={() => navigate(`/patients/${visit.patientId}`)}
            >
              {visit.patient?.name} ({visit.patient?.species})
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary">Owner</Typography>
            <Typography
              variant="body2"
              sx={{ cursor: 'pointer', color: 'primary.main' }}
              onClick={() => navigate(`/clients/${visit.clientId}`)}
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
        <Typography variant="subtitle2" gutterBottom>Vitals</Typography>
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
                    <TableCell>{v.temperature ? `${v.temperature}°${v.temperatureUnit || 'F'}` : '—'}</TableCell>
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

      {/* Clinical Notes */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>Clinical Notes</Typography>
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
    </Box>
  );
}
