import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { UserRole } from '../types';

interface AuthContextValue {
  isLoggedIn: boolean;
  userRole: UserRole | null;
  login: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  const login = useCallback((role: UserRole) => {
    setUserRole(role);
    setIsLoggedIn(true);
  }, []);

  const logout = useCallback(() => {
    setUserRole(null);
    setIsLoggedIn(false);
  }, []);

  const value = useMemo(() => ({ isLoggedIn, userRole, login, logout }), [isLoggedIn, userRole, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return ctx;
};