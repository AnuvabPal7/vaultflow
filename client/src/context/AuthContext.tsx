/**
 * Authentication Context
 * Manages authentic JWT session state against Spring Boot backend.
 * No client-side dummy token generation. Enforces authentication boundaries.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { apiClient, TOKEN_STORAGE_KEY, ApiException } from '../api/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password?: string, currencyCode?: string, startingBalance?: number) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateLocalUserState: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  const [isLoading, setIsLoading] = useState(true);

  // Validate active token on initial mount by calling GET /api/auth/me
  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (!storedToken) {
        if (isMounted) {
          setToken(null);
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const currentUser = await apiClient.getCurrentUser();
        if (isMounted) {
          setUser(currentUser);
          setToken(storedToken);
        }
      } catch (err) {
        // Token invalid, expired, or backend rejected
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        if (isMounted) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    // Listen for global 401 unauthorized events from API client
    const handleUnauthorizedEvent = () => {
      setToken(null);
      setUser(null);
    };

    window.addEventListener('vaultflow:unauthorized', handleUnauthorizedEvent);

    return () => {
      isMounted = false;
      window.removeEventListener('vaultflow:unauthorized', handleUnauthorizedEvent);
    };
  }, []);

  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const res = await apiClient.login(email.trim(), password);
      localStorage.setItem(TOKEN_STORAGE_KEY, res.token);
      setToken(res.token);
      setUser(res.user);
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      const errorMessage = err instanceof ApiException ? err.message : (err.message || 'Login failed. Please check credentials.');
      return { success: false, error: errorMessage };
    }
  };

  const signup = async (
    name: string,
    email: string,
    password?: string,
    currencyCode: string = 'USD',
    startingBalance: number = 0
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const res = await apiClient.register(name.trim(), email.trim(), password, currencyCode, startingBalance);
      localStorage.setItem(TOKEN_STORAGE_KEY, res.token);
      setToken(res.token);
      setUser(res.user);
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      const errorMessage = err instanceof ApiException ? err.message : (err.message || 'Registration failed.');
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
  };

  const updateLocalUserState = (updates: Partial<User>) => {
    if (!user) return;
    setUser({ ...user, ...updates });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        signup,
        logout,
        updateLocalUserState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
