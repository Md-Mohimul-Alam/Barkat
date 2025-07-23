// Placeholder for PrivateRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// rolesAllowed: array of roles allowed for this route
const PrivateRoute = ({ children, rolesAllowed = [] }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // Not logged in
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (rolesAllowed.length > 0 && !rolesAllowed.includes(user.role)) {
    // Logged in but role not allowed
    return <Navigate to="/unauthorized" replace />;
  }

  // Allowed
  return children;
};

export default PrivateRoute;
