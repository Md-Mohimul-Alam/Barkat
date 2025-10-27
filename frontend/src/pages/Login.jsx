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
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    password: '',
    role: ''
  });

  // Role mapping: UI role → DB role
  const roleMap = {
    'admin-dashboard': 'admin',
    'manager-dashboard': 'manager',
    'employee-dashboard': 'employee'
  };

  const validateForm = () => {
    const errors = {
      email: '',
      password: '',
      role: ''
    };

    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Invalid email format';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!selectedRole) {
      errors.role = 'Please select a role';
    }

    setFieldErrors(errors);
    return !errors.email && !errors.password && !errors.role;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      const msg = 'Please fix the form errors';
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
      
      // ✅ FIX: Use loginUser instead of login
      const data = await authService.loginUser(email, password, backendRole, rememberMe);
      console.log('Login response data:', data);

      if (data.success && data.user) {
        const userData = data.user;

        console.log('User data to store:', userData);

        // Check role match
        if (userData.role !== backendRole) {
          const msg = 'Selected role does not match account role';
          setError(msg);
          setFieldErrors(prev => ({ ...prev, role: msg }));
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



  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (fieldErrors.email) {
      setFieldErrors(prev => ({ ...prev, email: '' }));
    }
    if (error) setError('');
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (fieldErrors.password) {
      setFieldErrors(prev => ({ ...prev, password: '' }));
    }
    if (error) setError('');
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    if (fieldErrors.role) {
      setFieldErrors(prev => ({ ...prev, role: '' }));
    }
    if (error) setError('');
  };

  const handleRememberMeChange = () => {
    setRememberMe(!rememberMe);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white p-8 rounded shadow-lg">
        <img
          src="/logo.png"
          alt="MBTSMS Logo"
          className="mx-auto h-20 w-20 object-contain"
        />

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              className={`w-full border rounded px-3 py-2 transition-colors ${
                fieldErrors.email 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
              }`}
              value={email}
              onChange={handleEmailChange}
              placeholder="you@example.com"
              required
              disabled={loading}
            />
            {fieldErrors.email && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              className={`w-full border rounded px-3 py-2 transition-colors ${
                fieldErrors.password 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
              }`}
              value={password}
              onChange={handlePasswordChange}
              placeholder="********"
              required
              disabled={loading}
              minLength="6"
            />
            {fieldErrors.password && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <DropdownMenu
              buttonLabel={selectedRole ? selectedRole.replace('-dashboard', '') : 'Select Role'}
              items={[
                { label: 'Admin', value: 'admin-dashboard' },
                { label: 'Branch Manager', value: 'manager-dashboard' },
                { label: 'Employee', value: 'employee-dashboard' }
              ]}
              onSelect={handleRoleSelect}
              disabled={loading}
            />
            {fieldErrors.role && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors.role}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={handleRememberMeChange}
                className={`h-4 w-4 rounded focus:ring-orange-500 text-orange-600 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={loading}
              />
              <span className={loading ? 'opacity-50' : ''}>Remember Me</span>
            </label>
            <Link
              to="/forgot-password"
              className={`text-sm text-blue-500 hover:underline transition-colors ${
                loading ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700 transition flex items-center justify-center font-medium ${
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

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
          <p className="font-medium mb-2">Demo Accounts:</p>
          <ul className="space-y-1 text-xs">
            <li><strong>Admin:</strong> admin@mbt.com / admin123</li>
            <li><strong>Manager:</strong> manager@mbt.com / manager123</li>
            <li><strong>Employee:</strong> employee@mbt.com / employee123</li>
          </ul>
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link 
              to="/register" 
              className={`text-orange-500 hover:underline transition-colors ${
                loading ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              Contact administrator
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;