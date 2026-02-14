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
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Pets as PetsIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { patientsApi } from '../../api/patients';
import { visitsApi } from '../../api/visits';
import { treatmentsApi } from '../../api/treatments';
import { billingApi } from '../../api/billing';
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
} from '../../types';
import PatientFormDialog from './PatientFormDialog';

export default function PatientProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [preventiveCare, setPreventiveCare] = useState<PreventiveCare[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);

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
    fetchPatient();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !patient) {
    return <Alert severity="error">{error || 'Patient not found'}</Alert>;
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
    male: 'Male (Intact)',
    female: 'Female (Intact)',
    male_neutered: 'Male (Neutered)',
    female_spayed: 'Female (Spayed)',
    unknown: 'Unknown',
  };

  const careTypeLabel = (t: string) => PREVENTIVE_CARE_TYPE_OPTIONS.find((o) => o.value === t)?.label || t;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <IconButton onClick={() => navigate(patient.client ? `/clients/${patient.clientId}` : '/patients')}>
          <BackIcon />
        </IconButton>
        <PetsIcon color="primary" />
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {patient.name}
        </Typography>
        {patient.isDeceased && <Chip label="Deceased" size="small" />}
        {!patient.isActive && <Chip label="Inactive" size="small" color="default" />}
        <Button startIcon={<EditIcon />} onClick={() => setEditDialogOpen(true)}>
          Edit
        </Button>
      </Box>

      {/* Allergy alert */}
      {patient.allergies && (
        <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 2 }}>
          <strong>Allergies:</strong> {patient.allergies}
        </Alert>
      )}

      {/* Basic Info */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Patient Information
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary">Species</Typography>
            <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>{patient.species}</Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary">Breed</Typography>
            <Typography variant="body2">{patient.breed || '—'}</Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary">Color</Typography>
            <Typography variant="body2">{patient.color || '—'}</Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary">Sex</Typography>
            <Typography variant="body2">{sexLabel[patient.sex] || patient.sex}</Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary">Date of Birth</Typography>
            <Typography variant="body2">
              {patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : '—'}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary">Age</Typography>
            <Typography variant="body2">{formatAge(patient.dateOfBirth)}</Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary">Weight</Typography>
            <Typography variant="body2" fontWeight={600}>
              {patient.weight ? `${patient.weight} ${patient.weightUnit || 'kg'}` : '—'}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary">Microchip</Typography>
            <Typography variant="body2">{patient.microchipNumber || '—'}</Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Insurance */}
      {(patient.insuranceProvider || patient.insurancePolicyNumber) && (
        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Insurance
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Provider</Typography>
              <Typography variant="body2">{patient.insuranceProvider || '—'}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Policy Number</Typography>
              <Typography variant="body2">{patient.insurancePolicyNumber || '—'}</Typography>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Owner Info */}
      {patient.client && (
        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Owner
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={6} sm={4}>
              <Typography variant="caption" color="text.secondary">Name</Typography>
              <Typography
                variant="body2"
                sx={{ cursor: 'pointer', color: 'primary.main', '&:hover': { textDecoration: 'underline' } }}
                onClick={() => navigate(`/clients/${patient.clientId}`)}
              >
                {patient.client.lastName}, {patient.client.firstName}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={4}>
              <Typography variant="caption" color="text.secondary">Phone</Typography>
              <Typography variant="body2">{patient.client.phone}</Typography>
            </Grid>
            <Grid item xs={6} sm={4}>
              <Typography variant="caption" color="text.secondary">Email</Typography>
              <Typography variant="body2">{patient.client.email}</Typography>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Notes */}
      {patient.notes && (
        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Notes
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="body2">{patient.notes}</Typography>
        </Paper>
      )}

      {/* Vaccination History */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Vaccination History ({vaccinations.length})
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {vaccinations.length > 0 ? (
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
                    <TableCell><Typography variant="body2" fontWeight={500}>{v.vaccineName}</Typography></TableCell>
                    <TableCell>{v.dateAdministered ? new Date(v.dateAdministered).toLocaleDateString() : '—'}</TableCell>
                    <TableCell>
                      {v.nextDueDate ? (
                        <Typography
                          variant="body2"
                          color={new Date(v.nextDueDate) < new Date() ? 'error.main' : 'text.primary'}
                          fontWeight={new Date(v.nextDueDate) < new Date() ? 600 : 400}
                        >
                          {new Date(v.nextDueDate).toLocaleDateString()}
                        </Typography>
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
        ) : (
          <Typography variant="body2" color="text.secondary" textAlign="center">
            No vaccinations recorded.
          </Typography>
        )}
      </Paper>

      {/* Preventive Care Plans */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Preventive Care ({preventiveCare.length})
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {preventiveCare.length > 0 ? (
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
                    <TableCell><Typography variant="body2" fontWeight={500}>{pc.name}</Typography></TableCell>
                    <TableCell>{pc.productName || '—'}</TableCell>
                    <TableCell>{pc.lastAdministered ? new Date(pc.lastAdministered).toLocaleDateString() : '—'}</TableCell>
                    <TableCell>
                      {pc.nextDueDate ? (
                        <Typography
                          variant="body2"
                          color={new Date(pc.nextDueDate) < new Date() ? 'error.main' : 'text.primary'}
                          fontWeight={new Date(pc.nextDueDate) < new Date() ? 600 : 400}
                        >
                          {new Date(pc.nextDueDate).toLocaleDateString()}
                        </Typography>
                      ) : '—'}
                    </TableCell>
                    <TableCell>{pc.frequencyDays ? `Every ${pc.frequencyDays} days` : '—'}</TableCell>
                    <TableCell>
                      <Chip
                        label={pc.status.replace('_', ' ').toUpperCase()}
                        color={PREVENTIVE_CARE_STATUS_COLORS[pc.status]}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="body2" color="text.secondary" textAlign="center">
            No preventive care plans set up.
          </Typography>
        )}
      </Paper>

      {/* Billing History */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Invoices ({invoices.length})
          </Typography>
          <Button
            size="small"
            variant="outlined"
            onClick={() => navigate(`/billing/new?clientId=${patient.clientId}&patientId=${patient.id}`)}
          >
            New Invoice
          </Button>
        </Box>
        <Divider sx={{ mb: 2 }} />
        {invoices.length > 0 ? (
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
                  <TableRow
                    key={inv.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/billing/${inv.id}`)}
                  >
                    <TableCell><Typography variant="body2" fontWeight={500}>{inv.invoiceNumber}</Typography></TableCell>
                    <TableCell>{new Date(inv.issueDate).toLocaleDateString()}</TableCell>
                    <TableCell align="right">${Number(inv.totalAmount).toFixed(2)}</TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        color={Number(inv.balanceDue) > 0 ? 'error.main' : 'text.primary'}
                        fontWeight={Number(inv.balanceDue) > 0 ? 600 : 400}
                      >
                        ${Number(inv.balanceDue).toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={INVOICE_STATUS_LABELS[inv.status]} color={INVOICE_STATUS_COLORS[inv.status]} size="small" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="body2" color="text.secondary" textAlign="center">
            No invoices for this patient.
          </Typography>
        )}
      </Paper>

      {/* Visit History */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle1" fontWeight={600}>
          Visit History ({visits.length})
        </Typography>
        <Button
          variant="contained"
          size="small"
          onClick={() => {
            if (!patient) return;
            navigate(`/visits/new?patientId=${patient.id}&clientId=${patient.clientId}`);
          }}
        >
          Start Visit
        </Button>
      </Box>
      {visits.length > 0 ? (
        visits.map((visit) => (
          <Paper
            key={visit.id}
            variant="outlined"
            sx={{ p: 2, mb: 1, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
            onClick={() => navigate(`/visits/${visit.id}`)}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="body2" fontWeight={500}>
                  {new Date(visit.createdAt).toLocaleDateString()} — {visit.chiefComplaint || 'Visit'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Dr. {visit.vet?.lastName || '—'} | {visit.vitals?.length || 0} vitals | {visit.clinicalNotes?.length || 0} notes
                </Typography>
              </Box>
              <Chip
                label={visit.status.replace('_', ' ').toUpperCase()}
                size="small"
                color={visit.status === 'completed' ? 'success' : visit.status === 'in_progress' ? 'warning' : 'default'}
              />
            </Box>
          </Paper>
        ))
      ) : (
        <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No visits recorded yet. Click "Start Visit" to begin.
          </Typography>
        </Paper>
      )}

      <PatientFormDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onSubmit={handleUpdate}
        clientId={patient.clientId}
        patient={patient}
      />
    </Box>
  );
}
