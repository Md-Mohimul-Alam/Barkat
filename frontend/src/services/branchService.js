// src/services/branchService.js
import api from './api';

const branchService = {
  createBranch: async (data) => {
    try {
      const response = await api.post('/branches', data);
      // Handle different response formats
      return response.data || response;
    } catch (error) {
      console.error('Create branch error:', error);
      throw { 
        message: error.message || 'Failed to create branch',
        status: error.status || 500
      };
    }
  },

  getBranches: async () => {
    try {
      const response = await api.get('/branches');
      console.log('🔧 Branch service raw response:', response);
      
      // Handle different response formats
      if (response && Array.isArray(response)) {
        return response; // Direct array
      } else if (response && response.data) {
        return response.data; // { data: [...] }
      } else if (response && response.branches) {
        return response.branches; // { branches: [...] }
      } else if (response && response.success && response.data) {
        return response.data; // { success: true, data: [...] }
      } else {
        console.warn('Unexpected branches response format:', response);
        return [];
      }
    } catch (error) {
      console.error('Get branches error:', error);
      throw { 
        message: error.message || 'Failed to fetch branches',
        status: error.status || 500
      };
    }
  },

  updateBranch: async (id, data) => {
    try {
      const response = await api.put(`/branches/${id}`, data);
      return response.data || response;
    } catch (error) {
      console.error('Update branch error:', error);
      throw { 
        message: error.message || 'Failed to update branch',
        status: error.status || 500
      };
    }
  },

  deleteBranch: async (id) => {
    try {
      const response = await api.delete(`/branches/${id}`);
      return response.data || response;
    } catch (error) {
      console.error('Delete branch error:', error);
      throw { 
        message: error.message || 'Failed to delete branch',
        status: error.status || 500
      };
    }
  }
};

export default branchService;