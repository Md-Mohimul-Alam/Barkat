// src/services/api.js
const BASE_URL = "http://localhost:5050/api";

const getToken = () => {
  return localStorage.getItem('authToken') || 
         sessionStorage.getItem('authToken') || 
         null;
};

const apiRequest = async (endpoint, method = "GET", data = null) => {
  const token = getToken();
  
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
    credentials: 'include',
  };

  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);

    // Handle unauthorized responses more carefully
    if (response.status === 401) {
      console.warn('Authentication failed, redirecting to login');
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
      localStorage.removeItem('auth_user');
      sessionStorage.removeItem('auth_user');
      window.location.href = '/login';
      throw new Error('Authentication failed. Please login again.');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    const responseData = await response.json().catch(() => null);
    
    // Return consistent structure
    return {
      success: true,
      data: responseData,
      status: response.status
    };
    
  } catch (error) {
    console.error('API Request Error:', error);
    
    // Don't throw if it's already a redirect
    if (error.message.includes('Authentication failed')) {
      throw error;
    }
    
    throw { 
      message: error.message || 'API request failed',
      status: error.status || 500
    };
  }
};

const api = {
  get: (endpoint) => apiRequest(endpoint),
  post: (endpoint, data) => apiRequest(endpoint, 'POST', data),
  put: (endpoint, data) => apiRequest(endpoint, 'PUT', data),
  delete: (endpoint) => apiRequest(endpoint, 'DELETE'),
};

export default api;