// client/src/contexts/AuthContext.tsx - FIXED VERSION
import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

interface User {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
  is_superuser: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Check for existing token on app load - FIXED: Only run once
  useEffect(() => {
    if (initialized) return; // Prevent re-initialization

    const initializeAuth = () => {
      try {
        const storedToken = localStorage.getItem('adminToken');
        const storedUser = localStorage.getItem('adminUser');
        
        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        // Clear invalid data
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        localStorage.removeItem('adminRefreshToken');
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    initializeAuth();
  }, [initialized]); // Only depend on initialized flag

  // Memoize login function to prevent recreating on every render
  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Check if we got JWT tokens
        if (data.access && data.user) {
          setUser(data.user);
          setToken(data.access);
          
          // Store tokens and user in localStorage
          localStorage.setItem('adminToken', data.access);
          localStorage.setItem('adminUser', JSON.stringify(data.user));
          localStorage.setItem('adminRefreshToken', data.refresh);
          
          return true;
        } else {
          setError('Invalid response from server');
          return false;
        }
      } else {
        const errorMessage = data.detail || data.error || 'Login failed';
        setError(errorMessage);
        return false;
      }
    } catch (error) {
      console.error('Network error details:', error);
      setError('Network error. Please check if the server is running.');
      return false;
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies needed

  // Memoize logout function
  const logout = useCallback(async (): Promise<void> => {
    try {
      const refreshToken = localStorage.getItem('adminRefreshToken');
      
      if (token && refreshToken) {
        await fetch('http://localhost:8000/api/auth/logout/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ refresh: refreshToken }),
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear state and localStorage
      setUser(null);
      setToken(null);
      setError(null);
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      localStorage.removeItem('adminRefreshToken');
    }
  }, [token]); // Only depend on token

  // Memoize computed values
  const isAuthenticated = Boolean(user && token);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = React.useMemo<AuthContextType>(() => ({
    user,
    token,
    login,
    logout,
    isAuthenticated,
    loading,
    error,
  }), [user, token, login, logout, isAuthenticated, loading, error]);

  // Don't render children until initialization is complete
  if (!initialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="text-gray-600">Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// API helper hook for JWT authentication - FIXED: Memoized
export const useAuthenticatedApi = () => {
  const { token } = useAuth();

  const apiCall = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    const isFormData = options.body instanceof FormData;
    
    // Create headers - don't set Content-Type for FormData
    const headers: Record<string, string> = {
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...(!isFormData && { 'Content-Type': 'application/json' }),
      ...(options.headers as Record<string, string>),
    };

    const response = await fetch(`http://localhost:8000/api${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid, redirect to login
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        localStorage.removeItem('adminRefreshToken');
        window.location.href = '/auth';
        throw new Error('Authentication required');
      }
      
      // Try to get error message from response
      let errorMessage = `API call failed: ${response.status} ${response.statusText}`;
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.error || errorMessage;
          
          // Handle Django validation errors
          if (errorData.non_field_errors) {
            errorMessage = errorData.non_field_errors.join(', ');
          } else if (typeof errorData === 'object') {
            const firstKey = Object.keys(errorData)[0];
            if (firstKey && errorData[firstKey]) {
              const errorValue = errorData[firstKey];
              errorMessage = Array.isArray(errorValue) ? errorValue.join(', ') : String(errorValue);
            }
          }
        }
      } catch {
        // Ignore JSON parsing errors, use default message
      }
      
      throw new Error(errorMessage);
    }

    // Handle response based on content type
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    
    return response.text();
  }, [token]); // Only depend on token

  return { apiCall };
};