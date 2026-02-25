'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// DEV MODE: accepts any credentials, creates a fake user session
// TODO: re-enable real auth by uncommenting the original implementation
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(() => {
    const stored = localStorage.getItem('devUser');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email: string, _password: string) => {
    const namePart = email.split('@')[0] || 'dev';
    // For demo accounts, use proper name parsing (e.g. sarah.mitchell → Sarah Mitchell)
    const parts = namePart.split('.');
    const firstName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    const lastName = parts.length > 1
      ? parts[1].charAt(0).toUpperCase() + parts[1].slice(1)
      : 'User';
    const devUser: User = {
      id: '10000000-0000-0000-0000-000000000001',
      firstName,
      lastName,
      email,
      role: 'admin',
    };
    localStorage.setItem('devUser', JSON.stringify(devUser));
    setUser(devUser);
  };

  const logout = async () => {
    localStorage.removeItem('devUser');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('demoMode');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
