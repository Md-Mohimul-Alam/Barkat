// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DropdownMenu from './UI/dropdown';
import { notifySuccess, notifyError } from './UI/Toast';
import authService from '../services/authService';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(false);

  // Role mapping: UI role → DB role
  const roleMap = {
    'admin-dashboard': 'admin',
    'manager-dashboard': 'manager',
    'employee-dashboard': 'employee'
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password || !selectedRole) {
      const msg = 'Please enter email, password, and select a role';
      setError(msg);
      notifyError(msg);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Map UI role to backend role
      const backendRole = roleMap[selectedRole];

      console.log('Calling authService.loginUser with:', { email, password: '***', backendRole });
      
      const data = await authService.loginUser(email, password, backendRole, rememberMe);
      console.log('Login response data:', data);

      if (data.success && data.user) {
        const userData = data.user;

        console.log('User data to store:', userData);

        // Check role match
        if (userData.role !== backendRole) {
          const msg = 'Selected role does not match account role';
          setError(msg);
          notifyError(msg);
          return;
        }

        // ✅ CORRECT: Call login with individual parameters
        const loginResult = await login(email, password, backendRole, rememberMe);
        
        if (loginResult.success) {
          notifySuccess('Login successful! Redirecting...');

          // Redirect to respective dashboard
          setTimeout(() => {
            switch (selectedRole) {
              case 'admin-dashboard':
                navigate('/app/admin-dashboard', { replace: true });
                break;
              case 'manager-dashboard':
                navigate('/app/manager-dashboard', { replace: true });
                break;
              case 'employee-dashboard':
                navigate('/app/employee-dashboard', { replace: true });
                break;
              default:
                navigate('/unauthorized', { replace: true });
            }
          }, 100);
        } else {
          const msg = loginResult.message || 'Login context failed';
          setError(msg);
          notifyError(msg);
        }

      } else {
        const msg = data.message || 'Login failed - no token received';
        setError(msg);
        notifyError(msg);
      }

    } catch (err) {
      console.error('Login error:', err);
      const msg = err.message || 'Login failed. Please try again.';
      setError(msg);
      notifyError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white p-8 rounded shadow-lg">
        <img
          src="/logo.png"
          alt="MBTSMS Logo"
          className="mx-auto h-20 w-20 object-contain"
        />

        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <DropdownMenu
              buttonLabel={selectedRole ? selectedRole : 'Select Role'}
              items={[
                { label: 'Admin', value: 'admin-dashboard' },
                { label: 'Branch Manager', value: 'manager-dashboard' },
                { label: 'Employee', value: 'employee-dashboard' }
              ]}
              onSelect={(role) => setSelectedRole(role)}
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className="h-4 w-4 text-blue-600"
                disabled={loading}
              />
              <span>Remember Me</span>
            </label>
            <Link
              to="/forgot-password"
              className="text-sm text-blue-500 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700 transition flex items-center justify-center ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-orange-500 hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;