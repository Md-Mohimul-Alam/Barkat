// src/services/cnfService.js
import api from './api';

const cnfService = {
  // ✅ Create new CNF
  createCNF: async (cnfData) => {
    try {
      const response = await api.post('/cnfs', cnfData);
      // Handle wrapped response
      return response.data || response;
    } catch (error) {
      console.error('Create CNF Error:', error);
      throw { 
        message: error.message || 'Failed to create CNF',
        status: error.status || 500
      };
    }
  },

  // ✅ Get all CNFs - FIXED VERSION
  getAllCNFs: async () => {
    try {
      console.log('🔧 CNF Service - Making request to /cnfs');
      const response = await api.get('/cnfs');
      console.log('🔧 CNF Service - Raw API response:', response);
      
      // Handle different response formats
      if (response && Array.isArray(response)) {
        // Direct array response
        console.log('🔧 CNF Service - Direct array response');
        return response;
      } else if (response && response.data) {
        // Wrapped in data property { data: [...] }
        console.log('🔧 CNF Service - Wrapped data response:', response.data);
        return response.data;
      } else if (response && response.success && response.data) {
        // Success wrapper { success: true, data: [...] }
        console.log('🔧 CNF Service - Success wrapper response:', response.data);
        return response.data;
      } else if (response && response.cnfs) {
        // Direct cnfs property { cnfs: [...] }
        console.log('🔧 CNF Service - CNFs property response:', response.cnfs);
        return response.cnfs;
      } else {
        console.warn('🔧 CNF Service - Unexpected response format:', response);
        return [];
      }
    } catch (error) {
      console.error('❌ Get CNFs Error:', error);
      
      // Handle specific error cases
      if (error.message?.includes('Access denied') || error.message?.includes('role not permitted')) {
        throw { 
          message: 'You do not have permission to access CNF data. Please contact an administrator.',
          status: 403 
        };
      }
      
      throw { 
        message: error.message || 'Failed to fetch CNFs',
        status: error.status || 500
      };
    }
  },

  // ✅ Get CNF by ID
  getCNFById: async (id) => {
    try {
      const response = await api.get(`/cnfs/${id}`);
      // Handle wrapped response
      return response.data || response;
    } catch (error) {
      console.error('Get CNF Error:', error);
      throw { 
        message: error.message || 'Failed to fetch CNF',
        status: error.status || 500
      };
    }
  },

  // ✅ Update CNF
  updateCNF: async (id, cnfData) => {
    try {
      const response = await api.put(`/cnfs/${id}`, cnfData);
      // Handle wrapped response
      return response.data || response;
    } catch (error) {
      console.error('Update CNF Error:', error);
      throw { 
        message: error.message || 'Failed to update CNF',
        status: error.status || 500
      };
    }
  },

  // ✅ Delete CNF
  deleteCNF: async (id) => {
    try {
      const response = await api.delete(`/cnfs/${id}`);
      // Handle wrapped response
      return response.data || response;
    } catch (error) {
      console.error('Delete CNF Error:', error);
      throw { 
        message: error.message || 'Failed to delete CNF',
        status: error.status || 500
      };
    }
  }
};

export default cnfService;