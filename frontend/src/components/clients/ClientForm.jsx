import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import TopBar from '../shared/Topbar';
import SidebarWrapper from '../shared/Sidebar';
import Footer from '../shared/Footer';

const ClientForm = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    manager: '',
    contact: '',
    email: '',
    address: '',
    establishedAt: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Client form submitted:', formData);
    navigate('/app/clients');
  };

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-cyan-950 text-[#ffffff]' : 'bg-[#ffffff] text-gray-900'}`}>
      <SidebarWrapper collapsed={sidebarCollapsed} />
      <div className="flex-1 flex flex-col">
        <TopBar
          onToggleSidebar={() => setSidebarCollapsed(prev => !prev)}
          sidebarCollapsed={sidebarCollapsed}
        />
        <div className="flex justify-center items-start px-4 py-10 overflow-auto">
          <div className={`w-full max-w-3xl shadow-lg rounded-xl p-8 transition-all duration-300
            ${isDark ? 'bg-sky-950 border border-[#457B9D]' : 'bg-white border border-gray-200'}`}>
            <h2 className="text-2xl font-bold mb-6 text-center">Add New Client</h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { id: 'name', label: 'Client Name', type: 'text' },
                { id: 'manager', label: 'Manager', type: 'text' },
                { id: 'contact', label: 'Contact', type: 'tel', placeholder: 'e.g., 01712345678', pattern: '[0-9]{10,15}' },
                { id: 'email', label: 'Email (optional)', type: 'email', placeholder: 'e.g., client@email.com' },
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
                    required={id !== 'email'}
                    className={`rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2 transition-all duration-200
                      ${isDark
                        ? 'bg-[#2C2C2C] border-[#457B9D] text-[#ffffff] placeholder-[#A8A8A8] focus:ring-[#f85924] focus:border-[#f85924]'
                        : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-[#f85924] focus:border-[#f85924]'}`}
                  />
                </div>
              ))}

              <div className="md:col-span-2 flex justify-center mt-4">
                <button
                  type="submit"
                  className={`px-8 py-3 rounded-lg font-medium text-sm transition-all duration-200
                    ${isDark
                      ? 'bg-[#f85924] text-white hover:bg-[#d13602] shadow-lg'
                      : 'bg-[#f85924] text-white hover:bg-[#d13602] shadow-md'}`}
                >
                  Save Client
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

export default ClientForm;