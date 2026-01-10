'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  ClientUser,
  AuthTokens,
  saveAuthData,
  getStoredTokens,
  getStoredUser,
  clearAuthData,
  clientLogin as apiLogin,
  clientRegister as apiRegister,
  getClientProfile,
} from '@/lib/api/clientAuth';

interface ClientAuthContextType {
  user: ClientUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (data: {
    email: string;
    password: string;
    first_name: string;
    last_name?: string;
    phone?: string;
    preferred_locale?: string;
    marketing_opt_in?: boolean;
  }) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const ClientAuthContext = createContext<ClientAuthContextType | null>(null);

export function ClientAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ClientUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const tokens = getStoredTokens();
      const storedUser = getStoredUser();

      if (tokens && storedUser) {
        setUser(storedUser);

        // Optionally refresh profile from server
        try {
          const response = await getClientProfile();
          if (response.success && response.profile) {
            setUser(response.profile);
            saveAuthData(tokens, response.profile);
          }
        } catch {
          // Token might be expired, clear auth
          clearAuthData();
          setUser(null);
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await apiLogin(email, password);

      if (response.success && response.tokens && response.user) {
        saveAuthData(response.tokens, response.user);
        setUser(response.user);
        return { success: true, message: response.message };
      }

      return { success: false, message: response.message || 'Login failed' };
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  }, []);

  const register = useCallback(async (data: {
    email: string;
    password: string;
    first_name: string;
    last_name?: string;
    phone?: string;
    preferred_locale?: string;
    marketing_opt_in?: boolean;
  }) => {
    try {
      const response = await apiRegister(data);

      if (response.success && response.tokens && response.user) {
        saveAuthData(response.tokens, response.user);
        setUser(response.user);
        return { success: true, message: response.message };
      }

      return { success: false, message: response.message || 'Registration failed' };
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
      };
    }
  }, []);

  const logout = useCallback(() => {
    clearAuthData();
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const response = await getClientProfile();
      if (response.success && response.profile) {
        const tokens = getStoredTokens();
        if (tokens) {
          saveAuthData(tokens, response.profile);
        }
        setUser(response.profile);
      }
    } catch {
      // Ignore errors during refresh
    }
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshProfile,
  };

  return (
    <ClientAuthContext.Provider value={value}>
      {children}
    </ClientAuthContext.Provider>
  );
}

export function useClientAuth() {
  const context = useContext(ClientAuthContext);
  if (!context) {
    throw new Error('useClientAuth must be used within a ClientAuthProvider');
  }
  return context;
}
