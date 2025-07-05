import { useState, useEffect } from 'react';
import { Button } from '@mui/material';
import HubspotLogo from './HubspotLogo';
import toast from 'react-hot-toast';
import axios from 'axios';

interface HubSpotAuthButtonProps {
  onConnectionChange?: (isConnected: boolean) => void;
}

export default function HubSpotAuthButton({ onConnectionChange }: HubSpotAuthButtonProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check initial connection status
  useEffect(() => {
    const checkConnectionStatus = async () => {
      try {
        const response = await axios.get('/api/integrations/hubspot/status');
        setIsConnected(response.data.connected);
        if (onConnectionChange) onConnectionChange(response.data.connected);
      } catch (error) {
        console.error('Error checking HubSpot connection:', error);
      }
    };
    
    checkConnectionStatus();
  }, [onConnectionChange]);

  const handleAuthClick = async () => {
    if (isConnected) {
      // Handle disconnection
      try {
        setIsLoading(true);
        await axios.post('/api/integrations/hubspot/disconnect');
        setIsConnected(false);
        if (onConnectionChange) onConnectionChange(false);
        toast.success('Disconnected from HubSpot');
      } catch (error) {
        toast.error('Failed to disconnect from HubSpot');
        console.error('Disconnection error:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Initiate connection
      try {
        setIsLoading(true);
        const response = await axios.get('/api/integrations/hubspot/auth-url');
        
        // Open HubSpot auth window
        const width = 600;
        const height = 700;
        const left = (window.innerWidth - width) / 2;
        const top = (window.innerHeight - height) / 2;
        
        const authWindow = window.open(
          response.data.url,
          'hubspot_auth',
          `width=${width},height=${height},top=${top},left=${left}`
        );

        // Poll for auth completion
        const checkAuthCompletion = setInterval(async () => {
          if (authWindow?.closed) {
            clearInterval(checkAuthCompletion);
            setIsLoading(false);
            
            // Verify connection
            const statusResponse = await axios.get('/api/integrations/hubspot/status');
            const connected = statusResponse.data.connected;
            setIsConnected(connected);
            if (onConnectionChange) onConnectionChange(connected);
            
            if (connected) {
              toast.success('HubSpot connected successfully');
            }
          }
        }, 500);
      } catch (error) {
        toast.error('Failed to connect to HubSpot');
        console.error('Connection error:', error);
        setIsLoading(false);
      }
    }
  };

  return (
    <Button
      variant="contained"
      onClick={handleAuthClick}
      disabled={isLoading}
      startIcon={<HubspotLogo />}
      sx={{
        backgroundColor: isConnected ? '#ff7a59' : '#ff5a36',
        color: 'white',
        '&:hover': {
          backgroundColor: isConnected ? '#e06a4c' : '#e04a26',
        },
        minWidth: 220,
        textTransform: 'none',
        fontWeight: 500,
      }}
    >
      {isLoading ? (
        'Processing...'
      ) : isConnected ? (
        'Connected to HubSpot'
      ) : (
        'Connect HubSpot Account'
      )}
    </Button>
  );
}