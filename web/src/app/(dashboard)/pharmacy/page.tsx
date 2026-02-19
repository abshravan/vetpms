'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Chip,
  TablePagination,
  MenuItem,
} from '@mui/material';
import { Plus, Search, AlertTriangle, Pill, Loader2 } from 'lucide-react';
import { inventoryApi } from '../../../api/inventory';
import {
  InventoryItem,
  PaginatedResult,
  ITEM_CATEGORY_OPTIONS,
} from '../../../types';
import { cn } from '../../../lib/utils';

const fmt = (n: number) =>
  `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function InventoryListPage() {
  const router = useRouter();
  const [items, setItems] = useState<PaginatedResult<InventoryItem> | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [lowStock, setLowStock] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setError('');
    setLoading(true);
    inventoryApi
      .list({
        search: search || undefined,
        category: category || undefined,
        lowStock: lowStock || undefined,
        page: page + 1,
        limit: rowsPerPage,
      })
      .then(({ data }) => setItems(data))
      .catch(() => setError('Failed to load inventory'))
      .finally(() => setLoading(false));
  }, [search, category, lowStock, page, rowsPerPage]);

  useEffect(() => { load(); }, [load]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
    >
      {/* Page header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Pill className="h-5 w-5 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Inventory</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Pharmacy</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Manage medication inventory and stock levels</p>
        </div>
        <button
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/90 px-5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:shadow-lg hover:brightness-110 active:scale-[0.98]"
          onClick={() => router.push('/pharmacy/new')}
        >
          <Plus className="h-4 w-4" />
          Add Item
        </button>
      </div>

      {/* Controls */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[260px] flex-grow">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search name, SKU, manufacturer..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="flex h-11 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:shadow-sm"
          />
        </div>
        <TextField
          size="small"
          select
          label="Category"
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(0); }}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">All</MenuItem>
          {ITEM_CATEGORY_OPTIONS.map((o) => (
            <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
          ))}
        </TextField>
        <button
          className={cn(
            'inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold shadow-sm transition-all active:scale-[0.98]',
            lowStock
              ? 'bg-warning text-warning-foreground hover:bg-warning/90'
              : 'border border-warning/60 text-warning hover:bg-warning/10',
          )}
          onClick={() => { setLowStock(!lowStock); setPage(0); }}
        >
          <AlertTriangle className="h-4 w-4" />
          Low Stock
        </button>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 p-3.5">
          <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card">
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>SKU</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell align="right">In Stock</TableCell>
                <TableCell align="right">Reorder At</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell align="right">Cost</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && !items ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">Loading inventory...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : items?.data.length ? (
                items.data.map((item) => (
                  <TableRow
                    key={item.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => router.push(`/pharmacy/${item.id}`)}
                  >
                    <TableCell>
                      <span className="font-mono text-xs">{item.sku}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{item.name}</span>
                      {item.requiresPrescription && (
                        <Chip label="Rx" size="small" color="info" sx={{ ml: 1 }} />
                      )}
                      {item.isControlledSubstance && (
                        <Chip label="CII" size="small" color="error" sx={{ ml: 0.5 }} />
                      )}
                    </TableCell>
                    <TableCell>
                      {ITEM_CATEGORY_OPTIONS.find((o) => o.value === item.category)?.label || item.category}
                    </TableCell>
                    <TableCell align="right">
                      <span
                        className={cn(
                          'tabular-nums',
                          item.quantityOnHand <= item.reorderLevel && 'font-bold text-destructive',
                        )}
                      >
                        {item.quantityOnHand}
                      </span>
                    </TableCell>
                    <TableCell align="right">
                      <span className="tabular-nums">{item.reorderLevel}</span>
                    </TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell align="right">
                      <span className="tabular-nums">{fmt(item.costPrice)}</span>
                    </TableCell>
                    <TableCell align="right">
                      <span className="tabular-nums">{fmt(item.sellingPrice)}</span>
                    </TableCell>
                    <TableCell>
                      {item.quantityOnHand <= item.reorderLevel ? (
                        <Chip label="Low Stock" size="small" color="warning" />
                      ) : item.expirationDate && new Date(item.expirationDate) <= new Date() ? (
                        <Chip label="Expired" size="small" color="error" />
                      ) : (
                        <Chip label="OK" size="small" color="success" />
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 10 }}>
                    <div className="flex flex-col items-center gap-2">
                      <Pill className="h-10 w-10 text-muted-foreground/20" />
                      <p className="text-sm font-medium text-muted-foreground/60">No inventory items found</p>
                      <p className="text-xs text-muted-foreground/40">Add items to start tracking your inventory</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {items && (
            <TablePagination
              component="div"
              count={items.total}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            />
          )}
        </TableContainer>
      </div>
    </motion.div>
  );
}
