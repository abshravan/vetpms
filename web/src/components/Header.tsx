'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, LogOut, Moon, Sun } from 'lucide-react';
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
      className="fixed top-0 z-20 flex h-14 items-center border-b border-border bg-card/80 backdrop-blur-sm"
      style={{ left: SIDEBAR_WIDTH, width: `calc(100% - ${SIDEBAR_WIDTH}px)` }}
    >
      <div className="flex w-full items-center justify-between px-6">
        {/* Left — page context / breadcrumb area */}
        <div />

        {/* Right — actions */}
        {user && (
          <div className="flex items-center gap-1">
            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Notifications */}
            <button
              onClick={() => router.push('/notifications')}
              className="relative inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {/* Separator */}
            <div className="mx-2 h-5 w-px bg-border" />

            {/* User info */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {user.firstName[0]}{user.lastName[0]}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium leading-none">{user.firstName} {user.lastName}</p>
                <p className="mt-0.5 text-xs text-muted-foreground capitalize">{user.role}</p>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className={cn(
                'ml-1 inline-flex h-8 w-8 items-center justify-center rounded-md',
                'text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive',
              )}
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
