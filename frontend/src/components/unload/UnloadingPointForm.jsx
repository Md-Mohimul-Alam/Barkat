import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../shared/Topbar';
import SidebarWrapper from '../shared/Sidebar';
import Footer from '../shared/Footer';
import { useTheme } from '../../context/ThemeContext';
import unloadingPointService from '../../services/unloadingPointService';

const UnloadingPointForm = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: 'Port',
    location: '',
    address: '',
    city: '',
    state: '',
    country: 'Bangladesh',
    contactPerson: '',
    contactNumber: '',
    email: '',
    capacity: '',
    operatingHours: '',
    status: 'active',
    notes: ''
  });

  const fields = [
    { label: 'Name', name: 'name', type: 'text', required: true, colSpan: 'md:col-span-2' },
    { label: 'Type', name: 'type', type: 'select', required: true, options: ['Port', 'Storage', 'Vessel', 'Local', 'Factory', 'Warehouse', 'Distribution Center'] },
    { label: 'Location', name: 'location', type: 'text', required: true, colSpan: 'md:col-span-2' },
    { label: 'Address', name: 'address', type: 'textarea', required: false, colSpan: 'md:col-span-2' },
    { label: 'City', name: 'city', type: 'text', required: false },
    { label: 'State', name: 'state', type: 'text', required: false },
    { label: 'Country', name: 'country', type: 'text', required: true },
    { label: 'Contact Person', name: 'contactPerson', type: 'text', required: false, colSpan: 'md:col-span-2' },
    { label: 'Contact Number', name: 'contactNumber', type: 'tel', required: false },
    { label: 'Email', name: 'email', type: 'email', required: false },
    { label: 'Capacity', name: 'capacity', type: 'text', required: false },
    { label: 'Operating Hours', name: 'operatingHours', type: 'text', required: false },
    { label: 'Status', name: 'status', type: 'select', required: true, options: ['active', 'inactive', 'maintenance'] },
    { label: 'Notes', name: 'notes', type: 'textarea', required: false, colSpan: 'md:col-span-2' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: value 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await unloadingPointService.createUnloadingPoint(formData);
      if (response.success) {
        alert('Unloading point created successfully!');
        navigate('/app/unloading-points');
      }
    } catch (error) {
      console.error('Error creating unloading point:', error);
      alert(error.message || 'Failed to create unloading point');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-cyan-950 text-[#F1FAEE]' : 'bg-[#ffffff] text-gray-900'}`}>
      <SidebarWrapper collapsed={sidebarCollapsed} />
      <div className="flex-1 flex flex-col">
        <TopBar onToggleSidebar={() => setSidebarCollapsed(prev => !prev)} sidebarCollapsed={sidebarCollapsed} />
        
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Add Unloading Point</h1>
              <button
                onClick={() => navigate('/app/unloading-points/add')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  isDark
                    ? 'bg-gray-600 hover:bg-gray-700 text-white'
                    : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                }`}
              >
                ← Back to List
              </button>
            </div>

            <div className={`rounded-xl p-8 transition-all duration-300 ${
              isDark ? 'bg-sky-950 border border-[#457B9D]' : 'bg-white border border-gray-200 shadow-lg'
            }`}>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {fields.map(({ label, name, type, required, options, colSpan }) => (
                  <div key={name} className={colSpan || 'md:col-span-1'}>
                    <label className="block mb-2 font-medium">
                      {label}
                      {required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    
                    {type === 'select' ? (
                      <select
                        name={name}
                        value={formData[name]}
                        onChange={handleChange}
                        required={required}
                        className={`w-full rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2 transition-all duration-200 ${
                          isDark
                            ? 'bg-[#2C2C2C] border-[#457B9D] text-[#F1FAEE] focus:ring-[#f85924] focus:border-[#f85924]'
                            : 'bg-white border-gray-300 text-gray-800 focus:ring-[#f85924] focus:border-[#f85924]'
                        }`}
                      >
                        <option value="">Select {label}</option>
                        {options.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : type === 'textarea' ? (
                      <textarea
                        name={name}
                        value={formData[name]}
                        onChange={handleChange}
                        required={required}
                        rows={3}
                        className={`w-full rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2 transition-all duration-200 ${
                          isDark
                            ? 'bg-[#2C2C2C] border-[#457B9D] text-[#F1FAEE] placeholder-[#A8A8A8] focus:ring-[#f85924] focus:border-[#f85924]'
                            : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-[#f85924] focus:border-[#f85924]'
                        }`}
                        placeholder={`Enter ${label.toLowerCase()}`}
                      />
                    ) : (
                      <input
                        type={type}
                        name={name}
                        value={formData[name]}
                        onChange={handleChange}
                        required={required}
                        className={`w-full rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2 transition-all duration-200 ${
                          isDark
                            ? 'bg-[#2C2C2C] border-[#457B9D] text-[#F1FAEE] placeholder-[#A8A8A8] focus:ring-[#f85924] focus:border-[#f85924]'
                            : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-[#f85924] focus:border-[#f85924]'
                        }`}
                        placeholder={`Enter ${label.toLowerCase()}`}
                      />
                    )}
                  </div>
                ))}
                
                <div className="md:col-span-2 flex justify-center gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => navigate('/app/unloading-points')}
                    className={`px-8 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                      isDark
                        ? 'bg-gray-600 text-white hover:bg-gray-700'
                        : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-8 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                      isDark
                        ? 'bg-[#f85924] text-white hover:bg-[#d13602] shadow-lg'
                        : 'bg-[#f85924] text-white hover:bg-[#d13602] shadow-md'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {loading ? 'Creating...' : 'Create Unloading Point'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default UnloadingPointForm;