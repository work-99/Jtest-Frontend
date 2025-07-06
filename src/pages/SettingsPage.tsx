// pages/SettingsPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  FormControlLabel,
  Switch,
  Button,
  Divider,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { settingsAPI } from '../services/api';
import toast from 'react-hot-toast';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    autoIndexEmails: true,
    autoIndexContacts: true,
    enableProactiveAgent: true,
    emailNotifications: true,
    aiModel: 'gpt-4-turbo',
    maxContextLength: 4000,
    responseTimeout: 30
  });

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsAPI.getSettings();
      setSettings(response.data);
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      await settingsAPI.updateSettings(settings);
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Paper>
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4" component="h1">
              Settings
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={loadSettings}
              >
                Reset
              </Button>
              <Button
                variant="contained"
                startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                onClick={handleSaveSettings}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </Box>
          </Box>
        </Box>

        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Agent Behavior Settings */}
            <Box>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Agent Behavior
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.enableProactiveAgent}
                          onChange={(e) => setSettings(prev => ({ ...prev, enableProactiveAgent: e.target.checked }))}
                        />
                      }
                      label="Enable proactive agent actions"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.autoIndexEmails}
                          onChange={(e) => setSettings(prev => ({ ...prev, autoIndexEmails: e.target.checked }))}
                        />
                      }
                      label="Automatically index emails for context"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.autoIndexContacts}
                          onChange={(e) => setSettings(prev => ({ ...prev, autoIndexContacts: e.target.checked }))}
                        />
                      }
                      label="Automatically index HubSpot contacts"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.emailNotifications}
                          onChange={(e) => setSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                        />
                      }
                      label="Email notifications for important events"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Box>

            {/* AI Configuration */}
            <Box>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    AI Configuration
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ flex: '1 1 300px' }}>
                      <FormControl fullWidth>
                        <InputLabel>AI Model</InputLabel>
                        <Select
                          value={settings.aiModel}
                          onChange={(e) => setSettings(prev => ({ ...prev, aiModel: e.target.value }))}
                          label="AI Model"
                        >
                          <MenuItem value="gpt-4-turbo">GPT-4 Turbo</MenuItem>
                          <MenuItem value="gpt-4">GPT-4</MenuItem>
                          <MenuItem value="gpt-3.5-turbo">GPT-3.5 Turbo</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                    <Box sx={{ flex: '1 1 300px' }}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Max Context Length"
                        value={settings.maxContextLength}
                        onChange={(e) => setSettings(prev => ({ ...prev, maxContextLength: parseInt(e.target.value) }))}
                        inputProps={{ min: 1000, max: 8000 }}
                      />
                    </Box>
                    <Box sx={{ flex: '1 1 300px' }}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Response Timeout (seconds)"
                        value={settings.responseTimeout}
                        onChange={(e) => setSettings(prev => ({ ...prev, responseTimeout: parseInt(e.target.value) }))}
                        inputProps={{ min: 10, max: 120 }}
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>

            {/* Information */}
            <Box>
              <Alert severity="info">
                <Typography variant="body2">
                  These settings control how the AI agent behaves and processes information. 
                  Changes will take effect immediately for new interactions.
                </Typography>
              </Alert>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default SettingsPage;
