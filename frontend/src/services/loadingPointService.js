import api from './api';

const loadingPointService = {
  // Get all loading points
  getAllLoadingPoints: async (params = {}) => {
    try {
      const response = await api.get('/loading-points', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get loading point by ID
  getLoadingPointById: async (id) => {
    try {
      const response = await api.get(`/loading-points/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create new loading point
  createLoadingPoint: async (loadingPointData) => {
    try {
      const response = await api.post('/loading-points', loadingPointData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update loading point
  updateLoadingPoint: async (id, loadingPointData) => {
    try {
      const response = await api.put(`/loading-points/${id}`, loadingPointData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete loading point
  deleteLoadingPoint: async (id) => {
    try {
      const response = await api.delete(`/loading-points/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get statistics
  getStatistics: async () => {
    try {
      const response = await api.get('/loading-points/statistics');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default loadingPointService;