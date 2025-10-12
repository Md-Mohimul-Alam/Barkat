import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../shared/Topbar';
import SidebarWrapper from '../shared/Sidebar';
import Footer from '../shared/Footer';
import { useTheme } from '../../context/ThemeContext';

const LoadingPointForm = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    location: '',
  });

  const fields = [
    { label: 'Name', name: 'name', type: 'text' },
    { label: 'Type', name: 'type', type: 'text' },
    { label: 'Location', name: 'location', type: 'text' },
  ];

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Loading Point Submitted:', formData);
    navigate('/app/loading-points');
  };

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-cyan-950 text-[#F1FAEE]' : 'bg-[#ffffffaa] text-gray-900'}`}>
      <SidebarWrapper collapsed={sidebarCollapsed} />
      <div className="flex-1 flex flex-col">
        <TopBar onToggleSidebar={() => setSidebarCollapsed(prev => !prev)} sidebarCollapsed={sidebarCollapsed} />
        
        <div className="flex justify-center items-start px-4 py-10 overflow-auto">
          <div className={`w-full max-w-3xl shadow-lg rounded-xl p-8 transition-all duration-300 ${
            isDark ? 'bg-sky-950 border border-[#457B9D]' : 'bg-white border border-gray-200'
          }`}>
            <h2 className="text-2xl font-bold mb-6 text-center">Add Loading Point</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {fields.map(({ label, name, type }) => (
                <div key={name} className="flex flex-col">
                  <label className="mb-1 font-medium">{label}</label>
                  <input
                    type={type}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    required
                    className={`rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2 transition-all duration-200 ${
                      isDark
                        ? 'bg-[#2C2C2C] border-[#457B9D] text-[#F1FAEE] placeholder-[#A8A8A8] focus:ring-[#f85924] focus:border-[#f85924]'
                        : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-[#f85924] focus:border-[#f85924]'
                    }`}
                  />
                </div>
              ))}
              <div className="md:col-span-2 flex justify-center mt-4">
                <button
                  type="submit"
                  className={`px-8 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                    isDark
                      ? 'bg-[#f85924] text-white hover:bg-[#d13602] shadow-lg'
                      : 'bg-[#f85924] text-white hover:bg-[#d13602] shadow-md'
                  }`}
                >
                  Submit
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

export default LoadingPointForm;