// Placeholder for employees/EmployeeList.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import TopBar from '../shared/Topbar';
import SidebarWrapper from '../shared/Sidebar';
import Footer from '../shared/Footer';

const initialEmployees = [
  { id: 1, name: 'Mohim Reza', position: 'Developer', contact: '01712345678', email: 'mohim@example.com', joinedAt: '2022-05-10' },
  { id: 2, name: 'Tanvir Hasan', position: 'Designer', contact: '01898765432', email: 'tanvir@example.com', joinedAt: '2023-01-15' }
];

const EmployeeList = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [employees, setEmployees] = useState(initialEmployees);

  const handleDateChange = (id, newDate) => {
    setEmployees(prev =>
      prev.map(emp =>
        emp.id === id ? { ...emp, joinedAt: newDate } : emp
      )
    );
  };

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-mbts-blue text-white' : 'bg-gray-50 text-gray-900'}`}>
      <SidebarWrapper collapsed={sidebarCollapsed} />
      <div className="flex-1 flex flex-col">
        <TopBar onToggleSidebar={() => setSidebarCollapsed(prev => !prev)} sidebarCollapsed={sidebarCollapsed} />

        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-semibold">Employee List</h1>
            <Link
              to="/app/employees/add"
              className={`px-4 py-2 rounded font-medium ${
                isDark ? 'bg-mbts-orange hover:bg-mbts-orangeHover text-white' : 'bg-mbts-orange hover:bg-mbts-orangeHover text-white'
              }`}
            >
              + Add Employee
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className={`${isDark ? 'bg-mbts-dark text-white' : 'bg-gray-100 text-gray-700'}`}>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Position</th>
                  <th className="p-3 text-left">Contact</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Joined At</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp.id} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <td className="p-3">{emp.name}</td>
                    <td className="p-3">{emp.position}</td>
                    <td className="p-3">{emp.contact}</td>
                    <td className="p-3">{emp.email}</td>
                    <td className="p-3">
                      <input
                        type="date"
                        value={emp.joinedAt}
                        onChange={(e) => handleDateChange(emp.id, e.target.value)}
                        className={`w-full rounded border px-2 py-1 text-sm ${isDark ? 'bg-mbts-dark text-white' : 'bg-gray-100 text-gray-700'}`}
                      />
                    </td>
                    <td className="p-3 text-center">
                      <Link
                        to={`/app/employees/edit/${emp.id}`}
                        className={`text-sm underline ${isDark ? 'text-mbts-orange' : 'text-blue-600'}`}
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
        <Footer />
      </div>
    </div>
  );
};

export default EmployeeList;
