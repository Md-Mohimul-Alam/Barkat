// Placeholder for branchService.js
import { apiRequest } from './api';

export const createBranch = async (data, token) => {
  return await apiRequest('/branches', 'POST', data, token);
};

export const getBranches = async (token) => {
  return await apiRequest('/branches', 'GET', null, token);
};

export const updateBranch = async (id, data, token) => {
  return await apiRequest(`/branches/${id}`, 'PUT', data, token);
};

export const deleteBranch = async (id, token) => {
  return await apiRequest(`/branches/${id}`, 'DELETE', null, token);
};