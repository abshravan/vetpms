'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, LogOut, Moon, Sun, Sparkles, Search, Command, Menu } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { SIDEBAR_WIDTH } from './Sidebar';
import { useSidebar } from './SidebarContext';
import { notificationsApi } from '../api/notifications';
import { useTheme } from '../theme/ThemeContext';
import { cn } from '../lib/utils';

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { isMobile, toggle } = useSidebar();
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
      className={cn(
        'fixed top-0 z-20 flex h-16 items-center border-b border-border/50 glass transition-all duration-300',
      )}
      style={{
        left: isMobile ? 0 : SIDEBAR_WIDTH,
        width: isMobile ? '100%' : `calc(100% - ${SIDEBAR_WIDTH}px)`,
      }}
    >
      <div className="flex w-full items-center justify-between px-4 sm:px-6">
        {/* Left — hamburger + greeting */}
        <div className="flex items-center gap-3">
          {isMobile && (
            <button
              onClick={toggle}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
          {user && (
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="hidden h-4 w-4 text-primary/60 sm:block" />
              <span className="hidden text-muted-foreground sm:inline">
                Welcome back, <span className="font-medium text-foreground">{user.firstName}</span>
              </span>
            </div>
          )}
        </div>

        {/* Right — actions */}
        {user && (
          <div className="flex items-center gap-1.5">
            {/* Search trigger */}
            <button
              onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
              className="mr-1 inline-flex h-9 items-center gap-2 rounded-xl border border-border/60 bg-muted/30 px-3 text-xs text-muted-foreground transition-all hover:bg-accent hover:text-foreground hover:shadow-sm"
              title="Search (⌘K)"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Search...</span>
              <kbd className="hidden rounded border border-border/60 bg-background px-1 py-0.5 text-[10px] font-medium sm:inline-flex sm:items-center sm:gap-0.5">
                <Command className="h-2.5 w-2.5" />K
              </kbd>
            </button>

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
            <div className="mx-2 hidden h-6 w-px bg-gradient-to-b from-transparent via-border to-transparent sm:block" />

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
