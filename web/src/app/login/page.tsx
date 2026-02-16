'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { PawPrint, Loader2, Info, AlertCircle, Heart, Stethoscope } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { cn } from '../../lib/utils';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('admin@vetpms.dev');
  const [password, setPassword] = useState('anything');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      router.push('/');
    } catch {
      setError('Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* Animated gradient background */}
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-br from-primary/5 via-background to-purple-500/5" />
      <div className="pointer-events-none fixed inset-0 bg-dots opacity-40" />

      {/* Floating decorative orbs */}
      <motion.div
        animate={{ y: [-20, 20, -20], x: [-10, 10, -10] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none fixed left-[15%] top-[20%] h-64 w-64 rounded-full bg-primary/[0.07] blur-3xl"
      />
      <motion.div
        animate={{ y: [20, -20, 20], x: [10, -10, 10] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none fixed bottom-[20%] right-[15%] h-72 w-72 rounded-full bg-purple-500/[0.06] blur-3xl"
      />

      {/* Floating icons */}
      <motion.div
        animate={{ y: [-8, 8, -8], rotate: [-5, 5, -5] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none fixed left-[10%] top-[30%] rounded-2xl bg-card p-3 shadow-card opacity-60"
      >
        <Heart className="h-5 w-5 text-rose-400" />
      </motion.div>
      <motion.div
        animate={{ y: [8, -8, 8], rotate: [5, -5, 5] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none fixed right-[12%] top-[25%] rounded-2xl bg-card p-3 shadow-card opacity-60"
      >
        <Stethoscope className="h-5 w-5 text-primary" />
      </motion.div>
      <motion.div
        animate={{ y: [-6, 6, -6], rotate: [-3, 3, -3] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none fixed bottom-[30%] left-[18%] rounded-2xl bg-card p-3 shadow-card opacity-60"
      >
        <PawPrint className="h-5 w-5 text-emerald-500" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-[420px]"
      >
        {/* Card */}
        <div className="rounded-2xl border border-border/60 bg-card p-8 shadow-card">
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center gap-4">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
              className="relative"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg glow-primary">
                <PawPrint className="h-7 w-7 text-primary-foreground" />
              </div>
              <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-success shadow-sm">
                <div className="h-2 w-2 rounded-full bg-white" />
              </div>
            </motion.div>
            <div className="text-center">
              <h1 className="text-2xl font-bold tracking-tight text-gradient">VetPMS</h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Veterinary Practice Management
              </p>
            </div>
          </div>

          {/* Dev mode banner */}
          <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-primary/15 bg-primary/[0.04] p-3.5">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="text-xs leading-relaxed text-muted-foreground">
              <span className="font-medium text-primary">Dev mode</span> — enter any email and password to sign in.
            </p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-4 flex items-center gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 p-3.5"
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className="flex h-11 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:shadow-sm"
                placeholder="you@clinic.com"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="flex h-11 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:shadow-sm"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={cn(
                'flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/90 text-sm font-semibold text-primary-foreground shadow-md transition-all',
                submitting
                  ? 'cursor-not-allowed opacity-70'
                  : 'hover:shadow-lg hover:brightness-110 active:scale-[0.98]',
              )}
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Bottom text */}
        <p className="mt-6 text-center text-xs text-muted-foreground/60">
          VetPMS — Built for veterinary professionals
        </p>
      </motion.div>
    </div>
  );
}
