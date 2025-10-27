import { api } from './api';

export const userService = {
  // Get all users with pagination and filtering
  getUsers: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const endpoint = `/users${queryParams ? `?${queryParams}` : ''}`;
    return await api.get(endpoint);
  },

  // Get user by ID
  getUserById: async (id) => {
    return await api.get(`/users/${id}`);
  },

  // Get current user profile
  getCurrentUser: async () => {
    return await api.get('/users/profile/me');
  },

  // Create new user
  createUser: async (userData) => {
    return await api.post('/users', userData);
  },

  // Update user
  updateUser: async (id, userData) => {
    return await api.put(`/users/${id}`, userData);
  },

  // Update current user profile
  updateCurrentUser: async (userData) => {
    return await api.put('/users/profile/me', userData);
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    return await api.put('/users/profile/password', {
      currentPassword,
      newPassword
    });
  },

  // Delete user
  deleteUser: async (id) => {
    return await api.delete(`/users/${id}`);
  },

  // Get user statistics
  getUserStats: async () => {
    return await api.get('/users/stats/overview');
  },

  // Deactivate account
  deactivateAccount: async () => {
    return await api.put('/users/profile/deactivate');
  }
};

export default userService;