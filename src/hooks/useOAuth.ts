import { useState, useEffect } from 'react';
import axios from 'axios';

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
      const { data } = await axios.get('/api/auth/google');
      window.location.href = data.url;
    } catch (error) {
      console.error('Google authentication failed:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleHubSpotAuth = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      // Initiate HubSpot OAuth flow
      const { data } = await axios.get('/api/auth/hubspot');
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
      const { data } = await axios.get('/api/auth/status');
      
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
      await axios.post('/api/auth/logout');
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Check auth status on mount
  useEffect(() => {
    checkAuthStatus();
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