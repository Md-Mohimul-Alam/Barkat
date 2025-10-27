import { api } from './api';

export const cnfService = {
  // ✅ Fix method name - change getAllCNFs to getCNFs
  getCNFs: async () => {
    return await api.get('/cnfs');
  },

  // Get CNF by ID
  getCNFById: async (id) => {
    return await api.get(`/cnfs/${id}`);
  },

  // Create new CNF
  createCNF: async (cnfData) => {
    return await api.post('/cnfs', cnfData);
  },

  // Update CNF
  updateCNF: async (id, cnfData) => {
    return await api.put(`/cnfs/${id}`, cnfData);
  },

  // Delete CNF
  deleteCNF: async (id) => {
    return await api.delete(`/cnfs/${id}`);
  }
};

export default cnfService;