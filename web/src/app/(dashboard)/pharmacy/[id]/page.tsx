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
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { ArrowLeft, Loader2, AlertTriangle, Package, AlertCircle } from 'lucide-react';
import { inventoryApi } from '../../../../api/inventory';
import {
  InventoryItem,
  InventoryTransaction,
  PaginatedResult,
  ITEM_CATEGORY_OPTIONS,
  TRANSACTION_TYPE_LABELS,
  TRANSACTION_TYPE_COLORS,
} from '../../../../types';

const fmt = (n: number) =>
  `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function InventoryDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
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
    if (error) {
      return (
        <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 p-3.5">
          <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }

  const isLow = item.quantityOnHand <= item.reorderLevel;
  const isExpired = item.expirationDate && new Date(item.expirationDate) <= new Date();
  const catLabel = ITEM_CATEGORY_OPTIONS.find((o) => o.value === item.category)?.label || item.category;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
    >
      {/* Back button */}
      <button
        onClick={() => router.push('/pharmacy')}
        className="mb-4 inline-flex h-9 items-center gap-2 rounded-xl border border-border/60 px-3.5 text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-foreground hover:shadow-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Inventory
      </button>

      {error && (
        <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 p-3.5">
          <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Header */}
      <div className="mb-4 rounded-2xl border border-border/60 bg-card p-5 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-0.5 flex items-center gap-2">
              <Package className="h-3.5 w-3.5 text-primary" />
              <span className="text-[11px] font-semibold uppercase tracking-widest text-primary">INVENTORY ITEM</span>
            </div>
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
              {item.name}
              {item.requiresPrescription && <Chip label="Rx" size="small" color="info" />}
              {item.isControlledSubstance && <Chip label="CII" size="small" color="error" />}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              SKU: {item.sku} &bull; {catLabel} &bull; Unit: {item.unit}
            </p>
            {item.manufacturer && (
              <p className="text-sm text-muted-foreground">
                Manufacturer: {item.manufacturer}
                {item.supplier && ` — Supplier: ${item.supplier}`}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setRestockOpen(true)}
              className="inline-flex h-9 items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110 active:scale-[0.98]"
            >
              Restock
            </button>
            <button
              onClick={() => setAdjustOpen(true)}
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-border/60 px-3.5 text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-foreground hover:shadow-sm"
            >
              Adjust
            </button>
            <button
              onClick={() => router.push(`/pharmacy/${id}/edit`)}
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-border/60 px-3.5 text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-foreground hover:shadow-sm"
            >
              Edit
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-border/60 bg-card p-5 text-center shadow-card">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">In Stock</span>
          <p className={`text-2xl font-bold ${isLow ? 'text-destructive' : 'text-emerald-600'}`}>
            {item.quantityOnHand}
          </p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5 text-center shadow-card">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">Reorder Level</span>
          <p className="text-2xl font-bold">{item.reorderLevel}</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5 text-center shadow-card">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">Cost Price</span>
          <p className="text-2xl font-bold">{fmt(item.costPrice)}</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5 text-center shadow-card">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">Selling Price</span>
          <p className="text-2xl font-bold">{fmt(item.sellingPrice)}</p>
        </div>
      </div>

      {/* Alerts */}
      {isLow && (
        <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-amber-300/40 bg-amber-50 p-3.5 dark:border-amber-500/20 dark:bg-amber-500/5">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-sm text-amber-800 dark:text-amber-400">
            Stock is at or below reorder level ({item.reorderLevel}). Recommended reorder quantity: {item.reorderQuantity}.
          </p>
        </div>
      )}
      {isExpired && (
        <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 p-3.5">
          <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
          <p className="text-sm text-destructive">
            This item expired on {new Date(item.expirationDate!).toLocaleDateString()}.
          </p>
        </div>
      )}

      {/* Details */}
      <div className="mb-4 rounded-2xl border border-border/60 bg-card p-5 shadow-card">
        <h2 className="text-lg font-semibold">Details</h2>
        <div className="my-3 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {item.lotNumber && (
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">Lot #</span>
              <p className="text-sm">{item.lotNumber}</p>
            </div>
          )}
          {item.expirationDate && (
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">Expires</span>
              <p className="text-sm">{new Date(item.expirationDate).toLocaleDateString()}</p>
            </div>
          )}
          {item.location && (
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">Location</span>
              <p className="text-sm">{item.location}</p>
            </div>
          )}
          {item.description && (
            <div className="col-span-2 sm:col-span-3">
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">Description</span>
              <p className="text-sm">{item.description}</p>
            </div>
          )}
          {item.notes && (
            <div className="col-span-2 sm:col-span-3">
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">Notes</span>
              <p className="text-sm">{item.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Transaction History */}
      <div className="rounded-2xl border border-border/60 bg-card shadow-card">
        <div className="p-5 pb-0">
          <h2 className="text-lg font-semibold">Transaction History</h2>
          <div className="mt-3 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>
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
                    <span className={`font-semibold ${txn.quantity > 0 ? 'text-emerald-600' : 'text-destructive'}`}>
                      {txn.quantity > 0 ? `+${txn.quantity}` : txn.quantity}
                    </span>
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
                    <span className="text-sm text-muted-foreground">No transactions yet.</span>
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
      </div>

      {/* Restock Dialog */}
      <Dialog open={restockOpen} onClose={() => setRestockOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Restock Item</DialogTitle>
        <DialogContent>
          <div className="mt-2 flex flex-col gap-4">
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
          </div>
        </DialogContent>
        <DialogActions>
          <button
            onClick={() => setRestockOpen(false)}
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-border/60 px-3.5 text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-foreground hover:shadow-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleRestock}
            disabled={restockQty <= 0}
            className="inline-flex h-9 items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
          >
            Restock
          </button>
        </DialogActions>
      </Dialog>

      {/* Adjust Dialog */}
      <Dialog open={adjustOpen} onClose={() => setAdjustOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Adjust Stock</DialogTitle>
        <DialogContent>
          <div className="mt-2 flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Enter a positive number to add stock, or negative to remove.
            </p>
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
          </div>
        </DialogContent>
        <DialogActions>
          <button
            onClick={() => setAdjustOpen(false)}
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-border/60 px-3.5 text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-foreground hover:shadow-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleAdjust}
            disabled={adjustQty === 0}
            className="inline-flex h-9 items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/90 px-4 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:shadow-lg hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
          >
            Adjust
          </button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
}
