// services/api.ts
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  googleAuth: (code: string) => api.post('/auth/google', { code }),
  hubspotAuth: (code: string) => api.post('/auth/hubspot', { code }),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// Chat API functions
export const chatAPI = {
  sendMessage: (message: string, sessionId?: string) => 
    api.post('/chat/message', { message, sessionId }),
  getHistory: (sessionId?: string) => 
    api.get('/chat/history', { params: { sessionId } }),
  getConversations: () => api.get('/chat/conversations'),
};

// Tasks API functions
export const tasksAPI = {
  getTasks: (status?: string) => 
    api.get('/tasks', { params: { status } }),
  createTask: (taskData: any) => api.post('/tasks', taskData),
  updateTask: (taskId: number, updates: any) => 
    api.put(`/tasks/${taskId}`, updates),
  deleteTask: (taskId: number) => api.delete(`/tasks/${taskId}`),
};

// Integrations API functions
export const integrationsAPI = {
  getGmailStatus: () => api.get('/integrations/gmail/status'),
  getHubspotStatus: () => api.get('/integrations/hubspot/status'),
  getCalendarStatus: () => api.get('/integrations/calendar/status'),
  connectGmail: () => api.post('/integrations/gmail/connect'),
  connectHubspot: () => api.post('/integrations/hubspot/connect'),
  connectCalendar: () => api.post('/integrations/calendar/connect'),
};

// Instructions API functions
export const instructionsAPI = {
  getInstructions: () => api.get('/instructions'),
  createInstruction: (instruction: any) => api.post('/instructions', instruction),
  updateInstruction: (id: number, updates: any) => 
    api.put(`/instructions/${id}`, updates),
  deleteInstruction: (id: number) => api.delete(`/instructions/${id}`),
  toggleInstruction: (id: number) => api.patch(`/instructions/${id}/toggle`),
};

// User settings API functions
export const settingsAPI = {
  getSettings: () => api.get('/user/settings'),
  updateSettings: (settings: any) => api.put('/user/settings', settings),
};

export default api;