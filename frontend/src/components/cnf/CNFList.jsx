// Placeholder for cnf/CNFList.jsx
// src/components/cnf/CNFList.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import TopBar from '../shared/Topbar';
import SidebarWrapper from '../shared/Sidebar';
import Footer from '../shared/Footer';
const initialCNFs = [
  { id: 1, name: 'Unico', contact: '01711000000', address: 'Dhaka', establishedAt: '2021-01-01' },
  { id: 2, name: 'Sheba Shipping', contact: '01712000000', address: 'Chittagong', establishedAt: '2022-03-15' },
  { id: 3, name: 'Sheikh Shipping', contact: '01713000000', address: 'Khulna', establishedAt: '2020-08-10' },
];

const CNFList = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [cnfs, setCnfs] = useState(initialCNFs);

  const handleDateChange = (id, newDate) => {
    setCnfs(prev =>
      prev.map(cnf =>
        cnf.id === id ? { ...cnf, establishedAt: newDate } : cnf
      )
    );
  };

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-mbts-blue text-white' : 'bg-gray-100 text-gray-900'}`}>
      <SidebarWrapper collapsed={sidebarCollapsed}  />
      <div className="flex-1 flex flex-col">
        <TopBar onToggleSidebar={() => setSidebarCollapsed(prev => !prev)} sidebarCollapsed={sidebarCollapsed} />

        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-semibold">CNF List</h1>
            <Link
              to="/app/cnfs/add"
              className={`px-4 py-2 rounded font-medium ${
                isDark ? 'bg-mbts-orange hover:bg-mbts-orangeHover text-white' : 'bg-mbts-orange hover:bg-mbts-orangeHover text-white'
              }`}
            >
              + Add CNF
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className={`${isDark ? 'bg-mbts-dark text-white' : 'bg-gray-100 text-gray-700'}`}>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Contact</th>
                  <th className="p-3 text-left">Address</th>
                  <th className="p-3 text-left">Established At</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cnfs.map(cnf => (
                  <tr key={cnf.id} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <td className="p-3">{cnf.name}</td>
                    <td className="p-3">{cnf.contact}</td>
                    <td className="p-3">{cnf.address}</td>
                    <td className="p-3">
                      <input
                        type="date"
                        value={cnf.establishedAt}
                        onChange={(e) => handleDateChange(cnf.id, e.target.value)}
                        className={`w-full px-2 py-1 rounded border text-sm ${isDark ? 'bg-mbts-dark text-white' : 'bg-gray-100 text-gray-700'}`}
                      />
                    </td>
                    <td className="p-3 text-center">
                      <Link
                        to={`/app/cnfs/edit/${cnf.id}`}
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

export default CNFList;
