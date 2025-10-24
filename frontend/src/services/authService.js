// src/services/authService.js
import api from './api';

const TOKEN_KEY = 'authToken';
const USER_KEY = 'auth_user';

const authService = {
  loginUser: async (email, password, role, rememberMe = true) => {
    try {
      const response = await api.post('/auth/login', { email, password, role });
      console.log('🔧 Raw login response:', response);
      
      // Handle the response structure from your backend
      if (response && response.data && response.data.token) {
        const token = response.data.token;
        const user = response.data.user;
        
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem(TOKEN_KEY, token);
        storage.setItem(USER_KEY, JSON.stringify(user));
        
        // Return consistent success structure
        return {
          success: true,
          token: token,
          user: user,
          message: response.data.message || 'Login successful'
        };
      } else if (response && response.data && response.data.message) {
        // Login failed with message from backend
        throw new Error(response.data.message);
      } else {
        throw new Error('Login failed: Invalid response format');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Clear any potentially invalid stored data
      authService.logoutUser();
      
      throw { 
        message: error.message || 'Login failed. Please check your credentials.',
        status: error.status || 401
      };
    }
  },

  logoutUser: () => {
    console.log('🔧 Clearing authentication data');
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  },

  getStoredToken: () => {
    const token = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
    return token;
  },

  getStoredUser: () => {
    try {
      const user = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
      const parsedUser = user ? JSON.parse(user) : null;
      return parsedUser;
    } catch (error) {
      console.error('Error parsing stored user:', error);
      // Clear corrupted user data
      authService.logoutUser();
      return null;
    }
  },

  verifyToken: async () => {
    try {
      const token = authService.getStoredToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await api.get('/auth/verify');
      console.log('🔧 Token verification response:', response);

      // Handle different response formats from verify endpoint
      if (response && response.data && response.data.user) {
        return { 
          valid: true, 
          user: response.data.user,
          message: response.data.message || 'Token is valid' 
        };
      } else if (response && response.data && response.data.success) {
        return { 
          valid: true, 
          user: response.data.user || response.data.data,
          message: response.data.message 
        };
      } else {
        console.warn('Token verification failed - invalid response:', response);
        return { 
          valid: false, 
          message: 'Token verification failed' 
        };
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      
      // Clear invalid token on authentication errors
      if (error.message?.includes('Authentication failed') || 
          error.message?.includes('401') ||
          error.message?.includes('No authentication token')) {
        console.warn('🔧 Clearing invalid token');
        authService.logoutUser();
      }
      
      throw { 
        message: error.message || 'Token verification failed',
        valid: false 
      };
    }
  },

  // Additional utility methods
  isAuthenticated: () => {
    return !!authService.getStoredToken();
  },

  getAuthHeaders: () => {
    const token = authService.getStoredToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  },

  // Update stored user data (useful when user profile is updated)
  updateStoredUser: (userData) => {
    try {
      const currentUser = authService.getStoredUser();
      if (currentUser) {
        const updatedUser = { ...currentUser, ...userData };
        const storage = localStorage.getItem(TOKEN_KEY) ? localStorage : sessionStorage;
        storage.setItem(USER_KEY, JSON.stringify(updatedUser));
        console.log('🔧 Updated stored user:', updatedUser);
        return updatedUser;
      }
    } catch (error) {
      console.error('Error updating stored user:', error);
    }
    return null;
  },

  // Clear authentication data silently (without logging)
  clearAuthData: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  },

  // Get current authentication state
  getAuthState: () => {
    const token = authService.getStoredToken();
    const user = authService.getStoredUser();
    
    return {
      isAuthenticated: !!token,
      user: user,
      token: token
    };
  }
};

export default authService;