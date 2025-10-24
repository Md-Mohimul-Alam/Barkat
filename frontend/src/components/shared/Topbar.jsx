import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  FaBell, 
  FaCog, 
  FaUserCircle, 
  FaChevronDown, 
  FaSearch,
  FaEnvelope,
  FaSignOutAlt,
  FaUser,
  FaMoon,
  FaSun,
  FaBars
} from 'react-icons/fa';

const TopBar = ({ onToggleSidebar, sidebarCollapsed }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const userMenuRef = useRef(null);
  const notificationsRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        navigate('/dashboard');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Implement search functionality
      console.log('Searching for:', searchQuery);
    }
  };

  // Mock notifications data
  const notifications = [
    { id: 1, type: 'order', message: 'New order received', time: '5 min ago', read: false },
    { id: 2, type: 'system', message: 'System update available', time: '1 hour ago', read: true },
    { id: 3, type: 'alert', message: 'Payment received from Client A', time: '2 hours ago', read: true },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const logoSrc = theme === 'light' ? '/logo.png' : '/logo2.png';

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all h-[72px] duration-300
        ${theme === 'dark' 
          ? 'bg-gradient-to-r from-gray-900 to-gray-800 border-gray-700 text-white' 
          : 'bg-gradient-to-r from-white to-gray-50 border-gray-200 text-gray-900'
        } shadow-sm`}
    >
      <div className="w-full h-16 flex items-center justify-between px-4 lg:px-6">
        {/* Left Section - Hamburger & Logo */}
        <div className="flex items-center space-x-4">
          {/* Hamburger Menu */}
          <button
            onClick={onToggleSidebar}
            className={`p-2 rounded-lg transition-all duration-300 hover:scale-105 ${
              theme === 'dark'
                ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <FaBars className="w-5 h-5" />
          </button>

          {/* Logo */}
          {user?.role && (
            <div
              onClick={handleLogoClick}
              className="flex items-center space-x-3 cursor-pointer group"
            >
              <div className="p-1 flex items-center justify-center h-12 w-12">
                <img
                  src={logoSrc}
                  alt="MBTSMS Logo"
                  className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
                />
              </div>
              
              <div className="hidden lg:block">
                <span className={`text-xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent transition-all duration-300`}>
                  MS. Barkat Transport
                </span>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Management System
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Center Section - Search Bar */}
        <div className="flex-1 max-w-2xl mx-4 lg:mx-8">
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <input
                type="text"
                placeholder="Search orders, clients, vehicles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
          </form>
        </div>

        {/* Right Section - Actions & User Menu */}
        <div className="flex items-center space-x-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
              theme === 'dark'
                ? 'text-yellow-400 hover:bg-gray-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <FaMoon className="w-5 h-5" /> : <FaSun className="w-5 h-5" />}
          </button>

          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-2 rounded-lg relative transition-all duration-300 hover:scale-105 ${
                theme === 'dark'
                  ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <FaBell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className={`absolute right-0 top-12 w-80 rounded-xl shadow-2xl border py-2 transform transition-all duration-300 ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
              }`}>
                <div className={`px-4 py-3 border-b ${
                  theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <h3 className="font-semibold">Notifications</h3>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {unreadCount} unread messages
                  </p>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`px-4 py-3 border-b cursor-pointer transition-colors ${
                        theme === 'dark'
                          ? 'border-gray-700 hover:bg-gray-700'
                          : 'border-gray-100 hover:bg-gray-50'
                      } ${!notification.read ? (theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50') : ''}`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-full ${
                          notification.type === 'order' ? 'bg-green-100 text-green-600' :
                          notification.type === 'alert' ? 'bg-red-100 text-red-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          <FaEnvelope className="w-3 h-3" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{notification.message}</p>
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {notification.time}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className={`px-4 py-2 border-t ${
                  theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <button className={`w-full text-center py-2 text-sm font-medium rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'text-blue-400 hover:text-blue-300'
                      : 'text-blue-600 hover:text-blue-700'
                  }`}>
                    View All Notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={`flex items-center space-x-3 p-2 rounded-xl transition-all duration-300 hover:scale-105 ${
                theme === 'dark'
                  ? 'hover:bg-gray-700'
                  : 'hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-2">
                <div className="text-right hidden sm:block">
                  <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {user?.name || 'User'}
                  </p>
                  <p className={`text-xs capitalize ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {user?.role || 'Role'}
                  </p>
                </div>
                <div className="relative">
                  <FaUserCircle className={`w-8 h-8 ${
                    theme === 'dark' ? 'text-orange-400' : 'text-orange-500'
                  }`} />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <FaChevronDown className={`w-3 h-3 transition-transform duration-300 ${
                  showUserMenu ? 'rotate-180' : ''
                } ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
              </div>
            </button>

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div className={`absolute right-0 top-12 w-64 rounded-xl shadow-2xl border py-2 transform transition-all duration-300 ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
              }`}>
                {/* User Info */}
                <div className={`px-4 py-3 border-b ${
                  theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <p className="font-semibold">{user?.name || 'User'}</p>
                  <p className={`text-sm capitalize ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {user?.role || 'Role'}
                  </p>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                    {user?.email || 'user@example.com'}
                  </p>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <button
                    onClick={() => navigate('/profile')}
                    className={`flex items-center space-x-3 w-full px-4 py-2 text-left transition-colors ${
                      theme === 'dark'
                        ? 'hover:bg-gray-700 text-gray-300'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <FaUser className="w-4 h-4" />
                    <span>My Profile</span>
                  </button>
                  
                  <button
                    onClick={() => navigate('/settings')}
                    className={`flex items-center space-x-3 w-full px-4 py-2 text-left transition-colors ${
                      theme === 'dark'
                        ? 'hover:bg-gray-700 text-gray-300'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <FaCog className="w-4 h-4" />
                    <span>Settings</span>
                  </button>
                </div>

                {/* Logout */}
                <div className={`pt-2 border-t ${
                  theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <button
                    onClick={handleLogout}
                    className={`flex items-center space-x-3 w-full px-4 py-2 text-left transition-colors ${
                      theme === 'dark'
                        ? 'hover:bg-red-900/50 text-red-400'
                        : 'hover:bg-red-50 text-red-600'
                    }`}
                  >
                    <FaSignOutAlt className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;