// src/components/shared/Sidebar.jsx
import React, { useState, useEffect } from 'react';
import {
  Sidebar,
  Menu,
  MenuItem,
  SubMenu,
} from 'react-pro-sidebar';
import {
  FaBuilding,
  FaUsers,
  FaTruck,
  FaFileInvoiceDollar,
  FaTasks,
  FaChartLine,
  FaBell,
  FaUserShield,
  FaWrench,
  FaRoad,
  FaCalculator,
  FaHome,
  FaUserCircle,
  FaCog,
  FaSignOutAlt,
  FaRegCircle,
  FaDotCircle
} from 'react-icons/fa';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const SidebarMenu = ({ collapsed, onToggle }) => {
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  const [openMenus, setOpenMenus] = useState({});
  const [activePath, setActivePath] = useState(location.pathname);

  // Update active path when location changes
  useEffect(() => {
    setActivePath(location.pathname);
  }, [location.pathname]);

  // Auto-open parent menu when child is active
  useEffect(() => {
    const newOpenMenus = {};
    menuItems.forEach(item => {
      if (item.children) {
        const isChildActive = item.children.some(child => 
          location.pathname === child.path
        );
        if (isChildActive) {
          newOpenMenus[item.key] = true;
        }
      }
    });
    setOpenMenus(newOpenMenus);
  }, [location.pathname]);

  const handleToggle = (menuKey) => {
    setOpenMenus(prev => {
      if (!prev[menuKey]) {
        const newState = {};
        menuItems.forEach(item => {
          if (item.children && item.key !== menuKey) {
            newState[item.key] = false;
          }
        });
        newState[menuKey] = true;
        return newState;
      } else {
        return {
          ...prev,
          [menuKey]: false
        };
      }
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get dashboard path based on user role
  const getDashboardPath = () => {
    switch (user?.role) {
      case 'admin':
        return '/app/admin-dashboard';
      case 'manager':
        return '/app/manager-dashboard';
      case 'employee':
        return '/app/employee-dashboard';
      default:
        return '/app/admin-dashboard';
    }
  };

  const menuItems = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: <FaHome className="w-5 h-5" />,
      allowedRoles: ['admin', 'manager', 'employee'],
      getPath: getDashboardPath // Dynamic path based on role
    },
    {
      key: 'branch',
      label: 'Branch Management',
      icon: <FaBuilding className="w-5 h-5" />,
      allowedRoles: ['admin'],
      children: [
        { key: 'view-branches', label: 'View Branches', path: '/app/branches' },
        { key: 'add-branch', label: 'Add Branch', path: '/app/branches/add' },
      ],
    },
    {
      key: 'client',
      label: 'Client Management',
      icon: <FaUsers className="w-5 h-5" />,
      allowedRoles: ['admin', 'manager'],
      children: [
        { key: 'view-clients', label: 'Clients', path: '/app/clients' },
        { key: 'add-client', label: 'Add Client', path: '/app/clients/add' },
      ],
    },
    {
      key: 'cnf',
      label: 'CNF Management',
      icon: <FaUsers className="w-5 h-5" />,
      allowedRoles: ['admin'],
      children: [
        { key: 'view-cnfs', label: 'CNF List', path: '/app/cnfs' },
        { key: 'add-cnf', label: 'Add CNF', path: '/app/cnfs/add' },
      ],
    },
    {
      key: 'employee',
      label: 'Employee Management',
      icon: <FaUserShield className="w-5 h-5" />,
      allowedRoles: ['admin'],
      children: [
        { key: 'view-employees', label: 'Employees', path: '/app/employees' },
        { key: 'add-employee', label: 'Add Employee', path: '/app/employees/add' },
      ],
    },
    {
      key: 'loading-point',
      label: 'Loading Points',
      icon: <FaRoad className="w-5 h-5" />,
      allowedRoles: ['admin', 'manager'],
      children: [
        { key: 'view-loading-points', label: 'Loading Points', path: '/app/loading-points/list' },
        { key: 'add-loading-point', label: 'Add Loading Point', path: '/app/loading-points/add' },
      ],
    },
    {
      key: 'unloading-point',
      label: 'Unloading Points',
      icon: <FaRoad className="w-5 h-5" />,
      allowedRoles: ['admin', 'manager'],
      children: [
        { key: 'view-unloading-points', label: 'Unloading Points', path: '/app/unloading-points/list' },
        { key: 'add-unloading-point', label: 'Add Unloading Point', path: '/app/unloading-points/add' },
      ],
    },
    {
      key: 'vehicle',
      label: 'Vehicle Management',
      icon: <FaTruck className="w-5 h-5" />,
      allowedRoles: ['admin', 'manager'],
      children: [
        { key: 'view-vehicles', label: 'Vehicles', path: '/app/vehicles' },
        { key: 'add-vehicle', label: 'Add Vehicle', path: '/app/vehicles/add' },
      ],
    },
    {
      key: 'bank',
      label: 'Bank Module',
      icon: <FaFileInvoiceDollar className="w-5 h-5" />,
      allowedRoles: ['admin'],
      children: [
        { key: 'add-bank', label: 'ADD Bank', path: '/app/banks/add' },
        { key: 'statements', label: 'Statements Download', path: '/app/banks/statements' },
        { key: 'add-transaction', label: 'ADD Transactions', path: '/app/banks/transactions/add' },
        { key: 'view-transactions', label: 'Bank Transactions', path: '/app/banks/transactions/list' },
      ],
    },
    {
      key: 'due',
      label: 'Due Tracking',
      icon: <FaTasks className="w-5 h-5" />,
      allowedRoles: ['admin', 'manager'],
      children: [
        { key: 'all-dues', label: 'All Dues', path: '/app/dues' },
        { key: 'due-reports', label: 'Due Reports', path: '/app/dues/reports' },
      ],
    },
    {
      key: 'calculator',
      label: 'Calculator',
      icon: <FaCalculator className="w-5 h-5" />,
      allowedRoles: ['admin'],
      children: [
        { key: 'estimate', label: 'Estimate', path: '/app/calculator/CalculatorPage' },
      ],
    },
    {
      key: 'orders',
      label: 'Orders',
      icon: <FaTasks className="w-5 h-5" />,
      allowedRoles: ['admin', 'manager'],
      children: [
        { key: 'all-orders', label: 'All Orders', path: '/app/orders' },
        { key: 'create-order', label: 'Create Order', path: '/app/orders/create' },
      ],
    },
    {
      key: 'reports',
      label: 'Reports & Analytics',
      icon: <FaChartLine className="w-5 h-5" />,
      allowedRoles: ['admin', 'manager', 'employee'],
      children: [
        { key: 'main-dashboard', label: 'Main Dashboard', path: '/app/dashboard' },
        { key: 'yearly-outcome', label: 'Yearly Outcome', path: '/app/reports/yearly' },
      ],
    },
    {
      key: 'notifications',
      label: 'Notifications',
      icon: <FaBell className="w-5 h-5" />,
      allowedRoles: ['admin', 'manager'],
      children: [
        { key: 'alerts', label: 'Alerts', path: '/app/notifications/alerts' },
        { key: 'reminders', label: 'Reminders', path: '/app/notifications/reminders' },
      ],
    },
    {
      key: 'maintenance',
      label: 'Maintenance',
      icon: <FaWrench className="w-5 h-5" />,
      allowedRoles: ['admin', 'manager'],
      children: [
        { key: 'service-logs', label: 'Service Logs', path: '/app/maintenance/logs' },
        { key: 'upcoming-services', label: 'Upcoming Services', path: '/app/maintenance/upcoming' },
      ],
    },
  ];

  // Filter menu based on user role
  const accessibleItems = menuItems.filter(
    (item) => !item.allowedRoles || item.allowedRoles.includes(user?.role)
  );

  const isActive = (path) => {
    // Handle dynamic dashboard paths
    if (path && path.includes('dashboard')) {
      const currentDashboardPath = getDashboardPath();
      return location.pathname === currentDashboardPath;
    }
    
    return activePath === path;
  };

  // Menu item classes
  const menuItemClass = (isActive) => {
    const baseClasses = "transition-all duration-300 font-medium rounded-lg mx-2 my-1";
    
    if (isActive) {
      return `${baseClasses} ${
        isDark 
          ? 'bg-orange-600 text-white shadow-lg' 
          : 'bg-orange-500 text-white shadow-md'
      }`;
    }
    
    return `${baseClasses} ${
      isDark 
        ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
    }`;
  };

  // Submenu item classes
  const subMenuItemClass = (isActive) => {
    const baseClasses = "transition-all duration-300 text-sm rounded-lg mx-2 my-1 pl-8 pr-3 py-2";
    
    if (isActive) {
      return `${baseClasses} ${
        isDark 
          ? 'bg-orange-600 text-white border-l-4 border-orange-400 shadow-inner font-semibold' 
          : 'bg-orange-500 text-white border-l-4 border-orange-600 shadow-sm font-semibold'
      }`;
    }
    
    return `${baseClasses} ${
      isDark 
        ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
    }`;
  };

  // Submenu icon
  const getSubmenuIcon = (isActive, isDark) => {
    if (isActive) {
      return isDark 
        ? <FaDotCircle className="w-3 h-3 text-white" />
        : <FaDotCircle className="w-3 h-3 text-white" />;
    }
    return isDark 
      ? <FaRegCircle className="w-2.5 h-2.5 text-gray-400" />
      : <FaRegCircle className="w-2.5 h-2.5 text-gray-400" />;
  };

  const sidebarBg = isDark 
    ? 'bg-gradient-to-b from-gray-900 via-gray-800 to-gray-800' 
    : 'bg-gradient-to-b from-white via-gray-50 to-white';

  const UserProfile = () => (
    <div className={`p-4 border-b sticky top-0 z-10 ${
      isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <FaUserCircle className={`w-10 h-10 ${isDark ? 'text-orange-400' : 'text-orange-500'}`} />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold truncate ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {user?.name || 'User'}
              </p>
              <p className={`text-xs truncate capitalize ${
                isDark ? 'text-orange-300' : 'text-orange-600'
              }`}>
                {user?.role || 'Role'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // EnhancedSubMenu
  const EnhancedSubMenu = ({ item }) => {
    const hasActiveChild = item.children?.some(child => isActive(child.path));
    const isMenuOpen = openMenus[item.key];
    
    if (collapsed) {
      return (
        <MenuItem
          key={item.key}
          icon={item.icon}
          className={menuItemClass(hasActiveChild)}
        >
          {/* Empty content when collapsed */}
        </MenuItem>
      );
    }

    return (
      <SubMenu
        key={item.key}
        label={item.label}
        icon={item.icon}
        className={`
          transition-all duration-300 font-medium rounded-lg mx-2 my-1
          ${isMenuOpen 
            ? (isDark 
                ? 'bg-orange-500 text-white hover:bg-orange-600 border-l-4 border-orange-400' 
                : 'bg-orange-500 text-white hover:bg-orange-600 border-l-4 border-orange-600'
              )
            : (hasActiveChild
                ? (isDark 
                    ? 'bg-orange-600 text-white' 
                    : 'bg-orange-600 text-white'
                  )
                : (isDark 
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  )
              )
          }
        `}
        open={isMenuOpen}
        onOpenChange={() => handleToggle(item.key)}
      >
        {item.children.map((child) => {
          const childIsActive = isActive(child.path);
          return (
            <MenuItem
              key={child.key}
              component={<Link to={child.path} />}
              className={subMenuItemClass(childIsActive)}
              active={childIsActive}
              icon={getSubmenuIcon(childIsActive, isDark)}
            >
              {child.label}
            </MenuItem>
          );
        })}
      </SubMenu>
    );
  };

  const renderMenuItem = (item, level = 0) => {
    if (level > 1) return null;

    // Get the path - either static or dynamic
    const itemPath = item.getPath ? item.getPath() : item.path;

    if (itemPath) {
      return (
        <MenuItem
          key={item.key}
          icon={level === 0 ? item.icon : <FaRegCircle className="w-3 h-3" />}
          component={<Link to={itemPath} />}
          className={menuItemClass(isActive(itemPath))}
          active={isActive(itemPath)}
        >
          {!collapsed && item.label}
        </MenuItem>
      );
    }

    if (item.children && level === 0) {
      return <EnhancedSubMenu key={item.key} item={item} />;
    }

    return null;
  };

  return (
    <div className="h-screen flex flex-col">
      <Sidebar 
        collapsed={collapsed} 
        className={`h-full border-0 ${sidebarBg} shadow-2xl relative flex flex-col`}
        rootStyles={{
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column'
        }}
        width="280px"
        collapsedWidth="80px"
      >
        {/* Fixed User Profile Section */}
        <div className="flex-shrink-0">
          <UserProfile />
        </div>

        {/* Scrollable Navigation Items */}
        <div className="flex-1 flex flex-col min-h-0">
          <Menu 
            className={`${sidebarBg} flex-1 overflow-hidden`}
            menuItemStyles={{
              button: ({ level }) => ({
                padding: level === 0 ? '12px 16px' : '8px 12px',
                margin: level === 0 ? '2px 8px' : '1px 8px',
                borderRadius: '4px',
              }),
            }}
          >
            {/* Navigation Items Container with Scroll */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden max-h-[calc(100vh-200px)] custom-scrollbar">
              {accessibleItems.map((item) => renderMenuItem(item))}
            </div>

            {/* Fixed Footer Actions */}
            <div className={`border-t flex-shrink-0 mb-8 ${
              isDark ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <MenuItem
                icon={<FaCog className="w-5 h-5" />}
                component={<Link to="/app/settings" />}
                className={menuItemClass(isActive('/app/settings'))}
                active={isActive('/app/settings')}
              >
                {!collapsed && 'Settings'}
              </MenuItem>
              <MenuItem
                icon={<FaSignOutAlt className="w-5 h-5" />}
                onClick={handleLogout}
                className={`mx-2 my-1 rounded-lg transition-all duration-300 font-medium ${
                  isDark 
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {!collapsed && 'Logout'}
              </MenuItem>
            </div>
          </Menu>
        </div>
      </Sidebar>

      {/* Custom scrollbar styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${isDark ? '#374151' : '#f3f4f6'};
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${isDark ? '#f97316' : '#ea580c'};
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${isDark ? '#ea580c' : '#c2410c'};
        }
      `}</style>
    </div>
  );
};

const SidebarWrapper = ({ collapsed, onToggle }) => {
  const { theme } = useTheme();
  
  return (
    <div className="h-screen flex-shrink-0 sticky top-0">
      <SidebarMenu collapsed={collapsed} onToggle={onToggle} />
    </div>
  );
};

export default SidebarWrapper;