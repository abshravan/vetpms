import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  Card,
  CardContent,
  CardActionArea,
  IconButton,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Pets as PetsIcon,
} from '@mui/icons-material';
import { clientsApi } from '../../api/clients';
import { patientsApi } from '../../api/patients';
import { Client, CreateClientData, CreatePatientData } from '../../types';
import ClientFormDialog from './ClientFormDialog';
import PatientFormDialog from '../patients/PatientFormDialog';

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
    fetchClient();
  };

  const handleAddPatient = async (data: CreatePatientData) => {
    await patientsApi.create(data);
    fetchClient();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !client) {
    return <Alert severity="error">{error || 'Client not found'}</Alert>;
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
      male: 'M (Intact)',
      female: 'F (Intact)',
      male_neutered: 'M (Neutered)',
      female_spayed: 'F (Spayed)',
      unknown: 'Unknown',
    };
    return map[sex] || sex;
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <IconButton onClick={() => navigate('/clients')}>
          <BackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {client.lastName}, {client.firstName}
        </Typography>
        <Chip
          label={client.isActive ? 'Active' : 'Inactive'}
          size="small"
          color={client.isActive ? 'success' : 'default'}
        />
        <Button startIcon={<EditIcon />} onClick={() => setEditDialogOpen(true)}>
          Edit
        </Button>
      </Box>

      {/* Client Info */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Typography variant="caption" color="text.secondary">Email</Typography>
            <Typography variant="body2">{client.email}</Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="caption" color="text.secondary">Phone</Typography>
            <Typography variant="body2">{client.phone}</Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="caption" color="text.secondary">Alt. Phone</Typography>
            <Typography variant="body2">{client.alternatePhone || '—'}</Typography>
          </Grid>
          <Grid item xs={12} sm={8}>
            <Typography variant="caption" color="text.secondary">Address</Typography>
            <Typography variant="body2">
              {[client.address, client.city, client.state, client.zipCode].filter(Boolean).join(', ') || '—'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="caption" color="text.secondary">Since</Typography>
            <Typography variant="body2">{new Date(client.createdAt).toLocaleDateString()}</Typography>
          </Grid>
          {client.notes && (
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary">Notes</Typography>
              <Typography variant="body2">{client.notes}</Typography>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Patients */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={600}>
          Patients ({client.patients?.length ?? 0})
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setPatientDialogOpen(true)}>
          Add Patient
        </Button>
      </Box>

      {client.patients && client.patients.length > 0 ? (
        <Grid container spacing={2}>
          {client.patients.map((patient) => (
            <Grid item xs={12} sm={6} md={4} key={patient.id}>
              <Card variant="outlined">
                <CardActionArea onClick={() => navigate(`/patients/${patient.id}`)}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <PetsIcon color="primary" fontSize="small" />
                      <Typography variant="subtitle2" fontWeight={600}>
                        {patient.name}
                      </Typography>
                      {patient.isDeceased && (
                        <Chip label="Deceased" size="small" color="default" />
                      )}
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Species</Typography>
                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>{patient.species}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Breed</Typography>
                        <Typography variant="body2">{patient.breed || '—'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Sex</Typography>
                        <Typography variant="body2">{sexLabel(patient.sex)}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Age</Typography>
                        <Typography variant="body2">{formatAge(patient.dateOfBirth)}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Weight</Typography>
                        <Typography variant="body2">
                          {patient.weight ? `${patient.weight} ${patient.weightUnit || 'kg'}` : '—'}
                        </Typography>
                      </Grid>
                      {patient.allergies && (
                        <Grid item xs={12}>
                          <Chip label={`Allergies: ${patient.allergies}`} size="small" color="warning" variant="outlined" />
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
          <PetsIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            No patients registered. Click "Add Patient" to register an animal.
          </Typography>
        </Paper>
      )}

      {/* Dialogs */}
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
    </Box>
  );
}
