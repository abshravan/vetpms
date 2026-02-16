'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Box,
  Paper,
  Grid,
  Button,
  Chip,
  Card,
  CardContent,
  CardActionArea,
  Divider,
  Typography,
} from '@mui/material';
import { ArrowLeft, Loader2, Pencil, Plus, PawPrint } from 'lucide-react';
import { clientsApi } from '../../../../api/clients';
import { patientsApi } from '../../../../api/patients';
import { Client, CreateClientData, CreatePatientData } from '../../../../types';
import ClientFormDialog from '../../../../components/clients/ClientFormDialog';
import PatientFormDialog from '../../../../components/patients/PatientFormDialog';

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
    fetchClient();
  };

  const handleAddPatient = async (data: CreatePatientData) => {
    await patientsApi.create(data);
    fetchClient();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-destructive/20 bg-destructive/5 p-6">
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
      male: 'M (Intact)',
      female: 'F (Intact)',
      male_neutered: 'M (Neutered)',
      female_spayed: 'F (Spayed)',
      unknown: 'Unknown',
    };
    return map[sex] || sex;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-1 mb-2">
        <button onClick={() => router.push('/clients')} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-2xl font-bold tracking-tight flex-grow">
          {client.lastName}, {client.firstName}
        </h1>
        <Chip
          label={client.isActive ? 'Active' : 'Inactive'}
          size="small"
          color={client.isActive ? 'success' : 'default'}
        />
        <Button startIcon={<Pencil className="h-4 w-4" />} onClick={() => setEditDialogOpen(true)}>
          Edit
        </Button>
      </div>

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
        <Button variant="contained" startIcon={<Plus className="h-4 w-4" />} onClick={() => setPatientDialogOpen(true)}>
          Add Patient
        </Button>
      </Box>

      {client.patients && client.patients.length > 0 ? (
        <Grid container spacing={2}>
          {client.patients.map((patient) => (
            <Grid item xs={12} sm={6} md={4} key={patient.id}>
              <Card variant="outlined">
                <CardActionArea onClick={() => router.push(`/patients/${patient.id}`)}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <PawPrint className="h-4 w-4 text-primary" />
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
          <PawPrint className="h-12 w-12 text-muted-foreground/40 mb-2" />
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
    </div>
  );
}
