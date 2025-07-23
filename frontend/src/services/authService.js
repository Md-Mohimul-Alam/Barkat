import { loginUser } from './api';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

/**
 * Log in the user and store token/user info
 */
export const loginAndStore = async (email, password, role, rememberMe = true) => {
  const response = await loginUser(email, password, role);

  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem(TOKEN_KEY, response.token);
  storage.setItem(USER_KEY, JSON.stringify(response.user));

  return response;
};

/**
 * Log out the user
 */
export const logoutUser = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
};

/**
 * Get stored token (from either session or local storage)
 */
export const getStoredToken = () =>
  localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);

/**
 * Get stored user
 */
export const getStoredUser = () => {
  const user = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};
