import { api } from './api';

export const clientService = {
  // Get all clients with filtering
  getClients: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const endpoint = `/clients${queryParams ? `?${queryParams}` : ''}`;
    return await api.get(endpoint);
  },

  // Get client by ID
  getClientById: async (id) => {
    return await api.get(`/clients/${id}`);
  },

  // Create new client
  createClient: async (clientData) => {
    return await api.post('/clients', clientData);
  },

  // Update client
  updateClient: async (id, clientData) => {
    return await api.put(`/clients/${id}`, clientData);
  },

  // Delete client
  deleteClient: async (id) => {
    return await api.delete(`/clients/${id}`);
  },

  // Search clients
  searchClients: async (query, limit = 10) => {
    return await api.get(`/clients/search?query=${encodeURIComponent(query)}&limit=${limit}`);
  },

  // Get client statistics
  getClientStats: async () => {
    return await api.get('/clients/stats');
  },

  // Get clients with advanced filters
  getClientsWithFilters: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = `/clients/filters${queryParams ? `?${queryParams}` : ''}`;
    return await api.get(endpoint);
  },

  // Bulk update clients
  bulkUpdateClients: async (clientIds, updateData) => {
    return await api.post('/clients/bulk-update', {
      clientIds,
      updateData
    });
  }
};

export default clientService;