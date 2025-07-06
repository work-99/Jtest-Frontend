import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const token = searchParams.get('token');
        
        if (!token) {
          setError('No authentication token received');
          return;
        }

        // Store the token in localStorage
        localStorage.setItem('authToken', token);

        // Get user info from the backend using the configured API
        const response = await authAPI.getMe();
        
        if (response.data.user) {
          login(response.data.user);
          toast.success('Successfully authenticated!');
          navigate('/chat');
        } else if (searchParams.get('test') === 'true') {
          // Handle mock authentication for testing
          const mockUser = {
            id: 1,
            name: 'Test User',
            email: 'test@example.com',
            picture: undefined,
            created_at: new Date().toISOString()
          };
          login(mockUser);
          toast.success('Successfully authenticated (test mode)!');
          navigate('/chat');
        } else {
          setError('Failed to get user information');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setError('Authentication failed. Please try again.');
        toast.error('Authentication failed');
      }
    };

    handleCallback();
  }, [searchParams, navigate, login]);

  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2,
          p: 3
        }}
      >
        <Alert severity="error" sx={{ maxWidth: 400 }}>
          <Typography variant="h6" gutterBottom>
            Authentication Error
          </Typography>
          <Typography>{error}</Typography>
        </Alert>
        <Typography
          variant="body2"
          color="primary"
          sx={{ cursor: 'pointer' }}
          onClick={() => navigate('/auth')}
        >
          Return to login
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 2
      }}
    >
      <CircularProgress size={60} />
      <Typography variant="h6" color="text.secondary">
        Completing authentication...
      </Typography>
    </Box>
  );
};

export default AuthCallback; 