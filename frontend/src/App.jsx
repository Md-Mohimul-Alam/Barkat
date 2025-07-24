// src/App.jsx
import React from 'react';
import AppRoutes from './routes/AppRoutes';
import { Toast } from './pages/UI/Toast';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import './styles/index.css'
// 👇 Temporary loading screen while checking auth
const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-100">
    <p className="text-gray-600 text-lg">Loading session...</p>
  </div>
);

const AppContent = () => {
  const { isLoaded } = useAuth();

  if (!isLoaded) return <LoadingScreen />;

  return (
    <>
      <AppRoutes />
      <Toast />
    </>
  );
};

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
