import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Stack,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { inventoryApi } from '../../api/inventory';
import {
  InventoryItem,
  InventoryTransaction,
  PaginatedResult,
  ITEM_CATEGORY_OPTIONS,
  TRANSACTION_TYPE_LABELS,
  TRANSACTION_TYPE_COLORS,
} from '../../types';

const fmt = (n: number) =>
  `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function InventoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [txns, setTxns] = useState<PaginatedResult<InventoryTransaction> | null>(null);
  const [txnPage, setTxnPage] = useState(0);
  const [error, setError] = useState('');

  // Dialogs
  const [restockOpen, setRestockOpen] = useState(false);
  const [restockQty, setRestockQty] = useState(0);
  const [restockCost, setRestockCost] = useState('');
  const [restockRef, setRestockRef] = useState('');

  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustQty, setAdjustQty] = useState(0);
  const [adjustNotes, setAdjustNotes] = useState('');

  const loadItem = useCallback(() => {
    if (!id) return;
    inventoryApi.get(id).then(({ data }) => setItem(data)).catch(() => setError('Item not found'));
  }, [id]);

  const loadTxns = useCallback(() => {
    if (!id) return;
    inventoryApi
      .getTransactions(id, { page: txnPage + 1, limit: 15 })
      .then(({ data }) => setTxns(data))
      .catch(() => {});
  }, [id, txnPage]);

  useEffect(() => { loadItem(); }, [loadItem]);
  useEffect(() => { loadTxns(); }, [loadTxns]);

  const handleRestock = () => {
    if (!id || restockQty <= 0) return;
    inventoryApi
      .restock(id, {
        quantity: restockQty,
        unitCost: restockCost ? parseFloat(restockCost) : undefined,
        reference: restockRef || undefined,
      })
      .then(() => { setRestockOpen(false); setRestockQty(0); setRestockCost(''); setRestockRef(''); loadItem(); loadTxns(); })
      .catch(() => setError('Failed to restock'));
  };

  const handleAdjust = () => {
    if (!id || adjustQty === 0) return;
    inventoryApi
      .recordTransaction({
        itemId: id,
        type: 'adjustment',
        quantity: adjustQty,
        notes: adjustNotes || undefined,
      })
      .then(() => { setAdjustOpen(false); setAdjustQty(0); setAdjustNotes(''); loadItem(); loadTxns(); })
      .catch(() => setError('Failed to adjust stock'));
  };

  if (!item) {
    return (
      <Box>
        {error && <Alert severity="error">{error}</Alert>}
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  const isLow = item.quantityOnHand <= item.reorderLevel;
  const isExpired = item.expirationDate && new Date(item.expirationDate) <= new Date();
  const catLabel = ITEM_CATEGORY_OPTIONS.find((o) => o.value === item.category)?.label || item.category;

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/pharmacy')} sx={{ mb: 2 }}>
        Back to Inventory
      </Button>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Header */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap">
          <Box>
            <Typography variant="h6">
              {item.name}
              {item.requiresPrescription && <Chip label="Rx" size="small" color="info" sx={{ ml: 1 }} />}
              {item.isControlledSubstance && <Chip label="CII" size="small" color="error" sx={{ ml: 0.5 }} />}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              SKU: {item.sku} &bull; {catLabel} &bull; Unit: {item.unit}
            </Typography>
            {item.manufacturer && (
              <Typography variant="body2" color="text.secondary">
                Manufacturer: {item.manufacturer}
                {item.supplier && ` — Supplier: ${item.supplier}`}
              </Typography>
            )}
          </Box>
          <Stack direction="row" spacing={1}>
            <Button variant="contained" color="success" onClick={() => setRestockOpen(true)}>
              Restock
            </Button>
            <Button variant="outlined" onClick={() => setAdjustOpen(true)}>
              Adjust
            </Button>
            <Button variant="outlined" onClick={() => navigate(`/pharmacy/${id}/edit`)}>
              Edit
            </Button>
          </Stack>
        </Box>
      </Paper>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6} sm={3}>
          <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">In Stock</Typography>
            <Typography variant="h5" color={isLow ? 'error' : 'success.main'} fontWeight={700}>
              {item.quantityOnHand}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">Reorder Level</Typography>
            <Typography variant="h5">{item.reorderLevel}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">Cost Price</Typography>
            <Typography variant="h5">{fmt(item.costPrice)}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">Selling Price</Typography>
            <Typography variant="h5">{fmt(item.sellingPrice)}</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Alerts */}
      {isLow && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Stock is at or below reorder level ({item.reorderLevel}). Recommended reorder quantity: {item.reorderQuantity}.
        </Alert>
      )}
      {isExpired && (
        <Alert severity="error" sx={{ mb: 2 }}>
          This item expired on {new Date(item.expirationDate!).toLocaleDateString()}.
        </Alert>
      )}

      {/* Details */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>Details</Typography>
        <Grid container spacing={1}>
          {item.lotNumber && (
            <Grid item xs={6} sm={4}><Typography variant="body2"><strong>Lot #:</strong> {item.lotNumber}</Typography></Grid>
          )}
          {item.expirationDate && (
            <Grid item xs={6} sm={4}><Typography variant="body2"><strong>Expires:</strong> {new Date(item.expirationDate).toLocaleDateString()}</Typography></Grid>
          )}
          {item.location && (
            <Grid item xs={6} sm={4}><Typography variant="body2"><strong>Location:</strong> {item.location}</Typography></Grid>
          )}
          {item.description && (
            <Grid item xs={12}><Typography variant="body2"><strong>Description:</strong> {item.description}</Typography></Grid>
          )}
          {item.notes && (
            <Grid item xs={12}><Typography variant="body2"><strong>Notes:</strong> {item.notes}</Typography></Grid>
          )}
        </Grid>
      </Paper>

      {/* Transaction History */}
      <Paper variant="outlined">
        <Box sx={{ p: 2, pb: 0 }}>
          <Typography variant="subtitle2">Transaction History</Typography>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Qty</TableCell>
                <TableCell align="right">Stock After</TableCell>
                <TableCell align="right">Unit Cost</TableCell>
                <TableCell>Reference</TableCell>
                <TableCell>Notes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {txns?.data.map((txn) => (
                <TableRow key={txn.id}>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    {new Date(txn.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={TRANSACTION_TYPE_LABELS[txn.type]}
                      size="small"
                      color={TRANSACTION_TYPE_COLORS[txn.type]}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      component="span"
                      color={txn.quantity > 0 ? 'success.main' : 'error.main'}
                      fontWeight={600}
                    >
                      {txn.quantity > 0 ? `+${txn.quantity}` : txn.quantity}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">{txn.quantityAfter}</TableCell>
                  <TableCell align="right">{txn.unitCost != null ? fmt(txn.unitCost) : '—'}</TableCell>
                  <TableCell>{txn.reference || '—'}</TableCell>
                  <TableCell>{txn.notes || '—'}</TableCell>
                </TableRow>
              ))}
              {txns?.data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <Typography color="text.secondary">No transactions yet.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {txns && txns.total > 15 && (
          <TablePagination
            component="div"
            count={txns.total}
            page={txnPage}
            onPageChange={(_, p) => setTxnPage(p)}
            rowsPerPage={15}
            rowsPerPageOptions={[15]}
          />
        )}
      </Paper>

      {/* Restock Dialog */}
      <Dialog open={restockOpen} onClose={() => setRestockOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Restock Item</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Quantity"
              type="number"
              fullWidth
              value={restockQty}
              onChange={(e) => setRestockQty(Number(e.target.value))}
            />
            <TextField
              label="Unit Cost"
              type="number"
              fullWidth
              value={restockCost}
              onChange={(e) => setRestockCost(e.target.value)}
            />
            <TextField
              label="Reference (PO#, etc.)"
              fullWidth
              value={restockRef}
              onChange={(e) => setRestockRef(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestockOpen(false)}>Cancel</Button>
          <Button variant="contained" color="success" onClick={handleRestock} disabled={restockQty <= 0}>
            Restock
          </Button>
        </DialogActions>
      </Dialog>

      {/* Adjust Dialog */}
      <Dialog open={adjustOpen} onClose={() => setAdjustOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Adjust Stock</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Enter a positive number to add stock, or negative to remove.
            </Typography>
            <TextField
              label="Adjustment Quantity"
              type="number"
              fullWidth
              value={adjustQty}
              onChange={(e) => setAdjustQty(Number(e.target.value))}
            />
            <TextField
              label="Notes / Reason"
              fullWidth
              multiline
              rows={2}
              value={adjustNotes}
              onChange={(e) => setAdjustNotes(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAdjustOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAdjust} disabled={adjustQty === 0}>
            Adjust
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
