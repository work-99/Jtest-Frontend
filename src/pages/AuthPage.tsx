// pages/AuthPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import {
  Google as GoogleIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  Business as BusinessIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useOAuth } from '../hooks/useOAuth';
import { api } from '../services/api';
import toast from 'react-hot-toast';

interface ServiceStatus {
  name: string;
  connected: boolean;
  icon: React.ReactNode;
  color: 'success' | 'error' | 'warning';
  description: string;
}

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, login, logout } = useAuth();
  const { handleGoogleAuth, handleHubSpotAuth } = useOAuth();
  const [loading, setLoading] = useState(false);
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    autoIndexEmails: true,
    autoIndexContacts: true,
    enableProactiveAgent: true,
    emailNotifications: true
  });

  useEffect(() => {
    if (user) {
      checkServiceConnections();
    }
  }, [user]);

  const checkServiceConnections = async () => {
    if (!user) return;

    try {
      const [gmailStatus, hubspotStatus, calendarStatus] = await Promise.all([
        api.get('/integrations/gmail/status').catch(() => ({ data: { connected: false } })),
        api.get('/integrations/hubspot/status').catch(() => ({ data: { connected: false } })),
        api.get('/integrations/calendar/status').catch(() => ({ data: { connected: false } }))
      ]);

      setServiceStatus([
        {
          name: 'Gmail',
          connected: gmailStatus.data.connected,
          icon: <EmailIcon />,
          color: gmailStatus.data.connected ? 'success' : 'error',
          description: 'Email integration for communication and context'
        },
        {
          name: 'Google Calendar',
          connected: calendarStatus.data.connected,
          icon: <CalendarIcon />,
          color: calendarStatus.data.connected ? 'success' : 'warning',
          description: 'Calendar integration for appointment scheduling'
        },
        {
          name: 'HubSpot CRM',
          connected: hubspotStatus.data.connected,
          icon: <BusinessIcon />,
          color: hubspotStatus.data.connected ? 'success' : 'error',
          description: 'CRM integration for contact management'
        }
      ]);
    } catch (error) {
      console.error('Error checking service connections:', error);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await handleGoogleAuth();
      toast.success('Google authentication initiated');
    } catch (error) {
      toast.error('Failed to initiate Google authentication');
      console.error('Google auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleHubspotConnect = async () => {
    setLoading(true);
    try {
      await handleHubSpotAuth();
      toast.success('HubSpot authentication initiated');
    } catch (error) {
      toast.error('Failed to initiate HubSpot authentication');
      console.error('HubSpot auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectService = async (serviceName: string) => {
    setLoading(true);
    try {
      switch (serviceName.toLowerCase()) {
        case 'gmail':
        case 'google calendar':
          await handleGoogleLogin();
          break;
        case 'hubspot crm':
          await handleHubspotConnect();
          break;
        default:
          toast.error(`Service ${serviceName} not implemented`);
      }
    } catch (error) {
      toast.error(`Failed to connect ${serviceName}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await api.post('/user/settings', settings);
      toast.success('Settings saved successfully');
      setShowSettings(false);
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (user) {
    return (
      <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h4" component="h1">
                Welcome, {user.name}!
              </Typography>
              <Box>
                <Button
                  variant="outlined"
                  startIcon={<SettingsIcon />}
                  onClick={() => setShowSettings(true)}
                  sx={{ mr: 2 }}
                >
                  Settings
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </Box>
            </Box>

            <Alert severity="info" sx={{ mb: 3 }}>
              Connect your services to enable the AI agent's full capabilities. The agent will use these integrations to provide personalized assistance.
            </Alert>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ flex: '1 1 600px' }}>
                <Typography variant="h6" gutterBottom>
                  Service Connections
                </Typography>
                <List>
                  {serviceStatus.map((service) => (
                    <ListItem
                      key={service.name}
                      sx={{
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 1,
                        mb: 1
                      }}
                    >
                      <ListItemIcon>
                        <Box sx={{ color: service.color }}>
                          {service.icon}
                        </Box>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {service.name}
                            <Chip
                              label={service.connected ? 'Connected' : 'Not Connected'}
                              color={service.connected ? 'success' : 'error'}
                              size="small"
                            />
                          </Box>
                        }
                        secondary={service.description}
                      />
                      <ListItemSecondaryAction>
                        <Button
                          variant={service.connected ? 'outlined' : 'contained'}
                          color={service.connected ? 'success' : 'primary'}
                          onClick={() => handleConnectService(service.name)}
                          disabled={loading}
                          startIcon={service.connected ? <CheckCircleIcon /> : undefined}
                        >
                          {service.connected ? 'Connected' : 'Connect'}
                        </Button>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </Box>

              <Box sx={{ flex: '1 1 300px' }}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Quick Actions
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => navigate('/chat')}
                      disabled={!serviceStatus.some(s => s.connected)}
                    >
                      Start Chat
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => navigate('/clients')}
                    >
                      View Clients
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => navigate('/tasks')}
                    >
                      Task Management
                    </Button>
                  </Box>
                </Paper>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Settings Dialog */}
        <Dialog open={showSettings} onClose={() => setShowSettings(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SettingsIcon />
              Agent Settings
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={settings.autoIndexEmails}
                    onChange={(e) => setSettings(prev => ({ ...prev, autoIndexEmails: e.target.checked }))}
                  />
                }
                label="Automatically index emails for context"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={settings.autoIndexContacts}
                    onChange={(e) => setSettings(prev => ({ ...prev, autoIndexContacts: e.target.checked }))}
                  />
                }
                label="Automatically index HubSpot contacts"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={settings.enableProactiveAgent}
                    onChange={(e) => setSettings(prev => ({ ...prev, enableProactiveAgent: e.target.checked }))}
                  />
                }
                label="Enable proactive agent actions"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={settings.emailNotifications}
                    onChange={(e) => setSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                  />
                }
                label="Email notifications for important events"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowSettings(false)}>Cancel</Button>
            <Button onClick={handleSaveSettings} variant="contained">Save Settings</Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 2
      }}
    >
      <Card sx={{ maxWidth: 500, width: '100%' }}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Financial Advisor AI Agent
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Your intelligent assistant for client management, communication, and task automation
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={loading ? <CircularProgress size={20} /> : <GoogleIcon />}
              onClick={handleGoogleLogin}
              disabled={loading}
              sx={{
                background: '#4285f4',
                '&:hover': { background: '#357abd' }
              }}
            >
              {loading ? 'Connecting...' : 'Continue with Google'}
            </Button>

            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                or
              </Typography>
            </Divider>

            <Typography variant="body2" color="text.secondary">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Typography>
          </Box>

          <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
              What you'll get:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="success" />
                </ListItemIcon>
                <ListItemText primary="AI-powered client communication" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="success" />
                </ListItemIcon>
                <ListItemText primary="Automated task management" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="success" />
                </ListItemIcon>
                <ListItemText primary="Intelligent email responses" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="success" />
                </ListItemIcon>
                <ListItemText primary="Proactive client follow-ups" />
              </ListItem>
            </List>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AuthPage;