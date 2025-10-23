// src/services/clientService.js
import { apiRequest } from './api';
import { getStoredToken } from './authService';

// Helper to ensure token exists
const getAuthToken = () => {
  const token = getStoredToken();
  if (!token) {
    throw new Error('No authentication token found. Please log in again.');
  }
  return token;
};

export const clientService = {
  // Get all clients
  getClients: async () => {
    const response = await apiRequest('/clients', 'GET', null, getAuthToken());
    console.log('🔧 Raw clients response:', response);
    
    // Handle different response formats
    if (response && Array.isArray(response)) {
      return response; // Direct array
    } else if (response && response.clients) {
      return response.clients; // { clients: [...] }
    } else if (response && response.data) {
      return response.data; // { data: [...] }
    } else {
      console.warn('Unexpected clients response format:', response);
      return [];
    }
  },
  
  // Get client by ID
  getClientById: async (id) => {
    const response = await apiRequest(`/clients/${id}`, 'GET', null, getAuthToken());
    return response;
  },
  
  // Create new client
  createClient: async (clientData) => {
    const response = await apiRequest('/clients', 'POST', clientData, getAuthToken());
    return response;
  },
  
  // Update client
  updateClient: async (id, clientData) => {
    const response = await apiRequest(`/clients/${id}`, 'PUT', clientData, getAuthToken());
    
    // Handle different response formats
    if (response && response.client) {
      return response.client; // { client: {...} }
    } else if (response && response.data) {
      return response.data; // { data: {...} }
    } else {
      return response; // Direct object
    }
  },
  
  // Delete client
  deleteClient: async (id) => {
    const response = await apiRequest(`/clients/${id}`, 'DELETE', null, getAuthToken());
    return response;
  },
  
  // Search clients
  searchClients: async (query) => {
    const response = await apiRequest(`/clients/search?query=${encodeURIComponent(query)}`, 'GET', null, getAuthToken());
    
    // Handle different response formats
    if (response && response.clients) {
      return response.clients; // { clients: [...] }
    } else if (response && response.data) {
      return response.data; // { data: [...] }
    } else if (Array.isArray(response)) {
      return response; // Direct array
    } else {
      console.warn('Unexpected search response format:', response);
      return [];
    }
  }
};

export const {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  searchClients
} = clientService;