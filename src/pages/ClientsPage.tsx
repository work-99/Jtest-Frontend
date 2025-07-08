import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Button,
  IconButton,
  Chip,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  Search,
  Add,
  Refresh,
  Email,
  CalendarToday,
  AttachMoney
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { useSnackbar } from 'notistack';
import ClientDetailsModal from '../components/ClientDetailsModal';
import NewClientModal from '../components/NewClientModal';
import { fetchClients } from '../services/hubspot';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'prospect' | 'inactive';
  lastContact: string;
  portfolioValue?: number;
}

const ClientsPage: React.FC = () => {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [openDetailsModal, setOpenDetailsModal] = useState(false);
  const [openNewClientModal, setOpenNewClientModal] = useState(false);

  // Fetch clients from HubSpot
  useEffect(() => {
    const loadClients = async () => {
      try {
        setLoading(true);
        const data = await fetchClients();
        setClients(mapHubspotDataToClients(data));
      } catch (error) {
        enqueueSnackbar('Failed to load clients', { variant: 'error' });
        console.error('Error fetching clients:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadClients();
    }
  }, [user, enqueueSnackbar]);

  const mapHubspotDataToClients = (hubspotData: any[]): Client[] => {
    return hubspotData.map((contact) => ({
      id: contact.id,
      name: `${contact.properties.firstname} ${contact.properties.lastname}`,
      email: contact.properties.email,
      phone: contact.properties.phone || 'N/A',
      status: contact.properties.hs_lead_status === 'customer' ? 'active' : 'prospect',
      lastContact: contact.properties.lastcontactdate || 'Never',
      portfolioValue: contact.properties.portfolio_value ? 
        parseFloat(contact.properties.portfolio_value) : undefined
    }));
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      const data = await fetchClients();
      setClients(mapHubspotDataToClients(data));
      enqueueSnackbar('Client list refreshed', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Failed to refresh clients', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0); // Reset to first page when searching
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm)
  );

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRowClick = (client: Client) => {
    setSelectedClient(client);
    setOpenDetailsModal(true);
  };

  const handleClientUpdated = (updatedClient: Client) => {
    setClients(clients.map(client => 
      client.id === updatedClient.id ? updatedClient : client
    ));
    setOpenDetailsModal(false);
  };

  const handleNewClientCreated = (newClient: Client) => {
    setClients([newClient, ...clients]);
    setOpenNewClientModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'prospect': return 'warning';
      case 'inactive': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Client Management
      </Typography>

      {/* Action Bar */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        mb: 3,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search clients..."
          InputProps={{
            startAdornment: <Search sx={{ color: 'action.active', mr: 1 }} />
          }}
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ width: 300 }}
        />

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenNewClientModal(true)}
          >
            New Client
          </Button>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Client Table */}
      <Paper elevation={2} sx={{ overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Last Contact</TableCell>
                    <TableCell>Portfolio Value</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredClients
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((client) => (
                      <TableRow 
                        hover 
                        key={client.id}
                        onClick={() => handleRowClick(client)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell>
                          <Typography fontWeight="medium">
                            {client.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="body2">{client.email}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {client.phone}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={client.status} 
                            color={getStatusColor(client.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{client.lastContact}</TableCell>
                        <TableCell>
                          {client.portfolioValue ? (
                            `$${client.portfolioValue.toLocaleString()}`
                          ) : (
                            'N/A'
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Send email">
                            <IconButton size="small">
                              <Email fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Schedule meeting">
                            <IconButton size="small">
                              <CalendarToday fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="View portfolio">
                            <IconButton size="small">
                              <AttachMoney fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredClients.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>

      {/* Client Details Modal */}
      <ClientDetailsModal
        open={openDetailsModal}
        onClose={() => setOpenDetailsModal(false)}
        client={selectedClient}
        onUpdate={handleClientUpdated}
      />

      {/* New Client Modal */}
      <NewClientModal
        open={openNewClientModal}
        onClose={() => setOpenNewClientModal(false)}
        onCreate={handleNewClientCreated}
      />
    </Box>
  );
};

export default ClientsPage;