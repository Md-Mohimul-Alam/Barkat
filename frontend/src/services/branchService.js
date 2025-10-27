import { api } from './api';

export const branchService = {
  // Get all branches with filtering
  getBranches: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const endpoint = `/branches${queryParams ? `?${queryParams}` : ''}`;
      console.log('🔧 Fetching branches from:', endpoint);
      
      const response = await api.get(endpoint);
      console.log('🔧 Branches API response:', response);
      return response;
    } catch (error) {
      console.error('❌ Error in branchService.getBranches:', error);
      throw new Error(error.message || 'Failed to fetch branches');
    }
  },

  // Get branch by ID
  getBranchById: async (id) => {
    try {
      const response = await api.get(`/branches/${id}`);
      return response;
    } catch (error) {
      console.error('❌ Error in branchService.getBranchById:', error);
      throw new Error(error.message || 'Failed to fetch branch');
    }
  },

  // Create new branch
  createBranch: async (branchData) => {
    try {
      const response = await api.post('/branches', branchData);
      return response;
    } catch (error) {
      console.error('❌ Error in branchService.createBranch:', error);
      throw new Error(error.message || 'Failed to create branch');
    }
  },

  // Update branch
  updateBranch: async (id, branchData) => {
    try {
      const response = await api.put(`/branches/${id}`, branchData);
      return response;
    } catch (error) {
      console.error('❌ Error in branchService.updateBranch:', error);
      throw new Error(error.message || 'Failed to update branch');
    }
  },

  // Delete branch
  deleteBranch: async (id) => {
    try {
      const response = await api.delete(`/branches/${id}`);
      return response;
    } catch (error) {
      console.error('❌ Error in branchService.deleteBranch:', error);
      throw new Error(error.message || 'Failed to delete branch');
    }
  },

  // Get branch statistics
  getBranchStats: async () => {
    try {
      const response = await api.get('/branches/stats/overview');
      return response;
    } catch (error) {
      console.error('❌ Error in branchService.getBranchStats:', error);
      throw new Error(error.message || 'Failed to fetch branch statistics');
    }
  },

  // Get branches by city
  getBranchesByCity: async (city) => {
    try {
      const response = await api.get(`/branches/city/${city}`);
      return response;
    } catch (error) {
      console.error('❌ Error in branchService.getBranchesByCity:', error);
      throw new Error(error.message || 'Failed to fetch branches by city');
    }
  },

  // Get employees by branch
  getBranchEmployees: async (branchId, params = {}) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const endpoint = `/branches/${branchId}/employees${queryParams ? `?${queryParams}` : ''}`;
      const response = await api.get(endpoint);
      return response;
    } catch (error) {
      console.error('❌ Error in branchService.getBranchEmployees:', error);
      throw new Error(error.message || 'Failed to fetch branch employees');
    }
  },

  // Test endpoint
  testBranches: async () => {
    try {
      const response = await api.get('/branches/test/test-branches');
      return response;
    } catch (error) {
      console.error('❌ Error in branchService.testBranches:', error);
      throw new Error(error.message || 'Test endpoint failed');
    }
  }
};

export default branchService;