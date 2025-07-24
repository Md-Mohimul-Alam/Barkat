import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DropdownMenu from './UI/dropdown';
import { notifySuccess, notifyError } from './UI/Toast';
import { loginAndStore } from '../services/authService';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

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

    try {
      // Map UI role to backend role
      const backendRole = roleMap[selectedRole];

      // Call the login service
      const data = await loginAndStore(email, password, backendRole, rememberMe);

      if (data.user.role !== backendRole) {
        const msg = 'Selected role does not match account role';
        setError(msg);
        notifyError(msg);
        return;
      }

      // Save to global auth context
      login({ ...data.user, token: data.token }, rememberMe);
      notifySuccess('Login successful! Redirecting...');

      // Redirect to respective dashboard
      switch (selectedRole) {
        case 'admin-dashboard':
          navigate('/app/admin-dashboard');
          break;
        case 'manager-dashboard':
          navigate('/app/manager-dashboard');
          break;
        case 'employee-dashboard':
          navigate('/app/employee-dashboard');
          break;
        default:
          navigate('/unauthorized');
      }
    } catch (err) {
      console.error(err);
      const msg = err.message || 'Login failed. Please try again.';
      setError(msg);
      notifyError(msg);
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
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className="h-4 w-4 text-blue-600"
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
            className="w-full bg-mbts-orange text-mbts-orange py-2 rounded hover:bg-mbts-orangeHover transition"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
