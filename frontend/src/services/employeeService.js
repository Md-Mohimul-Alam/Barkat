import { api } from './api';

export const employeeService = {
  // Get all employees with filtering
  getEmployees: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const endpoint = `/employees${queryParams ? `?${queryParams}` : ''}`;
    return await api.get(endpoint);
  },

  // Get employee by ID
  getEmployeeById: async (id) => {
    return await api.get(`/employees/${id}`);
  },

  // Create new employee
  createEmployee: async (employeeData) => {
    return await api.post('/employees', employeeData);
  },

  // Update employee
  updateEmployee: async (id, employeeData) => {
    return await api.put(`/employees/${id}`, employeeData);
  },

  // Delete employee
  deleteEmployee: async (id) => {
    return await api.delete(`/employees/${id}`);
  },

  // Get employee statistics
  getEmployeeStats: async () => {
    return await api.get('/employees/stats/overview');
  },

  // Get employees by branch
  getEmployeesByBranch: async (branchId, params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const endpoint = `/employees/branch/${branchId}${queryParams ? `?${queryParams}` : ''}`;
    return await api.get(endpoint);
  },

  // Get managers list
  getManagers: async () => {
    return await api.get('/employees/managers');
  },

  // Bulk update employees
  bulkUpdateEmployees: async (employeeIds, updateData) => {
    return await api.patch('/employees/bulk', {
      employeeIds,
      updateData
    });
  }
};

export default employeeService;