import { api } from './api';

export interface HubSpotContact {
  id: string;
  properties: {
    firstname?: string;
    lastname?: string;
    email?: string;
    phone?: string;
    company?: string;
    jobtitle?: string;
    lifecyclestage?: string;
    createdate?: string;
    lastmodifieddate?: string;
  };
}

export interface HubSpotClient {
  id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  lifecycleStage?: string;
  createdAt: string;
  lastModified: string;
}

export const fetchClients = async (): Promise<HubSpotClient[]> => {
  try {
    const response = await api.get('/hubspot/contacts');
    return response.data;
  } catch (error) {
    console.error('Error fetching HubSpot clients:', error);
    throw error;
  }
};

export const getClientDetails = async (contactId: string): Promise<HubSpotContact> => {
  try {
    const response = await api.get(`/hubspot/contacts/${contactId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching client details:', error);
    throw error;
  }
};

export const createClient = async (clientData: {
  firstname: string;
  lastname: string;
  email: string;
  phone?: string;
  company?: string;
  jobtitle?: string;
}): Promise<HubSpotContact> => {
  try {
    const response = await api.post('/hubspot/contacts', clientData);
    return response.data;
  } catch (error) {
    console.error('Error creating client:', error);
    throw error;
  }
};

export const updateClient = async (
  contactId: string,
  clientData: Partial<HubSpotContact['properties']>
): Promise<HubSpotContact> => {
  try {
    const response = await api.put(`/hubspot/contacts/${contactId}`, clientData);
    return response.data;
  } catch (error) {
    console.error('Error updating client:', error);
    throw error;
  }
};

export const deleteClient = async (contactId: string): Promise<void> => {
  try {
    await api.delete(`/hubspot/contacts/${contactId}`);
  } catch (error) {
    console.error('Error deleting client:', error);
    throw error;
  }
};

export const searchClients = async (query: string): Promise<HubSpotClient[]> => {
  try {
    const response = await api.get(`/hubspot/contacts/search?q=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error('Error searching clients:', error);
    throw error;
  }
};
