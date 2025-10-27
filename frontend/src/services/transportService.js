import { api } from './api';

export const transportService = {
  // Get all transport statements
  getStatements: async () => {
    return await api.get('/transport');
  },

  // Create transport statement
  createStatement: async (statementData) => {
    return await api.post('/transport', statementData);
  },

  // Get statement by date
  getStatementByDate: async (date) => {
    return await api.get(`/transport/by-date/${date}`);
  },

  // Update statement
  updateStatement: async (date, statementData) => {
    return await api.put(`/transport/by-date/${date}`, statementData);
  },

  // Delete statement
  deleteStatement: async (date) => {
    return await api.delete(`/transport/by-date/${date}`);
  }
};

export default transportService;