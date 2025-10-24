// src/components/shared/PrivateRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Define route permissions
const routePermissions = {
  '/app/admin-dashboard': ['admin'],
  '/app/manager-dashboard': ['admin', 'manager'],
  '/app/employee-dashboard': ['admin', 'manager', 'employee'],
  '/app/cnfs': ['admin', 'manager'],
  '/app/cnfs/add': ['admin', 'manager'],
  '/app/branches': ['admin', 'manager', 'employee'],
  '/app/branches/add': ['admin', 'manager'],
  '/app/clients': ['admin', 'manager', 'employee'],
  '/app/clients/add': ['admin', 'manager'],
  '/app/employees': ['admin', 'manager'],
  '/app/employees/add': ['admin', 'manager'],
  '/app/dues': ['admin', 'manager', 'employee'],
  '/app/dues/add': ['admin', 'manager'],
  '/app/banks': ['admin', 'manager'],
  '/app/banks/add': ['admin', 'manager'],
  '/app/loading-points': ['admin', 'manager', 'employee'],
  '/app/loading-points/add': ['admin', 'manager'],
  '/app/unloading-points': ['admin', 'manager', 'employee'],
  '/app/unloading-points/add': ['admin', 'manager'],
  '/app/settings': ['admin', 'manager', 'employee'],
};

const PrivateRoute = ({ children, rolesAllowed = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Loading...</span>
      </div>
    );
  }

  if (!user) {
    // Not logged in - redirect to login with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check route-specific permissions
  const pathname = location.pathname;
  const requiredRoles = rolesAllowed.length > 0 ? rolesAllowed : (routePermissions[pathname] || []);
  
  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    console.warn(`Access denied: User role ${user.role} not allowed for ${pathname}. Required: ${requiredRoles}`);
    return <Navigate to="/unauthorized" replace />;
  }

  // Allowed
  return children;
};

export default PrivateRoute;