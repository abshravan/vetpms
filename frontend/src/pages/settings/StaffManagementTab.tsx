import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Alert,
  Typography,
  Stack,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { usersApi } from '../../api/settings';
import {
  UserProfile,
  USER_ROLE_OPTIONS,
  USER_ROLE_COLORS,
  UserRole,
} from '../../types';

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'receptionist' as UserRole,
  phone: '',
  specialty: '',
  licenseNumber: '',
};

export default function StaffManagementTab() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [error, setError] = useState('');

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [dialogError, setDialogError] = useState('');

  const load = useCallback(() => {
    usersApi.list().then(({ data }) => setUsers(data)).catch(() => setError('Failed to load staff'));
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditingUser(null);
    setForm(emptyForm);
    setDialogError('');
    setDialogOpen(true);
  };

  const openEdit = (user: UserProfile) => {
    setEditingUser(user);
    setForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: '',
      role: user.role,
      phone: user.phone || '',
      specialty: user.specialty || '',
      licenseNumber: user.licenseNumber || '',
    });
    setDialogError('');
    setDialogOpen(true);
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    setDialogError('');
    try {
      if (editingUser) {
        const payload: any = {
          firstName: form.firstName,
          lastName: form.lastName,
          role: form.role,
          phone: form.phone || undefined,
          specialty: form.specialty || undefined,
          licenseNumber: form.licenseNumber || undefined,
        };
        if (form.password) payload.password = form.password;
        await usersApi.update(editingUser.id, payload);
      } else {
        if (!form.password || form.password.length < 8) {
          setDialogError('Password must be at least 8 characters');
          setSaving(false);
          return;
        }
        await usersApi.create({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
          role: form.role,
          phone: form.phone || undefined,
        });
      }
      setDialogOpen(false);
      load();
    } catch (err: any) {
      setDialogError(err?.response?.data?.message || 'Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (user: UserProfile) => {
    try {
      if (user.isActive) {
        await usersApi.deactivate(user.id);
      } else {
        await usersApi.update(user.id, { isActive: true });
      }
      load();
    } catch {
      setError('Failed to update user status');
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="subtitle2">Staff Members</Typography>
        <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={openCreate}>
          Add Staff
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Specialty</TableCell>
              <TableCell>License #</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.firstName} {user.lastName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip
                    label={USER_ROLE_OPTIONS.find((o) => o.value === user.role)?.label || user.role}
                    size="small"
                    color={USER_ROLE_COLORS[user.role]}
                  />
                </TableCell>
                <TableCell>{user.phone || '—'}</TableCell>
                <TableCell>{user.specialty || '—'}</TableCell>
                <TableCell>{user.licenseNumber || '—'}</TableCell>
                <TableCell>
                  <Chip
                    label={user.isActive ? 'Active' : 'Inactive'}
                    size="small"
                    color={user.isActive ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Button size="small" onClick={() => openEdit(user)}>Edit</Button>
                    <Button
                      size="small"
                      color={user.isActive ? 'error' : 'success'}
                      onClick={() => handleToggleActive(user)}
                    >
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">No staff members found.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingUser ? 'Edit Staff Member' : 'Add Staff Member'}</DialogTitle>
        <DialogContent>
          {dialogError && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{dialogError}</Alert>}
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={6}>
              <TextField label="First Name" fullWidth required value={form.firstName} onChange={set('firstName')} />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Last Name" fullWidth required value={form.lastName} onChange={set('lastName')} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Email" fullWidth required disabled={!!editingUser} value={form.email} onChange={set('email')} />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label={editingUser ? 'New Password (leave blank to keep)' : 'Password'}
                type="password"
                fullWidth
                required={!editingUser}
                value={form.password}
                onChange={set('password')}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Role" select fullWidth value={form.role} onChange={set('role')}>
                {USER_ROLE_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField label="Phone" fullWidth value={form.phone} onChange={set('phone')} />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Specialty" fullWidth value={form.specialty} onChange={set('specialty')} placeholder="e.g. Surgery, Dentistry" />
            </Grid>
            <Grid item xs={6}>
              <TextField label="License Number" fullWidth value={form.licenseNumber} onChange={set('licenseNumber')} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : editingUser ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
