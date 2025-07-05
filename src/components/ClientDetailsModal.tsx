import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Chip,
  Divider,
  Stack,
  Tabs,
  Tab
} from '@mui/material';
import { Email, Phone, AttachMoney, CalendarToday, Edit } from '@mui/icons-material';

interface ClientDetailsModalProps {
  open: boolean;
  onClose: () => void;
  client: any;
  onUpdate: (updatedClient: any) => void;
}

const ClientDetailsModal: React.FC<ClientDetailsModalProps> = ({ 
  open, 
  onClose, 
  client,
  onUpdate 
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: client?.name || '',
    email: client?.email || '',
    phone: client?.phone || '',
    status: client?.status || 'prospect'
  });

  if (!client) return null;

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    const updatedClient = { ...client, ...formData };
    onUpdate(updatedClient);
    setIsEditing(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          {client.name}
          <Chip 
            label={client.status} 
            color={
              client.status === 'active' ? 'success' : 
              client.status === 'prospect' ? 'warning' : 'error'
            } 
          />
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Overview" />
          <Tab label="Portfolio" />
          <Tab label="Communications" />
          <Tab label="Documents" />
        </Tabs>
        
        <Box sx={{ pt: 3 }}>
          {activeTab === 0 && (
            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Contact Information
                </Typography>
                <Divider />
                <Box sx={{ mt: 2, display: 'flex', gap: 3 }}>
                  <Email color="action" />
                  <Typography>{client.email}</Typography>
                </Box>
                <Box sx={{ mt: 1, display: 'flex', gap: 3 }}>
                  <Phone color="action" />
                  <Typography>{client.phone || 'N/A'}</Typography>
                </Box>
              </Box>
              
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Last Contact
                </Typography>
                <Divider />
                <Box sx={{ mt: 2, display: 'flex', gap: 3 }}>
                  <CalendarToday color="action" />
                  <Typography>{client.lastContact}</Typography>
                </Box>
              </Box>
            </Stack>
          )}
          
          {activeTab === 1 && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Investment Portfolio
              </Typography>
              <Divider />
              <Box sx={{ mt: 2, display: 'flex', gap: 3 }}>
                <AttachMoney color="action" />
                <Typography>
                  {client.portfolioValue ? 
                    `$${client.portfolioValue.toLocaleString()}` : 'N/A'}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button 
          startIcon={<Edit />} 
          onClick={isEditing ? handleSave : handleEditToggle}
          variant="contained"
        >
          {isEditing ? 'Save Changes' : 'Edit Client'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClientDetailsModal;