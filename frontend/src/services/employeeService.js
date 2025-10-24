// src/services/employeeService.js
import api from './api';

const employeeService = {
  // Get all employees with pagination and filters
  getEmployees: async (params = {}) => {
    try {
      console.log('🔧 Fetching employees...');
      const response = await api.get('/employees', { params });
      
      // Handle different response formats
      if (response && response.data) {
        console.log('✅ Employees fetched successfully');
        return response.data;
      } else if (Array.isArray(response)) {
        console.log('✅ Employees fetched successfully (direct array)');
        return response;
      } else {
        console.warn('Unexpected employees response format:', response);
        return [];
      }
    } catch (error) {
      console.error('❌ Failed to fetch employees:', error);
      
      // Check if it's a network error
      if (error.message.includes('Cannot connect to server')) {
        throw new Error('Backend server is not running. Please start the server on port 5050.');
      }
      
      // Check if it's an authentication error
      if (error.message.includes('Authentication failed')) {
        throw new Error('Your session has expired. Please login again.');
      }
      
      throw new Error(error.message || 'Failed to fetch employees');
    }
  },

  // Create new employee
  createEmployee: async (employeeData) => {
    try {
      console.log('🔧 Creating employee:', employeeData);
      const response = await api.post('/employees', employeeData);
      
      if (response && response.data) {
        console.log('✅ Employee created successfully');
        return response.data;
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('❌ Failed to create employee:', error);
      
      if (error.message.includes('Cannot connect to server')) {
        throw new Error('Backend server is not running. Please start the server on port 5050.');
      }
      
      if (error.message.includes('Authentication failed')) {
        throw new Error('Your session has expired. Please login again.');
      }
      
      throw new Error(error.message || 'Failed to create employee');
    }
  },

  // Update employee
  updateEmployee: async (id, employeeData) => {
    try {
      const response = await api.put(`/employees/${id}`, employeeData);
      return response.data || response;
    } catch (error) {
      console.error('Failed to update employee:', error);
      throw new Error(error.message || 'Failed to update employee');
    }
  },

  // Delete employee
  deleteEmployee: async (id) => {
    try {
      const response = await api.delete(`/employees/${id}`);
      return response.data || response;
    } catch (error) {
      console.error('Failed to delete employee:', error);
      throw new Error(error.message || 'Failed to delete employee');
    }
  },

  // Get employee by ID
  getEmployeeById: async (id) => {
    try {
      const response = await api.get(`/employees/${id}`);
      return response.data || response;
    } catch (error) {
      console.error('Failed to fetch employee:', error);
      throw new Error(error.message || 'Failed to fetch employee');
    }
  },

  // Get employees by branch
  getEmployeesByBranch: async (branchId, params = {}) => {
    try {
      const response = await api.get(`/employees/branch/${branchId}`, { params });
      return response.data || response;
    } catch (error) {
      console.error('Failed to fetch employees by branch:', error);
      throw new Error(error.message || 'Failed to fetch employees by branch');
    }
  },

  // Search employees
  searchEmployees: async (query, params = {}) => {
    try {
      const response = await api.get('/employees/search', { 
        params: { query, ...params } 
      });
      return response.data || response;
    } catch (error) {
      console.error('Failed to search employees:', error);
      throw new Error(error.message || 'Failed to search employees');
    }
  },

  // Get employee statistics
  getEmployeeStats: async () => {
    try {
      const response = await api.get('/employees/stats');
      return response.data || response;
    } catch (error) {
      console.error('Failed to fetch employee statistics:', error);
      throw new Error(error.message || 'Failed to fetch employee statistics');
    }
  },

  // Bulk update employees
  bulkUpdateEmployees: async (employeeIds, updateData) => {
    try {
      const response = await api.patch('/employees/bulk', {
        employeeIds,
        updateData
      });
      return response.data || response;
    } catch (error) {
      console.error('Failed to bulk update employees:', error);
      throw new Error(error.message || 'Failed to bulk update employees');
    }
  },

  // Export employees data
  exportEmployees: async (format = 'csv', filters = {}) => {
    try {
      const response = await api.get('/employees/export', {
        params: { format, ...filters },
        responseType: 'blob'
      });
      return response.data || response;
    } catch (error) {
      console.error('Failed to export employees:', error);
      throw new Error(error.message || 'Failed to export employees');
    }
  },

  // Upload employee profile picture
  uploadProfilePicture: async (employeeId, file) => {
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);
      
      const response = await api.post(`/employees/${employeeId}/profile-picture`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data || response;
    } catch (error) {
      console.error('Failed to upload profile picture:', error);
      throw new Error(error.message || 'Failed to upload profile picture');
    }
  }
};

export default employeeService;