import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import TopBar from '../shared/Topbar';
import SidebarWrapper from '../shared/Sidebar';
import Footer from '../shared/Footer';
import { createClient } from '../../services/clientService';
import { toast } from 'react-toastify';

const ClientForm = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    manager: '',
    contact: '',
    email: '',
    address: '',
    establishedAt: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Client name is required';
    if (!formData.manager.trim()) newErrors.manager = 'Manager name is required';
    if (!formData.contact.trim()) newErrors.contact = 'Contact number is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.establishedAt) newErrors.establishedAt = 'Establishment date is required';

    // Contact validation
    const contactRegex = /^[0-9]{10,15}$/;
    if (formData.contact && !contactRegex.test(formData.contact)) {
      newErrors.contact = 'Contact must be 10-15 digits';
    }

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    setLoading(true);
    try {
      await createClient(formData);
      toast.success('Client created successfully!');
      navigate('/app/clients');
    } catch (error) {
      console.error('Error creating client:', error);
      toast.error(error.message || 'Failed to create client');
    } finally {
      setLoading(false);
    }
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
            
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Add New Client</h2>
              <button
                onClick={() => navigate('/app/clients')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
                  ${isDark
                    ? 'bg-gray-600 text-white hover:bg-gray-700'
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'}`}
              >
                ← Back to Clients
              </button>
            </div>

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
                      ${errors[id] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                      ${isDark
                        ? 'bg-[#2C2C2C] border-[#457B9D] text-[#ffffff] placeholder-[#A8A8A8] focus:ring-[#f85924] focus:border-[#f85924]'
                        : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-[#f85924] focus:border-[#f85924]'}`}
                  />
                  {errors[id] && (
                    <p className="text-red-500 text-xs mt-1">{errors[id]}</p>
                  )}
                </div>
              ))}

              <div className="md:col-span-2 flex justify-center gap-4 mt-4">
                <button
                  type="button"
                  onClick={() => navigate('/app/clients')}
                  className={`px-8 py-3 rounded-lg font-medium text-sm transition-all duration-200
                    ${isDark
                      ? 'bg-gray-600 text-white hover:bg-gray-700'
                      : 'bg-gray-300 text-gray-700 hover:bg-gray-400'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-8 py-3 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2
                    ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                    ${isDark
                      ? 'bg-[#f85924] text-white hover:bg-[#d13602] shadow-lg'
                      : 'bg-[#f85924] text-white hover:bg-[#d13602] shadow-md'}`}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    'Save Client'
                  )}
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