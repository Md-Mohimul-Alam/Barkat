// src/services/clientService.js
import api from './api';

const clientService = {
  getClients: async () => {
    try {
      console.log('🔧 Fetching clients...');
      const response = await api.get('/clients');
      console.log('🔧 Clients response:', response);
      
      if (response.success && response.data) {
        // Handle array directly
        if (Array.isArray(response.data)) {
          return response.data;
        }
        // Handle nested arrays
        if (response.data.clients && Array.isArray(response.data.clients)) {
          return response.data.clients;
        }
        // Handle data property
        if (response.data.data && Array.isArray(response.data.data)) {
          return response.data.data;
        }
      }
      
      console.warn('Unexpected clients format:', response);
      return [];
      
    } catch (error) {
      console.error('❌ Get clients error:', error);
      throw error;
    }
  },

  // ... keep other methods the same but simplify the response handling
  getClientById: async (id) => {
    try {
      const response = await api.get(`/clients/${id}`);
      return response.success ? response.data : null;
    } catch (error) {
      console.error('Get client error:', error);
      throw error;
    }
  },

  createClient: async (clientData) => {
    try {
      const response = await api.post('/clients', clientData);
      return response.success ? response.data : null;
    } catch (error) {
      console.error('Create client error:', error);
      throw error;
    }
  },

  updateClient: async (id, clientData) => {
    try {
      const response = await api.put(`/clients/${id}`, clientData);
      return response.success ? response.data : null;
    } catch (error) {
      console.error('Update client error:', error);
      throw error;
    }
  },

  deleteClient: async (id) => {
    try {
      const response = await api.delete(`/clients/${id}`);
      return response.success;
    } catch (error) {
      console.error('Delete client error:', error);
      throw error;
    }
  },

  searchClients: async (query) => {
    try {
      const response = await api.get(`/clients/search?query=${encodeURIComponent(query)}`);
      
      if (response.success && response.data) {
        if (Array.isArray(response.data)) {
          return response.data;
        }
        if (response.data.clients && Array.isArray(response.data.clients)) {
          return response.data.clients;
        }
        if (response.data.data && Array.isArray(response.data.data)) {
          return response.data.data;
        }
      }
      
      return [];
    } catch (error) {
      console.error('Search clients error:', error);
      throw error;
    }
  }
};

export default clientService;