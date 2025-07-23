// Placeholder for cnf/CNFForm.jsx
// src/components/cnf/CNFForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import TopBar from '../shared/Topbar';
import SidebarWrapper from '../shared/Sidebar';
import Footer from '../shared/Footer';
const CNFForm = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    address: '',
    establishedAt: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('CNF form submitted:', formData);
    navigate('/app/cnfs');
  };

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-mbts-blue text-white' : 'bg-gray-100 text-gray-900'}`}>
      <SidebarWrapper collapsed={sidebarCollapsed} />
      <div className="flex-1 flex flex-col">
        <TopBar onToggleSidebar={() => setSidebarCollapsed(prev => !prev)} sidebarCollapsed={sidebarCollapsed} />

        <div className="flex justify-center items-start px-4 py-10 overflow-auto">
          <div className={`w-full max-w-3xl shadow-lg rounded-xl p-8 transition-all duration-300
            ${isDark ? 'bg-[#1c2a3a] border border-gray-700' : 'bg-white border border-gray-200'}
          `}>
            <h2 className="text-2xl font-bold mb-6 text-center">Add New CNF</h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { id: 'name', label: 'CNF Name', type: 'text' },
                { id: 'contact', label: 'Contact', type: 'tel', placeholder: 'e.g., 01712345678', pattern: '[0-9]{10,15}' },
                { id: 'address', label: 'Address', type: 'text' },
                { id: 'establishedAt', label: 'Established At', type: 'date' },
              ].map(({ id, label, type, placeholder, pattern }) => (
                <div key={id} className="flex flex-col">
                  <label htmlFor={id} className="mb-1 font-medium">{label}</label>
                  <input
                    id={id}
                    name={id}
                    type={type}
                    placeholder={placeholder}
                    pattern={pattern}
                    value={formData[id]}
                    onChange={handleChange}
                    required
                    className={`rounded border px-4 py-2 text-sm outline-none focus:ring-2 transition ${
                      isDark
                        ? 'bg-mbts-dark border-gray-600 text-white placeholder-gray-400 focus:ring-mbts-orange'
                        : 'bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-blue-400'
                    }`}
                  />
                </div>
              ))}

              <div className="md:col-span-2 flex justify-center mt-4">
                <button
                  type="submit"
                  className={`px-8 py-2 rounded font-medium text-sm transition-all duration-200 ${
                    isDark
                      ? 'bg-mbts-orange text-white hover:bg-mbts-orangeHover'
                      : 'bg-mbts-orange text-white hover:bg-mbts-orangeHover'
                  }`}
                >
                  ADD CNF
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

export default CNFForm;
