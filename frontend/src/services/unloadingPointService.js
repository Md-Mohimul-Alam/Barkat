import api from './api';

const unloadingPointService = {
  // Get all unloading points
  getAllUnloadingPoints: async (params = {}) => {
    try {
      const response = await api.get('/unloading-points', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get unloading point by ID
  getUnloadingPointById: async (id) => {
    try {
      const response = await api.get(`/unloading-points/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create new unloading point
  createUnloadingPoint: async (unloadingPointData) => {
    try {
      const response = await api.post('/unloading-points', unloadingPointData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update unloading point
  updateUnloadingPoint: async (id, unloadingPointData) => {
    try {
      const response = await api.put(`/unloading-points/${id}`, unloadingPointData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete unloading point
  deleteUnloadingPoint: async (id) => {
    try {
      const response = await api.delete(`/unloading-points/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get statistics
  getStatistics: async () => {
    try {
      const response = await api.get('/unloading-points/statistics');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default unloadingPointService;