// hooks/useAuth.ts
import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { api, authAPI } from '../services/api';

interface User {
  id: number;
  name: string;
  email: string;
  picture?: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    // Set the token in axios defaults for future requests
    const token = localStorage.getItem('authToken');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    // Clear the authorization header
    delete api.defaults.headers.common['Authorization'];
  };

  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setIsLoading(false);
        return;
      }
      
      // Set the token in axios defaults
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const response = await authAPI.getMe();
      if (response.data.user) {
        setUser(response.data.user);
      } else {
        // Don't call logout here, just clear the token
        localStorage.removeItem('authToken');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Don't call logout here, just clear the token
      localStorage.removeItem('authToken');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check for existing user in localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    // Only check auth if there's a token
    const token = localStorage.getItem('authToken');
    if (token) {
      checkAuth();
    } else {
      setIsLoading(false);
    }
  }, [checkAuth]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}; 