// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = authService.getStoredToken();
        const storedUser = authService.getStoredUser();
        
        console.log('🔧 Initializing auth - token:', !!token, 'user:', storedUser);
        
        if (token && storedUser) {
          // Set user immediately from storage for better UX
          console.log('✅ Setting user from storage immediately:', storedUser);
          setUser(storedUser);
          
          // Then verify token in background (non-blocking)
          verifyTokenInBackground(token);
        } else {
          console.log('🔧 No valid token or user found in storage');
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setError('Failed to initialize authentication');
      } finally {
        setLoading(false);
      }
    };

    const verifyTokenInBackground = async (token) => {
      try {
        console.log('🔧 Verifying token in background...');
        const verificationResponse = await authService.verifyToken();
        
        if (verificationResponse && verificationResponse.valid) {
          console.log('✅ Token verified successfully');
        } else {
          console.warn('⚠️ Token verification failed, but keeping user logged in');
          // Don't logout immediately - let the user continue with potentially expired token
          // The API calls will fail and handle logout if needed
        }
      } catch (verifyError) {
        console.warn('⚠️ Token verification error, but keeping user logged in:', verifyError);
        // Don't logout on verification error - let subsequent API calls handle it
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password, role, rememberMe = false) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔧 AuthContext.login called with:', { email, role });
      
      const response = await authService.loginUser(email, password, role, rememberMe);
      
      if (response.success) {
        const userData = response.user;
        
        console.log('✅ Setting user in context:', userData);
        setUser(userData);
        setError(null);
        
        return { 
          success: true, 
          user: userData,
          token: response.token 
        };
      } else {
        const errorMessage = response.message || 'Login failed. Please check your credentials.';
        setError(errorMessage);
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      console.error('Login error in AuthContext:', error);
      const errorMessage = error.message || 'Login failed. Please try again.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log('🔧 Logging out user');
    setUser(null);
    setError(null);
    authService.logoutUser();
  };

  const clearError = () => {
    setError(null);
  };

  const updateUser = (updatedUserData) => {
    setUser(prevUser => ({
      ...prevUser,
      ...updatedUserData
    }));
    
    // Also update in storage
    const storage = localStorage.getItem('authToken') ? localStorage : sessionStorage;
    storage.setItem('auth_user', JSON.stringify({
      ...user,
      ...updatedUserData
    }));
  };

  const value = {
    user,
    login,
    logout,
    loading,
    error,
    clearError,
    updateUser,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};