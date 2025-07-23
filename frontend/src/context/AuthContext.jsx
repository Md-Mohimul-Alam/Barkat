// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();
const STORAGE_KEY = 'mbtsms-user';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false); // prevent flash before auth state loads

  useEffect(() => {
    const storedUser =
      JSON.parse(localStorage.getItem(STORAGE_KEY)) ||
      JSON.parse(sessionStorage.getItem(STORAGE_KEY));
    if (storedUser) {
      setUser(storedUser);
    }
    setIsLoaded(true); // ✅ mark context ready
  }, []);

  const login = (userData, rememberMe = false) => {
    setUser(userData);
    const storage = rememberMe ? localStorage : sessionStorage;
    const altStorage = rememberMe ? sessionStorage : localStorage;

    storage.setItem(STORAGE_KEY, JSON.stringify(userData));
    altStorage.removeItem(STORAGE_KEY);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, isLoaded }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
