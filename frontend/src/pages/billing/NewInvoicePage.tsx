import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  IconButton,
  Alert,
  Divider,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { ArrowBack as BackIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { billingApi } from '../../api/billing';
import { clientsApi } from '../../api/clients';
import { patientsApi } from '../../api/patients';
import { Client, Patient, CreateInvoiceItemData } from '../../types';

interface LineItem extends CreateInvoiceItemData {
  lineTotal: number;
}

export default function NewInvoicePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [clients, setClients] = useState<Client[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [clientId, setClientId] = useState(searchParams.get('clientId') || '');
  const [patientId, setPatientId] = useState(searchParams.get('patientId') || '');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [taxRate, setTaxRate] = useState('0');
  const [discountAmount, setDiscountAmount] = useState('0');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<LineItem[]>([{ description: '', unitPrice: 0, quantity: 1, lineTotal: 0 }]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    clientsApi.list({ limit: 200 }).then(({ data }) => setClients(data.data));
  }, []);

  useEffect(() => {
    if (clientId) {
      patientsApi.list({ clientId, limit: 100 }).then(({ data }) => setPatients(data.data));
    } else {
      setPatients([]);
    }
  }, [clientId]);

  const updateItem = (index: number, field: keyof LineItem, value: string | number) => {
    setItems((prev) => {
      const next = [...prev];
      const item = { ...next[index], [field]: value };
      item.lineTotal = Number(((item.quantity ?? 1) * (item.unitPrice ?? 0)).toFixed(2));
      next[index] = item;
      return next;
    });
  };

  const addItem = () => {
    setItems((prev) => [...prev, { description: '', unitPrice: 0, quantity: 1, lineTotal: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
  const tax = Number(taxRate) || 0;
  const taxAmt = Number((subtotal * tax / 100).toFixed(2));
  const disc = Number(discountAmount) || 0;
  const total = Number((subtotal + taxAmt - disc).toFixed(2));

  const fmt = (n: number) => `$${n.toFixed(2)}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) { setError('Client is required'); return; }
    if (items.length === 0 || !items[0].description) { setError('At least one line item is required'); return; }

    setSubmitting(true);
    setError('');
    try {
      const { data } = await billingApi.create({
        clientId,
        patientId: patientId || undefined,
        issueDate,
        dueDate: dueDate || undefined,
        taxRate: tax,
        discountAmount: disc,
        notes: notes || undefined,
        items: items.filter((i) => i.description).map(({ lineTotal, ...rest }) => rest),
      });
      navigate(`/billing/${data.id}`);
    } catch {
      setError('Failed to create invoice');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <IconButton onClick={() => navigate('/billing')}>
          <BackIcon />
        </IconButton>
        <Typography variant="h6">New Invoice</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <form onSubmit={handleSubmit}>
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Client"
                value={clientId}
                onChange={(e) => { setClientId(e.target.value); setPatientId(''); }}
                select
                fullWidth
                required
              >
                {clients.map((c) => (
                  <MenuItem key={c.id} value={c.id}>{c.lastName}, {c.firstName}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Patient"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                select
                fullWidth
                disabled={!clientId}
              >
                <MenuItem value="">— None —</MenuItem>
                {patients.map((p) => (
                  <MenuItem key={p.id} value={p.id}>{p.name} ({p.species})</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6} sm={2}>
              <TextField
                label="Issue Date"
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6} sm={2}>
              <TextField
                label="Due Date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Line Items */}
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2">Line Items</Typography>
            <Button size="small" startIcon={<AddIcon />} onClick={addItem}>Add Item</Button>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Description</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="right" width={80}>Qty</TableCell>
                  <TableCell align="right" width={120}>Unit Price</TableCell>
                  <TableCell align="right" width={100}>Total</TableCell>
                  <TableCell width={40} />
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <TextField
                        value={item.description}
                        onChange={(e) => updateItem(i, 'description', e.target.value)}
                        size="small"
                        fullWidth
                        placeholder="Service or product"
                        required
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        value={item.category || ''}
                        onChange={(e) => updateItem(i, 'category', e.target.value)}
                        size="small"
                        fullWidth
                        placeholder="exam, lab, rx..."
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        value={item.quantity}
                        onChange={(e) => updateItem(i, 'quantity', Number(e.target.value))}
                        type="number"
                        size="small"
                        inputProps={{ min: 1 }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        value={item.unitPrice}
                        onChange={(e) => updateItem(i, 'unitPrice', Number(e.target.value))}
                        type="number"
                        size="small"
                        inputProps={{ step: 0.01, min: 0 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">{fmt(item.lineTotal)}</Typography>
                    </TableCell>
                    <TableCell>
                      {items.length > 1 && (
                        <IconButton size="small" color="error" onClick={() => removeItem(i)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Totals */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Box sx={{ width: 300 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2">Subtotal</Typography>
                <Typography variant="body2">{fmt(subtotal)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, gap: 1 }}>
                <TextField
                  label="Tax %"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  type="number"
                  size="small"
                  sx={{ width: 100 }}
                  inputProps={{ step: 0.01, min: 0 }}
                />
                <Typography variant="body2">{fmt(taxAmt)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, gap: 1 }}>
                <TextField
                  label="Discount $"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                  type="number"
                  size="small"
                  sx={{ width: 100 }}
                  inputProps={{ step: 0.01, min: 0 }}
                />
                <Typography variant="body2" color="success.main">-{fmt(disc)}</Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body1" fontWeight={700}>Total</Typography>
                <Typography variant="body1" fontWeight={700}>{fmt(total)}</Typography>
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Notes */}
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <TextField
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            fullWidth
            multiline
            rows={2}
          />
        </Paper>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button onClick={() => navigate('/billing')}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Invoice'}
          </Button>
        </Box>
      </form>
    </Box>
  );
}
