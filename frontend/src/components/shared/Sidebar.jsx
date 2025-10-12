import React, { useState } from 'react';
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
} from 'react-icons/fa';
import { MdExpandMore } from 'react-icons/md';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const SidebarMenu = ({ collapsed }) => {
  const { theme } = useTheme();
  const { user } = useAuth(); // Get logged-in user
  const isDark = theme === 'dark';

  const [openIndex, setOpenIndex] = useState(null);

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const menuItems = [
    {
      label: 'Branch Management',
      icon: <FaBuilding />,
      allowedRoles: ['admin'],
      children: [
        { label: 'View Branches', path: '/app/branches' },
        { label: 'Add Branch', path: '/app/branches/add' },
      ],
    },
    {
      label: 'Client Management',
      icon: <FaUsers />,
      allowedRoles: ['admin', 'manager'],
      children: [
        { label: 'Clients', path: '/app/clients' },
        { label: 'Add Client', path: '/app/clients/add' },
      ],
    },
    {
      label: 'CNF Management',
      icon: <FaUsers />,
      allowedRoles: ['admin'],
      children: [
        { label: 'CNF List', path: '/app/cnfs' },
        { label: 'Add CNF', path: '/app/cnfs/add' },
      ],
    },
    {
      label: 'Employee Management',
      icon: <FaUserShield />,
      allowedRoles: ['admin'],
      children: [
        { label: 'Employees', path: '/app/employees' },
        { label: 'Add Employee', path: '/app/employees/add' },
      ],
    },
    {
      label: 'Loading-Point Management',
      icon: <FaRoad />,
      allowedRoles: ['admin', 'manager'],
      children: [
        { label: 'Loading Point List', path: '/app/loading-points/list' },
        { label: 'Add Loading Point', path: '/app/loading-points/add' },
      ],
    },
    {
      label: 'Vehicle Management',
      icon: <FaTruck />,
      allowedRoles: ['admin', 'manager'],
      children: [
        { label: 'Vehicles', path: '/vehicles' },
        { label: 'Add Vehicle', path: '/vehicles/add' },
      ],
    },
    {
      label: 'Bank Module',
      icon: <FaFileInvoiceDollar />,
      allowedRoles: ['admin'],
      children: [
        { label: 'ADD Bank', path: '/app/banks/add' },
        { label: 'Statements Download', path: '/app/banks/statements' },
        { label: 'ADD Transactions', path: '/app/banks/transactions/add' },
        { label: 'Bank Transactions', path: '/app/banks/transactions/list' },
      ],
    },
    {
      label: 'Due Tracking',
      icon: <FaTasks />,
      allowedRoles: ['admin', 'manager'],
      children: [
        { label: 'All Dues', path: '/app/dues' },
        { label: 'Due Reports', path: '/app/dues/reports' },
      ],
    },
    {
      label: 'Calculator',
      icon: <FaCalculator />,
      allowedRoles: ['admin'],
      children: [
        { label: 'Estimate', path: '/app/calculator/CalculatorPage' },
      ],
    },
    {
      label: 'Orders',
      icon: <MdExpandMore />,
      allowedRoles: ['admin', 'manager'],
      children: [
        { label: 'All Orders', path: '/orders' },
        { label: 'Create Order', path: '/orders/create' },
      ],
    },
    {
      label: 'Dashboard & Reports',
      icon: <FaChartLine />,
      allowedRoles: ['admin', 'manager', 'employee'],
      children: [
        { label: 'Main Dashboard', path: '/dashboard' },
        { label: 'Yearly Outcome', path: '/reports/yearly' },
      ],
    },
    {
      label: 'Notifications',
      icon: <FaBell />,
      allowedRoles: ['admin', 'manager'],
      children: [
        { label: 'Alerts', path: '/notifications/alerts' },
        { label: 'Reminders', path: '/notifications/reminders' },
      ],
    },
    {
      label: 'Maintenance Logs',
      icon: <FaWrench />,
      allowedRoles: ['admin', 'manager'],
      children: [
        { label: 'Service Logs', path: '/maintenance/logs' },
        { label: 'Upcoming Services', path: '/maintenance/upcoming' },
      ],
    },
  ];

  // Filter menu based on user role
  const accessibleItems = menuItems.filter(
    (item) => !item.allowedRoles || item.allowedRoles.includes(user?.role)
  );

  const itemClass = (index) => `
    text-sm font-medium px-2 py-2 transition duration-150 ease-in-out rounded-md
    ${isDark
      ? openIndex === index
        ? 'bg-cyan-950 text-white hover:bg-cyan-950 hover:text-black focus:text-black rounded-md'
        : 'bg-transparent text-white hover:bg-cyan-950 hover:text-black focus:text-black rounded-md'
      : openIndex === index
        ? 'bg-white text-Black hover:bg-gray-100 hover:text-cyan-950 focus:text-cyan-950 rounded-md'
        : 'bg-transparent text-cyan-950 hover:bg-gray-100 hover:text-black focus:text-black rounded-md'
    }
  `;

  const subItemClass = `
    text-sm px-5 pl-6 py-1 transition duration-150 ease-in-out rounded-md
    ${isDark
      ? 'bg-cyan-950 text-cyan-950 hover:bg-white hover:text-cyan-950 focus:text-cyan-950 rounded-md'
      : 'bg-white text-cyan-950 hover:bg-gray-100 hover:text-black focus:text-black rounded-md'
    }
  `;

  const sidebarBg = isDark ? 'bg-cyan-950' : 'bg-white';

  return (
    <Sidebar collapsed={collapsed} className={`h-full absolute m-0 border-r-0 top-16 mb-12 pb-12 bottom-12 bg-transparent ${sidebarBg}`}>
      <Menu className={`h-230 ${sidebarBg}`}>
        <div className="p-4">
          Welcome
        </div>
        {accessibleItems.map((item, i) =>
          collapsed ? (
            <MenuItem
              key={i}
              icon={item.icon}
              className={itemClass(i)}
              title={item.label}
            />
          ) : (
            <SubMenu
              key={i}
              label={item.label}
              icon={item.icon}
              className={itemClass(i)}
              onOpenChange={() => handleToggle(i)}
              open={openIndex === i}
            >
              {item.children.map((child, j) => (
                <MenuItem
                  key={j}
                  component={<Link to={child.path} />}
                  className={`${subItemClass} bg-transparent rounded-md`}
                >
                  {child.label}
                </MenuItem>
              ))}
            </SubMenu>
          )
        )}
      </Menu>
    </Sidebar>
  );
};

const SidebarWrapper = ({ collapsed }) => {
  const { theme } = useTheme();
  const wrapperClass = theme === 'dark'
    ? 'bg-cyan-950 text-white m-0 border-r-3 border-r-orange-700 m-0'
    : 'bg-white text-black m-0 border-r-3 border-r-orange-700 m-0';

  return (
    <div className={`h-screen m-0 border-r-0 ${wrapperClass}`}>
      <SidebarMenu collapsed={collapsed} />
    </div>
  );
};

export default SidebarWrapper;
