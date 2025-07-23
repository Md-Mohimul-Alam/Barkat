// Placeholder for roles/RoleForm.jsx
// components/roles/RoleForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import TopBar from '../shared/Topbar';
import SidebarWrapper from '../shared/Sidebar';
import Footer from '../shared/Footer';

const RoleForm = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  const [formData, setFormData] = useState({
    roleName: '',
    description: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Role form submitted:', formData);
    navigate('/app/roles');
  };

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-mbts-blue text-white' : 'bg-gray-100 text-gray-900'}`}>
      <SidebarWrapper collapsed={sidebarCollapsed} />
      <div className="flex-1 flex flex-col">
        <TopBar onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)} sidebarCollapsed={sidebarCollapsed} />

        <div className="flex justify-center items-start px-4 py-10 overflow-auto">
          <div className={`w-full max-w-2xl shadow-lg rounded-xl p-8 transition-all duration-300 ${isDark ? 'bg-[#1c2a3a] border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <h2 className="text-2xl font-bold mb-6 text-center">Create New Role</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block font-medium mb-1">Role Name</label>
                <input
                  type="text"
                  name="roleName"
                  value={formData.roleName}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2 rounded border text-sm focus:ring-2 ${isDark ? 'bg-mbts-dark border-gray-600 text-white placeholder-gray-400 focus:ring-mbts-orange' : 'bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-blue-400'}`}
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className={`w-full px-4 py-2 rounded border text-sm focus:ring-2 ${isDark ? 'bg-mbts-dark border-gray-600 text-white placeholder-gray-400 focus:ring-mbts-orange' : 'bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-blue-400'}`}
                />
              </div>

              <div className="flex justify-center">
                <button
                  type="submit"
                  className={`px-6 py-2 rounded font-medium text-sm transition-all ${isDark ? 'bg-mbts-orange text-white hover:bg-mbts-orangeHover' : 'bg-mbts-orange text-white hover:bg-mbts-orangeHover'}`}
                >
                  Save Role
                </button>
              </div>
            </form>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default RoleForm;
