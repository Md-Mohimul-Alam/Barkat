import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import branchService from '../../services/branchService';
import employeeService from '../../services/employeeService';
import TopBar from '../shared/Topbar';
import SidebarWrapper from '../shared/Sidebar';
import Footer from '../shared/Footer';
import { notifySuccess, notifyError } from '../../pages/UI/Toast';

const EmployeeForm = ({ isEdit = false, employeeData = null, onClose = null }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    position: '',
    contact: '',
    whatsapp: '',
    email: '',
    nid: '',
    dob: '',
    address: '',
    joinedAt: '',
    branchId: '',
    salary: '',
    status: 'active'
  });

  const [errors, setErrors] = useState({});

  // Fetch branches and populate form if editing
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const branchesData = await branchService.getBranches();
        setBranches(branchesData);
        
        // If editing, populate form with employee data
        if (isEdit && employeeData) {
          setFormData({
            name: employeeData.name || '',
            position: employeeData.position || '',
            contact: employeeData.contact || '',
            whatsapp: employeeData.whatsapp || '',
            email: employeeData.email || '',
            nid: employeeData.nid || '',
            dob: employeeData.dob ? employeeData.dob.split('T')[0] : '',
            address: employeeData.address || '',
            joinedAt: employeeData.joinedAt ? employeeData.joinedAt.split('T')[0] : '',
            branchId: employeeData.branchId || '',
            salary: employeeData.salary || '',
            status: employeeData.status || 'active'
          });
        }
      } catch (error) {
        console.error('Failed to fetch branches:', error);
        notifyError('Failed to load branches');
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, [isEdit, employeeData]);

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
    if (!formData.name.trim()) newErrors.name = 'Employee name is required';
    if (!formData.position.trim()) newErrors.position = 'Position is required';
    if (!formData.contact.trim()) newErrors.contact = 'Contact number is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.nid.trim()) newErrors.nid = 'NID number is required';
    if (!formData.dob) newErrors.dob = 'Date of birth is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.joinedAt) newErrors.joinedAt = 'Join date is required';
    if (!formData.branchId) newErrors.branchId = 'Branch selection is required';
    if (!formData.salary || formData.salary <= 0) newErrors.salary = 'Valid salary is required';

    // Contact validation
    const contactRegex = /^[0-9]{10,15}$/;
    if (formData.contact && !contactRegex.test(formData.contact)) {
      newErrors.contact = 'Contact must be 10-15 digits';
    }

    // WhatsApp validation (optional but must be valid if provided)
    if (formData.whatsapp && !contactRegex.test(formData.whatsapp)) {
      newErrors.whatsapp = 'WhatsApp number must be 10-15 digits';
    }

    // NID validation (assuming 10-17 digits for different countries)
    const nidRegex = /^[0-9]{10,17}$/;
    if (formData.nid && !nidRegex.test(formData.nid)) {
      newErrors.nid = 'NID must be 10-17 digits';
    }

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Date validation
    const today = new Date();
    const dobDate = new Date(formData.dob);
    const joinDate = new Date(formData.joinedAt);

    if (formData.dob && dobDate >= today) {
      newErrors.dob = 'Date of birth must be in the past';
    }

    if (formData.joinedAt && joinDate > today) {
      newErrors.joinedAt = 'Join date cannot be in the future';
    }

    if (formData.dob && formData.joinedAt && joinDate < dobDate) {
      newErrors.joinedAt = 'Join date cannot be before date of birth';
    }

    // Age validation (at least 18 years old)
    if (formData.dob) {
      // ✅ FIX: Use let instead of const for age since we need to reassign it
      let age = today.getFullYear() - dobDate.getFullYear();
      const monthDiff = today.getMonth() - dobDate.getMonth();
      
      // ✅ FIX: This assignment is now allowed because age is declared with let
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
        age--;
      }
      
      if (age < 18) {
        newErrors.dob = 'Employee must be at least 18 years old';
      }
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

    setSubmitting(true);
    
    try {
      if (isEdit && employeeData) {
        // Update existing employee
        await employeeService.updateEmployee(employeeData.id, formData);
        notifySuccess('Employee updated successfully!');
        if (onClose) onClose();
      } else {
        // Create new employee
        await employeeService.createEmployee(formData);
        notifySuccess('Employee created successfully!');
        navigate('/app/employees');
      }
    } catch (error) {
      console.error('Failed to save employee:', error);
      notifyError(error.message || `Failed to ${isEdit ? 'update' : 'create'} employee`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onClose) {
      onClose();
    } else {
      navigate('/app/employees');
    }
  };

  // Form fields configuration
  const personalFields = [
    { label: 'Full Name', name: 'name', type: 'text', placeholder: 'Enter full name', required: true },
    { label: 'Position', name: 'position', type: 'text', placeholder: 'Enter job position', required: true },
    { label: 'Email', name: 'email', type: 'email', placeholder: 'Enter email address', required: true },
    { label: 'NID Number', name: 'nid', type: 'text', placeholder: 'Enter NID number', required: true, pattern: '[0-9]{10,17}' },
  ];

  const contactFields = [
    { label: 'Contact Number', name: 'contact', type: 'tel', placeholder: 'e.g., 01712345678', required: true, pattern: '[0-9]{10,15}' },
    { label: 'WhatsApp Number', name: 'whatsapp', type: 'tel', placeholder: 'e.g., 01712345678 (optional)', required: false, pattern: '[0-9]{10,15}' },
  ];

  const dateFields = [
    { label: 'Date of Birth', name: 'dob', type: 'date', required: true },
    { label: 'Joined Date', name: 'joinedAt', type: 'date', required: true },
  ];

  // If this is a modal form, render without layout
  if (isEdit && onClose) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div className={`rounded-2xl p-6 w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-y-auto ${
          isDark ? 'bg-gradient-to-br from-cyan-900 to-sky-900 text-white border border-cyan-700' : 'bg-white text-gray-900 border border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-xl mr-4 ${
                isDark ? 'bg-cyan-800' : 'bg-orange-100'
              }`}>
                <svg className={`w-6 h-6 ${isDark ? 'text-cyan-300' : 'text-[#f85924]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold">Edit Employee</h2>
                <p className={`text-sm ${isDark ? 'text-cyan-300' : 'text-gray-600'}`}>
                  Update employee information
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                isDark ? 'hover:bg-cyan-800' : 'hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {personalFields.map((field) => (
                  <div key={field.name} className="flex flex-col">
                    <label htmlFor={field.name} className="mb-1 font-medium text-sm">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      id={field.name}
                      name={field.name}
                      type={field.type}
                      pattern={field.pattern}
                      placeholder={field.placeholder}
                      value={formData[field.name]}
                      onChange={handleChange}
                      required={field.required}
                      disabled={submitting}
                      className={`rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 transition-all duration-200 ${
                        errors[field.name] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                      } ${
                        isDark
                          ? 'bg-[#2C2C2C] border-[#457B9D] text-[#ffffff] placeholder-[#A8A8A8] focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
                          : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
                      }`}
                    />
                    {errors[field.name] && (
                      <p className="text-red-500 text-xs mt-1">{errors[field.name]}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Information Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contactFields.map((field) => (
                  <div key={field.name} className="flex flex-col">
                    <label htmlFor={field.name} className="mb-1 font-medium text-sm">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      id={field.name}
                      name={field.name}
                      type={field.type}
                      pattern={field.pattern}
                      placeholder={field.placeholder}
                      value={formData[field.name]}
                      onChange={handleChange}
                      required={field.required}
                      disabled={submitting}
                      className={`rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 transition-all duration-200 ${
                        errors[field.name] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                      } ${
                        isDark
                          ? 'bg-[#2C2C2C] border-[#457B9D] text-[#ffffff] placeholder-[#A8A8A8] focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
                          : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
                      }`}
                    />
                    {errors[field.name] && (
                      <p className="text-red-500 text-xs mt-1">{errors[field.name]}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Address Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Address
              </h3>
              <div className="flex flex-col">
                <label htmlFor="address" className="mb-1 font-medium text-sm">
                  Full Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows="3"
                  placeholder="Enter complete address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                  className={`rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 transition-all duration-200 resize-vertical ${
                    errors.address ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                  } ${
                    isDark
                      ? 'bg-[#2C2C2C] border-[#457B9D] text-[#ffffff] placeholder-[#A8A8A8] focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
                      : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
                  }`}
                />
                {errors.address && (
                  <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                )}
              </div>
            </div>

            {/* Date Information Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Date Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dateFields.map((field) => (
                  <div key={field.name} className="flex flex-col">
                    <label htmlFor={field.name} className="mb-1 font-medium text-sm">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      id={field.name}
                      name={field.name}
                      type={field.type}
                      value={formData[field.name]}
                      onChange={handleChange}
                      required={field.required}
                      disabled={submitting}
                      className={`rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 transition-all duration-200 ${
                        errors[field.name] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                      } ${
                        isDark
                          ? 'bg-[#2C2C2C] border-[#457B9D] text-[#ffffff] placeholder-[#A8A8A8] focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
                          : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
                      }`}
                    />
                    {errors[field.name] && (
                      <p className="text-red-500 text-xs mt-1">{errors[field.name]}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Employment Information Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
                Employment Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Branch Dropdown */}
                <div className="flex flex-col">
                  <label htmlFor="branchId" className="mb-1 font-medium text-sm">
                    Branch <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="branchId"
                    name="branchId"
                    value={formData.branchId}
                    onChange={handleChange}
                    required
                    disabled={loading || submitting}
                    className={`rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 transition-all duration-200 ${
                      errors.branchId ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                    } ${
                      isDark
                        ? 'bg-[#2C2C2C] border-[#457B9D] text-[#ffffff] focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
                        : 'bg-white border-gray-300 text-gray-800 focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
                    }`}
                  >
                    <option value="">Select a branch</option>
                    {loading ? (
                      <option value="" disabled>Loading branches...</option>
                    ) : (
                      branches.map((branch) => (
                        <option key={branch.id || branch._id} value={branch.id || branch._id}>
                          {branch.name}
                        </option>
                      ))
                    )}
                  </select>
                  {errors.branchId && (
                    <p className="text-red-500 text-xs mt-1">{errors.branchId}</p>
                  )}
                </div>

                {/* Salary */}
                <div className="flex flex-col">
                  <label htmlFor="salary" className="mb-1 font-medium text-sm">
                    Salary <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="salary"
                    name="salary"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Enter salary"
                    value={formData.salary}
                    onChange={handleChange}
                    required
                    disabled={submitting}
                    className={`rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 transition-all duration-200 ${
                      errors.salary ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                    } ${
                      isDark
                        ? 'bg-[#2C2C2C] border-[#457B9D] text-[#ffffff] placeholder-[#A8A8A8] focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
                        : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
                    }`}
                  />
                  {errors.salary && (
                    <p className="text-red-500 text-xs mt-1">{errors.salary}</p>
                  )}
                </div>

                {/* Status Dropdown */}
                <div className="flex flex-col">
                  <label htmlFor="status" className="mb-1 font-medium text-sm">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    disabled={submitting}
                    className={`rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 transition-all duration-200 ${
                      isDark
                        ? 'bg-[#2C2C2C] border-[#457B9D] text-[#ffffff] focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
                        : 'bg-white border-gray-300 text-gray-800 focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
                    }`}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="on-leave">On Leave</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-700">
              <button
                type="button"
                onClick={handleCancel}
                disabled={submitting}
                className={`px-6 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isDark
                    ? 'bg-gray-600 text-white hover:bg-gray-700 disabled:opacity-50'
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400 disabled:opacity-50'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-gradient-to-r from-[#f85924] to-[#e84a1a] text-white rounded-xl font-medium text-sm transition-all duration-200 hover:from-[#e84a1a] hover:to-[#d13602] shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Full page form
  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-cyan-950 text-[#ffffff]' : 'bg-[#ffffff] text-gray-900'}`}>
      <SidebarWrapper collapsed={sidebarCollapsed} />
      <div className="flex-1 flex flex-col">
        <TopBar onToggleSidebar={() => setSidebarCollapsed(prev => !prev)} sidebarCollapsed={sidebarCollapsed} />
        
        <div className="flex justify-center items-start px-4 py-10 overflow-auto">
          <div className={`w-full max-w-4xl shadow-lg rounded-xl p-8 transition-all duration-300
            ${isDark ? 'bg-sky-950 border border-[#457B9D]' : 'bg-white border border-gray-200'}
          `}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">{isEdit ? 'Edit Employee' : 'Add New Employee'}</h2>
              <button
                onClick={() => navigate('/app/employees')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
                  ${isDark
                    ? 'bg-gray-600 text-white hover:bg-gray-700'
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'}`}
              >
                ← Back to Employees
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {personalFields.map((field) => (
                    <div key={field.name} className="flex flex-col">
                      <label htmlFor={field.name} className="mb-1 font-medium">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        id={field.name}
                        name={field.name}
                        type={field.type}
                        pattern={field.pattern}
                        placeholder={field.placeholder}
                        value={formData[field.name]}
                        onChange={handleChange}
                        required={field.required}
                        disabled={submitting}
                        className={`rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2 transition-all duration-200 ${
                          errors[field.name] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                        } ${
                          isDark
                            ? 'bg-[#2C2C2C] border-[#457B9D] text-[#ffffff] placeholder-[#A8A8A8] focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
                            : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
                        }`}
                      />
                      {errors[field.name] && (
                        <p className="text-red-500 text-xs mt-1">{errors[field.name]}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Information Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {contactFields.map((field) => (
                    <div key={field.name} className="flex flex-col">
                      <label htmlFor={field.name} className="mb-1 font-medium">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        id={field.name}
                        name={field.name}
                        type={field.type}
                        pattern={field.pattern}
                        placeholder={field.placeholder}
                        value={formData[field.name]}
                        onChange={handleChange}
                        required={field.required}
                        disabled={submitting}
                        className={`rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2 transition-all duration-200 ${
                          errors[field.name] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                        } ${
                          isDark
                            ? 'bg-[#2C2C2C] border-[#457B9D] text-[#ffffff] placeholder-[#A8A8A8] focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
                            : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
                        }`}
                      />
                      {errors[field.name] && (
                        <p className="text-red-500 text-xs mt-1">{errors[field.name]}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Address Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Address
                </h3>
                <div className="flex flex-col">
                  <label htmlFor="address" className="mb-1 font-medium">
                    Full Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    rows="3"
                    placeholder="Enter complete address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    disabled={submitting}
                    className={`rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2 transition-all duration-200 resize-vertical ${
                      errors.address ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                    } ${
                      isDark
                        ? 'bg-[#2C2C2C] border-[#457B9D] text-[#ffffff] placeholder-[#A8A8A8] focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
                        : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
                    }`}
                  />
                  {errors.address && (
                    <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                  )}
                </div>
              </div>

              {/* Date Information Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Date Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {dateFields.map((field) => (
                    <div key={field.name} className="flex flex-col">
                      <label htmlFor={field.name} className="mb-1 font-medium">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        id={field.name}
                        name={field.name}
                        type={field.type}
                        value={formData[field.name]}
                        onChange={handleChange}
                        required={field.required}
                        disabled={submitting}
                        className={`rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2 transition-all duration-200 ${
                          errors[field.name] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                        } ${
                          isDark
                            ? 'bg-[#2C2C2C] border-[#457B9D] text-[#ffffff] placeholder-[#A8A8A8] focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
                            : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
                        }`}
                      />
                      {errors[field.name] && (
                        <p className="text-red-500 text-xs mt-1">{errors[field.name]}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Employment Information Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                  </svg>
                  Employment Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Branch Dropdown */}
                  <div className="flex flex-col">
                    <label htmlFor="branchId" className="mb-1 font-medium">
                      Branch <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="branchId"
                      name="branchId"
                      value={formData.branchId}
                      onChange={handleChange}
                      required
                      disabled={loading || submitting}
                      className={`rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2 transition-all duration-200 ${
                        errors.branchId ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                      } ${
                        isDark
                          ? 'bg-[#2C2C2C] border-[#457B9D] text-[#ffffff] focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
                          : 'bg-white border-gray-300 text-gray-800 focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
                      }`}
                    >
                      <option value="">Select a branch</option>
                      {loading ? (
                        <option value="" disabled>Loading branches...</option>
                      ) : (
                        branches.map((branch) => (
                          <option key={branch.id || branch._id} value={branch.id || branch._id}>
                            {branch.name}
                          </option>
                        ))
                      )}
                    </select>
                    {errors.branchId && (
                      <p className="text-red-500 text-xs mt-1">{errors.branchId}</p>
                    )}
                  </div>

                  {/* Salary */}
                  <div className="flex flex-col">
                    <label htmlFor="salary" className="mb-1 font-medium">
                      Salary <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="salary"
                      name="salary"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Enter salary"
                      value={formData.salary}
                      onChange={handleChange}
                      required
                      disabled={submitting}
                      className={`rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2 transition-all duration-200 ${
                        errors.salary ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                      } ${
                        isDark
                          ? 'bg-[#2C2C2C] border-[#457B9D] text-[#ffffff] placeholder-[#A8A8A8] focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
                          : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
                      }`}
                    />
                    {errors.salary && (
                      <p className="text-red-500 text-xs mt-1">{errors.salary}</p>
                    )}
                  </div>

                  {/* Status Dropdown */}
                  <div className="flex flex-col">
                    <label htmlFor="status" className="mb-1 font-medium">
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      disabled={submitting}
                      className={`rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2 transition-all duration-200 ${
                        isDark
                          ? 'bg-[#2C2C2C] border-[#457B9D] text-[#ffffff] focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
                          : 'bg-white border-gray-300 text-gray-800 focus:ring-[#f85924] focus:border-[#f85924] disabled:opacity-50'
                      }`}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="on-leave">On Leave</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-4 mt-8">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={submitting}
                  className={`px-8 py-3 rounded-lg font-medium text-sm transition-all duration-200
                    ${isDark
                      ? 'bg-gray-600 text-white hover:bg-gray-700 disabled:opacity-50'
                      : 'bg-gray-300 text-gray-700 hover:bg-gray-400 disabled:opacity-50'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-8 py-3 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2
                    ${submitting ? 'opacity-50 cursor-not-allowed' : ''}
                    ${isDark
                      ? 'bg-[#f85924] text-white hover:bg-[#d13602] shadow-lg'
                      : 'bg-[#f85924] text-white hover:bg-[#d13602] shadow-md'}`}
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    isEdit ? 'Update Employee' : 'Save Employee'
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

export default EmployeeForm;