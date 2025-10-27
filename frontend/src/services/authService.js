import { api } from './api';

export const authService = {
  // 🔐 Login user
  loginUser: async (email, password, backendRole, rememberMe = false) => {
    try {
      const response = await api.post('/auth/login', { email, password, backendRole });

      if (response.success && response.token) {
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('authToken', response.token);
        storage.setItem('user', JSON.stringify(response.user));
      }

      return response;
    } catch (error) {
      console.error('❌ Login request failed:', error);
      return { success: false, message: error.message || 'Login failed' };
    }
  },

  // 📝 Register new user
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response;
    } catch (error) {
      console.error('❌ Registration failed:', error);
      return { success: false, message: error.message || 'Registration failed' };
    }
  },

  // 🚪 Logout user
  logoutUser: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('user');
  },

  // 🧠 Get current user from storage
  getStoredUser: () => {
    return JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user'));
  },

  // 🔑 Get stored token
  getStoredToken: () => {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  },

  // ✅ Check if authenticated
  isAuthenticated: () => {
    return !!(localStorage.getItem('authToken') || sessionStorage.getItem('authToken'));
  },

  // 🔍 Verify token validity
  verifyToken: async () => {
    try {
      const token = authService.getStoredToken();
      if (!token) return { valid: false, message: 'No token found' };

      const response = await api.get('/auth/verify', {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response;
    } catch (error) {
      console.warn('⚠️ Token verification failed:', error.message);
      return { valid: false, message: error.message };
    }
  },
};

// ✅ Default export for compatibility with imports like: import authService from '../services/authService';
export default authService;
