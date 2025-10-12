import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sling as Hamburger } from 'hamburger-react';
import { useTheme } from '../../context/ThemeContext';

const TopBar = ({ onToggleSidebar, sidebarCollapsed }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };


const handleLogoClick = () => {
  switch (user?.role) {
    case 'admin':
      navigate('/app/admin-dashboard');
      break;
    case 'manager':
      navigate('/app/manager-dashboard');
      break;
    case 'branchManager':
      navigate('/app/branch');
      break;
    default:
      navigate('/dashboard'); // fallback
  }
};


const logoSrc = theme === 'light' ? '/logo.png' : '/logo2.png';
  return (
    <header
      className={`shadow m-0 top-0 z-100 border-b-2 border-b-orange-700
        ${theme === 'dark' ? 'bg-cyan-950 text-white border-b-2 border-b-orange-700' : 'bg-white text-gray-900'}
      `}
    >
      <div className="w-full h-16 m-0 flex items-center justify-between px-4 md:px-8">
        {/* Logo + Hamburger */}
        <div className="flex items-center space-x-2">
          <div className={`${theme === 'dark' ? 'bg-cyan-950' : 'bg-white'} mr-2`}>
            <Hamburger
              size={24}
              color={theme === 'dark' ? '#F1FAEE' : '#1D3557'}
              toggled={!sidebarCollapsed}
              toggle={onToggleSidebar}
            />
          </div>

          {user?.role && (
            <div
              onClick={handleLogoClick}
              className={`p-1 flex items-center justify-center h-14 w-20 cursor-pointer ${
                theme === 'dark' ? 'bg-cyan-950' : 'bg-white'
              }`}
            >
              <img
                src={logoSrc}
                alt="MBTSMS Logo"
                className="mx-auto object-contain overflow-hidden"
              />
            </div>
          )}


          <span
            className={`text-xl font-bold transition hidden md:inline ${
                theme === 'dark'
                ? 'text-orange-500'
                : 'text-orange-500'
            }`}
            >
            MS. Barkat Transport Service
        </span>

        </div>



        {/* Navigation Links 
        <nav className="space-x-4 hidden md:flex">
          {['Dashboard', 'Settings', 'Notifications'].map((label) => (
            <Link
              key={label}
              to={`/app/${label.toLowerCase()}${label === 'Dashboard' ? '-dashboard' : ''}`}
              className={`font-medium transition ${
                theme === 'dark'
                  ? 'text-mbts-light hover:text-orange-500'
                  : 'text-gray-900 hover:text-orange-500'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        */}

        {/* Profile / Logout / Theme Toggle */}
        <div className="flex items-center space-x-4">
          <span className={`${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            } text-sm hidden sm:inline`}
          >
            Welcome,
          </span>
          <span
            className={`${
              theme === 'dark' ? 'text-orange-700' : 'text-orange-700'
            } text-sm hidden sm:inline`}
          >
           {user?.name || 'User'}
          </span>

          <button
            onClick={handleLogout}
            className={`px-3 py-1 rounded text-sm transition ${
              theme === 'dark'
                ? 'bg-orange-500 hover:bg-orange-600 text-white'
                : 'bg-orange-500 hover:bg-orange-600 text-white'
            }`}
          >
            Logout
          </button>

          <button
            onClick={toggleTheme}
            className={`px-3 py-1 h-15 w-15 text-lg transition ${
              theme === 'dark'
                ? 'bg-transparent text-white hover:text-cyan-950'
                : 'bg-transparent text-gray-900 hover:text-cyan-950'
            }`}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
