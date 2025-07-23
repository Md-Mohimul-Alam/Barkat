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

const SidebarMenu = ({ collapsed }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [openIndex, setOpenIndex] = useState(null);

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const menuItems = [
    {
      label: 'Branch Management',
      icon: <FaBuilding />,
      children: [
        { label: 'View Branches', path: '/app/branches' },
        { label: 'Add Branch', path: '/app/branches/add' },
      ],
    },
    {
      label: 'Client Management',
      icon: <FaUsers />,
      children: [
        { label: 'Clients', path: '/app/clients' },
        { label: 'Add Client', path: '/app/clients/add' },
      ],
    },
    {
      label: 'CNF Management',
      icon: <FaUsers />,
      children: [
        { label: 'CNF List', path: '/app/cnfs' },
        { label: 'Add CNF', path: '/app/cnfs/add' },
      ],
    },
    {
      label: 'Employee Management',
      icon: <FaUserShield />,
      children: [
        { label: 'Employees', path: '/app/employees' },
        { label: 'Add Employee', path: '/app/employees/add' },
      ],
    },
    {
      label: 'Loading-Point Management',
      icon: <FaRoad />,
      children: [
        { label: 'Loading Point List', path: '/app/loading-points/list' },
        { label: 'Add Loading Point', path: '/app/loading-points/add' },
      ],
    },
    {
      label: 'Vehicle Management',
      icon: <FaTruck />,
      children: [
        { label: 'Vehicles', path: '/vehicles' },
        { label: 'Add Vehicle', path: '/vehicles/add' },
      ],
    },
    
    {
      label: 'Bank Module',
      icon: <FaFileInvoiceDollar />,
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
      children: [
        { label: 'All Dues', path: '/app/dues' },
        { label: 'Due Reports', path: '/app/dues/reports' },
      ],
    },
    {
      label: 'Orders',
      icon: <MdExpandMore />,
      children: [
        { label: 'All Orders', path: '/orders' },
        { label: 'Create Order', path: '/orders/create' },
      ],
    },
    {
      label: 'Dashboard & Reports',
      icon: <FaChartLine />,
      children: [
        { label: 'Main Dashboard', path: '/dashboard' },
        { label: 'Yearly Outcome', path: '/reports/yearly' },
      ],
    },
    {
      label: 'Notifications',
      icon: <FaBell />,
      children: [
        { label: 'Alerts', path: '/notifications/alerts' },
        { label: 'Reminders', path: '/notifications/reminders' },
      ],
    },
    {
      label: 'Maintenance Logs',
      icon: <FaWrench />,
      children: [
        { label: 'Service Logs', path: '/maintenance/logs' },
        { label: 'Upcoming Services', path: '/maintenance/upcoming' },
      ],
    },
    {
      label: 'Calculator',
      icon: <FaCalculator />,
      children: [
        { label: 'Estimate', path: '/app/calculator/CalculatorPage' },      ],
    },
  ];

  const itemClass = (index) => `
    text-sm font-medium px-1 py-2 transition duration-150 ease-in-out
    ${isDark
      ? openIndex === index
        ? 'bg-mbts-blue text-white hover:text-mbts-blue focus:text-white'
        : 'text-white hover:text-mbts-blue'
      : openIndex === index
        ? 'bg-white text-mbts-blue'
        : 'text-mbts-blue hover:bg-transparent hover:text-mbts-dark'
    }
  `;

  const subItemClass = `
    text-sm px-5 pl-6 pr-3 py-1 transition duration-150 ease-in-out
    ${isDark
      ? 'bg-mbts-blue text-white hover:text-mbts-blue'
      : 'text-mbts-blue hover:bg-transparent hover:text-mbts-dark'
    }
  `;

  const sidebarBg = isDark ? 'bg-mbts-blue' : 'bg-white';

  return (
    <Sidebar collapsed={collapsed} className={`h-full mt-12 mb-12 pb-12 bottom-12 ${sidebarBg}`}>
      <Menu className={`h-full ${sidebarBg}`}>
        {menuItems.map((item, i) =>
            collapsed ? (
            // Collapsed view — just top-level icons (disable toggle)
            <MenuItem
                key={i}
                icon={item.icon}
                className={itemClass(i)}
                title={item.label} // Tooltip on hover
            />
            ) : (
            // Expanded view — full SubMenu with children
            <SubMenu
                key={i}
                label={item.label}
                icon={item.icon}
                className={itemClass(i)}
                onOpenChange={() => handleToggle(i)}
                defaultOpen={false}
            >
                {item.children.map((child, j) => (
                <MenuItem
                    key={j}
                    icon={child.icon}
                    component={<Link to={child.path} />}
                    className={subItemClass}
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
    ? 'bg-mbts-blue text-mbts-light'
    : 'bg-white text-mbts-dark';

  return (
    <div className={`h-screen ${wrapperClass}`}>
      <SidebarMenu collapsed={collapsed} />
    </div>
  );
};

export default SidebarWrapper;
