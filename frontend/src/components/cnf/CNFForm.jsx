import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import TopBar from '../shared/Topbar';
import SidebarWrapper from '../shared/Sidebar';
import Footer from '../shared/Footer';
import cnfService from '../../services/cnfService';
import { notifySuccess, notifyError } from '../../pages/UI/Toast';
import { FaExclamationTriangle, FaBuilding, FaPhone, FaMapMarker, FaCalendar, FaSave, FaTimes, FaSpinner } from 'react-icons/fa';

const CNFForm = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    address: '',
    establishedAt: '',
  });

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

    // Required fields validation
    if (!formData.name.trim()) newErrors.name = 'CNF name is required';
    if (!formData.contact.trim()) newErrors.contact = 'Contact number is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.establishedAt) newErrors.establishedAt = 'Establishment date is required';

    // Contact validation
    const contactRegex = /^[0-9]{10,15}$/;
    if (formData.contact && !contactRegex.test(formData.contact)) {
      newErrors.contact = 'Contact must be 10-15 digits';
    }

    // Date validation
    const today = new Date();
    const establishedDate = new Date(formData.establishedAt);

    if (formData.establishedAt && establishedDate > today) {
      newErrors.establishedAt = 'Establishment date cannot be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      notifyError('Please fix the form errors');
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      console.log('CNF form submitted:', formData);
      
      const response = await cnfService.createCNF(formData);
      
      if (response.success) {
        notifySuccess('CNF created successfully!');
        navigate('/app/cnfs');
      } else {
        setErrors({ submit: response.message });
        notifyError(response.message || 'Failed to create CNF');
      }
    } catch (error) {
      console.error('Error creating CNF:', error);
      setErrors({ submit: error.message });
      notifyError(error.message || 'Failed to create CNF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/app/cnfs');
  };

  // Field component with error handling
  const FormField = ({ label, name, type = 'text', placeholder, required = false, value, onChange, error }) => (
    <div className="flex flex-col">
      <label htmlFor={name} className="mb-1 font-medium flex items-center">
        {name === 'name' && <FaBuilding className="w-4 h-4 mr-2 text-gray-400" />}
        {name === 'contact' && <FaPhone className="w-4 h-4 mr-2 text-gray-400" />}
        {name === 'address' && <FaMapMarker className="w-4 h-4 mr-2 text-gray-400" />}
        {name === 'establishedAt' && <FaCalendar className="w-4 h-4 mr-2 text-gray-400" />}
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          disabled={loading}
          rows="3"
          className={`rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2 transition-all duration-200 resize-vertical ${
            error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
          } ${
            isDark
              ? 'bg-[#2C2C2C] border-[#457B9D] text-[#ffffff] placeholder-[#A8A8A8] focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
              : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
          }`}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          disabled={loading}
          className={`rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2 transition-all duration-200 ${
            error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
          } ${
            isDark
              ? 'bg-[#2C2C2C] border-[#457B9D] text-[#ffffff] placeholder-[#A8A8A8] focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
              : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
          }`}
        />
      )}
      {error && (
        <p className="text-red-500 text-xs mt-1 flex items-center">
          <FaExclamationTriangle className="w-3 h-3 mr-1" />
          {error}
        </p>
      )}
    </div>
  );

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-cyan-950 text-[#ffffff]' : 'bg-[#ffffff] text-gray-900'}`}>
      <SidebarWrapper collapsed={sidebarCollapsed} />
      <div className="flex-1 flex flex-col">
        <TopBar onToggleSidebar={() => setSidebarCollapsed(prev => !prev)} sidebarCollapsed={sidebarCollapsed} />

        <div className="flex justify-center items-start px-4 py-10 overflow-auto">
          <div className={`w-full max-w-3xl shadow-lg rounded-xl p-8 transition-all duration-300
            ${isDark ? 'bg-sky-950 border border-[#457B9D]' : 'bg-white border border-gray-200'}
          `}>
            {/* Error Display */}
            {errors.submit && (
              <div className={`mb-6 p-4 rounded-xl border ${
                isDark 
                  ? 'bg-red-900/20 border-red-700 text-red-300' 
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                <div className="flex items-center">
                  <FaExclamationTriangle className="w-4 h-4 mr-2" />
                  {errors.submit}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Add New CNF</h2>
              <button
                onClick={handleCancel}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
                  ${isDark
                    ? 'bg-gray-600 text-white hover:bg-gray-700'
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'}`}
              >
                ← Back to CNFs
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="CNF Name"
                  name="name"
                  type="text"
                  placeholder="Enter CNF name"
                  required={true}
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                />

                <FormField
                  label="Contact"
                  name="contact"
                  type="tel"
                  placeholder="e.g., 01712345678"
                  required={true}
                  value={formData.contact}
                  onChange={handleChange}
                  error={errors.contact}
                />

                <FormField
                  label="Established At"
                  name="establishedAt"
                  type="date"
                  required={true}
                  value={formData.establishedAt}
                  onChange={handleChange}
                  error={errors.establishedAt}
                />

                <div className="md:col-span-2">
                  <FormField
                    label="Address"
                    name="address"
                    type="textarea"
                    placeholder="Enter complete CNF address"
                    required={true}
                    value={formData.address}
                    onChange={handleChange}
                    error={errors.address}
                  />
                </div>
              </div>

              <div className="flex justify-center gap-4 mt-8">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className={`px-8 py-3 rounded-lg font-medium text-sm transition-all duration-200
                    ${isDark
                      ? 'bg-gray-600 text-white hover:bg-gray-700 disabled:opacity-50'
                      : 'bg-gray-300 text-gray-700 hover:bg-gray-400 disabled:opacity-50'}`}
                >
                  <FaTimes className="w-4 h-4 mr-2 inline" />
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
                      <FaSpinner className="animate-spin w-4 h-4" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <FaSave className="w-4 h-4" />
                      Create CNF
                    </>
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

export default CNFForm;