// Placeholder for roles/AccessMatrix.jsx
// components/roles/AccessMatrix.jsx
import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import TopBar from '../shared/Topbar';
import SidebarWrapper from '../shared/Sidebar';
import Footer from '../shared/Footer';

const AccessMatrix = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  const modules = ['Dashboard', 'Users', 'Settings', 'Reports'];
  const roles = ['Admin', 'Manager', 'Employee'];

  const [permissions, setPermissions] = useState(() =>
    roles.reduce((acc, role) => {
      acc[role] = {};
      modules.forEach((mod) => (acc[role][mod] = false));
      return acc;
    }, {})
  );

  const togglePermission = (role, module) => {
    setPermissions((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [module]: !prev[role][module],
      },
    }));
  };

  const handleSave = () => {
    console.log('Access matrix saved:', permissions);
  };

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-mbts-blue text-white' : 'bg-gray-100 text-gray-900'}`}>
      <SidebarWrapper collapsed={sidebarCollapsed} />
      <div className="flex-1 flex flex-col">
        <TopBar onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)} sidebarCollapsed={sidebarCollapsed} />

        <div className="px-4 py-10 flex flex-col items-center overflow-auto">
          <div className={`w-full max-w-5xl p-6 rounded-xl shadow-lg ${isDark ? 'bg-[#1c2a3a] border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <h2 className="text-2xl font-bold text-center mb-6">Role Access Matrix</h2>

            <table className="w-full table-auto text-sm border-collapse">
              <thead>
                <tr>
                  <th className="border px-4 py-2 text-left">Role \ Module</th>
                  {modules.map((mod) => (
                    <th key={mod} className="border px-4 py-2 text-center">{mod}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {roles.map((role) => (
                  <tr key={role}>
                    <td className="border px-4 py-2 font-medium">{role}</td>
                    {modules.map((mod) => (
                      <td key={mod} className="border px-4 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={permissions[role][mod]}
                          onChange={() => togglePermission(role, mod)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-center mt-6">
              <button
                onClick={handleSave}
                className={`px-6 py-2 rounded font-medium text-sm transition-all ${isDark ? 'bg-mbts-orange text-white hover:bg-mbts-orangeHover' : 'bg-mbts-orange text-white hover:bg-mbts-orangeHover'}`}
              >
                Save Matrix
              </button>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default AccessMatrix;
