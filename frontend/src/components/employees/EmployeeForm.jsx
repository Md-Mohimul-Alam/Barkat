import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import TopBar from '../shared/Topbar';
import SidebarWrapper from '../shared/Sidebar';
import Footer from '../shared/Footer';

const EmployeeForm = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    position: '',
    contact: '',
    email: '',
    joinedAt: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Employee Submitted:', formData);
    navigate('/app/employees');
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
            <h2 className="text-2xl font-bold mb-6 text-center">Add New Employee</h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: 'Name', name: 'name', type: 'text' },
                { label: 'Position', name: 'position', type: 'text' },
                { label: 'Contact', name: 'contact', type: 'tel', pattern: '[0-9]{10,15}', placeholder: 'e.g., 01712345678' },
                { label: 'Email', name: 'email', type: 'email' },
                { label: 'Joined At', name: 'joinedAt', type: 'date' }
              ].map((field) => (
                <div key={field.name} className="flex flex-col">
                  <label htmlFor={field.name} className="mb-1 font-medium">
                    {field.label}
                  </label>
                  <input
                    id={field.name}
                    name={field.name}
                    type={field.type}
                    pattern={field.pattern}
                    placeholder={field.placeholder}
                    value={formData[field.name]}
                    onChange={handleChange}
                    required
                    className={`rounded border px-4 py-2 text-sm outline-none focus:ring-2 transition ${
                      isDark
                        ? 'bg-mbts-dark border-gray-600 text-white focus:ring-mbts-orange'
                        : 'bg-gray-50 border-gray-300 text-gray-800 focus:ring-blue-400'
                    }`}
                  />
                </div>
              ))}

              {/* Full-width submit button */}
              <div className="md:col-span-2 flex justify-center mt-4">
                <button
                  type="submit"
                  className={`px-8 py-2 rounded font-medium text-sm transition-all duration-200 ${
                    isDark
                      ? 'bg-mbts-orange text-white hover:bg-mbts-orangeHover'
                      : 'bg-mbts-orange text-white hover:bg-mbts-orangeHover'
                  }`}
                >
                  Save Employee
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

export default EmployeeForm;
