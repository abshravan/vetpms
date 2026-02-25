'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: 'danger' | 'warning';
  loading?: boolean;
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  variant = 'danger',
  loading = false,
}: ConfirmDialogProps) {
  if (!open) return null;

  const isDanger = variant === 'danger';

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-md rounded-2xl border border-border/60 bg-card p-6 shadow-xl"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 inline-flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Icon */}
            <div
              className={cn(
                'mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl',
                isDanger
                  ? 'bg-destructive/10'
                  : 'bg-amber-100 dark:bg-amber-950/30',
              )}
            >
              {isDanger ? (
                <Trash2 className="h-6 w-6 text-destructive" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-amber-500" />
              )}
            </div>

            {/* Content */}
            <h3 className="mb-2 text-lg font-semibold">{title}</h3>
            <p className="mb-6 text-sm text-muted-foreground">{message}</p>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                disabled={loading}
                className="inline-flex h-9 items-center rounded-xl border border-border/60 px-4 text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-foreground hover:shadow-sm disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className={cn(
                  'inline-flex h-9 items-center rounded-xl px-4 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110 active:scale-[0.98] disabled:opacity-50',
                  isDanger
                    ? 'bg-gradient-to-r from-destructive to-rose-500'
                    : 'bg-gradient-to-r from-amber-500 to-orange-500',
                )}
              >
                {loading ? 'Processing...' : confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
