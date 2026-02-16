'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, LogOut, Moon, Sun, Sparkles } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { SIDEBAR_WIDTH } from './Sidebar';
import { notificationsApi } from '../api/notifications';
import { useTheme } from '../theme/ThemeContext';
import { cn } from '../lib/utils';

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    notificationsApi.getUnreadCount().then(({ data }) => setUnreadCount(data)).catch(() => {});
    const interval = setInterval(() => {
      notificationsApi.getUnreadCount().then(({ data }) => setUnreadCount(data)).catch(() => {});
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header
      className="fixed top-0 z-20 flex h-16 items-center border-b border-border/50 glass"
      style={{ left: SIDEBAR_WIDTH, width: `calc(100% - ${SIDEBAR_WIDTH}px)` }}
    >
      <div className="flex w-full items-center justify-between px-6">
        {/* Left — greeting */}
        {user && (
          <div className="flex items-center gap-2 text-sm">
            <Sparkles className="h-4 w-4 text-primary/60" />
            <span className="text-muted-foreground">
              Welcome back, <span className="font-medium text-foreground">{user.firstName}</span>
            </span>
          </div>
        )}

        {/* Right — actions */}
        {user && (
          <div className="flex items-center gap-1.5">
            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-foreground hover:shadow-sm"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Notifications */}
            <button
              onClick={() => router.push('/notifications')}
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-foreground hover:shadow-sm"
              title="Notifications"
              aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gradient-to-r from-destructive to-rose-500 px-1 text-[10px] font-bold text-white shadow-sm">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {/* Separator */}
            <div className="mx-2 h-6 w-px bg-gradient-to-b from-transparent via-border to-transparent" />

            {/* User info */}
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-xs font-bold text-primary-foreground shadow-sm">
                {user.firstName[0]}{user.lastName[0]}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold leading-none">{user.firstName} {user.lastName}</p>
                <p className="mt-1 text-[11px] text-muted-foreground capitalize">{user.role}</p>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className={cn(
                'ml-1 inline-flex h-9 w-9 items-center justify-center rounded-xl',
                'text-muted-foreground transition-all duration-200 hover:bg-destructive/10 hover:text-destructive hover:shadow-sm',
              )}
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
