import { useState, useEffect } from 'react';
import { api } from '../services/api';

interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  provider: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
}

export function useOAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
  });

  const handleGoogleAuth = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      // Initiate OAuth flow with backend
      console.log('Calling Google OAuth endpoint...');
      const { data } = await api.get('/api/auth/google');
      console.log('Google OAuth URL:', data.url);
      
      // Use window.open for OAuth redirect to avoid popup blockers
      const authWindow = window.open(data.url, '_self');
      
      if (!authWindow) {
        // Fallback to direct redirect if popup is blocked
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Google authentication failed:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleHubSpotAuth = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      // Initiate HubSpot OAuth flow
      const { data } = await api.get('/api/auth/hubspot');
      window.location.href = data.url;
    } catch (error) {
      console.error('HubSpot authentication failed:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Check auth status and get user info
  const checkAuthStatus = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      const { data } = await api.get('/api/auth/status');
      
      setAuthState({
        isAuthenticated: data.authenticated,
        user: data.user || null,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to check auth status:', error);
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      });
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Check auth status on mount only if there's a token
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
    checkAuthStatus();
    } else {
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      });
    }
  }, []);

  return {
    ...authState,
    handleGoogleAuth,
    handleHubSpotAuth,
    checkAuthStatus,
    logout,
  };
}

// Legacy function for backward compatibility
export function useGoogleAuth() {
  const { isAuthenticated, handleGoogleAuth, checkAuthStatus } = useOAuth();
  return { isAuthenticated, handleAuth: handleGoogleAuth, checkAuthStatus };
}