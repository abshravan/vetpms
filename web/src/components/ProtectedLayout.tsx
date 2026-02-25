'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, PawPrint } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import Sidebar, { SIDEBAR_WIDTH } from './Sidebar';
import Header from './Header';
import CommandPalette from './CommandPalette';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background">
        <div className="relative">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg glow-primary">
            <PawPrint className="h-7 w-7 text-primary-foreground" />
          </div>
          <Loader2 className="absolute -bottom-1 -right-1 h-5 w-5 animate-spin text-primary" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">Loading VetPMS</p>
          <p className="mt-1 text-xs text-muted-foreground">Preparing your workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-background bg-dots">
      <Sidebar />
      <Header />
      <CommandPalette />
      <main
        className="min-h-screen flex-1 pt-16"
        style={{ marginLeft: SIDEBAR_WIDTH }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="p-6 lg:p-8"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
