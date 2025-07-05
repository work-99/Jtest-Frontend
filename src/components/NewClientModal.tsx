import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  MenuItem
} from '@mui/material';

interface NewClientModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (newClient: any) => void;
}

const NewClientModal: React.FC<NewClientModalProps> = ({ open, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    status: 'prospect'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreate = () => {
    const newClient = {
      id: `temp-${Date.now()}`,
      name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      phone: formData.phone,
      status: formData.status,
      lastContact: 'Never',
      portfolioValue: undefined
    };
    onCreate(newClient);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      status: 'prospect'
    });
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add New Client</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', gap: 2 }}>
          <TextField
            name="firstName"
            label="First Name"
            value={formData.firstName}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            name="lastName"
            label="Last Name"
            value={formData.lastName}
            onChange={handleInputChange}
            fullWidth
          />
        </Box>
        <TextField
          name="email"
          label="Email"
          value={formData.email}
          onChange={handleInputChange}
          fullWidth
          sx={{ mt: 2 }}
        />
        <TextField
          name="phone"
          label="Phone"
          value={formData.phone}
          onChange={handleInputChange}
          fullWidth
          sx={{ mt: 2 }}
        />
        <TextField
          select
          name="status"
          label="Status"
          value={formData.status}
          onChange={handleInputChange}
          fullWidth
          sx={{ mt: 2 }}
        >
          <MenuItem value="prospect">Prospect</MenuItem>
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="inactive">Inactive</MenuItem>
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleCreate} 
          variant="contained"
          disabled={!formData.firstName || !formData.lastName || !formData.email}
        >
          Create Client
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewClientModal;