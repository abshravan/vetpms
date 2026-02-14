'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Chip,
  TablePagination,
  MenuItem,
  Stack,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import WarningIcon from '@mui/icons-material/Warning';
import { inventoryApi } from '../../../api/inventory';
import {
  InventoryItem,
  PaginatedResult,
  ITEM_CATEGORY_OPTIONS,
} from '../../../types';

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

  const load = useCallback(() => {
    setError('');
    inventoryApi
      .list({
        search: search || undefined,
        category: category || undefined,
        lowStock: lowStock || undefined,
        page: page + 1,
        limit: rowsPerPage,
      })
      .then(({ data }) => setItems(data))
      .catch(() => setError('Failed to load inventory'));
  }, [search, category, lowStock, page, rowsPerPage]);

  useEffect(() => { load(); }, [load]);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Pharmacy & Inventory</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => router.push('/pharmacy/new')}
        >
          Add Item
        </Button>
      </Box>

      <Stack direction="row" spacing={2} mb={2} flexWrap="wrap" alignItems="center">
        <TextField
          size="small"
          placeholder="Search name, SKU, manufacturer…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          sx={{ minWidth: 260 }}
        />
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
        <Button
          variant={lowStock ? 'contained' : 'outlined'}
          color="warning"
          size="small"
          startIcon={<WarningIcon />}
          onClick={() => { setLowStock(!lowStock); setPage(0); }}
        >
          Low Stock
        </Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper} variant="outlined">
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
            {items?.data.map((item) => (
              <TableRow
                key={item.id}
                hover
                sx={{ cursor: 'pointer' }}
                onClick={() => router.push(`/pharmacy/${item.id}`)}
              >
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>{item.sku}</TableCell>
                <TableCell>
                  {item.name}
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
                  <Typography
                    component="span"
                    color={item.quantityOnHand <= item.reorderLevel ? 'error' : 'inherit'}
                    fontWeight={item.quantityOnHand <= item.reorderLevel ? 700 : 400}
                  >
                    {item.quantityOnHand}
                  </Typography>
                </TableCell>
                <TableCell align="right">{item.reorderLevel}</TableCell>
                <TableCell>{item.unit}</TableCell>
                <TableCell align="right">{fmt(item.costPrice)}</TableCell>
                <TableCell align="right">{fmt(item.sellingPrice)}</TableCell>
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
            ))}
            {items?.data.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No inventory items found.</Typography>
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
    </Box>
  );
}
