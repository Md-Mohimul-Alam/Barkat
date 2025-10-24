// src/App.jsx
import React from 'react';
import AppRoutes from './routes/AppRoutes';
import { Toast } from './pages/UI/Toast';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import './styles/index.css';

// Loading screen component
const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-100">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600 text-lg">Loading MBTSMS...</p>
    </div>
  </div>
);

// App content that uses auth
const AppContent = () => {
  const { loading } = useAuth(); // ✅ Use loading instead of isLoaded

  // Show loading screen while checking authentication
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <AppRoutes />
      <Toast />
    </>
  );
};

// Main App component
function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;