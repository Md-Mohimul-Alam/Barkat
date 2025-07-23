// src/services/api.js
const BASE_URL = "http://localhost:5050/api";

/**
 * Generic API request handler
 */
export const apiRequest = async (endpoint, method = "GET", body = null, token = null) => {
  const headers = {
    "Content-Type": "application/json"
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
    credentials: 'include', // add for cookie-based auth or CORS credentials
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Request failed");
  }

  return await response.json();
};

/**
 * Login user with email, password, and role
 */
export const loginUser = async (email, password, role) => {
  return await apiRequest("/auth/login", "POST", { email, password, role });
};

/**
 * Fetch dashboard data (for any role)
 */
export const getDashboardData = async (token) => {
  return await apiRequest("/dashboard", "GET", null, token);
};

/**
 * Fetch admin-only data
 */
export const getAdminData = async (token) => {
  return await apiRequest("/admin/data", "GET", null, token);
};
